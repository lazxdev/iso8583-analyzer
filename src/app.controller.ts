import { Controller, Get, Post, Body, Render } from '@nestjs/common';
import { Iso8583Service } from './iso8583/iso8583.service';

@Controller()
export class AppController {
  constructor(private readonly iso8583Service: Iso8583Service) {}

  @Get()
  @Render('index')
  root() {
    return { title: 'ISO 8583 Dashboard Parser' };
  }

  @Post('api/parse')
  parse(@Body('message') message: string) {
    return this.iso8583Service.parseMessage(message || '');
  }
}
