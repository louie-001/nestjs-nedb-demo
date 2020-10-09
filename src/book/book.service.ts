import { Injectable } from '@nestjs/common';
import { AppService } from '../app.service';
import { BookEntity } from './book.entity';
import { BookRepository } from './book.repository';

@Injectable()
export class BookService extends AppService<BookEntity>{
  constructor(private readonly bookRepository: BookRepository) {
    super(bookRepository);
    this.bookRepository = bookRepository;
  }

  // 除CRUD外复杂业务逻辑
  // ... ...
}