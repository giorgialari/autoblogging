import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Notification } from './notifications-model';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();

  showNotification(message: string) {
    const notifications = this._notifications.getValue();
    notifications.push({ message, read: false });
    this._notifications.next(notifications);
  }


  getNotificationCount(): number {
    return this._notifications.getValue().length;
  }

  clearNotifications() {
    this._notifications.next([]);
  }
  unreadNotifications$ = this._notifications.pipe(
    map((notifications) => notifications.filter((notification) => !notification.read).length)
  );

  markAsRead(index: number) {
    const notifications = this._notifications.getValue();
    if (notifications[index]) {
      notifications[index].read = true;
      this._notifications.next(notifications);
    }
  }
}
