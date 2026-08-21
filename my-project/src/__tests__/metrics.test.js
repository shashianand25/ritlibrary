import { describe, it, expect, beforeEach } from 'vitest';
import { initMetrics, handleMetric, getMetricsSummary, resetMetrics } from '../utils/metrics.js';

describe('Web Vitals & Metrics Telemetry Suite', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('records web vitals metrics accurately', () => {
    handleMetric({
      name: 'CLS',
      value: 0.05,
      rating: 'good',
      delta: 0.05,
      id: 'v1-123',
    });

    handleMetric({
      name: 'LCP',
      value: 1200,
      rating: 'good',
      delta: 1200,
      id: 'v1-456',
    });

    const summary = getMetricsSummary();
    expect(summary.metrics.CLS).toBeDefined();
    expect(summary.metrics.CLS.value).toBe(0.05);
    expect(summary.metrics.CLS.rating).toBe('good');
    expect(summary.metrics.LCP.value).toBe(1200);
  });

  it('ignores invalid or null metric inputs', () => {
    handleMetric(null);
    handleMetric({});
    handleMetric({ name: '' });

    const summary = getMetricsSummary();
    expect(Object.keys(summary.metrics).length).toBe(0);
  });

  it('initializes metrics collection without throwing in jsdom', () => {
    expect(() => initMetrics()).not.toThrow();
    const summary = getMetricsSummary();
    expect(summary.initialized).toBe(true);
  });

  it('resets recorded metrics cleanly', () => {
    handleMetric({ name: 'FCP', value: 800, rating: 'good', delta: 800, id: '1' });
    expect(Object.keys(getMetricsSummary().metrics).length).toBe(1);

    resetMetrics();
    expect(Object.keys(getMetricsSummary().metrics).length).toBe(0);
    expect(getMetricsSummary().initialized).toBe(false);
  });
});
