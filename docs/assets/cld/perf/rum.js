/**
 * RUM (Real User Monitoring) - Performance Metrics Collection
 * Collects and sends performance metrics to analytics endpoint
 */

(function(window, document) {
  'use strict';

  // Configuration
  const config = {
    endpoint: '/api/metrics',
    enabled: true,
    debug: false,
    sampleRate: 1.0, // 100% sampling (can be reduced in production)
  };

  // Check if RUM is already initialized
  if (window.__RUM_INITIALIZED__) {
    return;
  }
  window.__RUM_INITIALIZED__ = true;

  /**
   * Collect Navigation Timing metrics
   */
  function collectNavigationMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) {
      return null;
    }

    const navEntry = performance.getEntriesByType('navigation')[0];
    if (!navEntry) {
      return null;
    }

    return {
      // DNS lookup time
      dns: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),

      // TCP connection time
      tcp: Math.round(navEntry.connectEnd - navEntry.connectStart),

      // Time to First Byte (TTFB)
      ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),

      // Response download time
      download: Math.round(navEntry.responseEnd - navEntry.responseStart),

      // DOM processing time
      domProcessing: Math.round(navEntry.domComplete - navEntry.domInteractive),

      // DOM Content Loaded
      domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),

      // Full page load
      loadComplete: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),

      // Total time from navigation start to load complete
      totalTime: Math.round(navEntry.loadEventEnd - navEntry.fetchStart),

      // Transfer size
      transferSize: navEntry.transferSize || 0,
      encodedBodySize: navEntry.encodedBodySize || 0,
      decodedBodySize: navEntry.decodedBodySize || 0,
    };
  }

  /**
   * Collect Paint Timing metrics (FCP, LCP)
   */
  function collectPaintMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) {
      return null;
    }

    const paintEntries = performance.getEntriesByType('paint');
    const metrics = {};

    paintEntries.forEach(function(entry) {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = Math.round(entry.startTime);
      }
      if (entry.name === 'first-paint') {
        metrics.fp = Math.round(entry.startTime);
      }
    });

    return metrics;
  }

  /**
   * Collect Resource Timing metrics
   */
  function collectResourceMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) {
      return null;
    }

    const resources = performance.getEntriesByType('resource');

    // Group by resource type
    const byType = {
      script: [],
      stylesheet: [],
      image: [],
      fetch: [],
      other: []
    };

    resources.forEach(function(resource) {
      const type = resource.initiatorType;
      const duration = Math.round(resource.duration);
      const size = resource.transferSize || 0;

      const metric = {
        name: resource.name.split('?')[0].split('/').pop(), // filename only
        duration: duration,
        size: size
      };

      if (type === 'script' || type === 'link') {
        if (resource.name.includes('.js')) {
          byType.script.push(metric);
        } else if (resource.name.includes('.css')) {
          byType.stylesheet.push(metric);
        }
      } else if (type === 'img') {
        byType.image.push(metric);
      } else if (type === 'fetch' || type === 'xmlhttprequest') {
        byType.fetch.push(metric);
      } else {
        byType.other.push(metric);
      }
    });

    // Calculate totals
    const totals = {};
    Object.keys(byType).forEach(function(type) {
      const items = byType[type];
      totals[type] = {
        count: items.length,
        totalDuration: items.reduce(function(sum, item) { return sum + item.duration; }, 0),
        totalSize: items.reduce(function(sum, item) { return sum + item.size; }, 0)
      };
    });

    return totals;
  }

  /**
   * Collect user environment info
   */
  function collectEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  /**
   * Send metrics to analytics endpoint
   */
  function sendMetrics(data) {
    if (!config.enabled) {
      if (config.debug) {
        console.log('[RUM] Metrics collection disabled');
      }
      return;
    }

    // Sample rate check
    if (Math.random() > config.sampleRate) {
      if (config.debug) {
        console.log('[RUM] Skipped due to sampling');
      }
      return;
    }

    // Add metadata
    data.timestamp = Date.now();
    data.page = window.location.pathname;
    data.referrer = document.referrer;

    if (config.debug) {
      console.log('[RUM] Collected metrics:', data);
    }

    // Send via beacon API (non-blocking)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(config.endpoint, blob);
    } else {
      // Fallback to fetch with keepalive
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function(err) {
        if (config.debug) {
          console.error('[RUM] Failed to send metrics:', err);
        }
      });
    }
  }

  /**
   * Initialize RUM collection
   */
  function init() {
    // Wait for page load
    if (document.readyState === 'complete') {
      collectAndSend();
    } else {
      window.addEventListener('load', collectAndSend);
    }
  }

  /**
   * Collect all metrics and send
   */
  function collectAndSend() {
    // Wait a bit for all resources to finish
    setTimeout(function() {
      try {
        const metrics = {
          navigation: collectNavigationMetrics(),
          paint: collectPaintMetrics(),
          resources: collectResourceMetrics(),
          environment: collectEnvironmentInfo()
        };

        sendMetrics(metrics);
      } catch (err) {
        if (config.debug) {
          console.error('[RUM] Error collecting metrics:', err);
        }
      }
    }, 1000);
  }

  // Expose configuration for override
  window.RUM_CONFIG = config;

  // Auto-initialize
  init();

  // Export API
  window.RUM = {
    collect: collectAndSend,
    configure: function(options) {
      Object.assign(config, options);
    }
  };

})(window, document);
