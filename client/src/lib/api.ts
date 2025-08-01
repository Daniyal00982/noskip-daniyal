// API configuration for Vercel deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app' 
  : 'http://localhost:5000';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Goal API functions
export const goalApi = {
  getAllGoals: () => apiRequest('/api/goals'),
  getGoal: (id: string) => apiRequest(`/api/goals/${id}`),
  createGoal: (data: any) => apiRequest('/api/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateGoal: (id: string, data: any) => apiRequest(`/api/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteGoal: (id: string) => apiRequest(`/api/goals/${id}`, {
    method: 'DELETE',
  }),
};

// Streak API functions
export const streakApi = {
  getStreak: (goalId: string) => apiRequest(`/api/streaks/${goalId}`),
  completeStreak: (goalId: string) => apiRequest(`/api/streaks/${goalId}/complete`, {
    method: 'POST',
  }),
};