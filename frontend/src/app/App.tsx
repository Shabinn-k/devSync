import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '../lib/queryClient';
import { AppRoutes } from './router';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary><AppRoutes /></ErrorBoundary>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                }}
            />
        </QueryClientProvider>
    );
};

export default App;
