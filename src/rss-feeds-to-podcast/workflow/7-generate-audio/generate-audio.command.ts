import { Command, CommandRunner } from 'nest-commander';
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

@Command({
  name: 'merge-audio',
  description: 'Merges all generated audio',
})
export class MergeAudioCommand extends CommandRunner {
  constructor(private generateAudioService: GenerateAudioService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateAudioService.mergeAudioFiles();
  }
}
