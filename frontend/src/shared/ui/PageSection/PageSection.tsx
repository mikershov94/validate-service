import { Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';

import styles from './PageSection.module.scss';

interface PageSectionProps {
    title: string;
    children: ReactNode;
}

export const PageSection: FC<PageSectionProps> = ({ title, children }) => {
    return (
        <section className={styles.section}>
            <Title order={2} className={styles.title}>
                {title}
            </Title>

            {children}
        </section>
    );
};
