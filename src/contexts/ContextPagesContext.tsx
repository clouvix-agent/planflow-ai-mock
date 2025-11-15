import { createContext, useContext, useState, ReactNode } from 'react';

export interface SelectedContextPage {
  id: string;
  title: string;
}

interface ContextPagesContextType {
  selectedContextPages: SelectedContextPage[];
  togglePageSelection: (page: SelectedContextPage) => void;
  isPageSelected: (pageId: string) => boolean;
}

const ContextPagesContext = createContext<ContextPagesContextType | undefined>(undefined);

export function ContextPagesProvider({ children }: { children: ReactNode }) {
  const [selectedContextPages, setSelectedContextPages] = useState<SelectedContextPage[]>([]);

  const togglePageSelection = (page: SelectedContextPage) => {
    setSelectedContextPages(prev => {
      const isAlreadySelected = prev.some(p => p.id === page.id);
      if (isAlreadySelected) {
        return prev.filter(p => p.id !== page.id);
      } else {
        return [...prev, page];
      }
    });
  };

  const isPageSelected = (pageId: string) => {
    return selectedContextPages.some(p => p.id === pageId);
  };

  return (
    <ContextPagesContext.Provider value={{ selectedContextPages, togglePageSelection, isPageSelected }}>
      {children}
    </ContextPagesContext.Provider>
  );
}

export function useContextPages() {
  const context = useContext(ContextPagesContext);
  if (!context) {
    throw new Error('useContextPages must be used within ContextPagesProvider');
  }
  return context;
}
