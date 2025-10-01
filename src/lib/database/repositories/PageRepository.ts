import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Page {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PageRepository extends BaseRepository<Page> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'pages');
  }
}
