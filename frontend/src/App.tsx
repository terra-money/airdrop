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
        previousStep,
        steps,
        updateSteps,
        activeStep
    } = useSteps();

    const [state, setState]  = useState<{
        wallet?: Wallet, 
        chain?: Chain
    }>({});

    const handleWalletConnected = (wallet: Wallet, chain: Chain) => {
        steps[activeStep].completedLabel = `${chain.name}-${wallet.name}`;
        nextStep();
        updateSteps(steps);
        setState({wallet, chain});
    }

    const handleCollectAllocation = (address: string) => {
        steps[activeStep].completedLabel = address;
        updateSteps(steps);
        nextStep();
    }
    
    return (
        <div className="App">
            <AppHeader steps={steps} activeStep={activeStep} />
            <Card className='AppBody'>
                <CardHeader title={<span>{steps[activeStep].label}</span>} />

                <CardContent>
                    {activeStep === 0 && <ConnectWallet chains={chains} onWalletConnected={handleWalletConnected}/>}
                    {activeStep === 1 && state.chain && state.wallet 
                        && <CheckAllocation chain={state.chain} wallet={state.wallet} onCollectAllocation={handleCollectAllocation}/>
                    }
                    {activeStep === 2 && <ClaimAirdrop/>}
                </CardContent>

                <CardActions className='AppActions'>
                    <Button startIcon={<ArrowBackIos />}
                        variant="outlined"
                        disabled={activeStep === 0}
                        onClick={() => previousStep()}>
                        Back
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default App;
