import axios from 'axios';

const clienteAxios = axios.create({
    baseURL: '/',
    withCredentials: true,

    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

clienteAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("user_active");
            // Redirigir al login si la sesión muere
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default clienteAxios;