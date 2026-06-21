import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '@mantine/core';

import { Card } from './Card';

const meta = {
    title: 'shared/Card',
    component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Новая проверка',
        children: <Text>Контент карточки</Text>,
    },
};
