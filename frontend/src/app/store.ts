import { configureStore } from '@reduxjs/toolkit';

import { createJobReducer } from '@features/create-job';

export const store = configureStore({
    reducer: {
        createJob: createJobReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
