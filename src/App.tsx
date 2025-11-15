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
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
