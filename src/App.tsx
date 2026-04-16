
import type { ChangeEvent, CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { WidgetCard } from "./WidgetCard";
import { useDesignState } from "./useDesignState";
import {
  buttonStyle,
  chipStyle,
  contrastRatio,
  dotsOverlayStyle,
  generatePaletteFromBase,
  getPreviewMetrics,
  gridOverlayStyle,
  hexToHsl,
  hexToRgb,
  inputShellStyle,
  miniPanelStyle,
  noiseOverlayStyle,
  normalizeHex,
  pageStyle,
  panelStyle,
  toRgba,
  vignetteOverlayStyle,
} from "./theme";
import type { PreviewMode, ThemeState } from "./theme";
import { ICON_OPTIONS, WIDGET_TEMPLATES } from "./widgetLibrary";
import type { ButtonStyleName, CardStyleName, ChartSkin, Widget } from "./widgetLibrary";

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SectionBlock({
  title,
  description,
  children,
  style,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section className="space-y-4 rounded-[26px] p-4" style={style}>
      <div>
        <div className="text-lg font-semibold">{title}</div>
        {description ? (
          <div className="mt-1 text-sm leading-6 opacity-75">{description}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
  theme,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeState;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="px-3 py-2 text-sm"
          style={buttonStyle(theme, option.value === value)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
  theme,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
  theme: ThemeState;
}) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span>{label}</span>
        <span style={{ color: toRgba(theme.textColor, 0.62) }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-current"
        style={{ color: theme.accent }}
      />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  theme,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme: ThemeState;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3" style={inputShellStyle(theme)}>
      <span className="text-sm">{label}</span>
      <button
        type="button"
        className="relative h-7 w-12 rounded-full transition"
        style={{ background: checked ? theme.accent : toRgba(theme.textColor, 0.16) }}
        onClick={() => onChange(!checked)}
      >
        <span
          className="absolute top-1 size-5 rounded-full bg-white transition"
          style={{ left: checked ? "1.5rem" : "0.25rem" }}
        />
      </button>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  theme,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeState;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl px-3 outline-none"
        style={inputShellStyle(theme)}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  theme,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeState;
  rows?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="rounded-xl px-3 py-3 outline-none"
        style={inputShellStyle(theme)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  theme,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  theme: ThemeState;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl px-3 outline-none"
        style={inputShellStyle(theme)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: "#111827" }}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconPicker({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  theme: ThemeState;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-sm">Icon</span>
      <div className="flex flex-wrap gap-2">
        {ICON_OPTIONS.map((icon) => (
          <button
            key={icon}
            type="button"
            className="grid size-11 place-items-center rounded-2xl text-lg"
            style={buttonStyle(theme, icon === value, icon === value ? "glass" : "outline")}
            onClick={() => onChange(icon)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  theme,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: ThemeState;
}) {
  const safeValue = normalizeHex(value);
  const rgb = hexToRgb(safeValue);
  const hsl = hexToHsl(safeValue);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{label}</span>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: toRgba(theme.textColor, 0.56) }}>
          HSL {hsl.h} {hsl.s}% {hsl.l}%
        </span>
      </div>
      <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
        <input
          type="color"
          value={safeValue}
          onChange={handleInput}
          className="h-11 w-full cursor-pointer rounded-xl border-0 bg-transparent p-0"
          title={label}
        />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          className="h-11 rounded-xl px-3 outline-none"
          style={inputShellStyle(theme)}
          placeholder="#8b5cf6"
        />
      </div>
      <div className="text-xs" style={{ color: toRgba(theme.textColor, 0.56) }}>
        RGB {rgb.r}, {rgb.g}, {rgb.b}
      </div>
    </label>
  );
}

function ContrastPill({
  label,
  ratio,
  theme,
}: {
  label: string;
  ratio: number;
  theme: ThemeState;
}) {
  const tone = ratio >= 4.5 ? theme.success : ratio >= 3 ? theme.warning : theme.danger;

  return (
    <div className="rounded-2xl px-3 py-3 text-sm" style={{ ...miniPanelStyle(theme), borderColor: toRgba(tone, 0.32) }}>
      <div className="font-medium">{label}</div>
      <div className="mt-1" style={{ color: toRgba(tone, 0.95) }}>
        {ratio.toFixed(2)}:1
      </div>
    </div>
  );
}

function EmptySelection({ theme }: { theme: ThemeState }) {
  return (
    <div className="rounded-[26px] p-4" style={miniPanelStyle(theme)}>
      <div className="text-lg font-semibold">Nothing selected</div>
      <p className="mt-2 text-sm leading-6" style={{ color: toRgba(theme.textColor, 0.68) }}>
        Select a widget on the canvas or in the layers panel to edit its content, style overrides,
        visibility rules, and component-level options.
      </p>
    </div>
  );
}

function PresetCard({
  title,
  subtitle,
  theme,
  onApply,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  theme: ThemeState;
  onApply: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="rounded-2xl p-3" style={miniPanelStyle(theme)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs leading-5" style={{ color: toRgba(theme.textColor, 0.62) }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            className="px-2 py-1 text-[11px]"
            style={buttonStyle(theme, false, "outline")}
            onClick={onDelete}
          >
            Delete
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="mt-3 px-3 py-2 text-sm"
        style={buttonStyle(theme, false)}
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  );
}

export default function App() {
  const {
    widgets,
    theme,
    designMode,
    previewMode,
    selectedIds,
    leftTab,
    inspectorTab,
    commandPaletteOpen,
    canvasState,
    primarySelectedWidget,
    selectedWidgets,
    savedThemePresets,
    savedLayoutPresets,
    commandHistory,
    canUndo,
    canRedo,
    defaultThemePresets,
    setDesignMode,
    setPreviewMode,
    setLeftTab,
    setInspectorTab,
    setCommandPaletteOpen,
    setCanvasState,
    selectWidget,
    selectAllWidgets,
    clearSelection,
    updateTheme,
    applyThemePatch,
    applyThemePreset,
    generatePalette,
    randomizeTheme,
    resetTheme,
    reorderWidgets,
    addWidget,
    duplicateWidget,
    duplicateSelected,
    deleteWidget,
    deleteSelected,
    resetLayout,
    updateWidget,
    updateSelectedWidgetData,
    updateSelectedWidgetStyle,
    setSelectedSpan,
    toggleWidgetFlag,
    toggleSelectedFlag,
    setSelectedVisibility,
    copySelectedStyle,
    pasteSelectedStyle,
    saveThemePreset,
    deleteThemePreset,
    saveLayoutPreset,
    applyLayoutPreset,
    deleteLayoutPreset,
    exportStateJSON,
    importStateJSON,
    runLocalCommand,
    undo,
    redo,
  } = useDesignState();

  const [commandInput, setCommandInput] = useState("");
  const [importBuffer, setImportBuffer] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const metrics = getPreviewMetrics(theme, previewMode);
  const pageContrast = useMemo(() => contrastRatio(theme.textColor, theme.background), [theme.background, theme.textColor]);
  const cardContrast = useMemo(() => contrastRatio(theme.textColor, theme.cardColor), [theme.cardColor, theme.textColor]);

  const previewWidgets = useMemo(
    () => widgets.filter((widget) => !widget.hidden && widget.visibility[previewMode]),
    [previewMode, widgets],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeWidget = useMemo(
    () => widgets.find((widget) => widget.id === activeDragId) ?? null,
    [activeDragId, widgets],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (!isTyping && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (!isTyping && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (!isTyping && (event.key === "Delete" || event.key === "Backspace")) {
        if (selectedIds.length) {
          event.preventDefault();
          deleteSelected();
        }
      }

      if (!isTyping && event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAllWidgets();
      }

      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    deleteSelected,
    duplicateSelected,
    redo,
    selectAllWidgets,
    selectedIds.length,
    setCommandPaletteOpen,
    undo,
  ]);

  const uiPanelStyle = {
    ...panelStyle(theme),
    color: theme.textColor,
  } satisfies CSSProperties;

  const applyCommand = () => {
    if (!commandInput.trim()) return;
    const result = runLocalCommand(commandInput);
    setStatusMessage(result);
    setCommandInput("");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    if (!event.over) return;
    reorderWidgets(String(event.active.id), String(event.over.id));
  };

  const openSaveThemePrompt = () => {
    const name = window.prompt("Name this theme preset");
    if (name) saveThemePreset(name);
  };

  const openSaveLayoutPrompt = () => {
    const name = window.prompt("Name this layout preset");
    if (name) saveLayoutPreset(name);
  };

  const exportJson = () => {
    downloadTextFile("visual-builder-export.json", exportStateJSON());
    setStatusMessage("Exported the current editor state.");
  };

  const applyImport = () => {
    const result = importStateJSON(importBuffer);
    setStatusMessage(result.message);
    if (result.ok) {
      setImportBuffer("");
    }
  };

  const generateFromSeed = (seedColor: string) => {
    const patch = generatePaletteFromBase(seedColor);
    applyThemePatch(patch);
    setStatusMessage(`Generated a palette from ${seedColor}.`);
  };

  const previewFrameColumns =
    previewMode === "desktop"
      ? metrics.columns
      : previewMode === "tablet"
        ? Math.min(metrics.columns, 2)
        : 1;

  const safeAreaPadding = previewMode === "mobile" ? 18 : 0;

  return (
    <MotionConfig reducedMotion={theme.reduceMotion ? "always" : "user"}>
      <div className="min-h-screen" style={pageStyle(theme)}>
        {theme.animateBackground ? (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-32 -top-28 size-[26rem] rounded-full blur-3xl"
              animate={{ x: [0, 50, -20, 0], y: [0, 26, 10, 0], scale: [1, 1.05, 0.98, 1] }}
              transition={{ duration: 18 / Math.max(theme.motionSpeed, 0.2), repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: toRgba(theme.accent, theme.blobOpacity / 100),
                filter: `blur(${theme.blobSize}px)`,
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-24 top-24 size-[24rem] rounded-full blur-3xl"
              animate={{ x: [0, -30, 18, 0], y: [0, 40, -12, 0], scale: [1, 1.08, 0.95, 1] }}
              transition={{ duration: 22 / Math.max(theme.motionSpeed, 0.2), repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: toRgba(theme.glowColor, theme.blobOpacity / 120),
                filter: `blur(${theme.blobSize}px)`,
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-[-12rem] mx-auto h-[24rem] w-[70%] rounded-full blur-3xl"
              animate={{ y: [0, -18, 0], scaleX: [1, 1.04, 1] }}
              transition={{ duration: 20 / Math.max(theme.motionSpeed, 0.2), repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: toRgba(theme.background3, theme.blobOpacity / 160),
                filter: `blur(${theme.blobSize + 10}px)`,
              }}
            />
          </>
        ) : null}

        {theme.showGrid ? <div className="pointer-events-none absolute inset-0" style={gridOverlayStyle(theme)} /> : null}
        {theme.showDots ? <div className="pointer-events-none absolute inset-0" style={dotsOverlayStyle(theme)} /> : null}
        {theme.showNoise ? <div className="pointer-events-none absolute inset-0" style={noiseOverlayStyle(theme)} /> : null}
        {theme.vignette > 0 ? <div className="pointer-events-none absolute inset-0" style={vignetteOverlayStyle(theme)} /> : null}

        <div className="relative mx-auto grid max-w-[1700px] gap-6 px-4 py-6 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
          <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-auto">
            <div className="space-y-4 rounded-[30px] p-4" style={uiPanelStyle}>
              <div className="rounded-[26px] p-4" style={miniPanelStyle(theme)}>
                <div className="text-xs uppercase tracking-[0.3em]" style={{ color: toRgba(theme.textColor, 0.58) }}>
                  All packs starter
                </div>
                <h1 className="mt-2 text-2xl font-semibold leading-tight">Visual editor + style lab</h1>
                <p className="mt-3 text-sm leading-6" style={{ color: toRgba(theme.textColor, 0.68) }}>
                  This combines theme studio, background lab, glass/glow controls, layout building,
                  responsive preview, history, presets, content mocks, and a local command palette.
                </p>
              </div>

              <SegmentedControl
                options={[
                  { value: "library", label: "Library" },
                  { value: "layers", label: "Layers" },
                  { value: "presets", label: "Presets" },
                ]}
                value={leftTab}
                onChange={(value) => setLeftTab(value as typeof leftTab)}
                theme={theme}
              />

              {leftTab === "library" ? (
                <SectionBlock
                  title="Widget library"
                  description="Add cards, dashboards, galleries, and hero blocks. Every new widget is draggable and editable."
                  style={miniPanelStyle(theme)}
                >
                  <div className="grid gap-3">
                    {WIDGET_TEMPLATES.map((template) => (
                      <div key={template.kind} className="rounded-2xl p-3" style={miniPanelStyle(theme)}>
                        <div className="flex items-start gap-3">
                          <div className="grid size-11 place-items-center rounded-2xl text-lg" style={buttonStyle(theme, false)}>
                            {template.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{template.label}</div>
                            <div className="mt-1 text-xs leading-5" style={{ color: toRgba(theme.textColor, 0.62) }}>
                              {template.description}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mt-3 px-3 py-2 text-sm"
                          style={buttonStyle(theme, false)}
                          onClick={() => addWidget(template.kind)}
                        >
                          Add {template.label}
                        </button>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              ) : null}

              {leftTab === "layers" ? (
                <SectionBlock
                  title="Layers"
                  description="Click to select. Use Ctrl/Cmd-click on the canvas for multi-select. Hidden widgets stay here even when removed from the preview."
                  style={miniPanelStyle(theme)}
                >
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={selectAllWidgets}>
                      Select all
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={clearSelection}>
                      Clear
                    </button>
                  </div>

                  <div className="grid gap-2">
                    {widgets.map((widget) => {
                      const selected = selectedIds.includes(widget.id);
                      return (
                        <button
                          key={widget.id}
                          type="button"
                          className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left"
                          style={selected ? buttonStyle(theme, true) : miniPanelStyle(theme)}
                          onClick={(event) => selectWidget(widget.id, event.metaKey || event.ctrlKey || event.shiftKey)}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span>{widget.icon}</span>
                              <span className="font-medium">{widget.title}</span>
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em]" style={{ color: toRgba(theme.textColor, 0.56) }}>
                              {widget.kind}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full px-2 py-1 text-[10px]" style={chipStyle(theme, false)}>
                              {widget.span} col
                            </span>
                            <button
                              type="button"
                              className="px-2 py-1 text-[11px]"
                              style={buttonStyle(theme, false, "outline")}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleWidgetFlag(widget.id, "hidden");
                              }}
                            >
                              {widget.hidden ? "Show" : "Hide"}
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-[11px]"
                              style={buttonStyle(theme, false, "outline")}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleWidgetFlag(widget.id, "locked");
                              }}
                            >
                              {widget.locked ? "Unlock" : "Lock"}
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </SectionBlock>
              ) : null}

              {leftTab === "presets" ? (
                <div className="space-y-4">
                  <SectionBlock
                    title="Built-in themes"
                    description="Use these as starting points, then save your own versions."
                    style={miniPanelStyle(theme)}
                  >
                    <div className="grid gap-3">
                      {defaultThemePresets.map((preset) => (
                        <PresetCard
                          key={preset.name}
                          title={preset.name}
                          subtitle="Default preset"
                          theme={theme}
                          onApply={() => applyThemePreset(preset)}
                        />
                      ))}
                    </div>
                  </SectionBlock>

                  <SectionBlock
                    title="Saved themes"
                    description="Capture a look before you keep experimenting."
                    style={miniPanelStyle(theme)}
                  >
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={openSaveThemePrompt}>
                        Save current theme
                      </button>
                      <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={resetTheme}>
                        Reset theme
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {savedThemePresets.length ? (
                        savedThemePresets.map((preset) => (
                          <PresetCard
                            key={preset.id}
                            title={preset.name}
                            subtitle={new Date(preset.createdAt).toLocaleString()}
                            theme={theme}
                            onApply={() => applyThemePreset(preset)}
                            onDelete={() => deleteThemePreset(preset.id)}
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl p-4 text-sm" style={miniPanelStyle(theme)}>
                          No saved themes yet.
                        </div>
                      )}
                    </div>
                  </SectionBlock>

                  <SectionBlock
                    title="Saved layouts"
                    description="Preserve widget order, size, visibility, and structure separately from theme choices."
                    style={miniPanelStyle(theme)}
                  >
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={openSaveLayoutPrompt}>
                        Save current layout
                      </button>
                      <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={resetLayout}>
                        Reset layout
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {savedLayoutPresets.length ? (
                        savedLayoutPresets.map((preset) => (
                          <PresetCard
                            key={preset.id}
                            title={preset.name}
                            subtitle={new Date(preset.createdAt).toLocaleString()}
                            theme={theme}
                            onApply={() => applyLayoutPreset(preset.id)}
                            onDelete={() => deleteLayoutPreset(preset.id)}
                          />
                        ))
                      ) : (
                        <div className="rounded-2xl p-4 text-sm" style={miniPanelStyle(theme)}>
                          No saved layouts yet.
                        </div>
                      )}
                    </div>
                  </SectionBlock>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="space-y-4 rounded-[30px] p-4" style={uiPanelStyle}>
              <header className="rounded-[28px] p-5" style={miniPanelStyle(theme)}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div>
                    <div className="text-xs uppercase tracking-[0.32em]" style={{ color: toRgba(theme.textColor, 0.58) }}>
                      Preview workspace
                    </div>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight">Drag, style, test, save.</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: toRgba(theme.textColor, 0.72) }}>
                      You can judge layout, backgrounds, glass, glow, typography, mobile stacking, empty/loading/error states,
                      and local command-driven visual changes without adding backend code yet.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-4 py-3 text-sm" style={buttonStyle(theme, designMode)} onClick={() => setDesignMode(!designMode)}>
                      {designMode ? "Design mode on" : "Design mode off"}
                    </button>
                    <button type="button" className="px-4 py-3 text-sm" style={buttonStyle(theme, false)} onClick={undo} disabled={!canUndo}>
                      Undo
                    </button>
                    <button type="button" className="px-4 py-3 text-sm" style={buttonStyle(theme, false)} onClick={redo} disabled={!canRedo}>
                      Redo
                    </button>
                    <button type="button" className="px-4 py-3 text-sm" style={buttonStyle(theme, false)} onClick={() => setCommandPaletteOpen(true)}>
                      Command palette
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <SegmentedControl
                    options={[
                      { value: "desktop", label: "Desktop" },
                      { value: "tablet", label: "Tablet" },
                      { value: "mobile", label: "Mobile" },
                    ]}
                    value={previewMode}
                    onChange={(value) => setPreviewMode(value as PreviewMode)}
                    theme={theme}
                  />

                  <SegmentedControl
                    options={[
                      { value: "live", label: "Live" },
                      { value: "loading", label: "Loading" },
                      { value: "empty", label: "Empty" },
                      { value: "error", label: "Error" },
                    ]}
                    value={canvasState}
                    onChange={(value) => setCanvasState(value as typeof canvasState)}
                    theme={theme}
                  />

                  <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={randomizeTheme}>
                    Randomize
                  </button>
                  <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={exportJson}>
                    Export JSON
                  </button>
                </div>

                {statusMessage ? (
                  <div className="mt-4 rounded-2xl px-3 py-3 text-sm" style={miniPanelStyle(theme)}>
                    {statusMessage}
                  </div>
                ) : null}
              </header>

              <motion.div
                layout
                className="mx-auto overflow-hidden rounded-[36px]"
                style={{
                  ...panelStyle(theme),
                  width: "100%",
                  maxWidth: metrics.width,
                  backdropFilter: `blur(${theme.glassBlur + theme.backgroundBlur}px) saturate(${theme.glassSaturation}%)`,
                  WebkitBackdropFilter: `blur(${theme.glassBlur + theme.backgroundBlur}px) saturate(${theme.glassSaturation}%)`,
                }}
              >
                <div
                  className="grid min-h-[780px]"
                  style={{
                    gridTemplateColumns:
                      previewMode !== "mobile" && theme.sidebarMode !== "hidden"
                        ? `${theme.sidebarMode === "wide" ? 220 : 92}px minmax(0,1fr)`
                        : "1fr",
                  }}
                >
                  {previewMode !== "mobile" && theme.sidebarMode !== "hidden" ? (
                    <aside
                      className="border-r p-4"
                      style={{
                        borderColor: toRgba(theme.cardBorderColor, 0.16),
                        background: toRgba(theme.cardColor, 0.08),
                      }}
                    >
                      <div className="rounded-2xl p-4" style={miniPanelStyle(theme)}>
                        <div className="flex items-center gap-3">
                          <div className="grid size-11 place-items-center rounded-2xl text-lg" style={buttonStyle(theme, true)}>
                            🪩
                          </div>
                          {theme.sidebarMode === "wide" ? (
                            <div>
                              <div className="font-semibold">Visual Lab</div>
                              <div className="text-xs" style={{ color: toRgba(theme.textColor, 0.62) }}>
                                Builder shell
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {["Overview", "Styles", "Presets", "Data", "History"].map((item, index) => (
                          <button
                            key={item}
                            type="button"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left"
                            style={index === 0 ? buttonStyle(theme, true) : buttonStyle(theme, false, "outline")}
                          >
                            <span>{["🏠", "🎨", "💾", "🧾", "⏱️"][index]}</span>
                            {theme.sidebarMode === "wide" ? <span>{item}</span> : null}
                          </button>
                        ))}
                      </div>
                    </aside>
                  ) : null}

                  <div className="min-w-0">
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4"
                      style={{ borderColor: toRgba(theme.cardBorderColor, 0.16), paddingTop: 16 + safeAreaPadding }}
                    >
                      <div className="flex items-center gap-3">
                        {previewMode === "mobile" ? (
                          <span className="rounded-full px-3 py-1 text-xs" style={chipStyle(theme, false)}>
                            safe area
                          </span>
                        ) : null}
                        <div className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]" style={chipStyle(theme, false)}>
                          {previewMode}
                        </div>
                        <div className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]" style={chipStyle(theme, false)}>
                          {previewFrameColumns} cols
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-9 min-w-[210px] rounded-full px-4 text-sm leading-9" style={inputShellStyle(theme)}>
                          Search or ask AI to restyle…
                        </div>
                        <button type="button" className="size-9 rounded-full text-sm" style={buttonStyle(theme, false)}>
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-4 md:p-5" style={{ padding: metrics.padding }}>
                      {previewWidgets.length ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext items={previewWidgets.map((widget) => widget.id)} strategy={rectSortingStrategy}>
                            <div
                              className="grid auto-rows-[minmax(220px,auto)]"
                              style={{
                                gap: metrics.gap,
                                gridTemplateColumns: `repeat(${previewFrameColumns}, minmax(0,1fr))`,
                              }}
                            >
                              {previewWidgets.map((widget) => (
                                <WidgetCard
                                  key={widget.id}
                                  widget={widget}
                                  theme={theme}
                                  previewMode={previewMode}
                                  columnCount={previewFrameColumns}
                                  designMode={designMode}
                                  canvasState={canvasState}
                                  selected={selectedIds.includes(widget.id)}
                                  selectionCount={selectedIds.length}
                                  onSelect={selectWidget}
                                  onDuplicate={duplicateWidget}
                                  onDelete={deleteWidget}
                                  onToggleLock={(id) => toggleWidgetFlag(id, "locked")}
                                  onToggleHidden={(id) => toggleWidgetFlag(id, "hidden")}
                                />
                              ))}
                            </div>
                          </SortableContext>

                          <DragOverlay>
                            {activeWidget ? (
                              <div
                                style={{
                                  width: 340,
                                  ...panelStyle(theme),
                                  opacity: 0.96,
                                  borderRadius: theme.radius,
                                  padding: 16,
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{activeWidget.icon}</span>
                                  <span className="font-medium">{activeWidget.title}</span>
                                </div>
                                <div className="mt-2 text-sm" style={{ color: toRgba(theme.textColor, 0.64) }}>
                                  Dragging {activeWidget.kind}
                                </div>
                              </div>
                            ) : null}
                          </DragOverlay>
                        </DndContext>
                      ) : (
                        <div className="rounded-[30px] p-6 text-center" style={miniPanelStyle(theme)}>
                          <div className="text-lg font-semibold">Nothing is visible in this breakpoint</div>
                          <div className="mt-2 text-sm" style={{ color: toRgba(theme.textColor, 0.68) }}>
                            Unhide a widget or switch visibility back on for {previewMode}.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>

          <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-auto">
            <div className="space-y-4 rounded-[30px] p-4" style={uiPanelStyle}>
              <SegmentedControl
                options={[
                  { value: "selection", label: "Selection" },
                  { value: "theme", label: "Theme" },
                  { value: "background", label: "Background" },
                  { value: "effects", label: "Effects" },
                  { value: "animation", label: "Motion" },
                  { value: "responsive", label: "Responsive" },
                  { value: "data", label: "Data" },
                  { value: "history", label: "History" },
                  { value: "a11y", label: "A11y" },
                  { value: "commands", label: "Commands" },
                ]}
                value={inspectorTab}
                onChange={(value) => setInspectorTab(value as typeof inspectorTab)}
                theme={theme}
              />

              {inspectorTab === "selection" ? (
                primarySelectedWidget ? (
                  <div className="space-y-4">
                    <SectionBlock
                      title={selectedIds.length > 1 ? `${selectedIds.length} widgets selected` : "Selected widget"}
                      description="Edit the selected card, or apply a style override to multiple selected widgets at once."
                      style={miniPanelStyle(theme)}
                    >
                      <TextField
                        label="Title"
                        value={primarySelectedWidget.title}
                        onChange={(value) => updateWidget(primarySelectedWidget.id, { title: value })}
                        theme={theme}
                      />
                      <TextField
                        label="Subtitle"
                        value={primarySelectedWidget.data.subtitle}
                        onChange={(value) => updateSelectedWidgetData("subtitle", value)}
                        theme={theme}
                      />
                      <IconPicker
                        value={primarySelectedWidget.icon}
                        onChange={(value) => updateWidget(primarySelectedWidget.id, { icon: value })}
                        theme={theme}
                      />
                      <SegmentedControl
                        options={[
                          { value: "1", label: "Small" },
                          { value: "2", label: "Medium" },
                          { value: "3", label: "Wide" },
                          { value: "4", label: "Full" },
                        ]}
                        value={String(primarySelectedWidget.span)}
                        onChange={(value) => setSelectedSpan(Number(value))}
                        theme={theme}
                      />
                      <SelectField
                        label="Card style"
                        value={primarySelectedWidget.style.cardStyle ?? theme.cardStyle}
                        onChange={(value) => updateSelectedWidgetStyle("cardStyle", value as CardStyleName)}
                        options={[
                          { value: "glass", label: "Glass" },
                          { value: "clean", label: "Clean" },
                          { value: "bordered", label: "Bordered" },
                          { value: "floating", label: "Floating" },
                          { value: "neon", label: "Neon" },
                          { value: "matte", label: "Matte" },
                          { value: "glossy", label: "Glossy" },
                        ]}
                        theme={theme}
                      />
                      <SelectField
                        label="Button style"
                        value={primarySelectedWidget.style.buttonStyleMode ?? theme.buttonStyleMode}
                        onChange={(value) => updateSelectedWidgetStyle("buttonStyleMode", value as ButtonStyleName)}
                        options={[
                          { value: "soft", label: "Soft" },
                          { value: "glass", label: "Glass" },
                          { value: "pill", label: "Pill" },
                          { value: "outline", label: "Outline" },
                          { value: "neon", label: "Neon" },
                        ]}
                        theme={theme}
                      />
                      <SelectField
                        label="Chart skin"
                        value={primarySelectedWidget.style.chartSkin ?? theme.chartSkin}
                        onChange={(value) => updateSelectedWidgetStyle("chartSkin", value as ChartSkin)}
                        options={[
                          { value: "bars", label: "Bars" },
                          { value: "line", label: "Line" },
                          { value: "area", label: "Area" },
                        ]}
                        theme={theme}
                      />
                      <ColorField
                        label="Accent override"
                        value={primarySelectedWidget.style.accent ?? theme.accent}
                        onChange={(value) => updateSelectedWidgetStyle("accent", value)}
                        theme={theme}
                      />
                      <ColorField
                        label="Glow override"
                        value={primarySelectedWidget.style.glowColor ?? theme.glowColor}
                        onChange={(value) => updateSelectedWidgetStyle("glowColor", value)}
                        theme={theme}
                      />
                      <RangeField
                        label="Opacity boost"
                        value={primarySelectedWidget.style.opacityBoost ?? 0}
                        min={-30}
                        max={40}
                        suffix="%"
                        onChange={(value) => updateSelectedWidgetStyle("opacityBoost", value)}
                        theme={theme}
                      />
                      <RangeField
                        label="Glow boost"
                        value={primarySelectedWidget.style.glowBoost ?? 0}
                        min={-30}
                        max={50}
                        suffix="%"
                        onChange={(value) => updateSelectedWidgetStyle("glowBoost", value)}
                        theme={theme}
                      />
                      <RangeField
                        label="Shadow boost"
                        value={primarySelectedWidget.style.shadowBoost ?? 0}
                        min={-30}
                        max={40}
                        suffix="%"
                        onChange={(value) => updateSelectedWidgetStyle("shadowBoost", value)}
                        theme={theme}
                      />
                      <ToggleField
                        label="Collapsed"
                        checked={primarySelectedWidget.collapsed}
                        onChange={(value) => toggleSelectedFlag("collapsed", value)}
                        theme={theme}
                      />
                      <ToggleField
                        label="Locked"
                        checked={primarySelectedWidget.locked}
                        onChange={(value) => toggleSelectedFlag("locked", value)}
                        theme={theme}
                      />
                      <ToggleField
                        label="Hidden"
                        checked={primarySelectedWidget.hidden}
                        onChange={(value) => toggleSelectedFlag("hidden", value)}
                        theme={theme}
                      />
                      <div className="grid gap-2 md:grid-cols-3">
                        <ToggleField
                          label="Desktop"
                          checked={primarySelectedWidget.visibility.desktop}
                          onChange={(value) => setSelectedVisibility("desktop", value)}
                          theme={theme}
                        />
                        <ToggleField
                          label="Tablet"
                          checked={primarySelectedWidget.visibility.tablet}
                          onChange={(value) => setSelectedVisibility("tablet", value)}
                          theme={theme}
                        />
                        <ToggleField
                          label="Mobile"
                          checked={primarySelectedWidget.visibility.mobile}
                          onChange={(value) => setSelectedVisibility("mobile", value)}
                          theme={theme}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={copySelectedStyle}>
                          Copy styles
                        </button>
                        <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={pasteSelectedStyle}>
                          Paste styles
                        </button>
                        <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={duplicateSelected}>
                          Duplicate selected
                        </button>
                        <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={deleteSelected}>
                          Delete selected
                        </button>
                      </div>
                    </SectionBlock>
                  </div>
                ) : (
                  <EmptySelection theme={theme} />
                )
              ) : null}

              {inspectorTab === "theme" ? (
                <SectionBlock
                  title="Theme studio"
                  description="Direct control over your full palette, typography, component style presets, and generated color systems."
                  style={miniPanelStyle(theme)}
                >
                  <ColorField label="Accent" value={theme.accent} onChange={(value) => updateTheme("accent", value)} theme={theme} />
                  <ColorField label="Success" value={theme.success} onChange={(value) => updateTheme("success", value)} theme={theme} />
                  <ColorField label="Warning" value={theme.warning} onChange={(value) => updateTheme("warning", value)} theme={theme} />
                  <ColorField label="Danger" value={theme.danger} onChange={(value) => updateTheme("danger", value)} theme={theme} />
                  <ColorField label="Text" value={theme.textColor} onChange={(value) => updateTheme("textColor", value)} theme={theme} />
                  <ColorField label="Muted text" value={theme.mutedTextColor} onChange={(value) => updateTheme("mutedTextColor", value)} theme={theme} />
                  <ColorField label="Panel" value={theme.panelColor} onChange={(value) => updateTheme("panelColor", value)} theme={theme} />
                  <ColorField label="Card" value={theme.cardColor} onChange={(value) => updateTheme("cardColor", value)} theme={theme} />
                  <ColorField
                    label="Card border"
                    value={theme.cardBorderColor}
                    onChange={(value) => updateTheme("cardBorderColor", value)}
                    theme={theme}
                  />
                  <ColorField label="Glow" value={theme.glowColor} onChange={(value) => updateTheme("glowColor", value)} theme={theme} />

                  <TextField
                    label="Palette seed"
                    value={theme.accent}
                    onChange={(value) => generateFromSeed(value)}
                    theme={theme}
                    placeholder="#8b5cf6"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm"
                      style={buttonStyle(theme, false)}
                      onClick={() => generatePalette(theme.accent)}
                    >
                      Generate from accent
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={randomizeTheme}>
                      Randomize palette
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={openSaveThemePrompt}>
                      Save theme preset
                    </button>
                  </div>

                  <SelectField
                    label="Global card style"
                    value={theme.cardStyle}
                    onChange={(value) => updateTheme("cardStyle", value as CardStyleName)}
                    options={[
                      { value: "glass", label: "Glass" },
                      { value: "clean", label: "Clean" },
                      { value: "bordered", label: "Bordered" },
                      { value: "floating", label: "Floating" },
                      { value: "neon", label: "Neon" },
                      { value: "matte", label: "Matte" },
                      { value: "glossy", label: "Glossy" },
                    ]}
                    theme={theme}
                  />
                  <SelectField
                    label="Global button style"
                    value={theme.buttonStyleMode}
                    onChange={(value) => updateTheme("buttonStyleMode", value as ButtonStyleName)}
                    options={[
                      { value: "soft", label: "Soft" },
                      { value: "glass", label: "Glass" },
                      { value: "pill", label: "Pill" },
                      { value: "outline", label: "Outline" },
                      { value: "neon", label: "Neon" },
                    ]}
                    theme={theme}
                  />
                  <RangeField label="Font scale" value={theme.fontScale} min={90} max={124} suffix="%" onChange={(value) => updateTheme("fontScale", value)} theme={theme} />
                  <RangeField label="Letter spacing" value={theme.letterSpacing} min={-1} max={4} step={0.1} suffix="px" onChange={(value) => updateTheme("letterSpacing", value)} theme={theme} />
                  <RangeField label="Line height" value={theme.lineHeight} min={1.1} max={1.9} step={0.05} onChange={(value) => updateTheme("lineHeight", value)} theme={theme} />
                </SectionBlock>
              ) : null}

              {inspectorTab === "background" ? (
                <SectionBlock
                  title="Background lab"
                  description="Switch between flat, gradient, radial, mesh, and image-driven backgrounds, then layer overlays and ambient motion."
                  style={miniPanelStyle(theme)}
                >
                  <SelectField
                    label="Mode"
                    value={theme.backgroundMode}
                    onChange={(value) => updateTheme("backgroundMode", value as ThemeState["backgroundMode"])}
                    options={[
                      { value: "solid", label: "Solid" },
                      { value: "gradient", label: "Gradient" },
                      { value: "radial", label: "Radial" },
                      { value: "mesh", label: "Mesh" },
                      { value: "image", label: "Image" },
                    ]}
                    theme={theme}
                  />
                  <ColorField label="Background" value={theme.background} onChange={(value) => updateTheme("background", value)} theme={theme} />
                  <ColorField label="Secondary" value={theme.background2} onChange={(value) => updateTheme("background2", value)} theme={theme} />
                  <ColorField label="Tertiary" value={theme.background3} onChange={(value) => updateTheme("background3", value)} theme={theme} />
                  <TextField
                    label="Background image URL"
                    value={theme.backgroundImageUrl}
                    onChange={(value) => updateTheme("backgroundImageUrl", value)}
                    theme={theme}
                    placeholder="https://..."
                  />
                  <RangeField label="Gradient angle" value={theme.gradientAngle} min={0} max={360} suffix="°" onChange={(value) => updateTheme("gradientAngle", value)} theme={theme} />
                  <RangeField label="Ambient glow" value={theme.backgroundGlow} min={0} max={100} suffix="%" onChange={(value) => updateTheme("backgroundGlow", value)} theme={theme} />
                  <RangeField label="Blob opacity" value={theme.blobOpacity} min={0} max={100} suffix="%" onChange={(value) => updateTheme("blobOpacity", value)} theme={theme} />
                  <RangeField label="Blob blur" value={theme.blobSize} min={0} max={90} suffix="px" onChange={(value) => updateTheme("blobSize", value)} theme={theme} />
                  <RangeField label="Background blur" value={theme.backgroundBlur} min={0} max={24} suffix="px" onChange={(value) => updateTheme("backgroundBlur", value)} theme={theme} />
                  <RangeField label="Vignette" value={theme.vignette} min={0} max={80} suffix="%" onChange={(value) => updateTheme("vignette", value)} theme={theme} />
                  <ToggleField label="Animated background" checked={theme.animateBackground} onChange={(value) => updateTheme("animateBackground", value)} theme={theme} />
                  <ToggleField label="Grid overlay" checked={theme.showGrid} onChange={(value) => updateTheme("showGrid", value)} theme={theme} />
                  <ToggleField label="Dots overlay" checked={theme.showDots} onChange={(value) => updateTheme("showDots", value)} theme={theme} />
                  <ToggleField label="Noise overlay" checked={theme.showNoise} onChange={(value) => updateTheme("showNoise", value)} theme={theme} />
                  <RangeField label="Noise opacity" value={theme.noiseOpacity} min={0} max={40} suffix="%" onChange={(value) => updateTheme("noiseOpacity", value)} theme={theme} />
                </SectionBlock>
              ) : null}

              {inspectorTab === "effects" ? (
                <SectionBlock
                  title="Glass + glow"
                  description="Fine-tune opacity, blur, saturation, brightness, contrast, borders, gloss, and glow so the surface feels premium."
                  style={miniPanelStyle(theme)}
                >
                  <RangeField label="Card opacity" value={theme.cardOpacity} min={0} max={100} suffix="%" onChange={(value) => updateTheme("cardOpacity", value)} theme={theme} />
                  <RangeField label="Panel opacity" value={theme.panelOpacity} min={0} max={100} suffix="%" onChange={(value) => updateTheme("panelOpacity", value)} theme={theme} />
                  <RangeField label="Border opacity" value={theme.borderOpacity} min={0} max={100} suffix="%" onChange={(value) => updateTheme("borderOpacity", value)} theme={theme} />
                  <RangeField label="Glass blur" value={theme.glassBlur} min={0} max={60} suffix="px" onChange={(value) => updateTheme("glassBlur", value)} theme={theme} />
                  <RangeField label="Glass saturation" value={theme.glassSaturation} min={60} max={220} suffix="%" onChange={(value) => updateTheme("glassSaturation", value)} theme={theme} />
                  <RangeField label="Glass contrast" value={theme.glassContrast} min={80} max={160} suffix="%" onChange={(value) => updateTheme("glassContrast", value)} theme={theme} />
                  <RangeField label="Glass brightness" value={theme.glassBrightness} min={80} max={140} suffix="%" onChange={(value) => updateTheme("glassBrightness", value)} theme={theme} />
                  <RangeField label="Glow intensity" value={theme.glowIntensity} min={0} max={100} suffix="%" onChange={(value) => updateTheme("glowIntensity", value)} theme={theme} />
                  <RangeField label="Glow blur" value={theme.glowBlur} min={0} max={120} suffix="px" onChange={(value) => updateTheme("glowBlur", value)} theme={theme} />
                  <RangeField label="Inner glow" value={theme.innerGlow} min={0} max={100} suffix="%" onChange={(value) => updateTheme("innerGlow", value)} theme={theme} />
                  <RangeField label="Border shine" value={theme.borderShine} min={0} max={100} suffix="%" onChange={(value) => updateTheme("borderShine", value)} theme={theme} />
                  <RangeField label="Shadow depth" value={theme.shadowDepth} min={0} max={80} suffix="%" onChange={(value) => updateTheme("shadowDepth", value)} theme={theme} />
                  <RangeField label="Radius" value={theme.radius} min={10} max={38} suffix="px" onChange={(value) => updateTheme("radius", value)} theme={theme} />
                </SectionBlock>
              ) : null}

              {inspectorTab === "animation" ? (
                <SectionBlock
                  title="Animation studio"
                  description="Control hover lift, spring feel, motion speed, and reduced-motion handling."
                  style={miniPanelStyle(theme)}
                >
                  <RangeField label="Hover lift" value={theme.hoverLift} min={0} max={18} suffix="px" onChange={(value) => updateTheme("hoverLift", value)} theme={theme} />
                  <RangeField label="Hover scale" value={theme.hoverScale} min={1} max={1.06} step={0.005} onChange={(value) => updateTheme("hoverScale", value)} theme={theme} />
                  <RangeField label="Motion speed" value={theme.motionSpeed} min={0.4} max={2.4} step={0.1} onChange={(value) => updateTheme("motionSpeed", value)} theme={theme} />
                  <RangeField label="Spring stiffness" value={theme.springStiffness} min={120} max={500} onChange={(value) => updateTheme("springStiffness", value)} theme={theme} />
                  <RangeField label="Spring damping" value={theme.springDamping} min={10} max={40} onChange={(value) => updateTheme("springDamping", value)} theme={theme} />
                  <RangeField label="Entrance stagger" value={theme.entranceStagger} min={0} max={0.2} step={0.01} suffix="s" onChange={(value) => updateTheme("entranceStagger", value)} theme={theme} />
                  <ToggleField label="Reduce motion" checked={theme.reduceMotion} onChange={(value) => updateTheme("reduceMotion", value)} theme={theme} />
                </SectionBlock>
              ) : null}

              {inspectorTab === "responsive" ? (
                <SectionBlock
                  title="Responsive preview"
                  description="See desktop, tablet, and mobile in the same editor while tuning columns, spacing, touch targets, and sidebar behavior."
                  style={miniPanelStyle(theme)}
                >
                  <SelectField
                    label="Sidebar mode"
                    value={theme.sidebarMode}
                    onChange={(value) => updateTheme("sidebarMode", value as ThemeState["sidebarMode"])}
                    options={[
                      { value: "wide", label: "Wide" },
                      { value: "compact", label: "Compact" },
                      { value: "hidden", label: "Hidden" },
                    ]}
                    theme={theme}
                  />
                  <RangeField label="Desktop columns" value={theme.columnsDesktop} min={1} max={4} onChange={(value) => updateTheme("columnsDesktop", value)} theme={theme} />
                  <RangeField label="Tablet columns" value={theme.columnsTablet} min={1} max={3} onChange={(value) => updateTheme("columnsTablet", value)} theme={theme} />
                  <RangeField label="Mobile columns" value={theme.columnsMobile} min={1} max={2} onChange={(value) => updateTheme("columnsMobile", value)} theme={theme} />
                  <RangeField label="Desktop gap" value={theme.gapDesktop} min={8} max={28} suffix="px" onChange={(value) => updateTheme("gapDesktop", value)} theme={theme} />
                  <RangeField label="Tablet gap" value={theme.gapTablet} min={8} max={28} suffix="px" onChange={(value) => updateTheme("gapTablet", value)} theme={theme} />
                  <RangeField label="Mobile gap" value={theme.gapMobile} min={6} max={24} suffix="px" onChange={(value) => updateTheme("gapMobile", value)} theme={theme} />
                  <RangeField label="Desktop padding" value={theme.paddingDesktop} min={12} max={30} suffix="px" onChange={(value) => updateTheme("paddingDesktop", value)} theme={theme} />
                  <RangeField label="Tablet padding" value={theme.paddingTablet} min={12} max={28} suffix="px" onChange={(value) => updateTheme("paddingTablet", value)} theme={theme} />
                  <RangeField label="Mobile padding" value={theme.paddingMobile} min={10} max={24} suffix="px" onChange={(value) => updateTheme("paddingMobile", value)} theme={theme} />
                  <ToggleField label="Larger touch targets" checked={theme.touchTargets} onChange={(value) => updateTheme("touchTargets", value)} theme={theme} />
                </SectionBlock>
              ) : null}

              {inspectorTab === "data" ? (
                primarySelectedWidget ? (
                  <SectionBlock
                    title="Mock content"
                    description="Quickly edit text, metrics, tags, and URLs so the visuals feel realistic before the real data exists."
                    style={miniPanelStyle(theme)}
                  >
                    <TextAreaField label="Body copy" value={primarySelectedWidget.data.body} onChange={(value) => updateSelectedWidgetData("body", value)} theme={theme} rows={5} />
                    <TextField label="CTA label" value={primarySelectedWidget.data.ctaLabel} onChange={(value) => updateSelectedWidgetData("ctaLabel", value)} theme={theme} />
                    <TextField label="Image URL" value={primarySelectedWidget.data.imageUrl} onChange={(value) => updateSelectedWidgetData("imageUrl", value)} theme={theme} placeholder="https://..." />
                    <div className="grid gap-3 md:grid-cols-3">
                      <TextField label="Stat A" value={primarySelectedWidget.data.statA} onChange={(value) => updateSelectedWidgetData("statA", value)} theme={theme} />
                      <TextField label="Stat B" value={primarySelectedWidget.data.statB} onChange={(value) => updateSelectedWidgetData("statB", value)} theme={theme} />
                      <TextField label="Stat C" value={primarySelectedWidget.data.statC} onChange={(value) => updateSelectedWidgetData("statC", value)} theme={theme} />
                    </div>
                    <TextAreaField
                      label="Tags (comma separated)"
                      value={primarySelectedWidget.data.tags.join(", ")}
                      onChange={(value) => updateSelectedWidgetData("tags", value.split(",").map((item) => item.trim()).filter(Boolean))}
                      theme={theme}
                      rows={3}
                    />
                    <TextAreaField
                      label="List items (one per line)"
                      value={primarySelectedWidget.data.listItems.join("\n")}
                      onChange={(value) => updateSelectedWidgetData("listItems", value.split("\n").map((item) => item.trim()).filter(Boolean))}
                      theme={theme}
                      rows={4}
                    />
                    <TextAreaField label="Quote" value={primarySelectedWidget.data.quote} onChange={(value) => updateSelectedWidgetData("quote", value)} theme={theme} rows={3} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <TextField label="Person" value={primarySelectedWidget.data.person} onChange={(value) => updateSelectedWidgetData("person", value)} theme={theme} />
                      <TextField label="Role" value={primarySelectedWidget.data.role} onChange={(value) => updateSelectedWidgetData("role", value)} theme={theme} />
                    </div>
                    <TextAreaField
                      label="Chart points (comma separated)"
                      value={primarySelectedWidget.data.chartPoints.join(", ")}
                      onChange={(value) =>
                        updateSelectedWidgetData(
                          "chartPoints",
                          value
                            .split(",")
                            .map((item) => Number(item.trim()))
                            .filter((item) => Number.isFinite(item)),
                        )
                      }
                      theme={theme}
                      rows={3}
                    />
                  </SectionBlock>
                ) : (
                  <EmptySelection theme={theme} />
                )
              ) : null}

              {inspectorTab === "history" ? (
                <SectionBlock
                  title="Save, import, recover"
                  description="Export or import your whole editor, snapshot themes and layouts, and keep exploring without losing a direction you like."
                  style={miniPanelStyle(theme)}
                >
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={undo}>
                      Undo
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={redo}>
                      Redo
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={openSaveThemePrompt}>
                      Save theme
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={openSaveLayoutPrompt}>
                      Save layout
                    </button>
                  </div>
                  <TextAreaField
                    label="Import JSON"
                    value={importBuffer}
                    onChange={setImportBuffer}
                    theme={theme}
                    rows={8}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={applyImport}>
                      Apply import
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={exportJson}>
                      Download export
                    </button>
                  </div>
                </SectionBlock>
              ) : null}

              {inspectorTab === "a11y" ? (
                <SectionBlock
                  title="Accessibility + polish"
                  description="Use contrast checks, focus rings, readable typography, and motion controls before shipping a look."
                  style={miniPanelStyle(theme)}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <ContrastPill label="Text on page" ratio={pageContrast} theme={theme} />
                    <ContrastPill label="Text on card" ratio={cardContrast} theme={theme} />
                  </div>
                  <RangeField label="Focus ring" value={theme.focusRing} min={1} max={6} suffix="px" onChange={(value) => updateTheme("focusRing", value)} theme={theme} />
                  <ToggleField label="Show accessibility hints" checked={theme.showAccessibilityHints} onChange={(value) => updateTheme("showAccessibilityHints", value)} theme={theme} />
                  <div className="rounded-2xl p-4 text-sm leading-6" style={miniPanelStyle(theme)}>
                    {pageContrast >= 4.5 && cardContrast >= 4.5
                      ? "Nice: both your page text and card text are in a comfortable contrast range."
                      : "At least one contrast pair is a bit weak. Try darkening the background or brightening the text."}
                  </div>
                </SectionBlock>
              ) : null}

              {inspectorTab === "commands" ? (
                <SectionBlock
                  title="Local command box"
                  description="This is a starter parser that understands common visual edits now. It gives you the workflow feel before you wire a real model call."
                  style={miniPanelStyle(theme)}
                >
                  <TextAreaField
                    label="Command"
                    value={commandInput}
                    onChange={setCommandInput}
                    theme={theme}
                    rows={4}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={applyCommand}>
                      Run command
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={() => setCommandInput("Make the background blue and increase glow")}>
                      Load example
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Make the background blue",
                      "Increase glow",
                      "Use light mode",
                      "Switch to tablet preview",
                      "Set blur to 26",
                      "Set columns to 4",
                      "Add hero",
                    ].map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="px-3 py-2 text-xs"
                        style={chipStyle(theme, false)}
                        onClick={() => setCommandInput(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-2">
                    {commandHistory.length ? (
                      commandHistory.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-2xl p-3 text-sm" style={miniPanelStyle(theme)}>
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl p-4 text-sm" style={miniPanelStyle(theme)}>
                        Your recent commands will appear here.
                      </div>
                    )}
                  </div>
                </SectionBlock>
              ) : null}
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {commandPaletteOpen ? (
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: "spring", stiffness: theme.springStiffness, damping: theme.springDamping }}
                className="w-full max-w-2xl rounded-[30px] p-4"
                style={uiPanelStyle}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em]" style={{ color: toRgba(theme.textColor, 0.56) }}>
                      Command palette
                    </div>
                    <div className="mt-2 text-2xl font-semibold">Type a visual change</div>
                    <div className="mt-1 text-sm" style={{ color: toRgba(theme.textColor, 0.68) }}>
                      Examples: “make the background blue”, “increase glow”, “switch to mobile preview”, “set columns to 4”.
                    </div>
                  </div>
                  <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={() => setCommandPaletteOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  <textarea
                    value={commandInput}
                    onChange={(event) => setCommandInput(event.target.value)}
                    onKeyDown={(event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        applyCommand();
                      }
                    }}
                    rows={4}
                    className="rounded-2xl px-4 py-4 outline-none"
                    style={inputShellStyle(theme)}
                    placeholder="Describe the visual change you want…"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false)} onClick={applyCommand}>
                      Run command
                    </button>
                    <button type="button" className="px-3 py-2 text-sm" style={buttonStyle(theme, false, "outline")} onClick={() => setCommandInput("Make the accent emerald and switch to glass")}>
                      Fill sample
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
