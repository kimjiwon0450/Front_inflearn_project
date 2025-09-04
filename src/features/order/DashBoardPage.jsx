import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, COURSE, ORDER } from '../../configs/host-config';

import { useAuth } from '../../context/TokenContext';
import PostCard from '../../components/PostCard';

const DashBoardPage = ({ id }) => {
  const [orderList, setOrderList] = useState([]);

  const navigate = useNavigate();
  const user = useAuth();

  //console.log('user: ', user);

  console.log(id);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let res;
        if (user.role === 'USER') {
          res = await axiosInstance.get(`${API_BASE_URL}${ORDER}/dashboard`);
        } else {
          res = await axiosInstance.post(
            `${API_BASE_URL}${COURSE}/findCourses`,
            { userId: id },
          );
        }
        console.log(res);
        setOrderList(res.data.result);
      } catch (e) {
        console.log('orderlistComponent 에러 발생 ', e);
      }
    };

    fetchOrders();
  }, [user.role]);

  const courseDelete = async (id) => {
    console.log('id', id);

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      let res = await axiosInstance.patch(
        `${API_BASE_URL}${COURSE}/delete/${id}`,
      );
      alert('강의가 삭제되었습니다.');
      // 주문 상태 업데이트
      // 강의 목록 다시 불러오기
      res = await axiosInstance.post(`${API_BASE_URL}${COURSE}/findCourses`, {
        userId: id,
      });
      setOrderList(res.data.result);
    } catch (e) {
      console.log('orderlistComponent 에러 발생 ', e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  console.log(orderList);

  return (
    <>
      <div
        style={{
          width: '60%',
          margin: 'auto',
        }}
      >
        {/* {user.role === 'USER' ? (
          // USER일 경우 질문 목록 렌더링
          <h2>내 학습</h2>
        ) : user.role === 'ADMIN' ? (
          // ADMIN일 경우 강의 생성 버튼 중앙 정렬
          <h2>내 강의</h2>
        ) : null} */}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>번호</TableCell>
                <TableCell>강의명</TableCell>
                {user.role === 'ADMIN' ? (
                  <>
                    {/* <TableCell>강의번호</TableCell> */}
                    {/* <TableCell>강의상태</TableCell> */}
                    <TableCell>수정</TableCell>
                    <TableCell>삭제</TableCell>
                  </>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {orderList.length < 1 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    {user.role === 'USER' ? (
                      // USER일 경우 질문 목록 렌더링
                      <p>학습 중인 강의가 없습니다.</p>
                    ) : user.role === 'ADMIN' ? (
                      <p>등록된 강의가 없습니다.</p>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                orderList.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/info/${order.productId}`)}
                      >
                        {order.productName}
                      </TableCell>
                      {user.role === 'ADMIN' && (
                        <>
                          {/* <TableCell>{order.productId}</TableCell> */}
                          {/* <TableCell>
                            {order.active ? '활성화' : '비활성'}
                          </TableCell> */}

                          <TableCell>
                            <Button
                              variant='outlined'
                              size='small'
                              color='primary'
                              onClick={() =>
                                navigate(`/create/${order.productId}`)
                              }
                              style={{ marginRight: '10px' }}
                            >
                              수정
                            </Button>
                          </TableCell>

                          <TableCell>
                            {order.active && (
                              <Button
                                color='secondary'
                                size='small'
                                onClick={() => courseDelete(order.productId)}
                              >
                                DELETE
                              </Button>
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      {/* 조건부 렌더링 */}
      {user.role === 'USER' ? (
        // USER일 경우 질문 목록 렌더링  약간 수정
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>질문 목록</h2>
        </div>
      ) : user.role === 'ADMIN' ? (
        // ADMIN일 경우
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => navigate('/courseCreate')} // 강의 생성 페이지로 이동
            style={{ marginTop: '30px' }}
          >
            강의 생성
          </Button>
        </div>
      ) : null}

      {/* PostCard와 위쪽 컨텐츠 사이 간격 주기 */}
      <div style={{ marginTop: '60px' }}>
        <PostCard Id={-1} type={'mypage'} />
      </div>
    </>
  );
};

export default DashBoardPage;
