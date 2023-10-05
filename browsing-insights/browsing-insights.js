//obtain browsing history using chrome history APIs: chrome.history.search() and chrome.history.getVisits()
//the search method only returns the most recent visit to the urls visited
function fetchHistory(callback) {
    chrome.history.search({
        'text': '', 
        'startTime': 0, 
        'endTime': Date.now(),
        'maxResults': 0 //setting to 0 gives all results
    }, function(historyItems) {
        extractHistory(historyItems, callback);
    });
}
//from each url's most recent visit, use getVisits() to obtain all hisotry records
//for each record, extract the title, url, visit_time and transition type
function extractHistory(historyItems, callback) {
    let records = [];
    let processedItems = 0;
    historyItems.forEach(historyItem => {
        chrome.history.getVisits({ 'url': historyItem.url }, function(visitItems) {
            visitItems.forEach(visitItem => {
                records.push({
                    title: historyItem.title,
                    url: historyItem.url,
                    visit_time: visitItem.visitTime,
                    transition: visitItem.transition
                });
            });
            processedItems++;
            if (processedItems === historyItems.length) {
                records.sort(function(a, b) {return b.visit_time - a.visit_time;});//sort in descending order
                callback(records);
            }
        });
    });
}

//display the browsing history, by default the records should be grouped by date
//the default sorting is displaying records descedningly


let currentSort = 'newest';
function displayRecords(records, sortOrder = currentSort) {
    let recordsContainers = document.querySelectorAll(".recordsContainer");
    recordsContainers.forEach(recordsContainer => {
        recordsContainer.innerHTML = "";
        if (records.length == 0) {
            recordsContainer.innerHTML = "No records found.";
            return;
        }
        //group records by date
        let groupedRecords = {};
        records.forEach(record => {
            let dateKey = new Date(record.visit_time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            if (!groupedRecords[dateKey]) {
                groupedRecords[dateKey] = [];
            }
            groupedRecords[dateKey].push(record);
        });

        //sort dates based on speicified order
        let sortedDates;
        if (sortOrder == "newest") {
            sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));
        } else {
            sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(a) - new Date(b));
        }
        
        sortedDates.forEach(dateKey => {
            //display records by date 
            let dateTitle = document.createElement("h2");
            dateTitle.innerText = dateKey;
            dateTitle.classList.add("date-title");
            recordsContainer.appendChild(dateTitle);
            groupedRecords[dateKey].forEach(record => {
                let recordEntry = document.createElement("div");
                recordEntry.classList.add("record-entry");
                // visit_time
                let time = document.createElement("span");
                time.innerText = convertVisitTime(record.visit_time);
                recordEntry.appendChild(time);
                // favicon
                let favicon = document.createElement("img");
                favicon.classList.add("favicon");
                favicon.src = faviconURL(record.url);
                recordEntry.appendChild(favicon);
                //depricated method
                //favicon.src = `https://s2.googleusercontent.com/s2/favicons?domain=${new URL(record.url).hostname}`;
                // favicon.onerror = function() {
                //     favicon.src = 'images/favicon-default.svg';
                //     console.log("updated");
                // };
                // url title
                let link = document.createElement("a");
                link.href = record.url;
                link.innerText = record.title;
                link.target = "_blank";
                recordEntry.appendChild(link);
                // append the record
                recordsContainer.appendChild(recordEntry);
            });
        });
    });
}

//fetch the favicon of urls
function faviconURL(u) {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', u);
    url.searchParams.set('size', '32');
    return url.toString();
  }
  
//apply the specified filters on the records displayed
function applyFilters() {
    fetchHistory(function(records) {
        let dateTimeFilteredRecords = filterByDateTime(records);
        if(!dateTimeFilteredRecords) {
            return; // Return early if an error was encountered
        }
        let domainFilteredRecords = filterByDomain(dateTimeFilteredRecords);
        displayRecords(domainFilteredRecords);
    });
}


//convert the retrieved visit_time to readable format, hour:min:sec
function convertVisitTime(visitTime) {
    let date = new Date(visitTime);
    let timeString = date.toTimeString().split(' ')[0];
    return timeString;
}


document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll("nav a");
    const contents = document.querySelectorAll("main > div");
    // Default tab
    let activeTab = "home"; 
    //handle switching of tabs
    showTab(activeTab);
    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            // Update the activeTab and display the content
            contents.forEach(section => section.style.display = "none");
            navLinks.forEach(link => link.classList.remove("selected"));
            activeTab = this.id;
            showTab(activeTab);
        });
    });

    // Debounced search
    let searchTimeout; 
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout); 
            showClearButton();
            searchTimeout = setTimeout(searchHistory, 500); 
        });
    }

    //clear search by clicking clear button
    const clearSearchButton = document.getElementById('clearSearchButton');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', clearSearch);
    }

    // Sorting the records
    const sortButton = document.getElementById('sortButton');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            if (currentSort == 'newest') {
                currentSort = 'oldest';
                document.getElementById('sortButton').innerText = 'Oldest';
            } else {
                currentSort = 'newest';
                document.getElementById('sortButton').innerText = 'Newest';
            } 
            searchHistory();
        });
        
    }
    //handles filtering by date&time 
    document.getElementById("resetButton").addEventListener("click", function() {
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        applyFilters();
    });
    document.getElementById('startTime').addEventListener('change', applyFilters);
    document.getElementById('endTime').addEventListener('change', applyFilters);
    document.getElementById('datePicker').addEventListener('change', applyFilters);
    //handles filtering by domain
    document.getElementById('domainInput').addEventListener('input', suggestDomains);
    document.getElementById('filterType').addEventListener('change', applyFilters);
});


//displaying contents for each tab
function showTab(tabId) {
    const contentId = tabId + "Page";
    document.getElementById(contentId).style.display = "block";
    document.getElementById(tabId).classList.add("selected");
    // Load the content specific to the tab
    switch (tabId) {
        case "home":
            break;
        case "search":
            searchHistory();
            break;
        case "tracking":
            fetchDomains(() => {
                console.log('Domains fetched!');
            });
            fetchHistory(displayRecords);
            break;
        case "insights":
            break;
    }
}



