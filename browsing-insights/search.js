//lhe search page let user search for specific records
function searchHistory() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();

    const filteredRecords = entireHistory.filter(record =>
        record.title.toLowerCase().includes(searchInput) ||
        new URL(record.url).hostname.toLowerCase().includes(searchInput)
    );

    if (filteredRecords.length == 0) {
        document.querySelector(".recordsContainer").innerHTML = "No matching records found";
    } else {
        initializeDisplay(filteredRecords);
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
    initializeDisplay(entireHistory);
}
