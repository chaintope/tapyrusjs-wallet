import * as assert from 'assert';
import { describe, it } from 'mocha';

import { Config } from '../src/config';

describe('Config', () => {
  describe('url', () => {
    const headers = [
      {
        Authorization: 'Bearer test_token',
      },
    ];
    const config: Config = new Config({
      schema: 'https',
      host: 'example.org',
      port: 443,
      path: '',
      headers: headers,
    });
    it('should return url', () => {
      assert.strictEqual(config.url(), 'https://example.org:443/');
    });
  });
});
