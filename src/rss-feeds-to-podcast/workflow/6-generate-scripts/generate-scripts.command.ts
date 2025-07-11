import { Command, CommandRunner } from 'nest-commander';
import { GenerateScriptsService } from './generate-scripts.service';

@Command({
  name: 'generate-scripts',
  description: 'Generates scripts for all segments',
})
export class GenerateScriptsCommand extends CommandRunner {
  constructor(private generateScriptsService: GenerateScriptsService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateScriptsService.generateScripts();
  }
}
