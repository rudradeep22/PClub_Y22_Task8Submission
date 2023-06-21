let firstColumn = [];
let secondColumn = [];
chrome.runtime.onMessage.addListener(
    function(request, sender, response){
        if(request.istime)
        {   
            firstColumn = request.firstColumn;
            secondColumn = request.secondColumn;
            chrome.alarms.create(
                "timesup",
                {   
                    periodInMinutes: 1
                }
            );
        }
        response({ success: true });
    }
)
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "timesup") {
        for(let i=0; i<firstColumn.length; i++){
            let targetTime = convertStringToDate(firstColumn[i] +" "+secondColumn[i]);
            targetTime.setMinutes(targetTime.getMinutes() - 30);
            let now = new Date();
            if(now.getTime() === targetTime.getTime()){
                showNotification();
            }
        }
}});
  
function showNotification(){
    chrome.notifications.create(
        {
          type: "basic",
          iconUrl: "alarm.jpg",
          title: "Time to go!",
          message: "Only 30 minutes left. Get going!!"
        });
}


function convertStringToDate(dateString) {
    const [, day, time, period] = dateString.match(/(\w+)\s(\d+:\d+)(am|pm)/i);
    const [hour, minute] = time.split(':');
    const isPM = period.toLowerCase() === 'pm';
  
    const now = new Date();
    const currentDay = now.getDay();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = daysOfWeek.findIndex(d => d.toLowerCase() === day.toLowerCase());
    const targetDate = new Date(now.setDate(now.getDate() + ((7 + targetDay - currentDay) % 7)));
    targetDate.setHours(isPM ? parseInt(hour, 10) + 12 : parseInt(hour, 10), parseInt(minute, 10), 0, 0);
  
    return targetDate;
  }