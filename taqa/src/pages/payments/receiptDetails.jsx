import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { getTheme } from "../../store/theme";

const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const theme = getTheme();
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`${BASEURL}/receipts/${id}`, {
          withCredentials: true,
        });
        setReceipt(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch receipt details.");
        console.error("Error fetching receipt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToReceipts = () => {
    navigate("/receipts");
  };

  const handleDownloadReceipt = async () => {
    setDownloadLoading(true);
    try {
      const response = await axios.get(`${BASEURL}/download-receipt/${id}`, {
        withCredentials: true,
        responseType: "blob", // Expect binary PDF response
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download receipt. Please try again.");
      console.error("Error downloading receipt:", err);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleEmailReceipt = () => {
    alert("Email receipt functionality not implemented yet.");
    // Implement email logic here
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={70} sx={{ color: theme.palette.greenAccent.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!receipt) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography>No receipt found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "50%",
        
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        ml: 20,
        p: 0,
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: -10,
          left: -10,
          color: theme.palette.greenAccent.main,
          "&:hover": { bgcolor: theme.palette.greenAccent.main + "20" },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40 }} />
      </IconButton>

      {/* Receipt Container */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 4,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.primary.contrastText }}>
            Receipt
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText }}>
            {receipt.receiptNumber} 
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
            Issued on: {new Date(receipt.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReceipt}
            disabled={downloadLoading}
            sx={{
              color: theme.palette.primary.contrastText,
              "&:hover": { borderColor: theme.palette.greenAccent.main, color: theme.palette.grey.main },
              px: 3,
            }}
          >
            {downloadLoading ? <CircularProgress size={24} /> : "Download"}
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleEmailReceipt}
            sx={{
              color: theme.palette.primary.contrastText,
              borderColor: theme.palette.grey[900],
              "&:hover": { borderColor: theme.palette.greenAccent.main, color: theme.palette.grey.main },
              px: 3,
            }}
          >
            Email {receipt?.customer?.firstName}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleGoToReceipts}
            sx={{
              borderColor: theme.palette.grey[200],
              color: theme.palette.greenAccent.main,
              "&:hover": { borderColor: theme.palette.greenAccent.main, color: theme.palette.grey.main },
              px: 3,
            }}
          >
            Receipts Page
          </Button>
        </Box>

        {/* Receipt Details */}
        <Grid container spacing={3}>
          {/* Customer Details */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: theme.palette.primary.contrastText }}>
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>First Name:</strong> {receipt.customer?.firstName || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Last Name:</strong> {receipt.customer?.lastName || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Phone Number:</strong> {receipt.customer?.phoneNumber || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Closing Balance:</strong> {receipt.customer?.closingBalance || 0} KES
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Details */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: theme.palette.primary.contrastText }}>
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Payment ID:</strong> {receipt.payment?.id || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Amount:</strong> {receipt.payment?.amount || receipt.amount} KES
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Mode of Payment:</strong> {receipt.payment?.modeOfPayment || receipt.modeOfPayment}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Paid By:</strong> {receipt.payment?.firstName || receipt.paidBy || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Transaction ID:</strong> {receipt.payment?.transactionId || receipt.transactionCode || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Reference:</strong> {receipt.payment?.ref || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Receipted:</strong> {receipt.payment?.receipted ? "Yes" : "No"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                      <strong>Date:</strong>{" "}
                      {(() => {
                        const date = new Date(receipt.payment?.createdAt || receipt.createdAt);
                        date.setHours(date.getHours() - 1); // Offset by -1 hour
                        return date.toLocaleString();
                      })()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoices Affected */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: theme.palette.primary.contrastText }}>
                  Invoices Affected
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {receipt.receiptInvoices?.length > 0 ? (
                  receipt.receiptInvoices.map((ri, index) => (
                    <Box key={index} sx={{ mb: index < receipt.receiptInvoices.length - 1 ? 2 : 0 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Invoice ID:</strong> {ri.invoice?.id.slice(0, 10) || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Invoice Number:</strong> {ri.invoice?.invoiceNumber.slice(0, 10) || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Amount:</strong> {ri.invoice?.invoiceAmount || 0} KES
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Amount Paid:</strong> {ri.invoice?.amountPaid || 0} KES
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Closing Balance:</strong> {ri.invoice?.closingBalance || 0} KES
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Status:</strong> {ri.invoice?.status || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Period:</strong> {new Date(ri.invoice?.invoicePeriod).toLocaleDateString() || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText }}>
                            <strong>Created At:</strong>{" "}
                            {ri.invoice?.createdAt
                              ? new Date(new Date(ri.invoice.createdAt).setHours(new Date(ri.invoice.createdAt).getHours() - 1)).toLocaleString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                      {/* Invoice Items */}
                      {ri.invoice?.items?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: "bold", color: theme.palette.primary.contrastText }}>
                            Items for Invoice {ri.invoice?.invoiceNumber.slice(0, 10)}:
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ color: theme.palette.primary.contrastText }}>Description</TableCell>
                                  <TableCell sx={{ color: theme.palette.primary.contrastText }}>Amount (KES)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {ri.invoice.items.map((item, itemIndex) => (
                                  <TableRow key={itemIndex}>
                                    <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                                      {item.description || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                                      {item.amount?.toFixed(2) || "0.00"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                      {index < receipt.receiptInvoices.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: theme.palette.grey[700] }}>
                    No invoices associated with this receipt.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReceiptDetail;