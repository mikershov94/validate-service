import type { FC } from 'react';
import {
    TextInput as MantineTextInput,
    type TextInputProps as MantineTextInputProps,
} from '@mantine/core';

interface TextInputProps extends MantineTextInputProps {
    className?: string;
}

export const TextInput: FC<TextInputProps> = (props) => {
    return <MantineTextInput {...props} />;
};
