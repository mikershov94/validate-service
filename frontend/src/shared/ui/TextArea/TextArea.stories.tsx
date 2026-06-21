import type { Meta, StoryObj } from '@storybook/react';
import { TextArea } from './TextArea';

const meta = {
    title: 'shared/Textarea',
    component: TextArea,
} satisfies Meta<typeof TextArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'URLs',
        placeholder: 'https://site1.com\nhttps://site2.com',
    },
};
