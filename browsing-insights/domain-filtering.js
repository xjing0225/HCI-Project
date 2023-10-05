let allDomains = [];
let selectedDomains = [];

//fetch all the domains the user has visited 
function fetchDomains(callback) {
    chrome.history.search({
        'text': '', 
        'startTime': 0,
        'maxResults': 0
    }, function(historyItems) {
        //retrieve all visited domains
        allDomains = [...new Set(historyItems.map(item => new URL(item.url).hostname))];
        callback();
    });
}

//suggest domains based on what users have typed in
function suggestDomains() {
    const input = document.getElementById('domainInput').value;
    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = '';
    //check for matached domains
    if (input) {
        const matchedDomains = allDomains.filter(domain => domain.includes(input) && !selectedDomains.includes(domain));
        matchedDomains.forEach(domain => {
            const domainItem = document.createElement('li');
            domainItem.innerText = domain;
            //add the domain from suggestion list to selected list
            domainItem.onclick = function () {
                if (!selectedDomains.includes(domain)) {
                    selectedDomains.push(domain);
                    updateSelectedDomains();
                    document.getElementById('domainInput').value = '';
                    suggestDomains();
                    applyFilters();
                }
            };
            suggestionList.appendChild(domainItem);
        });
    }
}

//update the selected domains
function updateSelectedDomains() {
    const selectedList = document.getElementById('selectedList');
    selectedList.innerHTML = '';
    selectedDomains.forEach(domain => {
        const domainItem = document.createElement('li');
        domainItem.textContent = domain;
        //for each selected domain, add a remove option
        const removeButton = document.createElement('button');
        removeButton.textContent = "x";
        removeButton.classList.add('domainRemoveButton');
        domainItem.appendChild(removeButton);
        selectedList.appendChild(domainItem);
        //remove the previously selected domain on request, refresh list
        removeButton.onclick = function() {
            selectedDomains = selectedDomains.filter(d => d !== domain);
            updateSelectedDomains();
            applyFilters();       
        };
    });
}

//filter records by specified include/exclude domain
function filterByDomain(records) {
    let filterType = document.getElementById('filterType').value;
    if (filterType == "exclude") {
        return records.filter(record => !selectedDomains.includes(new URL(record.url).hostname));
    } else {
        return records.filter(record => selectedDomains.includes(new URL(record.url).hostname));
    }
}
