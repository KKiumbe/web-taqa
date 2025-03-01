import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import TitleComponent from "../components/title";
import axios from "axios";
import { getTheme } from "../store/theme";

const CreatePayment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isPhoneSearch, setIsPhoneSearch] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const BASEURL = import.meta.env.VITE_BASE_URL;
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchPerformed(true);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const isPhoneNumber = /^\d+$/.test(searchQuery);
      let response;

      if (isPhoneNumber) {
        if (searchQuery.length < 10) {
          setSnackbarMessage("Please enter at least 10 digits for phone search");
          setSnackbarOpen(true);
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        response = await axios.get(`${BASEURL}/search-customer-by-phone`, {
          params: { phone: searchQuery },
          withCredentials: true,
        });
        console.log("Phone search response:", response.data);
        const customer = response.data;
        setSearchResults(customer ? [customer] : []);
      } else {
        response = await axios.get(`${BASEURL}/search-customers-by-name`, {
          params: { name: searchQuery },
          withCredentials: true,
        });
        console.log("Name search response:", response.data);
        const results = Array.isArray(response.data) ? response.data : [];
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching customers:", error.response);
      if (error.response && error.response.status === 404) {
        setSnackbarMessage(
          error.response.data.message || "No customer found"
        );
      } else {
        setSnackbarMessage("Error searching customers.");
      }
      setSearchResults([]);
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameSearch = async (value) => {
    if (/^\d+$/.test(value)) {
      setIsPhoneSearch(true);
      setSearchResults([]);
      setSearchQuery(value);
      setSearchPerformed(false);
      return;
    }

    setIsSearching(true);
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(`${BASEURL}/search-customers-by-name`, {
        params: { name: value },
        withCredentials: true,
      });
      console.log("Name search response:", response.data);
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching customers:", error.response);
      if (error.response && error.response.status === 404) {
        setSnackbarMessage(
          error.response.data.message || "No customer found"
        );
      } else {
        setSnackbarMessage("Error searching customers.");
      }
      setSearchResults([]);
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomerSelect = (event, newValue) => {
    setSelectedCustomer(newValue);
    setSearchQuery("");
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const isNumeric = /^\d+$/.test(value);
    setIsPhoneSearch(isNumeric);
    setSearchPerformed(false);
    setSearchResults([]);
    if (isNumeric !== isPhoneSearch) {
      setSelectedCustomer(null);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCustomer || !totalAmount || !modeOfPayment) {
      setSnackbarMessage("Please fill all payment details.");
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      customerId: selectedCustomer.id,
      totalAmount: parseFloat(totalAmount),
      modeOfPayment,
      paidBy: selectedCustomer.firstName,
    };

    setIsProcessing(true);
    try {
      const response = await axios.post(`${BASEURL}/manual-cash-payment`, payload, {
        withCredentials: true,
      });

      console.log(`this is the new payment ${JSON.stringify(response)}`);
      setSnackbarMessage("Payment created successfully.");
      setSnackbarOpen(true);
      setSelectedCustomer(null);
      setTotalAmount("");
      setModeOfPayment("");
      navigate(`/payments`);
    } catch (error) {
      console.error("Error creating payment:", error);
      setSnackbarMessage("Error creating payment.");
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        p: 3,
        mt: 2,
        bgcolor: theme.palette.primary.main,
        borderRadius: 2,
        boxShadow: 3,
        ml: 60,
      }}
    >
      <TitleComponent title="Create Payment" />
      <Paper sx={{ p: 3, bgcolor: theme.palette.primary.main, color: theme.palette.grey[100]}}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Search Customer
        </Typography>
        {isPhoneSearch ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Search by Phone"
              variant="outlined"
              value={searchQuery}
              onChange={handleInputChange}
              fullWidth
              disabled={isSearching}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: theme.palette.grey[300] },
                  "&:hover fieldset": { borderColor: theme.palette.greenAccent.main },
                  "&.Mui-focused fieldset": { borderColor: theme.palette.greenAccent.main },
                },
                "& .MuiInputLabel-root": { color: theme.palette.grey[100] },
                "& .MuiInputBase-input": { color: theme.palette.grey[100] },
              }}
            />
            {searchQuery.length >= 10 && (
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isSearching}
                sx={{
                  bgcolor: theme.palette.greenAccent.main,
                  color: "#fff",
                  "&:hover": { bgcolor: theme.palette.greenAccent.main, opacity: 0.9 },
                }}
              >
                {isSearching ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Search"}
              </Button>
            )}
          </Box>
        ) : (
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) =>
              `${option.firstName || "Unknown"} ${option.lastName || ""} (${option.phoneNumber || "N/A"})`
            }
            onChange={handleCustomerSelect}
            onInputChange={(event, value) => {
              setSearchQuery(value);
              handleNameSearch(value);
            }}
            loading={isSearching}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search by Name"
                variant="outlined"
                value={searchQuery}
                onChange={handleInputChange}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: theme.palette.grey[300] },
                    "&:hover fieldset": { borderColor: theme.palette.greenAccent.main },
                    "&.Mui-focused fieldset": { borderColor: theme.palette.greenAccent.main },
                  },
                  "& .MuiInputLabel-root": { color: theme.palette.grey[100] },
                  "& .MuiInputBase-input": { color: theme.palette.grey[100] },
                  mb: 2,
                }}
              />
            )}
          />
        )}

        {isPhoneSearch && searchPerformed && searchResults.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {searchResults.map((customer) => (
              <Box
                key={customer.id}
                sx={{
                  p: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: theme.palette.grey[800] },
                }}
                onClick={() => handleCustomerSelect(null, customer)}
              >
                <Typography sx={{ color: theme.palette.grey[100] }}>
                  {`${customer.firstName || "Unknown"} ${customer.lastName || ""} (${customer.phoneNumber || "N/A"})`}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {isPhoneSearch && searchPerformed && searchResults.length === 0 && !isSearching && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: theme.palette.grey[100] }}>
              No customer found with phone number: {searchQuery}
            </Typography>
          </Box>
        )}

        {selectedCustomer && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Payment Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: theme.palette.grey[100] }}>
                  Customer: {selectedCustomer.firstName} {selectedCustomer.lastName} ({selectedCustomer.phoneNumber})
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Amount (KES)"
                  variant="outlined"
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: theme.palette.grey[300] },
                      "&:hover fieldset": { borderColor: theme.palette.greenAccent.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.greenAccent.main },
                    },
                    "& .MuiInputLabel-root": { color: theme.palette.grey[100] },
                    "& .MuiInputBase-input": { color: theme.palette.grey[100] },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Mode of Payment"
                  variant="outlined"
                  value={modeOfPayment}
                  onChange={(e) => setModeOfPayment(e.target.value)}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: theme.palette.grey[300] },
                      "&:hover fieldset": { borderColor: theme.palette.greenAccent.main },
                      "&.Mui-focused fieldset": { borderColor: theme.palette.greenAccent.main },
                    },
                    "& .MuiInputLabel-root": { color: theme.palette.grey[100] },
                    "& .MuiInputBase-input": { color: theme.palette.grey[100] },
                    "& .MuiMenuItem-root": { color: theme.palette.grey[100] },
                  }}
                >
                  {["CASH", "MPESA", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  fullWidth
                  sx={{
                    bgcolor: theme.palette.greenAccent.main,
                    color: "#fff",
                    "&:hover": { bgcolor: theme.palette.greenAccent.main, opacity: 0.9 },
                    "&:disabled": { bgcolor: theme.palette.grey[300], color: theme.palette.grey[100] },
                    borderRadius: 20,
                    py: 1.5,
                  }}
                >
                  {isProcessing ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Payment"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.includes("successfully") ? "success" : "error"}
          sx={{ width: "100%", bgcolor: theme.palette.grey[300], color: theme.palette.grey[100] }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreatePayment;