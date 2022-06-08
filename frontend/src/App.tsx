import './App.scss';
import { AppHeader } from './components/app-header';
import { ConnectWallet, Network, Wallet } from './components/connect-wallet';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { CheckAllocation } from './components/check-allocation';
import { ClaimAirdrop } from './components/claim-airdrop';
import useSteps from './hooks/useSteps';
import networks from './networks.json';
import { useState } from 'react';

function App() {
    const {
        nextStep,
        steps,
        updateSteps,
        activeStep,
        disableNavigateNext
    } = useSteps();

    const [state, setState]  = useState<{wallet?: Wallet, network?: Network}>({});

    const handleWalletConnected = (wallet: Wallet, network: Network) => {
        steps[activeStep].completedLabel = `${network.name}-${wallet.name}`;
        nextStep(true);
        updateSteps(steps);
        setState({wallet, network});
    }
    
    return (
        <div className="App">
            <AppHeader steps={steps} activeStep={activeStep} />
            <Card className='AppBody'>
                <CardHeader title={<span>{steps[activeStep].label}</span>} />

                <CardContent>
                    {activeStep === 0 && <ConnectWallet networks={networks} onWalletConnected={handleWalletConnected}/>}
                    {activeStep === 1 && <CheckAllocation/>}
                    {activeStep === 2 && <ClaimAirdrop/>}
                </CardContent>

                <CardActions className='AppActions'>
                    <Button startIcon={<ArrowBackIos />}
                        variant="outlined"
                        disabled={activeStep === 0}
                        onClick={() => nextStep(false)}>
                        Back
                    </Button>

                    <Button endIcon={<ArrowForwardIos />}
                        variant="outlined"
                        disabled={disableNavigateNext}
                        onClick={() => nextStep(true)}>
                        Next
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default App;
