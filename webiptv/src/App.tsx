import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Hls from "hls.js";

type Channel = {
  name: string;
  group: string;
  poster: string;
  epgId: string;
  url: string;
};

type Category = {
  name: string;
  channels: Channel[];
};

type ChannelsFile = Category[];

const REMOTE_URL =
  "https://raw.githubusercontent.com/khalidsbaibls-oss/tels/refs/heads/main/tv.json";
const STORAGE_KEY = "iptv_channels_data_v2";
const STORAGE_HASH_KEY = "iptv_channels_hash_v2";
const STORAGE_TS_KEY = "iptv_channels_updated_v2";

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'><rect width='400' height='225' fill='%23111827'/><text x='50%25' y='52%25' font-family='sans-serif' font-size='18' fill='%2394a3b8' text-anchor='middle'>No Preview</text></svg>";

function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

function extractYouTubeId(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  // 11-char ID only
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // youtu.be/<id>
  const short = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return short[1];
  // youtube.com/watch?v=<id>
  const watch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watch) return watch[1];
  // youtube.com/embed/<id>
  const embed = trimmed.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (embed) return embed[1];
  // youtube.com/shorts/<id>
  const shorts = trimmed.match(/shorts\/([A-Za-z0-9_-]{11})/);
  if (shorts) return shorts[1];
  // youtube.com/live/<id>
  const live = trimmed.match(/live\/([A-Za-z0-9_-]{11})/);
  if (live) return live[1];
  return "";
}

async function fetchAndParse(url: string, signal?: AbortSignal): Promise<ChannelsFile> {
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON from server");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Channels file must be an array of categories");
  }
  return parsed.map((rawCategory) => normalizeCategory(rawCategory));
}

function normalizeCategory(raw: unknown): Category {
  if (!raw || typeof raw !== "object") {
    return { name: "Unknown", channels: [] };
  }
  const r = raw as Record<string, unknown>;
  const categoryName =
    typeof r.name === "string" ? r.name : typeof r.title === "string" ? r.title : "Unknown";
  const groupName = categoryName;
  let channels: unknown[] = [];
  if (Array.isArray(r.channels)) channels = r.channels;
  else if (Array.isArray(r.items)) channels = r.items;
  return {
    name: categoryName,
    channels: channels
      .map((rawCh) => normalizeChannel(rawCh, groupName))
      .filter((c): c is Channel => !!c),
  };
}

function normalizeChannel(raw: unknown, groupName: string): Channel | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name =
    typeof r.name === "string"
      ? r.name
      : typeof r.title === "string"
        ? r.title
        : "";
  const id =
    typeof r.id === "string"
      ? r.id
      : typeof r.epgId === "string"
        ? r.epgId
        : typeof r.url === "string"
          ? r.url
          : name;
  if (!id && !name) return null;
  const url = typeof r.url === "string" ? r.url : "";
  const poster =
    typeof r.poster === "string" && r.poster.length > 0
      ? r.poster
      : typeof r.logo === "string"
        ? r.logo
        : typeof r.image === "string"
          ? r.image
          : FALLBACK_POSTER;
  const group =
    typeof r.group === "string" && r.group.length > 0 ? r.group : groupName;
  return {
    name: name || id,
    group,
    poster,
    epgId: id,
    url,
  };
}

function applyData(
  json: ChannelsFile,
  setters: {
    setData: React.Dispatch<React.SetStateAction<ChannelsFile>>;
    setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveChannel: React.Dispatch<React.SetStateAction<Channel | null>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
  },
  persist: boolean,
) {
  setters.setData(json);
  setters.setActiveCategory((current) => {
    if (current && json.some((c) => c.name === current)) return current;
    return json[0]?.name ?? null;
  });
  setters.setActiveChannel((current) => {
    if (current && json.some((c) => c.name === current.group)) {
      const cat = json.find((c) => c.name === current.group);
      if (cat && cat.channels.some((ch) => ch.epgId === current.epgId)) {
        return current;
      }
    }
    const firstCat = json[0];
    return firstCat?.channels[0] ?? null;
  });
  setters.setError(null);

  if (persist) {
    try {
      const raw = JSON.stringify(json);
      localStorage.setItem(STORAGE_KEY, raw);
      localStorage.setItem(STORAGE_HASH_KEY, hashString(raw));
      localStorage.setItem(STORAGE_TS_KEY, Date.now().toString());
    } catch {
      // ignore quota errors
    }
  }
}

export default function App() {
  const [data, setData] = useState<ChannelsFile>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [updateNote, setUpdateNote] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const refreshFromServer = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setRefreshing(true);
      setUpdateNote(null);
      try {
        const json = await fetchAndParse(REMOTE_URL);
        const raw = JSON.stringify(json);
        const newHash = hashString(raw);
        const oldHash = localStorage.getItem(STORAGE_HASH_KEY);
        const changed = oldHash !== null && oldHash !== newHash;
        applyData(
          json,
          { setData, setActiveCategory, setActiveChannel, setError },
          true,
        );
        const ts = Date.now();
        setLastUpdated(ts);
        if (changed) {
          setUpdateNote("Channel list updated");
          window.setTimeout(() => setUpdateNote(null), 4000);
        } else if (!opts.silent) {
          setUpdateNote("Already up to date");
          window.setTimeout(() => setUpdateNote(null), 3000);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setUpdateNote(`Refresh failed: ${message}`);
        window.setTimeout(() => setUpdateNote(null), 4000);
      } finally {
        if (!opts.silent) setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let shouldFetch = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
      const storedTs = localStorage.getItem(STORAGE_TS_KEY);
      if (stored && storedHash) {
        try {
          const parsed = JSON.parse(stored) as ChannelsFile;
          if (Array.isArray(parsed)) {
            applyData(
              parsed,
              { setData, setActiveCategory, setActiveChannel, setError },
              false,
            );
            setLastUpdated(storedTs ? Number(storedTs) : null);
            shouldFetch = false;
          }
        } catch {
          // ignore corrupt cache
        }
      }
    } catch {
      // ignore storage errors
    }

    if (shouldFetch) {
      setLoading(true);
    }

    (async () => {
      try {
        const json = await fetchAndParse(REMOTE_URL);
        if (cancelled) return;
        applyData(
          json,
          { setData, setActiveCategory, setActiveChannel, setError },
          true,
        );
        const ts = Date.now();
        setLastUpdated(ts);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        if (!data.length) {
          setError(message);
        } else {
          setUpdateNote(`Background refresh failed: ${message}`);
          window.setTimeout(() => setUpdateNote(null), 4000);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear search whenever the active category changes (pill click or channel from another cat)
  useEffect(() => {
    setSearch("");
  }, [activeCategory]);

  const searchActive = search.trim().length > 0;
  const searchQuery = searchActive ? search.toLowerCase() : "";

  const filteredChannels = useMemo<Channel[]>(() => {
    if (!activeCategory) return [];
    const currentCat = data.find((c) => c.name === activeCategory);
    const currentChannels = currentCat ? currentCat.channels : [];

    // No query → show only current category channels.
    if (!searchActive) return currentChannels;

    // Query present → show startsWith matches across ALL categories, deduped.
    const q = searchQuery;
    const seen = new Set<string>();
    const results: Channel[] = [];
    for (const cat of data) {
      for (const ch of cat.channels) {
        const key = `${ch.epgId}__${ch.group}`;
        if (seen.has(key)) continue;
        if (!ch.name.toLowerCase().startsWith(q)) continue;
        results.push(ch);
        seen.add(key);
      }
    }
    return results;
  }, [activeCategory, data, searchActive, searchQuery]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = activeChannel.url;
    const isHls = /\.m3u8($|\?)/i.test(url);

    if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (isHls && Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: false });
      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else {
      video.src = url;
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [activeChannel]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const flat = data.flatMap((c) => c.channels);
    const isTextInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return;
      if (!activeChannel) return;
      const idx = flat.findIndex(
        (c) => c.epgId === activeChannel.epgId && c.group === activeChannel.group,
      );
      const v = videoRef.current;
      switch (e.key) {
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          if (v) {
            if (v.paused || v.ended) v.play().catch(() => {});
            else v.pause();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (idx > 0) setActiveChannel(flat[idx - 1]);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (idx >= 0 && idx < flat.length - 1) setActiveChannel(flat[idx + 1]);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (v) {
            try {
              v.currentTime = Math.max(0, (v.currentTime || 0) - 10);
            } catch {
              /* ignore */
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (v) {
            try {
              v.currentTime = (v.currentTime || 0) + 10;
            } catch {
              /* ignore */
            }
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          if (v) v.muted = !v.muted;
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (!v) break;
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          } else {
            v.requestFullscreen?.().catch(() => {});
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeChannel, data, videoRef, setActiveChannel]);

  return (
    <div className="flex h-[100dvh] w-screen flex-col bg-slate-950 text-slate-100">
      <Header
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        sidebarOpen={sidebarOpen}
        onRefresh={() => refreshFromServer()}
        refreshing={refreshing}
        updateNote={updateNote}
        lastUpdated={lastUpdated}
        onFullscreen={() => {
          const el = videoRef.current;
          if (!el) return;
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          } else {
            el.requestFullscreen?.().catch(() => {});
          }
        }}
        onToggleMute={() => {
          const el = videoRef.current;
          if (!el) return;
          el.muted = !el.muted;
        }}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close channels panel"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <div className="relative flex flex-1 overflow-hidden">
        <aside
          className={
            "fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-sm flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur transition-transform duration-200 md:static md:z-auto md:w-72 md:translate-x-0 md:flex md:bg-slate-900/60 " +
            (sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:hidden")
          }
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 md:hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Channels
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close"
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <CategoriesList
            categories={data.map((c) => c.name)}
            active={activeCategory}
            onSelect={(name) => {
              setActiveCategory(name);
            }}
          />
          <div className="border-t border-slate-800 px-3 py-2">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search channels..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
          <ChannelsList
            channels={filteredChannels}
            active={activeChannel}
            activeCategory={activeCategory}
            onSelect={(ch) => {
              // Only switch the sidebar category when the user explicitly
              // picks a channel from a different category (via category pill
              // or prev/next). When picking from a search-result list, keep
              // the current category visible so the list doesn't "clear".
              setActiveChannel(ch);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            loading={loading}
            error={error}
          />
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Player
            channel={activeChannel}
            categoryName={activeCategory}
            allChannels={data.flatMap((c) => c.channels)}
            onSelectChannel={setActiveChannel}
            videoRef={videoRef}
          />
          {activeChannel && (
            <ChannelInfo channel={activeChannel} isPlaying={isPlaying} />
          )}
        </main>
      </div>
    </div>
  );
}

function formatRelative(ts: number | null): string {
  if (!ts) return "";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Updated just now";
  if (m < 60) return `Updated ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Updated ${h}h ago`;
  const d = Math.floor(h / 24);
  return `Updated ${d}d ago`;
}

function Header({
  onToggleSidebar,
  sidebarOpen,
  onRefresh,
  refreshing,
  updateNote,
  lastUpdated,
  onFullscreen,
  onToggleMute,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onRefresh: () => void | Promise<void>;
  refreshing: boolean;
  updateNote: string | null;
  lastUpdated: number | null;
  onFullscreen: () => void;
  onToggleMute: () => void;
}) {
  return (
    <header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-3 backdrop-blur sm:gap-3 sm:px-4">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle channels"
        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {sidebarOpen ? (
            <path d="M3 6h18M3 12h18M3 18h18" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md shadow-violet-900/40">
          <svg
            className="h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M8 4v16M16 4v16" />
          </svg>
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
            IPTV Stream
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Live Channels
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
        {lastUpdated ? (
          <span
            className="hidden text-xs text-slate-500 sm:inline"
            title={new Date(lastUpdated).toLocaleString()}
          >
            {formatRelative(lastUpdated)}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggleMute}
          aria-label="Toggle mute"
          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-violet-500 hover:bg-violet-500/10 hover:text-white"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onFullscreen}
          aria-label="Toggle fullscreen"
          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-violet-500 hover:bg-violet-500/10 hover:text-white"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>

        <button
          onClick={() => onRefresh()}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-500 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-3"
        >
          <svg
            className={"h-3.5 w-3.5 " + (refreshing ? "animate-spin" : "")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
          <span className="hidden xs:inline sm:inline">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {updateNote && (
        <div
          role="status"
          className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-900/95 px-3 py-1 text-xs text-slate-200 shadow-lg shadow-black/30 backdrop-blur"
        >
          {updateNote}
        </div>
      )}
    </header>
  );
}

function CategoriesList({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="border-b border-slate-800 px-2 py-2">
      <ul className="-mx-1 flex flex-nowrap gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {categories.length === 0 && (
          <li className="text-xs text-slate-500">No categories</li>
        )}
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <li key={cat} className="shrink-0">
              <button
                onClick={() => onSelect(cat)}
                className={
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition " +
                  (isActive
                    ? "bg-violet-500 text-white shadow-sm shadow-violet-900/40"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800")
                }
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChannelsList({
  channels,
  active,
  activeCategory,
  onSelect,
  loading,
  error,
}: {
  channels: Channel[];
  active: Channel | null;
  activeCategory: string | null;
  onSelect: (channel: Channel) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span>{activeCategory ? activeCategory : "Channels"}</span>
        <span className="text-slate-600 tabular-nums">{channels.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {error && (
          <div className="m-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
            Failed to load channels: {error}
          </div>
        )}
        {loading && (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-2 rounded p-1"
              >
                <div className="h-9 w-14 rounded bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-3/4 rounded bg-slate-800" />
                  <div className="h-2 w-1/3 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && channels.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-500">
            No channels
          </div>
        )}
        <ul>
          {channels.map((ch) => {
            const isActive =
              active?.name === ch.name && active?.group === ch.group;
            return (
              <li key={ch.epgId + ch.url}>
                <button
                  onClick={() => onSelect(ch)}
                  className={
                    "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition " +
                    (isActive
                      ? "bg-violet-500/10 ring-1 ring-violet-500/40"
                      : "hover:bg-slate-800/60")
                  }
                >
                  <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded bg-slate-800">
                    <img
                      src={ch.poster}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          FALLBACK_POSTER;
                      }}
                      className="h-full w-full object-cover"
                    />
                    {isActive && (
                      <span className="absolute right-0.5 top-0.5 flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          "truncate text-[13px] font-medium leading-tight " +
                          (isActive ? "text-violet-300" : "text-slate-100")
                        }
                        title={ch.name}
                      >
                        {ch.name}
                      </span>
                      {/^youtube$/i.test(ch.group || "") ? (
                        <span
                          className="shrink-0 rounded bg-rose-600 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-white"
                          title="YouTube"
                        >
                          YT
                        </span>
                      ) : /\.m3u8($|\?)/i.test(ch.url) ? (
                        <span
                          className="shrink-0 rounded bg-rose-600/90 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-white"
                          title="HLS / m3u8"
                        >
                          HLS
                        </span>
                      ) : null}
                    </div>
                    <div className="truncate text-[11px] leading-tight text-slate-500">
                      {ch.group !== activeCategory
                        ? ch.group
                        : " "}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Player({
  channel,
  categoryName,
  allChannels,
  onSelectChannel,
  videoRef,
}: {
  channel: Channel | null;
  categoryName: string | null;
  allChannels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [hovering, setHovering] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const [seekFlash, setSeekFlash] = useState<"back" | "forward" | null>(null);
  const [buffering, setBuffering] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const isYouTube =
    !!channel && /^youtube$/i.test(categoryName || channel.group || "");
  const isPlaying = !videoRef.current
    ? false
    : !videoRef.current.paused && !videoRef.current.ended;

  const currentIndex = useMemo(() => {
    if (!channel) return -1;
    return allChannels.findIndex(
      (c) => c.epgId === channel.epgId && c.group === channel.group,
    );
  }, [channel, allChannels]);

  const playPrev = () => {
    if (currentIndex <= 0) return;
    onSelectChannel(allChannels[currentIndex - 1]);
  };
  const playNext = () => {
    if (currentIndex < 0 || currentIndex >= allChannels.length - 1) return;
    onSelectChannel(allChannels[currentIndex + 1]);
  };

  const togglePlay = () => {
    if (isYouTube) return; // YouTube handles its own controls
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) v.play().catch(() => {});
    else v.pause();
  };

  const seekBy = (delta: number) => {
    if (isYouTube) return;
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = Math.max(0, (v.currentTime || 0) + delta);
    } catch {
      // seek failed; ignore (live streams often disallow it)
    }
    setSeekFlash(delta < 0 ? "back" : "forward");
    window.setTimeout(() => setSeekFlash(null), 500);
  };

  useEffect(() => {
    setBuffering(true);
    setDuration(0);
    setCurrentTime(0);
    if (isYouTube) return;
    const v = videoRef.current;
    if (!v) return;

    const onPlaying = () => {
      setBuffering(false);
      forceUpdate();
    };
    const onPause = () => forceUpdate();
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onLoadedMeta = () => {
      const d = v.duration;
      setDuration(Number.isFinite(d) ? d : 0);
    };
    const onTime = () => {
      const t = v.currentTime;
      setCurrentTime(Number.isFinite(t) ? t : 0);
    };

    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("durationchange", onLoadedMeta);
    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("timeupdate", onTime);

    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      v.removeEventListener("durationchange", onLoadedMeta);
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("timeupdate", onTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, isYouTube]);

  const [, forceTick] = useState(0);
  const forceUpdate = () => forceTick((t) => t + 1);

  const resetIdle = () => {
    setHovering(true);
    setIdle(false);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };

  useEffect(() => () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
  }, []);

  const ytSrc = useMemo(() => {
    if (!isYouTube || !channel) return "";
    const candidate = channel.epgId || channel.url || "";
    const id = extractYouTubeId(candidate);
    if (!id) return "";
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
  }, [channel, isYouTube]);

  return (
    <div
      className="group relative flex-1 overflow-hidden bg-black"
      onMouseEnter={resetIdle}
      onMouseMove={resetIdle}
      onMouseLeave={() => {
        setHovering(false);
        setIdle(true);
      }}
    >
      {channel ? (
        <>
          {isYouTube ? (
            <iframe
              key={channel.epgId + channel.url}
              src={ytSrc}
              title={channel.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onClick={togglePlay}
              className="h-full w-full cursor-pointer object-contain"
            />
          )}

          <div
            className={
              "pointer-events-none absolute inset-0 transition-opacity duration-300 " +
              ((hovering && !idle) || !isPlaying || buffering
                ? "opacity-100"
                : "opacity-0")
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto flex items-center gap-2 sm:gap-4">
                <ControlButton
                  label="Seek back 10s"
                  onClick={() => seekBy(-10)}
                  className="bg-white/10 hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 17l-5-5 5-5" />
                    <path d="M18 17l-5-5 5-5" />
                  </svg>
                  <span className="ml-1 text-[10px] font-semibold tabular-nums">
                    10
                  </span>
                  {seekFlash === "back" && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-1 text-[9px] text-white">
                      -10s
                    </span>
                  )}
                </ControlButton>

                <ControlButton
                  label="Previous channel"
                  onClick={playPrev}
                  disabled={currentIndex <= 0}
                  className="bg-white/10 hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                </ControlButton>

                {buffering && !isYouTube ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/20 p-3 shadow-lg shadow-rose-900/40 backdrop-blur">
                    <svg
                      className="h-8 w-8 animate-spin text-rose-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </div>
                ) : (
                  <ControlButton
                    label={isPlaying ? "Pause" : "Play"}
                    onClick={togglePlay}
                    className="h-16 w-16 bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-900/50 hover:from-rose-400 hover:to-rose-500"
                  >
                    {isPlaying ? (
                      <svg
                        className="h-7 w-7"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg
                        className="h-7 w-7 translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                    )}
                  </ControlButton>
                )}

                <ControlButton
                  label="Next channel"
                  onClick={playNext}
                  disabled={currentIndex < 0 || currentIndex >= allChannels.length - 1}
                  className="bg-white/10 hover:bg-white/20"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                </ControlButton>

                <ControlButton
                  label="Seek forward 10s"
                  onClick={() => seekBy(10)}
                  className="bg-white/10 hover:bg-white/20"
                >
                  <span className="mr-1 text-[10px] font-semibold tabular-nums">
                    10
                  </span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 17l5-5-5-5" />
                    <path d="M6 17l5-5-5-5" />
                  </svg>
                  {seekFlash === "forward" && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-1 text-[9px] text-white">
                      +10s
                    </span>
                  )}
                </ControlButton>
              </div>
            </div>

            {duration > 0 && (
              <div className="pointer-events-auto absolute bottom-12 left-1/2 w-[min(640px,90%)] -translate-x-1/2">
                <SeekBar
                  current={currentTime}
                  duration={duration}
                  onSeek={(t) => {
                    const v = videoRef.current;
                    if (!v) return;
                    try {
                      v.currentTime = t;
                    } catch {
                      /* ignore */
                    }
                  }}
                />
              </div>
            )}

            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5 text-[10px] text-slate-300 opacity-70 transition-opacity group-hover:opacity-100">
              <Hint k="Space" v="Play/Pause" />
              <Hint k="←/→" v="Channel" />
              <Hint k="↑/↓" v="10s" />
              <Hint k="M" v="Mute" />
              <Hint k="F" v="Full" />
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-900/40">
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">
                Select a channel
              </div>
              <div className="text-xs text-slate-500">
                Choose from the sidebar to start watching
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function SeekBar({
  current,
  duration,
  onSeek,
}: {
  current: number;
  duration: number;
  onSeek: (t: number) => void;
}) {
  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur">
      <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-slate-200">
        {formatTime(current)}
      </span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-rose-500"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Seek"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
        {formatTime(duration)}
      </span>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={
        "relative flex h-11 w-11 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-30 " +
        (className ?? "")
      }
    >
      {children}
    </button>
  );
}

function Hint({ k, v }: { k: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-black/40 px-1.5 py-0.5 backdrop-blur">
      <kbd className="rounded bg-white/10 px-1 font-mono text-[9px] font-semibold text-white">
        {k}
      </kbd>
      <span className="text-[10px] text-slate-300">{v}</span>
    </span>
  );
}

function ChannelInfo({
  channel,
  isPlaying,
}: {
  channel: Channel;
  isPlaying: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-4 border-t border-slate-800 bg-slate-900/70 px-4 py-3 backdrop-blur">
      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-slate-800">
        <img
          src={channel.poster}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_POSTER;
          }}
          className="h-full w-full object-cover"
        />
        {isPlaying && (
          <span className="absolute right-1 top-1 rounded bg-rose-600/90 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white">
            Live
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {channel.name}
          </span>
          <span
            className={
              "shrink-0 rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wide " +
              (/^youtube$/i.test(channel.group || "")
                ? "bg-rose-600 text-white"
                : /\.m3u8($|\?)/i.test(channel.url)
                  ? "bg-rose-600/90 text-white"
                  : "bg-slate-700 text-slate-200")
            }
          >
            {/^youtube$/i.test(channel.group || "")
              ? "YouTube"
              : /\.m3u8($|\?)/i.test(channel.url)
                ? "m3u8"
                : "stream"}
          </span>
        </div>
        <div className="truncate text-xs text-slate-500">
          {channel.group} · EPG: {channel.epgId}
        </div>
      </div>
      <a
        href={channel.url}
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white sm:block"
        title={channel.url}
      >
        Stream URL ↗
      </a>
    </div>
  );
}
