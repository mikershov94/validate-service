import { Paper, Title, type PaperProps } from '@mantine/core';
import classNames from 'classnames';
import type { FC, ReactNode } from 'react';

import styles from './Card.module.scss';

interface CardProps extends PaperProps {
    className?: string;
    title?: string;
    children: ReactNode;
}

export const Card: FC<CardProps> = ({ title, children, className, ...props }) => {
    return (
        <Paper
            className={classNames(styles.card, className)}
            radius="md"
            p="lg"
            withBorder
            {...props}
        >
            {title && (
                <Title order={3} className={styles.title}>
                    {title}
                </Title>
            )}

            {children}
        </Paper>
    );
};
