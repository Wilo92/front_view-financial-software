import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import clienteAxios from "../api/axios";



export default function Deudores() {

  const [deudores, setDeudores] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    tipo_documento: "CC",
    documento_numero: "",
    telefono: "",
    email: "",
    direccion: "",
    foto: null,
    comentarios: ""
  });

  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  // cargar deudores
  const fetchDeudores = async () => {
    try {
      // Nota: Agregamos /api/ porque Laravel agrupa estas rutas ahí
      const res = await clienteAxios.get("/api/deudores");
      setDeudores(res.data.data || res.data);
    } catch (error) {
      console.error("Error al obtener deudores:", error.response);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchDeudores();
  }, []);

  // manejar cambios
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await clienteAxios.put(`/api/deudores/${editId}`, form);
      } else {
        await clienteAxios.post("/api/deudores", form);
      }

      setForm({
        nombre: "",
        tipo_documento: "CC",
        documento_numero: "",
        telefono: "",
        email: "",
        direccion: "",
        comentarios: "",
        foto: null
      });

      setEditId(null);
      fetchDeudores();
    } catch (error) {
      console.error("Error al guardar:", error.response?.data);
      alert("No se pudo guardar la información.");
    }
  };


  // eliminar
  const eliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await clienteAxios.delete(`/api/deudores/${id}`);

        fetchDeudores();
      } catch (error) {
        console.error("Error al eliminar:", error.response);
      }
    }
  };

  // editar
  const editar = (deudor) => {
    setForm({
      nombre: deudor.nombre,
      tipo_documento: deudor.tipo_documento,
      documento_numero: deudor.documento_numero,
      telefono: deudor.telefono,
      email: deudor.email || "",
      direccion: deudor.direccion || "",
      comentarios: deudor.comentarios || ""
    });
    setEditId(deudor.id);
  };



  const credito = (deudor) => {
    navigate(`/creditos/crear/${deudor.id}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>

      {/* FORMULARIO */}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">

        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombres y apellidos"
          className="border p-2 rounded" />

        <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="border p-2 rounded">
          <option value="CC">Cédula de Ciudadanía (CC)</option>
          <option value="NIT">NIT</option>
          <option value="CE">Cédula Extranjería (CE)</option>
          <option value="PP">Pasaporte (PP)</option>
        </select>

        <input name="documento_numero" value={form.documento_numero} onChange={handleChange} placeholder="Numero de Documento"
          className="border p-2 rounded" />

        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Numero de teléfono"
          className="border p-2 rounded" />

        <input name="email" value={form.email} onChange={handleChange} placeholder="Correo electronico"
          className="border p-2 rounded" />

        <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección"
          className="border p-2 rounded" />



        <input name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Comentarios o notas"
          className="border p-2 rounded" />

        <button
          className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {editId ? "Actualizar" : "Guardar"}
        </button>

      </form>

      {/* TABLA */}

      <table className="w-full border">

        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Nombre</th>
            <th>Documento</th>
            <th>Teléfono</th>

            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {deudores.map((d) => (
            <tr key={d.id} className="border-t">

              <td className="p-2">{d.nombre}</td>
              <td>{d.tipo_documento}: {d.documento_numero}</td>
              <td>{d.telefono}</td>


              <td className="space-x-3">

                <button
                  onClick={() => editar(d)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminar(d.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>

                <button
                  onClick={() => credito(d)}
                  className="bg-green-400 px-2 py-1 rounded"
                >
                  Credito
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}