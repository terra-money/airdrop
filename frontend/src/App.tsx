import './App.scss';
import { AppHeader } from './components/app-header';
import { OriginNetworks } from './components/origin-networks';
import originNetworks from './origin-networks.json';
import { StepData } from './components/app-header/step-component';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import { useState } from 'react';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [steps, setSteps] = useState<Array<StepData>>([{
        label: "Select origin network and wallet",
        completedLabel: "Ethereum",
        completed: false
    }, {
        label: "Check allocation",
        completedLabel: '100Luna',
        completed: false
    }, {
        label: "Claim",
        completedLabel: "4B7FA467A4D3859E501DE47C9D47251AAD5621F53D7E621D1EC848D5214A3451",
        completed: false
    }]);

    const handleStepChange = (forwards: boolean) => {
        const nextStep = forwards ? activeStep + 1 : activeStep - 1;
        if(forwards) {
            steps[activeStep].completed = true;
        }
        else {
            steps[activeStep].completed = false;
            steps[nextStep].completed = false;
        }
        setActiveStep(nextStep)
        setSteps(steps);
    }


    return (
        <div className="App">
            <AppHeader steps={steps} activeStep={activeStep} />
            <Card className='AppBody'>
                <CardHeader title="Select origin network" />

                <CardContent>
                    <OriginNetworks originNetworks={originNetworks} />
                </CardContent>

                <CardActions className='AppActions'>
                    <Button startIcon={<ArrowBackIos />}
                        variant="outlined"
                        disabled={activeStep === 0}
                        onClick={() => handleStepChange(false)}>
                        Back
                    </Button>

                    <Button endIcon={<ArrowForwardIos />}
                        variant="outlined"
                        disabled={activeStep === steps.length - 1}
                        onClick={() => handleStepChange(true)}>
                        Next
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default App;
