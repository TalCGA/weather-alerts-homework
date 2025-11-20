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
  Button,
} from "@mui/material";

export default function AlertsTable({ alerts, statuses, onEdit, onDelete }) {
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
            <TableCell align="center">Currently active</TableCell>
            <TableCell align="center">Next 3 days</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((a) => {
            const status = getStatusForAlert(a.id);
            const upcomingCount = status?.next_3_days_slots?.length || 0;
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
                    <Stack direction="column" alignItems="center" spacing={0.5}>
                        <Chip
                        label={upcomingCount > 0 ? "Will trigger" : "No trigger"}
                        color={upcomingCount > 0 ? "warning" : "default"}
                        size="small"
                        />
                        <span style={{ fontSize: "0.75rem", color: "#666" }}>
                        {upcomingCount > 0
                            ? `${upcomingCount} time(s) in next 3 days`
                            : "No events in next 3 days"}
                        </span>
                    </Stack>
                    )}
                </TableCell>
                <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onEdit(a)}
                        >
                        Edit
                        </Button>
                        <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onDelete(a.id)}
                        >
                        Delete
                        </Button>
                    </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
