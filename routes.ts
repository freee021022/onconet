import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { z } from "zod";
import {
  insertUserSchema,
  insertForumPostSchema,
  insertForumCommentSchema,
  insertSecondOpinionRequestSchema,
  insertMessageSchema,
  insertMedicalRecordSchema,
  insertSosContractSchema,
} from "@shared/schema";
import { geocodeAddress } from "./geocoding";

export async function registerRoutes(app: Express): Promise<Server> {
  // Geocoding route
  app.post("/api/geocode", async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }
      
      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Google Maps API key not configured" });
      }
      
      const result = await geocodeAddress(address, apiKey);
      if (result) {
        return res.json(result);
      } else {
        return res.status(404).json({ message: "Address not found" });
      }
    } catch (error) {
      console.error('Geocoding API error:', error);
      return res.status(500).json({ message: "Geocoding service error" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const user = await storage.createUser(userData);
      
      // If it's a pharmacy registration, log success
      if (userData.userType === 'pharmacy') {
        console.log('Pharmacy user created successfully:', user.username);
      }
      
      // Store user ID in session for immediate login after registration
      (req as any).session = (req as any).session || {};
      (req as any).session.userId = user.id;
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error", details: (error as Error).message });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user ID in session for future requests
      (req as any).session = (req as any).session || {};
      (req as any).session.userId = user.id;
      
      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/check", async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      if (session) {
        session.userId = null;
      }
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Update user by ID
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/doctors", async (_req: Request, res: Response) => {
    try {
      const doctors = await storage.getDoctors();
      
      // Remove passwords
      const doctorsWithoutPasswords = doctors.map(doctor => {
        const { password, ...doctorWithoutPassword } = doctor;
        return doctorWithoutPassword;
      });
      
      return res.status(200).json(doctorsWithoutPasswords);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return res.status(500).json({ message: "Server error", details: (error as Error).message });
    }
  });

  // Get doctors available for second opinion
  app.get("/api/doctors/second-opinion", async (_req: Request, res: Response) => {
    try {
      const doctors = await storage.getDoctors();
      
      // Filter only doctors available for second opinion
      const availableDoctors = doctors.filter(doctor => doctor.availableForSecondOpinion);
      
      // Remove passwords
      const doctorsWithoutPasswords = availableDoctors.map(doctor => {
        const { password, ...doctorWithoutPassword } = doctor;
        return doctorWithoutPassword;
      });
      
      return res.status(200).json(doctorsWithoutPasswords);
    } catch (error) {
      console.error('Error fetching second opinion doctors:', error);
      return res.status(500).json({ message: "Server error", details: (error as Error).message });
    }
  });

  // Get online users (removed realtime functionality)
  app.get("/api/users/online", async (req: Request, res: Response) => {
    try {
      // Return empty array since realtime functionality is removed
      return res.json([]);
    } catch (error) {
      console.error('Get online users error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Forum routes
  app.get("/api/forum/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getForumCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/forum/posts", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let posts;
      if (categoryId) {
        posts = await storage.getForumPostsByCategory(categoryId);
      } else {
        posts = await storage.getForumPosts();
      }
      
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/forum/posts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Get post author
      const author = await storage.getUser(post.userId);
      
      // Get post category
      const categories = await storage.getForumCategories();
      const category = categories.find(cat => cat.id === post.categoryId);
      
      // Increment view count
      await storage.incrementPostViewCount(postId);
      
      const comments = await storage.getForumCommentsByPost(postId);
      
      // Get comment authors
      const commentsWithAuthors = await Promise.all(
        comments.map(async (comment) => {
          const commentAuthor = await storage.getUser(comment.userId);
          return { ...comment, author: commentAuthor };
        })
      );
      
      const postWithAuthor = { 
        ...post, 
        author,
        categoryName: category?.name || 'Unknown'
      };
      
      return res.status(200).json({ 
        post: postWithAuthor, 
        comments: commentsWithAuthors 
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/forum/posts", async (req: Request, res: Response) => {
    try {
      // Check authentication
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate the body without userId since we get it from session  
      const bodyValidation = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        categoryId: z.number()
      }).parse(req.body);
      
      const postData = {
        ...bodyValidation,
        userId: userId
      };
      const post = await storage.createForumPost(postData);
      
      return res.status(201).json(post);
    } catch (error) {
      console.error('Forum post creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/forum/comments", async (req: Request, res: Response) => {
    try {
      const commentData = insertForumCommentSchema.parse(req.body);
      const comment = await storage.createForumComment(commentData);
      
      return res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Second Opinion routes
  app.get("/api/second-opinion/requests", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : undefined;
      
      let requests;
      if (patientId) {
        requests = await storage.getSecondOpinionRequestsByPatient(patientId);
      } else if (doctorId) {
        requests = await storage.getSecondOpinionRequestsByDoctor(doctorId);
      } else {
        requests = await storage.getSecondOpinionRequests();
      }
      
      return res.status(200).json(requests);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/second-opinion/requests", async (req: Request, res: Response) => {
    try {
      const requestData = insertSecondOpinionRequestSchema.parse(req.body);
      const request = await storage.createSecondOpinionRequest(requestData);
      return res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/second-opinion/requests/:id/status", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(requestId) || !status) {
        return res.status(400).json({ message: "Invalid request ID or status" });
      }
      
      const updatedRequest = await storage.updateSecondOpinionRequestStatus(requestId, status);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      return res.status(200).json(updatedRequest);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Messaging routes
  app.get("/api/messages", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const messages = await storage.getMessages(userId);
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/messages/conversation", async (req: Request, res: Response) => {
    try {
      const user1Id = req.query.user1Id ? parseInt(req.query.user1Id as string) : undefined;
      const user2Id = req.query.user2Id ? parseInt(req.query.user2Id as string) : undefined;
      
      if (!user1Id || !user2Id) {
        return res.status(400).json({ message: "Both user IDs required" });
      }
      
      const conversation = await storage.getConversation(user1Id, user2Id);
      return res.status(200).json(conversation);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/api/messages/:id/read", async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      await storage.markMessageAsRead(messageId);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Pharmacy routes
  app.get("/api/pharmacies", async (req: Request, res: Response) => {
    try {
      const region = req.query.region as string | undefined;
      const city = req.query.city as string | undefined;
      const specialization = req.query.specialization as string | undefined;
      
      const pharmacies = await storage.getPharmacies();
      
      return res.status(200).json(pharmacies);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Testimonial routes
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      return res.status(200).json(testimonials);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Medical Records routes (only for patients)
  app.get("/api/medical-records", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID required" });
      }

      const records = await storage.getMedicalRecords(patientId);
      return res.status(200).json(records);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/medical-records/:id", async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (isNaN(recordId) || !patientId) {
        return res.status(400).json({ message: "Invalid record ID or patient ID required" });
      }

      const record = await storage.getMedicalRecord(recordId, patientId);
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      return res.status(200).json(record);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/medical-records", async (req: Request, res: Response) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid medical record data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/medical-records/:id", async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const patientId = req.body.patientId;
      
      if (isNaN(recordId) || !patientId) {
        return res.status(400).json({ message: "Invalid record ID or patient ID required" });
      }

      const updatedRecord = await storage.updateMedicalRecord(recordId, patientId, req.body);
      if (!updatedRecord) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      return res.status(200).json(updatedRecord);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/medical-records/:id", async (req: Request, res: Response) => {
    try {
      const recordId = parseInt(req.params.id);
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (isNaN(recordId) || !patientId) {
        return res.status(400).json({ message: "Invalid record ID or patient ID required" });
      }

      const deleted = await storage.deleteMedicalRecord(recordId, patientId);
      if (!deleted) {
        return res.status(404).json({ message: "Medical record not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // SOS Contract routes
  app.get("/api/sos-contracts", async (req: Request, res: Response) => {
    try {
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : undefined;
      
      let contracts;
      if (patientId) {
        contracts = await storage.getSosContracts(patientId);
      } else if (doctorId) {
        contracts = await storage.getSosContractsByDoctor(doctorId);
      } else {
        return res.status(400).json({ message: "Patient ID or Doctor ID required" });
      }

      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/sos-contracts/:id", async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }

      const contract = await storage.getSosContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "SOS contract not found" });
      }

      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/sos-contracts", async (req: Request, res: Response) => {
    try {
      const contractData = insertSosContractSchema.parse(req.body);
      const contract = await storage.createSosContract(contractData);
      return res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid SOS contract data", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/sos-contracts/:id/activate", async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }

      const activatedContract = await storage.activateSosContract(contractId);
      if (!activatedContract) {
        return res.status(404).json({ message: "SOS contract not found" });
      }

      return res.status(200).json(activatedContract);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/sos-contracts/:id/deactivate", async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }

      const deactivatedContract = await storage.deactivateSosContract(contractId);
      if (!deactivatedContract) {
        return res.status(404).json({ message: "SOS contract not found" });
      }

      return res.status(200).json(deactivatedContract);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Config routes
  app.get("/api/config/google-maps", (_req: Request, res: Response) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
  });

  // User profile routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Doctor appointment routes
  app.get('/api/doctors/:id/appointments', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }
      
      const sampleAppointments = [
        {
          id: 1,
          doctorId,
          appointmentDate: '2025-01-27',
          appointmentTime: '09:00',
          duration: 30,
          status: 'available'
        },
        {
          id: 2,
          doctorId,
          appointmentDate: '2025-01-27',
          appointmentTime: '09:30',
          duration: 30,
          status: 'booked',
          patientName: 'Maria Bianchi'
        }
      ];
      
      res.json(sampleAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  // Doctor reviews routes
  app.get('/api/doctors/:id/reviews', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
      }
      
      const sampleReviews = [
        {
          id: 1,
          rating: 5,
          comment: 'Medico eccellente, molto professionale.',
          patientName: 'Maria G.',
          createdAt: '2025-01-20T10:00:00Z'
        }
      ];
      
      res.json(sampleReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
