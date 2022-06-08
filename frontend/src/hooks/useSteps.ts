import { useState } from "react";
import { StepData } from "../components/app-header/step-component";

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
        label: "Claim",
        completed: false
    }]);

    const nextStep = (forwards: boolean) => {
        const nextStep = forwards ? activeStep + 1 : activeStep - 1;
        if(forwards) {
            steps[activeStep].completed = true;
        }
        else {
            steps[activeStep].completed = false;
            delete steps[activeStep].completedLabel;
            steps[nextStep].completed = false;
            delete steps[nextStep].completedLabel;
        }
        setActiveStep(nextStep)
        setSteps(steps);
    }

    const updateSteps = (steps : Array<StepData>) => {
        setSteps(steps);
        setDisableNavigateNext(!!steps[activeStep].completed);
    }


    return {
        nextStep,
        updateSteps,
        activeStep,
        steps,
        disableNavigateNext
    }
}

export default useSteps;