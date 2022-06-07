import { AppBar } from '@mui/material'
import "./app-header.scss";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import { useState } from 'react';
import { StepComponent, StepData } from './step-component';

type AppHeaderType = {
    steps: Array<StepData>
}

export const AppHeader = (props: AppHeaderType) => {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState<{[k: number]: boolean}>({});
    const { steps } = props;

    return (
        <AppBar position="fixed" className='AppHeader'>
            <h3 className='Title'>Terra 2.0 Airdrop</h3>
            <Stepper className='StepperWrapper' activeStep={activeStep}>
                {steps.map((step, index) => (
                    <Step key={index} completed={step.completed}>
                        <StepComponent data={step}/>
                    </Step>
                ))}
            </Stepper>
        </AppBar>
    )
}
