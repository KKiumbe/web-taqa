import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import  { useAuthStore ,useThemeStore} from './store/authStore'
import { getTheme } from "./store/theme";



import HomeScreen from './pages/home';

import Login from './pages/login';
import SignUp from './pages/Signup'

import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./global/navbar";
import Sidebar from "./global/sidebar";
import CustomersScreen from "./pages/customers";
import InvoiceList from "./pages/Invoices";
import AddCustomer from "./pages/addCustomers";
import CreateInvoice from "./pages/createInvoice";
import InvoiceDetails from "./pages/InvoiceDetail";
import CustomerDetails from "./pages/customerDetails";
import Payments from "./pages/payments";
import PaymentScreen from "./pages/addPayment";
import PaymentDetails from "./pages/PaymentDetail";
import CreatePayment from "./pages/addPayment";
import Receipts from "./pages/receipts";
import ReceiptDetail from "./pages/receiptDetails";
import SentSMSPage from "./pages/sentSMS";
import SmsScreen from "./pages/sendSMS";
import SendBillsScreen from "./pages/sendBills";
import DebtManager from "./pages/debtManager";
import ReportScreen from "./pages/reports";
import ComingSoonPage from "./pages/comingSoon";



const App = () => {
  const { darkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const theme = getTheme(darkMode ? "dark" : "light");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Sidebar/>}
        <Box sx={{ flexGrow: 1 }}>
          {isAuthenticated && <Navbar/>}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeScreen/>
               
               
                </ProtectedRoute>
              }
            />

<Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersScreen/>
               
                </ProtectedRoute>
              }
            />
                  <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoiceList/>
               
                </ProtectedRoute>
              }
            />

              <Route
              path="/add-customer"
              element={
                <ProtectedRoute>
                  <AddCustomer/>
               
                </ProtectedRoute>
              }
            /> 

              <Route
              path="/create-invoice"
              element={
                <ProtectedRoute>
                  <CreateInvoice/>
               
                </ProtectedRoute>
              }
            /> 
                    <Route
              path="/get-invoice/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetails/>
               
                </ProtectedRoute>
              }
            /> 
                   <Route
              path="/customer-details/:id"
              element={
                <ProtectedRoute>
                  <CustomerDetails/>
               
                </ProtectedRoute>
              }
            /> 

               <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments/>
               
                </ProtectedRoute>
              }
            /> 

            <Route
              path="/payments/:id"
              element={
                <ProtectedRoute>
                  <PaymentDetails/>
               
                </ProtectedRoute>
              }
            />     

<Route
              path="/add-payment"
              element={
                <ProtectedRoute>
                  <CreatePayment/>
               
                </ProtectedRoute>
              }
            /> 


<Route
              path="/receipts"
              element={
                <ProtectedRoute>
                  <Receipts/>
               
                </ProtectedRoute>
              }
            /> 


<Route
              path="/receipts/:id"
              element={
                <ProtectedRoute>
                  <ReceiptDetail/>
               
                </ProtectedRoute>
              }
            /> 



<Route
              path="/sent-sms"
              element={
                <ProtectedRoute>
                  <SentSMSPage/>
               
                </ProtectedRoute>
              }
            /> 

<Route
              path="/send-sms"
              element={
                <ProtectedRoute>
                  <SmsScreen/>
               
                </ProtectedRoute>
              }
            /> 

<Route
              path="/send-bills"
              element={
                <ProtectedRoute>
                  <SendBillsScreen/>
               
                </ProtectedRoute>
              }
            /> 

<Route
              path="/debt-management"
              element={
                <ProtectedRoute>
                  <DebtManager/>
               
                </ProtectedRoute>
              }
            /> 

<Route
              path="/view-reports"
              element={
                <ProtectedRoute>
                  <ReportScreen/>
               
                </ProtectedRoute>
              }
            /> 

<Route
              path="/request-custom-reports"
              element={
                <ProtectedRoute>
                  <ComingSoonPage/>
               
                </ProtectedRoute>
              }
            /> 


         
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;

