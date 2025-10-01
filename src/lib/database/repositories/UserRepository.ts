import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  brandId: string;
  siteIds: string[];
}

export class UserRepository extends BaseRepository<User> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findBy('email', email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.findBy('username', username);
  }
}
