import './App.scss';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useState } from 'react';

import { CheckAllocation } from './components/CheckAllocation';
import { ClaimAirdrop } from './components/ClaimAirdrop';
import { AppHeader } from './components/AppHeader';
import { ConnectWallet } from './components/ConnectWallet';

import useSteps from './hooks/useSteps';
import chains from './chains.json';
import { Wallet } from './models/Wallet';
import { Chain } from './models/Chain';


function App() {
    const {
        nextStep,
        steps,
        updateSteps,
        activeStep,
        disableNavigateNext
    } = useSteps();

    const [state, setState]  = useState<{wallet?: Wallet, chain?: Chain}>({});

    const handleWalletConnected = (wallet: Wallet, chain: Chain) => {
        steps[activeStep].completedLabel = `${chain.name}-${wallet.name}`;
        nextStep(true);
        updateSteps(steps);
        setState({wallet, chain});
    }
    
    return (
        <div className="App">
            <AppHeader steps={steps} activeStep={activeStep} />
            <Card className='AppBody'>
                <CardHeader title={<span>{steps[activeStep].label}</span>} />

                <CardContent>
                    {activeStep === 0 && <ConnectWallet chains={chains} onWalletConnected={handleWalletConnected}/>}
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
