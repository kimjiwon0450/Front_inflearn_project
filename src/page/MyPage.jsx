import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/TokenContext';
import MyTabBar from './MyTabBar';
import { API_BASE_URL, USER } from '../configs/host-config';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { token, logout, role } = useAuth();

  const isKakaoUser = localStorage.getItem('KAKAO') === 'KAKAO';

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // url 직접 기재하지 말아주세요. 배포시 하나하나 다 찾아서 변경하는 일이 없어야 합니다.
        const res = await axios.get(`${API_BASE_URL}${USER}/myinfo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(res.data.result);
      } catch (error) {
        console.error('유저 정보를 불러오는 중 오류:', error);
      }
    };

    fetchUserInfo();
  }, [token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}${USER}/password`,
        {
          email: userInfo.email,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert('비밀번호가 변경되었습니다.');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
      setErrorMsg('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('KAKAO'); // ✅ 카카오 정보 제거
    navigate('/login');
  };

  if (!userInfo) return <Typography>로딩 중...</Typography>;

  return (
    <>
      <Grid container justifyContent='center'>
        <Grid item xs={12} sm={8} md={6}>
          <Card sx={{ mt: 5 }}>
            <CardHeader title='마이페이지' sx={{ textAlign: 'center' }} />
            <CardContent>
              <Typography variant='h6'>사용자 정보</Typography>
              <Typography>Email: {userInfo.email}</Typography>
              <Typography>이름: {userInfo.username}</Typography>
              <Typography>
                역할:
                {userInfo.role === 'USER'
                  ? ' 학생'
                  : userInfo.role === 'ADMIN'
                  ? ' 강사'
                  : ''}
              </Typography>
              {/* ✅ role이 USER일 때만 '강사로 전환' 버튼 보이기 */}
              {userInfo.role === 'USER' && (
                <Box mt={3} display='flex' justifyContent='center'>
                  <Button
                    variant='contained'
                    color='secondary'
                    sx={{ width: '50%' }}
                    onClick={async () => {
                      try {
                        const response = await axios.get(
                          `${API_BASE_URL}${USER}/change-role`,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          },
                        );
                        console.log(response);

                        alert(
                          '강사로 전환이 완료되었습니다. 다시 로그인해주시기 바랍니다.',
                        );
                        logout();
                        localStorage.removeItem('KAKAO');
                        navigate('/login');
                      } catch (error) {
                        console.error('강사 전환 실패:', error);
                        alert('강사 전환에 실패했습니다.');
                      }
                    }}
                  >
                    강사로 전환
                  </Button>
                </Box>
              )}
              {/* ✅ 카카오 사용자가 아닐 때만 비밀번호 변경 폼 표시 */}
              {!isKakaoUser ? (
                <Box component='form' onSubmit={handlePasswordChange} mt={4}>
                  <Typography variant='h6'>비밀번호 변경</Typography>
                  <TextField
                    label='새 비밀번호'
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    margin='normal'
                  />
                  <TextField
                    label='비밀번호 확인'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    margin='normal'
                  />
                  {errorMsg && (
                    <Typography color='error' variant='body2'>
                      {errorMsg}
                    </Typography>
                  )}
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    비밀번호 변경
                  </Button>
                </Box>
              ) : (
                <Typography sx={{ mt: 4 }} color='text.secondary'>
                  카카오 로그인 사용자는 비밀번호를 변경할 수 없습니다.
                </Typography>
              )}

              <Box mt={3}>
                <Button
                  variant='outlined'
                  color='secondary'
                  fullWidth
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <MyTabBar userRole={role} userId={userInfo.userId} />
    </>
  );
};

export default MyPage;
