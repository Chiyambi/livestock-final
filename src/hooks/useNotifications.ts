import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default',
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (permission.granted) {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default',
      };
      
      setPermission(newPermission);
      
      if (result === 'granted') {
        toast.success('Notifications enabled successfully');
        return true;
      } else {
        toast.error('Notifications permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!permission.granted) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const sendFeedingReminder = (animalName: string, feedType: string, quantity: number) => {
    return sendNotification(
      'Feeding Reminder',
      {
        body: `Time to feed ${animalName} with ${quantity}kg of ${feedType}`,
        icon: '/favicon.ico',
        tag: `feeding-${animalName}`,
        requireInteraction: true,
      }
    );
  };

  const scheduleNotification = (
    title: string,
    message: string,
    scheduleTime: Date,
    tag?: string
  ) => {
    const now = new Date();
    const delay = scheduleTime.getTime() - now.getTime();

    if (delay <= 0) {
      // If the time has already passed, send immediately
      sendNotification(title, { body: message, tag });
      return null;
    }

    const timeoutId = window.setTimeout(() => {
      sendNotification(title, { body: message, tag });
    }, delay);

    return timeoutId;
  };

  const scheduleFeedingReminders = (schedules: Array<{
    id: string;
    animal_name: string;
    feed_type: string;
    quantity: number;
    next_feeding_date: string;
  }>) => {
    const timeoutIds: number[] = [];

    schedules.forEach(schedule => {
      const scheduleTime = new Date(schedule.next_feeding_date);
      const reminderTime = new Date(scheduleTime.getTime() - 15 * 60 * 1000); // 15 minutes before

      const timeoutId = scheduleNotification(
        'Feeding Reminder',
        `Time to feed ${schedule.animal_name} with ${schedule.quantity}kg of ${schedule.feed_type}`,
        reminderTime,
        `feeding-${schedule.id}`
      );

      if (timeoutId) {
        timeoutIds.push(timeoutId);
      }
    });

    return timeoutIds;
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    sendFeedingReminder,
    scheduleNotification,
    scheduleFeedingReminders,
    isSupported: 'Notification' in window,
  };
};