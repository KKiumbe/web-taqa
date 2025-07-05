

import { getTheme } from "./store/theme";
import { useAuthStore, useThemeStore } from "./store/authStore";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";



import PaymentDetails from "./pages/payments/PaymentDetail.jsx";
import CustomersScreen from "./pages/customers/Customers";
import CustomerDetails from "./pages/customers/CustomerDetails.jsx";
import Receipts from "./pages/payments/receipts.jsx";
import ReceiptDetail from "./pages/payments/receiptDetails.jsx";
import CustomerEditScreen from "./pages/customers/EditCustomers.jsx";
import VerifyOtpScreen from "./pages/auth/VerifyOtpScreen.jsx";
import HomeScreen from "./pages/home/home.jsx";
import SmsScreen from "./pages/sms/sendSMS.jsx";
import SendBillsScreen from "./pages/sms/sendBills.jsx";
import DebtManager from "./pages/sms/debtManager/debtManager.jsx";
import Organization from "./pages/organization/orgDetails.jsx";
import EditOrganization from "./pages/organization/editOrg.jsx";
import AssignTaskScreen from "./pages/tasks/createTask.jsx";
import FetchTasksScreen from "./pages/tasks/fetchTasks.jsx";
import TaskDetailsScreen from "./pages/tasks/taskDetails.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ForgotPasswordScreen from "./pages/auth/ForgotPassword.jsx";
import ChangePasswordScreen from "./pages/auth/ChangePasswordScreen.jsx";
import CreatePayment from "./pages/payments/addPayment.jsx";
import SentSMSPage from "./pages/sms/sentSMS.jsx";

import ReportScreen from "./pages/reports/reports.jsx";
import ComingSoonPage from "./pages/comingSoon.jsx";
import UserManagementScreen from "./pages/auth/Users.jsx";
import Sidebar from "./global/sidebar.jsx";
import Navbar from "./global/navbar.jsx";
import AddUser from "./pages/auth/AddUser.jsx";
import UserDetails from "./pages/auth/UserDetails.jsx";
import InvoiceList from "./pages/invoices/Invoices.jsx";
import AddCustomer from "./pages/customers/AddCustomers.jsx";
import InvoiceDetails from "./pages/invoices/InvoiceDetail.jsx";
import Payments from "./pages/payments/Payments.jsx";
import CreateInvoice from './pages/invoices/CreateInvoice.jsx'
import Login from "./pages/auth/Login.jsx";

const App = () => {
  const { darkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const theme = getTheme(darkMode ? "dark" : "light");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: "100vh", // Full viewport height
            width: "100%", // Full width
            backgroundColor: theme.palette.background.default, // Theme background
            display: "flex", // Flexbox for sidebar and content
            flexDirection: "row",
          }}
        >
          {isAuthenticated && <Sidebar />}
          <Box
            sx={{
              flexGrow: 1, // Takes remaining space
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh", // Ensure content fills height
            }}
          >
            {isAuthenticated && <Navbar />}
            <Box
              component="main"
              sx={{
                flexGrow: 1, // Content expands to fill space
                backgroundColor: theme.palette.background.default, // Consistent background
                p: 3, // Padding for content
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ForgotPasswordScreen />} />
                <Route path="/change-password" element={<ChangePasswordScreen />} />
                <Route path="/verify-otp" element={<VerifyOtpScreen/>} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomeScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <ProtectedRoute>
                      <InvoiceList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-customer"
                  element={
                    <ProtectedRoute>
                      <AddCustomer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-invoice"
                  element={
                    <ProtectedRoute>
                      < CreateInvoice/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/get-invoice/:id"
                  element={
                    <ProtectedRoute>
                      <InvoiceDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer-details/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments/:id"
                  element={
                    <ProtectedRoute>
                      <PaymentDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-payment"
                  element={
                    <ProtectedRoute>
                      <CreatePayment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receipts"
                  element={
                    <ProtectedRoute>
                      <Receipts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receipts/:id"
                  element={
                    <ProtectedRoute>
                      <ReceiptDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sent-sms"
                  element={
                    <ProtectedRoute>
                      <SentSMSPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/send-sms"
                  element={
                    <ProtectedRoute>
                      <SmsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/send-bills"
                  element={
                    <ProtectedRoute>
                      <SendBillsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/debt-management"
                  element={
                    <ProtectedRoute>
                      <DebtManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/view-reports"
                  element={
                    <ProtectedRoute>
                      <ReportScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request-custom-reports"
                  element={
                    <ProtectedRoute>
                      <ComingSoonPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer-edit/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerEditScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserManagementScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-user"
                  element={
                    <ProtectedRoute>
                      <AddUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:id"
                  element={
                    <ProtectedRoute>
                      <UserDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/org-details"
                  element={
                    <ProtectedRoute>
                      <Organization />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/edit"
                  element={
                    <ProtectedRoute>
                      <EditOrganization />
                    </ProtectedRoute>
                  }
                />


                  <Route
                  path="tasks/create"
                  element={
                    <ProtectedRoute>
                      <AssignTaskScreen />
                    </ProtectedRoute>
                  }
                />

                  <Route
                  path="tasks"
                  element={
                    <ProtectedRoute>
                      <FetchTasksScreen />
                    </ProtectedRoute>
                  }
                />  

<Route
                  path="task-details/:taskId"
                  element={
                    <ProtectedRoute>
                      <TaskDetailsScreen />
                    </ProtectedRoute>
                  }
                />  
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;