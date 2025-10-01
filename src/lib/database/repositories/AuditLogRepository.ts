import { BaseRepository } from './BaseRepository';
import { IDatabaseAdapter } from '../interfaces/IDatabaseAdapter';
import { ITenantContext } from '../../tenant/TenantContext';

export interface AuditLog {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(databaseAdapter: IDatabaseAdapter, tenantContext: ITenantContext) {
    super(databaseAdapter, tenantContext, 'audit_logs');
  }
}