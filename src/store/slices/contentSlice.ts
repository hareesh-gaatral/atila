import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * Global website content store.
 *
 * The public site is server-rendered (SSR) via lib/cache.ts, which streams the
 * full page sections + settings into the page. This slice holds the same
 * content client-side so:
 *   - Navbar/Footer can render DB-driven chrome after hydration, and
 *   - admin CRUD can update Redux so the UI reflects changes immediately.
 *
 * To avoid duplicate network calls the home page hydrates its server-rendered
 * payload with `homeContentHydrated` (no fetch), while Navbar/Footer lazily
 * fetch the site-wide global content (`fetchGlobalContent`) once per session.
 */

export interface SiteSection {
  _id?: string;
  pageSlug?: string;
  pageTitle?: string;
  sectionType?: string;
  order?: number;
  isActive?: boolean;
  title?: string;
  subtitle?: string;
  content?: string;
  items?: any[];
  [key: string]: any;
}

interface ContentState {
  homeSections: SiteSection[];
  homeSettings: Record<string, string>;
  homeLoading: boolean;
  homeLoaded: boolean;
  globalNavbar: SiteSection | null;
  globalFooter: SiteSection | null;
  globalSettings: Record<string, string>;
  globalLoading: boolean;
  globalLoaded: boolean;
  error: string | null;
}

const initialState: ContentState = {
  homeSections: [],
  homeSettings: {},
  homeLoading: false,
  homeLoaded: false,
  globalNavbar: null,
  globalFooter: null,
  globalSettings: {},
  globalLoading: false,
  globalLoaded: false,
  error: null,
};

export const fetchHomeContent = createAsyncThunk(
  'content/fetchHomeContent',
  async () => {
    const res = await fetch('/api/site?scope=home');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch home content');
    return data.data as { sections: SiteSection[]; settings: Record<string, string> };
  }
);

export const fetchGlobalContent = createAsyncThunk(
  'content/fetchGlobalContent',
  async () => {
    const res = await fetch('/api/site?scope=global');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch global content');
    return data.data as {
      navbar: SiteSection | null;
      footer: SiteSection | null;
      settings: Record<string, string>;
    };
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    homeContentHydrated(
      state,
      action: PayloadAction<{ sections: SiteSection[]; settings: Record<string, string> }>
    ) {
      state.homeSections = action.payload.sections;
      state.homeSettings = action.payload.settings;
      state.homeLoaded = true;
      state.homeLoading = false;
    },
    globalContentHydrated(
      state,
      action: PayloadAction<{ navbar: SiteSection | null; footer: SiteSection | null }>
    ) {
      state.globalNavbar = action.payload.navbar;
      state.globalFooter = action.payload.footer;
      state.globalLoaded = true;
      state.globalLoading = false;
    },
    /** Upsert one saved section so admin edits appear in the public UI immediately. */
    upsertContentSection(state, action: PayloadAction<SiteSection>) {
      const saved = action.payload;
      if (!saved) return;
      if (saved.pageSlug === 'global') {
        if (saved.sectionType === 'navbar') state.globalNavbar = saved;
        else if (saved.sectionType === 'footer') state.globalFooter = saved;
      } else if (saved.pageSlug === 'home') {
        const idx = state.homeSections.findIndex((s) => s.sectionType === saved.sectionType);
        if (idx >= 0) state.homeSections[idx] = saved;
        else state.homeSections.push(saved);
      }
    },
    clearContentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeContent.pending, (state) => {
        state.homeLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeContent.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeLoaded = true;
        state.homeSections = action.payload.sections;
        state.homeSettings = action.payload.settings;
      })
      .addCase(fetchHomeContent.rejected, (state, action) => {
        state.homeLoading = false;
        state.error = action.error.message || 'Failed to fetch home content';
      })
      .addCase(fetchGlobalContent.pending, (state) => {
        state.globalLoading = true;
        state.error = null;
      })
      .addCase(fetchGlobalContent.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.globalLoaded = true;
        state.globalNavbar = action.payload.navbar;
        state.globalFooter = action.payload.footer;
        state.globalSettings = action.payload.settings;
      })
      .addCase(fetchGlobalContent.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.error.message || 'Failed to fetch global content';
      });
  },
});

export const { homeContentHydrated, globalContentHydrated, upsertContentSection, clearContentError } = contentSlice.actions;

// ---- Selectors -------------------------------------------------------------

export const selectHomeContent = (state: any) => state.content;

/** Merge DB content over a static JSON default (used by Navbar/Footer). */
export const mergeGlobalContent = (dbContent: SiteSection | null, jsonDefault: any): any => {
  if (!dbContent) return jsonDefault;
  const { _id, pageSlug, pageTitle, sectionType, order, isActive, createdAt, updatedAt, __v, items, ...rest } = dbContent as any;
  return { ...jsonDefault, ...rest };
};

export default contentSlice.reducer;
