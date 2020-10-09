import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BookRepository } from './book.repository';

@Module({
  imports: [],
  controllers: [BookController],
  providers: [BookService, BookRepository],
})
export class BookModule {}
