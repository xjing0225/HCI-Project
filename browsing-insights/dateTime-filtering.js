//filter records by date or time range, or both
function filterByDateTime(records) {
    let selectedDate = document.getElementById("datePicker").value;
    let startTimeInput = document.getElementById("startTime").value;
    let endTimeInput = document.getElementById("endTime").value;
    let startTimestamp;
    let endTimestamp;

    // Check if the selected date is in the future
    if (selectedDate && new Date(selectedDate).getTime() > new Date().getTime()) {
        alert("Invalid date. Please select a date from the past or today.");
        return;
    }
    //check date specified
    if (selectedDate) {
        let specifiedDateStart = new Date(selectedDate);
        specifiedDateStart.setHours(0, 0, 0, 0);
        startTimestamp = specifiedDateStart.getTime();
        
        let specifiedDateEnd = new Date(selectedDate);
        specifiedDateEnd.setHours(23, 59, 59, 999);
        endTimestamp = specifiedDateEnd.getTime();
        
    } else {
        if (startTimeInput || endTimeInput) {
            alert("Please select a date when specifying start or end time.");
            return;
        }    
        startTimestamp = 0; 
        endTimestamp = Date.now();
    }
    //check time range specified
    if (startTimeInput) {
        startTimestamp = new Date(`${selectedDate} ${startTimeInput}`).getTime();
    }

    if (endTimeInput) {
        endTimestamp = new Date(`${selectedDate} ${endTimeInput}`).getTime();
    }

    // Check if the start time is after the end time
    if (startTimestamp > endTimestamp) {
        alert("Invalid time range. Please make sure the start time is before the end time.");
        return;
    }
    return records.filter(record => record.visit_time >= startTimestamp && record.visit_time <= endTimestamp);
}

