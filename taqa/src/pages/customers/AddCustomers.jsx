import { useEffect, useState, useMemo } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  Grid,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore, useThemeStore } from "../../store/authStore";
import { getTheme } from "../../store/theme";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const CUSTOMER_TYPES = ["POSTPAID", "PREPAID"];

export default function AddCustomer() {
  const navigate = useNavigate();
  const { darkMode } = useThemeStore();
  const theme = getTheme(darkMode ? "dark" : "light");
  const currentUser = useAuthStore((state) => state.currentUser);
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    email: "",
    gender: "Male",
    county: "",
    town: "",
    location: "",
    estateName: "",
    building: "",
    houseNumber: "",
    category: "",
    monthlyCharge: 300,
    garbageCollectionDay: "MONDAY",
    closingBalance: 0,
    status: "ACTIVE",
    collected: false,
    trashBagsIssued: false,
    customerType: "PREPAID", // Default to PREPAID
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loading, setLoading] = useState(false);

  // Centralized input styles
  const inputSx = useMemo(
    () => ({
      "& .MuiInputBase-root": { color: theme.palette.grey[100] },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.grey[300],
      },
      "& .MuiInputLabel-root": { color: theme.palette.grey[300] },
    }),
    [theme]
  );

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim() ? "" : "This field is required";
      case "phoneNumber":
        return /^[0-9]{10}$/.test(value) ? "" : "Enter a valid 10-digit phone number";
      case "email":
        return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Enter a valid email";
      case "monthlyCharge":
      case "closingBalance":
        return !isNaN(value) && value >= 0 ? "" : "Enter a valid number";
      case "garbageCollectionDay":
        return DAYS_OF_WEEK.includes(value) ? "" : "Select a valid day";
      case "customerType":
        return CUSTOMER_TYPES.includes(value) ? "" : "Select a valid customer type";
      default:
        return "";
    }
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "collected" || name === "trashBagsIssued"
        ? value === "yes"
        : name === "monthlyCharge" || name === "closingBalance"
        ? parseFloat(value) || 0
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate field
    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "info" });

    if (!currentUser?.tenantId) {
      setSnackbar({
        open: true,
        message: "Tenant ID is missing. Please log in again.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSnackbar({
        open: true,
        message: "Please correct the errors in the form.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    const customerData = { ...formData, tenantId: currentUser.tenantId };

    try {
      await axios.post(`${BASEURL}/customers`, customerData, {
        withCredentials: true,
      });

      setSnackbar({
        open: true,
        message: "Customer created successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/"), 3000); // Increased timeout for readability
    } catch (err) {
      console.error("Error adding customer:", err);
      const status = err.response?.status;
      const data = err.response?.data || {};

      let message = "An unexpected error occurred. Please try again.";
      let severity = "error";

      if (status === 400) {
        message = data.message || "Invalid input. Please check your details.";
      } else if (status === 401) {
        message = "Unauthorized. Redirecting to login...";
        setTimeout(() => navigate("/login"), 3000);
      } else if (status === 402) {
        message = data.error || "This feature is disabled due to non-payment.";
        severity = "warning";
      } else if (err.message.includes("Network Error")) {
        message = "Network error. Please check your connection and try again.";
      }

      setSnackbar({ open: true, message, severity });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        width: { xs: "90%", sm: "70%" },
        padding: 3,
        margin: "auto",
        mt: 5,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[3],
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Add New Customer
      </Typography>

      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          sx={{ mb: 2 }}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} aria-label="Add Customer Form">
        <Grid container spacing={2}>
          {/* Name Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              aria-required="true"
            />
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Secondary Phone"
              name="secondaryPhoneNumber"
              value={formData.secondaryPhoneNumber}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </Grid>

          {/* Personal Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
          </Grid>

          {/* Address Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="County"
              name="county"
              value={formData.county}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Town"
              name="town"
              value={formData.town}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Estate Name"
              name="estateName"
              value={formData.estateName}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Building"
              name="building"
              value={formData.building}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="House Number"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>

          {/* Billing & Collection Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Monthly Charge"
              name="monthlyCharge"
              type="number"
              value={formData.monthlyCharge}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.monthlyCharge}
              helperText={formErrors.monthlyCharge}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Garbage Collection Day"
              name="garbageCollectionDay"
              value={formData.garbageCollectionDay}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.garbageCollectionDay}
              helperText={formErrors.garbageCollectionDay}
              aria-required="true"
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Customer Type"
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.customerType}
              helperText={formErrors.customerType}
              aria-required="true"
            >
                <MenuItem value="PREPAID">PREPAID-Will pay before service</MenuItem>
              <MenuItem value="POSTPAID">POSTPAID- Will pay after service</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Closing Balance"
              name="closingBalance"
              type="number"
              value={formData.closingBalance}
              onChange={handleChange}
              fullWidth
              required
              sx={inputSx}
              error={!!formErrors.closingBalance}
              helperText={formErrors.closingBalance}
              aria-required="true"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Trash Bags Issued"
              name="trashBagsIssued"
              value={formData.trashBagsIssued ? "yes" : "no"}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Collected"
              name="collected"
              value={formData.collected ? "yes" : "no"}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            sx={{
              color: theme.palette.grey[300],
              borderColor: theme.palette.grey[300],
            }}
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              backgroundColor: theme.palette.greenAccent.main,
              color: "#fff",
              "&:disabled": { backgroundColor: theme.palette.grey[500] },
            }}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Adding..." : "Add Customer"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}