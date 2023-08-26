import * as assert from 'assert';
import 'isomorphic-fetch';
import { describe, it } from 'mocha';
import { Rpc } from '../src/rpc';
import * as sinon from 'sinon';
import { Config } from '../src/config';

describe('Rpc', () => {
  const rpc = new Rpc();

  describe('request', () => {
    const config = new Config({
      host: 'example.org',
      port: '50001',
      path: '/',
      network: 'prod',
    });

    let fetchStub: sinon.SinonStub<[string, any?], Promise<Response>>;

    beforeEach(() => {
      fetchStub = sinon.stub(rpc, 'fetch');
      const response = new Response(
        JSON.stringify({ jsonrpc: '2.0', result: 'result', id: 1 }),
      );
      fetchStub
        .onFirstCall()
        .returns(new Promise(resolve => resolve(response)));
    });

    afterEach(() => {
      fetchStub.reset();
    });

    it("should call Fetch API and returns the 'result' attribute of response", async () => {
      const result = await rpc.request(config, 'somemethod', []);
      assert(
        fetchStub.calledOnceWith('http://example.org:50001//', {
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'somemethod',
            params: [],
            id: 1,
          }),
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          referrerPolicy: 'no-referrer',
        }),
      );
      assert.strictEqual(result, 'result');
    });
  });
});
