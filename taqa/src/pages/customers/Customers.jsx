// src/screens/CustomersScreen.jsx
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
import { useTenantStore } from "../../store/tenantStatus";


const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalCustomers, setTotalCustomers] = useState(0);

  const currentUser = useAuthStore((state) => state.currentUser);
  const { tenantStatus, error, isApiEnabled, clearError } = useTenantStore();
  const navigate = useNavigate();
  const theme = getTheme();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (isApiEnabled() && !searchQuery) {
      fetchCustomers(paginationModel.page, paginationModel.pageSize);
    } else if (!isApiEnabled()) {
      setCustomers([]);
      setSearchResults([]);
      setTotalCustomers(0);
    }
  }, [currentUser, tenantStatus, paginationModel, searchQuery, isApiEnabled, navigate]);

  const fetchCustomers = async (page, pageSize) => {
    if (!isApiEnabled()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/customers`, {
        params: { page: page + 1, limit: pageSize },
        withCredentials: true,
      });

      const { customers, total } = response.data;
      setCustomers(customers);
      setSearchResults(customers);
      setTotalCustomers(total || 0);
    } catch (error) {
      console.error("fetchCustomers error:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        useTenantStore.setState({
          error: {
            message:
              error.response?.status === 402
                ? "Feature disabled due to non-payment of the service."
                : error.response?.status === 404
                ? "Record not found"
                : error.response?.data?.error || "Failed to fetch customers.",
            severity: error.response?.status === 402 ? "warning" : "error",
          },
        });
        if (error.response?.status === 402) {
          useTenantStore.setState({ tenantStatus: error.response.data.status || "EXPIRED" });
        }
      }
      setCustomers([]);
      setSearchResults([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!isApiEnabled()) {
      return;
    }

    setIsSearching(true);
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
      console.error("handleSearch error:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        useTenantStore.setState({
          error: {
            message:
              error.response?.status === 402
                ? "Feature disabled due to non-payment of the service."
                : error.response?.status === 404
                ? "Record not found"
                : error.response?.data?.error || "Failed to search customers.",
            severity: error.response?.status === 402 ? "warning" : "error",
          },
        });
        if (error.response?.status === 402) {
          useTenantStore.setState({ tenantStatus: error.response.data.status || "EXPIRED" });
        }
      }
      setSearchResults([]);
      setTotalCustomers(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    clearError();
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
          disabled={!isApiEnabled()}
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
          disabled={!isApiEnabled()}
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
          disabled={!isApiEnabled()}
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
          disabled={isSearching || !isApiEnabled()}
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
          value={paginationModel.page + 1}
          onChange={(e) => {
            const newPage = Math.max(1, parseInt(e.target.value, 10) || 1) - 1;
            setPaginationModel((prev) => ({ ...prev, page: newPage }));
          }}
          disabled={!isApiEnabled()}
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
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error?.severity || "error"}
          sx={{ width: "100%" }}
          action={
            error?.severity === "warning" ? (
              <Button color="inherit" size="small" component={Link} to="/">
                Go to Home
              </Button>
            ) : null
          }
        >
          {error?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomersScreen;