import React, { Component } from 'react';

import { connect } from 'react-redux';

import { withStyles, createStyles, Theme } from "@material-ui/core";

import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import { setToken } from "../../actions/api.action";

import Cookies from "universal-cookie";

const cookies = new Cookies();

const mapStateToProps = (state: any) => {
    return { api_url: state.api_url, token: state.token };
};

function mapDispatchToProps(dispatch: any) {
    return { setToken: (token: object) => dispatch(setToken(token)) };
}

interface Props {
    api_url: string,
    history: {
        push: any
    },
    token: string,
    setToken: any,
    classes: {
        root: string,
        appBar: string,
        appBarShift: string,
        menuButton: string,
        hide: string,
        drawer: string,
        drawerPaper: string,
        drawerHeader: string,
        content: string,
        contentShift: string
    }
}

interface State {
    open: boolean,
    currentComponentIndex: number
}

interface Route {
    name: string,
    icon: any,
    component: any
};

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - 240px)`,
        marginLeft: 240,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: 240,
        flexShrink: 0,
    },
    drawerPaper: {
        width: 240,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -240,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
});

class AdministrationPanel extends Component<Props, State> {
    state: State = {
        open: false,
        currentComponentIndex: 0
    };

    componentDidMount() {
        if (!this.props.token)
            this.props.history.push('/login');
        else {
            const { token, api_url } = this.props;

            fetch (`${api_url}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then((data) => {
                const { role } = data;

                if (!role.includes('admin'))
                    this.props.history.push('/');
            })
        }
    }

    handleDrawerOpen = (e: any) => {
        this.setState({ open: true });
    }

    handleDrawerClose = (e: any) => {
        this.setState({ open: false });
    }

    onClick(index: any, event: any) {
        this.setState({ currentComponentIndex: index });
    }

    render() {
        const { classes } = this.props;
        const { open } = this.state;

        const routes: Route[] = [
            { name: 'Home', icon: <InboxIcon />, component: <div>bite</div> },
            { name: 'Users', icon: <MailIcon />, component: <div>Users</div> }
        ]
        return (
            <div className={classes.root}>
                <AppBar
                    position="fixed"
                    className={(open) ? classes.appBarShift : classes.appBar}
                >
                    <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={this.handleDrawerOpen}
                        edge="start"
                        className={(open) ? classes.hide : classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Administration Panel
                    </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={open}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div className={classes.drawerHeader}>
                    <IconButton onClick={this.handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                    </div>
                    <Divider />
                    <List>
                        {routes.map((route, index) => (
                            <ListItem button key={index} onClick={this.onClick.bind(this, index)}>
                                <ListItemIcon>{route.icon}</ListItemIcon>
                                <ListItemText primary={route.name} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <main className={(open) ? classes.contentShift : classes.content}>
                    <div className={classes.drawerHeader} />
                    {routes[this.state.currentComponentIndex].component}
                </main>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AdministrationPanel));