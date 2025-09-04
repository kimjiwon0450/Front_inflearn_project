import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, USER } from '../configs/host-config';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [messages, setMessages] = useState({ success: '', error: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetMessages = () => setMessages({ success: '', error: '' });

  const handleSendAuthCode = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!email) {
      setMessages({ error: '이메일을 입력해주세요.' });
      return;
    }
    setLoading(true);
    try {
      // url 직접 기재하지 말아주세요. 배포시 하나하나 다 찾아서 변경하는 일이 없어야 합니다.
      const response = await axios.get(
        `${API_BASE_URL}${USER}/reset-password`,
        { params: { email: email } },
      );
      setMessages({ success: '인증 코드가 이메일로 전송되었습니다.' });
      console.log(response);
      setStep(2);
    } catch (error) {
      setMessages({
        error: '이메일 발송 실패. 로그인된 계정인지 확인해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!authCode) {
      setMessages({ error: '인증 코드를 입력해주세요.' });
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}${USER}/verify-code`, {
        params: {
          email: email,
          code: authCode,
        },
      });
      console.log(res);

      if (res.status === 200) {
        setMessages({ success: '인증 성공. 비밀번호를 재설정해주세요.' });
        setStep(3);
      }
      console.log(res);
    } catch (error) {
      console.log(error);

      setMessages({ error: '인증 코드가 올바르지 않거나 만료되었습니다.' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!newPassword || !confirmPassword) {
      setMessages({ error: '새 비밀번호를 모두 입력해주세요.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessages({ error: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}${USER}/update-password`, {
        email,
        newPassword,
      });
      setMessages({ success: '비밀번호가 성공적으로 변경되었습니다.' });
      navigate('/login');
    } catch (error) {
      setMessages({ error: '비밀번호 변경 실패. 다시 시도해주세요.' });
    }
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={8} md={5}>
        <Card sx={{ mt: 8 }}>
          <CardHeader title='비밀번호 재설정' sx={{ textAlign: 'center' }} />
          <CardContent>
            {loading ? (
              <Alert severity='info' sx={{ mb: 2 }}>
                인증코드 발송중입니다. 잠시만 대기해주세요.
              </Alert>
            ) : (
              <>
                {messages.success && (
                  <Alert severity='success' sx={{ mb: 2 }}>
                    {messages.success}
                  </Alert>
                )}
                {messages.error && (
                  <Alert severity='error' sx={{ mb: 2 }}>
                    {messages.error}
                  </Alert>
                )}
              </>
            )}

            {step === 1 && (
              <Box component='form' onSubmit={handleSendAuthCode}>
                <TextField
                  label='이메일'
                  fullWidth
                  margin='normal'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  인증 코드 받기
                </Button>
              </Box>
            )}

            {step === 2 && (
              <Box component='form' onSubmit={handleVerifyCode}>
                <Typography>이메일: {email}</Typography>
                <TextField
                  label='인증 코드'
                  fullWidth
                  margin='normal'
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  인증 코드 확인
                </Button>
              </Box>
            )}

            {step === 3 && (
              <Box component='form' onSubmit={handleResetPassword}>
                <TextField
                  label='새 비밀번호'
                  fullWidth
                  type='password'
                  margin='normal'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  label='비밀번호 확인'
                  fullWidth
                  type='password'
                  margin='normal'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  비밀번호 재설정
                </Button>
              </Box>
            )}

            <Button
              variant='outlined'
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/login')}
            >
              로그인으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
