let loadTimetable = document.getElementById("load_timetable");
let saveTimetable = document.getElementById("save_timetable");
let alarmButton = document.getElementById("alarm");
let table = document.getElementById("mainTable");
let days_of_weeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let secondColumn = [];
let firstColumn = [];

//Handler for divContents from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    //Get content
    let contents = request.divContents;
    //Display contents on html file in proper order and format
    for( let i=0; i< contents.length; i++){
        let content = contents[i];
        let substrings = separateString(content);

        for (let  j=0; j< substrings.length - 1; j+=2){
            // Create a new row
            let row = table.insertRow();

            // // Create cells for the row
            let cell1 = row.insertCell();
            let cell2 = row.insertCell();
            let cell3 = row.insertCell();
            
            date = substrings[j];
            date = formatTime(date);
            course = substrings[j+1];

            // // Assign the content to the cells
            cell1.textContent = days_of_weeek[i];
            cell2.textContent = date;
            cell3.textContent = course;}
    }

})

// For button click
loadTimetable.addEventListener("click", async () =>{
    
    // GEt info from current tab
    let  [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: scrapeFromPage,
    });
} )
saveTimetable.addEventListener("click", () =>{
    let table = document.getElementById("mainTable");
    let rows = table.getElementsByTagName("tr");
        for(let i=1; i<rows.length; i++){
            let cells = rows[i].getElementsByTagName("td");
            firstColumn.push(cells[0].textContent);
            secondColumn.push(cells[1].textContent);
        }
    chrome.storage.local.set({key: [firstColumn, secondColumn] }).then(() => {
        alert('Timetable data saved.');
      });
})
alarmButton.addEventListener("click", () =>{
    let secondColumn =[];
    let firstColumn = [];
    chrome.storage.local.get(["key"]).then((result) => {
        secondColumn = result.key[1];
        firstColumn = result.key[0];
        chrome.runtime.sendMessage({istime: true, firstColumn,secondColumn}, (response) => {
            if(response.success)
                alert("Notification set");
        });
    });    
}); 
        


function scrapeFromPage(){
    // alert('Successful!');
    const divContents = [];
    const divElements = document.querySelectorAll('div.fc-content-col');
    divElements.forEach((element) => {
        divContents.push(element.textContent);
    });

    console.log(divContents);

    chrome.runtime.sendMessage({divContents});
}
function separateString(content){
    let substrings = [];
    while(content.length > 0){
        ind = 0;
        for(let i=0; i<content.length; i++){
            current_char = content.charAt(i);
            if(/^[a-zA-Z]$/.test(current_char)){
                ind = i;
                break;}
        }
        //ind is index of first alphabet
        substrings.push(content.substring(0, ind));
        if(/^[a-zA-Z]$/.test(content.charAt(ind+10)))
        {
            substrings.push(content.substring(ind, ind+11));
            content = content.substring(ind+11);
        }
        else if(/^[a-zA-Z]$/.test(content.charAt(ind+6))){
            substrings.push(content.substring(ind, ind+10));
            content = content.substring(ind+10);
        }
        else {
            substrings.push(content.substring(ind, ind+9));
            content = content.substring(ind+9);
        }
    }
    return substrings;
}

function formatTime(timeRange) {
    const [startTime, endTime] = timeRange.split(' - ');
    let formattedStartTime = startTime;
    let formattedEndTime = endTime;
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (startHour >= 8 && startHour <= 12) {
        formattedStartTime += 'am';
    } else {
        formattedStartTime += 'pm';
    }    
    if (endHour >= 8 && endHour <= 12) {
        formattedEndTime += 'am';
    } else {
        formattedEndTime += 'pm';
    }    
    return `${formattedStartTime} - ${formattedEndTime}`;
}
  

















