import { Controller, Injectable } from '@nestjs/common';
import { AppController } from '../app.controller';
import { LibraryEntity } from './library.entity';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController extends AppController<LibraryEntity> {
  constructor(private readonly libraryService: LibraryService) {
    super(libraryService);
    this.libraryService = libraryService;
  }

  // other code ...
}
