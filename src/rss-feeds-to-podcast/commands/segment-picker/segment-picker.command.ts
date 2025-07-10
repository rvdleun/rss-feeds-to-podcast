import { Command, CommandRunner } from 'nest-commander';
import { SegmentPickerService } from './segment-picker.service';
import { OutputService } from '../../modules/output/output.service';

@Command({
  name: 'create-segments',
  description: 'Create segments from items in the RSS feeds',
})
export class SegmentPickerCommand extends CommandRunner {
  constructor(
    private outputService: OutputService,
    private segmentPickerServic: SegmentPickerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.outputService.clearDirectory('segments');

    await this.segmentPickerServic.createSegments();
  }
}
