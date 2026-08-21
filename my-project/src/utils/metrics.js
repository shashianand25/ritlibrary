/**
 * Client-Side Performance & Web Vitals Metrics Collector
 *
 * Measures Core Web Vitals (CLS, FCP, LCP, TTFB, INP) using the standard web-vitals library
 * and exposes structured performance summaries.
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import logger from './logger.js';

let isMetricsInitialized = false;
const recordedMetrics = {};

export function handleMetric(metric) {
  if (!metric || !metric.name) return;
  recordedMetrics[metric.name] = {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: new Date().toISOString(),
  };

  logger.info(`[Metric] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`, {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
}

/**
 * Initialize Web Vitals performance collection
 */
export function initMetrics() {
  if (isMetricsInitialized) return;
  isMetricsInitialized = true;

  try {
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  } catch {
    // Gracefully handle environments where PerformanceObserver is unavailable
  }
}

/**
 * Retrieve captured metrics for diagnostic inspection
 */
export function getMetricsSummary() {
  return {
    initialized: isMetricsInitialized,
    metrics: { ...recordedMetrics },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Reset recorded metrics state (for testing)
 */
export function resetMetrics() {
  isMetricsInitialized = false;
  Object.keys(recordedMetrics).forEach((key) => delete recordedMetrics[key]);
}

export default {
  initMetrics,
  getMetricsSummary,
  handleMetric,
  resetMetrics,
};
