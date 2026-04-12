import { User, UpdateUserInput } from "../entities/user.entity";

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
}