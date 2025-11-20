import { useEffect, useState } from "react";
import {
  AppBar, Box, Button, Checkbox, Container, FormControl, InputLabel, MenuItem, 
  Select, TextField, Toolbar, Typography, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Chip, Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  createAlert, evaluateAlerts, getAlertsStatus, listAlerts,
} from "../api/alerts";

const PARAM_OPTIONS = ["temperature", "windSpeed", "precipitation"];
const COMP_OPTIONS = ["GT", "GTE", "LT", "LTE"];

export default function AlertsPage({ onLogout }) {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("Tel Aviv");
  const [parameter, setParameter] = useState("temperature");
  const [comparison, setComparison] = useState("GT");
  const [threshold, setThreshold] = useState(25);
  const [notifyEmail, setNotifyEmail] = useState(false);

  async function loadAlerts() {
    setLoading(true);
    try {
      const [alertsRes, statusRes] = await Promise.all([
        listAlerts(),
        getAlertsStatus(),
      ]);
      setAlerts(alertsRes);
      setStatuses(statusRes);
    } catch (e) {
      console.error("Failed to load alerts", e);
    } finally {
      setLoading(false);
    }
  }

    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            navigate("/login", { replace: true });
            return;
        }
        loadAlerts(); 
    }, []);     

    function handleLogout() {
        onLogout();                        
        navigate("/login", { replace: true });
    }

  async function handleEvaluate() {
    setLoading(true);
    try {
      await evaluateAlerts();
      await loadAlerts();
    } catch (e) {
      console.error("Failed to evaluate alerts", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAlert() {
    if (!name || !city) return;
    setLoading(true);
    try {
      await createAlert({
        name,
        city_name: city,
        parameter,
        comparison,
        threshold: Number(threshold),
        notify_via_email: notifyEmail,
      });
      setName("");
      await loadAlerts();
    } catch (e) {
      console.error("Failed to create alert", e);
    } finally {
      setLoading(false);
    }
  }

  function getStatusForAlert(alertId) {
    return statuses.find((s) => s.alert_id === alertId);
  }

  return (
    <>
      <AppBar position="static" elevation={3}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Weather Alerts
          </Typography>
          <Button color="inherit" onClick={handleEvaluate} disabled={loading}>
            Evaluate alerts
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create new alert
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Alert name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <FormControl>
              <InputLabel>Parameter</InputLabel>
              <Select
                label="Parameter"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
              >
                {PARAM_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Comparison</InputLabel>
              <Select
                label="Comparison"
                value={comparison}
                onChange={(e) => setComparison(e.target.value)}
              >
                <MenuItem value="GT">&gt;</MenuItem>
                <MenuItem value="GTE">&gt;=</MenuItem>
                <MenuItem value="LT">&lt;</MenuItem>
                <MenuItem value="LTE">&lt;=</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              <Typography>Notify via email</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleCreateAlert}
              disabled={loading}
            >
              Create alert
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            My alerts
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Parameter</TableCell>
                <TableCell>Comparison</TableCell>
                <TableCell>Threshold</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="center">Status now</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((a) => {
                const status = getStatusForAlert(a.id);
                return (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.city_name}</TableCell>
                    <TableCell>{a.parameter}</TableCell>
                    <TableCell>{a.comparison}</TableCell>
                    <TableCell>{a.threshold}</TableCell>
                    <TableCell>{a.unit}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={a.is_active ? "ON" : "OFF"}
                        color={a.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {status && (
                        <Stack direction="row" justifyContent="center">
                          <Chip
                            label={
                              status.is_triggered_now ? "Triggered" : "Not triggered"
                            }
                            color={status.is_triggered_now ? "error" : "default"}
                            size="small"
                          />
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>
  );
}
