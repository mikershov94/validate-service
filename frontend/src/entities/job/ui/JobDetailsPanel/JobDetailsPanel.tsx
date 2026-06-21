import type { FC } from 'react';
import { type JobInfo } from '@entities/job';

import { UrlChecksTable } from '@entities/url-check';
import { apiErrors, Card, EmptyState, ErrorMessage, Loader } from '@shared';
import { JobMeta } from '../JobMeta/JobMeta';
import { useActiveJobDetails } from '../../model/hooks/useActiveJobDetails';

export interface JobDetailsPanelProps {
    jobs: JobInfo[];
}

export const JobDetailsPanel: FC<JobDetailsPanelProps> = () => {
    const { data: job, isLoading, error } = useActiveJobDetails();

    if (error) {
        return (
            <Card title="Детали задания">
                <ErrorMessage>{apiErrors.GET_JOB_DETAILS_ERROR}</ErrorMessage>;
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card title="Детали задания">
                <Loader />
            </Card>
        );
    }

    if (!job) {
        return (
            <Card title="Детали задания">
                <EmptyState
                    title="Задание не выбрано"
                    description="Выберите задание из списка слева"
                />
            </Card>
        );
    }

    return (
        <Card title="Детали задания">
            <JobMeta job={job} />
            <UrlChecksTable checks={job.urlChecks} />
        </Card>
    );
};
