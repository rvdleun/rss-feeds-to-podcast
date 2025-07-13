import { Module } from '@nestjs/common';
import { LlmModule } from '../../modules/llm/llm.module';
import { OutputModule } from '../../modules/output/output.module';
import {
  GenerateFinalScriptCommand,
  GenerateIntroOutroScriptsCommand,
  GenerateSegmentScriptsCommand,
} from './generate-scripts.command';
import { GenerateScriptsService } from './generate-scripts.service';
import { AppConfigModule } from '../../modules/config/config.module';

@Module({
  exports: [GenerateScriptsService],
  imports: [AppConfigModule, LlmModule, OutputModule],
  providers: [
    GenerateFinalScriptCommand,
    GenerateSegmentScriptsCommand,
    GenerateIntroOutroScriptsCommand,
    GenerateScriptsService,
  ],
})
export class GenerateScriptsModule {}
