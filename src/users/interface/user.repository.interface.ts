export abstract class IUserRepository {
  abstract findById(id: number): Promise<any>;
  abstract create(data: any): Promise<any>;
  abstract update(id: number, data: any): Promise<any>;
  abstract findAll(
    where: any,
    skip: number,
    take: number,
    orderBy: any,
  ): Promise<any>;
  abstract count(where: any): Promise<number>;
}
