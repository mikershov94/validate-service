import { TextInput as MantineTextInput, type TextInputProps } from '@mantine/core';
import type { FC } from 'react';

export const TextInput: FC<TextInputProps> = (props) => {
    return <MantineTextInput {...props} />;
};
