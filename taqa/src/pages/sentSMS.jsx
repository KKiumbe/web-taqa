import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import TitleComponent from "../components/title";
import { getTheme } from "../store/theme";

const SentSMSPage = () => {
  const [smsMessages, setSmsMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASEURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";
  const theme = getTheme();

  const fetchSmsMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BASEURL}/sms-history?page=${page + 1}&limit=${pageSize}`,
        { withCredentials: true }
      );
      console.log("API Response:", JSON.stringify(response.data, null, 2));
      const { data, totalRecords } = response.data;
      setSmsMessages(data || []);
      setTotalRows(totalRecords || 0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch SMS messages.");
      console.error("Error fetching SMS messages:", error);
      setSmsMessages([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsMessages();
  }, [page, pageSize]);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "mobile", headerName: "Mobile", width: 150 },
    { field: "message", headerName: "Message", width: 400 },
    { field: "status", headerName: "Status", width: 120 },
    {
        field: "createdAt",
        headerName: "Date Sent",
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
    <Box
      sx={{
        minHeight: 500,
        width: "100%",
        padding: 2,
        ml: 40,
        minWidth: 600,
        maxWidth: 1200,
      }}
    >

       
              <Typography component="div"
                variant="h4"
                sx={{ color: theme.palette.primary.contrastText, mb: 2 , ml:-5}} // Primary color for title
              >

          <TitleComponent title="Sent Messages History" />
               
              </Typography>
  

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: theme.palette.grey[300] }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={70} sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={smsMessages}
            columns={columns}
            paginationMode="server"
            rowCount={totalRows || 0}
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(params) => {
              setPage(params.page);
              setPageSize(params.pageSize);
            }}
            loading={loading}
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200],
                color: theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[900],
                borderBottom: `2px solid ${theme.palette.grey[400]}`,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
                color: theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[900],
              },
              "& .MuiDataGrid-row": {
                backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
                "&:hover": { bgcolor: theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[100] },
              },
              "& .MuiDataGrid-cell": {
                color: theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[900],
              },
            }}
          />
        </Box>
      )}
      {!loading && (
        <Typography sx={{ textAlign: "center", mt: 2, color: theme.palette.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey[900] }}>
          Page {page + 1} of {Math.ceil(totalRows / pageSize) || 1}
        </Typography>
      )}
    </Box>
  );
};

export default SentSMSPage;
