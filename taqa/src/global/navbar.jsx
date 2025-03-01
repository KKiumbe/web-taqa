import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, IconButton, Button, Box } from "@mui/material";
import { HelpOutline, AccountCircle, Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useAuthStore, useThemeStore } from "../store/authStore";
import axios from "axios";

const Navbar = () => {
  const { darkMode, toggleTheme } = useThemeStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sms, setSMS] = useState(null);
  const BASEURL = import.meta.env.VITE_BASE_URL;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchSMSBalance = async () => {
    try {
      const response = await axios.get(`${BASEURL}/get-sms-balance`,{withCredentials:true});

      console.log(`this is sms response ${JSON.stringify(response)}`);
      setSMS(response.data.credit); // Adjust this based on the actual response structure
    } catch (error) {
      console.error("Error fetching SMS balance:", error);
      setSMS("N/A"); // Handle error case
    }
  };

  useEffect(() => {
    fetchSMSBalance();
  }, []); // Fetch SMS balance on component mount

  return (
    <>
      <AppBar position="fixed" sx={{ width: "100%", zIndex: 1100 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: { xs: 1, md: 2 } }} paddingLeft={10}>
              TAQA
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography>SMS Balance: KSH.{sms !== null ? sms : "Loading..."}</Typography>

            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? "🌙" : "☀️"}
            </IconButton>

            <IconButton color="inherit">
              <HelpOutline />
            </IconButton>

            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>

            <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: "250px" },
        }}
      >
        <List>
          <ListItem button onClick={toggleTheme}>
            <ListItemText primary={darkMode ? "Dark Mode" : "Light Mode"} />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ height: "64px" }} />
    </>
  );
};

export default Navbar;
