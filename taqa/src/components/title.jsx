import React from "react";
import { Typography, Box } from "@mui/material";

const TitleComponent = ({ title }) => {
  return (
    <Box
      sx={{
        marginBottom: 2,
        padding: 2,
        borderBottom: "2px solid #ddd",
       // Centers the text
        display: "flex",
        justifyContent: 'flex-start',
        paddingLeft:10
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem" } }} 
      >
        {title}
      </Typography>
    </Box>
  );
};

export default TitleComponent;
