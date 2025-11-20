import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import MUIAlert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import {
  createAlert,
  getAlertsStatus,
  listAlerts,
  deleteAlert,
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

  const [nameError, setNameError] = useState("");
  const [cityError, setCityError] = useState("");
  const [thresholdError, setThresholdError] = useState("");
  const [editingId, setEditingId] = useState(null);


  async function loadAlerts() {
    setLoading(true);
    setError("");

    try {
        const alertsRes = await listAlerts();
        setAlerts(alertsRes);

        try {
        const statusRes = await getAlertsStatus();
        setStatuses(statusRes);
        } catch (statusErr) {
        console.error("Failed to load alert statuses", statusErr);
        }
    } catch (e) {
        console.error("Failed to load alerts list", e);
        const msg =
        e.response?.data?.detail ||
        "Failed to load alerts. Please try again.";
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

  function startEditAlert(alert) {
    setEditingId(alert.id);
    setName(alert.name);
    setCity(alert.city_name);
    setParameter(alert.parameter);
    setComparison(alert.comparison);
    setThreshold(alert.threshold);
    setNotifyEmail(alert.notify_via_email);
    setError("");
    setNameError("");
    setCityError("");
    setThresholdError("");
  }

  function cancelEditAlert() {
    setEditingId(null);
    setName("");
    setCity("Tel Aviv");
    setParameter("temperature");
    setComparison("GT");
    setThreshold(25);
    setNotifyEmail(false);
    setNameError("");
    setCityError("");
    setThresholdError("");
  }

  async function handleDeleteAlert(alertId) {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await deleteAlert(alertId);
      await loadAlerts(false);
      if (editingId === alertId) {
        cancelEditAlert();
      }
    } catch (e) {
      console.error("Failed to delete alert", e);
      const msg =
        e.response?.data?.detail || "Failed to delete alert. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluate() {
    setLoading(true);
    setError("");

    try {
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
        let hasError = false;
        setNameError("");
        setCityError("");
        setThresholdError("");

        if (!name.trim()) {
        setNameError("Alert name is required");
        hasError = true;
        }

        if (!city.trim()) {
        setCityError("City is required");
        hasError = true;
        }

        const thresholdNumber = Number(threshold);
        if (!Number.isFinite(thresholdNumber) || thresholdNumber <= 0) {
        setThresholdError("Threshold must be a positive number");
        hasError = true;
        }

        if (hasError) {
        return; 
        }

        setLoading(true);
        setError("");

        try {
        const payload = {
            name,
            city_name: city,
            parameter,
            comparison,
            threshold: thresholdNumber,
            notify_via_email: notifyEmail,
        };

        if (editingId === null) {
            await createAlert(payload);
        } else {
            await createAlert(payload);
            await deleteAlert(editingId);
        }

        cancelEditAlert();   
        await loadAlerts(false);
        } catch (e) {
        console.error("Failed to create alert", e);
        const msg =
            e.response?.data?.detail ||
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
          onNameChange={(value) => {
            setName(value);
            setNameError("");
          }}
          onCityChange={(value) => {
            setCity(value);
            setCityError("");
          }}
          onParameterChange={setParameter}
          onComparisonChange={setComparison}
          onThresholdChange={(value) => {
            setThreshold(value);
            setThresholdError("");
          }}
          onNotifyEmailChange={setNotifyEmail}
          onSubmit={handleCreateAlert}
          loading={loading}
          nameError={nameError}
          cityError={cityError}
          thresholdError={thresholdError}
          isEditing={editingId !== null}
          onCancelEdit={cancelEditAlert}
        />

        <AlertsTable
        alerts={alerts}
        statuses={statuses}
        onEdit={startEditAlert}
        onDelete={handleDeleteAlert}
        />
     </Container>
    </>
  );
}
