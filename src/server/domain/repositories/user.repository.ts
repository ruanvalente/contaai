import { User, UpdateUserInput } from "../entities/user.entity";

export type UserRole = 'reader' | 'author'

export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
  getRole(userId: string): Promise<UserRole | null>;
}