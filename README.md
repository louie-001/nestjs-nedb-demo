# Nest 简介
Nest是一个NodeJS的服务端框架，与JAVA对照的话，其功能相当于SpringMVC（国产也有类似框架，如阿里开源的[EggJS](https://eggjs.org/zh-cn/)）。对于熟悉JAVA的开发者，Nest极易上手，Nest有着与SpringMVC如出一辙的分层架构和注解标签，以及依赖注入、控制反转、生命周期等实现，[官网传送门](https://nestjs.com/)。
# NeDB简介
NeDB是一个NodeJS实现的轻量级、嵌入式、NoSQL数据库，可用作内存数据库，也可以持久化。使用简单、速度快，适合数据量小、业务简单的场景（https://www.npmjs.com/package/nedb）。
# 创建项目，添加依赖
创建Nest项目，添加NeDB依赖，并将初始化项目按业务模块调整。

## 创建Nest项目
创建项目nest-demo：
```
nest new nest-demo
```

## 安装NeDB：
```
cd nest-demo
npm i nedb -S
```

## 调整初始化项目
将初始化的项目结构按业务模块调整，调整后的结构如下（包含两个模块，book和library）：

### app.module.ts
```javascript
import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';
import { LibraryModule } from './library/library.module';

@Module({
  imports: [BookModule, LibraryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
# 整合NeDB，实现CRUD
### book.entity.ts，book模型
```javascript
export interface BookEntity {
  _id: string;
  name: string;
  price: number;
  author: string;
  createdAt: number;
  updatedAt: number;
}
```

### book.controller.ts
```javascript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { BookEntity } from './book.entity';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {
    this.bookService = bookService;
  }

  /**
   * list all books
   */
  @Get()
  async list(): Promise<Array<BookEntity>> {
    return this.bookService.list();
  }

  @Get(':id')
  async detail(@Param('id') _id: string): Promise<BookEntity> {
    return this.bookService.detail(_id);
  }

  /**
   * save new book
   * @param book new book data
   */
  @Post()
  async save(@Body() book: BookEntity): Promise<BookEntity> {
    return this.bookService.save(book);
  }
}
```

### book.service.ts
```javascript
import { Injectable } from '@nestjs/common';
import { BookEntity } from './book.entity';

const Nedb = require('nedb');

@Injectable()
export class BookService {
  private readonly nedb;
  constructor() {
    this.nedb = new Nedb({
      filename: './db/book.db',
      autoload: true,
      timestampData: true,
    });
  }

  /**
   * find all books
   */
  async list(): Promise<Array<BookEntity>> {
    return new Promise((resolve, reject) => {
      this.nedb.find({}, (error, docs) => {
        if (error) reject(error);
        resolve(docs);
      });
    });
  }

  async detail(_id: string): Promise<BookEntity> {
    return new Promise((resolve, reject) => {
      this.nedb.find({ _id }, (error, docs) => {
        if (error) reject(error);
        resolve(docs[0]);
      });
    });
  }

  /**
   * save new book
   * @param book new book
   */
  async save(book: BookEntity): Promise<BookEntity> {
    return new Promise((resolve, reject) => {
      this.nedb.insert(book, (error, doc) => {
        if (error) reject(error);
        resolve(doc);
      });
    });
  }
}
```

# 重构代码，封装公共基础类，通过继承实现复用和扩展
## 业务与数据分离，repository处理数据
### app.repository.ts，基础repository，实现CRUD操作

```javascript
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Nedb = require('nedb');

export class AppRepository<T> {
  protected readonly nedb;

  constructor(dbName: string) {
    this.nedb = new Nedb({
      filename: dbName,
      autoload: true,
      timestampData: true,
    });
  }

  /**
   * find all
   */
  async findAll(): Promise<Array<T>> {
    return this.find({});
  }

  /**
   * find by primary key
   * @param _id primary key
   */
  async findById(_id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.find({ _id })
        .then(res => resolve(res[0]))
        .catch(error => reject(error));
    });
  }

  /**
   * find by options
   * @param options search options
   */
  async find(options): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      this.nedb.find(options, (error, docs) => {
        if (error) {
          reject(error);
        }
        resolve(docs);
      });
    });
  }

  /**
   * insert new data
   * @param data new data
   */
  async insert(data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.nedb.insert(data, (error, doc) => {
        if (error) {
          reject(error);
        }
        resolve(doc);
      });
    });
  }

  /**
   * delete by id
   * @param _id
   */
  async deleteById(_id: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.nedb.remove({ _id }, (error, removedNum) => {
        if (error) {
          reject(error);
        }
        resolve(removedNum);
      });
    });
  }
}
```

### book.repository.ts，实现复杂数据操作
```javascript
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
```
## 重写service，封装基础service类并将repository作为依赖引入
### app.service.ts，service基类，依赖repository基类
```javascript
import { AppRepository } from './app.repository';

export class AppService<T> {
  constructor(private readonly appRepository: AppRepository<T>) {
    this.appRepository = appRepository;
  }

  /**
   * list all
   */
  async list(): Promise<Array<T>> {
    return this.appRepository.findAll();
  }

  /**
   * get detail
   * @param _id
   */
  async detail(_id: string): Promise<T> {
    return this.appRepository.findById(_id);
  }

  /**
   * save new data
   * @param data
   */
  async save(data: T): Promise<T> {
    return this.appRepository.insert(data);
  }

  /**
   * delete by id
   * @param _id
   */
  async delete(_id: string): Promise<number> {
    return this.appRepository.deleteById(_id);
  }
}
```

### 重写book.service.ts，依赖book.repository.ts
```javascript
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
```
## 同理，重写controller，封装controller基类
### app.controller.ts
```javascript
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
```

### 重写book.controller.ts，继承controller基类
```javascript
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
```
### book.module.ts，将book.repository引入
```javascript
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
```
> 至此，book模块调整完成，terminal执行 `npm run start`启动服务便可通过http://127.0.0.1:300/book访问相关API。

# library模块实现，只需继承app.controller.ts，app.service.ts和app.repository.ts基类便可完成CRUD功能
## library.module.ts
```javascript
import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryRepository } from './library.repository';

@Module({
  imports: [],
  controllers: [LibraryController],
  providers: [LibraryService, LibraryRepository],
})
export class LibraryModule {}
```
### library.controller.ts
```javascript
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
```
### library.service.ts
```javascript
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
```

### library.repository.ts
```javascript
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
```
启动服务，访问http://127.0.0.1/library即可调用library CRUD API。
> 工程源码请访问https://github.com/louie-001/nestjs-nedb-demo.git
