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
                    sx: { width: 360, maxHeight: 400, overflow: 'auto' }
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <IconButton size="small" onClick={handleMarkAllRead} title="Mark all as read">
                            <DoneAllIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
                <Divider />

                {loading && notifications.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No notifications" sx={{ textAlign: 'center', color: 'text.secondary' }} />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => (
                                <ListItem
                                    key={notification._id}
                                    divider
                                    sx={{
                                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                >
                                    <ListItemText
                                        primary={notification.message}
                                        secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: notification.isRead ? 'normal' : 'bold'
                                        }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
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
