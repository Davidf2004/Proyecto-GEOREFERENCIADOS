import applicationInsights from 'applicationinsights';

let isTelemetryInitialized = false;

export function setupApplicationInsights(connectionString?: string): void {
  if (isTelemetryInitialized || !connectionString) {
    return;
  }

  applicationInsights
    .setup(connectionString)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .start();

  isTelemetryInitialized = true;
}
