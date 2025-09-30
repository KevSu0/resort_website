import { logger } from '../utils/logger';
import { errorService } from './errorService';
import { authService } from './authService';
import { validationService } from './validationService';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: SecurityEventType;
  severity: 'info' | 'warning' | 'critical';
  category: SecurityCategory;
  message: string;
  details: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resolved: boolean;
  resolutionNotes?: string;
}

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_CHANGE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'VALIDATION_FAILURE'
  | 'THREAT_DETECTED'
  | 'SECURITY_VIOLATION'
  | 'CONFIGURATION_CHANGE'
  | 'DATA_ACCESS'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA';

export type SecurityCategory =
  | 'authentication'
  | 'authorization'
  | 'data_validation'
  | 'input_sanitization'
  | 'session_management'
  | 'network_security'
  | 'configuration'
  | 'data_protection'
  | 'compliance';

export interface SecurityAuditConfig {
  enableRealTimeMonitoring: boolean;
  enableAlerting: boolean;
  enableReporting: boolean;
  alertThresholds: Record<string, number>;
  monitorCategories: SecurityCategory[];
  excludeEvents: SecurityEventType[];
  retentionDays: number;
  auditInterval: number; // minutes
}

const DEFAULT_CONFIG: SecurityAuditConfig = {
  enableRealTimeMonitoring: true,
  enableAlerting: true,
  enableReporting: true,
  alertThresholds: {
    FAILED_LOGIN_ATTEMPTS: 5,
    RATE_LIMIT_HITS: 10,
    THREAT_DETECTIONS: 3,
    VALIDATION_ERRORS: 50
  },
  monitorCategories: [
    'authentication',
    'authorization',
    'data_validation',
    'input_sanitization',
    'session_management'
  ],
  excludeEvents: [],
  retentionDays: 30,
  auditInterval: 5
};

export interface SecurityAuditReport {
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsByCategory: Record<SecurityCategory, number>;
    topUsers: Array<{
      userId: string;
      eventCount: number;
    }>;
    topIPs: Array<{
      ipAddress: string;
      eventCount: number;
    }>;
  };
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
  compliance: ComplianceStatus;
}

export interface SecurityFinding {
  id: string;
  type: 'vulnerability' | 'misconfiguration' | 'policy_violation' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: SecurityCategory;
  title: string;
  description: string;
  evidence: Record<string, any>;
  impact: string;
  remediation: string;
  detectedAt: string;
  status: 'open' | 'resolved' | 'ignored';
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: SecurityCategory;
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: 'hours' | 'days' | 'weeks';
}

export interface ComplianceStatus {
  gdpr: {
    compliant: boolean;
    gaps: string[];
  };
  pci: {
    compliant: boolean;
    gaps: string[];
  };
  soc2: {
    compliant: boolean;
    gaps: string[];
  };
  custom: {
    [key: string]: {
      compliant: boolean;
      gaps: string[];
    };
  };
}

class SecurityAuditService {
  private config: SecurityAuditConfig;
  private events: SecurityEvent[] = [];
  private auditInterval: NodeJS.Timeout | null = null;
  private counters: Record<string, number> = {};
  private storageKey = 'security_audit_events';

  constructor(config: Partial<SecurityAuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadEvents();
    this.startAuditInterval();
    this.setupGlobalMonitoring();
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.events = JSON.parse(stored);
        this.updateCounters();
      }
    } catch (error) {
      logger.error('Failed to load security events', error);
    }
  }

  private saveEvents(): void {
    try {
      // Apply retention policy
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const filteredEvents = this.events.filter(
        event => new Date(event.timestamp) > cutoffDate
      );

      this.events = filteredEvents;
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      logger.error('Failed to save security events', error);
    }
  }

  private updateCounters(): void {
    this.counters = {};

    this.events.forEach(event => {
      const key = `${event.type}_${event.severity}`;
      this.counters[key] = (this.counters[key] || 0) + 1;
    });
  }

  private startAuditInterval(): void {
    if (this.config.enableRealTimeMonitoring) {
      this.auditInterval = setInterval(() => {
        this.runAudit();
      }, this.config.auditInterval * 60 * 1000);
    }
  }

  private setupGlobalMonitoring(): void {
    // Monitor authentication events
    const originalLogin = authService.login.bind(authService);
    authService.login = async (credentials) => {
      const result = await originalLogin(credentials);
      if (result) {
        this.logEvent({
          type: 'LOGIN_SUCCESS',
          severity: 'info',
          category: 'authentication',
          message: 'User logged in successfully',
          details: { username: credentials.username }
        });
      } else {
        this.logEvent({
          type: 'LOGIN_FAILED',
          severity: 'warning',
          category: 'authentication',
          message: 'Failed login attempt',
          details: { username: credentials.username }
        });
      }
      return result;
    };

    // Monitor validation errors
    const originalValidate = validationService.validateProperty.bind(validationService);
    validationService.validateProperty = (data) => {
      const result = originalValidate(data);
      if (!result.isValid) {
        this.logEvent({
          type: 'VALIDATION_FAILURE',
          severity: 'warning',
          category: 'data_validation',
          message: 'Property validation failed',
          details: { errors: result.errors }
        });
      }
      return result;
    };
  }

  logEvent(event: {
    type: SecurityEventType;
    severity: 'info' | 'warning' | 'critical';
    category: SecurityCategory;
    message: string;
    details?: Record<string, any>;
    userId?: string;
  }): void {
    // Check if event type is excluded
    if (this.config.excludeEvents.includes(event.type)) {
      return;
    }

    // Check if category is monitored
    if (!this.config.monitorCategories.includes(event.category)) {
      return;
    }

    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
      details: event.details || {},
      resolved: false,
      ipAddress: this.getClientIP(),
      userAgent: navigator?.userAgent
    };

    // Get session info
    const session = authService.getCurrentSession();
    if (session) {
      securityEvent.sessionId = session.token;
    }

    this.events.push(securityEvent);
    this.updateCounters();
    this.saveEvents();

    // Check thresholds and trigger alerts
    this.checkThresholds(securityEvent);

    // Log to main logger
    if (event.severity === 'info') {
      logger.info(
        `Security: ${event.message}`,
        {
          eventId: securityEvent.id,
          type: event.type,
          category: event.category,
          userId: event.userId
        }
      );
    } else if (event.severity === 'warning') {
      logger.warn(
        `Security: ${event.message}`,
        {
          eventId: securityEvent.id,
          type: event.type,
          category: event.category,
          userId: event.userId
        }
      );
    } else {
      logger.error(
        `Security: ${event.message}`,
        {
          eventId: securityEvent.id,
          type: event.type,
          category: event.category,
          userId: event.userId
        }
      );
    }
  }

  private checkThresholds(event: SecurityEvent): void {
    if (!this.config.enableAlerting) return;

    const now = new Date();
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 minute window

    // Check for repeated failed logins
    if (event.type === 'LOGIN_FAILED') {
      const recentFailures = this.events.filter(e =>
        e.type === 'LOGIN_FAILED' &&
        e.details?.username === event.details?.username &&
        new Date(e.timestamp) > windowStart
      );

      if (recentFailures.length >= this.config.alertThresholds.FAILED_LOGIN_ATTEMPTS) {
        this.triggerAlert({
          type: 'BRUTE_FORCE_DETECTED',
          severity: 'critical',
          message: 'Possible brute force attack detected',
          details: {
            username: event.details?.username,
            attempts: recentFailures.length,
            window: '15 minutes'
          }
        });
      }
    }

    // Check for threat detections
    if (event.type === 'THREAT_DETECTED') {
      const recentThreats = this.events.filter(e =>
        e.type === 'THREAT_DETECTED' &&
        new Date(e.timestamp) > windowStart
      );

      if (recentThreats.length >= this.config.alertThresholds.THREAT_DETECTIONS) {
        this.triggerAlert({
          type: 'MULTIPLE_THREATS_DETECTED',
          severity: 'critical',
          message: 'Multiple security threats detected',
          details: {
            threatCount: recentThreats.length,
            window: '15 minutes'
          }
        });
      }
    }
  }

  private triggerAlert(alert: {
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    details: Record<string, any>;
  }): void {
    // Log the alert
    logger.error(`Security Alert: ${alert.message}`, alert.details);

    // Dispatch custom event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('securityAlert', {
        detail: alert
      }));
    }

    // In a real implementation, this would send to a security monitoring service
    console.error('SECURITY ALERT:', alert);
  }

  private getClientIP(): string {
    // In a real application, this would come from the request
    return '127.0.0.1';
  }

  runAudit(): void {
    if (!this.config.enableReporting) return;

    const findings = this.identifyFindings();
    const recommendations = this.generateRecommendations(findings);
    const compliance = this.checkCompliance();

    logger.info('Security audit completed', {
      findingsCount: findings.length,
      recommendationsCount: recommendations.length
    });

    // Store audit results
    const auditResult = {
      timestamp: new Date().toISOString(),
      findings,
      recommendations,
      compliance
    };

    localStorage.setItem('last_security_audit', JSON.stringify(auditResult));
  }

  private identifyFindings(): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const now = new Date();

    // Check for suspicious patterns
    const failedLoginsByIP = this.events
      .filter(e => e.type === 'LOGIN_FAILED')
      .reduce((acc, event) => {
        const ip = event.ipAddress || 'unknown';
        acc[ip] = (acc[ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(failedLoginsByIP).forEach(([ip, count]) => {
      if (count > 10) {
        findings.push({
          id: `finding_${Date.now()}_${Math.random()}`,
          type: 'anomaly',
          severity: count > 50 ? 'critical' : 'high',
          category: 'authentication',
          title: 'High number of failed login attempts',
          description: `IP address ${ip} has ${count} failed login attempts`,
          evidence: { ipAddress: ip, attemptCount: count },
          impact: 'Potential brute force attack',
          remediation: 'Implement IP-based rate limiting or consider blocking the IP',
          detectedAt: now.toISOString(),
          status: 'open'
        });
      }
    });

    // Check for weak passwords
    // This would integrate with the password strength checking
    findings.push({
      id: 'password_strength_finding',
      type: 'policy_violation',
      severity: 'medium',
      category: 'authentication',
      title: 'Password strength policy',
      description: 'Ensure all users have strong passwords',
      evidence: {},
      impact: 'Weak passwords can lead to account compromise',
      remediation: 'Enforce password strength requirements for all users',
      detectedAt: now.toISOString(),
      status: 'open'
    });

    return findings;
  }

  private generateRecommendations(findings: SecurityFinding[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Add recommendations based on findings
    findings.forEach(finding => {
      switch (finding.category) {
        case 'authentication':
          recommendations.push({
            id: `rec_auth_${Date.now()}`,
            priority: finding.severity === 'critical' ? 'high' : 'medium',
            category: 'authentication',
            title: 'Enhance authentication security',
            description: 'Implement multi-factor authentication',
            implementation: 'Integrate with an MFA provider',
            estimatedEffort: 'days'
          });
          break;
        case 'input_sanitization':
          recommendations.push({
            id: `rec_sanitize_${Date.now()}`,
            priority: 'medium',
            category: 'input_sanitization',
            title: 'Improve input validation',
            description: 'Implement comprehensive input sanitization',
            implementation: 'Use established sanitization libraries',
            estimatedEffort: 'hours'
          });
          break;
      }
    });

    return recommendations;
  }

  private checkCompliance(): ComplianceStatus {
    return {
      gdpr: {
        compliant: true,
        gaps: ['Data retention policy needs review']
      },
      pci: {
        compliant: true,
        gaps: []
      },
      soc2: {
        compliant: false,
        gaps: ['Need to implement audit logging', 'Access control review required']
      },
      custom: {
        internal_security: {
          compliant: true,
          gaps: []
        }
      }
    };
  }

  // Public API
  getEvents(options?: {
    type?: SecurityEventType;
    category?: SecurityCategory;
    severity?: 'info' | 'warning' | 'critical';
    since?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (options) {
      if (options.type) {
        filtered = filtered.filter(e => e.type === options.type);
      }
      if (options.category) {
        filtered = filtered.filter(e => e.category === options.category);
      }
      if (options.severity) {
        filtered = filtered.filter(e => e.severity === options.severity);
      }
      if (options.since) {
        filtered = filtered.filter(e => new Date(e.timestamp) >= options.since!);
      }
      if (options.limit) {
        filtered = filtered.slice(-options.limit);
      }
    }

    return filtered.reverse();
  }

  generateReport(startDate?: Date, endDate?: Date): SecurityAuditReport {
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const events = this.events.filter(e => {
      const eventDate = new Date(e.timestamp);
      return eventDate >= start && eventDate <= end;
    });

    const eventsByType: Record<SecurityEventType, number> = {} as any;
    const eventsByCategory: Record<SecurityCategory, number> = {} as any;

    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    // Calculate top users and IPs
    const userCounts: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    events.forEach(event => {
      if (event.userId) {
        userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
      }
      if (event.ipAddress) {
        ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
      }
    });

    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, eventCount]) => ({ userId, eventCount }));

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ipAddress, eventCount]) => ({ ipAddress, eventCount }));

    const findings = this.identifyFindings();
    const recommendations = this.generateRecommendations(findings);
    const compliance = this.checkCompliance();

    return {
      generatedAt: new Date().toISOString(),
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      summary: {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'critical').length,
        eventsByType,
        eventsByCategory,
        topUsers,
        topIPs
      },
      findings,
      recommendations,
      compliance
    };
  }

  resolveEvent(eventId: string, resolutionNotes?: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;

    event.resolved = true;
    event.resolutionNotes = resolutionNotes;
    this.saveEvents();

    logger.info('Security event resolved', { eventId, resolutionNotes });

    return true;
  }

  getSecurityScore(): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);

    // Calculate score based on event severity and recency
    let score = 100;
    recentEvents.forEach(event => {
      const daysAgo = (now.getTime() - new Date(event.timestamp).getTime()) / (24 * 60 * 60 * 1000);
      const weight = Math.max(0.1, 1 - daysAgo / 30);

      switch (event.severity) {
        case 'critical':
          score -= 10 * weight;
          break;
        case 'warning':
          score -= 3 * weight;
          break;
        case 'info':
          score -= 0.5 * weight;
          break;
      }
    });

    return Math.max(0, Math.round(score));
  }

  cleanup(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
    }
  }
}

// Create singleton instance
export const securityAuditService = new SecurityAuditService();

import React from 'react';

// Hook for security monitoring
export function useSecurityMonitor() {
  const [events, setEvents] = React.useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [score, setScore] = React.useState(100);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEvents(securityAuditService.getEvents({ limit: 50 }));
      setScore(securityAuditService.getSecurityScore());
    }, 5000);

    const handleAlert = (event: CustomEvent) => {
      setAlerts(prev => [...prev, event.detail].slice(-10));
    };

    window.addEventListener('securityAlert', handleAlert as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('securityAlert', handleAlert as EventListener);
    };
  }, []);

  return {
    events,
    alerts,
    score,
    logEvent: securityAuditService.logEvent.bind(securityAuditService),
    generateReport: securityAuditService.generateReport.bind(securityAuditService),
    resolveEvent: securityAuditService.resolveEvent.bind(securityAuditService)
  };
}