import { api } from './axiosInstance';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response?.data?.success) {
      return response?.data;
    } else {
      console.error('Failed to register user:', response?.data.message);
      return {
        success: false,
        message: response?.data.message,
      };
    }
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);

      localStorage.setItem('token', response?.data.token);
      return response; 
 
  } catch (error) {
    console.error('Error logging in:', error);
    return error
  }
};

export const getKeychainChallenge = async (username) => {
  try {
    const response = await api.get('/auth/keychain-challenge', {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Keychain challenge:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get login challenge',
    };
  }
};

export const loginWithKeychainApi = async ({ username, challenge, signature }) => {
  try {
    const response = await api.post('/auth/keychain-login', { username, challenge, signature });
    if (response?.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  } catch (error) {
    console.error('Error in Keychain login:', error);
    return error;
  }
};

export const linkHiveKeychainApi = async ({ username, challenge, signature }) => {
  try {
    const response = await api.post('/auth/link-hive-keychain', { username, challenge, signature });
    return response.data;
  } catch (error) {
    console.error('Error linking Hive Keychain:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to link Hive Keychain',
    };
  }
};

