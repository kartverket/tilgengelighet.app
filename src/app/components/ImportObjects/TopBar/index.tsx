import {AppBar, Toolbar, IconButton, Divider, useMediaQuery} from '@material-ui/core';
import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CloseIcon from '@material-ui/icons/Close';

import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    contentContainer: {

    },
    title: {
      fontFamily: 'Meta',
      fontWeight: 400,
      fontSize: '20px',
      color: 'rgba(0, 0, 0, 0.87)',
      marginTop: '10px',
      textAlign: 'start',
      left: 0,
    },
    icon: {
      color: 'rgb(29, 29, 29)',
        fontSize: 14,
      padding: '10px 10px',
    },
    appBar: {
      backgroundColor: '#FFF',
      overflowX: 'hidden',
      overflowY: 'auto',
      top: 0,
      [theme.breakpoints.up('md')]: {
        backgroundColor: 'rgb(245, 245, 245)',
      },
    },
  }),
);

interface Props {
  isPop?: boolean;
  title: string;
  onPop: () => void;
  greyBackground?: boolean;
}
export function TopBar (props: Props) {
  const classes = useStyles();

  // isPop equals TRUE show backbutton else close button
  const isPop: boolean = props.isPop ?? true;
  const theme = useTheme();

  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));


  let navButton = (
    <IconButton className={classes.icon} onClick={props.onPop}>
      {isPop ? <ArrowBackIcon /> : <CloseIcon />}
    </IconButton>
  );

  let divider;

  if (isPop === false) divider = <Divider></Divider>;

  return (
    <>
      <AppBar
        // No solution found for fixed appBar in big screen view
        position="sticky"
        className={classes.appBar}
        //elevation={isPop === false ? 0 : 3}
      >
        <Toolbar className={classes.contentContainer} style={{justifyContent: "start", backgroundColor: props.greyBackground ? "#F5F5F5" : 'white'}}>
            {isPop ? navButton : null}
          <h1 style={!isPop ? {flex: 1, } : {marginLeft: '30px', }} className={classes.title}>
            {props.title}
          </h1>
          {!isPop ? <div>{navButton}</div> : null}
        </Toolbar>
      </AppBar>
      {divider}
      {/*{smallScreen ? <div style={{height: "64px"}}></div> : null}*/}

    </>
  );
}
