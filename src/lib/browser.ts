// Conditional import hack to avoid crashing in non-extension environments
// where webextension-polyfill throws "This script should only be loaded in a browser extension."

let browser: any;
try {
  // We can't standard import because it executes immediately
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  browser = require('webextension-polyfill');
} catch (e) {
  // Ignore error
}

// Check if we are in an extension context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isExtensionContext = typeof (globalThis as any).chrome !== 'undefined' && !!(globalThis as any).chrome.runtime && !!(globalThis as any).chrome.runtime.id;

// Mock implementation for development/browser environment
const mockBrowser = {
  runtime: {
    sendMessage: async (message: unknown) => {
      console.log('[MockBrowser] sendMessage:', message);
      return Promise.resolve({ status: 'success', mock: true });
    },
    onMessage: {
      addListener: () => console.log('[MockBrowser] onMessage.addListener called'),
      removeListener: () => console.log('[MockBrowser] onMessage.removeListener called'),
    },
  },
  tabs: {
    create: async (createProperties: unknown) => {
      console.log('[MockBrowser] tabs.create:', createProperties);
      if (typeof window !== 'undefined' && (createProperties as { url?: string }).url) {
          window.open((createProperties as { url?: string }).url, '_blank');
      }
      return Promise.resolve({});
    },
    query: async () => [],
  },
  storage: {
    local: {
        get: async () => ({}),
        set: async (items: unknown) => console.log('[MockBrowser] storage.local.set:', items),
    }
  }
};

// Export safe browser object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeBrowser: any = (isExtensionContext && browser) ? browser : mockBrowser;
export default safeBrowser;
