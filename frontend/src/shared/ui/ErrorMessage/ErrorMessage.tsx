import { Alert } from '@mantine/core';
import type { FC, ReactNode } from 'react';

interface ErrorMessageProps {
    children: ReactNode;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ children }) => {
    return (
        <Alert color="red" variant="light">
            {children}
        </Alert>
    );
};
