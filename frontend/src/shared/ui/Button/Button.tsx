import { type FC, type ReactNode } from 'react';
import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';

interface ButtonProps extends MantineButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: ReactNode;
}

export const Button: FC<ButtonProps> = ({ children, ...props }) => {
    return <MantineButton {...props}>{children}</MantineButton>;
};
