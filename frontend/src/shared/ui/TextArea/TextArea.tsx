import { Textarea as MantineTextarea, type TextareaProps } from '@mantine/core';
import type { FC } from 'react';

export const TextArea: FC<TextareaProps> = (props) => {
    return <MantineTextarea {...props} />;
};
