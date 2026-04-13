import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../api/axios";

export default function Credito() {
    const { id } = useParams();

    const [form, setForm] = useState({
        deudor_id: "",
        monto: "",
        tasa_interes: "",
        numero_cuotas: "",
        fecha_inicio: "",
        tipo_prestamo: "cuota_fija", // Esta es nuestra llave maestra ahora
        frecuencia: "mensual",
        observaciones: ""
    });

    const [deudor, setDeudor] = useState(null);
    const [planProyectado, setPlanProyectado] = useState([]);
    const [loadingSimulation, setLoadingSimulation] = useState(false);

    useEffect(() => {
        const cargarDeudor = async () => {
            try {
                const res = await clienteAxios.get(`/api/deudores/${id}`);
                setDeudor(res.data);
            } catch (error) {
                console.error("Error al cargar los datos del deudor", error);
            }
        };

        if (id) {
            setForm((prev) => ({ ...prev, deudor_id: id }));
            cargarDeudor();
        }
    }, [id]);

    // Lógica de simulación: se activa sola al completar los campos
    useEffect(() => {
        const simular = async () => {
            const { monto, tasa_interes, numero_cuotas, fecha_inicio } = form;
            if (monto > 0 && tasa_interes > 0 && numero_cuotas > 0 && fecha_inicio) {
                setLoadingSimulation(true);
                try {
                    const res = await clienteAxios.post("/api/creditos/simular", form);
                    setPlanProyectado(res.data);
                } catch (e) { 
                    console.error("Error en simulación", e); 
                } finally {
                    setLoadingSimulation(false);
                }
            }
        };
        const timer = setTimeout(simular, 500);
        return () => clearTimeout(timer);
    }, [form]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await clienteAxios.post("/api/creditos", form);
            alert("Crédito creado correctamente");
        } catch (error) {
            alert("Error al crear crédito");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Configurar Nuevo Crédito</h2>

            {deudor && (
                <div className="bg-white shadow-lg rounded-xl p-6 mb-10 border max-w-xl mx-auto text-center">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Cliente Seleccionado</h3>
                    <p className="text-gray-700"><strong>Nombre: </strong>{deudor.nombre}</p>
                    <p className="text-gray-700"><strong>Cédula: </strong>{deudor.cedula}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white shadow-lg rounded-xl p-8 border">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto del Préstamo</label>
                            <input 
                                type="number" 
                                name="monto" 
                                value={form.monto} 
                                onChange={handleChange} 
                                className="w-full border rounded-lg p-2 focus:ring-blue-500" 
                                placeholder="Ej: 500000"
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">% Interés (por periodo)</label>
                                <input 
                                    type="number" 
                                    name="tasa_interes" 
                                    value={form.tasa_interes} 
                                    onChange={handleChange} 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Ej: 5"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cant. Cuotas</label>
                                <input
                                    type="number"
                                    name="numero_cuotas"
                                    value={form.numero_cuotas}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Ej: 12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Pago</label>
                                <select 
                                    name="frecuencia" 
                                    value={form.frecuencia} 
                                    onChange={handleChange} 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="diario">Diario</option>
                                    <option value="semanal">Semanales</option>
                                    <option value="quincenal">Quincenales</option>
                                    <option value="mensual">Mensuales</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                                <select 
                                    name="tipo_prestamo" 
                                    value={form.tipo_prestamo} 
                                    onChange={handleChange} 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cuota_fija">Cuotas Fijas</option>
                                    <option value="abono_capital">Abono Fijo a Capital</option>
                                    <option value="solo_intereses">Solo Intereses (Final)</option>
                                    <option value="interes_simple">Interés Simple (Fijo)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Primer Pago</label>
                            <input 
                                type="date" 
                                name="fecha_inicio" 
                                value={form.fecha_inicio} 
                                onChange={handleChange} 
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" 
                                required 
                            />
                        </div>

                        <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-bold shadow-md">
                            Generar y Guardar Crédito
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-8 border">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">Simulación del Plan de Pagos</h3>

                    {loadingSimulation ? (
                        <div className="flex flex-col items-center justify-center py-10">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                             <p className="text-gray-500 italic">Calculando cuotas...</p>
                        </div>
                    ) : planProyectado.length > 0 ? (
                        <div className="max-h-[500px] overflow-y-auto pr-2">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-3">#</th>
                                        <th className="px-2 py-3">Fecha</th>
                                        <th className="px-2 py-3 text-right">Capital</th>
                                        <th className="px-2 py-3 text-right">Interés</th>
                                        <th className="px-2 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planProyectado.map((cuota, i) => (
                                        <tr key={i} className="border-b hover:bg-blue-50">
                                            <td className="px-2 py-2 font-bold">{cuota.numero_cuota}</td>
                                            <td className="px-2 py-2 text-xs">{cuota.fecha_vencimiento}</td>
                                            <td className="px-2 py-2 text-right">${Number(cuota.capital).toLocaleString()}</td>
                                            <td className="px-2 py-2 text-right text-red-400">${Number(cuota.interes).toLocaleString()}</td>
                                            <td className="px-2 py-2 text-right text-green-600 font-bold">${Number(cuota.monto_cuota).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-lg">
                            <p className="text-gray-400 italic">Complete los datos para proyectar el crédito automáticamente.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}