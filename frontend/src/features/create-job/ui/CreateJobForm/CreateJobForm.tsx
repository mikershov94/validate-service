import type { AppDispatch } from '@app/store';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, ErrorMessage, TextInput } from '@shared';
import { createJob } from '../../api/createJobApi';
import { getCreateJobState } from '../../model/selectors';
import { addUrl, changeUrl, removeUrl } from '../../model/slices/createJobSlice';

import styles from './CreateJobForm.module.scss';

export function CreateJobForm() {
    const dispatch = useDispatch<AppDispatch>();

    const { urls, isLoading, error } = useSelector(getCreateJobState);

    const handleSubmit = () => {
        const filteredUrls = urls.map((url) => url.trim()).filter(Boolean);

        if (filteredUrls.length === 0) {
            return;
        }

        void dispatch(createJob(filteredUrls));
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
                        onChange={(event) =>
                            dispatch(
                                changeUrl({
                                    index,
                                    value: event.currentTarget.value,
                                }),
                            )
                        }
                    />

                    {urls.length > 1 && (
                        <Button
                            variant="subtle"
                            color="red"
                            onClick={() => dispatch(removeUrl(index))}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ))}

            <div className={styles.btns}>
                <Button variant="light" onClick={() => dispatch(addUrl())}>
                    + URL
                </Button>

                <Button loading={isLoading} onClick={handleSubmit}>
                    Создать
                </Button>
            </div>

            {error && <ErrorMessage>{error}</ErrorMessage>}
        </Card>
    );
}
