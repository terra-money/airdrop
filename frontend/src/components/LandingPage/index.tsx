import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';


export function LandingPage() {
    console.log('landingpage')
//   const navigate = useNavigate();

  const handleNavToWizard = (e: any) => {
    // navigate('/wizard');
  };

  return (
    <> 
    <h1> Landing Page</h1>
        {/* <Button variant="contained"
            fullWidth
            onClick={handleNavToWizard}>
            Proceed to Airdrop
        </Button> */}
    </>
  );
}