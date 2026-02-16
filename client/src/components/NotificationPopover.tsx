import { useState, useEffect } from 'react';
import {
    Popover,
    List,
    ListItem,
    ListItemText,
    Typography,
    IconButton,
    Badge,
    Box,
    Divider,
    CircularProgress
} from '@mui/material';
import { Notifications as NotificationsIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { notificationService } from '../services/index';
import { formatDistanceToNow } from 'date-fns';

const styles = {
    popoverPaper: { width: 360, maxHeight: 400, overflow: 'auto' },
    header: { p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    loadingContainer: { p: 2, textAlign: 'center' },
    list: { p: 0 },
    noNotificationsText: { textAlign: 'center', color: 'text.secondary' },
    listItem: (isRead: boolean) => ({
        bgcolor: isRead ? 'transparent' : 'action.hover',
        cursor: 'pointer'
    }),
    notificationPrimary: (isRead: boolean) => ({
        variant: 'body2',
        fontWeight: isRead ? 'normal' : 'bold'
    }),
    notificationSecondary: { variant: 'caption' }
};

export default function NotificationPopover() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getNotifications();
            const news = res.data.notifications || [];
            setNotifications(news);
            setUnreadCount(news.filter((n: any) => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            fetchData();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchData();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: styles.popoverPaper
                }}
            >
                <Box sx={styles.header}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <IconButton size="small" onClick={handleMarkAllRead} title="Mark all as read">
                            <DoneAllIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <Divider />

                {loading && notifications.length === 0 ? (
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <List sx={styles.list}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No notifications" sx={styles.noNotificationsText} />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => (
                                <ListItem
                                    key={notification._id}
                                    divider
                                    sx={styles.listItem(notification.isRead)}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                >
                                    <ListItemText
                                        primary={notification.message}
                                        secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        primaryTypographyProps={styles.notificationPrimary(notification.isRead) as any}
                                        secondaryTypographyProps={styles.notificationSecondary as any}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                )}
            </Popover>
        </>
    );
}
