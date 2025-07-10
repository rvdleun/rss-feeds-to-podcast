import { Injectable, Logger } from '@nestjs/common';
import { join, dirname } from 'path';
import {
  mkdirSync,
  existsSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { OutputDirectory } from '../../types/output';
import { Segment } from '../../types/segment';

const outputPath = join(process.cwd(), 'output');

@Injectable()
export class OutputService {
  #logger = new Logger(this.constructor.name);

  clearDirectory(path: OutputDirectory) {
    const fullPath = join(this.#getOutputDirectory(), path);
    if (!existsSync(fullPath)) {
      return;
    }

    unlinkSync(fullPath);
  }

  generateFile(
    directory: OutputDirectory,
    filePath: string,
    content: string,
  ): void {
    const fullPath = join(this.#getOutputDirectory(), directory, filePath);
    const directoryPath = dirname(fullPath);

    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath, { recursive: true });
    }

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    writeFileSync(fullPath, content);
  }

  getDataFromDirectory<T>(path: OutputDirectory): T[] {
    const fullPath = join(this.#getOutputDirectory(), path);

    if (!existsSync(fullPath)) {
      this.#logger.warn(
        `Tried to get data from ${fullPath}, but it does not exist`,
      );
      return [];
    }

    const entries = readdirSync(fullPath);
    const fileContents: string[] = [];

    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      const stat = statSync(entryPath);

      if (stat.isFile()) {
        const content = readFileSync(entryPath, 'utf-8');
        fileContents.push(content);
      }
    }

    return fileContents.map((content) => JSON.parse(content) as T);
  }

  removeSegment(segment: Segment) {
    const fullPath = join(
      this.#getOutputDirectory(),
      'segments',
      segment.fileName,
    );
    unlinkSync(fullPath);
  }

  saveSegment(segment: Segment) {
    this.generateFile(
      'segments',
      segment.fileName,
      JSON.stringify(segment, null, 2),
    );
  }

  #getOutputDirectory(): string {
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath);
    }

    return outputPath;
  }
}
