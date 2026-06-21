import type { Meta, StoryObj } from '@storybook/react';

import { Table } from './Table';

const meta = {
    title: 'shared/Table',
    component: Table,
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: null,
    },
    render: () => (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>URL</Table.Th>
                    <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>https://example.com</Table.Td>
                    <Table.Td>completed</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    ),
};
