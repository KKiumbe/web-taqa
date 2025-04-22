import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getTheme } from '../store/theme';
import TitleComponent from '../components/title';

const BASEURL = import.meta.env.VITE_BASE_URL ;

const reportData = {
  customers: [
    { name: 'All Customers', description: 'List of all active customers', endpoint: `${BASEURL}/reports/customers`, method: 'GET', requiresDate: false },
    { name: 'Dormant Customers', description: 'Customers with no recent activity', endpoint: `${BASEURL}/reports/dormant`, method: 'GET', requiresDate: false },
    {
      name: 'Customers by Collection Day',
      description: 'Customers categorized by day of service',
      endpoint: `${BASEURL}/reports/customer-per-collection-day`,
      method: 'GET',
      requiresDate: false,
    },
  ],
  invoices: [
    { name: 'Monthly Invoices', description: 'Invoices issued for selected month', endpoint: `${BASEURL}/reports/monthly-invoice`, method: 'GET', requiresDate: true },
    { name: 'Age Analysis', description: 'Invoice aging report', endpoint: `${BASEURL}/reports/age-analysis`, method: 'GET', requiresDate: false },
    {
      name: 'High Debt Customers',
      description: 'Customers with arrears > 2x monthly charge',
      endpoint: `${BASEURL}/reports/customers-debt-high`,
      method: 'GET',
      requiresDate: false,
    },
    {
      name: 'Low Debt Customers',
      description: 'Customers with arrears < monthly charge',
      endpoint: `${BASEURL}/reports/customers-debt-low`,
      method: 'GET',
      requiresDate: false,
    },
  ],
  payments: [
    { name: 'Monthly Payments', description: 'Payments for selected month', endpoint: `${BASEURL}/reports/payments`, method: 'GET', requiresDate: true },
    { name: 'Mpesa Payments', description: 'Mpesa payments for selected month', endpoint: `${BASEURL}/reports/mpesa`, method: 'GET', requiresDate: true },
    { name: 'All Receipts', description: 'Receipts for selected month', endpoint: `${BASEURL}/reports/receipts`, method: 'GET', requiresDate: true },
    { name: 'Income Report', description: 'Income summary for selected month', endpoint: `${BASEURL}/reports/income`, method: 'GET', requiresDate: true },
  ],
};

const ReportScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [downloading, setDownloading] = useState({});
  const [progress, setProgress] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  // Log currentUser on mount and changes
  useEffect(() => {
    //console.log('Current user:', currentUser);
    if (!currentUser) {
      console.log('No current user, redirecting to login');
      setNotification({
        open: true,
        message: 'Please log in to access reports.',
        severity: 'error',
      });
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDownload = async (endpoint, reportName, method, requiresDate) => {
    if (!currentUser) {
      console.log('Download attempt without user, redirecting');
      setNotification({
        open: true,
        message: 'Please log in to download reports.',
        severity: 'error',
      });
      navigate('/login');
      return;
    }

    if (requiresDate && (!month || !year)) {
      //console.log('Missing month/year for date-required report:', { endpoint, reportName });
      setNotification({
        open: true,
        message: 'Please select a month and year before downloading.',
        severity: 'error',
      });
      return;
    }

    setDownloading((prev) => ({ ...prev, [endpoint]: true }));
    setProgress((prev) => ({ ...prev, [endpoint]: 0 }));

    try {
      const query = requiresDate && method === 'GET' ? `?month=${month}&year=${year}` : '';
      const fullEndpoint = `${endpoint}${query}`;
      const requestBody = method === 'POST' && requiresDate ? { month, year } : {};
      // console.log('Sending request:', {
      //   endpoint: fullEndpoint,
      //   method,
      //   body: requestBody,
      //   withCredentials: true,
      //   tenantId: currentUser?.tenantId,
      // });

      let response;
      const config = {
        responseType: 'blob',
        withCredentials: true,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress((prev) => ({ ...prev, [endpoint]: percentCompleted }));
        },
      };

      if (method === 'POST') {
        response = await axios.post(endpoint, requestBody, config);
      } else {
        response = await axios.get(fullEndpoint, config);
      }

      //console.log('Download successful:', { endpoint, reportName, status: response.status });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = requiresDate
        ? `${reportName.toLowerCase().replace(/\s+/g, '-')}-${month}-${year}.pdf`
        : `${reportName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification({
        open: true,
        message: `${reportName} downloaded successfully!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      let message = 'Failed to download report. Please try again.';
      if (error.response?.status === 400) {
        message = error.response.data?.error || 'Invalid month or year. Data may not be available.';
      } else if (error.response?.status === 403) {
        message = 'Unauthorized. Please log in again.';
        navigate('/login');
      } else if (error.response?.status === 404) {
        message = error.response.data?.message || 'Tenant not found. Please check your account settings or contact support.';
      }
      setNotification({ open: true, message, severity: 'error' });
    } finally {
      setDownloading((prev) => ({ ...prev, [endpoint]: false }));
      setProgress((prev) => ({ ...prev, [endpoint]: 0 }));
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Generate years from 2025 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: Math.max(currentYear - 2024 + 2, 2) }, (_, i) => 2025 + i);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const renderTabContent = (tabData) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Report Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tabData.map((report, index) => (
            <TableRow key={index}>
              <TableCell>{report.name}</TableCell>
              <TableCell>{report.description}</TableCell>
              <TableCell>
                <Box sx={{ position: 'relative' }}>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: theme.palette.greenAccent.main }}
                    onClick={() => handleDownload(report.endpoint, report.name, report.method, report.requiresDate)}
                    disabled={downloading[report.endpoint] || !currentUser}
                  >
                    {downloading[report.endpoint] ? 'Downloading...' : 'Download'}
                  </Button>
                  {downloading[report.endpoint] && (
                    <LinearProgress
                      variant="determinate"
                      value={progress[report.endpoint] || 0}
                      sx={{ position: 'absolute', bottom: -4, left: 0, right: 0 }}
                    />
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container sx={{ width: '100%', ml: 20 }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          <TitleComponent title="Reports Center" />
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                label="Month"
              >
                <MenuItem value="">Select Month</MenuItem>
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                label="Year"
              >
                <MenuItem value="">Select Year</MenuItem>
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{
            minWidth: 500,
            maxWidth: 1200,
            width: '100%',
            color: theme.palette.primary.contrastText,
            mb: 3,
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 2,
            '& .MuiTab-root': { color: theme.palette.primary.contrastText },
            '& .Mui-selected': { backgroundColor: theme.palette.greenAccent.main },
          }}
        >
          <Tab label="Customers" />
          <Tab label="Invoices" />
          <Tab label="Payments" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && renderTabContent(reportData.customers)}
          {activeTab === 1 && renderTabContent(reportData.invoices)}
          {activeTab === 2 && renderTabContent(reportData.payments)}
        </Box>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportScreen;