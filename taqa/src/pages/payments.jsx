import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Box,
  Alert,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Chip,
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
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreceiptedOnly, setShowUnreceiptedOnly] = useState(false);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  //const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
  const theme = getTheme();
  const BASEURL = "https://taqa.co.ke/api";
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Fetch all payments or only unreceipted payments based on filter
  const fetchAllPayments = async (page, pageSize, unreceiptedOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = unreceiptedOnly ? `${BASEURL}/payments/unreceipted` : `${BASEURL}/payments`;
      const response = await axios.get(endpoint, {
        params: {
          page: page + 1,
          limit: pageSize,
        },
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch payments.");
      console.error("Error fetching payments:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments by phone number
  const fetchPaymentsByPhone = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/payments/search-by-phone`, {
        params: {
          phone: query,
          page: page + 1,
          limit: pageSize,
        },
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search payments by phone.");
      console.error("Error fetching payments by phone:", err);
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
      const [firstName, ...lastNameParts] = query.trim().split(" ");
      const lastName = lastNameParts.length > 0 ? lastNameParts.join(" ") : undefined;
      const response = await axios.get(`${BASEURL}/payments/search-by-name`, {
        params: {
          firstName,
          lastName,
          page: page + 1,
          limit: pageSize,
        },
        withCredentials: true,
      });
      const { payments: fetchedPayments, total } = response.data;
      const flattenedData = flattenPayments(fetchedPayments || []);
      setPayments(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search payments by name.");
      console.error("Error fetching payments by name:", err);
      setPayments([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and pagination updates
  useEffect(() => {
    if (!currentUser) return;
    if (!searchQuery) {
      fetchAllPayments(paginationModel.page, paginationModel.pageSize, showUnreceiptedOnly);
    }
  }, [paginationModel, searchQuery, currentUser, showUnreceiptedOnly]);

  const handleEditPress = (id) => {
    navigate(`/payments/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") {
      fetchAllPayments(0, paginationModel.pageSize, showUnreceiptedOnly);
    } else {
      const isPhoneNumber = /^\d+$/.test(trimmedQuery);
      if (isPhoneNumber) {
        fetchPaymentsByPhone(0, paginationModel.pageSize, trimmedQuery);
      } else {
        fetchPaymentsByName(0, paginationModel.pageSize, trimmedQuery);
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
      fetchAllPayments(0, paginationModel.pageSize, newValue); // Fetch with new filter state
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
        if (!params?.value) return "N/A"; // Ensure value exists
    
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
        <TextField
          label="Search by Name or Phone Number"
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
            "& .MuiInputBase-input": { color: theme.palette.grey[900] },
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
    </Box>
  );
};

export default Payments;