import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
    title: 'shared/Badge',
    component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
    args: {
        color: 'green',
        children: 'completed',
    },
};

export const Error: Story = {
    args: {
        color: 'red',
        children: 'failed',
    },
};
