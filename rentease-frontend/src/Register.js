import React, { useState } from "react";
import API from "../api";

function Register() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleRegister = async () => {
    try {
      await API.post("register/", form);
      alert("User Registered ✅");
    } catch (err) {
      alert("Error ❌");
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;