import { Injectable } from '@nestjs/common';
import { AppService } from '../app.service';
import { LibraryEntity } from './library.entity';
import { LibraryRepository } from './library.repository';

@Injectable()
export class LibraryService extends AppService<LibraryEntity> {
  constructor(private readonly libraryRepository: LibraryRepository) {
    super(libraryRepository);
    this.libraryRepository = libraryRepository;
  }

  // other code ...
}
