import {
  Command,
  CommandRunner,
  InquirerService,
  Option,
  Question,
  QuestionSet,
} from 'nest-commander';
import { Logger } from '@nestjs/common';
import { AppConfigService } from './modules/config/config.service';
import { SegmentPickerService } from './workflow/2-segment-picker/segment-picker.service';
import { RssFeedService } from './workflow/1-rss-feed/rss-feed.service';
import { ContentScraperService } from './workflow/3-content-scraper/content-scraper.service';
import { FilterSegmentsService } from './workflow/4-filter-segments/filter-segments.service';
import { GenerateSummariesService } from './workflow/5-generate-summaries/generate-summaries.service';
import { GenerateScriptsService } from './workflow/6-generate-scripts/generate-scripts.service';
import { GenerateAudioService } from './workflow/7-generate-audio/generate-audio.service';

@Command({
  name: 'basic',
  description: 'A parameter parse',
  options: { isDefault: true },
})
export class AppCommand extends CommandRunner {
  #logger = new Logger(this.constructor.name);

  constructor(
    private readonly inquirer: InquirerService,
    private appConfigService: AppConfigService,

    private rssFeedService: RssFeedService,
    private segmentPickerService: SegmentPickerService,
    private contentScraperService: ContentScraperService,
    private filterSegmentsService: FilterSegmentsService,
    private generateSummariesService: GenerateSummariesService,
    private generateScriptsService: GenerateScriptsService,
    private generateAudioService: GenerateAudioService,
  ) {
    super();
  }
  async run(): Promise<void> {
    console.log();
    console.log('Setting up rss-feeds-to-podcast...');
    console.log('----------------------------------');

    const { feeds } = this.appConfigService.getConfig('rss');
    const { name, behaviour, hosts, numberOfSegments } =
      this.appConfigService.getConfig('podcast');

    console.log(`- Podcast name: ${name}`);
    console.log(`- Number of segments: ${numberOfSegments}`);
    console.log(`- Hosts: ${hosts.map(({ id }) => id).join(', ')}`);
    console.log(`- Behaviour: ${behaviour}`);
    console.log(`- ${feeds.length} RSS feed(s) detected`);
    console.log();

    const { confirmation } = await this.inquirer.ask<{ confirmation: string }>(
      'confirmation',
      undefined,
    );

    if (confirmation.toLowerCase() !== 'y') {
      return;
    }

    /* Retrieve RSS feeds */
    await this.rssFeedService.fetchRssFeeds();

    /* Pick X number of articles from the feeds */
    await this.segmentPickerService.createSegments();

    /* Use scrapper to retrieve the content from each article */
    await this.contentScraperService.scrapeContentFromSegments();

    /* Remove articles when...
         1. The scraper wasn't able to fetch the content
         2. A LLM prompt determines the article isn't suitable for a podcast

       Removed articles aren't replaced with new ones yet.
     */
    await this.filterSegmentsService.filter();

    /* Generate a summary and a one-line brief of each article for the LLM */
    await this.generateSummariesService.generateSummaries();

    /* Generate a script for each segment based on the summaries */
    await this.generateScriptsService.generateSegmentScripts();

    /* Generate an intro and outro for the podcast, using the briefs */
    await this.generateScriptsService.generateIntroOutputScripts('intro');
    await this.generateScriptsService.generateIntroOutputScripts('outro');

    /* Merge all the scripts together, along with SFX and delays between lines */
    await this.generateScriptsService.generateFinalScript();

    /* Generate audio files in linear order
         1. Create empty audio files for delays
         2. Copy sfx sounds
         3. Generate voice files for each host, using Kokoro
     */
    await this.generateAudioService.generateAudioFiles();

    /* Generate the final podcast by merging all the audio files */
    await this.generateAudioService.mergeAudioFiles();

    this.#logger.log('Done!');
  }
}

@QuestionSet({ name: 'confirmation' })
export class ConfirmationQuestion {
  @Question({
    message:
      'Is the above configuration correct and can the workflow be started? [Y/N]',
    name: 'confirmation',
    default: 'Y',
  })
  parseTask(val: string) {
    return val;
  }
}
