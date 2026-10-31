import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

function formatCompact(count: number): string {
  if (count < 1_000) return String(count);
  if (count < 10_000) return `${(count / 1_000).toFixed(1)}k`;
  if (count < 1_000_000) return `${Math.round(count / 1_000)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

function formatExact(count: number): string {
  return Math.round(count).toLocaleString("en-US");
}

type UsageWindow = {
  kind: string;
  label: string;
  displayPercent: number;
  resetCountdown?: string;
};

type OpenCodeUsage = {
  displayMode: "remaining" | "used";
  windows: UsageWindow[];
};

export default function (pi: ExtensionAPI) {
  let currentContext: ExtensionContext | undefined;
  let requestRender: (() => void) | undefined;
  let openCodeUsage: OpenCodeUsage | undefined;

  pi.events.on("subscription-usage/status/v1", (payload) => {
    if (!payload || typeof payload !== "object") {
      openCodeUsage = undefined;
    } else {
      const event = payload as {
        status?: string;
        providerId?: string;
        displayMode?: "remaining" | "used";
        windows?: UsageWindow[];
      };
      openCodeUsage = event.status === "ready" && event.providerId === "opencode-go"
        ? {
            displayMode: event.displayMode === "used" ? "used" : "remaining",
            windows: Array.isArray(event.windows) ? event.windows : [],
          }
        : undefined;
    }
    requestRender?.();
  });

  const refresh = (_event: unknown, ctx: ExtensionContext) => {
    currentContext = ctx;
    requestRender?.();
  };

  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== "tui") return;
    currentContext = ctx;
    let cachedStatsKey = "";
    let cachedUsage = "";

    ctx.ui.setFooter((tui, theme, footerData) => {
      requestRender = () => tui.requestRender();
      const unsubscribe = footerData.onBranchChange(() => tui.requestRender());

      return {
        dispose() {
          unsubscribe();
          requestRender = undefined;
        },
        invalidate() {},
        render(width: number): string[] {
          const active = currentContext ?? ctx;
          const branch = footerData.getGitBranch();
          const sessionName = active.sessionManager.getSessionName();
          const home = process.env.HOME || process.env.USERPROFILE;
          const cwd = home && active.cwd.startsWith(`${home}/`)
            ? `~${active.cwd.slice(home.length)}`
            : active.cwd === home ? "~" : active.cwd;
          const location = [cwd, branch, sessionName].filter(Boolean).join(" · ");

          const manager = active.sessionManager;
          const statsKey = `${manager.getSessionId()}:${manager.getLeafId()}:${manager.getEntries().length}`;
          if (statsKey !== cachedStatsKey) {
            let inputTokens = 0;
            let outputTokens = 0;
            for (const entry of manager.getBranch()) {
              if (entry.type === "message" && entry.message.role === "assistant") {
                inputTokens += entry.message.usage.input;
                outputTokens += entry.message.usage.output;
              }
            }
            cachedUsage = [
              inputTokens > 0 ? `↑${formatCompact(inputTokens)}` : "",
              outputTokens > 0 ? `↓${formatCompact(outputTokens)}` : "",
            ].filter(Boolean).join(" ");
            cachedStatsKey = statsKey;
          }

          const statuses = footerData.getExtensionStatuses();
          const subscriptionStatus = statuses.get("subscription-usage")
            ?.replace(/[\r\n\t]+/g, " ").trim();
          const otherStatuses = Array.from(statuses.entries())
            .filter(([key]) => key !== "subscription-usage")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, text]) => text.replace(/[\r\n\t]+/g, " ").trim());
          const usageParts: string[] = [];

          const usageWindows = openCodeUsage?.windows ?? [];
          const sessionWindow = usageWindows.find((window) => window.kind === "hourly");
          const weeklyWindow = usageWindows.find((window) => window.kind === "weekly");
          const displaySuffix = openCodeUsage?.displayMode === "used" ? "used" : "left";
          const formatWindow = (name: string, window: UsageWindow) =>
            `${name} ${window.label} ${Math.round(window.displayPercent)}% ${displaySuffix}` +
            (window.resetCountdown ? ` ↻${window.resetCountdown}` : "");
          const limitParts: string[] = [];
          if (sessionWindow) limitParts.push(theme.fg("accent", formatWindow("Session", sessionWindow)));
          if (weeklyWindow) limitParts.push(theme.fg("warning", formatWindow("Weekly", weeklyWindow)));
          if (limitParts.length > 0) usageParts.push(limitParts.join(theme.fg("dim", " · ")));

          const regularUsage = [
            cachedUsage,
            ...otherStatuses,
            openCodeUsage ? undefined : subscriptionStatus,
          ].filter(Boolean).join(" ");
          if (regularUsage) usageParts.push(theme.fg("dim", regularUsage));
          const usage = usageParts.join(" ");

          const contextUsage = active.getContextUsage();
          let contextLine = contextUsage?.tokens == null
            ? "Context: unknown"
            : `Context: ${formatExact(contextUsage.tokens)} / ${formatExact(contextUsage.contextWindow)}`;
          if (contextUsage?.tokens != null && contextUsage.tokens > 200_000) {
            contextLine = theme.fg("error", contextLine);
          } else if (contextUsage?.tokens != null && contextUsage.tokens > 100_000) {
            contextLine = theme.fg("warning", contextLine);
          } else {
            contextLine = theme.fg("dim", contextLine);
          }

          const model = active.model;
          const modelName = model?.name || model?.id || "no model";
          const effort = model?.reasoning ? (active.thinkingLevel || "off") : undefined;
          const modelLine = effort ? `${modelName} · ${effort}` : modelName;

          return [
            truncateToWidth(theme.fg("dim", location), width, theme.fg("dim", "…")),
            truncateToWidth(usage, width, theme.fg("dim", "…")),
            truncateToWidth(contextLine, width, theme.fg("dim", "…")),
            truncateToWidth(modelLine, width, "…"),
          ];
        },
      };
    });

    requestRender?.();
  });

  pi.on("turn_end", refresh);
  pi.on("message_end", refresh);
  pi.on("model_select", refresh);
  pi.on("thinking_level_select", refresh);
  pi.on("session_compact", refresh);
}
