import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface SectionItem {
  title?: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  link?: string;
}

export interface Section {
  _id: string;
  pageTitle: string;
  pageSlug: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  button2Text?: string;
  button2Link?: string;
  items: SectionItem[];
  order: number;
  isActive: boolean;
}

interface SectionsState {
  sections: Section[];
  homeSections: Section[];
  loading: boolean;
  error: string | null;
}

const initialState: SectionsState = {
  sections: [],
  homeSections: [],
  loading: false,
  error: null,
};

export const fetchSections = createAsyncThunk('sections/fetchSections', async () => {
  const res = await fetch('/api/sections');
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const fetchSectionsByPage = createAsyncThunk('sections/fetchSectionsByPage', async (pageSlug: string) => {
  const res = await fetch(`/api/sections?pageSlug=${pageSlug}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const createSection = createAsyncThunk('sections/createSection', async (section: Omit<Section, '_id'>) => {
  const res = await fetch('/api/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const updateSection = createAsyncThunk('sections/updateSection', async ({ id, section }: { id: string; section: Partial<Section> }) => {
  const res = await fetch(`/api/sections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const deleteSection = createAsyncThunk('sections/deleteSection', async (id: string) => {
  const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return id;
});

const sectionsSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    clearSections(state) {
      state.sections = [];
      state.homeSections = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sections';
      })
      .addCase(fetchSectionsByPage.fulfilled, (state, action) => {
        state.homeSections = action.payload;
      })
      .addCase(createSection.fulfilled, (state, action) => {
        state.sections.push(action.payload);
      })
      .addCase(updateSection.fulfilled, (state, action) => {
        const index = state.sections.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.sections[index] = action.payload;
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.sections = state.sections.filter(s => s._id !== action.payload);
      });
  },
});

export const { clearSections } = sectionsSlice.actions;
export default sectionsSlice.reducer;
