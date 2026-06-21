import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
    title: 'shared/Button',
    component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Запустить',
    },
};

export const Disabled: Story = {
    args: {
        children: 'Запустить',
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        children: 'Запустить',
        loading: true,
    },
};

export const Cancel: Story = {
    args: {
        children: 'Отменить',
    },
};
