import { Command, CommandRunner } from 'nest-commander';
import { GenerateScriptsService } from './generate-scripts.service';

@Command({
  name: 'generate-intro-output-scripts',
  description: 'Generates scripts for the intro and outro',
})
export class GenerateIntroOutroScriptsCommand extends CommandRunner {
  constructor(private generateScriptsService: GenerateScriptsService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateScriptsService.generateIntroOutputScripts('intro');
    await this.generateScriptsService.generateIntroOutputScripts('outro');
  }
}

@Command({
  name: 'generate-segment-scripts',
  description: 'Generates scripts for all segments',
})
export class GenerateSegmentScriptsCommand extends CommandRunner {
  constructor(private generateScriptsService: GenerateScriptsService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateScriptsService.generateSegmentScripts();
  }
}
