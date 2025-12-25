// Safe shim for webextension-polyfill.
// In a real extension environment (Chrome/Firefox), `chrome` or `browser` globals exist.
// In a development/test environment (like Playwright), they don't.
// This wrapper avoids importing `webextension-polyfill` directly because it throws an error immediately
// if loaded outside an extension context, which crashes the app in dev mode.

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

// Check for globals.
// 'browser' is standard WebExtension API (Firefox, Polyfilled Chrome).
// 'chrome' is Chromium native.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalBrowser = (globalThis as any).browser || (globalThis as any).chrome;

// Prefer the global object if it exists (Extension Context), otherwise use Mock (Dev Context)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const safeBrowser: any = (globalBrowser && globalBrowser.runtime) ? globalBrowser : mockBrowser;

export default safeBrowser;
