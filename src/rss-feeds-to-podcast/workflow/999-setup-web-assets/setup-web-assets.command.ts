import { Command, CommandRunner } from 'nest-commander';
import { SetupWebAssetsService } from './setup-web-assets.service';
import { AppConfigService } from '../../modules/config/config.service';

@Command({
  name: 'setup-web-assets',
  description: 'Generates and moves assets to web directory',
})
export class SetupWebAssetsCommand extends CommandRunner {
  constructor(private generateDescriptionService: SetupWebAssetsService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateDescriptionService.generateDescription();
  }
}
