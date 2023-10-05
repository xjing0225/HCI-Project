chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'browsing-insights.html' });
    //chrome.tabs.create({ url: 'test.html' });
  });