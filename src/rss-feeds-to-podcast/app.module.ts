import { Module } from '@nestjs/common';
import {AppCommand} from "./app.command";

@Module({
    providers: [AppCommand]
})
export class AppModule {}
