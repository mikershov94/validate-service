import { Table as MantineTable, type TableProps } from '@mantine/core';
import type { FC, ReactNode } from 'react';

interface Props extends TableProps {
    children: ReactNode;
}

type TableComponent = FC<Props> & {
    Thead: typeof MantineTable.Thead;
    Tbody: typeof MantineTable.Tbody;
    Tr: typeof MantineTable.Tr;
    Th: typeof MantineTable.Th;
    Td: typeof MantineTable.Td;
};

export const Table: TableComponent = ({ children, ...props }) => {
    return (
        <MantineTable striped highlightOnHover withTableBorder {...props}>
            {children}
        </MantineTable>
    );
};

Table.Thead = MantineTable.Thead;
Table.Tbody = MantineTable.Tbody;
Table.Tr = MantineTable.Tr;
Table.Th = MantineTable.Th;
Table.Td = MantineTable.Td;
