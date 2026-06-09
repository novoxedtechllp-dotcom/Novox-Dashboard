export const apiClient = async (endpoint, options = {}) => {
  const userInfoStr = sessionStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch (e) {
      // JSON parse failed
    }
    throw new Error(errorMsg);
  }

  return response.json();
};
