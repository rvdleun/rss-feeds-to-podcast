import { Module } from '@nestjs/common';
import { SegmentPickerCommand } from './segment-picker.command';
import { SegmentPickerService } from './segment-picker.service';
import { AppConfigModule } from '../../modules/config/config.module';
import { OutputModule } from '../../modules/output/output.module';

@Module({
  imports: [AppConfigModule, OutputModule],
  providers: [SegmentPickerCommand, SegmentPickerService],
})
export class SegmentPickerModule {}
