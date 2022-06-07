import { StepButton } from '@mui/material';
import './StepComponent.scss';

type StepType = {
    data: StepData
}

export type StepData = {
    completedLabel?: string,
    label: string,
    completed?: boolean
}

export const StepComponent = (props: StepType) => {
    const { label, completedLabel, completed } = props.data;

    return (
        <StepButton disabled className='StepComponent'>
            <div className='StepData'>
                <h4 className='StepInfo'>{label}</h4>
                <div className='StepCompleted'
                    style={{display: completed ? "none" : "block"}}>
                    <h5>* {completedLabel}</h5>
                </div>
            </div>
        </StepButton>
    )
}
