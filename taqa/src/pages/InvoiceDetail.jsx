import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Stack,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back icon
import axios from "axios";
import TitleComponent from "../components/title";
import { useAuthStore } from "../store/authStore";
import { getTheme } from "../store/theme";

const InvoiceDetails = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  //const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
  const BASEURL = "https://taqa.co.ke/api";
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  useEffect(() => {
    setSnackbarMessage("Opening the invoice...");
    setSnackbarOpen(true);

    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const response = await axios.get(`${BASEURL}/invoices/${id}`, { withCredentials: true });
      setInvoice(response.data);
    } catch (err) {
      setError("Failed to load invoice.");
    } finally {
      setLoading(false);
      setTimeout(() => setSnackbarOpen(false), 2000); // Hide Snackbar after 2s
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleInvoicesPage = () => {
    navigate("/invoices"); // Navigate to the invoices list page
  };

  if (loading) return <CircularProgress sx={{ color: theme.palette.greenAccent.main }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card
      sx={{
        maxWidth: 900,
      
        margin: "auto",
        padding: 3,
        mt: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        ml: 50,
        bgcolor: theme.palette.primary.main,
        position: "relative", // Allow absolute positioning of the back button
      }}
    >
      {/* Back Icon Button at Top Left */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          color: theme.palette.greenAccent.main,
          "&:hover": {
            bgcolor: theme.palette.greenAccent.main + "20",
          },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40 }} /> {/* Large icon size */}
      </IconButton>


       {/* Navigation Button (Invoices) at Bottom */}
       <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.greenAccent.main,
              color: theme.palette.greenAccent.main,
              "&:hover": {
                borderColor: theme.palette.greenAccent.main,
                bgcolor: theme.palette.greenAccent.main + "20",
              },
            }}
            onClick={handleInvoicesPage}
          >
            Invoices Page 
          </Button>
        </Stack>

      <CardContent sx={{ width: "100%" }}>
        <TitleComponent title="Invoice Details" />
        <Typography variant="h5" sx={{ color: theme.palette.grey[100] }}>
          Invoice #{invoice.invoiceNumber.substring(0, 9)}
        </Typography>

        <Chip
          label={invoice.status}
          color={invoice.status === "PAID" ? "success" : "warning"}
          sx={{ mt: 2, mb: 2 }}
        />

        <Divider sx={{ my: 2, borderColor: theme.palette.grey[300] }} />

        <Typography variant="subtitle1" sx={{ color: theme.palette.grey[100] }}>
          <strong>Customer:</strong> {invoice.customer.firstName} {invoice.customer.lastName}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: theme.palette.grey[100] }}>
          Phone: {invoice.customer.phoneNumber}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: theme.palette.grey[100] }}>
          Email: {invoice.customer.email}
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.grey[300] }} />

        <Typography variant="body2" sx={{ color: theme.palette.grey[100] }}>
          <strong>Invoice Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.grey[100] }}>
          <strong>Invoice Period:</strong> {new Date(invoice.invoicePeriod).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.grey[100] }}>
          <strong>Closing Balance:</strong> KES {invoice.closingBalance}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.grey[100] }}>
          <strong>Amount Paid:</strong> KES {invoice.amountPaid}
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.grey[300] }} />

        <Typography variant="h6" sx={{ color: theme.palette.grey[100] }}>
          Invoice Items
        </Typography>
        {invoice.items.map((item, index) => (
          <Typography key={index} sx={{ color: theme.palette.grey[100] }}>
            {item.description} - {item.quantity} × KES {item.amount}
          </Typography>
        ))}

        <Typography variant="h6" sx={{ mt: 2, color: theme.palette.grey[100] }}>
          Total: KES {invoice.invoiceAmount}
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.grey[300] }} />

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: theme.palette.greenAccent.main,
              color: "#fff",
              "&:hover": { bgcolor: theme.palette.greenAccent.main, opacity: 0.9 },
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: theme.palette.secondary.main,
              color: "#fff",
              "&:hover": { bgcolor: theme.palette.secondary.main, opacity: 0.9 },
            }}
          >
            Email Invoice
          </Button>
          {invoice.status !== "CANCELED" && (
            <Button
              variant="contained"
              sx={{
                bgcolor: theme.palette.error.main,
                color: "#fff",
                "&:hover": { bgcolor: theme.palette.error.main, opacity: 0.9 },
              }}
            >
              Cancel Invoice
            </Button>
          )}
        </Stack>

       

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="info"
            sx={{ width: "100%", bgcolor: theme.palette.grey[300], color: theme.palette.grey[100] }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetails;