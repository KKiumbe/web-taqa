import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Button, 
  TextField, 
  Container, 
  Paper, 
  Snackbar, 
  Alert,
} from '@mui/material';
import { getTheme } from '../store/theme';
import TitleComponent from '../components/title';

const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
const theme = getTheme();

function DebtManager() {
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [balanceAmount, setBalanceAmount] = useState(''); // State for custom balance input
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage('');
    setBalanceAmount(''); // Reset balance input when switching tabs
  };
 
  // 1. Send SMS to All Customers with Arrears
  const handleSendSmsToAll = async () => {
    try {
      const response = await axios.post(`${BASEURL}/send-sms-unpaid`,{ withCredentials: true });
      setMessage(response.data.message || 'SMS sent to all customers with arrears');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error sending SMS');
    }
  };

  // 2. Send SMS to Customers with High Balance
  const handleSendSmsHighBalance = async () => {
    try {
      const response = await axios.post(`${BASEURL}/send-sms-high-balance`,{ withCredentials: true });
      setMessage(response.data.message || 'SMS sent to customers with high balance');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error sending SMS');
    }
  };

  // 3. Send SMS to Customers with Low Balance
  const handleSendSmsLowBalance = async () => {
    try {
      const response = await axios.post(`${BASEURL}/send-sms-low-balance`,{ withCredentials: true });
      setMessage(response.data.message || 'SMS sent to customers with low balance');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error sending SMS');
    }
  };

  // 4. Send SMS to Customers Above Custom Balance
  const handleSendSmsCustomBalance = async () => {
    if (!balanceAmount || isNaN(balanceAmount) || Number(balanceAmount) <= 0) {
      setMessage('Please enter a valid balance amount');
      return;
    }
    try {
      const response = await axios.post(`${BASEURL}/send-sms-custom-balance`, 
        { balance: Number(balanceAmount) }, // Send balance in request body
        { withCredentials: true }
      );
      setMessage(response.data.message || `SMS sent to customers with balance above ${balanceAmount}`);
      setBalanceAmount(''); // Clear input after sending
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error sending SMS');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 35 }}>

<Typography
          variant="h4"
          sx={{ color: theme.palette.primary.contrastText, marginTop:-40, }}
        >
          <TitleComponent title="Debt Manager" />
        </Typography>
      <Paper elevation={3}>
      
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.primary.main ,marginTop:10}}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered 
            sx={{
              mb: 3,
              border: `1px solid ${theme.palette.primary.light}`,
              borderRadius: 2,
              '& .MuiTab-root': { color: theme.palette.primary.contrastText },
              '& .Mui-selected': { color: theme.palette.greenAccent.main },
            }}
          >
            <Tab label="All with Arrears" />
            <Tab label="High Balance" />
            <Tab label="Low Balance" />
            <Tab label="Custom Balance" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Tab 0: Send SMS to All with Arrears */}
          {tabValue === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Send SMS to All Customers with Arrears
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendSmsToAll}
                sx={{ mt: 2, bgcolor: theme.palette.greenAccent.main }} 
              >
                Send SMS
              </Button>
            </>
          )}

          {/* Tab 1: Send SMS to Customers with High Balance */}
          {tabValue === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                Send SMS to Customers with High Balance
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendSmsHighBalance}
                sx={{ mt: 2, bgcolor: theme.palette.greenAccent.main }}
              >
                Send SMS
              </Button>
            </>
          )}

          {/* Tab 2: Send SMS to Customers with Low Balance */}
          {tabValue === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Send SMS to Customers with Low Balance
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendSmsLowBalance}
                sx={{ mt: 2, bgcolor: theme.palette.greenAccent.main }}
              >
                Send SMS
              </Button>
            </>
          )}

          {/* Tab 3: Send SMS to Customers Above Custom Balance */}
          {tabValue === 3 && (
            <>
              <Typography variant="h6" gutterBottom>
                Send SMS to Customers Above Custom Balance
              </Typography>
              <TextField
                label="Enter Balance Amount"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                type="number"
                placeholder="e.g., 1000"
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendSmsCustomBalance}
                sx={{ mt: 2, bgcolor: theme.palette.greenAccent.main }}
              >
                Send SMS
              </Button>
            </>
          )}

          {/* Response Message */}
          {message && (
            <Box sx={{ mt: 2 }}>
              <Typography color={message.includes('Error') ? 'error' : 'success'}>
                {message}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Snackbar for errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DebtManager;