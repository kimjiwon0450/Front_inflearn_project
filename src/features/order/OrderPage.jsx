import {
  Button,
  Checkbox,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react';
import CartContext from '../../context/CartContext';
import axiosInstance from '../../configs/axios-config';
import { API_BASE_URL, ORDER } from '../../configs/host-config';
import { useAuth } from '../../context/TokenContext';
import styles from './OrderPage.module.scss';
import { green } from '@mui/material/colors';

import gitImg from '../../assets/git.png';
import javaImg from '../../assets/java.jpg';
import sqlImg from '../../assets/sql.png';
import linuxImg from '../../assets/Linux.png';
import algorithmImg from '../../assets/algorithm.png';
import jdbcImg from '../../assets/jdbc.png';
import htmlcssImg from '../../assets/html-css.jpg';
import jsImg from '../../assets/js.png';
import reactImg from '../../assets/react.png';
import springImg from '../../assets/spring.jpg';
import PostCard from '../../components/PostCard';
import { useNavigate } from 'react-router-dom';
import kakaopayIcon from '../../assets/payment_icon.png';

const categoryImages = {
  Git: gitImg,
  Java: javaImg,
  SQL: sqlImg,
  Linux: linuxImg,
  Algorithm: algorithmImg,
  JDBC: jdbcImg,
  'HTML/CSS': htmlcssImg,
  JS: jsImg,
  React: reactImg,
  Spring: springImg,
  java: javaImg,
  카테고리: sqlImg,
};

const OrderPage = () => {
  const {
    productsInCart: initialProductsInCart,
    clearCart: onClear,
    forceSelectProductId,
  } = useContext(CartContext);

  const [selectedProducts, setSelectedProducts] = useState(() => {
    const savedSelected = JSON.parse(localStorage.getItem('selectedProducts'));
    return savedSelected || []; // 로컬 스토리지에 선택된 제품이 없다면 빈 배열 반환
  });

  const [productsInCart, setProductsInCart] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem('productsInCart'));
    return savedCart || []; // 로컬 스토리지에 제품이 없다면 빈 배열 반환
  });

  const user = useAuth();

  const navigate = useNavigate();

  console.log('orderpage의 productsInCart: ', productsInCart);

  const clearCart = () => {
    setProductsInCart([]); // 장바구니 상태 비우기
    setSelectedProducts([]); // 선택된 제품 상태 비우기

    localStorage.setItem('productsInCart', JSON.stringify([]));
    localStorage.setItem('selectedProductIds', JSON.stringify([]));

    onClear();
  };

  const deleteCart = () => {
    console.log('deleteCart');
    const updatedCart = productsInCart.filter(
      (product) => !selectedProducts.includes(product.id),
    );
    setProductsInCart(updatedCart); // 장바구니 상태 업데이트
    setSelectedProducts([]); // 선택된 제품 초기화
  };

  // 로컬 스토리지에서 장바구니 상태 불러오기
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('productsInCart')) || [];
    const savedSelected =
      JSON.parse(localStorage.getItem('selectedProductIds')) || [];

    setSelectedProducts(savedSelected);
    setProductsInCart(savedCart);
  }, []);

  // 로컬 스토리지 상태 저장 함수
  const saveCartToLocalStorage = (cart) => {
    localStorage.setItem('productsInCart', JSON.stringify(cart));
  };

  const saveSelectedToLocalStorage = (selected) => {
    localStorage.setItem('selectedProducts', JSON.stringify(selected));
  };

  // 장바구니 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    console.log('로컬스토리지에 저장');
    saveCartToLocalStorage(productsInCart); // 장바구니 상태 업데이트
    saveSelectedToLocalStorage(selectedProducts); // 선택된 제품 상태 업데이트
  }, [productsInCart, selectedProducts]);

  // 체크박스 클릭 시 선택된 제품을 추적
  const handleCheckboxChange = (productId) => {
    const isChecked = selectedProducts.includes(productId);
    console.log(`상품 ID ${productId} 체크 상태: ${isChecked}`);
    // selectedProducts 배열을 업데이트
    setSelectedProducts((prevSelected) => {
      let updatedSelected;

      if (prevSelected.includes(productId)) {
        updatedSelected = prevSelected.filter((id) => id !== productId); // 체크 해제
      } else {
        updatedSelected = [...prevSelected, productId]; // 체크 추가
      }

      // 즉시 로컬스토리지에 저장
      localStorage.setItem(
        'selectedProductIds',
        JSON.stringify(updatedSelected),
      );
      return updatedSelected;
    });
  };

  // 선택 항목 개별 삭제
  const removeProduct = (productId) => {
    console.log('productId는 ', productId);

    // 장바구니에서 해당 제품을 삭제
    const updatedCart = productsInCart.filter(
      (product) => product.id !== productId,
    );
    setProductsInCart(updatedCart); // 장바구니 상태 업데이트

    // 선택된 제품 목록에서도 해당 제품을 삭제
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));
  };

  // 선택된 강의들의 총 가격 계산
  const totalPrice = productsInCart
    .filter((product) => selectedProducts.includes(product.id))
    .reduce((sum, product) => sum + product.price, 0);

  // 백엔드가 달라는 형태로 줘야하니까 그에 맞게 객체를 매핑
  const orderProducts = productsInCart
    .filter((p) => selectedProducts.includes(p.id))
    .map((p) => ({ productId: p.id }));

  const orderCreate = async () => {
    if (!user.token) {
      alert('로그인이 필요합니다!');
      return;
    }

    if (orderProducts.length < 1) {
      alert('구매 선택한 강의가 없습니다!');
      return;
    }

    const yesOrNo = confirm(
      `${orderProducts.length}개의 강의를 신청하시겠습니까?`,
    );

    if (yesOrNo) {
      if (user.role === 'ADMIN') {
        alert('학생만 구매 가능합니다.');
        return;
      }
    } else {
      alert('구매가 취소되었습니다.');
      return;
    }

    try {
      console.log('백엔드로 보낼 데이터 ', orderProducts);

      const res = await axiosInstance.post(
        `${API_BASE_URL}${ORDER}/create`,
        orderProducts,
      );

      // const data = res.json(); -> fetch를 사용했을 때는 데이터를 꺼내는 과정이 있음.
      alert('강의 구매가 완료되었습니다.');
      deleteCart();
    } catch (err) {
      // handleAxiosError(err);
      console.error('강의 구매 실패!: ', err);
    }
  };

  // 카카오페이
  const handleKakaoPay = async () => {
    console.log('카카오페이 버튼 클릭!');

    if (!user.token) {
      alert('로그인이 필요합니다!');
      return;
    }

    if (orderProducts.length < 1) {
      alert('구매 선택한 강의가 없습니다!');
      return;
    }

    const yesOrNo = confirm(
      `${orderProducts.length}개의 강의를 신청하시겠습니까?`,
    );

    if (yesOrNo) {
      if (user.role === 'ADMIN') {
        alert('학생만 구매 가능합니다.');
        return;
      }
    } else {
      alert('구매가 취소되었습니다.');
      return;
    }

    try {
      // 서버에 결제 준비 요청
      const response = await axiosInstance.post(
        `${API_BASE_URL}${ORDER}/pay/ready`,
        orderProducts,
      );

      console.log('이거는 response.data', response.data);

      // if (!response.ok) {
      //   throw new Error('서버 요청 실패');
      // }

      const data = response.data;

      // 카카오페이 결제창 열기
      const popup = window.open(
        data.next_redirect_pc_url,
        'kakao-pay',
        'width=500,height=600,scrollbars=yes,resizable=yes',
      );

      if (!popup) {
        alert('팝업이 차단되었습니다. 브라우저 설정을 확인하세요.');
      }

      window.addEventListener('message', (event) => {
        if (event.data?.type === 'KAKAO_PAY_SUCCESS') {
          console.log('결제 완료 메시지 수신:', event.data.payload);

          // 창 닫힌 후 alert 실행
          setTimeout(() => {
            alert('강의 구매가 완료되었습니다.');
            deleteCart();
            navigate('/');
          }, 300); // 300ms 딜레이
        }
      });
    } catch (error) {
      console.error('결제 요청 중 오류:', error);
      // axios 오류 처리 시, error.response를 통해 상세 정보를 얻을 수 있습니다.
      if (error.response) {
        console.error('서버 응답 데이터:', error.response.data);
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 헤더:', error.response.headers);
      } else if (error.request) {
        // 요청이 전송되었지만 응답을 받지 못했습니다.
        console.error('응답 없음:', error.request);
      } else {
        // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
        console.error('오류 메시지:', error.message);
      }
      alert('결제 요청 중 오류가 발생했습니다.');
    }
  };

  const allSelected = selectedProducts.length === productsInCart.length && productsInCart.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts([]);
      localStorage.setItem('selectedProductIds', JSON.stringify([]));
    } else {
      const allIds = productsInCart.map((p) => p.id);
      setSelectedProducts(allIds);
      localStorage.setItem('selectedProductIds', JSON.stringify(allIds));
    }
  };

  return (
    <Container className={styles.orderPage}>
      <Grid container spacing={2}>
        <Grid item style={{ width: '65%' }}>
          <Typography variant='h5' gutterBottom>
            수강바구니
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            className={styles.cartTable}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1,
                      whiteSpace: 'nowrap',
                      minWidth: '150px'
                    }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={
                        selectedProducts.length > 0 &&
                        selectedProducts.length < productsInCart.length
                      }
                      onChange={toggleSelectAll}
                    />
                    <Typography variant="body1">전체선택</Typography>

                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>

                  <TableCell></TableCell>
                  <TableCell>
                    <Button
                      onClick={deleteCart}
                      color='secondary'
                      variant='outlined'
                      className={styles.clearButton}
                      sx={{
                        cursor: 'pointer',
                        border: '0.0625rem solid rgb(206, 212, 218)',
                        backgroundColor: 'rgb(255, 255, 255)',
                        width: '100px',
                        color: 'rgb(33, 37, 41)',
                        '&:hover': {
                          backgroundColor: '#f8f9fae5',
                        },
                      }}
                    >
                      선택 삭제
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsInCart.map((product) => (
                  <TableRow key={product.id} sx={{ height: '120px' }}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ paddingY: 3, cursor: 'pointer' }}
                      onClick={() => navigate(`/info/${product.id}`)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          width: '100%',
                        }}
                        className='courseHeader'
                      >
                        <img
                          src={
                            categoryImages[product.category] ||
                            '/placeholder.png'
                          }
                          alt={product.category}
                          style={{ width: '100px', height: 'auto' }}
                        />
                        <div
                          className='info'
                          style={{
                            textAlign: 'left',
                          }}
                        >
                          <h2>{product.name}</h2>
                          <p className='subtitle'>{product.description}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => removeProduct(product.id)}
                        size='small'
                      >
                        x
                      </IconButton>
                    </TableCell>
                    <TableCell>₩{product.price.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item style={{ width: '25%' }}>
          <Paper elevation={3} className={styles.summaryBox}>
            <Typography variant='h6' gutterBottom>
              결제 정보
            </Typography>

            <TextField
              label='쿠폰 코드'
              value='coupon'
              onChange={(e) => setCoupon(e.target.value)}
              fullWidth
              margin='normal'
            />

            <TextField
              label='1,000잎 이상 사용'
              type='number'
              value='point'
              onChange={(e) => setPoint(Number(e.target.value))}
              fullWidth
              margin='normal'
            />

            <Button
              fullWidth
              variant='outlined'
              style={{ marginBottom: '1rem' }}
            >
              할인 적용
            </Button>

            <Typography variant='body1' gutterBottom>
              원금액: ₩{totalPrice.toLocaleString()}
            </Typography>
            <Typography variant='body1' gutterBottom>
              할인/포인트: 0
            </Typography>
            <Typography variant='h6' className={styles.totalPrice}>
              총 결제 금액: ₩{totalPrice.toLocaleString()}
            </Typography>

            <Button
              onClick={orderCreate}
              fullWidth
              variant='contained'
              style={{ backgroundColor: '#00c471', color: '#fff' }}
            >
              결제하기
            </Button>
            <Button
              onClick={handleKakaoPay}
              startIcon={
                <img
                  src={kakaopayIcon}
                  alt='KakaoPay'
                  style={{ width: '60px' }}
                />
              }
            >
              카카오페이
            </Button>

            <p
              style={{
                color: '#868e96',
                fontSize: '0.75rem',
              }}
            >
              회원 본인은 주문내용을 확인했으며, 구매조건 및 개인정보처리방침과
              결제에 동의합니다.
            </p>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderPage;
