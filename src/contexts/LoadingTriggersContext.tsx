"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingTriggersContextType {
  shouldLoadProjects: boolean;
  shouldLoadCommissions: boolean;
  shouldLoadBlogs: boolean;
  triggerProjects: () => void;
  triggerCommissions: () => void;
  triggerBlogs: () => void;
  triggerAll: () => void;
}

const LoadingTriggersContext = createContext<LoadingTriggersContextType | undefined>(undefined);

export function LoadingTriggersProvider({ children }: { children: ReactNode }) {
  const [shouldLoadProjects, setShouldLoadProjects] = useState(false);
  const [shouldLoadCommissions, setShouldLoadCommissions] = useState(false);
  const [shouldLoadBlogs, setShouldLoadBlogs] = useState(false);

  const triggerProjects = () => {
    if (!shouldLoadProjects) {
      setShouldLoadProjects(true);
    }
  };

  const triggerCommissions = () => {
    if (!shouldLoadCommissions) {
      setShouldLoadCommissions(true);
    }
  };

  const triggerBlogs = () => {
    if (!shouldLoadBlogs) {
      setShouldLoadBlogs(true);
    }
  };

  const triggerAll = () => {
    triggerProjects();
    triggerCommissions();
    triggerBlogs();
  };

  return (
    <LoadingTriggersContext.Provider
      value={{
        shouldLoadProjects,
        shouldLoadCommissions,
        shouldLoadBlogs,
        triggerProjects,
        triggerCommissions,
        triggerBlogs,
        triggerAll,
      }}
    >
      {children}
    </LoadingTriggersContext.Provider>
  );
}

export function useLoadingTriggers() {
  const context = useContext(LoadingTriggersContext);
  if (context === undefined) {
    throw new Error("useLoadingTriggers must be used within LoadingTriggersProvider");
  }
  return context;
}
