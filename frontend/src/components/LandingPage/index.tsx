import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@mui/material';


export function LandingPage() {
  const navigate = useNavigate();

  const handleNavToWizard = (e: any) => {
    navigate('/wizard');
  };

  return (
        <Card className='App'>
          <CardContent>
            <h4>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </h4>
          <Button variant="contained"
            onClick={handleNavToWizard}>
            Proceed to Airdrop
          </Button>
        </CardContent>
      </Card>
  );
}