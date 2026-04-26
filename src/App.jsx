import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Deudores from "./pages/Deudores";
import Credito from "./pages/Credito";
import Pagos from "./pages/Pagos";
import Login from "./login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState, useEffect } from "react";
import clienteAxios from './api/axios';
import Registro from "./pages/Registro";

// Creamos un componente envoltorio para manejar la lógica de la Layout
const AppContent = () => {
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  // Definimos si estamos en el login para ocultar el Navbar
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentamos obtener el usuario actual desde el backend
        await clienteAxios.get('/sanctum/csrf-cookie');
        await clienteAxios.get('/api/user');
        localStorage.setItem("user_active", 'true');
      } catch (error) {
        localStorage.removeItem("user_active");

        console.log("sesion expirada o invalida")
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-ping rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600 font-semibold">Cargando sistema...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Solo mostramos el Navbar si NO estamos en el login */}
      {!isLoginPage && <Navbar />}

      {/* Si es login, quitamos el p-10 para que el diseño respire. 
          Si no, mantenemos tu p-10 original */}
      <main className={`flex-grow ${isLoginPage ? "" : "p-10"}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<Navigate to="/login" />} />




          <Route element={<ProtectedRoute />}>
            <Route path="/deudores" element={<Deudores />} />
            <Route path="/creditos/crear/:id" element={<Credito />} />
            <Route path="/pagos" element={<Pagos />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>


      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;