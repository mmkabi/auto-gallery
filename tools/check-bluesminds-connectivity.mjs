import {
  buildBluesmindsChatBody,
  getBluesmindsChatEndpoint,
  requestBluesmindsChatCompletion,
  sanitizeProviderLog,
} from '../server/bluesminds-provider.mjs';
import { readServerConfig } from '../server/config.mjs';

const config = readServerConfig();

if (!config.apiKey || config.apiKey === 'PASTE_KEY_HERE') {
  console.error('Connectivity request not sent: configure OPENAI_API_KEY in server/.env first.');
  process.exitCode = 2;
} else {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const messages = [{ role: 'user', content: 'Reply exactly: OK' }];
  const requestBody = buildBluesmindsChatBody({
    model: config.model,
    messages,
    temperature: 0,
    maxTokens: 20,
  });

  console.log(JSON.stringify({
    endpoint: getBluesmindsChatEndpoint(config.baseURL),
    body: sanitizeProviderLog(requestBody),
  }));

  try {
    const result = await requestBluesmindsChatCompletion({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      model: config.model,
      messages,
      temperature: 0,
      maxTokens: 20,
      signal: controller.signal,
    });
    console.log(JSON.stringify({
      status: result.status,
      body: sanitizeProviderLog(result.body),
    }));
  } catch (error) {
    console.error(JSON.stringify({
      status: Number(error?.status) || null,
      code: typeof error?.code === 'string' ? error.code.slice(0, 120) : 'request_failed',
      body: sanitizeProviderLog(error?.responseBody || { error: { code: error?.name || 'request_failed' } }),
    }));
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}
