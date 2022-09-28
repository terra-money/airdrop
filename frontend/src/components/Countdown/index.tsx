import React from 'react'
import useCountdown from '../../hooks/useCountdown'
import './Countdown.scss'

export const Countdown = () => {
    const END_DATE = "Tue Oct 04 2022 14:00 UTC";
    const countdown = useCountdown(END_DATE);
    const [date, setDate ] = React.useState(countdown.getTimeUntil());
    
    
    const updateCountdown = () => {
        const date = countdown.getTimeUntil();
        setDate(date);
    };

    React.useEffect(() => {
        setInterval(() => {
            updateCountdown()
        }, 1000 * 60)
    }, []);
    
    return (
        <div className='Countdown'>
            <span>
            As laid out in <a href="https://agora.terra.money/discussion/6647-final-proposal-terra-phoenix-airdrop" target="_blank" rel="noreferrer">Agora</a>, the airdrop window will close on {END_DATE} in <b>
                        {date.days ? ` ${date.days} day(s) ` : ""} 
                        {date.hours ? ` ${date.hours} hour(s) ` : ""}  and 
                        {date.minutes ? ` ${date.minutes} minute(s) ` : ""} 
                    </b>.  Users are advised to make their airdrop claim before the window closes.
                    
            </span>
        </div>
    )
}
