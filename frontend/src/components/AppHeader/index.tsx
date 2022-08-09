import { AppBar } from '@mui/material'
import "./AppHeader.scss";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import { StepComponent, StepData } from './StepComponent';

type AppHeaderType = {
    steps: Array<StepData>,
    activeStep: number
}

export const AppHeader = (props: AppHeaderType) => {
    const { steps, activeStep} = props;

    return (
        <AppBar position="fixed" className='AppHeader'>
            <a href='/' className='AppLink'>
                <div className='AppLogo logo terra'/>
                <h3 className='AppTitle'>Terra Phoenix Airdrop</h3>
            </a>

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
