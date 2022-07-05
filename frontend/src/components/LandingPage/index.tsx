import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button} from '@mui/material';


export function LandingPage() {
//   const navigate = useNavigate();

  const handleNavToWizard = (e: any) => {
    // navigate('/wizard');
  };

  return (
    <>
        <Button variant="contained"
            fullWidth
            onClick={handleNavToWizard}>
            Proceed to Airdrop
        </Button>
    </>
  );
}