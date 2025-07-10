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
    try {
      const text = await this.generateSummariesService.generateSummaries();
      console.log('This is the result', text);
    } catch (error) {
      console.error(error);
    }
  }
}
