import type {
  LinkblogSuccessResponse,
  LinkblogErrorResponse,
  SaveLinkResult,
  ExtensionSettings,
} from '../types/index.js';

const DEFAULTS: ExtensionSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.linkblog.in/links',
};

async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.sync.get('settings');
  return { ...DEFAULTS, ...result.settings };
}

async function saveLink(url: string): Promise<SaveLinkResult> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    return {
      success: false,
      error: 'API key not configured. Click the extension icon to set it up.',
    };
  }

  try {
    const response = await fetch(settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = (await response.json()) as LinkblogSuccessResponse;
      return { success: true, title: data.title };
    }

    const errorData = (await response.json()) as LinkblogErrorResponse;
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.error || 'Unknown error';
    return { success: false, error: errorMessage };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: message };
  }
}

async function saveLinkFromActiveTab(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) {
    showNotification('Error', 'No URL found for the active tab.');
    return;
  }

  const result = await saveLink(tab.url);

  if (result.success) {
    showNotification('Link Saved', result.title ?? tab.url);
  } else {
    showNotification('Error', result.error ?? 'Failed to save link.');
  }
}

function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon128.png'),
    title: `Linkblog: ${title}`,
    message,
  });
}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-linkblog',
    title: 'Save to Linkblog',
    contexts: ['page', 'link'],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'save-to-linkblog') {
    const url = info.linkUrl ?? info.pageUrl;
    if (url) {
      const result = await saveLink(url);
      if (result.success) {
        showNotification('Link Saved', result.title ?? url);
      } else {
        showNotification('Error', result.error ?? 'Failed to save link.');
      }
    }
  }
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-current-page') {
    await saveLinkFromActiveTab();
  }
});

// Message handler for popup communication
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SAVE_LINK') {
    saveLink(message.url).then(sendResponse);
    return true; // keep channel open for async response
  }
  return false;
});
