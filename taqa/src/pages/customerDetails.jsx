import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Typography, Tabs, Tab, Box, Button, Grid, IconButton, CircularProgress, Modal, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import TitleComponent from "../components/title";
import { getTheme } from "../store/theme";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuthStore } from "../store/authStore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [error, setError] = useState(null); // <-- Added error state
  const BASEURL = import.meta.env.VITE_BASE_URL || "https://taqa.co.ke/api";
  const theme = getTheme();

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);


  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const res = await axios.get(`${BASEURL}/customer-details/${id}`, { withCredentials: true });
        setCustomer(res.data);
        setInvoices(res.data.invoices);
        setReceipts(res.data.receipts);
      } catch (error) {
        console.error("Error fetching customer details:", error);
        setError("Failed to load customer details."); // <-- Set error message
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const sendSMS = async () => {
    setSending(true);
    try {
      await axios.post(`${BASEURL}/send-sms`, {
        mobile: customer.phoneNumber,
        message: smsMessage,

        
      },{withCredentials:true});
      setOpenModal(false);
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
   finally {
    setSending(false);
  }
  };
  
  const sendBill = async () => {
    setSending(true);
    try {
      await axios.post(`${BASEURL}/send-bill`, {
        customerId: customer.id,
      },{withCredentials:true});
    } catch (error) {
      console.error("Error sending bill:", error);
    }
   finally {
    setSending(false);
  }
  };
  

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <Container sx={{ marginLeft: { sm: "200px", xs: "0px" }, marginTop: { sm: "20px" }, transition: "margin 0.3s ease-in-out" }}>
      <Typography variant="h3">
        <TitleComponent title="Customer Details" />
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        customer && (
          
          <>
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 ,ml:5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>

                <Box sx={{ position: "relative", mb: 2 }}>
  <IconButton
    onClick={handleBack}
    sx={{
      position: "absolute",
      top: -110,
      left: -60,
      color: theme.palette.greenAccent.main,
      "&:hover": {
        bgcolor: theme.palette.greenAccent.main + "20",
      },
    }}
  >
    <ArrowBackIcon sx={{ fontSize: 50 }} />
  </IconButton>
</Box>




                  <Typography><strong>Name:</strong> {`${customer.firstName} ${customer.lastName}`}</Typography>
                  <Typography><strong>Email:</strong> {customer.email || "N/A"}</Typography>
                  <Typography><strong>Phone:</strong> {customer.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Monthly Charge:</strong> {customer.monthlyCharge}</Typography>
                  <Typography><strong>Status:</strong> {customer.status}</Typography>
                  <Typography><strong>Garbage Collection Day:</strong> {customer.garbageCollectionDay}</Typography>
                  <Typography><strong>Closing Balance:</strong> {customer.closingBalance}</Typography>
                </Grid>
              </Grid>

              
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button variant="contained" color="primary" onClick={() => setOpenModal(true)} disabled={sending}>
                  {sending ? "Sending..." : `SMS ${customer.firstName}`}
                </Button>
                <Button variant="contained" color="secondary" onClick={sendBill} disabled={sending}>
                  {sending ? "Sending..." : `Send Bill to ${customer.firstName}`}
                </Button>


              </Box>
            </Box>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <Box sx={{ p: 4, bgcolor: "background.paper", borderRadius: 2, width: 400, mx: "auto", mt: "10%" }}>
                <Typography variant="h6">Send SMS</Typography>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                  <Button variant="contained" color="primary" onClick={sendSMS} disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                  </Button>
                  <Button variant="outlined" onClick={() => setOpenModal(false)}>Cancel</Button>
                </Box>
              </Box>
            </Modal>

            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              TabIndicatorProps={{ style: { backgroundColor: theme.palette.primary.main } }}
              sx={{
                "& .MuiTab-root": { color: theme.palette.greenAccent.main, ml:5},
                "& .MuiTab-root.Mui-selected": { color: theme.palette.greenAccent.main ,ml:5},
              }}
            >
              <Tab label="Invoices" />
              <Tab label="Payments" />
            </Tabs>

            <Box hidden={tabIndex !== 0} ml={6}>
              <Typography variant="h6" marginLeft={12}>Invoices</Typography>
              <DataGrid
                rows={invoices}
                columns={[
                  {
                    field: "actions",
                    headerName: "View",
                    width: 100,
                    renderCell: (params) => (
                      <IconButton component={Link} to={`/get-invoice/${params.row.id}`}>
                        <VisibilityIcon  color={theme.palette.greenAccent.main}/>
                      </IconButton>
                    )
                  },
                  { field: "invoiceNumber", headerName: "Invoice #", width: 250 },
                  { field: "invoiceAmount", headerName: "Amount", width: 150 },
                  { field: "closingBalance", headerName: "Balance", width: 150 },
                  { field: "status", headerName: "Status", width: 120 },
                  {
                    field: "items",
                    headerName: "Items",
                    width: 400,
                    renderCell: (params) => (
                      <ul>
                        {params.value.map((item, index) => (
                          <li key={index}>
                            {item.description} - {item.quantity} x {item.amount}
                          </li>
                        ))}
                      </ul>
                    ),
                  },

                  {
                    field: "createdAt",
                    headerName: "Date",
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
                ]}
                pageSize={5}
                getRowId={(row) => row.invoiceNumber}
              />
            </Box>

            <Box hidden={tabIndex !== 1} ml={6}>
              <Typography variant="h6" marginLeft={10}>Receipts</Typography>
              <DataGrid
                rows={receipts}
                columns={[
                  {
                    field: "actions",
                    headerName: "View",
                    width: 100,
                    renderCell: (params) => (
                      <IconButton component={Link} to={`/get-invoice/${params.row.id}`} >
                        <VisibilityIcon color={theme.palette.greenAccent.main} />
                      </IconButton>
                    )
                  },
                  { field: "receiptNumber", headerName: "Receipt #", width: 100 },
                  { field: "amount", headerName: "Amount", width: 120 },
                  { field: "modeOfPayment", headerName: "Payment Mode", width: 150 },
                  { field: "paidBy", headerName: "Paid By", width: 150 },
                  {
                    field: "createdAt",
                    headerName: "Date",
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
                    field: "transactionId",
                    headerName: "Transaction ID",
                    width: 100,
                    renderCell: (params) => params.row.payment?.transactionId || "N/A",
                  },


                ]}
                pageSize={5}
                getRowId={(row) => row.id}
              />
            </Box>
          </>
        )
      )}
    </Container>
  );
};

export default CustomerDetails;
