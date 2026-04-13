import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import clienteAxios from "../api/axios";


export default function Pagos() {
    const [deudor, setDeudor] = useState(null);
    const [documento, setDocumento] = useState("");
    const [cuotas, setCuotas] = useState([]);
    const [buscado, setBuscado] = useState(false);
    const [loading, setLoading] = useState(false);




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
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">N° Cuota</th>
                            <th className="border p-2">Monto</th>
                            <th className="border p-2">Capital</th>
                            <th className="border p-2">Intereses</th>
                            <th className="border p-2">Saldo</th>
                            <th className="border p-2">Vencimiento</th>
                            <th className="border p-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cuotas.map((c) => (
                            <tr key={c.id}>
                                <td className="border p-2 text-center">{c.numero_cuota}</td>
                                <td className="border p-2">${c.monto_cuota}</td>
                                <td className="border p-2">${c.capital}</td>
                                <td className="border p-2">${c.interes}</td>
                                <td className="border p-2">${c.saldo_remanente}</td>
                                <td className="border p-2">{c.fecha_vencimiento}</td>
                                <td className="border p-2">{c.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

}



