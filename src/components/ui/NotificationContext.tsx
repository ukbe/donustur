'use client';

import React, {createContext, useContext, useState} from 'react';
import {Alert, Text, Heading} from '@aws-amplify/ui-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string) => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, title: string, message: string) => {
    const id = Math.random()
      .toString(36)
      .substring(2, 9);
    setNotifications((prev) => [...prev, {id, type, title, message}]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      clearNotification(id);
    }, 5000);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{showNotification, clearNotification}}>
      {children}

      {/* Notification container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        {notifications.map((notification) => (
          <Alert key={notification.id} variation={notification.type} isDismissible={true} onDismiss={() => clearNotification(notification.id)} className="shadow-lg">
            <Heading level={5}>{notification.title}</Heading>
            <Text>{notification.message}</Text>
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
