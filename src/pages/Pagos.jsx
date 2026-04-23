import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../api/axios";


export default function Pagos() {
    const [deudor, setDeudor] = useState(null);
    const [documento, setDocumento] = useState("");
    const [cuotas, setCuotas] = useState([]);
    const [buscado, setBuscado] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
    const [formPago, setFormPago] = useState({
        monto: "",
        metodo_pago: "efectivo",
        referencia: "",
        notas: ""
    });




    const handleBuscar = async () => {

        try {
            setDeudor(null);
            setBuscado(false);
            const res = await clienteAxios.get(
                `/api/cuotas/pendientes/${documento}`
            );


            console.log("RESPUESTA:", res.data);
            setDeudor(res.data.deudor);
            setCuotas(res.data.cuotas);
            setBuscado(true);

        } catch (error) {
            if (error.response?.status === 404) {
                setCuotas([]);
                setDeudor(null);
                setBuscado(true);
            } else {
                console.error("Error al consultar:", error);
            }
        }
    };

    const registrarPago = async () => {
        try {
            setLoading(true); // Para mostrar que está cargando

            // 1. Armamos el objeto con los datos del modal y el ID de la cuota
            const datos = {
                cuota_id: cuotaSeleccionada.id,
                monto: formPago.monto,
                metodo_pago: formPago.metodo_pago,
                referencia: formPago.referencia,
                notas: formPago.notas
            };

            // 2. Enviamos al endpoint de Laravel
            const respuesta = await clienteAxios.post('/api/pagos', datos);

            // 3. Si todo sale bien:
            alert("¡Éxito! " + respuesta.data.mensaje);
            setModalAbierto(false); // Cerramos el modal
            handleBuscar(); // Refrescamos la tabla para que la cuota ya no salga pendiente

        } catch (error) {
            // Si Laravel devuelve error (ej: el monto es inválido)
            console.error(error.response?.data);
            alert(error.response?.data?.error || "Error al procesar el pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Consulta de Pagos</h1>

            {/* 🔍 Buscador */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Ingrese número de documento"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    className="border rounded p-2 w-64"
                />
                <button
                    onClick={handleBuscar}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Buscar
                </button>
            </div>

            {deudor && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 font-medium">
                    Cliente: {deudor.nombre} - CC: {deudor.cedula}
                </div>
            )}

            {/* 📊 Resultados */}
            {buscado && cuotas?.length === 0 && (
                <div className="text-red-600 font-medium">
                    No hay cuotas pendientes para este documento.
                </div>
            )}

            {cuotas && cuotas.length > 0 && (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-gray-100">
                            <tr>

                                <th className="border p-2">N° Cuota</th>
                                <th className="border p-2">Monto</th>
                                <th className="border p-2">Capital</th>
                                <th className="border p-2">Intereses</th>
                                <th className="border p-2">Saldo</th>
                                <th className="border p-2">Vencimiento</th>
                                <th className="border p-2">Estado</th>
                                <th className="border p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuotas.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="border p-2 text-center">{c.numero_cuota}</td>
                                    <td className="border p-2">${c.monto_cuota}</td>
                                    <td className="border p-2">${c.capital}</td>
                                    <td className="border p-2">${c.interes}</td>
                                    <td className="border p-2">${c.saldo_remanente}</td>
                                    <td className="border p-2">{c.fecha_vencimiento}</td>
                                    <td className="border p-2">{c.estado}</td>

                                    <td className="p-3 text-sm text-center">
                                        {/* BOTÓN MODERNO */}
                                        <button
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-1.5 px-4 rounded-md transition duration-200 shadow-sm flex items-center gap-2 mx-auto"
                                            onClick={() => {
                                                setCuotaSeleccionada(c);
                                                setFormPago({ ...formPago, monto: c.monto_cuota });
                                                setModalAbierto(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Registrar Pago
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}




            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in duration-200">

                        {/* Header del Modal */}
                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">Registrar Pago - Cuota #{cuotaSeleccionada?.numero_cuota}</h3>
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="hover:bg-blue-700 rounded-full p-1 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cuerpo del Formulario */}
                        <div className="p-6 space-y-4">
                            {/* Monto */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Monto a Pagar</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-blue-800"
                                    value={formPago.monto}
                                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                                />
                            </div>

                            {/* Método de Pago */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Método de Pago</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                                    value={formPago.metodo_pago}
                                    onChange={(e) => {
                                        const nuevoMetodo = e.target.value;
                                        setFormPago({
                                            ...formPago,
                                            metodo_pago: nuevoMetodo,
                                            // Si es efectivo, limpiamos la referencia automáticamente
                                            referencia: nuevoMetodo === "efectivo" ? "" : formPago.referencia
                                        });
                                    }}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="consignacion">Consignación</option>
                                </select>
                            </div>

                            {/* REFERENCIA CONDICIONAL: Solo aparece si NO es efectivo */}
                            {formPago.metodo_pago !== "efectivo" && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">
                                        Referencia / Comprobante <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-blue-200 bg-blue-50 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={formPago.referencia}
                                        onChange={(e) => setFormPago({ ...formPago, referencia: e.target.value })}
                                        placeholder="N° de operación bancaria"
                                    />
                                </div>
                            )}

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-left">Notas (Opcional)</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    rows="2"
                                    value={formPago.notas}
                                    onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer con Acciones */}
                        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                className={`px-6 py-2 rounded-lg font-bold shadow-md transition ${(formPago.metodo_pago !== "efectivo" && !formPago.referencia)
                                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                                    }`}
                                disabled={formPago.metodo_pago !== "efectivo" && !formPago.referencia}
                                onClick={registrarPago}
                            >
                                {loading ? "Procesando..." : "Confirmar Pago"}
                                Confirmar Pago

                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );


















}


