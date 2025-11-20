import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  TextField,
  Typography,
  Alert as MuiAlert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("test1@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      onLogin(data.access_token);
      navigate("/alerts", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Card sx={{ width: "100%", boxShadow: 4 }}>
        <CardHeader
          title="Weather Alerts"
          subheader="Log in to manage your alerts"
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <MuiAlert severity="error" sx={{ mt: 2 }}>
                {error}
              </MuiAlert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Use the demo user you created via Swagger
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
