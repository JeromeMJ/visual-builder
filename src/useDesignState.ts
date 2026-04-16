
import { useEffect, useMemo, useRef, useState } from "react";
import type { PreviewMode, ThemePreset, ThemeState } from "./theme";
import { DEFAULT_THEME, DEFAULT_THEME_PRESETS, clamp, generatePaletteFromBase, randomThemePatch } from "./theme";
import type { ButtonStyleName, CardStyleName, ChartSkin, Widget, WidgetKind, WidgetStyleOverride } from "./widgetLibrary";
import { createWidget, DEFAULT_WIDGETS } from "./widgetLibrary";

export type InspectorTab =
  | "selection"
  | "theme"
  | "background"
  | "effects"
  | "animation"
  | "responsive"
  | "data"
  | "history"
  | "a11y"
  | "commands";

export type LeftTab = "library" | "layers" | "presets";
export type CanvasState = "live" | "loading" | "empty" | "error";

export type SavedThemePreset = {
  id: string;
  name: string;
  theme: ThemeState;
  createdAt: number;
};

export type SavedLayoutPreset = {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: number;
};

type PersistedState = {
  widgets: Widget[];
  theme: ThemeState;
  designMode: boolean;
  previewMode: PreviewMode;
  selectedIds: string[];
  leftTab: LeftTab;
  inspectorTab: InspectorTab;
  commandPaletteOpen: boolean;
  canvasState: CanvasState;
  copiedStyle: WidgetStyleOverride | null;
  savedThemePresets: SavedThemePreset[];
  savedLayoutPresets: SavedLayoutPreset[];
  commandHistory: string[];
};

const STORAGE_KEY = "visual-builder-all-packs/editor-state-v1";
const HISTORY_LIMIT = 80;

const DEFAULT_STATE: PersistedState = {
  widgets: DEFAULT_WIDGETS,
  theme: DEFAULT_THEME,
  designMode: true,
  previewMode: "desktop",
  selectedIds: [DEFAULT_WIDGETS[0].id],
  leftTab: "library",
  inspectorTab: "selection",
  commandPaletteOpen: false,
  canvasState: "live",
  copiedStyle: null,
  savedThemePresets: [],
  savedLayoutPresets: [],
  commandHistory: [],
};

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore limited browser environments.
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function colorFromWord(input: string) {
  const words: Record<string, string> = {
    purple: "#8b5cf6",
    violet: "#8b5cf6",
    indigo: "#6366f1",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    teal: "#14b8a6",
    emerald: "#10b981",
    green: "#22c55e",
    lime: "#84cc16",
    yellow: "#eab308",
    amber: "#f59e0b",
    orange: "#f97316",
    red: "#ef4444",
    pink: "#ec4899",
    rose: "#fb7185",
    slate: "#64748b",
    white: "#ffffff",
    black: "#09090f",
  };

  const key = input.trim().toLowerCase().replace(/\s+/g, "");
  if (words[key]) return words[key];
  if (/^#?[0-9a-f]{3,6}$/i.test(input.trim())) {
    const clean = input.trim().startsWith("#") ? input.trim() : `#${input.trim()}`;
    return clean;
  }
  return null;
}

export function useDesignState() {
  const [present, setPresent] = useState<PersistedState>(() => {
    const stored = readStorage(STORAGE_KEY, DEFAULT_STATE);
    return {
      ...DEFAULT_STATE,
      ...stored,
      widgets: stored.widgets?.length ? stored.widgets : DEFAULT_WIDGETS,
      selectedIds: stored.selectedIds?.length ? stored.selectedIds : [DEFAULT_WIDGETS[0].id],
      savedThemePresets: stored.savedThemePresets ?? [],
      savedLayoutPresets: stored.savedLayoutPresets ?? [],
      copiedStyle: stored.copiedStyle ?? null,
      commandHistory: stored.commandHistory ?? [],
      theme: { ...DEFAULT_THEME, ...(stored.theme ?? {}) },
    };
  });

  const [past, setPast] = useState<PersistedState[]>([]);
  const [future, setFuture] = useState<PersistedState[]>([]);
  const presentRef = useRef(present);

  useEffect(() => {
    presentRef.current = present;
    writeStorage(STORAGE_KEY, present);
  }, [present]);

  const commit = (
    updater: (draft: PersistedState) => void | PersistedState,
    options: { history?: boolean } = { history: true },
  ) => {
    const current = presentRef.current;
    const draft = cloneState(current);
    const result = updater(draft);
    const next = (result ?? draft) as PersistedState;

    if (options.history !== false) {
      setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), current]);
      setFuture([]);
    }

    setPresent(next);
  };

  const undo = () => {
    setPast((currentPast) => {
      if (!currentPast.length) return currentPast;
      const previous = currentPast[currentPast.length - 1];
      setFuture((currentFuture) => [presentRef.current, ...currentFuture]);
      setPresent(previous);
      return currentPast.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((currentFuture) => {
      if (!currentFuture.length) return currentFuture;
      const [next, ...remaining] = currentFuture;
      setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), presentRef.current]);
      setPresent(next);
      return remaining;
    });
  };

  const setDesignMode = (value: boolean) => {
    commit((draft) => {
      draft.designMode = value;
    }, { history: false });
  };

  const setPreviewMode = (value: PreviewMode) => {
    commit((draft) => {
      draft.previewMode = value;
    }, { history: false });
  };

  const setLeftTab = (value: LeftTab) => {
    commit((draft) => {
      draft.leftTab = value;
    }, { history: false });
  };

  const setInspectorTab = (value: InspectorTab) => {
    commit((draft) => {
      draft.inspectorTab = value;
    }, { history: false });
  };

  const setCommandPaletteOpen = (value: boolean) => {
    commit((draft) => {
      draft.commandPaletteOpen = value;
    }, { history: false });
  };

  const setCanvasState = (value: CanvasState) => {
    commit((draft) => {
      draft.canvasState = value;
    }, { history: false });
  };

  const setSelectedIds = (ids: string[]) => {
    commit((draft) => {
      draft.selectedIds = ids.length ? ids : draft.selectedIds;
    }, { history: false });
  };

  const selectWidget = (id: string, additive = false) => {
    commit((draft) => {
      draft.selectedIds = additive
        ? draft.selectedIds.includes(id)
          ? draft.selectedIds.filter((item) => item !== id)
          : [...draft.selectedIds, id]
        : [id];
    }, { history: false });
  };

  const selectAllWidgets = () => {
    commit((draft) => {
      draft.selectedIds = draft.widgets.map((widget) => widget.id);
    }, { history: false });
  };

  const clearSelection = () => {
    commit((draft) => {
      draft.selectedIds = [];
    }, { history: false });
  };

  const updateTheme = <K extends keyof ThemeState>(key: K, value: ThemeState[K]) => {
    commit((draft) => {
      draft.theme[key] = value;
    });
  };

  const applyThemePatch = (patch: Partial<ThemeState>) => {
    commit((draft) => {
      draft.theme = { ...draft.theme, ...patch };
    });
  };

  const applyThemePreset = (preset: ThemePreset | SavedThemePreset) => {
    const patch = "patch" in preset ? preset.patch : preset.theme;
    commit((draft) => {
      draft.theme = { ...draft.theme, ...patch };
    });
  };

  const generatePalette = (baseColor: string) => {
    applyThemePatch(generatePaletteFromBase(baseColor));
  };

  const randomizeTheme = () => {
    applyThemePatch(randomThemePatch());
  };

  const resetTheme = () => {
    commit((draft) => {
      draft.theme = DEFAULT_THEME;
    });
  };

  const reorderWidgets = (activeId: string, overId: string) => {
    if (activeId === overId) return;

    commit((draft) => {
      const currentIndex = draft.widgets.findIndex((widget) => widget.id === activeId);
      const targetIndex = draft.widgets.findIndex((widget) => widget.id === overId);
      if (currentIndex < 0 || targetIndex < 0) return;
      const [moved] = draft.widgets.splice(currentIndex, 1);
      draft.widgets.splice(targetIndex, 0, moved);
      draft.selectedIds = [activeId];
    });
  };

  const addWidget = (kind: WidgetKind) => {
    commit((draft) => {
      const widget = createWidget(kind);
      draft.widgets.push(widget);
      draft.selectedIds = [widget.id];
      draft.leftTab = "layers";
    });
  };


  const duplicateWidget = (id: string) => {
    commit((draft) => {
      const index = draft.widgets.findIndex((widget) => widget.id === id);
      if (index < 0) return;
      const duplicate = cloneState(draft.widgets[index]);
      duplicate.id = makeId(duplicate.kind);
      duplicate.title = `${duplicate.title} Copy`;
      draft.widgets.splice(index + 1, 0, duplicate);
      draft.selectedIds = [duplicate.id];
    });
  };

  const deleteWidget = (id: string) => {
    commit((draft) => {
      draft.widgets = draft.widgets.filter((widget) => widget.id !== id);
      if (!draft.widgets.length) {
        const fallback = createWidget("hero");
        draft.widgets = [fallback];
        draft.selectedIds = [fallback.id];
      } else if (draft.selectedIds.includes(id)) {
        draft.selectedIds = [draft.widgets[0].id];
      }
    });
  };

  const toggleWidgetFlag = (id: string, flag: "hidden" | "collapsed" | "locked") => {
    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        widget.id === id ? { ...widget, [flag]: !widget[flag] } : widget,
      );
    });
  };

  const duplicateSelected = () => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      const nextWidgets: Widget[] = [];
      const additions: Widget[] = [];

      draft.widgets.forEach((widget) => {
        nextWidgets.push(widget);

        if (draft.selectedIds.includes(widget.id)) {
          const duplicate = cloneState(widget);
          duplicate.id = makeId(widget.kind);
          duplicate.title = `${widget.title} Copy`;
          additions.push(duplicate);
          nextWidgets.push(duplicate);
        }
      });

      draft.widgets = nextWidgets;

      if (additions.length) {
        draft.selectedIds = additions.map((item) => item.id);
      }
    });
  };

  const deleteSelected = () => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.filter((widget) => !draft.selectedIds.includes(widget.id));
      if (!draft.widgets.length) {
        const fallback = createWidget("hero");
        draft.widgets = [fallback];
        draft.selectedIds = [fallback.id];
      } else {
        draft.selectedIds = [draft.widgets[0].id];
      }
    });
  };

  const resetLayout = () => {
    commit((draft) => {
      draft.widgets = DEFAULT_WIDGETS;
      draft.selectedIds = [DEFAULT_WIDGETS[0].id];
    });
  };

  const renameWidget = (id: string, title: string) => {
    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        widget.id === id ? { ...widget, title: title || widget.title } : widget,
      );
    });
  };

  const updateWidget = (id: string, patch: Partial<Widget>) => {
    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        widget.id === id ? { ...widget, ...patch } : widget,
      );
    });
  };

  const updateSelectedWidgets = (patch: Partial<Widget>) => {
    if (!present.selectedIds.length) return;
    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id) ? { ...widget, ...patch } : widget,
      );
    });
  };

  const updateSelectedWidgetField = <K extends keyof Widget>(key: K, value: Widget[K]) => {
    updateSelectedWidgets({ [key]: value } as Partial<Widget>);
  };

  const updateSelectedWidgetData = <K extends keyof Widget["data"]>(
    key: K,
    value: Widget["data"][K],
  ) => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id)
          ? { ...widget, data: { ...widget.data, [key]: value } }
          : widget,
      );
    });
  };

  const updateSelectedWidgetStyle = <K extends keyof WidgetStyleOverride>(
    key: K,
    value: WidgetStyleOverride[K],
  ) => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id)
          ? { ...widget, style: { ...widget.style, [key]: value } }
          : widget,
      );
    });
  };

  const setSelectedSpan = (span: number) => {
    updateSelectedWidgets({ span });
  };

  const toggleSelectedFlag = (flag: "hidden" | "collapsed" | "locked", value?: boolean) => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id)
          ? { ...widget, [flag]: value ?? !widget[flag] }
          : widget,
      );
    });
  };

  const setSelectedVisibility = (breakpoint: PreviewMode, value: boolean) => {
    if (!present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id)
          ? {
              ...widget,
              visibility: { ...widget.visibility, [breakpoint]: value },
            }
          : widget,
      );
    });
  };

  const copySelectedStyle = () => {
    const widget = present.widgets.find((item) => item.id === present.selectedIds[0]);
    if (!widget) return;

    commit((draft) => {
      draft.copiedStyle = widget.style;
    }, { history: false });
  };

  const pasteSelectedStyle = () => {
    if (!present.copiedStyle || !present.selectedIds.length) return;

    commit((draft) => {
      draft.widgets = draft.widgets.map((widget) =>
        draft.selectedIds.includes(widget.id)
          ? { ...widget, style: { ...widget.style, ...draft.copiedStyle } }
          : widget,
      );
    });
  };

  const saveThemePreset = (name: string) => {
    const safeName = name.trim();
    if (!safeName) return;

    commit((draft) => {
      draft.savedThemePresets.unshift({
        id: makeId("theme"),
        name: safeName,
        theme: cloneState(draft.theme),
        createdAt: Date.now(),
      });
    });
  };

  const deleteThemePreset = (id: string) => {
    commit((draft) => {
      draft.savedThemePresets = draft.savedThemePresets.filter((preset) => preset.id !== id);
    });
  };

  const saveLayoutPreset = (name: string) => {
    const safeName = name.trim();
    if (!safeName) return;

    commit((draft) => {
      draft.savedLayoutPresets.unshift({
        id: makeId("layout"),
        name: safeName,
        widgets: cloneState(draft.widgets),
        createdAt: Date.now(),
      });
    });
  };

  const applyLayoutPreset = (id: string) => {
    const preset = present.savedLayoutPresets.find((item) => item.id === id);
    if (!preset) return;

    commit((draft) => {
      draft.widgets = cloneState(preset.widgets);
      draft.selectedIds = draft.widgets.length ? [draft.widgets[0].id] : [];
    });
  };

  const deleteLayoutPreset = (id: string) => {
    commit((draft) => {
      draft.savedLayoutPresets = draft.savedLayoutPresets.filter((preset) => preset.id !== id);
    });
  };

  const exportStateJSON = () => {
    return JSON.stringify(
      {
        ...present,
        defaults: {
          themes: DEFAULT_THEME_PRESETS,
        },
      },
      null,
      2,
    );
  };

  const importStateJSON = (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const next: PersistedState = {
        ...DEFAULT_STATE,
        ...present,
        ...parsed,
        theme: { ...DEFAULT_THEME, ...(parsed.theme ?? present.theme) },
        widgets: parsed.widgets?.length ? parsed.widgets : present.widgets,
        selectedIds: parsed.selectedIds?.length ? parsed.selectedIds : present.selectedIds,
        savedThemePresets: parsed.savedThemePresets ?? present.savedThemePresets,
        savedLayoutPresets: parsed.savedLayoutPresets ?? present.savedLayoutPresets,
        copiedStyle: parsed.copiedStyle ?? present.copiedStyle,
        commandHistory: parsed.commandHistory ?? present.commandHistory,
      };

      setPast((currentPast) => [...currentPast.slice(-(HISTORY_LIMIT - 1)), presentRef.current]);
      setFuture([]);
      setPresent(next);

      return { ok: true as const, message: "Import applied." };
    } catch (error) {
      return { ok: false as const, message: "That JSON could not be imported." };
    }
  };

  const runLocalCommand = (command: string) => {
    const input = command.trim();
    if (!input) return "Type a visual command first.";

    let response = "Command noted, but I did not match a visual action yet.";
    const lower = input.toLowerCase();

    commit((draft) => {
      draft.commandHistory.unshift(input);
      draft.commandHistory = draft.commandHistory.slice(0, 18);

      const colorMatch =
        input.match(/#([0-9a-f]{3}|[0-9a-f]{6})/i)?.[0] ??
        colorFromWord(input.split(/\s+/).find((word) => Boolean(colorFromWord(word))) ?? "");

      if (lower.includes("background") && colorMatch) {
        const palette = generatePaletteFromBase(colorMatch);
        draft.theme = {
          ...draft.theme,
          ...palette,
          background: colorMatch,
          backgroundMode: lower.includes("image") ? "image" : draft.theme.backgroundMode,
        };
        response = `Background updated to ${colorMatch}.`;
        return;
      }

      if ((lower.includes("accent") || lower.includes("cta")) && colorMatch) {
        const palette = generatePaletteFromBase(colorMatch);
        draft.theme = {
          ...draft.theme,
          ...palette,
          accent: colorMatch,
          glowColor: palette.glowColor ?? draft.theme.glowColor,
        };
        response = `Accent updated to ${colorMatch}.`;
        return;
      }

      if (lower.includes("glow") && lower.includes("off")) {
        draft.theme.glowIntensity = 0;
        draft.theme.innerGlow = 0;
        response = "Glow turned off.";
        return;
      }

      if (lower.includes("glow") && (lower.includes("more") || lower.includes("increase") || lower.includes("stronger"))) {
        draft.theme.glowIntensity = clamp(draft.theme.glowIntensity + 12, 0, 100);
        response = "Glow intensity increased.";
        return;
      }

      if (lower.includes("glow") && (lower.includes("less") || lower.includes("decrease") || lower.includes("softer"))) {
        draft.theme.glowIntensity = clamp(draft.theme.glowIntensity - 12, 0, 100);
        response = "Glow intensity reduced.";
        return;
      }

      if (lower.includes("glass") && (lower.includes("on") || lower.includes("more") || lower.includes("frosted"))) {
        draft.theme.cardStyle = "glass";
        draft.theme.glassBlur = clamp(draft.theme.glassBlur + 8, 0, 60);
        response = "Glass effect intensified.";
        return;
      }

      if (lower.includes("glass") && (lower.includes("off") || lower.includes("matte"))) {
        draft.theme.cardStyle = "matte";
        draft.theme.glassBlur = 0;
        response = "Glass effect reduced.";
        return;
      }

      const blurNumber = lower.match(/blur[^0-9]*(\d{1,2})/);
      if (blurNumber) {
        draft.theme.glassBlur = clamp(Number(blurNumber[1]), 0, 60);
        response = `Blur set to ${draft.theme.glassBlur}px.`;
        return;
      }

      const radiusNumber = lower.match(/radius[^0-9]*(\d{1,2})/);
      if (radiusNumber) {
        draft.theme.radius = clamp(Number(radiusNumber[1]), 8, 40);
        response = `Radius set to ${draft.theme.radius}px.`;
        return;
      }

      const columnsNumber = lower.match(/columns?[^0-9]*(\d)/);
      if (columnsNumber) {
        draft.theme.columnsDesktop = clamp(Number(columnsNumber[1]), 1, 4);
        response = `Desktop columns set to ${draft.theme.columnsDesktop}.`;
        return;
      }

      if (lower.includes("mobile preview")) {
        draft.previewMode = "mobile";
        response = "Switched to mobile preview.";
        return;
      }

      if (lower.includes("tablet preview")) {
        draft.previewMode = "tablet";
        response = "Switched to tablet preview.";
        return;
      }

      if (lower.includes("desktop preview")) {
        draft.previewMode = "desktop";
        response = "Switched to desktop preview.";
        return;
      }

      if (lower.includes("light mode")) {
        draft.theme = { ...draft.theme, ...DEFAULT_THEME_PRESETS.find((preset) => preset.name === "Clean Light")?.patch };
        response = "Applied a light theme preset.";
        return;
      }

      if (lower.includes("dark mode")) {
        draft.theme = { ...draft.theme, ...DEFAULT_THEME_PRESETS[0].patch };
        response = "Applied a dark theme preset.";
        return;
      }

      if (lower.includes("randomize")) {
        draft.theme = { ...draft.theme, ...randomThemePatch() };
        response = "Randomized the visual system.";
        return;
      }

      if (lower.includes("hero") && lower.includes("add")) {
        const widget = createWidget("hero");
        draft.widgets.unshift(widget);
        draft.selectedIds = [widget.id];
        response = "Added a hero widget.";
        return;
      }

      if (lower.includes("chart") && lower.includes("line")) {
        draft.theme.chartSkin = "line";
        response = "Switched charts to line mode.";
        return;
      }

      if (lower.includes("chart") && lower.includes("area")) {
        draft.theme.chartSkin = "area";
        response = "Switched charts to area mode.";
        return;
      }

      if (lower.includes("chart") && lower.includes("bars")) {
        draft.theme.chartSkin = "bars";
        response = "Switched charts to bars.";
        return;
      }
    });

    return response;
  };

  const primarySelectedWidget = useMemo(
    () => present.widgets.find((widget) => widget.id === present.selectedIds[0]) ?? null,
    [present.selectedIds, present.widgets],
  );

  const selectedWidgets = useMemo(
    () => present.widgets.filter((widget) => present.selectedIds.includes(widget.id)),
    [present.selectedIds, present.widgets],
  );

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return {
    ...present,
    widgets: present.widgets,
    theme: present.theme,
    designMode: present.designMode,
    previewMode: present.previewMode,
    selectedIds: present.selectedIds,
    leftTab: present.leftTab,
    inspectorTab: present.inspectorTab,
    commandPaletteOpen: present.commandPaletteOpen,
    canvasState: present.canvasState,
    copiedStyle: present.copiedStyle,
    savedThemePresets: present.savedThemePresets,
    savedLayoutPresets: present.savedLayoutPresets,
    commandHistory: present.commandHistory,
    primarySelectedWidget,
    selectedWidgets,
    canUndo,
    canRedo,
    defaultThemePresets: DEFAULT_THEME_PRESETS,
    setDesignMode,
    setPreviewMode,
    setLeftTab,
    setInspectorTab,
    setCommandPaletteOpen,
    setCanvasState,
    setSelectedIds,
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
    renameWidget,
    updateWidget,
    updateSelectedWidgets,
    updateSelectedWidgetField,
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
  };
}
