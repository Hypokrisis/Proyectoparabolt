import { useState } from "react";
import axios from "axios";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     const response = await axios.post(
  "http://127.0.0.1:8000/login",
  {
    email: username,
    password: password,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);


      const token = response.data.access_token;
      localStorage.setItem("token", token);
      onLogin(token); // notifica al padre que se logueó
    } catch (err) {
      setError("Credenciales inválidas o error del servidor");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Iniciar sesión</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
