import { Module } from '@nestjs/common';
import { OutputService } from './output.service';

@Module({
  exports: [OutputService],
  providers: [OutputService],
})
export class OutputModule {}
