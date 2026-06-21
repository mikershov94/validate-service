import { useState } from 'react';

import { Button, Card, TextInput } from '@shared';

import styles from './CreateJobForm.module.scss';

export function CreateJobForm() {
    const [urls, setUrls] = useState<string[]>(['']);

    const addUrl = () => {
        setUrls((prev) => [...prev, '']);
    };

    const changeUrl = (index: number, value: string) => {
        setUrls((prev) => prev.map((url, currentIndex) => (currentIndex === index ? value : url)));
    };

    const removeUrl = (index: number) => {
        setUrls((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const submit = () => {
        urls.map((url) => url.trim()).filter(Boolean);
    };

    return (
        <Card title="Новое задание">
            <label>URL's</label>
            {urls.map((url, index) => (
                <div key={index} className={styles.row}>
                    <TextInput
                        className={styles.textInput}
                        placeholder="https://example.com"
                        value={url}
                        onChange={(event) => changeUrl(index, event.currentTarget.value)}
                    />

                    {urls.length > 1 && (
                        <Button variant="subtle" color="red" onClick={() => removeUrl(index)}>
                            Удалить
                        </Button>
                    )}
                </div>
            ))}

            <div className={styles.btns}>
                <Button variant="light" onClick={addUrl}>
                    + URL
                </Button>

                <Button onClick={submit}>Создать</Button>
            </div>
        </Card>
    );
}
