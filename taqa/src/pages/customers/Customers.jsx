import { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import {
  CircularProgress,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Snackbar,
  IconButton,
  Alert,
} from "@mui/material";
import TitleComponent from "../../components/title";
import { getTheme } from "../../store/theme";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useAuthStore } from "../../store/authStore";

const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [tenantStatus, setTenantStatus] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCustomers, setTotalCustomers] = useState(0);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";

  // Fetch tenant status
  const fetchTenantStatus = async () => {
    try {
      const response = await axios.get(`${BASEURL}/tenant-status`, {
        withCredentials: true,
      });
      setTenantStatus(response.data.status);
    } catch (err) {
      setTenantStatus("EXPIRED"); // Default to EXPIRED on error to prevent unauthorized access
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to fetch tenant status.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      fetchTenantStatus();
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser && tenantStatus === "ACTIVE" && !searchQuery) {
      fetchCustomers(paginationModel.page, paginationModel.pageSize);
    } else if (tenantStatus === "EXPIRED" || tenantStatus === "DISABLED") {
      setSnackbar({
        open: true,
        message: "Feature disabled due to non-payment of the service.",
        severity: "warning",
      });
      setCustomers([]);
      setSearchResults([]);
      setTotalCustomers(0);
    }
  }, [currentUser, tenantStatus, paginationModel]);

  const fetchCustomers = async (page, pageSize) => {
    if (tenantStatus !== "ACTIVE") {
      setSnackbar({
        open: true,
        message: "Feature disabled due to non-payment of the service.",
        severity: "warning",
      });
      setCustomers([]);
      setSearchResults([]);
      setTotalCustomers(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });
    try {
      const response = await axios.get(`${BASEURL}/customers`, {
        params: { page: page + 1, limit: pageSize }, // Backend uses 1-based index
        withCredentials: true,
      });

      const { customers, total } = response.data;
      setCustomers(customers);
      setSearchResults(customers);
      setTotalCustomers(total || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 402) {
        setTenantStatus(error.response.data.status || "EXPIRED");
        setSnackbar({
          open: true,
          message:
            error.response.data?.error ||
            "Feature disabled due to non-payment of the service.",
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            error.response?.status === 404
              ? "Record not found"
              : error.response?.data?.error || "Failed to fetch customers.",
          severity: "error",
        });
      }
      setCustomers([]);
      setSearchResults([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (tenantStatus !== "ACTIVE") {
      setSnackbar({
        open: true,
        message: "Feature disabled due to non-payment of the service.",
        severity: "warning",
      });
      setSearchResults([]);
      setTotalCustomers(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSnackbar({ open: false, message: "", severity: "success" });
    if (!searchQuery.trim()) {
      setSearchResults(customers);
      setIsSearching(false);
      return;
    }

    try {
      const isPhoneNumber = /^\d+$/.test(searchQuery);
      const response = await axios.get(`${BASEURL}/search-customers`, {
        params: {
          phone: isPhoneNumber ? searchQuery : undefined,
          name: !isPhoneNumber ? searchQuery : undefined,
        },
        withCredentials: true,
      });

      setSearchResults(response.data);
      setTotalCustomers(response.data.length); // Adjust if backend provides total
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else if (error.response?.status === 402) {
        setTenantStatus(error.response.data.status || "EXPIRED");
        setSnackbar({
          open: true,
          message:
            error.response.data?.error ||
            "Feature disabled due to non-payment of the service.",
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message:
            error.response?.status === 404
              ? "Record not found"
              : error.response?.data?.error || "Failed to search customers.",
          severity: "error",
        });
      }
      setSearchResults([]);
      setTotalCustomers(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const columns = [
    {
      field: "actions",
      headerName: "View",
      width: 100,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/customer-details/${params.row.id}`}
          sx={{ color: theme?.palette?.primary?.main || "green" }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
    {
      field: "edit",
      headerName: "Edit",
      width: 100,
      renderCell: (params) => (
        <IconButton
          component={Link}
          to={`/customer-edit/${params.row.id}`}
          sx={{ color: theme?.palette?.primary?.main || "green" }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "closingBalance", headerName: "Closing Balance", width: 100 },
    { field: "monthlyCharge", headerName: "Monthly Charge", width: 100 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "garbageCollectionDay", headerName: "Collection Day", width: 150 },
    { field: "collected", headerName: "Collected", width: 100, type: "boolean" },
    { field: "trashBagsIssued", headerName: "Trash Bags Issued", width: 150, type: "boolean" },
    { field: "estateName", headerName: "Estate Name", width: 150 },
    { field: "building", headerName: "Building", width: 150 },
    { field: "houseNumber", headerName: "House Number", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
  ];

  return (
    <Box sx={{ bgcolor: theme?.palette?.background?.paper || "#fff", minHeight: "100vh" }}>
      <Typography component="div" variant="h5" gutterBottom sx={{ padding: 3, ml: 5 }}>
        <TitleComponent title="Customers" />
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2, ml: 10 }}>
        <TextField
          label="Search by Name or Phone"
          variant="outlined"
          size="small"
          sx={{
            width: "400px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: theme?.palette?.grey[300] || "#ccc" },
              "&:hover fieldset": { borderColor: theme?.palette?.greenAccent?.main || "green" },
              "&.Mui-focused fieldset": { borderColor: theme?.palette?.greenAccent?.main || "green" },
            },
            "& .MuiInputLabel-root": { color: theme?.palette?.grey[100] || "#333" },
            "& .MuiInputBase-input": { color: theme?.palette?.grey[100] || "#333" },
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="contained"
          sx={{
            bgcolor: theme?.palette?.greenAccent?.main || "green",
            color: theme?.palette?.grey[100] || "#fff",
            "&:hover": { bgcolor: theme?.palette?.greenAccent?.dark || "darkgreen" },
            width: "150px",
          }}
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
        <TextField
          label="Page Number"
          type="number"
          variant="outlined"
          size="small"
          sx={{
            width: "100px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: theme?.palette?.grey[300] || "#ccc" },
              "&:hover fieldset": { borderColor: theme?.palette?.greenAccent?.main || "green" },
              "&.Mui-focused fieldset": { borderColor: theme?.palette?.greenAccent?.main || "green" },
            },
            "& .MuiInputLabel-root": { color: theme?.palette?.grey[100] || "#333" },
            "& .MuiInputBase-input": { color: theme?.palette?.grey[100] || "#333" },
          }}
          value={paginationModel.page + 1} // Display 1-based index
          onChange={(e) => {
            const newPage = Math.max(1, parseInt(e.target.value, 10) || 1) - 1; // Convert to 0-based index
            setPaginationModel((prev) => ({ ...prev, page: newPage }));
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", ml: 20 }}>
          <CircularProgress size={30} sx={{ color: theme?.palette?.greenAccent?.main || "green" }} />
        </Box>
      ) : (
        <Paper sx={{ width: "90%", overflow: "auto", height: 500, ml: 10, maxWidth: 1400 }}>
          <DataGrid
            rows={searchResults}
            columns={columns}
            getRowId={(row) => row.id}
            paginationMode="server"
            rowCount={totalCustomers}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            checkboxSelection
            disableSelectionOnClick
            sx={{
              minWidth: 900,
              bgcolor: theme?.palette?.background?.paper || "#fff",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: theme?.palette?.primary?.main || "green",
                color: theme?.palette?.grey[100] || "#fff",
              },
              "& .MuiDataGrid-cell": { color: theme?.palette?.grey[100] || "#333" },
            }}
            components={{
              Toolbar: () => (
                <GridToolbarContainer>
                  <GridToolbarExport />
                </GridToolbarContainer>
              ),
            }}
          />
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            snackbar.severity === "warning" ? (
              <Button color="inherit" size="small" component={Link} to="/billing">
                Pay Now
              </Button>
            ) : null
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomersScreen;