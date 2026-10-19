import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";

const logExporter = new OTLPLogExporter({});

const sdk = new NodeSDK({
  logRecordProcessors: [
    new BatchLogRecordProcessor({
      exporter: logExporter,
    }),
  ],
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pino": {
        enabled: false,
      },
    }),
    new PinoInstrumentation(),
  ],
});

sdk.start();
