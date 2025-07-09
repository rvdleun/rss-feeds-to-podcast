import { Module } from '@nestjs/common';
import { AppCommand } from "./app.command";
import { AppConfigModule } from './config/config.module';

@Module({
    imports: [AppConfigModule],
    providers: [AppCommand]
})
export class AppModule {}
