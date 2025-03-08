import React, { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Box,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import TitleComponent from "../components/title";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../store/theme";
import { useAuthStore } from "../store/authStore";
import debounce from "lodash/debounce"; // Add lodash for debounce

const CreateInvoice = () => {
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);


  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ description: "", amount: "", quantity: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPhoneSearch, setIsPhoneSearch] = useState(false);

  const BASEURL = "https://taqa.co.ke/api";
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Clean search query (remove content in parentheses)
  const cleanSearchQuery = (query) => query.replace(/\s*\([^)]+\)/g, "").trim();

  // Unified search handler
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const isPhoneNumber = /^\d+$/.test(query);

    try {
      const url = isPhoneNumber 
        ? `${BASEURL}/search-customer-by-phone` 
        : `${BASEURL}/search-customer-by-name`;
      const params = isPhoneNumber 
        ? { phone: query } 
        : { name: cleanSearchQuery(query) };

      if (isPhoneNumber && query.length < 10) {
        setSearchResults([]);
        return; // Don’t call API until 10 digits
      }

      const response = await axios.get(url, { params, withCredentials: true });
      const results = isPhoneNumber 
        ? [response.data] 
        : Array.isArray(response.data) ? response.data : [];
      
      setSearchResults(results.length ? results : []);
      if (!results.length) {
        setSnackbar({ 
          open: true, 
          message: isPhoneNumber ? "No customer found with that phone number" : "No customer found with that name",
          severity: "info" 
        });
      }
    } catch (error) {
      console.error("Search error:", error.response || error);
      setSnackbar({
        open: true,
        message: error.response?.status === 404 
          ? (isPhoneNumber ? "No customer found with that phone number" : "No customer found with that name")
          : `Error searching customers: ${error.response?.data?.message || error.message}`,
        severity: "error",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced phone search
  const debouncedPhoneSearch = useCallback(
    debounce((query) => {
      if (isPhoneSearch) handleSearch(query);
    }, 500), // 500ms delay
    [isPhoneSearch]
  );

  // Handle input change for search
  const handleInputChange = (e, value) => {
    const newValue = e ? e.target.value : value; // Handle both TextField and Autocomplete
    setSearchQuery(newValue);
    setIsPhoneSearch(/^\d+$/.test(newValue));
    setSelectedCustomer(null); // Reset selected customer on search type change

    if (isPhoneSearch) {
      debouncedPhoneSearch(newValue); // Debounce phone search
    } else {
      handleSearch(newValue); // Immediate name search for Autocomplete
    }
  };

  // Handle customer selection and clear search query for name search
  const handleCustomerSelect = (event, newValue) => {
    setSelectedCustomer(newValue);
    if (!isPhoneSearch && newValue) {
      setSearchQuery(""); // Clear search query for name search
      setSearchResults([]); // Clear search results
    }
  };

  // Handle form field changes
  const handleFormChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Create invoice
  const handleCreateInvoice = async () => {
    const { description, amount, quantity } = formData;
    if (!description || !amount || !quantity || !selectedCustomer) {
      setSnackbar({ open: true, message: "Please fill in all fields and select a customer", severity: "error" });
      return;
    }

    const invoiceData = {
      customerId: selectedCustomer.id,
      invoiceItemsData: [{ description, amount: parseFloat(amount), quantity: parseInt(quantity) }],
    };

    setLoading(true);
    try {
      const response = await axios.post(`${BASEURL}/invoices/`, invoiceData, { withCredentials: true });
      setSnackbar({ open: true, message: "Invoice created successfully!", severity: "success" });
      navigate(`/get-invoice/${response.data.newInvoice.id}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setSnackbar({ open: true, message: "Failed to create invoice. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Render search results for phone search
  const renderPhoneSearchResults = () => (
    searchResults.length > 0 ? (
      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Search Results</Typography>
          {searchResults.map((customer) => (
            <Box
              key={customer.id}
              sx={{ p: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
              onClick={() => setSelectedCustomer(customer)}
            >
              <Typography>{`${customer.firstName} ${customer.lastName} (${customer.phoneNumber})`}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    ) : (
      !isSearching && searchQuery && searchQuery.length >= 10 && (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Search Results</Typography>
            <Typography>No customer found with phone number: {searchQuery}</Typography>
          </CardContent>
        </Card>
      )
    )
  );

  // Render selected customer
  const renderSelectedCustomer = () =>
    selectedCustomer && (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Selected Customer</Typography>
          <Typography>Name: {`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</Typography>
          <Typography>Phone: {selectedCustomer.phoneNumber}</Typography>
          <Typography>Category: {selectedCustomer.category}</Typography>
          <Typography>Monthly Charge: {selectedCustomer.monthlyCharge}</Typography>
          <Typography>Closing Balance: {selectedCustomer.closingBalance}</Typography>
        </CardContent>
      </Card>
    );

  return (
    <Box sx={{ maxWidth: 950, padding: 3, ml: 50 }}>
      <TitleComponent title="Create an Invoice" />
      
      {/* Search Input */}
      {isPhoneSearch ? (
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Search Customer by Phone"
            variant="outlined"
            value={searchQuery}
            onChange={handleInputChange}
            fullWidth
            disabled={isSearching}
            inputProps={{ maxLength: 15 }} // Limit input length if needed
          />
          {/* Removed manual Search button since debounce handles it */}
        </Box>
      ) : (
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) => `${option?.firstName} ${option?.lastName} (${option?.phoneNumber})`}
          onInputChange={handleInputChange}
          onChange={handleCustomerSelect}
          loading={isSearching}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Customer by Name"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: isSearching ? <CircularProgress size={20} /> : params.InputProps.endAdornment,
              }}
            />
          )}
          sx={{ mb: 2 }}
        />
      )}

      {/* Phone Search Results */}
      {isPhoneSearch && renderPhoneSearchResults()}
      
      {/* Selected Customer */}
      {renderSelectedCustomer()}

      {/* Invoice Form */}
      <TextField
        label="Description"
        value={formData.description}
        onChange={handleFormChange("description")}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Amount"
        value={formData.amount}
        onChange={handleFormChange("amount")}
        fullWidth
        margin="normal"
        type="number"
      />
      <TextField
        label="Quantity"
        value={formData.quantity}
        onChange={handleFormChange("quantity")}
        fullWidth
        margin="normal"
        type="number"
        inputProps={{ min: 0, step: 1 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateInvoice}
        disabled={loading}
        sx={{ mt: 2, display: "block", color: theme.palette.greenAccent.main }}
      >
        {loading ? <CircularProgress size={24} /> : "Create Invoice"}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateInvoice;