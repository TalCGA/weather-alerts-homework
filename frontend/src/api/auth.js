import api from "./client";

export async function login(email, password) {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);
  data.append("grant_type", "password");

  const res = await api.post("/auth/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data; // { access_token, token_type }
}
