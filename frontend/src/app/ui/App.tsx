import { MantineProvider } from '@mantine/core';
import { MainPage } from '@pages';
import { StoreProvider } from '../providers/StoreProvider';

function App() {
    return (
        <StoreProvider>
            <MantineProvider>
                <MainPage />
            </MantineProvider>
        </StoreProvider>
    );
}

export { App };
