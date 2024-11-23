import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import TodoApp from "./Todo";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <TodoApp />
      </div>
    </QueryClientProvider>
  );
};

export default App;
