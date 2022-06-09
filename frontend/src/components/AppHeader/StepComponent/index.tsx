import { StepButton } from '@mui/material';
import './StepComponent.scss';

type StepType = {
    data: StepData
}

export type StepData = {
    id: number,
    label: string,
    completedLabel?: string,
    completed?: boolean
}

export const StepComponent = (props: StepType) => {
    const { label, completedLabel, completed } = props.data;

    return (
        <StepButton disabled className='StepComponent'>
            <h4 className='StepInfo'>{label}</h4>
            <div className='StepCompleted'
                style={{display: completed ? "block" : "none"}}>
                <h5>* {completedLabel}</h5>
            </div>
        </StepButton>
    )
}
