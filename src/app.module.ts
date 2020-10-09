import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';
import { LibraryModule } from './library/library.module';

@Module({
  imports: [BookModule, LibraryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
