import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Finetune Social Media',
  version: '0.1.0',
  description: 'Shape your LinkedIn feed with an AI agent that reacts to posts.',
  action: {
    default_title: 'Finetune Social Media',
  },
  side_panel: {
    default_path: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.linkedin.com/*'],
      js: ['src/content/linkedin.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage', 'tabs', 'sidePanel'],
  host_permissions: ['https://www.linkedin.com/*'],
});
