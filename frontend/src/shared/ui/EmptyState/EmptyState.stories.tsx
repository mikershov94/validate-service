import type { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './EmptyState';

const meta = {
    title: 'shared/EmptyState',
    component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Нет заданий',
        description: 'Создайте первую проверку URL',
    },
};
