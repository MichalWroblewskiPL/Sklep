import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import Shop from "./pages/Shop";
import ForgotPassword from "./pages/ForgotPassword";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProducts from "./pages/EmployeeProducts";
import EmployeeEditProduct from "./pages/EmployeeEditProduct";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetails from "./pages/OrderDetails";
import EmployeeOrders from "./pages/EmployeeOrders";
import EmployeeOrderDetails from "./pages/EmployeeOrderDetails";




const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password" element={<ForgotPassword />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/products" element={<EmployeeProducts />} />
              <Route path="/employee/products/:id" element={<EmployeeEditProduct />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order/:id" element={<OrderDetails />} />
              <Route path="/employee/orders" element={<EmployeeOrders />} />
              <Route path="/employee/orders/:orderId" element={<EmployeeOrderDetails />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
