import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  padding: theme.spacing(1, 3),
}));

const AddUser = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
  const { tenantId } = useAuthStore((state) => state.currentUser); // Get tenantId

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    county: "",
    town: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "info", // 'success' | 'warning' | 'error'
});


  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    await axios.post(
      `${BASEURL}/adduser`,
      { tenantId, ...userData },
      { withCredentials: true }
    );
    // Success snackbar instead of alert
    setSnackbar({
      open: true,
      message: "User added successfully!",
      severity: "success",
    });
    setTimeout(() => navigate("/users"), 1500);

  } catch (err) {
    // Handle Payment Required (402) specially
    if (err.response?.status === 402) {
      setSnackbar({
        open: true,
        message:
          err.response.data?.error ||
          "This feature is disabled due to non-payment of the service.",
        severity: "warning",
      });
    } else {
      // Generic failure
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "Failed to add user. Please try again.",
        severity: "error",
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <Box
      sx={{
        p: 4,
        ml: { xs: 0, md: 55 },
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
       
      }}
    >
      <StyledCard sx={{ maxWidth: 600, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Add New User
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="County"
                  name="county"
                  value={userData.county}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Town"
                  name="town"
                  value={userData.town}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={userData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <StyledButton
              type="submit"
              variant="contained"
              sx={{ mt: 3, bgcolor: theme.palette.primary.main }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Add User"}
            </StyledButton>
          </form>
        </CardContent>
      </StyledCard>

<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={() => setSnackbar(s => ({ ...s, open: false }))}
  anchorOrigin={{ vertical: "top", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

    </Box>
  );
};

export default AddUser;
