import React, { createContext, useContext, useEffect } from 'react';

interface RTLContextType {
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
}

const RTLContext = createContext<RTLContextType>({
  direction: 'rtl',
  isRTL: true,
});

export const useRTL = () => useContext(RTLContext);

interface RTLProviderProps {
  children: React.ReactNode;
  direction?: 'rtl' | 'ltr';
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ 
  children, 
  direction = 'rtl' 
}) => {
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'he' : 'en';
  }, [direction]);

  const value = {
    direction,
    isRTL: direction === 'rtl',
  };

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
};