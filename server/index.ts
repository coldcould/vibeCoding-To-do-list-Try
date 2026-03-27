import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Serene Flow server listening on http://127.0.0.1:${config.port}`);
});
