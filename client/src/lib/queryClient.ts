import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper functions for API requests
export const forumCategories = {
  getCategories: async () => {
    const response = await fetch('/api/forum/categories', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }
};

export const forumPosts = {
  getPosts: async () => {
    const response = await fetch('/api/forum/posts', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return response.json();
  },
  getPostsByCategory: async (categoryId: number) => {
    const response = await fetch(`/api/forum/posts?categoryId=${categoryId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts by category');
    }
    return response.json();
  },
  getPost: async (postId: number) => {
    const response = await fetch(`/api/forum/posts/${postId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return response.json();
  },
  createPost: async (postData: any) => {
    return apiRequest('POST', '/api/forum/posts', postData);
  },
  createComment: async (commentData: any) => {
    return apiRequest('POST', '/api/forum/comments', commentData);
  }
};

export const secondOpinion = {
  getRequests: async () => {
    const response = await fetch('/api/second-opinion/requests');
    if (!response.ok) {
      throw new Error('Failed to fetch second opinion requests');
    }
    return response.json();
  },
  getRequestsByPatient: async (patientId: number) => {
    const response = await fetch(`/api/second-opinion/requests?patientId=${patientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient requests');
    }
    return response.json();
  },
  getRequestsByDoctor: async (doctorId: number) => {
    const response = await fetch(`/api/second-opinion/requests?doctorId=${doctorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor requests');
    }
    return response.json();
  },
  createRequest: async (requestData: any) => {
    return apiRequest('POST', '/api/second-opinion/requests', requestData);
  },
  updateRequestStatus: async (requestId: number, status: string) => {
    return apiRequest('PATCH', `/api/second-opinion/requests/${requestId}/status`, { status });
  }
};

export const messages = {
  getMessages: async (userId: number) => {
    const response = await fetch(`/api/messages?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },
  getConversation: async (user1Id: number, user2Id: number) => {
    const response = await fetch(`/api/messages/conversation?user1Id=${user1Id}&user2Id=${user2Id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  },
  sendMessage: async (messageData: any) => {
    return apiRequest('POST', '/api/messages', messageData);
  },
  markAsRead: async (messageId: number) => {
    return apiRequest('PATCH', `/api/messages/${messageId}/read`, {});
  }
};

export const pharmacies = {
  getPharmacies: async () => {
    const response = await fetch('/api/pharmacies');
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacies');
    }
    return response.json();
  },
  getPharmaciesByRegion: async (region: string) => {
    const response = await fetch(`/api/pharmacies?region=${encodeURIComponent(region)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacies by region');
    }
    return response.json();
  },
  getPharmaciesByCity: async (city: string) => {
    const response = await fetch(`/api/pharmacies?city=${encodeURIComponent(city)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacies by city');
    }
    return response.json();
  },
  getPharmaciesBySpecialization: async (specialization: string) => {
    const response = await fetch(`/api/pharmacies?specialization=${encodeURIComponent(specialization)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacies by specialization');
    }
    return response.json();
  }
};

export const testimonials = {
  getTestimonials: async () => {
    const response = await fetch('/api/testimonials');
    if (!response.ok) {
      throw new Error('Failed to fetch testimonials');
    }
    return response.json();
  }
};

export const auth = {
  register: async (userData: any) => {
    return apiRequest('POST', '/api/auth/register', userData);
  },
  login: async (credentials: { username: string; password: string }) => {
    return apiRequest('POST', '/api/auth/login', credentials);
  }
};
