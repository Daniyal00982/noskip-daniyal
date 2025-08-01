// API configuration for development and production
const API_BASE_URL = import.meta.env.PROD 
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

  console.log('Making API request to:', url, 'with options:', { ...defaultOptions, ...options });

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    console.log('API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
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