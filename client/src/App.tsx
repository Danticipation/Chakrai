import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewTherapyApp from './components/NewTherapyApp';

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NewTherapyApp />
    </QueryClientProvider>
  );
}