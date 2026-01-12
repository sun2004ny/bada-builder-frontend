const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://bada-builder-backend.onrender.com/api';

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem('token');
};

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// Helper function for file upload headers
const getFileHeaders = (includeAuth = true) => {
    const headers = {};

    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

// API request wrapper
const apiRequest = async(endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getHeaders(options.includeAuth !== false),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// File upload helper
const uploadFile = async(endpoint, formData, includeAuth = true, method = 'POST') => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getFileHeaders(includeAuth);

    try {
        console.log('Uploading file to:', url);
        const response = await fetch(url, {
            method,
            headers,
            body: formData,
        });

        console.log('Upload response status:', response.status, response.statusText);
        console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

        // Get response text once (can only be called once)
        const responseText = await response.text();
        console.log('Upload response text:', responseText ? responseText.substring(0, 200) : '(empty)');

        let data = {};

        // Try to parse as JSON if there's content
        if (responseText && responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.warn('Response is not JSON, treating as text:', responseText.substring(0, 100));
                // If not JSON, create a data object with the text
                data = {
                    message: responseText,
                    raw: responseText,
                    success: response.ok
                };
            }
        }

        if (!response.ok) {
            const errorMessage = data.error ||
                data.message ||
                data.raw ||
                `Upload failed with status ${response.status}: ${response.statusText}`;
            console.error('Upload failed:', errorMessage);
            throw new Error(errorMessage);
        }

        console.log('Upload successful, data:', data);
        return data;
    } catch (error) {
        console.error('Upload Error:', error);
        // If it's already an Error object, throw it as is
        if (error instanceof Error) {
            throw error;
        }
        // Otherwise wrap it
        throw new Error(error.message || 'Upload failed');
    }
};

// ==================== AUTH API ====================
export const authAPI = {
    register: async(userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            includeAuth: false,
        });
    },

    login: async(email, password) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            includeAuth: false,
        });

        // Store token
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async() => {
        return apiRequest('/auth/me');
    },

    updateProfile: async(profileData) => {
        return apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },
};

// ==================== USERS API ====================
export const usersAPI = {
    uploadProfilePhoto: async(file) => {
        // Validate file
        if (!file || !(file instanceof File)) {
            throw new Error('Invalid file provided');
        }

        const formData = new FormData();
        formData.append('photo', file);

        console.log('Uploading profile photo:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        try {
            const response = await uploadFile('/users/profile-photo', formData);
            console.log('Profile photo upload response:', response);
            return response;
        } catch (error) {
            console.error('Profile photo upload error:', error);
            throw error;
        }
    },

    getStats: async() => {
        return apiRequest('/users/stats');
    },
};

// ==================== PROPERTIES API ====================
export const propertiesAPI = {
        getAll: async(filters = {}) => {
                const queryParams = new URLSearchParams();
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                        queryParams.append(key, filters[key]);
                    }
                });
                const queryString = queryParams.toString();
                return apiRequest(`/properties${queryString ? `?${queryString}` : ''}`, {
      includeAuth: false,
    });
  },

  getById: async (id) => {
    return apiRequest(`/properties/${id}`, {
      includeAuth: false,
    });
  },

  create: async (propertyData, images = []) => {
    const formData = new FormData();
    
    // Append property data
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile('/properties', formData);
  },

  update: async (id, propertyData, images = []) => {
    const formData = new FormData();
    
    // Append property data
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Append images if provided
    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile(`/properties/${id}`, formData, true, 'PUT');
  },

  delete: async (id) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  getMyProperties: async () => {
    return apiRequest('/properties/user/my-properties');
  },
};

// ==================== LEADS API ====================
export const leadsAPI = {
  create: async (leadData) => {
    return apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
      includeAuth: false,
    });
  },
};

// ==================== BOOKINGS API ====================
export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  verifyPayment: async (paymentData) => {
    return apiRequest('/bookings/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getMyBookings: async () => {
    return apiRequest('/bookings/my-bookings');
  },

  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },
};

// ==================== SUBSCRIPTIONS API ====================
export const subscriptionsAPI = {
  getPlans: async () => {
    return apiRequest('/subscriptions/plans', {
      includeAuth: false,
    });
  },

  createOrder: async (planId) => {
    return apiRequest('/subscriptions/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  },

  verifyPayment: async (paymentData) => {
    return apiRequest('/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getStatus: async () => {
    return apiRequest('/subscriptions/status');
  },
};

// ==================== LIVE GROUPING API ====================
export const liveGroupingAPI = {
  getAll: async () => {
    return apiRequest('/live-grouping', {
      includeAuth: false,
    });
  },

  getById: async (id) => {
    return apiRequest(`/live-grouping/${id}`, {
      includeAuth: false,
    });
  },

  create: async (propertyData, images = []) => {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else if (typeof propertyData[key] === 'object') {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile('/live-grouping', formData);
  },

  update: async (id, propertyData, images = []) => {
    const formData = new FormData();
    
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined && propertyData[key] !== null) {
        if (Array.isArray(propertyData[key])) {
          propertyData[key].forEach(item => formData.append(key, item));
        } else if (typeof propertyData[key] === 'object') {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    images.forEach(image => {
      formData.append('images', image);
    });

    return uploadFile(`/live-grouping/${id}`, formData, true, 'PUT');
  },

  join: async (id) => {
    return apiRequest(`/live-grouping/${id}/join`, {
      method: 'PATCH',
    });
  },
};

// ==================== COMPLAINTS API ====================
export const complaintsAPI = {
  create: async (complaintData, mediaFiles = []) => {
    const formData = new FormData();
    
    Object.keys(complaintData).forEach(key => {
      if (complaintData[key] !== undefined && complaintData[key] !== null) {
        formData.append(key, complaintData[key]);
      }
    });

    mediaFiles.forEach(file => {
      formData.append('media', file);
    });

    return uploadFile('/complaints', formData, false);
  },

  getMyComplaints: async () => {
    return apiRequest('/complaints/my-complaints');
  },

  getById: async (id) => {
    return apiRequest(`/complaints/${id}`);
  },
};

export default {
  authAPI,
  usersAPI,
  propertiesAPI,
  leadsAPI,
  bookingsAPI,
  subscriptionsAPI,
  liveGroupingAPI,
  complaintsAPI,
};