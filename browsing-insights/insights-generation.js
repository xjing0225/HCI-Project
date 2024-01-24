let selectedSites = [];

//suggest websites for selection when user type in search terms
function suggestWebsites() {
    const input = document.getElementById('websiteInput').value;
    const suggestionList = document.getElementById('websiteSuggestionList');
    suggestionList.innerHTML = '';
    // Check for matched websites based on user input
    if (input) {
        const matchedSites = allDomains.filter(site => site.includes(input)&& !selectedSites.includes(site));
        matchedSites.forEach(site => {
            const siteItem = document.createElement('li');
            siteItem.innerText = site;
            // Add the website from suggestion list to selected sites
            siteItem.onclick = function () {
                if (selectedSites.length < 3 && !selectedSites.includes(site)) {
                    selectedSites.push(site);
                    updateSelectedSites();
                    document.getElementById('websiteInput').value = '';
                    suggestWebsites();
                    visualizeData(isStacked);
                } else if (selectedSites.length >= 3) {
                    alert("You can select at most three websites for comparison.");
                    document.getElementById('websiteInput').value = '';
                    suggestWebsites();
                }
            };
            suggestionList.appendChild(siteItem);
        });
    }
}

//keep track of the website(s) selected by the user, update the graphs when changes applied
function updateSelectedSites() {
    const selectedList = document.getElementById('websiteSelectedList');
    selectedList.innerHTML = '';
    selectedSites.forEach(site => {
        const siteItem = document.createElement('li');
        siteItem.textContent = site;
        //for each selected site, add a remove option
        const removeButton = document.createElement('button');
        removeButton.textContent = "x";
        removeButton.classList.add('domainRemoveButton');
        siteItem.appendChild(removeButton);
        selectedList.appendChild(siteItem);
        //remove the previously selected site on request, refresh list
        removeButton.onclick = function() {
            selectedSites = selectedSites.filter(d => d !== site);
            updateSelectedSites();
            visualizeData(isStacked);
        };
    });
}

//retrieve the records of websites specified by the user
function processDataForGraph() {
    let siteVisitCounts = { past7Days: {}, past30Days: {}, months: {}};

    // Initialize countes for each selected site
    selectedSites.forEach(site => {
        siteVisitCounts.past7Days[site] = {};
        siteVisitCounts.past30Days[site] = {};
        siteVisitCounts.months[site] = {};
    });

    const currentDate = new Date();

    entireHistory.forEach(item => {
        const site = new URL(item.url).hostname;
        if (selectedSites.includes(site)) {
            //counts the visit times per day in the past 7 days, past 3o days and a monthly total
            const date = new Date(item.visit_time);
            const daysAgo = Math.floor((currentDate - date) / (24 * 60 * 60 * 1000));
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const month = date.toLocaleDateString('en-US', { month: 'short' });

            if (daysAgo < 7) {
                if (!siteVisitCounts.past7Days[site][dateLabel]) {
                    siteVisitCounts.past7Days[site][dateLabel] = 0;
                }
                siteVisitCounts.past7Days[site][dateLabel] += 1;
            }

            if (daysAgo < 30) {
                if (!siteVisitCounts.past30Days[site][dateLabel]) {
                    siteVisitCounts.past30Days[site][dateLabel] = 0;
                }
                siteVisitCounts.past30Days[site][dateLabel] += 1;
            }

            if (!siteVisitCounts.months[site][month]) {
                siteVisitCounts.months[site][month] = 0;
            }
            siteVisitCounts.months[site][month] += 1;
        }
    });

    console.log(siteVisitCounts);
    return siteVisitCounts;
}

//generate labels for the graphs
function generatePastDaysLabels(days) {
    const today = new Date();
    return Array.from({length: days}, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }).reverse();
}

function generateMonthLabels() {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.unshift(monthDate.toLocaleDateString('en-US', { month: 'short' }));
    }
    return months;
}

let chartInstances = { past7Days: null, past30Days: null, months: null};

function visualizeData(isStacked) {
    const processedData = processDataForGraph();
    // Past 7 Days
    const past7DaysLabels = generatePastDaysLabels(7);
    generateGraph('past7Days', past7DaysLabels, processedData.past7Days, isStacked);

    // Past 30 Days
    const past30DaysLabels = generatePastDaysLabels(30);
    generateGraph('past30Days', past30DaysLabels, processedData.past30Days, isStacked);

    // Months
    const monthLabels = generateMonthLabels();
    generateGraph('months', monthLabels, processedData.months, isStacked);
}


//utilize chart.js for generating bar plots (stacked or side-by-side comparison)
function generateGraph(type, labels, data, isStacked) {
    const colors = ['rgba(171, 215, 255, 1)', 'rgba(255, 243, 139, 1)', 'rgba(204, 191, 255, 1)'];
    const canvasId = type + 'Graph';

    if (chartInstances[type]) {
        chartInstances[type].destroy();
    }

    const datasets = selectedSites.map((site, index) => {
        return {
            label: site,
            backgroundColor: colors[index],
            data: labels.map(label => data[site][label] || 0)
        };
    });

    const chartData = {
        labels: labels,
        datasets: datasets
    };

    const chartOptions = {
        scales: {
            x: {
                stacked: isStacked
            },
            y: {
                stacked: isStacked
            }
        }
    };

    const ctx = document.getElementById(canvasId).getContext('2d');
    chartInstances[type] = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}
