import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiErrors, API_BASE_URL } from '@shared';
import type { CreateJobResponse } from '../model/types/createJobResponse';

export const createJob = createAsyncThunk<CreateJobResponse, string[]>(
    'createJob/createJob',
    async (urls) => {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ urls }),
        });

        if (!response.ok) {
            throw new Error(apiErrors.CREATE_JOB_ERROR);
        }

        return response.json() as Promise<CreateJobResponse>;
    },
);
