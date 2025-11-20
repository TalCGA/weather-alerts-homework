import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

const PARAM_OPTIONS = ["temperature", "windSpeed", "precipitation"];
const COMP_OPTIONS = ["GT", "GTE", "LT", "LTE"];

export default function AlertForm({
  name,
  city,
  parameter,
  comparison,
  threshold,
  notifyEmail,
  onNameChange,
  onCityChange,
  onParameterChange,
  onComparisonChange,
  onThresholdChange,
  onNotifyEmailChange,
  onSubmit,
  loading,
}) {
  return (
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
          onChange={(e) => onNameChange(e.target.value)}
        />
        <TextField
          label="City"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        />
        <FormControl>
          <InputLabel>Parameter</InputLabel>
          <Select
            label="Parameter"
            value={parameter}
            onChange={(e) => onParameterChange(e.target.value)}
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
            onChange={(e) => onComparisonChange(e.target.value)}
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
          onChange={(e) => onThresholdChange(e.target.value)}
        />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={notifyEmail}
            onChange={(e) => onNotifyEmailChange(e.target.checked)}
          />
          <Typography>Notify via email</Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          Create alert
        </Button>
      </Box>
    </Paper>
  );
}
