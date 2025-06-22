import crypto from 'crypto';
import { z } from 'zod';

// Differential Privacy Configuration
export interface DifferentialPrivacyConfig {
  epsilon: number; // Privacy budget (smaller = more private)
  delta: number; // Failure probability
  sensitivity: number; // Maximum change one user can make
  noiseScale: number; // Scale of Laplace noise
}

// User Data Encryption Configuration
export interface UserEncryptionConfig {
  algorithm: string;
  keyDerivationRounds: number;
  saltLength: number;
  ivLength: number;
  tagLength: number;
}

// Default privacy configurations
export const DEFAULT_PRIVACY_CONFIG: DifferentialPrivacyConfig = {
  epsilon: 1.0, // Standard privacy level
  delta: 1e-5, // Very low failure probability
  sensitivity: 1.0, // Single user impact
  noiseScale: 1.0 // Calibrated noise
};

export const DEFAULT_ENCRYPTION_CONFIG: UserEncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivationRounds: 100000,
  saltLength: 32,
  ivLength: 16,
  tagLength: 16
};

// Differential Privacy Implementation
export class DifferentialPrivacy {
  private config: DifferentialPrivacyConfig;

  constructor(config: DifferentialPrivacyConfig = DEFAULT_PRIVACY_CONFIG) {
    this.config = config;
  }

  // Add Laplace noise for differential privacy
  private addLaplaceNoise(value: number): number {
    const u = Math.random() - 0.5;
    const noise = -Math.sign(u) * Math.log(1 - 2 * Math.abs(u)) * this.config.noiseScale;
    return value + noise;
  }

  // Add Gaussian noise for differential privacy
  private addGaussianNoise(value: number): number {
    const u = Math.random();
    const v = Math.random();
    const noise = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * this.config.noiseScale;
    return value + noise;
  }

  // Apply differential privacy to numerical data
  public applyPrivacy(value: number, useGaussian: boolean = false): number {
    if (useGaussian) {
      return Math.max(0, this.addGaussianNoise(value));
    }
    return Math.max(0, this.addLaplaceNoise(value));
  }

  // Apply differential privacy to aggregated statistics
  public applyPrivacyToStats(stats: Record<string, number>): Record<string, number> {
    const privatizedStats: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value === 'number') {
        privatizedStats[key] = Math.round(this.applyPrivacy(value) * 100) / 100;
      }
    }
    
    return privatizedStats;
  }

  // Generate anonymized user cohorts
  public generateAnonymizedCohorts(userData: Array<{ userId: number; value: number }>): {
    cohortSize: number;
    averageValue: number;
    medianValue: number;
    standardDeviation: number;
  } {
    if (userData.length < 5) {
      throw new Error('Insufficient data for differential privacy (minimum 5 users required)');
    }

    const values = userData.map(u => u.value);
    const cohortSize = this.applyPrivacy(values.length);
    const sum = values.reduce((a, b) => a + b, 0);
    const averageValue = this.applyPrivacy(sum / values.length);
    
    values.sort((a, b) => a - b);
    const medianValue = this.applyPrivacy(
      values.length % 2 === 0 
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)]
    );

    const variance = values.reduce((acc, val) => acc + Math.pow(val - (sum / values.length), 2), 0) / values.length;
    const standardDeviation = this.applyPrivacy(Math.sqrt(variance));

    return {
      cohortSize: Math.round(cohortSize),
      averageValue: Math.round(averageValue * 100) / 100,
      medianValue: Math.round(medianValue * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100
    };
  }
}

// User-Controlled Data Encryption
export class UserDataEncryption {
  private config: UserEncryptionConfig;

  constructor(config: UserEncryptionConfig = DEFAULT_ENCRYPTION_CONFIG) {
    this.config = config;
  }

  // Generate a salt for key derivation
  private generateSalt(): Buffer {
    return crypto.randomBytes(this.config.saltLength);
  }

  // Generate an initialization vector
  private generateIV(): Buffer {
    return crypto.randomBytes(this.config.ivLength);
  }

  // Derive encryption key from user password and salt
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.config.keyDerivationRounds,
      32, // 256 bits for AES-256
      'sha256'
    );
  }

  // Encrypt user data with client-side key
  public encryptData(data: string, userPassword: string): {
    encryptedData: string;
    salt: string;
    iv: string;
    authTag: string;
  } {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = this.deriveKey(userPassword, salt);

    const cipher = crypto.createCipher(this.config.algorithm, key);
    cipher.setAAD(Buffer.from('therapeutic-data'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encryptedData: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt user data with client-side key
  public decryptData(
    encryptedData: string,
    userPassword: string,
    salt: string,
    iv: string,
    authTag: string
  ): string {
    const saltBuffer = Buffer.from(salt, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    const key = this.deriveKey(userPassword, saltBuffer);

    const decipher = crypto.createDecipher(this.config.algorithm, key);
    decipher.setAAD(Buffer.from('therapeutic-data'));
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Generate client-side encryption key fingerprint
  public generateKeyFingerprint(userPassword: string, salt: string): string {
    const saltBuffer = Buffer.from(salt, 'hex');
    const key = this.deriveKey(userPassword, saltBuffer);
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
  }
}

// Privacy-Compliant Analytics
export class PrivacyCompliantAnalytics {
  private dp: DifferentialPrivacy;
  private encryption: UserDataEncryption;

  constructor(
    dpConfig?: DifferentialPrivacyConfig,
    encryptionConfig?: UserEncryptionConfig
  ) {
    this.dp = new DifferentialPrivacy(dpConfig);
    this.encryption = new UserDataEncryption(encryptionConfig);
  }

  // Generate anonymized wellness report
  public generateAnonymizedWellnessReport(userDataSets: Array<{
    userId: number;
    wellnessScore: number;
    engagementLevel: number;
    progressRate: number;
    sessionCount: number;
  }>): {
    reportId: string;
    generatedAt: Date;
    cohortAnalysis: {
      totalUsers: number;
      wellnessMetrics: Record<string, number>;
      engagementMetrics: Record<string, number>;
      progressMetrics: Record<string, number>;
    };
    privacyGuarantees: {
      epsilon: number;
      delta: number;
      minCohortSize: number;
    };
  } {
    if (userDataSets.length < 10) {
      throw new Error('Insufficient data for anonymized reporting (minimum 10 users required)');
    }

    const wellnessCohort = this.dp.generateAnonymizedCohorts(
      userDataSets.map(u => ({ userId: u.userId, value: u.wellnessScore }))
    );

    const engagementCohort = this.dp.generateAnonymizedCohorts(
      userDataSets.map(u => ({ userId: u.userId, value: u.engagementLevel }))
    );

    const progressCohort = this.dp.generateAnonymizedCohorts(
      userDataSets.map(u => ({ userId: u.userId, value: u.progressRate }))
    );

    const sessionCohort = this.dp.generateAnonymizedCohorts(
      userDataSets.map(u => ({ userId: u.userId, value: u.sessionCount }))
    );

    return {
      reportId: crypto.randomUUID(),
      generatedAt: new Date(),
      cohortAnalysis: {
        totalUsers: Math.round(this.dp.applyPrivacy(userDataSets.length)),
        wellnessMetrics: {
          averageScore: wellnessCohort.averageValue,
          medianScore: wellnessCohort.medianValue,
          scoreVariability: wellnessCohort.standardDeviation
        },
        engagementMetrics: {
          averageEngagement: engagementCohort.averageValue,
          medianEngagement: engagementCohort.medianValue,
          engagementVariability: engagementCohort.standardDeviation
        },
        progressMetrics: {
          averageProgress: progressCohort.averageValue,
          medianProgress: progressCohort.medianValue,
          progressVariability: progressCohort.standardDeviation,
          averageSessions: sessionCohort.averageValue
        }
      },
      privacyGuarantees: {
        epsilon: DEFAULT_PRIVACY_CONFIG.epsilon,
        delta: DEFAULT_PRIVACY_CONFIG.delta,
        minCohortSize: 10
      }
    };
  }

  // Generate encrypted user backup
  public generateEncryptedUserBackup(
    userId: number,
    userData: Record<string, any>,
    userPassword: string
  ): {
    backupId: string;
    encryptedBackup: string;
    salt: string;
    iv: string;
    authTag: string;
    keyFingerprint: string;
    createdAt: Date;
  } {
    const backupData = JSON.stringify({
      userId,
      userData,
      backupVersion: '1.0',
      createdAt: new Date().toISOString()
    });

    const encrypted = this.encryption.encryptData(backupData, userPassword);

    return {
      backupId: crypto.randomUUID(),
      encryptedBackup: encrypted.encryptedData,
      salt: encrypted.salt,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyFingerprint: this.encryption.generateKeyFingerprint(userPassword, encrypted.salt),
      createdAt: new Date()
    };
  }

  // Decrypt user backup
  public decryptUserBackup(
    encryptedBackup: string,
    userPassword: string,
    salt: string,
    iv: string,
    authTag: string
  ): {
    userId: number;
    userData: Record<string, any>;
    backupVersion: string;
    createdAt: string;
  } {
    const decryptedData = this.encryption.decryptData(
      encryptedBackup,
      userPassword,
      salt,
      iv,
      authTag
    );

    return JSON.parse(decryptedData);
  }
}

// Privacy audit and compliance
export class PrivacyAudit {
  // Audit data processing for privacy compliance
  public auditDataProcessing(processingLog: Array<{
    timestamp: Date;
    operation: string;
    dataType: string;
    userConsent: boolean;
    privacyTechnique: string;
  }>): {
    complianceScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for user consent
    const unconsentedOperations = processingLog.filter(log => !log.userConsent);
    if (unconsentedOperations.length > 0) {
      issues.push(`Found ${unconsentedOperations.length} operations without user consent`);
      recommendations.push('Ensure explicit user consent for all data processing operations');
      score -= 20;
    }

    // Check for privacy techniques
    const unprotectedOperations = processingLog.filter(log => !log.privacyTechnique || log.privacyTechnique === 'none');
    if (unprotectedOperations.length > 0) {
      issues.push(`Found ${unprotectedOperations.length} operations without privacy protection`);
      recommendations.push('Apply differential privacy or encryption to all sensitive data operations');
      score -= 15;
    }

    // Check for sensitive data types
    const sensitiveOperations = processingLog.filter(log => 
      log.dataType.includes('therapeutic') || 
      log.dataType.includes('mental_health') ||
      log.dataType.includes('personal')
    );
    
    if (sensitiveOperations.length > 0 && sensitiveOperations.some(op => !op.privacyTechnique)) {
      issues.push('Sensitive therapeutic data processed without privacy protection');
      recommendations.push('Implement mandatory privacy protection for all therapeutic and mental health data');
      score -= 25;
    }

    return {
      complianceScore: Math.max(0, score),
      issues,
      recommendations
    };
  }

  // Generate privacy compliance report
  public generateComplianceReport(auditResults: ReturnType<typeof this.auditDataProcessing>): {
    reportId: string;
    timestamp: Date;
    overallCompliance: 'compliant' | 'needs_attention' | 'non_compliant';
    score: number;
    summary: string;
    actionItems: string[];
  } {
    let overallCompliance: 'compliant' | 'needs_attention' | 'non_compliant';
    
    if (auditResults.complianceScore >= 90) {
      overallCompliance = 'compliant';
    } else if (auditResults.complianceScore >= 70) {
      overallCompliance = 'needs_attention';
    } else {
      overallCompliance = 'non_compliant';
    }

    const summary = `Privacy compliance assessment completed with ${auditResults.complianceScore}% compliance score. ${auditResults.issues.length} issues identified requiring attention.`;

    return {
      reportId: crypto.randomUUID(),
      timestamp: new Date(),
      overallCompliance,
      score: auditResults.complianceScore,
      summary,
      actionItems: auditResults.recommendations
    };
  }
}

// Export privacy compliance utilities
export const privacyCompliance = {
  DifferentialPrivacy,
  UserDataEncryption,
  PrivacyCompliantAnalytics,
  PrivacyAudit,
  DEFAULT_PRIVACY_CONFIG,
  DEFAULT_ENCRYPTION_CONFIG
};