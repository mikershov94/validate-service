import { type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@app/store';

import { JobList } from '@widgets/JobList';
import { JobDetailsPanel, useCancelJobMutation, useJobsList } from '@entities/job';
import { selectJob } from '@entities/job';
import { CreateJobForm } from '@features/create-job';

import styles from './MainPage.module.scss';
import { apiErrors } from '@shared';

export const MainPage: FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const selectedJobId = useSelector((state: RootState) => state.jobs.selectedJobId);

    const { data: jobs = [], isLoading, startPolling } = useJobsList();

    const [cancelJob] = useCancelJobMutation();

    const handleCancelJob = async (jobId: string) => {
        startPolling();

        try {
            await cancelJob(jobId).unwrap();
        } catch {
            console.error(apiErrors.DELETE_JOB_ERROR);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.column}>
                <div className={styles.stack}>
                    <CreateJobForm />
                    <JobList
                        jobs={jobs}
                        selectedJobId={selectedJobId ?? undefined}
                        isLoading={isLoading}
                        onSelectJob={(jobId) => dispatch(selectJob(jobId))}
                        onCancelJob={handleCancelJob}
                    />
                </div>
            </div>
            <div className={styles.column}>
                <JobDetailsPanel jobs={jobs} />
            </div>
        </div>
    );
};
