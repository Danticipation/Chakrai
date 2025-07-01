import { pgTable, serial, integer, text, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// EHR Integration Tables
export const ehrIntegrations = pgTable("ehr_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id"),
  ehrSystemType: text("ehr_system_type").notNull(), // epic, cerner, allscripts, athenahealth
  integrationStatus: text("integration_status").notNull().default("pending"), // pending, active, paused, error
  fhirEndpoint: text("fhir_endpoint"),
  apiKey: text("api_key"), // encrypted
  clientId: text("client_id"),
  tenantId: text("tenant_id"),
  lastSync: timestamp("last_sync"),
  syncFrequency: text("sync_frequency").default("daily"), // real-time, hourly, daily, weekly
  dataTypes: json("data_types").$type<string[]>().default(["sessions", "assessments", "progress_notes"]),
  complianceLevel: text("compliance_level").notNull().default("hipaa"), // hipaa, gdpr, both
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const fhirResources = pgTable("fhir_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  resourceType: text("resource_type").notNull(), // Patient, Encounter, Observation, CarePlan
  resourceId: text("resource_id").notNull(), // FHIR resource ID
  fhirVersion: text("fhir_version").notNull().default("R4"),
  resourceData: json("resource_data").notNull(), // Complete FHIR resource
  lastUpdated: timestamp("last_updated").defaultNow(),
  syncStatus: text("sync_status").notNull().default("pending"), // pending, synced, error
  ehrIntegrationId: integer("ehr_integration_id").references(() => ehrIntegrations.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const insuranceEligibility = pgTable("insurance_eligibility", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id").notNull(),
  insuranceProvider: text("insurance_provider").notNull(),
  memberId: text("member_id").notNull(),
  groupNumber: text("group_number"),
  eligibilityStatus: text("eligibility_status").notNull(), // eligible, not_eligible, pending_verification
  coverageType: text("coverage_type"), // mental_health, behavioral_health, outpatient
  copayAmount: text("copay_amount"),
  deductibleRemaining: text("deductible_remaining"),
  annualLimit: text("annual_limit"),
  sessionsUsed: integer("sessions_used").default(0),
  sessionsRemaining: integer("sessions_remaining"),
  preAuthRequired: boolean("pre_auth_required").default(false),
  preAuthNumber: text("pre_auth_number"),
  verificationDate: timestamp("verification_date"),
  expirationDate: timestamp("expiration_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const sessionBilling = pgTable("session_billing", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id").notNull(),
  sessionId: text("session_id").notNull(),
  insuranceEligibilityId: integer("insurance_eligibility_id").references(() => insuranceEligibility.id),
  cptCode: text("cpt_code").notNull(), // 90834, 90837, 90847, etc.
  diagnosisCode: text("diagnosis_code"), // ICD-10 codes
  sessionDate: timestamp("session_date").notNull(),
  sessionDuration: integer("session_duration").notNull(), // minutes
  sessionType: text("session_type").notNull(), // individual, group, family, crisis
  billableAmount: text("billable_amount").notNull(),
  copayCollected: text("copay_collected"),
  claimStatus: text("claim_status").notNull().default("draft"), // draft, submitted, approved, denied, paid
  claimNumber: text("claim_number"),
  submissionDate: timestamp("submission_date"),
  paymentDate: timestamp("payment_date"),
  denialReason: text("denial_reason"),
  notes: text("notes"),
  isEligible: boolean("is_eligible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const clinicalExports = pgTable("clinical_exports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistId: integer("therapist_id"),
  exportType: text("export_type").notNull(), // pdf_report, csv_data, fhir_bundle, insurance_summary
  exportFormat: text("export_format").notNull(), // pdf, csv, json, xml
  dateRange: json("date_range").$type<{start: string, end: string}>(),
  includedData: json("included_data").$type<string[]>().notNull(), // sessions, assessments, progress, goals
  complianceLevel: text("compliance_level").notNull(), // hipaa, minimal, full
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  downloadCount: integer("download_count").default(0),
  expiresAt: timestamp("expires_at"),
  isSecure: boolean("is_secure").default(true),
  encryptionKey: text("encryption_key"), // for secure exports
  generatedAt: timestamp("generated_at").defaultNow(),
  lastDownloaded: timestamp("last_downloaded"),
  createdAt: timestamp("created_at").defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  therapistId: integer("therapist_id"),
  action: text("action").notNull(), // export, sync, access, modify
  resourceType: text("resource_type"), // patient_data, session_notes, billing_info
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  outcome: text("outcome").notNull(), // success, failure, partial
  details: json("details"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Insert schemas
export const insertEhrIntegration = createInsertSchema(ehrIntegrations);
export const insertFhirResource = createInsertSchema(fhirResources);
export const insertInsuranceEligibility = createInsertSchema(insuranceEligibility);
export const insertSessionBilling = createInsertSchema(sessionBilling);
export const insertClinicalExport = createInsertSchema(clinicalExports);
export const insertAuditLog = createInsertSchema(auditLogs);

// Types
export type EhrIntegration = typeof ehrIntegrations.$inferSelect;
export type InsertEhrIntegration = z.infer<typeof insertEhrIntegration>;
export type FhirResource = typeof fhirResources.$inferSelect;
export type InsertFhirResource = z.infer<typeof insertFhirResource>;
export type InsuranceEligibility = typeof insuranceEligibility.$inferSelect;
export type InsertInsuranceEligibility = z.infer<typeof insertInsuranceEligibility>;
export type SessionBilling = typeof sessionBilling.$inferSelect;
export type InsertSessionBilling = z.infer<typeof insertSessionBilling>;
export type ClinicalExport = typeof clinicalExports.$inferSelect;
export type InsertClinicalExport = z.infer<typeof insertClinicalExport>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLog>;