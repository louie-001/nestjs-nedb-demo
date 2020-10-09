import { Controller } from '@nestjs/common';
import { AppController } from '../app.controller';
import { BookEntity } from './book.entity';
import { BookService } from './book.service';

@Controller('book')
export class BookController extends AppController<BookEntity>{
  constructor(private readonly bookService: BookService) {
    super(bookService);
    this.bookService = bookService;
  }

  // 其他复杂逻辑
  // ... ...
}