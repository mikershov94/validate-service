import { MantineProvider } from '@mantine/core';
import { MainPage } from '@pages';

function App() {
    return (
        <MantineProvider>
            <MainPage />
        </MantineProvider>
    );
}

export { App };
