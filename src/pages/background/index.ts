import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

const openaiApiKey = 'YOUR_API_KEY'; // TODO: Replace with your openai api key

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
    console.log(`Old value was "${oldValue}", new value is "${newValue}".`);
  }
});

let isOn = false;

chrome.action.onClicked.addListener(tab => {
  isOn = !isOn;
  if (isOn) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
    chrome.action.setTitle({ tabId: tab.id, title: 'WebColab (ON)' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });

    chrome.action.setTitle({ tabId: tab.id, title: 'WebColab (OFF)' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchChatGPTResponse') {
    (async () => {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful teaching assistant who tend to make wikipedia learning experience better.',
        },
        { role: 'user', content: request.question },
      ];
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`, // Ensure secure handling of your API key
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
          }),
        });

        const data = await response.json();
        console.log(data);
        sendResponse({ success: true, response: data.choices[0].message.content }); // Adjust based on actual response structure
      } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        sendResponse({ success: false, error: error.toString() });
      }
    })();
    return true; // Indicates you wish to send a response asynchronously.
  }
});

// chrome.runtime.sendMessage(
//   { action: 'fetchChatGPTResponse', question: 'Who won the world series in 2020?' },
//   response => {
//     if (response.success) {
//       console.log('Response from OpenAI:', response.response);
//     } else {
//       console.log('Error:', response.error);
//     }
//   },
// );
