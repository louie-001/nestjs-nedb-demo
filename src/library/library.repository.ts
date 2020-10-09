import { AppRepository } from '../app.repository';
import { LibraryEntity } from './library.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LibraryRepository extends AppRepository<LibraryEntity> {
  constructor() {
    super('./db/library.db');
  }
  // other code ...
}