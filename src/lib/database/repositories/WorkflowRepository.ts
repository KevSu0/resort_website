import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface Workflow {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkflowRepository extends BaseRepository<Workflow> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'workflows');
  }
}
