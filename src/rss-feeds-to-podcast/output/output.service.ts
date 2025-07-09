import { Injectable } from '@nestjs/common';
import { join, dirname } from 'path';
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from 'fs';

const outputPath = join(process.cwd(), 'output');

@Injectable()
export class OutputService {
  getOutputDirectory(): string {
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath);
    }

    return outputPath;
  }

  generateFile(filePath: string, content: string): void {
    const fullPath = join(this.getOutputDirectory(), filePath);
    const directoryPath = dirname(fullPath);

    // Ensure all directories in the path exist
    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath, { recursive: true });
    }

    // Check if file exists and delete it
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    // Generate new file with content
    writeFileSync(fullPath, content);
  }
}
