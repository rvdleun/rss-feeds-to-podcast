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
import { OutputService } from './modules/output/output.service';
import { WebScraperService } from './modules/web-scraper/web-scraper.service';
import { LlmService } from './modules/llm/llm.service';
import { TextToSpeechService } from './modules/text-to-speech/text-to-speech.service';
import { AppService } from './app.service';

@Command({
  name: 'verify-external-services',
  description: 'Verifies if all external services are available',
})
export class VerifyExternalServicesCommand extends CommandRunner {
  constructor(private appService: AppService) {
    super();
  }

  async run() {
    this.appService.verifyExternalServices();
  }
}

@Command({
  name: 'run-workflow',
  description: 'Runs the rss-feeds-to-podcast workflow',
  options: { isDefault: true },
})
export class AppCommand extends CommandRunner {
  #logger = new Logger(this.constructor.name);

  constructor(
    private readonly inquirer: InquirerService,
    private appConfigService: AppConfigService,
    private appService: AppService,
    private llmService: LlmService,
    private outputService: OutputService,
    private textToSpeechService: TextToSpeechService,
    private webScraperService: WebScraperService,

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

  @Option({
    flags: '-Y, --yes',
    description: 'Skip confirmation prompt',
  })
  parseYes(): boolean {
    return true;
  }

  async run(
    passedParams: string[],
    options?: { yes?: boolean },
  ): Promise<void> {
    this.#logger.log('');
    this.#logger.log('Setting up rss-feeds-to-podcast...');
    this.#logger.log('----------------------------------');

    if (this.outputService.outputDirectoryExists()) {
      this.#logger.log(
        'Output directory already exists. Please remove before starting the workflow.',
      );
      this.#logger.log('Aborting...');
      return;
    }

    if (!(await this.appService.verifyExternalServices())) {
      this.#logger.log('Not all external services are available.');
      this.#logger.log('Aborting...');
      return;
    }

    this.#logger.log('Retrieving configuration');
    this.#logger.log('------------------------');
    this.#logger.log('');

    const { feeds } = this.appConfigService.getConfig('rss');
    const { name, behaviour, hosts, numberOfSegments } =
      this.appConfigService.getConfig('podcast');

    this.#logger.log(`- Podcast name: ${name}`);
    this.#logger.log(`- Number of segments: ${numberOfSegments}`);
    this.#logger.log(`- Hosts: ${hosts.map(({ id }) => id).join(', ')}`);
    this.#logger.log(`- Behaviour: ${behaviour}`);
    this.#logger.log(`- ${feeds.length} RSS feed(s) detected`);
    this.#logger.log('');

    if (!options?.yes) {
      const { confirmation } = await this.inquirer.ask<{
        confirmation: string;
      }>('confirmation', undefined);

      if (confirmation.toLowerCase() !== 'y') {
        return;
      }
    }

    /* Retrieve RSS feeds */
    await this.rssFeedService.fetchRssFeeds();

    /* Pick X number of articles from the feeds */
    if (!(await this.segmentPickerService.createSegments())) {
      this.#logger.log(
        'Something went wrong while creating segments. Aborting...',
      );
      return;
    }

    /* Use scrapper to retrieve the content from each article */
    await this.contentScraperService.scrapeContentFromSegments();

    /* Remove articles when...
         1. The scraper wasn't able to fetch the content
         2. A LLM prompt determines the article isn't suitable for a podcast

       Removed articles aren't replaced with new ones yet.
     */
    await this.filterSegmentsService.filter();

    /* Generate a summary and a one-line brief of each article for the LLM */
    if (!(await this.generateSummariesService.generateSummaries())) {
      this.#logger.log(
        'Something went wrong while generating summaries. Aborting...',
      );
      return;
    }

    /* Generate a script for each segment based on the summaries */
    await this.generateScriptsService.generateSegmentScripts();

    /* Generate an intro and outro for the podcast, using the briefs */
    await this.generateScriptsService.generateIntroOutputScripts('intro');
    await this.generateScriptsService.generateIntroOutputScripts('outro');

    /* Merge all the scripts together, along with SFX and delays between lines */
    await this.generateScriptsService.generateFinalScript();

    /* Generate audio files for each entry in script.json
         1. Create empty audio files for delays
         2. Copy sfx sounds from config/assets
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
