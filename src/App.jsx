import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Deudores from "./pages/Deudores";
import Credito from "./pages/Credito";
import Pagos from "./pages/Pagos";
import Login from "./login/Login"; // Tu nueva vista

// Creamos un componente envoltorio para manejar la lógica de la Layout
const AppContent = () => {
  const location = useLocation();

  // Definimos si estamos en el login para ocultar el Navbar
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Solo mostramos el Navbar si NO estamos en el login */}
      {!isLoginPage && <Navbar />}

      {/* Si es login, quitamos el p-10 para que el diseño respire. 
          Si no, mantenemos tu p-10 original */}
      <main className={`flex-grow ${isLoginPage ? "" : "p-10"}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Deudores />} />
          <Route path="/creditos/crear/:id" element={<Credito />} />
          <Route path="/pagos" element={<Pagos />} />
        </Routes>
      </main>

      {/* El Footer se queda siempre porque así lo pediste, 
          pero el componente Login ya debería tener su propia lógica interna 
          o podemos dejar que este sea el único Footer global */}
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