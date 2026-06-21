import { Badge as MantineBadge, type BadgeProps } from '@mantine/core';
import type { FC, ReactNode } from 'react';

interface Props extends BadgeProps {
    children: ReactNode;
}

export const Badge: FC<Props> = ({ children, ...props }) => {
    return <MantineBadge {...props}>{children}</MantineBadge>;
};
