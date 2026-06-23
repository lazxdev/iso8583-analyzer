import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Iso8583Service } from './iso8583/iso8583.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Iso8583Service],
})
export class AppModule {}
