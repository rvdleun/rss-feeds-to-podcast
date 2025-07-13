import { Command, CommandRunner } from 'nest-commander';
import { GenerateScriptsService } from '../6-generate-scripts/generate-scripts.service';
import { GenerateAudioService } from './generate-audio.service';

@Command({
  name: 'generate-audio',
  description: 'Generates audio from the script',
})
export class GenerateAudioCommand extends CommandRunner {
  constructor(private generateAudioService: GenerateAudioService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateAudioService.generateAudioFiles();
  }
}
