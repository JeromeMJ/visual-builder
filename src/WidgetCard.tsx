
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import type { CanvasState } from "./useDesignState";
import type { PreviewMode, ThemeState } from "./theme";
import {
  buttonStyle,
  chipStyle,
  miniPanelStyle,
  resolveSurface,
  surfaceStyle,
  toRgba,
} from "./theme";
import type { TableRow, Widget } from "./widgetLibrary";

type WidgetCardProps = {
  widget: Widget;
  theme: ThemeState;
  previewMode: PreviewMode;
  columnCount: number;
  designMode: boolean;
  canvasState: CanvasState;
  selected: boolean;
  selectionCount: number;
  onSelect: (id: string, additive?: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleHidden: (id: string) => void;
};

function PlaceholderState({ state, theme }: { state: CanvasState; theme: ThemeState }) {
  if (state === "loading") {
    return (
      <div className="grid gap-3">
        <div className="h-5 w-2/5 rounded-full" style={{ background: toRgba(theme.textColor, 0.12) }} />
        <div className="h-24 rounded-2xl" style={{ background: toRgba(theme.textColor, 0.08) }} />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-12 rounded-2xl" style={{ background: toRgba(theme.textColor, 0.08) }} />
          ))}
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        className="grid place-items-center rounded-3xl border border-dashed p-8 text-center text-sm"
        style={{ borderColor: toRgba(theme.cardBorderColor, 0.4), color: toRgba(theme.textColor, 0.7) }}
      >
        No mock content right now. Add a widget or change the preview state back to live.
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-3xl p-6 text-sm" style={{ ...miniPanelStyle(theme), color: toRgba(theme.textColor, 0.86) }}>
        <div className="font-semibold">Preview error</div>
        <div className="mt-2" style={{ color: toRgba(theme.textColor, 0.72) }}>
          This is a simulated error state so you can style failure surfaces before real data exists.
        </div>
      </div>
    );
  }

  return null;
}

function HeroWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const accent = widget.style.accent ?? theme.accent;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
      <div>
        <div className="text-xs uppercase tracking-[0.26em]" style={{ color: toRgba(theme.textColor, 0.62) }}>
          {widget.data.subtitle}
        </div>
        <h3 className="mt-3 text-3xl font-semibold leading-tight" style={{ letterSpacing: `${theme.letterSpacing * 0.5}px` }}>
          {widget.title}
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: toRgba(theme.textColor, 0.74) }}>
          {widget.data.body}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {widget.data.tags.map((tag) => (
            <span key={tag} className="rounded-full px-3 py-2 text-xs" style={chipStyle(theme, false)}>
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="px-4 py-2 text-sm font-medium" style={buttonStyle(theme, true, widget.style.buttonStyleMode)}>
            {widget.data.ctaLabel || "Get started"}
          </button>
          <button type="button" className="px-4 py-2 text-sm" style={buttonStyle(theme, false, "outline")}>
            Secondary action
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {[
          { label: "Visitors", value: widget.data.statA || "24.8K" },
          { label: "Conversion", value: widget.data.statB || "5.2%" },
          { label: "Revenue", value: widget.data.statC || "$18.4K" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4" style={miniPanelStyle(theme, { accent })}>
            <div className="text-xs uppercase tracking-[0.22em]" style={{ color: toRgba(theme.textColor, 0.62) }}>
              {item.label}
            </div>
            <div className="mt-3 text-xl font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const accent = widget.style.accent ?? theme.accent;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {[
        { label: "Visitors", value: widget.data.statA || "24.8K", delta: "+12.4%" },
        { label: "Conversion", value: widget.data.statB || "5.2%", delta: "+1.1%" },
        { label: "Revenue", value: widget.data.statC || "$18.4K", delta: "+8.6%" },
      ].map((item) => (
        <div key={item.label} className="rounded-2xl p-4" style={miniPanelStyle(theme, { accent })}>
          <div className="text-xs uppercase tracking-[0.22em]" style={{ color: toRgba(theme.textColor, 0.62) }}>
            {item.label}
          </div>
          <div className="mt-3 text-2xl font-semibold">{item.value}</div>
          <div className="mt-2 text-sm" style={{ color: toRgba(accent, 0.95) }}>
            {item.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartGraphic({ points, theme, widget }: { points: number[]; theme: ThemeState; widget: Widget }) {
  const resolved = resolveSurface(theme, widget.style);
  const accent = resolved.accent;
  const glow = resolved.glowColor;
  const chartSkin = resolved.chartSkin;
  const width = 320;
  const height = 160;
  const max = Math.max(...points, 1);
  const step = width / Math.max(points.length - 1, 1);

  const normalized = points.map((value, index) => ({
    x: index * step,
    y: height - (value / max) * (height - 16),
  }));

  const linePath = normalized.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L ${normalized[normalized.length - 1]?.x ?? width},${height} L 0,${height} Z`;

  if (chartSkin === "bars") {
    return (
      <div className="flex h-44 items-end gap-3 rounded-2xl p-4" style={miniPanelStyle(theme, widget.style)}>
        {points.map((value, index) => (
          <motion.div
            key={`${value}-${index}`}
            layout
            className="flex-1 rounded-t-2xl"
            style={{
              height: `${(value / max) * 100}%`,
              background: `linear-gradient(180deg, ${toRgba(accent, 0.98)}, ${toRgba(glow, 0.42)})`,
              boxShadow: `0 0 26px ${toRgba(glow, 0.18)}`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={miniPanelStyle(theme, widget.style)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible">
        <defs>
          <linearGradient id={`${widget.id}-stroke`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={glow} />
          </linearGradient>
          <linearGradient id={`${widget.id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={toRgba(accent, 0.42)} />
            <stop offset="100%" stopColor={toRgba(glow, 0.02)} />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((y) => (
          <line
            key={y}
            x1={0}
            x2={width}
            y1={height * y}
            y2={height * y}
            stroke={toRgba(theme.textColor, 0.08)}
            strokeDasharray="4 6"
          />
        ))}

        {chartSkin === "area" ? <path d={areaPath} fill={`url(#${widget.id}-fill)`} /> : null}

        <path
          d={linePath}
          fill="none"
          stroke={`url(#${widget.id}-stroke)`}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {normalized.map((point) => (
          <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={4.5} fill={accent} />
        ))}
      </svg>
    </div>
  );
}

function ChartWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const points = widget.data.chartPoints?.length ? widget.data.chartPoints : [28, 36, 42, 38, 54, 62, 58];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Sun+"].slice(0, points.length);

  return (
    <div className="grid gap-4">
      <ChartGraphic points={points} theme={theme} widget={widget} />
      <div className="flex items-center justify-between text-xs" style={{ color: toRgba(theme.textColor, 0.6) }}>
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {widget.data.tags.map((tag) => (
          <span key={tag} className="rounded-full px-3 py-1.5 text-xs" style={chipStyle(theme, false)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function ActivityWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const accent = widget.style.accent ?? theme.accent;

  return (
    <div className="space-y-3">
      {widget.data.listItems.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl p-4" style={miniPanelStyle(theme, widget.style)}>
          <span
            className="size-2.5 rounded-full"
            style={{
              background: accent,
              boxShadow: `0 0 14px ${toRgba(widget.style.glowColor ?? theme.glowColor, 0.34)}`,
            }}
          />
          <div className="text-sm" style={{ color: toRgba(theme.textColor, 0.74) }}>
            {item}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 text-sm leading-7" style={miniPanelStyle(theme, widget.style)}>
        {widget.data.body}
      </div>
      <div className="flex flex-wrap gap-2">
        {widget.data.tags.map((chip) => (
          <span key={chip} className="rounded-full px-3 py-2 text-sm" style={chipStyle(theme, false)}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ value, theme }: { value: string; theme: ThemeState }) {
  const state =
    value.toLowerCase() === "live"
      ? theme.success
      : value.toLowerCase() === "review"
        ? theme.warning
        : value.toLowerCase() === "testing"
          ? theme.accent
          : theme.mutedTextColor;

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        background: toRgba(state, 0.14),
        color: toRgba(state, 0.96),
        border: `1px solid ${toRgba(state, 0.24)}`,
      }}
    >
      {value}
    </span>
  );
}

function TableWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const rows = widget.data.tableRows?.length ? widget.data.tableRows : [];

  return (
    <div className="overflow-hidden rounded-2xl" style={miniPanelStyle(theme, widget.style)}>
      <div
        className="grid grid-cols-[1.4fr_auto_auto] gap-3 border-b px-4 py-3 text-xs uppercase tracking-[0.22em]"
        style={{ borderColor: toRgba(theme.cardBorderColor, 0.16), color: toRgba(theme.textColor, 0.56) }}
      >
        <span>Item</span>
        <span>Status</span>
        <span>Value</span>
      </div>
      <div className="divide-y" style={{ borderColor: toRgba(theme.cardBorderColor, 0.12) }}>
        {rows.map((row: TableRow) => (
          <div key={`${row.name}-${row.status}`} className="grid grid-cols-[1.4fr_auto_auto] gap-3 px-4 py-3 text-sm">
            <span>{row.name}</span>
            <StatusPill value={row.status} theme={theme} />
            <span style={{ color: toRgba(theme.textColor, 0.72) }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  const labels = widget.data.galleryLabels?.length ? widget.data.galleryLabels : ["Primary", "Secondary", "Tertiary"];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {labels.map((label, index) => (
        <div key={label} className="overflow-hidden rounded-2xl" style={miniPanelStyle(theme, widget.style)}>
          <div
            className="h-28"
            style={{
              background: widget.data.imageUrl
                ? `linear-gradient(180deg, ${toRgba(theme.background, 0.1)}, ${toRgba(theme.background, 0.35)}), url(${widget.data.imageUrl}) center / cover no-repeat`
                : `linear-gradient(135deg, ${toRgba(theme.accent, 0.32)}, ${toRgba(theme.glowColor, 0.18)})`,
            }}
          />
          <div className="px-4 py-3 text-sm">
            <div className="font-medium">{label}</div>
            <div className="mt-1 text-xs" style={{ color: toRgba(theme.textColor, 0.64) }}>
              Surface {index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl p-5 text-lg leading-8" style={miniPanelStyle(theme, widget.style)}>
        “{widget.data.quote}”
      </div>
      <div className="flex items-center gap-3">
        <div
          className="size-12 rounded-2xl"
          style={{
            background: widget.data.imageUrl
              ? `url(${widget.data.imageUrl}) center / cover no-repeat`
              : `linear-gradient(135deg, ${toRgba(theme.accent, 0.5)}, ${toRgba(theme.glowColor, 0.18)})`,
          }}
        />
        <div>
          <div className="font-medium">{widget.data.person}</div>
          <div className="text-sm" style={{ color: toRgba(theme.textColor, 0.64) }}>
            {widget.data.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileWidget({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <div
          className="size-16 rounded-[22px]"
          style={{
            background: widget.data.imageUrl
              ? `url(${widget.data.imageUrl}) center / cover no-repeat`
              : `linear-gradient(135deg, ${toRgba(theme.accent, 0.5)}, ${toRgba(theme.glowColor, 0.18)})`,
            boxShadow: `0 0 32px ${toRgba(widget.style.glowColor ?? theme.glowColor, 0.16)}`,
          }}
        />
        <div className="min-w-0">
          <div className="text-lg font-semibold">{widget.data.person}</div>
          <div className="text-sm" style={{ color: toRgba(theme.textColor, 0.64) }}>
            {widget.data.role}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[widget.data.statA, widget.data.statB, widget.data.statC].map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-2xl p-3 text-center" style={miniPanelStyle(theme, widget.style)}>
            <div className="text-sm font-medium">{item}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: toRgba(theme.textColor, 0.58) }}>
              Metric {index + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {widget.data.tags.map((tag) => (
          <span key={tag} className="rounded-full px-3 py-2 text-xs" style={chipStyle(theme, false)}>
            {tag}
          </span>
        ))}
      </div>

      <button type="button" className="px-4 py-2 text-sm font-medium" style={buttonStyle(theme, true, widget.style.buttonStyleMode)}>
        {widget.data.ctaLabel || "View profile"}
      </button>
    </div>
  );
}

function WidgetPreview({ widget, theme }: { widget: Widget; theme: ThemeState }) {
  switch (widget.kind) {
    case "hero":
      return <HeroWidget widget={widget} theme={theme} />;
    case "stats":
      return <StatsWidget widget={widget} theme={theme} />;
    case "chart":
      return <ChartWidget widget={widget} theme={theme} />;
    case "activity":
      return <ActivityWidget widget={widget} theme={theme} />;
    case "notes":
      return <NotesWidget widget={widget} theme={theme} />;
    case "table":
      return <TableWidget widget={widget} theme={theme} />;
    case "gallery":
      return <GalleryWidget widget={widget} theme={theme} />;
    case "testimonial":
      return <TestimonialWidget widget={widget} theme={theme} />;
    case "profile":
      return <ProfileWidget widget={widget} theme={theme} />;
    default:
      return null;
  }
}

export function WidgetCard({
  widget,
  theme,
  previewMode,
  columnCount,
  designMode,
  canvasState,
  selected,
  selectionCount,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleLock,
  onToggleHidden,
}: WidgetCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !designMode || widget.locked,
  });

  const resolved = resolveSurface(theme, widget.style);
  const pointerStyle = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      gridColumn: `span ${Math.max(Math.min(widget.span, columnCount), 1)} / span ${Math.max(Math.min(widget.span, columnCount), 1)}`,
      opacity: widget.hidden ? 0.58 : 1,
      filter: isDragging ? "saturate(1.05)" : undefined,
      zIndex: isDragging ? 30 : selected ? 10 : 1,
    }),
    [columnCount, isDragging, selected, transform, transition, widget.hidden, widget.span],
  );

  const accent = resolved.accent;
  const muted = toRgba(theme.textColor, 0.62);
  const additiveHint = selectionCount > 1 ? "multi" : "select";
  const minHeight = widget.kind === "hero" ? 280 : widget.kind === "gallery" ? 280 : previewMode === "mobile" ? 210 : 220;

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    onSelect(widget.id, event.metaKey || event.ctrlKey || event.shiftKey);
  };

  return (
    <motion.article
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: isDragging ? 1.01 : 1 }}
      transition={{
        type: "spring",
        stiffness: theme.reduceMotion ? 200 : theme.springStiffness,
        damping: theme.reduceMotion ? 30 : theme.springDamping,
        duration: 0.26 / Math.max(theme.motionSpeed, 0.2),
      }}
      whileHover={
        theme.reduceMotion
          ? undefined
          : {
              y: designMode ? -theme.hoverLift / 2 : 0,
              scale: selected ? theme.hoverScale : 1.003,
            }
      }
      whileTap={designMode && !widget.locked ? { scale: 0.995 } : undefined}
      style={{
        ...surfaceStyle(theme, selected, widget.style),
        ...pointerStyle,
        minHeight,
        cursor: designMode && !widget.locked ? "grab" : "default",
      }}
      className="group"
      onPointerDown={handlePointerDown}
      {...attributes}
      {...listeners}
      tabIndex={0}
      aria-label={widget.title}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${toRgba(accent, selected ? 0.95 : theme.borderShine / 120)}, transparent)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: selected
            ? `radial-gradient(circle at top right, ${toRgba(accent, 0.1)} 0%, transparent 26%)`
            : undefined,
        }}
      />

      <div className="flex items-start justify-between gap-4" style={{ padding: theme.paddingDesktop }}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{widget.icon}</span>
            <span className="text-[11px] uppercase tracking-[0.24em]" style={{ color: muted }}>
              {widget.kind}
            </span>
            {widget.locked ? (
              <span className="rounded-full px-2 py-1 text-[10px]" style={chipStyle(theme, false)}>
                locked
              </span>
            ) : null}
            {!widget.visibility.mobile ? (
              <span className="rounded-full px-2 py-1 text-[10px]" style={chipStyle(theme, false)}>
                desktop-only
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-xl font-semibold leading-tight">{widget.title}</div>
          <div className="mt-2 text-sm" style={{ color: toRgba(theme.textColor, 0.68) }}>
            {widget.data.subtitle}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs" style={{ color: muted }}>
          {designMode ? (
            <>
              <span className="hidden lg:inline">{additiveHint}</span>
              <span className="rounded-full px-2 py-1" style={miniPanelStyle(theme, widget.style)}>
                ⋮⋮
              </span>
            </>
          ) : (
            <span className="rounded-full px-2 py-1" style={miniPanelStyle(theme, widget.style)}>
              live
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: `0 ${theme.paddingDesktop}px ${theme.paddingDesktop}px` }}>
        {widget.collapsed ? (
          <div className="rounded-2xl p-4 text-sm" style={miniPanelStyle(theme, widget.style)}>
            Collapsed widget preview
          </div>
        ) : canvasState === "live" ? (
          <WidgetPreview widget={widget} theme={theme} />
        ) : (
          <PlaceholderState state={canvasState} theme={theme} />
        )}
      </div>

      {designMode ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-end opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <button
              type="button"
              className="px-2.5 py-1.5 text-[11px]"
              style={buttonStyle(theme, false, "outline")}
              onClick={(event) => {
                event.stopPropagation();
                onToggleLock(widget.id);
              }}
            >
              {widget.locked ? "Unlock" : "Lock"}
            </button>
            <button
              type="button"
              className="px-2.5 py-1.5 text-[11px]"
              style={buttonStyle(theme, false, "outline")}
              onClick={(event) => {
                event.stopPropagation();
                onToggleHidden(widget.id);
              }}
            >
              {widget.hidden ? "Show" : "Hide"}
            </button>
            <button
              type="button"
              className="px-2.5 py-1.5 text-[11px]"
              style={buttonStyle(theme, false, "glass")}
              onClick={(event) => {
                event.stopPropagation();
                onDuplicate(widget.id);
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="px-2.5 py-1.5 text-[11px]"
              style={buttonStyle(theme, false, "outline")}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(widget.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </motion.article>
  );
}
