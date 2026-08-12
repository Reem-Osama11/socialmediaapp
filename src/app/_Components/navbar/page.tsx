"use client";

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileData } from '../../../lib/profileslce';
import {
    getUnreadNotificationsCount,
    markAllNotificationsAsRead,
} from '../../../lib/notifiactionslice';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navLinks = [
    { label: 'Posts', href: '/posts', icon: <HomeRoundedIcon fontSize="small" /> },
    { label: 'Profile', href: '/profile', icon: <HomeRoundedIcon fontSize="small" /> }
];

// how often to re-check the unread notifications count in the background
// (there's no socket/live push here, so this is what keeps the badge fresh
// after someone likes/comments on your stuff while you're browsing)
const UNREAD_POLL_INTERVAL_MS = 30000;

function Navbar() {
    const dispatch = useDispatch<any>();
    const router = useRouter();

    // reducer is registered under the key "photos" in the store (reducer: { photos: profileReducer })
    const { profileData } = useSelector((state: any) => state.photos);

    // reducer is registered under the key "notifications" in the store
    const { unreadCount, isMarkingAllRead } = useSelector(
        (state: any) => state.notifications
    );

    // number of people the current user is following, shown as a badge on the icon below
    const followingCount = Array.isArray(profileData?.following)
        ? profileData.following.length
        : 0;

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = React.useState<null | HTMLElement>(null);

    // fetch profile data when the Navbar mounts (if not already loaded)
    React.useEffect(() => {
        if (!profileData) {
            dispatch(getProfileData());
        }
    }, [dispatch, profileData]);

    // fetch the unread notifications count on mount, then keep polling it
    // periodically so the badge updates on its own (e.g. after a like/comment)
    React.useEffect(() => {
        dispatch(getUnreadNotificationsCount());

        const intervalId = setInterval(() => {
            dispatch(getUnreadNotificationsCount());
        }, UNREAD_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [dispatch]);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNotifications(event.currentTarget);
        // refresh the count right when the menu opens, in case it's stale
        dispatch(getUnreadNotificationsCount());
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseNotifications = () => {
        setAnchorElNotifications(null);
    };

    function handleMarkAllRead() {
        dispatch(markAllNotificationsAsRead());
    }

    function logout() {
        handleCloseUserMenu();
        localStorage.removeItem("token");
        router.push("/login");
    }

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: 'linear-gradient(90deg, #6D28D9 0%, #9333EA 45%, #DB2777 100%)',
                boxShadow: '0 4px 20px rgba(109, 40, 217, 0.25)',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: 72 }}>

                    {/* Logo - desktop */}
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 4,
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            fontFamily: '"Poppins", "Segoe UI", sans-serif',
                            fontWeight: 800,
                            letterSpacing: '.05rem',
                            fontSize: '1.5rem',
                            color: '#fff',
                            textDecoration: 'none',
                            '&:hover': { opacity: 0.9 },
                        }}
                    >
                        ✨ SocialApp
                    </Typography>

                    {/* Mobile menu button */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            sx={{
                                color: '#fff',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                '& .MuiPaper-root': {
                                    borderRadius: 3,
                                    mt: 1,
                                    minWidth: 180,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            {navLinks.map((link) => (
                                <MenuItem
                                    key={link.href}
                                    component={Link}
                                    href={link.href}
                                    onClick={handleCloseNavMenu}
                                    sx={{ gap: 1.2, py: 1.2 }}
                                >
                                    {link.icon}
                                    <Typography>{link.label}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Logo - mobile */}
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: '"Poppins", "Segoe UI", sans-serif',
                            fontWeight: 800,
                            letterSpacing: '.05rem',
                            color: '#fff',
                            textDecoration: 'none',
                        }}
                    >
                        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                            ✨ SocialApp
                        </Link>
                    </Typography>

                    {/* Nav links - desktop */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {navLinks.map((link) => (
                            <Button
                                key={link.href}
                                component={Link}
                                href={link.href}
                                onClick={handleCloseNavMenu}
                                startIcon={link.icon}
                                sx={{
                                    my: 1,
                                    px: 2,
                                    color: '#fff',
                                    fontWeight: 600,
                                    borderRadius: 999,
                                    textTransform: 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        transform: 'translateY(-1px)',
                                    },
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Box>

                    {/* Right side: notifications + following count + user menu */}
                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1.5, marginInlineStart: 'auto' }}>

                        {/* Notifications bell */}
                        <Tooltip title="Notifications">
                            <IconButton
                                onClick={handleOpenNotifications}
                                sx={{
                                    color: '#fff',
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.22)',
                                        transform: 'translateY(-1px)',
                                    },
                                }}
                            >
                                <Badge
                                    badgeContent={unreadCount}
                                    max={99}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            bgcolor: '#DB2777',
                                            color: '#fff',
                                            fontWeight: 700,
                                        },
                                    }}
                                >
                                    <NotificationsRoundedIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorElNotifications}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElNotifications)}
                            onClose={handleCloseNotifications}
                            sx={{
                                mt: '48px',
                                '& .MuiPaper-root': {
                                    borderRadius: 3,
                                    minWidth: 260,
                                    boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
                                    overflow: 'hidden',
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography sx={{ fontWeight: 800, color: '#4C1D95' }}>
                                    Notifications
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {unreadCount > 0
                                        ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                                        : "You're all caught up"}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem
                                onClick={() => {
                                    handleMarkAllRead();
                                    handleCloseNotifications();
                                }}
                                disabled={isMarkingAllRead || unreadCount === 0}
                                sx={{ py: 1.3, gap: 1 }}
                            >
                                <ListItemIcon>
                                    {isMarkingAllRead ? (
                                        <CircularProgress size={18} sx={{ color: '#6D28D9' }} />
                                    ) : (
                                        <DoneAllRoundedIcon fontSize="small" sx={{ color: '#6D28D9' }} />
                                    )}
                                </ListItemIcon>
                                <Typography sx={{ fontWeight: 600 }}>
                                    Mark all as read
                                </Typography>
                            </MenuItem>
                        </Menu>

                        {/* Following count icon with badge */}
                        <Tooltip title={`Following ${followingCount} ${followingCount === 1 ? 'person' : 'people'}`}>
                            <IconButton
                                component={Link}
                                href="/profile"
                                sx={{
                                    color: '#fff',
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.22)',
                                        transform: 'translateY(-1px)',
                                    },
                                }}
                            >
                                <Badge
                                    badgeContent={followingCount}
                                    max={99}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            bgcolor: '#FBBF24',
                                            color: '#4C1D95',
                                            fontWeight: 700,
                                        },
                                    }}
                                >
                                    <PeopleAltRoundedIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Settings">
                            <IconButton
                                onClick={handleOpenUserMenu}
                                sx={{
                                    p: '3px',
                                    border: '2px solid rgba(255,255,255,0.6)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: '#fff',
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            >
                                {/* profile photo shown here */}
                                <Avatar
                                    alt={profileData?.name || "User"}
                                    src={profileData?.photo || ""}
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        bgcolor: '#FBBF24',
                                        color: '#4C1D95',
                                        fontWeight: 700,
                                    }}
                                >
                                    {/* fallback: show first letter of the name if there's no photo */}
                                    {profileData?.name?.[0] || "U"}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{
                                mt: '48px',
                                '& .MuiPaper-root': {
                                    borderRadius: 3,
                                    minWidth: 190,
                                    boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
                                    overflow: 'hidden',
                                },
                            }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem
                                onClick={logout}
                                sx={{
                                    py: 1.3,
                                    '&:hover': { bgcolor: 'rgba(219, 39, 119, 0.08)' },
                                }}
                            >
                                <Typography sx={{ textAlign: 'center', width: '100%', fontWeight: 600, color: '#DB2777' }}>
                                    Logout
                                </Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem
                                component={Link}
                                href="/login"
                                onClick={handleCloseUserMenu}
                                sx={{ py: 1.3, '&:hover': { bgcolor: 'rgba(109, 40, 217, 0.08)' } }}
                            >
                                <Typography sx={{ textAlign: 'center', width: '100%', fontWeight: 500 }}>
                                    Login
                                </Typography>
                            </MenuItem>
                            <MenuItem
                                component={Link}
                                href="/register"
                                onClick={handleCloseUserMenu}
                                sx={{ py: 1.3, '&:hover': { bgcolor: 'rgba(109, 40, 217, 0.08)' } }}
                            >
                                <Typography sx={{ textAlign: 'center', width: '100%', fontWeight: 500 }}>
                                    Sign Up
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Navbar;