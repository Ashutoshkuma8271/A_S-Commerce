import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeShippingStatus } from './utils/shippingStatus.js';

test('normalizes courier delivery states', () => {
  assert.equal(normalizeShippingStatus('Delivered'), 'Delivered');
  assert.equal(normalizeShippingStatus('OUT FOR DELIVERY'), 'Out for Delivery');
  assert.equal(normalizeShippingStatus('in_transit'), 'In Transit');
  assert.equal(normalizeShippingStatus('ready to pack'), 'Packed');
  assert.equal(normalizeShippingStatus('cancelled'), 'Cancelled');
  assert.equal(normalizeShippingStatus('unknown'), 'Processing');
});

test('defaults missing courier state to processing', () => {
  assert.equal(normalizeShippingStatus(), 'Processing');
});
