import { Paper, Title, type PaperProps } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import styles from './Card.module.scss';

interface CardProps extends PaperProps {
    title?: string;
    children: ReactNode;
}

export const Card: FC<CardProps> = ({ title, children, ...props }) => {
    return (
        <Paper className={styles.card} radius="md" p="lg" withBorder {...props}>
            {title && (
                <Title order={3} className={styles.title}>
                    {title}
                </Title>
            )}

            {children}
        </Paper>
    );
};
