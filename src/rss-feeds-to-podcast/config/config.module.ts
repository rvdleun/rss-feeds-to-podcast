import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { loadConfig } from './config.loader';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => ({
          config: loadConfig(),
        }),
      ],
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}