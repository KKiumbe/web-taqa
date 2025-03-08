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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import TitleComponent from "../components/title";
import { getTheme } from "../store/theme";
import axios from "axios";

// Function to flatten the nested receipt response
const flattenReceipts = (receipts) => {
  return receipts.map((receipt) => {
    const payment = receipt.payment || {};
    const customer = receipt.customer || {};
    const firstInvoice = receipt.receiptInvoices?.[0]?.invoice || {};

    return {
      id: receipt.id,
      tenantId: receipt.tenantId,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      modeOfPayment: receipt.modeOfPayment,
      paidBy: receipt.paidBy,
      transactionCode: receipt.transactionCode,
      phoneNumber: receipt.phoneNumber,
      paymentId: receipt.paymentId,
      customerId: receipt.customerId,
      createdAt: receipt.createdAt,
      paymentFirstName: payment.firstName,
      paymentTransactionId: payment.transactionId,
      paymentCreatedAt: payment.createdAt,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      customerPhoneNumber: customer.phoneNumber,
      customerClosingBalance: customer.closingBalance,
      invoiceId: firstInvoice.id,
      invoiceNumber: firstInvoice.invoiceNumber,
      invoiceAmount: firstInvoice.invoiceAmount,
      invoiceStatus: firstInvoice.status,
      invoiceCreatedAt: firstInvoice.createdAt,
    };
  });
};

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
  const theme = getTheme();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const fetchAllReceipts = async (page, pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/receipts`, {
        params: { page: page + 1, limit: pageSize },
        withCredentials: true,
      });
      const { receipts: fetchedReceipts, total } = response.data;
      const flattenedData = flattenReceipts(fetchedReceipts || []);
      setReceipts(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      let errorMessage = "Failed to fetch receipts.";
      if (err.code === "ERR_NETWORK") {
        errorMessage = "Network error: Is the backend server running on localhost:5000?";
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Error ${err.response.status}: ${err.response.statusText}`;
      }
      setError(errorMessage);
      console.error("Error fetching receipts:", err);
      setReceipts([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptsByPhone = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASEURL}/search-by-phone`, {
        params: {
          phone: query,
          page: page + 1,
          limit: pageSize,
        },
        withCredentials: true,
      });
      const { receipts: fetchedReceipts, total } = response.data;
      const flattenedData = flattenReceipts(fetchedReceipts || []);
      setReceipts(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search receipts by phone.");
      console.error("Error fetching receipts by phone:", err);
      setReceipts([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptsByName = async (page, pageSize, query) => {
    setLoading(true);
    setError(null);
    try {
      const [firstName, ...lastNameParts] = query.trim().split(" ");
      const lastName = lastNameParts.length > 0 ? lastNameParts.join(" ") : undefined;
      const response = await axios.get(`${BASEURL}/search-by-name`, {
        params: {
          firstName,
          lastName,
          page: page + 1,
          limit: pageSize,
        },
        withCredentials: true,
      });
      const { receipts: fetchedReceipts, total } = response.data;
      const flattenedData = flattenReceipts(fetchedReceipts || []);
      setReceipts(flattenedData);
      setRowCount(total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search receipts by name.");
      console.error("Error fetching receipts by name:", err);
      setReceipts([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    if (!searchQuery) {
      fetchAllReceipts(paginationModel.page, paginationModel.pageSize);
    }
  }, [paginationModel, searchQuery, currentUser]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") {
      fetchAllReceipts(0, paginationModel.pageSize);
    } else {
      const isPhoneNumber = /^\d+$/.test(trimmedQuery);
      if (isPhoneNumber) {
        fetchReceiptsByPhone(0, paginationModel.pageSize, trimmedQuery);
      } else {
        fetchReceiptsByName(0, paginationModel.pageSize, trimmedQuery);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const columns = [
    {
      field: "view",
      headerName: "View",
      width: 100,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/receipts/${params.row.id}`} // Send receipt ID in URL
          sx={{ color: theme.palette.greenAccent.main }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
    { field: "receiptNumber", headerName: "Receipt Number", width: 180 },
    { field: "amount", headerName: "Amount (KES)", width: 150 },
    { field: "modeOfPayment", headerName: "Mode of Payment", width: 180 },
    { field: "transactionCode", headerName: "Transaction Code", width: 200 },
    { field: "paidBy", headerName: "Paid By", width: 180 },
    { field: "phoneNumber", headerName: "Receipt Phone", width: 180 },
    { field: "customerFirstName", headerName: "First Name", width: 150 },
    { field: "customerLastName", headerName: "Last Name", width: 150 },
    { field: "customerPhoneNumber", headerName: "Customer Phone", width: 180 },


     {
          field: "invoiceNumber",
          headerName: "Paid Invoice",
          width: 200,
          renderCell: (params) =>
            params.row.invoiceId ? (
              <Link to={`/get-invoice/${params.row.invoiceId}`} style={{ textDecoration: "none", color: "#1976d2" }}>
                {params.value}
              </Link>
            ) : (
              "N/A"
            ),
        },
   
        {
          field: "createdAt",
          headerName: " Receipted Date ",
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
  ];

  return (
    <Box sx={{ minHeight: 500, width: "100%", padding: 2, ml: 30, minWidth: 1200, maxWidth: 1600 }}>
      <TitleComponent title="Receipts" />

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="Search by Name or Phone"
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
            backgroundColor: theme.palette.background.paper,
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
          rows={receipts}
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
            "& .MuiDataGrid-columnHeaders": { bgcolor: theme.palette.grey[300] },
            "& .MuiDataGrid-footerContainer": {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.grey[100],
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

export default Receipts;