import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import TitleComponent from "../components/title";
import axios from "axios";
import { getTheme } from "../store/theme";

// Function to flatten the nested payment response
const flattenPayments = (payments) => {
  return payments.map((payment) => {
    const receipt = payment.receipt || {};
    const receiptInvoices = receipt.receiptInvoices || [];
    const firstInvoice = receiptInvoices[0]?.invoice || {};

    return {
      id: payment.id,
      tenantId: payment.tenantId,
      amount: payment.amount,
      modeOfPayment: payment.modeOfPayment,
      transactionId: payment.transactionId,
      firstName: payment.firstName,
      receipted: payment.receipted,
      ref: payment.ref,
      createdAt: payment.createdAt,
      receiptId: receipt.id || null,
      receiptNumber: receipt.receiptNumber || "N/A",
      invoiceId: firstInvoice.id || null,
      invoiceNumber: firstInvoice.invoiceNumber || "N/A",
    };
  });
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [modeFilter, setModeFilter] = useState("all");
  const [showUnreceiptedOnly, setShowUnreceiptedOnly] = useState(false);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";

  // Redirect to login if no user
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch payments on initial mount
  useEffect(() => {
    if (currentUser) {
      fetchPayments(paginationModel.page, paginationModel.pageSize, modeFilter, showUnreceiptedOnly);
    }
  }, [currentUser]);

  // Fetch payments when filters or pagination change
  useEffect(() => {
    if (currentUser && !searchQuery) {
      fetchPayments(paginationModel.page, paginationModel.pageSize, modeFilter, showUnreceiptedOnly);
    }
  }, [paginationModel, modeFilter, showUnreceiptedOnly, currentUser]);

  // Handle closing the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
    setError(null); // Clear error after closing
  };

  // Fetch all payments or filtered by mode/unreceipted-only
  const fetchPayments = async (page, pageSize, mode = "all", unreceiptedOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = unreceiptedOnly
        ? `${BASEURL}/payments/unreceipted`
        : `${BASEURL}/payments`;
      const params = { page: page + 1, limit: pageSize };
      if (mode !== "all") params.mode = mode;

      const response = await axios.get(endpoint, {
        params,
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "User not found"
          : err.response?.data?.error || "Failed to fetch payments."
      );
      setOpenSnackbar(true);
      console.error("Error fetching payments:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments by name
  const fetchPaymentsByName = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/payments/search-by-name`, {
        params: { name: query, page: page + 1, limit: pageSize },
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "User not found"
          : err.response?.data?.error || "Failed to search payments by name."
      );
      setOpenSnackbar(true);
      console.error("Error fetching payments by name:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment by transaction ID
  const fetchPaymentByTransactionId = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/searchTransactionById`, {
        params: { transactionId: query, page: page + 1, limit: pageSize },
        withCredentials: true,
      });
      const { transaction } = response.data;
      const flattenedData = flattenPayments([transaction]);
      setPayments(flattenedData);
      setRowCount(1);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "User not found"
          : err.response?.data?.error || "Failed to search payment by transaction ID."
      );
      setOpenSnackbar(true);
      console.error("Error fetching payment by transaction ID:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments by ref number
  const fetchPaymentsByRef = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/payments/search-by-phone`, {
        params: { ref: query, page: page + 1, limit: pageSize },
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "User not found"
          : err.response?.data?.error || "Failed to search payments by ref number."
      );
      setOpenSnackbar(true);
      console.error("Error fetching payments by ref:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = (id) => {
    navigate(`/payments/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchQuery("");
    setPayments([]);
    setRowCount(0);
  };

  const handleModeFilterChange = (e) => {
    setModeFilter(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSearch = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") {
      fetchPayments(0, paginationModel.pageSize, modeFilter, showUnreceiptedOnly);
    } else {
      switch (searchType) {
        case "name":
          fetchPaymentsByName(0, paginationModel.pageSize, trimmedQuery);
          break;
        case "transactionId":
          fetchPaymentByTransactionId(0, paginationModel.pageSize, trimmedQuery);
          break;
        case "ref":
          fetchPaymentsByRef(0, paginationModel.pageSize, trimmedQuery);
          break;
        default:
          break;
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterUnreceipted = () => {
    setShowUnreceiptedOnly((prev) => {
      const newValue = !prev;
      fetchPayments(0, paginationModel.pageSize, modeFilter, newValue);
      return newValue;
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const columns = [
    {
      field: "view",
      headerName: "View",
      width: 100,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/payments/${params.row.id}`}
          sx={{ color: theme.palette.greenAccent.main }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
    { field: "amount", headerName: "Amount (KES)", width: 150 },
    { field: "modeOfPayment", headerName: "Mode of Payment", width: 180 },
    { field: "transactionId", headerName: "Transaction ID", width: 200 },
    { field: "firstName", headerName: "Customer Name", width: 180 },
    { field: "ref", headerName: "Reference Number", width: 180 },
    {
      field: "receipted",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Receipted" : "Not Receipted"}
          sx={{
            bgcolor: params.value ? theme.palette.greenAccent.main : "#ff9800",
            color: "#fff",
          }}
          size="small"
        />
      ),
    },
    {
      field: "receiptNumber",
      headerName: "Receipt Number",
      width: 180,
      renderCell: (params) =>
        params.row.receiptId ? (
          <Link
            to={`/receipts/${params.row.receiptId}`}
            style={{ textDecoration: "none", color: theme.palette.greenAccent.main }}
          >
            {params.value}
          </Link>
        ) : (
          "N/A"
        ),
    },
    {
      field: "invoiceNumber",
      headerName: "Paid Invoice",
      width: 200,
      renderCell: (params) =>
        params.row.invoiceId ? (
          <Link
            to={`/get-invoice/${params.row.invoiceId}`}
            style={{ textDecoration: "none", color: theme.palette.greenAccent.main }}
          >
            {params.value}
          </Link>
        ) : (
          "N/A"
        ),
    },
    {
      field: "createdAt",
      headerName: "Payment Date Sent",
      width: 180,
      renderCell: (params) => {
        if (!params?.value) return "N/A";
        try {
          return new Date(params.value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        } catch (error) {
          console.error("Invalid Date:", params.value);
          return "Invalid Date";
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) =>
        !params.row.receipted && (
          <IconButton
            onClick={() => handleEditPress(params.row.id)}
            sx={{ color: theme.palette.greenAccent.main }}
            aria-label="Edit payment"
          >
            <EditIcon />
          </IconButton>
        ),
    },
  ];

  return (
    <Box sx={{ minHeight: 500, width: "100%", padding: 2, ml: 30, minWidth: 1200, maxWidth: 1600 }}>
      <TitleComponent title="Payments" />

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="search-type-label">Search By</InputLabel>
          <Select
            labelId="search-type-label"
            value={searchType}
            label="Search By"
            onChange={handleSearchTypeChange}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.grey[300] },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.greenAccent.main },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.greenAccent.main },
            }}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="transactionId">Transaction ID</MenuItem>
            <MenuItem value="ref">Reference Number</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={`Search by ${searchType === "name" ? "Name" : searchType === "transactionId" ? "Transaction ID" : "Reference Number"}`}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          sx={{
            width: "400px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: theme.palette.grey[300] },
              "&:hover fieldset": { borderColor: theme.palette.greenAccent.main },
              "&.Mui-focused fieldset": { borderColor: theme.palette.greenAccent.main },
            },
            "& .MuiInputLabel-root": { color: theme.palette.grey[500] },
            "& .MuiInputBase-input": { color: theme.palette.primary },
          }}
        />


          <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: theme.palette.greenAccent.main,
            color: theme.palette.grey[100],
            "&:hover": { bgcolor: theme.palette.greenAccent.dark },
          }}
        >
          Search
        </Button>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="mode-filter-label">Payment Mode</InputLabel>
          <Select
            labelId="mode-filter-label"
            value={modeFilter}
            label="Payment Mode"
            onChange={handleModeFilterChange}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.grey[300] },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.greenAccent.main },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.greenAccent.main },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="CASH">Cash</MenuItem>
            <MenuItem value="MPESA">M-Pesa</MenuItem>
            <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
          </Select>
        </FormControl>
      
        <Button
          variant={showUnreceiptedOnly ? "contained" : "outlined"}
          onClick={handleFilterUnreceipted}
          sx={{
            bgcolor: showUnreceiptedOnly ? "#ff9800" : "transparent",
            color: showUnreceiptedOnly ? theme.palette.grey[100] : "#ff9800",
            borderColor: "#ff9800",
            "&:hover": {
              bgcolor: showUnreceiptedOnly ? "#f57c00" : "#ff980033",
            },
          }}
        >
          {showUnreceiptedOnly ? "Show All Payments" : "Show Unreceipted Only"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={70} sx={{ color: theme.palette.greenAccent.main }} />
        </Box>
      ) : (
        <DataGrid
          rows={payments}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableSelectionOnClick
          sx={{
            height: "70%",
            minHeight: 400,
            "& .MuiDataGrid-row": {
              "&:hover": { bgcolor: theme.palette.grey[800] },
            },
          }}
        />
      )}
      {!loading && (
        <Typography sx={{ textAlign: "center", mt: 2, color: theme.palette.grey[900] }}>
          Page {paginationModel.page + 1} of {Math.ceil(rowCount / paginationModel.pageSize) || 1}
        </Typography>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000} // Hides after 6 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position at top center
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;