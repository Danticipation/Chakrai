import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfessionalApp from './components/ProfessionalApp';

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ProfessionalApp />
    </QueryClientProvider>
  );
}