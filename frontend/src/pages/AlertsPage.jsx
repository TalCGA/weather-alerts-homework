import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import MUIAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import {
  createAlert, evaluateAlerts, getAlertsStatus, listAlerts,
} from "../api/alerts";

import AlertsHeader from "../components/AlertsHeader.jsx";
import AlertForm from "../components/AlertForm.jsx";
import AlertsTable from "../components/AlertsTable.jsx";

export default function AlertsPage({ onLogout }) {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [city, setCity] = useState("Tel Aviv");
  const [parameter, setParameter] = useState("temperature");
  const [comparison, setComparison] = useState("GT");
  const [threshold, setThreshold] = useState(25);
  const [notifyEmail, setNotifyEmail] = useState(false);

  async function loadAlerts() {
    setLoading(true);
    setError("");  

    try {
      const [alertsRes, statusRes] = await Promise.all([
        listAlerts(),
        getAlertsStatus(),
      ]);
      setAlerts(alertsRes);
      setStatuses(statusRes);
    } catch (e) {
        const msg = e.response?.data?.detail || 
            "Failed to load alerts. Please check that city names are valid and try again.";
        setError(msg);
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
  }, [navigate]);

  function handleLogout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  async function handleEvaluate() {
    setLoading(true);
    setError("");

    try {
      await evaluateAlerts();
      await loadAlerts();
    } catch (e) {
        console.error("Failed to evaluate alerts", e);
        const msg = e.response?.data?.detail || 
            "Failed to evaluate alerts. Please check that city names are valid.";
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAlert() {
    if (!name || !city) return;
    setLoading(true);
    setError(""); 

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
        const msg = e.response?.data?.detail || 
        "Failed to create alert. Please check your inputs (city name, threshold, etc.).";
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AlertsHeader
        onEvaluate={handleEvaluate}
        onLogout={handleLogout}
        loading={loading}
      />

      <Container sx={{ mt: 4, mb: 4 }}>
        {error && (
            <Box sx={{ mb: 2 }}>
                <MUIAlert severity="error">{error}</MUIAlert>
            </Box>
        )}
        <AlertForm
            name={name}
            city={city}
            parameter={parameter}
            comparison={comparison}
            threshold={threshold}
            notifyEmail={notifyEmail}
            onNameChange={setName}
            onCityChange={setCity}
            onParameterChange={setParameter}
            onComparisonChange={setComparison}
            onThresholdChange={setThreshold}
            onNotifyEmailChange={setNotifyEmail}
            onSubmit={handleCreateAlert}
            loading={loading}
        />

        <AlertsTable alerts={alerts} statuses={statuses} />
     </Container>
    </>
  );
}
