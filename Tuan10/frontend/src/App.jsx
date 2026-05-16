import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ShoppingCart,
  User,
  LogOut,
  Trash2,
  CheckCircle2,
  Store,
  ReceiptText
} from 'lucide-react';

const USER_API = 'http://localhost:3001/api/users';
const FOOD_API = 'http://localhost:3002/api/foods';
const ORDER_API = 'http://localhost:3003/api/orders';
const PAYMENT_API = 'http://localhost:3004/api/payments';

function App() {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [notification, setNotification] = useState(null);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  useEffect(() => {
    if (!currentUser) return;
    fetchFoods();
    fetchOrders();
  }, [currentUser]);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(FOOD_API);
      setFoods(res.data);
    } catch (e) {
      console.error('Error fetching foods', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(ORDER_API);
      setOrders(res.data.filter((o) => o.userId === currentUser.id));
    } catch (e) {
      console.error('Error fetching orders', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${USER_API}/login`, authForm);
      setCurrentUser(res.data);
      setView('menu');
    } catch (e) {
      alert(`Login failed: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${USER_API}/register`, authForm);
      alert('Registration successful! Please login.');
      setView('login');
    } catch (e) {
      alert('Registration failed');
    }
  };

  const addToCart = (food) => {
    const existing = cart.find((item) => item.id === food.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...food, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    try {
      const orderRes = await axios.post(ORDER_API, {
        userId: currentUser.id,
        items: cart.map((item) => ({ foodId: item.id, quantity: item.quantity }))
      });

      const orderId = orderRes.data.id;

      await axios.post(PAYMENT_API, {
        orderId,
        method: 'COD'
      });

      setCart([]);
      setIsCartOpen(false);
      fetchOrders();
      setView('orders');
      setNotification(`Đặt hàng thành công đơn #${orderId}!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (e) {
      alert(`Order failed: ${e.message}`);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('login');
    setCart([]);
    setOrders([]);
  };

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <p className="eyebrow">ShopeeFood Internal</p>
          <h1>{view === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}</h1>
          <p className="subtext">Nền tảng demo đặt món nội bộ cho đội vận hành.</p>

          <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">{view === 'login' ? 'Vào ứng dụng' : 'Đăng ký ngay'}</button>
          </form>

          <p className="switcher">
            {view === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <span onClick={() => setView(view === 'login' ? 'register' : 'login')}>
              {view === 'login' ? ' Đăng ký' : ' Đăng nhập'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="logo" onClick={() => setView('menu')}>
            <Store size={20} /> ShopeeFood Internal
          </button>

          <div className="top-actions">
            <span className="user-pill">
              <User size={15} /> {currentUser.username} ({currentUser.role})
            </span>

            <button className="icon-btn" onClick={() => setView('orders')}>
              <ReceiptText size={18} /> Đơn hàng
            </button>

            <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={18} /> Giỏ
              <span className="cart-badge">{cartCount}</span>
            </button>

            <button className="icon-btn logout" onClick={logout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-container">
        {notification && (
          <div className="notification">
            <CheckCircle2 size={20} /> {notification}
          </div>
        )}

        {view === 'menu' ? (
          <section>
            <h2 className="section-title">Món ngon hôm nay</h2>
            <div className="food-grid">
              {foods.map((food) => (
                <article key={food.id} className="food-card">
                  <img src={food.image} alt={food.name} className="food-img" />
                  <div className="food-info">
                    <h3 className="food-name">{food.name}</h3>
                    <p className="food-desc">{food.description}</p>
                    <div className="food-row">
                      <div className="food-price">{food.price.toLocaleString()}đ</div>
                      <button className="small-btn" onClick={() => addToCart(food)}>
                        Chọn
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <h2 className="section-title">Lịch sử đơn hàng</h2>
            <div className="orders-list">
              {orders.length === 0 ? (
                <p>Chưa có đơn hàng nào.</p>
              ) : (
                orders
                  .slice()
                  .reverse()
                  .map((order) => (
                    <article key={order.id} className="order-card">
                      <div className="order-top">
                        <strong>Đơn hàng #{order.id}</strong>
                        <span className={`status ${order.status === 'Paid' ? 'paid' : 'pending'}`}>{order.status}</span>
                      </div>
                      <p className="order-items">
                        {order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                      </p>
                      <p className="order-total">Tổng cộng: {order.total.toLocaleString()}đ</p>
                    </article>
                  ))
              )}
            </div>
          </section>
        )}
      </main>

      {isCartOpen && (
        <aside className="cart-drawer">
          <div className="drawer-head">
            <h3>Giỏ hàng</h3>
            <button className="ghost-btn" onClick={() => setIsCartOpen(false)}>
              Đóng
            </button>
          </div>

          <div className="drawer-body">
            {cart.length === 0 ? (
              <p>Giỏ hàng trống.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-meta">
                      {item.price.toLocaleString()}đ x {item.quantity}
                    </div>
                  </div>
                  <button className="ghost-btn danger" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="drawer-foot">
            <div className="total-row">
              <span>Tổng cộng</span>
              <strong>{cartTotal.toLocaleString()}đ</strong>
            </div>
            <button onClick={checkout} disabled={cart.length === 0}>
              Đặt hàng ngay
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
