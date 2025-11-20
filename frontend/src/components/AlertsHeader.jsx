import { AppBar, Toolbar, Typography, Button } from "@mui/material";

export default function Header({ onEvaluate, onLogout, loading }) {
  return (
    <AppBar position="static" elevation={3}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Weather Alerts
        </Typography>
        <Button color="inherit" onClick={onEvaluate} disabled={loading}>
          Evaluate alerts
        </Button>
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
