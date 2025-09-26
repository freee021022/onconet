import {
  User, InsertUser,
  ForumCategory, InsertForumCategory,
  ForumPost, InsertForumPost,
  ForumComment, InsertForumComment,
  SecondOpinionRequest, InsertSecondOpinionRequest,
  Message, InsertMessage,
  Pharmacy, InsertPharmacy,
  Testimonial, InsertTestimonial,
  MedicalRecord, InsertMedicalRecord,
  SosContract, InsertSosContract,
  users, forumCategories, forumPosts, forumComments,
  secondOpinionRequests, messages, pharmacies, testimonials,
  medicalRecords, sosContracts
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getDoctors(): Promise<User[]>;
  getPharmacyUsers(): Promise<User[]>;
  
  // Forum category operations
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategoryBySlug(slug: string): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  
  // Forum post operations
  getForumPosts(): Promise<ForumPost[]>;
  getForumPostsByCategory(categoryId: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  incrementPostViewCount(postId: number): Promise<void>;
  
  // Forum comment operations
  getForumCommentsByPost(postId: number): Promise<ForumComment[]>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  
  // Second opinion operations
  getSecondOpinionRequests(): Promise<SecondOpinionRequest[]>;
  getSecondOpinionRequestsByPatient(patientId: number): Promise<SecondOpinionRequest[]>;
  getSecondOpinionRequestsByDoctor(doctorId: number): Promise<SecondOpinionRequest[]>;
  createSecondOpinionRequest(request: InsertSecondOpinionRequest): Promise<SecondOpinionRequest>;
  updateSecondOpinionRequestStatus(requestId: number, status: string): Promise<SecondOpinionRequest | undefined>;
  
  // Message operations
  getMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Pharmacy operations
  getPharmacies(): Promise<Pharmacy[]>;
  getPharmacyById(id: number): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: number, pharmacy: Partial<Pharmacy>): Promise<Pharmacy | undefined>;
  
  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Medical Records operations
  getMedicalRecords(patientId: number): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number, patientId: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, patientId: number, record: Partial<MedicalRecord>): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number, patientId: number): Promise<boolean>;
  
  // SOS Contract operations
  getSosContracts(patientId: number): Promise<SosContract[]>;
  getSosContractsByDoctor(doctorId: number): Promise<SosContract[]>;
  getSosContract(id: number): Promise<SosContract | undefined>;
  createSosContract(contract: InsertSosContract): Promise<SosContract>;
  updateSosContract(id: number, contract: Partial<SosContract>): Promise<SosContract | undefined>;
  activateSosContract(id: number): Promise<SosContract | undefined>;
  deactivateSosContract(id: number): Promise<SosContract | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private forumCategories: ForumCategory[] = [];
  private forumPosts: ForumPost[] = [];
  private forumComments: ForumComment[] = [];
  private secondOpinionRequests: SecondOpinionRequest[] = [];
  private messages: Message[] = [];
  private pharmacies: Pharmacy[] = [];
  private testimonials: Testimonial[] = [];
  private medicalRecords: MedicalRecord[] = [];
  private sosContracts: SosContract[] = [];
  private nextId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default forum categories
    this.forumCategories = [
      { id: 1, name: "Oncologia Generale", slug: "oncologia-generale", description: "Discussioni generali sui tumori" },
      { id: 2, name: "Nutrizione e Oncologia", slug: "nutrizione", description: "Alimentazione durante le terapie" },
      { id: 3, name: "Effetti Collaterali", slug: "effetti-collaterali", description: "Gestione degli effetti delle terapie" },
      { id: 4, name: "Supporto Psicologico", slug: "supporto-psicologico", description: "Benessere emotivo e mentale" },
      { id: 5, name: "Nuove Terapie", slug: "nuove-terapie", description: "Innovazioni e trattamenti sperimentali" }
    ];

    // Add test users
    this.users = [
      {
        id: 1,
        username: "paziente1",
        email: "paziente1@test.com",
        password: "test123",
        userType: "patient",
        isVerified: true,
        fullName: "Mario Rossi",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: "dottore1",
        email: "dottore1@test.com", 
        password: "test123",
        userType: "professional",
        isVerified: true,
        fullName: "Dr. Anna Bianchi",
        specialization: "Oncologia",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add sample testimonials
    this.testimonials = [
      {
        id: 1,
        name: "Luisa Bianchi",
        role: "Paziente",
        content: "Onconet mi ha aiutato a trovare il supporto di cui avevo bisogno",
        rating: 5,
        location: "Milano",
        createdAt: new Date()
      }
    ];

    this.nextId = 10;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...userData,
      isVerified: userData.userType === 'patient',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...userData, updatedAt: new Date() };
    return this.users[index];
  }

  async getDoctors(): Promise<User[]> {
    return this.users.filter(u => u.userType === 'professional');
  }

  async getPharmacyUsers(): Promise<User[]> {
    return this.users.filter(u => u.userType === 'pharmacy');
  }

  // Forum operations
  async getForumCategories(): Promise<ForumCategory[]> {
    return this.forumCategories;
  }

  async getForumCategoryBySlug(slug: string): Promise<ForumCategory | undefined> {
    return this.forumCategories.find(c => c.slug === slug);
  }

  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const category: ForumCategory = {
      id: this.nextId++,
      ...categoryData
    };
    this.forumCategories.push(category);
    return category;
  }

  async getForumPosts(): Promise<ForumPost[]> {
    return this.forumPosts;
  }

  async getForumPostsByCategory(categoryId: number): Promise<ForumPost[]> {
    return this.forumPosts.filter(p => p.categoryId === categoryId);
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.find(p => p.id === id);
  }

  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const post: ForumPost = {
      id: this.nextId++,
      ...postData,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.forumPosts.push(post);
    return post;
  }

  async incrementPostViewCount(postId: number): Promise<void> {
    const post = this.forumPosts.find(p => p.id === postId);
    if (post) {
      post.viewCount = (post.viewCount || 0) + 1;
    }
  }

  async getForumCommentsByPost(postId: number): Promise<ForumComment[]> {
    return this.forumComments.filter(c => c.postId === postId);
  }

  async createForumComment(commentData: InsertForumComment): Promise<ForumComment> {
    const comment: ForumComment = {
      id: this.nextId++,
      ...commentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.forumComments.push(comment);
    return comment;
  }

  // Stub implementations for other methods
  async getSecondOpinionRequests(): Promise<SecondOpinionRequest[]> { return []; }
  async getSecondOpinionRequest(id: number): Promise<SecondOpinionRequest | undefined> { return undefined; }
  async createSecondOpinionRequest(requestData: InsertSecondOpinionRequest): Promise<SecondOpinionRequest> {
    const request: SecondOpinionRequest = {
      id: this.nextId++,
      ...requestData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return request;
  }
  async updateSecondOpinionRequest(id: number, requestData: Partial<SecondOpinionRequest>): Promise<SecondOpinionRequest | undefined> { return undefined; }

  async getMessages(userId: number): Promise<Message[]> { return []; }
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextId++,
      ...messageData,
      isRead: false,
      createdAt: new Date()
    };
    return message;
  }
  async markMessageAsRead(messageId: number): Promise<void> {}

  async getPharmacies(): Promise<Pharmacy[]> { return []; }
  async getPharmacyById(id: number): Promise<Pharmacy | undefined> { return undefined; }
  async createPharmacy(pharmacyData: InsertPharmacy): Promise<Pharmacy> {
    const pharmacy: Pharmacy = {
      id: this.nextId++,
      ...pharmacyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return pharmacy;
  }
  async updatePharmacy(id: number, pharmacyData: Partial<Pharmacy>): Promise<Pharmacy | undefined> { return undefined; }

  async getTestimonials(): Promise<Testimonial[]> {
    return this.testimonials;
  }
  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const testimonial: Testimonial = {
      id: this.nextId++,
      ...testimonialData,
      createdAt: new Date()
    };
    return testimonial;
  }

  async getMedicalRecords(patientId: number): Promise<MedicalRecord[]> { return []; }
  async getMedicalRecord(id: number, patientId: number): Promise<MedicalRecord | undefined> { return undefined; }
  async createMedicalRecord(recordData: InsertMedicalRecord): Promise<MedicalRecord> {
    const record: MedicalRecord = {
      id: this.nextId++,
      ...recordData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return record;
  }
  async updateMedicalRecord(id: number, patientId: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord | undefined> { return undefined; }
  async deleteMedicalRecord(id: number, patientId: number): Promise<boolean> { return false; }

  async getSosContracts(patientId: number): Promise<SosContract[]> { return []; }
  async getSosContractsByDoctor(doctorId: number): Promise<SosContract[]> { return []; }
  async getSosContract(id: number): Promise<SosContract | undefined> { return undefined; }
  async createSosContract(contractData: InsertSosContract): Promise<SosContract> {
    const contract: SosContract = {
      id: this.nextId++,
      ...contractData,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return contract;
  }
  async updateSosContract(id: number, contractData: Partial<SosContract>): Promise<SosContract | undefined> { return undefined; }
  async activateSosContract(id: number): Promise<SosContract | undefined> { return undefined; }
  async deactivateSosContract(id: number): Promise<SosContract | undefined> { return undefined; }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { db } = await import('./db');
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getDoctors(): Promise<User[]> {
    const { db } = await import('./db');
    return await db.select().from(users).where(eq(users.userType, 'professional'));
  }

  async getPharmacyUsers(): Promise<User[]> {
    const { db } = await import('./db');
    return await db.select().from(users).where(eq(users.userType, 'pharmacy'));
  }

  async getForumCategories(): Promise<ForumCategory[]> {
    const { db } = await import('./db');
    return await db.select().from(forumCategories);
  }

  async getForumCategoryBySlug(slug: string): Promise<ForumCategory | undefined> {
    const { db } = await import('./db');
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.slug, slug));
    return category;
  }

  async createForumCategory(categoryData: InsertForumCategory): Promise<ForumCategory> {
    const { db } = await import('./db');
    const [category] = await db.insert(forumCategories).values(categoryData).returning();
    return category;
  }

  async getForumPosts(): Promise<ForumPost[]> {
    const { db } = await import('./db');
    return await db.select().from(forumPosts);
  }

  async getForumPostsByCategory(categoryId: number): Promise<ForumPost[]> {
    const { db } = await import('./db');
    return await db.select().from(forumPosts).where(eq(forumPosts.categoryId, categoryId));
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const { db } = await import('./db');
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const { db } = await import('./db');
    const [post] = await db.insert(forumPosts).values(postData).returning();
    return post;
  }

  async incrementPostViewCount(postId: number): Promise<void> {
    const { db } = await import('./db');
    await db.update(forumPosts)
      .set({ viewCount: sql`${forumPosts.viewCount} + 1` })
      .where(eq(forumPosts.id, postId));
  }

  async getForumCommentsByPost(postId: number): Promise<ForumComment[]> {
    const { db } = await import('./db');
    return await db.select().from(forumComments).where(eq(forumComments.postId, postId));
  }

  async createForumComment(commentData: InsertForumComment): Promise<ForumComment> {
    const { db } = await import('./db');
    const [comment] = await db.insert(forumComments).values(commentData).returning();
    return comment;
  }

  async getSecondOpinionRequests(): Promise<SecondOpinionRequest[]> {
    const { db } = await import('./db');
    return await db.select().from(secondOpinionRequests);
  }

  async getSecondOpinionRequestsByPatient(patientId: number): Promise<SecondOpinionRequest[]> {
    const { db } = await import('./db');
    return await db.select().from(secondOpinionRequests).where(eq(secondOpinionRequests.patientId, patientId));
  }

  async getSecondOpinionRequestsByDoctor(doctorId: number): Promise<SecondOpinionRequest[]> {
    const { db } = await import('./db');
    return await db.select().from(secondOpinionRequests).where(eq(secondOpinionRequests.doctorId, doctorId));
  }

  async createSecondOpinionRequest(requestData: InsertSecondOpinionRequest): Promise<SecondOpinionRequest> {
    const { db } = await import('./db');
    const [request] = await db.insert(secondOpinionRequests).values(requestData).returning();
    return request;
  }

  async updateSecondOpinionRequestStatus(requestId: number, status: string): Promise<SecondOpinionRequest | undefined> {
    const { db } = await import('./db');
    const [updated] = await db.update(secondOpinionRequests)
      .set({ status })
      .where(eq(secondOpinionRequests.id, requestId))
      .returning();
    return updated;
  }

  async getMessages(userId: number): Promise<Message[]> {
    const { db } = await import('./db');
    return await db.select().from(messages).where(eq(messages.receiverId, userId));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    const { db } = await import('./db');
    return await db.select().from(messages).where(
      sql`(${messages.senderId} = ${user1Id} AND ${messages.receiverId} = ${user2Id}) OR (${messages.senderId} = ${user2Id} AND ${messages.receiverId} = ${user1Id})`
    );
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const { db } = await import('./db');
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    const { db } = await import('./db');
    await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    const { db } = await import('./db');
    return await db.select().from(pharmacies);
  }

  async getPharmacyById(id: number): Promise<Pharmacy | undefined> {
    const { db } = await import('./db');
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy;
  }

  async createPharmacy(pharmacyData: InsertPharmacy): Promise<Pharmacy> {
    const { db } = await import('./db');
    const [pharmacy] = await db.insert(pharmacies).values(pharmacyData).returning();
    return pharmacy;
  }

  async updatePharmacy(id: number, pharmacyData: Partial<Pharmacy>): Promise<Pharmacy | undefined> {
    const { db } = await import('./db');
    const [updated] = await db.update(pharmacies)
      .set(pharmacyData)
      .where(eq(pharmacies.id, id))
      .returning();
    return updated;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const { db } = await import('./db');
    return await db.select().from(testimonials);
  }

  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const { db } = await import('./db');
    const [testimonial] = await db.insert(testimonials).values(testimonialData).returning();
    return testimonial;
  }

  async getMedicalRecords(patientId: number): Promise<MedicalRecord[]> {
    const { db } = await import('./db');
    return await db.select().from(medicalRecords).where(eq(medicalRecords.patientId, patientId));
  }

  async getMedicalRecord(id: number, patientId: number): Promise<MedicalRecord | undefined> {
    const { db } = await import('./db');
    const [record] = await db.select().from(medicalRecords)
      .where(sql`${medicalRecords.id} = ${id} AND ${medicalRecords.patientId} = ${patientId}`);
    return record;
  }

  async createMedicalRecord(recordData: InsertMedicalRecord): Promise<MedicalRecord> {
    const { db } = await import('./db');
    const [record] = await db.insert(medicalRecords).values(recordData).returning();
    return record;
  }

  async updateMedicalRecord(id: number, patientId: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord | undefined> {
    const { db } = await import('./db');
    const [updated] = await db.update(medicalRecords)
      .set({ ...recordData, updatedAt: new Date() })
      .where(sql`${medicalRecords.id} = ${id} AND ${medicalRecords.patientId} = ${patientId}`)
      .returning();
    return updated;
  }

  async deleteMedicalRecord(id: number, patientId: number): Promise<boolean> {
    const { db } = await import('./db');
    const result = await db.delete(medicalRecords)
      .where(sql`${medicalRecords.id} = ${id} AND ${medicalRecords.patientId} = ${patientId}`);
    return (result.rowCount || 0) > 0;
  }

  async getSosContracts(patientId: number): Promise<SosContract[]> {
    const { db } = await import('./db');
    return await db.select().from(sosContracts).where(eq(sosContracts.patientId, patientId));
  }

  async getSosContractsByDoctor(doctorId: number): Promise<SosContract[]> {
    const { db } = await import('./db');
    return await db.select().from(sosContracts).where(eq(sosContracts.doctorId, doctorId));
  }

  async getSosContract(id: number): Promise<SosContract | undefined> {
    const { db } = await import('./db');
    const [contract] = await db.select().from(sosContracts).where(eq(sosContracts.id, id));
    return contract;
  }

  async createSosContract(contractData: InsertSosContract): Promise<SosContract> {
    const { db } = await import('./db');
    const [contract] = await db.insert(sosContracts).values(contractData).returning();
    return contract;
  }

  async updateSosContract(id: number, contractData: Partial<SosContract>): Promise<SosContract | undefined> {
    const { db } = await import('./db');
    const [updated] = await db.update(sosContracts)
      .set({ ...contractData, updatedAt: new Date() })
      .where(eq(sosContracts.id, id))
      .returning();
    return updated;
  }

  async activateSosContract(id: number): Promise<SosContract | undefined> {
    return await this.updateSosContract(id, { isActive: true });
  }

  async deactivateSosContract(id: number): Promise<SosContract | undefined> {
    return await this.updateSosContract(id, { isActive: false });
  }
}

// Temporarily using MemStorage due to database endpoint issues
export const storage = new MemStorage();