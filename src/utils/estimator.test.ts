import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConstructionEstimate,
  formatINR,
  validateConsultationForm,
} from './estimator';

test('calculateConstructionEstimate uses ₹2,350/sq.ft baseline for Essential Build', () => {
  const result = calculateConstructionEstimate({
    areaSqFt: 2000,
    floors: 2,
    tierId: 'essential',
    includeSoilAndStructural: false,
    includeInteriorDesign: false,
  });

  assert.equal(result.baseConstructionCost, 4700000);
  assert.equal(result.totalEstimatedCost, 4700000);
  assert.equal(result.qualityCheckpoints, 400);
  assert.equal(result.effectiveRatePerSqFt, 2350);

  const milestoneSum = result.milestones.reduce((acc, m) => acc + m.amount, 0);
  assert.equal(milestoneSum, result.totalEstimatedCost);
});

test('calculateConstructionEstimate adds soil/structural engineering and interiors accurately', () => {
  const result = calculateConstructionEstimate({
    areaSqFt: 2400,
    floors: 3,
    tierId: 'turnkey_plus',
    includeSoilAndStructural: true,
    includeInteriorDesign: true,
  });

  // 2400 * 2650 = 6,360,000
  // engineering: 45,000 + (3 - 1) * 15,000 = 75,000
  // interiors: 2400 * 450 = 1,080,000
  assert.equal(result.baseConstructionCost, 6360000);
  assert.equal(result.engineeringAddonCost, 75000);
  assert.equal(result.interiorAddonCost, 1080000);
  assert.equal(result.totalEstimatedCost, 7515000);
  assert.equal(result.qualityCheckpoints, 600);
});

test('calculateConstructionEstimate clamps out-of-range inputs safely', () => {
  const result = calculateConstructionEstimate({
    areaSqFt: 100,
    floors: 10,
    tierId: 'signature',
    includeSoilAndStructural: false,
    includeInteriorDesign: false,
  });

  assert.equal(result.areaSqFt, 600);
  assert.equal(result.floors, 5);
  assert.equal(result.baseConstructionCost, 600 * 3100);
});

test('formatINR formats Indian lakh grouping cleanly', () => {
  assert.equal(formatINR(4700000), '₹47,00,000');
  assert.equal(formatINR(2350), '₹2,350');
});

test('validateConsultationForm catches invalid fields and passes valid submission', () => {
  const invalid = validateConsultationForm({
    name: 'A',
    email: 'bad-email',
    phone: '12345',
    service: '',
    message: '',
  });

  assert.ok(invalid.name);
  assert.ok(invalid.email);
  assert.ok(invalid.phone);
  assert.ok(invalid.service);

  const valid = validateConsultationForm({
    name: 'Karthik Subramanian',
    email: 'karthik@example.com',
    phone: '+91 98401 12345',
    service: 'Turnkey House Construction',
    message: 'Looking to construct a 2400 sq.ft duplex in Anna Nagar.',
  });

  assert.deepEqual(valid, {});
});
