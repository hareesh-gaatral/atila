import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Page {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
}

const initialState: PagesState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
};

export const fetchPages = createAsyncThunk('pages/fetchPages', async () => {
  const res = await fetch('/api/pages');
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const fetchPageById = createAsyncThunk('pages/fetchPageById', async (id: string) => {
  const res = await fetch(`/api/pages/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const createPage = createAsyncThunk('pages/createPage', async (page: Omit<Page, '_id'>) => {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const updatePage = createAsyncThunk('pages/updatePage', async ({ id, page }: { id: string; page: Partial<Page> }) => {
  const res = await fetch(`/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const deletePage = createAsyncThunk('pages/deletePage', async (id: string) => {
  const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return id;
});

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearCurrentPage(state) {
      state.currentPage = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pages';
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.unshift(action.payload);
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        const index = state.pages.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.pages[index] = action.payload;
        if (state.currentPage?._id === action.payload._id) {
          state.currentPage = action.payload;
        }
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter(p => p._id !== action.payload);
      });
  },
});

export const { clearCurrentPage, clearError } = pagesSlice.actions;
export default pagesSlice.reducer;
