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
