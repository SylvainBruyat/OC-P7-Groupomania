export default function formatTime(timestamp) {
    if (timestamp === null) return null;
    const timestampObj = new Date(timestamp);
    let day = timestampObj.getDate();
    if (day < 10) day = day.toString().concat(0).split('').reverse().join('');
    let month = timestampObj.getMonth() + 1;
    if (month < 10)
        month = month.toString().concat(0).split('').reverse().join('');
    const year = timestampObj.getFullYear();
    let hours = timestampObj.getHours();
    if (hours < 10)
        hours = hours.toString().concat(0).split('').reverse().join('');
    let minutes = timestampObj.getMinutes();
    if (minutes < 10)
        minutes = minutes.toString().concat(0).split('').reverse().join('');
    return `${day}/${month}/${year} à ${hours}h${minutes}`;
}
