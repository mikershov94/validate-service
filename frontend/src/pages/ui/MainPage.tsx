import type { FC } from 'react';
import { Card } from '@shared';

import styles from './MainPage.module.scss';

export const MainPage: FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.column}>
                <div className={styles.stack}>
                    <Card title="Новое задание">Hell</Card>
                    <Card title="Список заданий">Hello</Card>
                </div>
            </div>
            <div className={styles.column}>
                <Card className={styles.details} title="Детали задания">
                    Hello
                </Card>
            </div>
        </div>
    );
};
