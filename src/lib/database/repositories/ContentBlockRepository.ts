import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface ContentBlock {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContentBlockRepository extends BaseRepository<ContentBlock> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'content_blocks');
  }
}
