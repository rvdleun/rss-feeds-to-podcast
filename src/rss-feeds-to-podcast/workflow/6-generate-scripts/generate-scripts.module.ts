import { Module } from '@nestjs/common';
import { LlmModule } from '../../modules/llm/llm.module';
import { OutputModule } from '../../modules/output/output.module';
import {
  GenerateIntroOutroScriptsCommand,
  GenerateSegmentScriptsCommand,
} from './generate-scripts.command';
import { GenerateScriptsService } from './generate-scripts.service';
import { AppConfigModule } from '../../modules/config/config.module';

@Module({
  imports: [AppConfigModule, LlmModule, OutputModule],
  providers: [
    GenerateSegmentScriptsCommand,
    GenerateIntroOutroScriptsCommand,
    GenerateScriptsService,
  ],
})
export class GenerateScriptsModule {}
