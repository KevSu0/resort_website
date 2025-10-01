import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Media {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaRepository extends BaseRepository<Media> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'media');
  }
}
