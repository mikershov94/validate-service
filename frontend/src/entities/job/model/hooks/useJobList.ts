import { useEffect, useState } from 'react';
import { POLLING_INTERVAL_MS, useGetJobsQuery } from '../../api';
import { JobStatus } from '../types/job-status';

export function useJobsList() {
    const [pollingInterval, setPollingInterval] = useState(POLLING_INTERVAL_MS);

    const query = useGetJobsQuery(undefined, {
        pollingInterval,
        skipPollingIfUnfocused: true,
    });

    useEffect(() => {
        const jobs = query.data ?? [];

        const hasActiveJobs = jobs.some(
            (job) => job.status === JobStatus.pending || job.status === JobStatus.inProgress,
        );

        setPollingInterval(hasActiveJobs ? POLLING_INTERVAL_MS : 0);
    }, [query.data]);

    return {
        ...query,
        startPolling: () => setPollingInterval(POLLING_INTERVAL_MS),
    };
}
