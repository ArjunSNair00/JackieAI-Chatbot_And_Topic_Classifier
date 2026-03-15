import { memo, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export interface PdfExtractionJob {
  id: string;
  name: string;
  base64: string;
}

interface PdfTextExtractorWebViewProps {
  job: PdfExtractionJob | null;
  maxChars: number;
  onExtracted: (text: string) => void;
  onError: (error: string) => void;
}

function buildHtml(maxChars: number): string {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <script>
      const maxChars = ${maxChars};
      const jobChunks = {};

      function post(payload) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }

      function postError(error, jobId) {
        post({
          type: "error",
          error: String(error || "Unknown PDF extraction error."),
          jobId,
        });
      }

      function postSuccess(text, jobId) {
        post({ type: "success", text, jobId });
      }

      function base64ToUint8Array(base64Input) {
        const binary = atob(base64Input);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }

      window.onerror = function (message, source, line, col, error) {
        const details = error && error.message ? error.message : message;
        postError(details || "Unknown runtime error");
        return false;
      };

      function loadScript(url, timeoutMs) {
        return new Promise(function (resolve, reject) {
          const script = document.createElement("script");
          const timer = setTimeout(function () {
            script.onerror = null;
            script.onload = null;
            reject(new Error("Timed out loading " + url));
          }, timeoutMs);

          script.src = url;
          script.async = true;
          script.onload = function () {
            clearTimeout(timer);
            resolve();
          };
          script.onerror = function () {
            clearTimeout(timer);
            reject(new Error("Failed to load " + url));
          };

          document.head.appendChild(script);
        });
      }

      async function ensurePdfJs() {
        if (window.pdfjsLib) {
          return;
        }

        const scriptUrls = [
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
          "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
        ];

        let lastError = null;
        for (const url of scriptUrls) {
          try {
            await loadScript(url, 10000);
            if (window.pdfjsLib) {
              return;
            }
          } catch (error) {
            lastError = error;
          }
        }

        throw lastError || new Error("pdf.js did not load.");
      }

      async function extract(base64Input, jobId) {
        let pdf = null;

        try {
          await ensurePdfJs();

          const typedData = base64ToUint8Array(base64Input);
          const loadingTask = window.pdfjsLib.getDocument({
            data: typedData,
            disableWorker: true,
          });
          pdf = await loadingTask.promise;

          let text = "";
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";

            if (text.length >= maxChars) {
              text = text.slice(0, maxChars);
              break;
            }
          }

          postSuccess(text, jobId);
        } catch (error) {
          postError(error, jobId);
        } finally {
          if (pdf && typeof pdf.destroy === "function") {
            pdf.destroy();
          }
        }
      }

      function handleCommand(rawData) {
        try {
          const payload = JSON.parse(String(rawData || "{}"));
          if (payload.type === "extract") {
            if (!payload.base64 || typeof payload.base64 !== "string") {
              postError("Missing PDF payload.", payload.jobId);
              return;
            }

            extract(payload.base64, payload.jobId);
            return;
          }

          if (payload.type === "extractBegin") {
            if (!payload.jobId || typeof payload.jobId !== "string") {
              postError("Missing job id for chunked extraction.");
              return;
            }

            const totalChunks = Number(payload.totalChunks || 0);
            if (!Number.isFinite(totalChunks) || totalChunks <= 0) {
              postError("Invalid chunk count.", payload.jobId);
              return;
            }

            jobChunks[payload.jobId] = {
              parts: new Array(totalChunks),
              totalChunks,
            };
            return;
          }

          if (payload.type === "extractChunk") {
            const jobId = payload.jobId;
            const entry = jobChunks[jobId];
            const index = Number(payload.index);

            if (!entry || !Number.isFinite(index)) {
              postError("Invalid PDF chunk payload.", jobId);
              return;
            }

            entry.parts[index] = String(payload.chunk || "");
            return;
          }

          if (payload.type === "extractEnd") {
            const jobId = payload.jobId;
            const entry = jobChunks[jobId];
            if (!entry) {
              postError("Missing chunked payload state.", jobId);
              return;
            }

            if (entry.parts.some(function (part) { return typeof part !== "string"; })) {
              postError("Missing PDF chunks.", jobId);
              delete jobChunks[jobId];
              return;
            }

            const joined = entry.parts.join("");
            delete jobChunks[jobId];
            extract(joined, jobId);
            return;
          }
        } catch (error) {
          postError(error);
        }
      }

      document.addEventListener("message", function (event) {
        handleCommand(event && event.data);
      });

      window.addEventListener("message", function (event) {
        handleCommand(event && event.data);
      });

      (async function init() {
        try {
          await ensurePdfJs();
          post({ type: "ready" });
        } catch (error) {
          postError(error);
          return;
        }
      })();
    </script>
  </body>
</html>`;
}

function PdfTextExtractorWebViewComponent({
  job,
  maxChars,
  onExtracted,
  onError,
}: PdfTextExtractorWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isExtractorReady, setIsExtractorReady] = useState(false);
  const sentJobIdRef = useRef<string | null>(null);
  const CHUNK_SIZE = 180000;

  useEffect(() => {
    if (!job || !isExtractorReady) {
      return;
    }

    if (sentJobIdRef.current === job.id) {
      return;
    }

    sentJobIdRef.current = job.id;

    if (job.base64.length <= CHUNK_SIZE) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "extract",
          jobId: job.id,
          base64: job.base64,
        }),
      );
      return;
    }

    const totalChunks = Math.ceil(job.base64.length / CHUNK_SIZE);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "extractBegin",
        jobId: job.id,
        totalChunks,
      }),
    );

    for (let index = 0; index < totalChunks; index += 1) {
      const start = index * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = job.base64.slice(start, end);
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "extractChunk",
          jobId: job.id,
          index,
          chunk,
        }),
      );
    }

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "extractEnd",
        jobId: job.id,
      }),
    );
  }, [isExtractorReady, job]);

  useEffect(() => {
    if (!job) {
      sentJobIdRef.current = null;
    }
  }, [job]);

  if (!job) {
    return null;
  }

  return (
    <View style={styles.hiddenContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: buildHtml(maxChars) }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
        startInLoadingState={false}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data) as {
              type: "ready" | "success" | "error";
              text?: string;
              error?: string;
              jobId?: string;
            };

            if (payload.type === "ready") {
              setIsExtractorReady(true);
              return;
            }

            if (payload.jobId && payload.jobId !== job.id) {
              return;
            }

            if (payload.type === "success") {
              onExtracted(payload.text ?? "");
              return;
            }

            onError(payload.error ?? "Unknown PDF extraction error.");
          } catch {
            onError("Malformed PDF extraction response.");
          }
        }}
        onError={(syntheticEvent) => {
          onError(
            syntheticEvent.nativeEvent.description ||
              "WebView failed while extracting PDF.",
          );
        }}
        onHttpError={(syntheticEvent) => {
          onError(
            `PDF extractor failed to load (${syntheticEvent.nativeEvent.statusCode}).`,
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: "absolute",
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export const PdfTextExtractorWebView = memo(PdfTextExtractorWebViewComponent);
