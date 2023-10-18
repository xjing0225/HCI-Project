//The search page let user search for specific records
function searchHistory() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    //match the search term with browsing history titles and hostnames to search for records
    let filteredRecords = entireHistory.filter(record =>
        record.title.toLowerCase().includes(searchInput) ||
        new URL(record.url).hostname.toLowerCase().includes(searchInput)
    );
    if (document.getElementById("searchDatePicker").value) {
        filteredRecords = filterByDate(filteredRecords);
    }
    if (filteredRecords.length == 0) {
        document.querySelector(".recordsContainer").innerHTML = "No matching records found";
    } else {
        appendRecords(filteredRecords);
    }

}


//show clear search button when there's exsiting search input
function showClearButton() {
    const searchInput = document.getElementById('searchInput').value.trim();
    const clearButton = document.getElementById('clearSearchButton');
    if (searchInput) {
        //display the button inside the search box
        clearButton.style.display = 'inline';
    } else {
        clearButton.style.display = 'none';
    }
}

//clear search input on request
function clearSearch() {
    // Clear the search input value
    document.getElementById('searchInput').value = '';
    // Hide the clear button
    document.getElementById('clearSearchButton').style.display = 'none';
    searchHistory();
}

function filterByDate(records) {
    let selectedDate = document.getElementById("searchDatePicker").value;
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
        
    }
    return records.filter(record => record.visit_time >= startTimestamp && record.visit_time <= endTimestamp);
}

