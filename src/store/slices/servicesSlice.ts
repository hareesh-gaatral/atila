import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { IService } from '@/types';

/**
 * Dynamic Services store.
 *
 * Public surfaces that render on the client (Navbar dropdown, home cards when
 * no server payload is available) read published services from here. Admin
 * CRUD dispatches upsert/remove into the same store so navigation and cards
 * update without a full page reload.
 */

interface ServicesState {
  /** Published services (nav dropdown + client-side cards). */
  items: IService[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  loading: false,
  loaded: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch services');
    return data.data as IService[];
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    /** Insert or replace one service (admin save) so the UI reflects it now. */
    upsertService(state, action: PayloadAction<IService>) {
      const saved = action.payload;
      if (!saved) return;
      const idx = state.items.findIndex((s) => s._id && saved._id && s._id === saved._id);
      if (idx >= 0) {
        state.items[idx] = saved;
      } else {
        state.items.push(saved);
      }
    },
    /** Remove a service entirely (archived/hard-deleted). */
    removeService(state, action: PayloadAction<{ id?: string; slug?: string }>) {
      const { id, slug } = action.payload;
      state.items = state.items.filter(
        (s) => !(id && s._id === id) && !(slug && s.slug === slug)
      );
    },
    clearServicesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch services';
      });
  },
});

export const { upsertService, removeService, clearServicesError } = servicesSlice.actions;

// ---- Selectors -------------------------------------------------------------

/** Published services for the nav dropdown (only those shown in the menu). */
export const selectMenuServices = createSelector(
  (state: any) => state.services?.items as IService[] | undefined,
  (items) =>
    (items || [])
      .filter((s) => s.isPublished !== false && s.isArchived !== true && s.showInMenu !== false)
      .sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0))
);

export default servicesSlice.reducer;
