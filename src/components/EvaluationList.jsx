import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  IconButton,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/TokenContext';
import { API_BASE_URL, EVAL } from '../configs/host-config';

const EvaluationList = ({ courseId, onEvaluationChange }) => {
  const navigate = useNavigate();
  const { token, isLoggedIn } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [myEval, setMyEval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedRating, setEditedRating] = useState(0);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${EVAL}/course-all-eval/${courseId}`,
      );

      const resDto = response.data;

      if (resDto.statusCode === 200) {
        setEvaluations(resDto.result);
      } else {
        setError('평가 정보를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      if (err.status === 400) {
        setMyEval(null);
      } else {
        setError('서버 요청 중 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEval = async (courseId, token) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}${EVAL}/my-eval/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const resDto = response.data;

      console.log(response);

      if (resDto.statusCode === 200) {
        setMyEval(resDto);
      } else {
        setError('나의 평가 정보를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      if (err.status === 400) {
        setMyEval(null);
      } else {
        setError('서버 요청 중 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanCreateEval = async (courseId, token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${EVAL}/can-create/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.status === 202; // 평가 가능 여부 반환
    } catch (error) {
      if (error.response?.status === 403) {
        return false; // 평가 불가능
      }
      throw error; // 기타 오류는 상위에서 처리
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}${EVAL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('평가 삭제가 완료되었습니다.');
      fetchEvaluations();
      onEvaluationChange?.(); // 콜백 호출로 평점 다시 가져오기
    } catch (err) {
      if (err.response?.status === 403) {
        alert('삭제 권한이 없습니다.');
        return false; // 삭제 불가능
      } else if (err.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        return false;
      } else {
        alert('삭제 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  const handleModify = async (id) => {
    try {
      await axios.post(
        `${API_BASE_URL}${EVAL}/modify`,
        {
          evalId: id,
          content: editedContent,
          rating: editedRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEditingId(null);
      alert('평가 수정이 완료되었습니다.');
      fetchEvaluations();
      onEvaluationChange?.(); // 콜백 호출로 평점 다시 가져오기
    } catch (err) {
      if (err.response?.status === 403) {
        alert('수정 권한이 없습니다.');
        return false; // 수정 불가능
      } else if (err.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        return false;
      } else {
        alert('수정 중 오류가 발생했습니다.');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (!courseId) return;

    fetchEvaluations();
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !token) return;

    fetchMyEval(courseId, token);
  }, [courseId, token]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* 평가 등록 버튼 */}
      <Box display='flex' justifyContent='center' sx={{ mt: 3, mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={async () => {
            if (!isLoggedIn) {
              alert('로그인을 해주세요.');
              return;
            }

            try {
              const canCreate = await checkCanCreateEval(courseId, token);
              if (canCreate) {
                navigate('/evaluation/create', {
                  state: { courseId },
                });
              } else {
                alert('해당 강의를 구매하지 않아 평가를 작성할 수 없습니다.');
              }
            } catch (err) {
              alert('평가 등록 가능 여부 확인 중 오류가 발생했습니다.');
              console.error(err);
            }
          }}
        >
          평가 등록
        </Button>
      </Box>

      {/* 평가 리스트 */}
      {evaluations.length === 0 && (
        <Box
          textAlign='center'
          sx={{ mb: 2, fontSize: '1.1rem', color: '#555' }}
        >
          등록된 평가가 없습니다.
        </Box>
      )}
      {/* 나의 평가 렌더링 */}
      {myEval && myEval.result && (
        <Card sx={{ mb: 3, mx: 2, border: '2px solid #1976d2' }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 1 }}>
              나의 평가
            </Typography>
            {editingId === myEval.result.evalId ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Rating
                  value={editedRating}
                  onChange={(e, newValue) => setEditedRating(newValue)}
                />
                <Box mt={2} display='flex' gap={1} justifyContent='flex-end'>
                  <Button variant='outlined' onClick={() => setEditingId(null)}>
                    취소
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => handleModify(myEval.result.evalId)}
                  >
                    저장
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant='body1' sx={{ mt: 1, mb: 1 }}>
                  {myEval.result.content}
                </Typography>
                <Rating value={myEval.result.rating} readOnly />
                <IconButton
                  onClick={() => {
                    setEditingId(myEval.result.evalId);
                    setEditedContent(myEval.result.content);
                    setEditedRating(myEval.result.rating);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 48 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(myEval.result.evalId)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {/* --- 여기가 추가되는 부분 --- */}
      {evaluations.length > 0 && (
        <Box
          sx={{
            borderTop: '2px solid black',
            mt: 4,
            mb: 2,
            px: 2,
            pt: 1,
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            모든 평가
          </Typography>
        </Box>
      )}

      {evaluations.map((evaluation) => (
        <Card
          key={evaluation.evalId}
          sx={{ mb: 2, mx: 2, position: 'relative' }}
        >
          <CardContent>
            {editingId === evaluation.evalId ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Rating
                  value={editedRating}
                  onChange={(e, newValue) => setEditedRating(newValue)}
                />
                <Box mt={2} display='flex' gap={1} justifyContent='flex-end'>
                  <Button variant='outlined' onClick={() => setEditingId(null)}>
                    취소
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => handleModify(evaluation.evalId)}
                  >
                    저장
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant='subtitle1' color='text.secondary'>
                  사용자 {evaluation.userId}
                </Typography>
                <Typography variant='body1' sx={{ mt: 1, mb: 1 }}>
                  {evaluation.content}
                </Typography>
                <Rating value={evaluation.rating} readOnly />
                <IconButton
                  onClick={() => {
                    setEditingId(evaluation.evalId);
                    setEditedContent(evaluation.content);
                    setEditedRating(evaluation.rating);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 48 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(evaluation.evalId)}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EvaluationList;
