//fetch browsing history using Chrome API
function fetchHistory(callback) {
    chrome.history.search({
        'text': '', 
        'startTime': 0, 
        'maxResults': 0
    }, function(historyItems) {
        extractHistory(historyItems, callback);
    });
}

//extract the elements of browsing history
function extractHistory(historyItems, callback) {
    let results = [];
    let processedItems = 0;
    
    historyItems.forEach(historyItem => {
        chrome.history.getVisits({ 'url': historyItem.url }, function(visitItems) {
            visitItems.forEach(visitItem => {
                results.push({
                    title: historyItem.title,
                    url: historyItem.url,
                    visit_time: formatDate(new Date(visitItem.visitTime)),
                });
            });
            
            processedItems++;
            if (processedItems === historyItems.length) {
                callback(results);
            }
        });
    });
}

//format the date to readable forms
function formatDate(date) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return new Intl.DateTimeFormat('default', options).format(date).replace(',', '');
}

