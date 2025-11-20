import {
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function AlertsTable({ alerts, statuses }) {
  function getStatusForAlert(alertId) {
    return statuses.find((s) => s.alert_id === alertId);
  }

  return (
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
  );
}
