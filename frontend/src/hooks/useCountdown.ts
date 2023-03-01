const useCountdown = (end: string) => {

    const getTimeUntil = () =>{
        const total = Date.parse(end) - Date.parse(new Date().toString());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));

        return {
            days,
            hours,
            minutes,
            seconds
        };
    }

    return {getTimeUntil};
}



export default useCountdown;
