import './App.scss';
import { Button, Card, CardActions, CardContent, CardHeader } from '@mui/material';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import { useState } from 'react';

import { CheckAllocation } from './components/CheckAllocation';
import { ClaimAirdrop } from './components/ClaimAirdrop';
import { AppHeader } from './components/AppHeader';
import { ConnectWallet } from './components/ConnectWallet';

import useSteps from './hooks/useSteps';
import wallets from './wallets.json';
import { Wallet } from './models/Wallet';
import { Chain } from './models/Chain';
import { StepData } from './components/AppHeader/StepComponent';
import { AllocationResponse } from './models/Api';


function App() {
    const {
        nextStep,
        previousStep,
        steps,
        updateSteps,
        activeStep,
        gotToFirstStep
    } = useSteps();

    const [state, setState]  = useState<{
        wallet?: Wallet, 
        chain?: Chain,
        allocationResponse?: AllocationResponse
    }>({});

    const handleWalletConnected = (wallet: Wallet, chain: Chain) => {
        steps[activeStep].completedLabel = `${chain.name}-${wallet.name}`;
        nextStep();
        updateSteps(steps);
        setState({wallet, chain});
    }

    const handleCollectAllocation = (allocationResponse: AllocationResponse) => {
        steps[activeStep].completedLabel = allocationResponse.address;
        setState({
            ...state,
            allocationResponse
        })
        updateSteps(steps);
        nextStep();
    }

    const handleClaimAirdropSuccessfully = () => {
        steps[activeStep].completed = true;
        steps[activeStep].completedLabel = "Successfully";
        updateSteps(steps);
    }
    
    const handleCheckAnotherWallet = () => {
        setState({});
        const _steps : Array<StepData> = steps.map(step => {
            return {
                ...step,
                completedLabel: "",
                completed: false
            }
        });
        updateSteps(_steps);
        gotToFirstStep();
        
    }
    
    return (
        <div className="App">
            <AppHeader steps={steps} activeStep={activeStep} />
            <Card className='AppBody'>
                <CardHeader className='AppTitle' title={<span>{steps[activeStep].label}</span>} />

                <CardContent className='AppBodyContent'>
                    {activeStep === 0 && <ConnectWallet wallets={wallets} onWalletConnected={handleWalletConnected}/>}
                    {activeStep === 1 && state.chain && state.wallet 
                        && <CheckAllocation chain={state.chain} wallet={state.wallet} onCollectAllocation={handleCollectAllocation}/>
                    }
                    {activeStep === 2 && state.chain && state.wallet && state.allocationResponse
                        && <ClaimAirdrop wallet={state.wallet}
                            chain={state.chain}
                            allocationResponse={state.allocationResponse}
                            onClaimAirdropSuccessfully={handleClaimAirdropSuccessfully}
                            onCheckAnotherWallet={handleCheckAnotherWallet}/> }
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
