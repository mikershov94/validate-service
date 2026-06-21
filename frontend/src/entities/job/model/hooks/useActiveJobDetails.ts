import type { RootState } from '@app/store';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import { UrlCheckStatus } from '@entities/url-check';
import { POLLING_INTERVAL_MS, useGetJobDetailsQuery } from '../../api';
import { useSelector } from 'react-redux';

export function useActiveJobDetails() {
    const selectedJobId = useSelector((state: RootState) => state.jobs.selectedJobId);

    const [pollingInterval, setPollingInterval] = useState(POLLING_INTERVAL_MS);

    const query = useGetJobDetailsQuery(selectedJobId ?? skipToken, {
        pollingInterval,
        skipPollingIfUnfocused: true,
    });

    useEffect(() => {
        if (!selectedJobId) {
            setPollingInterval(0);
            return;
        }

        const hasActiveUrlChecks = query.data?.urlChecks.some(
            (check) =>
                check.status === UrlCheckStatus.pending ||
                check.status === UrlCheckStatus.inProgress,
        );

        setPollingInterval(hasActiveUrlChecks ? POLLING_INTERVAL_MS : 0);
    }, [selectedJobId, query.data]);

    return query;
}
