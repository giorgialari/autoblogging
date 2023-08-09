import { ChangeDetectorRef, Component } from '@angular/core';
import { NotificationService } from 'src/app/services/notifications/notifications.service';
import { Notification } from 'src/app/services/notifications/notifications-model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  notificationCount = 0;
  notifications: Notification[] = [];


  constructor(private notificationService: NotificationService) {
    this.notificationService.unreadNotifications$.subscribe((count) => {
      this.notificationCount = count;
    });

    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  onNotificationClick(index: number) {
    this.notificationService.markAsRead(index);
  }
}
