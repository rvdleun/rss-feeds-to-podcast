import { Command, CommandRunner } from 'nest-commander';
import { GenerateSummariesService } from './generate-summaries.service';

@Command({
  name: 'generate-summaries',
  description: 'Generates summaries for all segments',
})
export class GenerateSummariesCommand extends CommandRunner {
  constructor(private generateSummariesService: GenerateSummariesService) {
    super();
  }

  async run(): Promise<void> {
    await this.generateSummariesService.generateSummaries();
  }
}
