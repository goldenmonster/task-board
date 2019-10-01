// Copyright (c) 2019 Shellyl_N and Authors
// license: ISC
// https://github.com/shellyln

import React,
       { useEffect,
         useRef }           from 'react';
import { connect }          from 'react-redux';
import { Route,
         Switch }           from "react-router-dom";
import CssBaseline          from '@material-ui/core/CssBaseline';
import { makeStyles }       from '@material-ui/core/styles';
import { ThemeProvider }    from '@material-ui/styles';
import clsx                 from 'clsx';
import { AppEventsState }   from './types';
import { restartSync }      from './lib/db';
import { theme }            from './lib/theme';
import { mapDispatchToProps,
         mapStateToProps,
         AppEventsActions } from './dispatchers/AppEventsDispatcher';
import AppDrawer            from './components/AppDrawer';
import KanbanBoardView      from './views/KanbanBoardView';
import CalendarView         from './views/CalendarView';
import EditorView           from './views/EditorView';
import SettingsView         from './views/SettingsView';
import ConfirmDialog        from './components/ConfirmDialog';



type AppProps = AppEventsState & AppEventsActions;


const useStyles = makeStyles(theme => ({
    app: {
        display: 'flex',
    },
}));


// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef() as React.MutableRefObject<any>;

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);

            // Clean up the timer when unmount or before re-calling.
            return () => clearInterval(id);
        }

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [delay]);
}


const App: React.FC<AppProps> = (props) => {
    const classes = useStyles();

    useInterval(
        () => {
            if (props.appConfig) {
                console.log('periodic timer:' + new Date());
                restartSync()
                .then(() => {
                    props.refreshActiveBoard();
                })
                .catch(err => {
                    console.log(err.message);
                });
            }
        },
        props.appConfig && props.appConfig.display &&
            props.appConfig.display.autoUpdate ?
                (props.appConfig.display.autoUpdateInterval || 2419200) * 1000 :
                null
    );

    return (
        <div className={clsx(classes.app)}>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <AppDrawer />
                <Switch>
                    <Route path="/" exact component={KanbanBoardView} />
                    <Route path="/kanban/:id?" component={KanbanBoardView} />
                    <Route path="/calendar/:id?" component={CalendarView} />
                    <Route path="/edit/:id?" component={EditorView} />
                    <Route path="/config/" component={SettingsView} />
                </Switch>
                {props.alertDialog.open ?
                    <ConfirmDialog {...props.alertDialog} /> :
                    <></>
                }
            </ThemeProvider>
        </div>
    );
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
