import { useState } from "react";
import { StepData } from "../components/AppHeader/StepComponent";

const useSteps = () => {
    const [disableNavigateNext, setDisableNavigateNext] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [steps, setSteps] = useState<Array<StepData>>([{
        id: 0,
        label: "Connect wallet",
        completed: false
    }, {
        id: 1,
        label: "Check allocation",
        completed: false
    }, {
        id: 2,
        label: "Claim airdrop",
        completed: false
    }]);

    const nextStep = () => {
        const nextStep = activeStep + 1;
       
        steps[activeStep].completed = true;
       
        setActiveStep(nextStep)
        setSteps(steps);
    }

    const previousStep = () => {
        const nextStep = activeStep - 1;
        
        steps[activeStep].completed = false;
        delete steps[activeStep].completedLabel;
        steps[nextStep].completed = false;
        delete steps[nextStep].completedLabel;

        setActiveStep(nextStep)
        setSteps(steps);
    }


    const gotToFirstStep = () => {
        setActiveStep(0);
    }

    const updateSteps = (steps : Array<StepData>) => {
        setSteps(steps);
        setDisableNavigateNext(!!steps[activeStep].completed);
    }


    return {
        nextStep,
        previousStep,
        updateSteps,
        activeStep,
        steps,
        gotToFirstStep,
        disableNavigateNext
    }
}

export default useSteps;