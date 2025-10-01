import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Navigation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NavigationRepository extends BaseRepository<Navigation> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'navigation');
  }
}