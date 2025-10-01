import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface ContentVersion {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContentVersionRepository extends BaseRepository<ContentVersion> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'content_versions');
  }
}