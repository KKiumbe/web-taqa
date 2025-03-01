import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../store/theme";
import TotalCustomersDisplay from "../components/TotalCustomersDisplay";
import ProgressCircleComponent from "../components/progresCircle";
import ProgressBarComponent from "../components/ProgressBarComponent";
import PieChartComponent from "../components/pieChart";
import LastPayments from "../components/payments";
import PaymentModesPieChart from "../components/paymentsChart";

const BASEURL = import.meta.env.VITE_BASE_URL;

const HomeScreen = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardStats();
    fetchPayments();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${BASEURL}/stats`, { withCredentials: true });
      setDashboardStats(response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const endpoint = `${BASEURL}/payments`;
      const response = await axios.get(endpoint, {
        params: {
          page: 1,
          limit: 5,
        },
        withCredentials: true,
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  if (loading || paymentsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: theme?.palette?.background?.default || "#f5f5f5",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const total = dashboardStats?.totalCustomers || 0;

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        mx: "auto",
        p: 5,
        bgcolor: theme?.palette?.background?.paper || "#fff",
        minHeight: "100vh",
        ml: 25,
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 6,
          color: theme?.palette?.text?.primary || "#000",
          fontWeight: "bold",
        }}
      >
        Hi {currentUser.firstName}!
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Customers
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        gap={3}
      >
        <Card
          sx={{
            minWidth: 200,
            maxWidth: 250,
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <TotalCustomersDisplay data={dashboardStats?.totalCustomers || 0} />
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 200,
            maxWidth: 250,
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.contrastText || "#666", ml: 7 }}
            >
              Paid Up
            </Typography>
            <ProgressCircleComponent
              data={dashboardStats?.lowBalanceCustomers || 0}
              maxValue={total}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 200,
            maxWidth: 250,
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.dark || "#666" }}
            >
           
            </Typography>
            <ProgressBarComponent
              data={
                total > 0
                  ? Math.round((dashboardStats?.unpaidCustomers / total) * 100) || 0
                  : 0
              }
              label="Unpaid"
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 200,
            maxWidth: 250,
            maxHeight: 300,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.contrastText || "#666" }}
            >
              High Balance
            </Typography>
            <PieChartComponent
              data={dashboardStats?.highBalanceCustomers || 0}
              label="High Balance"
              maxValue={total}
            />
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Recent Transactions
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Stack on small screens, row on medium+
            gap: 3,
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Card
            sx={{
              minWidth: 400,
            
              boxShadow: 3,
              bgcolor: theme?.palette?.background?.default || "#fafafa",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardContent   
         
            >
              <LastPayments payments={payments} />
            </CardContent>
          </Card>

          <Card
            sx={{
              minWidth: 200,
          
              boxShadow: 3,
              ml:10,
              bgcolor: theme?.palette?.background?.default || "#fafafa",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardContent>
              <PaymentModesPieChart />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreen;