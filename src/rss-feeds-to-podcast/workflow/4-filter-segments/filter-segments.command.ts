import { Command, CommandRunner } from 'nest-commander';
import { FilterSegmentsService } from './filter-segments.service';

@Command({
  name: 'filter-segments',
  description: 'Filter segments on content scraped',
})
export class filterSegmentsCommand extends CommandRunner {
  constructor(private filterSegmentsService: FilterSegmentsService) {
    super();
  }

  async run(): Promise<void> {
    await this.filterSegmentsService.filter();
  }
}
