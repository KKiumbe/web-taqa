import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
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

const CreateInvoice = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isPhoneSearch, setIsPhoneSearch] = useState(false);

  const BASEURL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const theme = getTheme();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  const cleanSearchQuery = (query) => {
    return query.replace(/\s*\([^)]+\)/g, '').trim();
  };

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
        const customer = response.data;
        setSearchResults(customer ? [customer] : []);
      } else {
        const cleanedQuery = cleanSearchQuery(searchQuery);
        if (!cleanedQuery) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        response = await axios.get(`${BASEURL}/search-customer-by-name`, {
          params: { name: cleanedQuery },
          withCredentials: true,
        });
        console.log("Name search response:", response.data);
        const results = Array.isArray(response.data) ? response.data : [];
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching customers:", error.response || error);
      if (error.response?.status === 404) {
        setSnackbarMessage(isPhoneSearch ? 
          "No customer found with that phone number" : 
          "No customer found with that name"
        );
      } else {
        setSnackbarMessage("Error searching customers: " + (error.response?.data?.message || error.message));
      }
      setSearchResults([]);
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNameSearch = async (value) => {
    if (/^\d+$/.test(value)) {
      // If input becomes numeric, switch to phone search mode and don't search
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
      const cleanedQuery = cleanSearchQuery(value);
      if (!cleanedQuery) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      const response = await axios.get(`${BASEURL}/search-customer-by-name`, {
        params: { name: cleanedQuery },
        withCredentials: true,
      });
      console.log("Name search response:", response.data);
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching customers by name:", error.response || error);
      if (error.response?.status === 404) {
        setSnackbarMessage("No customer found with that name");
      } else {
        setSnackbarMessage("Error searching customers: " + (error.response?.data?.message || error.message));
      }
      setSearchResults([]);
      setSnackbarOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!description || !amount || !quantity || !selectedCustomer) {
      setSnackbarMessage("Please fill in all fields and select a customer.");
      setSnackbarOpen(true);
      return;
    }

    const invoiceData = {
      customerId: selectedCustomer.id,
      invoiceItemsData: [{ description, amount: parseFloat(amount), quantity: parseInt(quantity) }],
    };

    setLoading(true);
    try {
      const response = await axios.post(`${BASEURL}/invoices/`, invoiceData, { withCredentials: true });
      const newInvoiceId = response.data.newInvoice.id;
      setSnackbarMessage("Invoice created successfully!");
      setSnackbarOpen(true);
      navigate(`/get-invoice/${newInvoiceId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setSnackbarMessage("Failed to create invoice. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const isNumeric = /^\d+$/.test(value);
    setIsPhoneSearch(isNumeric);
    setSearchPerformed(false);
    setSearchResults([]);
    // Reset selected customer when switching search type
    if (isNumeric !== isPhoneSearch) {
      setSelectedCustomer(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 950, padding: 3, ml: 50 }}>
      <TitleComponent title="Create an Invoice"/>
      {isPhoneSearch ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Search Customer by Phone"
            variant="outlined"
            value={searchQuery}
            onChange={handleInputChange}
            fullWidth
            disabled={isSearching}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>
      ) : (
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) => `${option?.firstName} ${option?.lastName} (${option?.phoneNumber})`}
          onInputChange={(event, value) => {
            setSearchQuery(value);
            handleNameSearch(value);
          }}
          onChange={(event, newValue) => setSelectedCustomer(newValue)}
          loading={isSearching}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Customer by Name"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: isSearching ? <CircularProgress size={20} /> : null,
              }}
            />
          )}
          sx={{ mb: 2 }}
        />
      )}

      {isPhoneSearch && searchPerformed && searchResults.length > 0 && (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Search Results</Typography>
            {searchResults.map((customer) => (
              <Box 
                key={customer.id}
                sx={{ 
                  p: 1, 
                  cursor: 'pointer', 
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
                onClick={() => setSelectedCustomer(customer)}
              >
                <Typography>
                  {`${customer?.firstName} ${customer?.lastName} (${customer?.phoneNumber})`}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {isPhoneSearch && searchPerformed && searchResults.length === 0 && !isSearching && (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Search Results</Typography>
            <Typography>No customer found with phone number: {searchQuery}</Typography>
          </CardContent>
        </Card>
      )}

      {selectedCustomer && (
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
      )}

      <TextField 
        label="Description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        fullWidth 
        margin="normal" 
      />
      <TextField 
        label="Amount" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        fullWidth 
        margin="normal" 
        type="number" 
      />
      <TextField 
        label="Quantity" 
        value={quantity} 
        onChange={(e) => setQuantity(e.target.value)} 
        fullWidth 
        margin="normal" 
        type="number" 
        inputProps={{min:0,step:1}}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateInvoice}
        disabled={loading}
        sx={{ mt: 2, display: "block", color: theme.palette.greenAccent.main}}
      >
        {loading ? <CircularProgress size={24} /> : "Create Invoice"}
      </Button>

      <Snackbar 
        open={snackbarOpen} 
        onClose={() => setSnackbarOpen(false)} 
        message={snackbarMessage} 
        autoHideDuration={3000} 
      />
    </Box>
  );
};

export default CreateInvoice;