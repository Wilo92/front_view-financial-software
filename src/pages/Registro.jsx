import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import clienteAxios from "../api/axios";
import logoApp from "../assets/logo.png";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaArrowLeft } from "react-icons/fa";

const Registro = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        documento_number: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Limpiar error del campo cuando el usuario vuelve a escribir
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validatePassword = (pass) => {
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{4,10}$/;
        return re.test(pass);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Limpiamos cualquier rastro previo para forzar frescura
            await clienteAxios.get("/sanctum/csrf-cookie");

            // 2. Pequeño truco: Esperar un micro-segundo para que el navegador guarde la cookie
            // 3. El registro (asegúrate que la URL coincida con tu ruta)
            const response = await clienteAxios.post("/api/register", formData);

            if (response.status === 200 || response.status === 201) {
                navigate("/deudores");
            }
        } catch (error) {
            // Si el error es 403, es CSRF. Si es 422, es validación de datos.
            console.log("Status:", error.response?.status);
            setErrors(error.response?.data?.errors || {});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-[#3b82f6] p-6 text-center relative">
                    <button
                        onClick={() => navigate("/login")}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <img src={logoApp} alt="Logo" className="w-24 mx-auto mb-2 brightness-0 invert" />
                    <h2 className="text-white text-xl font-bold">Crea tu cuenta</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">

                    {/* Nombre */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Juan Pérez"
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Documento</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="document_number"
                                type="text"
                                required
                                value={formData.document_number}
                                onChange={handleChange}
                                placeholder="1088..."
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.document_number ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="usuario@kartero.com"
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="phone"
                                type="text"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+57 300..."
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                            * 4-10 caracteres, 1 Mayúscula, 1 Número y 1 Símbolo.
                        </p>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-4 ${loading ? "opacity-50 cursor-not-allowed" : "active:scale-95"
                            }`}
                    >
                        {loading ? "Creando cuenta..." : "Registrarme"}
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="text-[#3b82f6] font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Registro;