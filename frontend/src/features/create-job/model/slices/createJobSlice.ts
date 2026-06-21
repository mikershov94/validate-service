import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JobId } from '@entities/job';
import { createJob } from '../../api/createJobApi';
import { apiErrors } from '@shared';

export interface CreateJobState {
    urls: string[];
    isLoading: boolean;
    error: string | null;
    createdJobId: JobId | null;
}

const initialState: CreateJobState = {
    urls: [''],
    isLoading: false,
    error: null,
    createdJobId: null,
};

const createJobSlice = createSlice({
    name: 'createJob',
    initialState,
    reducers: {
        addUrl(state) {
            state.urls.push('');
        },
        removeUrl(state, action: PayloadAction<number>) {
            state.urls = state.urls.filter((_, index) => index !== action.payload);
        },
        changeUrl(
            state,
            action: PayloadAction<{
                index: number;
                value: string;
            }>,
        ) {
            state.urls[action.payload.index] = action.payload.value;
        },
        resetForm(state) {
            state.urls = [''];
            state.error = null;
            state.createdJobId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createJob.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.createdJobId = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.createdJobId = action.payload.jobId;
                state.urls = [''];
            })
            .addCase(createJob.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? apiErrors.DEFAULT;
            });
    },
});

export const { addUrl, removeUrl, changeUrl, resetForm } = createJobSlice.actions;

export const createJobReducer = createJobSlice.reducer;
