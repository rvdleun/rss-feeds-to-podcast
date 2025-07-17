import { Module } from '@nestjs/common';
import { LlmModule } from '../../modules/llm/llm.module';
import { SetupWebAssetsCommand } from './setup-web-assets.command';
import { SetupWebAssetsService } from './setup-web-assets.service';
import { OutputModule } from '../../modules/output/output.module';
import { AppConfigModule } from '../../modules/config/config.module';

@Module({
  imports: [AppConfigModule, LlmModule, OutputModule],
  providers: [SetupWebAssetsCommand, SetupWebAssetsService],
})
export class SetupWebAssetsModule {}
