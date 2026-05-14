import * as appInsights from 'applicationinsights';

let isTelemetryInitialized = false;

export function setupApplicationInsights(connectionString?: string): void {
  if (isTelemetryInitialized || !connectionString) {
    return;
  }

  appInsights
    .setup(connectionString)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();

  isTelemetryInitialized = true;
}
