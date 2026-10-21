import { api } from './axiosInstance';

export const confirmDeposit = async (depositId) => {
    const adminToken = localStorage.getItem('token');
  try {
    const config = {
      headers: {
        Authorization: `${adminToken}`,
      },
    };

    const response = await api.put(`/deposits/confirm/${depositId}`, null, config);
    return response.data;
  } catch (error) {
    console.error('Error confirming deposit:', error);
    throw error;
  }
};

export const getAllDeposits = async () => {
    const adminToken = localStorage.getItem('token');
    try {
      const config = {
        headers: {
          Authorization: `${adminToken}`, 
        },
      };
  
      const response = await api.get('/deposits', config);
      return response.data;
    } catch (error) {
      console.error('Error getting deposits:', error);
      throw error;
    }
  };

export const cancelDeposit = async (depositId) => {
  const adminToken = localStorage.getItem('token');
  try {
    const config = {
      headers: {
        Authorization: `${adminToken}`,
      },
    };
    const response = await api.put(`/deposits/cancel/${depositId}`, null, config);
    return response.data;
  } catch (error) {
    console.error('Error canceling deposit request:', error);
    throw error;
  }
};

export const confirmWithdrawal = async (withdrawalId) => {
  try {
    const authToken = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `${authToken}`,
      },
    };

    const response = await api.put(`/withdrawals/confirm/${withdrawalId}`, null, config);
    return response.data;
  } catch (error) {
    console.error('Error confirming withdrawal:', error);
    throw error;
  }
};

export const getAllWithdrawals = async () => {
  try {
    const authToken = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `${authToken}`,
      },
    };

    const response = await api.get('/withdrawals', config);
    return response.data;
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    throw error;
  }
};

export const cancelWithdrawal = async (withdrawalId) => {
  try {
    const authToken = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `${authToken}`,
      },
    };

    const response = await api.put(`/withdrawals/cancel/${withdrawalId}`, null, config);
    return response.data;
  } catch (error) {
    console.error('Error canceling withdrawal:', error);
    throw error;
  }
};

export const updateRole = async (email, role) => {
  try {
    const authToken = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `${authToken}`,
      },
    };

    const body = {
      email: email,
      role: role
    };

    const response = await api.put(`/auth/update-role`, body, config);
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
