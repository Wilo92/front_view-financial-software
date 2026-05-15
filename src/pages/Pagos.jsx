import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../api/axios";


export default function Pagos() {
    const [deudor, setDeudor] = useState(null);
    const [documento, setDocumento] = useState("");
    const [creditos, setCreditos] = useState([]);
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
            setCreditos([]);
            const res = await clienteAxios.get(
                `/api/cuotas/pendientes/${documento}`
            );


            console.log("RESPUESTA:", res.data);
            setDeudor(res.data.deudor);
            setCreditos(res.data.creditos);
            setBuscado(true);

        } catch (error) {
            if (error.response?.status === 404) {
                setCreditos([]);
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

            {/* BUSCADOR */}
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

            {/* DATOS DEL DEUDOR */}
            {deudor && (
                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 font-medium">
                    Cliente: {deudor.nombre} — CC: {deudor.numero_documento}
                </div>
            )}

            {/* SIN RESULTADOS */}
            {buscado && creditos.length === 0 && (
                <div className="text-red-600 font-medium">
                    No hay cuotas pendientes para este documento.
                </div>
            )}

            {/* CRÉDITOS AGRUPADOS CON SUS CUOTAS */}
            {creditos.length > 0 && creditos.map((credito) => (
                <div key={credito.id} className="mb-8 border rounded-lg overflow-hidden shadow">

                    {/* CABECERA DEL CRÉDITO */}
                    <div className="bg-gray-100 px-4 py-3 flex gap-6 text-sm font-medium text-gray-700">
                        <span>Crédito #{credito.id}</span>
                        <span>Monto: ${Number(credito.monto).toLocaleString()}</span>
                        <span>Tipo: {credito.tipo_prestamo}</span>
                        <span>Cuotas pendientes: {credito.cuotas_pendientes}</span>
                    </div>

                    {/* TABLA DE CUOTAS DE ESTE CRÉDITO */}
                    <table className="w-full border-collapse bg-white text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border p-2">N° Cuota</th>
                                <th className="border p-2">Monto</th>
                                <th className="border p-2">Capital</th>
                                <th className="border p-2">Interés</th>
                                <th className="border p-2">Saldo</th>
                                <th className="border p-2">Vencimiento</th>
                                <th className="border p-2">Estado</th>
                                <th className="border p-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* credito.cuotas = las cuotas pendientes de este crédito */}
                            {(credito.cuotas ?? []).map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="border p-2 text-center">{c.numero_cuota}</td>
                                    <td className="border p-2">${Number(c.monto_cuota).toLocaleString()}</td>
                                    <td className="border p-2">${Number(c.capital).toLocaleString()}</td>
                                    <td className="border p-2">${Number(c.interes).toLocaleString()}</td>
                                    <td className="border p-2">${Number(c.saldo_remanente).toLocaleString()}</td>
                                    <td className="border p-2">{c.fecha_vencimiento}</td>
                                    <td className="border p-2">{c.estado}</td>
                                    <td className="border p-2 text-center">
                                        <button
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 px-3 rounded transition"
                                            onClick={() => {
                                                // guarda la cuota seleccionada en el estado
                                                // para que el modal sepa cuál cuota está pagando
                                                setCuotaSeleccionada(c);
                                                setFormPago({ ...formPago, monto: c.monto_cuota });
                                                setModalAbierto(true);
                                            }}
                                        >
                                            Registrar Pago
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* MODAL DE PAGO — sin cambios, ya funcionaba bien */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

                        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                            <h3 className="text-lg font-bold">
                                Registrar Pago — Cuota #{cuotaSeleccionada?.numero_cuota}
                            </h3>
                            <button onClick={() => setModalAbierto(false)}>✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Monto a Pagar</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                                    value={formPago.monto}
                                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Método de Pago</label>
                                <select
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formPago.metodo_pago}
                                    onChange={(e) => {
                                        const nuevoMetodo = e.target.value;
                                        setFormPago({
                                            ...formPago,
                                            metodo_pago: nuevoMetodo,
                                            referencia: nuevoMetodo === "efectivo" ? "" : formPago.referencia
                                        });
                                    }}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="consignacion">Consignación</option>
                                </select>
                            </div>

                            {/* referencia solo aparece si NO es efectivo */}
                            {formPago.metodo_pago !== "efectivo" && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Referencia <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-blue-200 bg-blue-50 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formPago.referencia}
                                        onChange={(e) => setFormPago({ ...formPago, referencia: e.target.value })}
                                        placeholder="N° de operación bancaria"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Notas (Opcional)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="2"
                                    value={formPago.notas}
                                    onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={formPago.metodo_pago !== "efectivo" && !formPago.referencia}
                                onClick={registrarPago}
                                className={`px-6 py-2 rounded-lg font-bold transition ${formPago.metodo_pago !== "efectivo" && !formPago.referencia
                                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                            >
                                {loading ? "Procesando..." : "Confirmar Pago"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}