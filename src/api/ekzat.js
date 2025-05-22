import {api} from './axiosInstance';

const authToken = localStorage.getItem('token');

export const createMerchant = async (merchantData) => {
  try {
    const response = await api.post('/merchant/apply', merchantData, {
      headers: {
        Authorization: `${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllMerchants = async () => {
  try {
    const response = await api.get('/merchant', {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getMerchantById = async () => {
  try {
    const response = await api.get(`/merchant/single`, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRandomMerchant = async () => {
  try {
    const response = await api.get('/merchant/generate/account', {
        headers: {
            Authorization: authToken,
        },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

///will handle this later
export const updateMerchant = async (id, updateData) => {
  try {
    const response = await api.put(`/merchant/${id}`, updateData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
////////

export const deleteMerchant = async (id) => {
  try {
    const response = await api.delete(`/merchant/${id}`, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const approveMerchant = async (id) => {
  try {
    const response = await api.patch(`/merchant/${id}/approve`, null, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const disapproveMerchant = async (id) => {
  try {
    const response = await api.patch(`/merchant/${id}/cancel`, null, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

//////////WITHDRAWAL
export const processHiveWithdrawal = async (withdrawalData) => {
  try {
    const response = await api.post('withdrawals/hive', withdrawalData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const requestToken = async () => {
  try {
    const response = await api.post('/withdrawals/request-token', {}, {
      headers: {
        Authorization: authToken,
      },
    });    
    return response.data;
  } catch (error) {
    console.log(error)
  }
}
export const requestPasswordResetToken = async (email) => {
  try {
    const response = await api.post('/auth/password-reset-token', {email}, {
      headers: {
        Authorization: authToken,
      },
    });    
    return response.data;
  } catch (error) {
    console.log(error)
  }
}

export const resetPassword = async (data) => {
  try {
    const response = await api.post('/auth/password-reset', data, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

/////////DEPOSIT
export const createNairaDepositRequest = async (depositData) => {
  try {
    const response = await api.post('deposits/fiat/deposit', depositData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error)
  }
};

//////BUYING AND SELLING

export const buyAsset = async (assetData) => {
  try {
    const response = await api.post(`/transactions/buy`, assetData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error buying asset:', error);
    throw error.response?.data || { message: 'Error buying asset' };
  }
};

// Function to sell an asset
export const sellAsset = async (assetData) => {
  try {
    const response = await api.post(`/transactions/sell`, assetData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error selling asset:', error);
    throw error.response?.data || { message: 'Error selling asset' };
  }
};

///// calcultae transaction fee
export const calculateTransaction = async (conversionData) => {
  try {
    
    const response = await api.get('/transactions/fee', {
      headers: {
        Authorization: authToken,
      },
      params: conversionData,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred during the transaction calculation');
  }
};

//////ADD BANK ACCOUNT
export const addBankAccount = async (accountDetails) => {
  try {
    const response = await api.post('/auth/add-account', accountDetails, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      }
    });
  } catch (error) {
    console.error('Error adding bank account:', error);
  }
};

//////DeLETE BANK ACCOUNT
export const deleteBankAccount = async (accountId) => {
  try {
    const response = await api.delete('/auth/delete-account', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      data: { accountId }
    });
  } catch (error) {
    console.error('Error deleting bank account:', error);
  }
};


////////FIAT WITHDRAWAL ACTIONS
export const requestFiatWithdrawal = async (withdrawalData) => {
  try {
    const response = await api.post('/withdrawals/fiat/init', withdrawalData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error requesting fiat withdrawal:', error);
    throw error.response.data;
  }
};

export const confirmFiatWithdrawal = async (withdrawalId, amount) => {
  const authToken = localStorage.getItem('token');
  try {
    const response = await api.post('/withdrawals/fiat/confirm', {
      withdrawalId,
      amount
    }, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming fiat withdrawal:', error);
    throw error.response.data;
  }
};

export const cancelFiatWithdrawal = async (withdrawalId, amount) => {
  const authToken = localStorage.getItem('token');
  try {
    const response = await api.post('/withdrawals/fiat/cancel', {
      withdrawalId,
      amount,
    }, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling fiat withdrawal:', error);
    throw error.response.data;
  }
};

export const getAllFiatWithdrawals = async () => {
  const authToken = localStorage.getItem('token');
  try {
    const response = await api.get('/withdrawals/fiat', {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching fiat withdrawals:', error);
    throw error.response.data;
  }
};

///////////////FIAT DEPOSIT ACTIONS
export const getAllFiatDeposits = async () => {
  try {
    const response = await api.get('/deposits/fiat', {
      headers: { Authorization: authToken },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fiat deposits:', error);
    throw error;
  }
};

export const confirmFiatDeposit = async (depositRequestId, sender, receiver, accountNumber, accountHolderName, bankName) => {
  try {
    const response = await api.post(
      '/deposits/fiat/confirm',
      { depositRequestId, sender, receiver, accountNumber, accountHolderName, bankName },
      { headers: { Authorization: authToken } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to confirm fiat deposit:', error);
    throw error;
  }
};

export const cancelFiatDeposit = async (depositRequestId) => {
  try {
    const response = await api.post(
      '/deposits/fiat/cancel',
      { depositRequestId },
      { headers: { Authorization: authToken } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to cancel fiat deposit:', error);
    throw error;
  }
};

export const fiatTransfer = async ({ receiverIdentifier, amount }) => {
  try {
    const response = await api.post('/transactions/fiat-transfer', {
      receiverIdentifier,
      amount,
    }, {
      headers: {
        Authorization: authToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error transferring Naira:', error);
    throw error.response?.data || { message: 'Error transferring Naira' };
  }
};

export const fetchCryptoData = async () => {
  try {
    const response = await api.get('/crypto-data');
    if (response?.data?.success) {
    } else {
      console.error('Failed to fetch data:', response?.data?.message);
    }
    return response;
  } catch (error) {
    console.error('Error fetching data from /crypto-data endpoint:', error);
    return { data: { success: false, message: 'An error occurred while fetching the data.' } };
  }
};

export const addAsset = async (coinId) => {
  try {
    const response = await api.post(
      '/auth/add-asset',
      {
        coinId
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to add asset:', error);
    throw error.response?.data || { message: 'Error adding asset' };
  }
};

/////not needed
export const removeAsset = async (coinId) => {
  try {
    const response = await api.post(
      '/auth/remove-asset',
      {
        coinId
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to add asset:', error);
    throw error.response?.data || { message: 'Error adding asset' };
  }
};

///not needed again i have added all in add asset func
export const generateAddress = async (coinId) => {
  try {
    const response = await api.put(
      '/auth/generate-address',
      {
        coinId
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    console.log('Wallet address generated successfully:');
    return response.data;
  } catch (error) {
    console.error('Failed to generate wallet address:', error.response?.data?.message || error.message);
  }
};

export const getCryptoNewsById = async (id) => {
  try {
    const response = await api.get(`/crypto-data/news/${id}`);
    if (response?.data?.success) {
      return response.data;
    } else {
      console.error('Failed to fetch news item:', response?.data?.message);
      throw new Error(response?.data?.message || 'Failed to fetch news item');
    }
  } catch (error) {
    console.error('Error fetching news item:', error);
    throw error.response?.data || { message: 'An error occurred while fetching the news item.' };
  }
};

export const updateProfile = async (dataToUpdate) => {
  try {
    const response = await api.put(
      '/auth/profile',
        dataToUpdate,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to add asset:', error);
    throw error.response?.data || { message: 'Error adding asset' };
  }
};

/////crypto
export const processCryptoWithdrawal = async (withdrawalData) => {
  try {
    const response = await api.post('blockchain/send', withdrawalData, {
      headers: {
        Authorization: authToken,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

  // Get transaction fees
export const getTransactionFees = async (coinId, fromAddress = null, toAddress = null) => {

  try {
    let response;
      
    if(coinId === "tether" && fromAddress && toAddress) {
       response = await api.get(`/blockchain/fees/${coinId}/${fromAddress}/${toAddress}`, {
          headers: {
              Authorization: `${authToken}`,
          },
      });
    } else {
      response = await api.get(`/blockchain/fees/${coinId}`, {
        headers: {
            Authorization: `${authToken}`,
        },
    });
    }
      return response.data;
  } catch (error) {
      throw error.response.data;
  }
};

export const internalTransfer = async ({ to, amount, currency, memo, withdrawalToken }) => {
  try {
    const response = await api.post(
      '/withdrawals/internal-transfer',
      {
        to,
        amount,
        currency,
        memo,
        withdrawalToken,
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error making internal transfer:', error);
    throw error.response?.data || { message: 'Internal transfer failed' };
  }
};
