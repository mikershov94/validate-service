import type { Meta, StoryObj } from '@storybook/react';

import { ErrorMessage } from './ErrorMessage';

const meta = {
    title: 'shared/ErrorMessage',
    component: ErrorMessage,
} satisfies Meta<typeof ErrorMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Ресурс не найден',
    },
};
