import { Injectable } from '@nestjs/common';
import { AppRepository } from '../app.repository';
import { BookEntity } from './book.entity';

@Injectable()
export class BookRepository extends AppRepository<BookEntity>{
  constructor() {
    super('./db/book.db');
  }

  //其他复杂数据操作
  // ... ...
}