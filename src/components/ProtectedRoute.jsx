import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Verificamos si existe el marcador de sesión activa
    const isAuth = localStorage.getItem("user_active") === 'true';

    // Si no está autenticado, lo mandamos al login
    // Si está autenticado, dejamos que pase a las rutas hijas (Outlet)
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;