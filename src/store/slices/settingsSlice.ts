import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Setting {
  _id: string;
  key: string;
  value: string;
  type: string;
}

interface SettingsState {
  settings: Record<string, string>;
  settingsList: Setting[];
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {},
  settingsList: [],
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async () => {
  const res = await fetch('/api/settings');
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const setSetting = createAsyncThunk('settings/setSetting', async ({ key, value, type }: { key: string; value: string; type?: string }) => {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, type: type || 'text' }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
});

export const deleteSetting = createAsyncThunk('settings/deleteSetting', async (key: string) => {
  const res = await fetch(`/api/settings?key=${key}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return key;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLocalSetting(state, action: { payload: { key: string; value: string } }) {
      state.settings[action.payload.key] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settingsList = action.payload;
        const map: Record<string, string> = {};
        action.payload.forEach((s: Setting) => {
          map[s.key] = s.value;
        });
        state.settings = map;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(setSetting.fulfilled, (state, action) => {
        state.settings[action.payload.key] = action.payload.value;
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        delete state.settings[action.payload];
        state.settingsList = state.settingsList.filter(s => s.key !== action.payload);
      });
  },
});

export const { setLocalSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
