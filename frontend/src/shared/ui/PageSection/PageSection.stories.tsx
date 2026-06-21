import type { Meta, StoryObj } from '@storybook/react';

import { PageSection } from './PageSection';

const meta = {
    title: 'shared/PageSection',
    component: PageSection,
} satisfies Meta<typeof PageSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Список заданий',
        children: <div>Контент секции</div>,
    },
};
