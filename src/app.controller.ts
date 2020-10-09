import { AppService } from './app.service';
import { Body, Delete, Get, Param, Post } from '@nestjs/common';

export class AppController<T> {
  constructor(private readonly appService: AppService<T>) {
    this.appService = appService;
  }

  @Get()
  async list(): Promise<Array<T>> {
    return this.appService.list();
  }

  @Get(':id')
  async detail(@Param('id') _id: string): Promise<T> {
    return this.appService.detail(_id);
  }

  @Post()
  async save(@Body() data: T): Promise<T> {
    return this.appService.save(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    return this.appService.delete(id);
  }
}
