import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Timestamp;
  severity: 'info' | 'warning' | 'error' | 'critical';
  sessionId?: string;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

class AuditService {
  private readonly COLLECTION_NAME = 'audit_logs';

  async logAuditEntry(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const auditEntry: Omit<AuditLog, 'id'> = {
        ...entry,
        timestamp: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), auditEntry);
      return docRef.id;
    } catch (error) {
      console.error('Error logging audit entry:', error);
      throw new Error(`Failed to log audit entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, any>,
    severity: AuditLog['severity'] = 'info'
  ): Promise<string> {
    return this.logAuditEntry({
      userId,
      action,
      resource,
      details,
      severity,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  async logSecurityEvent(
    userId: string,
    action: string,
    details?: Record<string, any>,
    severity: AuditLog['severity'] = 'warning'
  ): Promise<string> {
    return this.logAuditEntry({
      userId,
      action,
      resource: 'security',
      details,
      severity,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  async logDataChange(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    resourceId: string,
    oldValue?: any,
    newValue?: any
  ): Promise<string> {
    return this.logAuditEntry({
      userId,
      action: `DATA_${action}`,
      resource,
      resourceId,
      details: {
        oldValue,
        newValue,
        changedFields: this.getChangedFields(oldValue, newValue)
      },
      severity: 'info',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  async getAuditLogs(filter: AuditFilter = {}): Promise<AuditLog[]> {
    try {
      let q = collection(db, this.COLLECTION_NAME);
      const constraints: any[] = [];

      if (filter.userId) {
        constraints.push(where('userId', '==', filter.userId));
      }

      if (filter.action) {
        constraints.push(where('action', '==', filter.action));
      }

      if (filter.resource) {
        constraints.push(where('resource', '==', filter.resource));
      }

      if (filter.severity) {
        constraints.push(where('severity', '==', filter.severity));
      }

      if (filter.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filter.startDate)));
      }

      if (filter.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filter.endDate)));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      q = query(q, orderBy('timestamp', 'desc'), limit(filter.limit || 100));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({
      userId,
      limit
    });
  }

  async getSecurityEvents(severity?: AuditLog['severity'], limit: number = 100): Promise<AuditLog[]> {
    return this.getAuditLogs({
      resource: 'security',
      severity,
      limit
    });
  }

  async getDataChangesForResource(
    resource: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('resource', '==', resource),
        where('resourceId', '==', resourceId),
        where('action', 'in', ['DATA_CREATE', 'DATA_UPDATE', 'DATA_DELETE']),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));
    } catch (error) {
      console.error('Error fetching data changes:', error);
      throw new Error(`Failed to fetch data changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalytics(timeRange: { start: Date; end: Date }): Promise<{
    totalActions: number;
    uniqueUsers: number;
    actionBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    resourceBreakdown: Record<string, number>;
    hourlyActivity: Record<string, number>;
  }> {
    try {
      const logs = await this.getAuditLogs({
        startDate: timeRange.start,
        endDate: timeRange.end,
        limit: 10000
      });

      const analytics = {
        totalActions: logs.length,
        uniqueUsers: new Set(logs.map(log => log.userId)).size,
        actionBreakdown: {} as Record<string, number>,
        severityBreakdown: {} as Record<string, number>,
        resourceBreakdown: {} as Record<string, number>,
        hourlyActivity: {} as Record<string, number>
      };

      logs.forEach(log => {
        // Action breakdown
        analytics.actionBreakdown[log.action] = (analytics.actionBreakdown[log.action] || 0) + 1;

        // Severity breakdown
        analytics.severityBreakdown[log.severity] = (analytics.severityBreakdown[log.severity] || 0) + 1;

        // Resource breakdown
        analytics.resourceBreakdown[log.resource] = (analytics.resourceBreakdown[log.resource] || 0) + 1;

        // Hourly activity
        const hour = log.timestamp.toDate().getHours();
        analytics.hourlyActivity[hour] = (analytics.hourlyActivity[hour] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error(`Failed to generate analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  private getClientIP(): string {
    // In a real implementation, you would get this from your server
    // For now, return a placeholder
    return 'client-ip-placeholder';
  }

  private getSessionId(): string {
    // Get or generate session ID
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private getChangedFields(oldValue: any, newValue: any): string[] {
    if (!oldValue || !newValue) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

    allKeys.forEach(key => {
      if (oldValue[key] !== newValue[key]) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  // Cleanup and maintenance

  async cleanupOldLogs(olderThanDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );

      const querySnapshot = await getDocs(q);

      // Note: Firebase doesn't support batch deletion via queries
      // In a real implementation, you would:
      // 1. Use a Cloud Function to delete old logs
      // 2. Or implement a server-side cleanup job
      // For now, return the count of logs that would be deleted

      console.log(`Would delete ${querySnapshot.docs.length} old audit logs`);
      return querySnapshot.docs.length;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw new Error(`Failed to cleanup old logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportLogs(filter: AuditFilter = {}): Promise<Blob> {
    try {
      const logs = await this.getAuditLogs(filter);

      const csvContent = this.convertLogsToCSV(logs);
      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw new Error(`Failed to export logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertLogsToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID',
      'User ID',
      'User Email',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'User Agent',
      'Severity',
      'Timestamp',
      'Details'
    ];

    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.id || '',
        log.userId,
        log.userEmail || '',
        log.action,
        log.resource,
        log.resourceId || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.severity,
        log.timestamp.toDate().toISOString(),
        JSON.stringify(log.details || {})
      ].map(field => `"${field}"`).join(','))
    ];

    return csvRows.join('\n');
  }
}

export const auditService = new AuditService();
export default auditService;