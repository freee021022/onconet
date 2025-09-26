import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with three types: patient, professional, pharmacy
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull().default("patient"), // "patient", "professional", "pharmacy"
  
  // Patient fields
  birthDate: date("birth_date"), // Only name, surname, birth date for patients
  
  // Professional fields
  specialization: text("specialization"),
  hospital: text("hospital"),
  licenseNumber: text("license_number"),
  studioAddress: text("studio_address"), // Studio address for professionals
  bookingCalendar: jsonb("booking_calendar"), // Calendar availability
  contacts: jsonb("contacts"), // Contact information
  reviews: jsonb("reviews").default([]), // Reviews from patients
  verificationDocument: text("verification_document"), // PDF document path for verification
  availableForSecondOpinion: boolean("available_for_second_opinion").default(false), // Second Opinion Service availability
  calendarSettings: jsonb("calendar_settings"), // Professional calendar configuration
  
  // Pharmacy fields  
  pharmacyName: text("pharmacy_name"),
  address: text("address"),
  pharmacyOffers: text("pharmacy_offers"), // Description of offers
  googleMapsLink: text("google_maps_link"), // Google Maps integration
  
  // Common fields
  city: text("city"),
  region: text("region"),
  phone: text("phone"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Forum categories
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  postCount: integer("post_count").notNull().default(0),
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => forumCategories.id),
  commentCount: integer("comment_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Forum comments
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => forumPosts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Second Opinion Requests
export const secondOpinionRequests = pgTable("second_opinion_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  description: text("description").notNull(),
  documentLinks: text("document_links").array(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Pharmacies
export const pharmacies = pgTable("pharmacies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  phone: text("phone"),
  specializations: text("specializations").array(),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  location: text("location").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  imageUrl: text("image_url"),
});

// Medical Records - Solo per pazienti
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  recordType: text("record_type").notNull(), // "diagnosis", "treatment", "medication", "test_result", "visit"
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  doctorName: text("doctor_name"),
  hospitalName: text("hospital_name"),
  medications: jsonb("medications"), // Lista farmaci
  documents: text("documents").array(), // File allegati
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// SOS Sharing Contracts - Contratti per condivisione emergenze
export const sosContracts = pgTable("sos_contracts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  contractType: text("contract_type").notNull().default("sos"), // "sos", "emergency", "consultation"
  emergencyType: text("emergency_type").notNull(), // "oncological", "general", "urgent"
  accessLevel: text("access_level").notNull().default("full"), // "full", "limited", "view_only"
  sharedRecordIds: text("shared_record_ids").array(), // IDs dei record condivisi
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"), // Scadenza contratto
  consentGiven: boolean("consent_given").notNull().default(false),
  consentDate: timestamp("consent_date"),
  emergencyNotes: text("emergency_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Appointments table for doctor-patient scheduling
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  patientId: integer("patient_id").references(() => users.id), // null if slot is available
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(), // e.g., "09:00"
  duration: integer("duration").notNull().default(30), // minutes
  status: text("status").notNull().default("available"), // "available", "booked", "completed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Doctor availability schedules
export const doctorSchedules = pgTable("doctor_schedules", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: text("start_time").notNull(), // e.g., "09:00"
  endTime: text("end_time").notNull(), // e.g., "17:00"
  isActive: boolean("is_active").notNull().default(true),
});

// Reviews for doctors
export const doctorReviews = pgTable("doctor_reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User activity feed
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // "forum_post", "forum_comment", "appointment", etc.
  content: text("content").notNull(),
  relatedId: integer("related_id"), // ID of related entity (post, comment, etc.)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull(), // ID of pharmacy, doctor, etc.
  targetType: text("target_type").notNull(), // "pharmacy", "doctor", "service"
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  comment: text("comment").notNull(),
  helpful: integer("helpful").default(0),
  reported: boolean("reported").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Medical records/documents
export const medicalDocuments = pgTable("medical_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  ocrText: text("ocr_text"), // Extracted text from OCR
  extractedData: jsonb("extracted_data"), // Structured data from AI analysis
  thumbnailPath: text("thumbnail_path"),
  isPrivate: boolean("is_private").notNull().default(true),
  sharedWith: jsonb("shared_with"), // Array of user IDs
  tags: jsonb("tags"), // Array of tags
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI chat conversations
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: text("session_id").notNull(),
  messages: jsonb("messages").notNull(), // Array of message objects
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  totalMessages: integer("total_messages").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Calendar events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  eventType: text("event_type").notNull(), // appointment, medication, reminder, follow-up
  source: text("source").notNull().default("onconet"), // onconet, google, outlook, etc.
  externalId: text("external_id"), // ID from external calendar system
  synced: boolean("synced").notNull().default(false),
  reminderMinutes: integer("reminder_minutes").notNull().default(15),
  metadata: jsonb("metadata"), // Additional event data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Offline sync queue
export const syncQueue = pgTable("sync_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(), // appointment, document, message, review
  itemId: text("item_id").notNull(),
  action: text("action").notNull(), // create, update, delete
  data: jsonb("data").notNull(),
  synced: boolean("synced").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  lastAttempt: timestamp("last_attempt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  reminderSettings: jsonb("reminder_settings"), // Reminder preferences
  marketingEmails: boolean("marketing_emails").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relazioni
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(forumPosts),
  comments: many(forumComments),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  patientRequests: many(secondOpinionRequests, { relationName: "patient" }),
  doctorRequests: many(secondOpinionRequests, { relationName: "doctor" }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  category: one(forumCategories, {
    fields: [forumPosts.categoryId],
    references: [forumCategories.id],
  }),
  author: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumComments.postId],
    references: [forumPosts.id],
  }),
  author: one(users, {
    fields: [forumComments.userId],
    references: [users.id],
  }),
}));

export const secondOpinionRequestsRelations = relations(secondOpinionRequests, ({ one }) => ({
  patient: one(users, {
    fields: [secondOpinionRequests.patientId],
    references: [users.id],
    relationName: "patient",
  }),
  doctor: one(users, {
    fields: [secondOpinionRequests.doctorId],
    references: [users.id],
    relationName: "doctor",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, isVerified: true });
export const insertForumCategorySchema = createInsertSchema(forumCategories)
  .omit({ id: true, postCount: true });
export const insertForumPostSchema = createInsertSchema(forumPosts)
  .omit({ id: true, commentCount: true, viewCount: true, createdAt: true });
export const insertForumCommentSchema = createInsertSchema(forumComments)
  .omit({ id: true, createdAt: true });
export const insertSecondOpinionRequestSchema = createInsertSchema(secondOpinionRequests)
  .omit({ id: true, status: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, isRead: true, createdAt: true });
export const insertPharmacySchema = createInsertSchema(pharmacies)
  .omit({ id: true, reviewCount: true });
export const insertTestimonialSchema = createInsertSchema(testimonials)
  .omit({ id: true });

// Medical Records schemas
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords)
  .omit({ id: true, createdAt: true, updatedAt: true });

// SOS Contract schemas  
export const insertSosContractSchema = createInsertSchema(sosContracts)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;

export type SecondOpinionRequest = typeof secondOpinionRequests.$inferSelect;
export type InsertSecondOpinionRequest = z.infer<typeof insertSecondOpinionRequestSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Medical Records types
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

// SOS Contract types
export type SosContract = typeof sosContracts.$inferSelect;
export type InsertSosContract = z.infer<typeof insertSosContractSchema>;

// New schemas for appointments and profiles
export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true, createdAt: true });
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedules)
  .omit({ id: true });
export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;

export const insertDoctorReviewSchema = createInsertSchema(doctorReviews)
  .omit({ id: true, createdAt: true });
export type DoctorReview = typeof doctorReviews.$inferSelect;
export type InsertDoctorReview = z.infer<typeof insertDoctorReviewSchema>;

export const insertUserActivitySchema = createInsertSchema(userActivities)
  .omit({ id: true, createdAt: true });
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export const insertReviewSchema = createInsertSchema(reviews)
  .omit({ id: true, helpful: true, reported: true, verified: true, createdAt: true, updatedAt: true });
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export const insertMedicalDocumentSchema = createInsertSchema(medicalDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type MedicalDocument = typeof medicalDocuments.$inferSelect;
export type InsertMedicalDocument = z.infer<typeof insertMedicalDocumentSchema>;

export const insertCalendarEventSchema = createInsertSchema(calendarEvents)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type AIConversation = typeof aiConversations.$inferSelect;
export type SyncQueueItem = typeof syncQueue.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

// Security: Encryption Keys
export const encryptionKeys = pgTable("encryption_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  keyId: text("key_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // master, device, session
  algorithm: text("algorithm").notNull(),
  strength: integer("strength").notNull(),
  status: text("status").notNull().default('active'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

// Security: Audit Trail
export const auditEvents = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  riskLevel: text("risk_level").notNull().default('low'),
  status: text("status").notNull().default('success'),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Security: User Consents
export const userConsents = pgTable("user_consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  consentId: text("consent_id").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  purpose: text("purpose").notNull(),
  dataTypes: jsonb("data_types").$type<string[]>().notNull(),
  recipients: jsonb("recipients").$type<string[]>().notNull(),
  retentionPeriod: text("retention_period").notNull(),
  required: boolean("required").notNull().default(false),
  granted: boolean("granted").notNull().default(false),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Security: Consent History
export const consentHistory = pgTable("consent_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  consentId: text("consent_id").notNull(),
  action: text("action").notNull(), // granted, revoked, modified
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Security: Backup Jobs
export const backupJobs = pgTable("backup_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // full, incremental, differential
  schedule: text("schedule").notNull(),
  dataTypes: jsonb("data_types").$type<string[]>().notNull(),
  destination: text("destination").notNull(),
  encrypted: boolean("encrypted").notNull().default(true),
  autoBackup: boolean("auto_backup").notNull().default(true),
  retentionDays: integer("retention_days").notNull().default(30),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  status: text("status").notNull().default('scheduled'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Security: Backup History
export const backupHistory = pgTable("backup_history", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => backupJobs.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  status: text("status").notNull(), // success, failed, partial
  size: text("size"),
  duration: text("duration"),
  filesProcessed: integer("files_processed").notNull().default(0),
  errors: jsonb("errors").$type<string[]>().notNull().default([]),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type InsertEncryptionKey = typeof encryptionKeys.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type InsertAuditEvent = typeof auditEvents.$inferInsert;
export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;
export type ConsentHistory = typeof consentHistory.$inferSelect;
export type InsertConsentHistory = typeof consentHistory.$inferInsert;
export type BackupJob = typeof backupJobs.$inferSelect;
export type InsertBackupJob = typeof backupJobs.$inferInsert;
export type BackupHistory = typeof backupHistory.$inferSelect;
export type InsertBackupHistory = typeof backupHistory.$inferInsert;
