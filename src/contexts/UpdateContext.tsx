'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UpdateContextType {
  shouldUpdateResumen: boolean;
  shouldUpdatePedidos: boolean;
  shouldUpdateBitacora: boolean;
  triggerUpdate: (page: 'resumen' | 'pedidos' | 'bitacora' | 'all') => void;
  markUpdated: (page: 'resumen' | 'pedidos' | 'bitacora') => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};

interface UpdateProviderProps {
  children: ReactNode;
}

export const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
  const [shouldUpdateResumen, setShouldUpdateResumen] = useState(false);
  const [shouldUpdatePedidos, setShouldUpdatePedidos] = useState(false);
  const [shouldUpdateBitacora, setShouldUpdateBitacora] = useState(false);

  const triggerUpdate = (page: 'resumen' | 'pedidos' | 'bitacora' | 'all') => {
    if (page === 'all') {
      setShouldUpdateResumen(true);
      setShouldUpdatePedidos(true);
      setShouldUpdateBitacora(true);
    } else if (page === 'resumen') {
      setShouldUpdateResumen(true);
    } else if (page === 'pedidos') {
      setShouldUpdatePedidos(true);
    } else if (page === 'bitacora') {
      setShouldUpdateBitacora(true);
    }
  };

  const markUpdated = (page: 'resumen' | 'pedidos' | 'bitacora') => {
    if (page === 'resumen') {
      setShouldUpdateResumen(false);
    } else if (page === 'pedidos') {
      setShouldUpdatePedidos(false);
    } else if (page === 'bitacora') {
      setShouldUpdateBitacora(false);
    }
  };

  const value: UpdateContextType = {
    shouldUpdateResumen,
    shouldUpdatePedidos,
    shouldUpdateBitacora,
    triggerUpdate,
    markUpdated,
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
}; 