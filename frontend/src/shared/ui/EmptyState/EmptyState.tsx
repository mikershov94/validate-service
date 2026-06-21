import { Text } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import styles from './EmptyState.module.scss';

interface EmptyStateProps {
    title: string;
    description?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ title, description }) => {
    return (
        <div className={styles.root}>
            <Text fw={600}>{title}</Text>

            {description && (
                <Text size="sm" c="dimmed">
                    {description}
                </Text>
            )}
        </div>
    );
};
