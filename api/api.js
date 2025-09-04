import axios from 'axios';

const API_BASE_URL = 'https://api.infolearnplaydata123456.shop'; // 실제 주소로 변경하세요

export const fetchUserInfo = async (email) => {
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(`${API_BASE_URL}/user/userInfo`, {
      params: { email },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('유저 정보 조회 실패', error);
    throw error;
  }
};
