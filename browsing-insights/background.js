chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'browsing-insights.html' });
  });