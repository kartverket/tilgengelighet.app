import React, { useState } from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import { Link, Switch } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: '10px 10px 0px 0px',
      borderRadius: '15px',
      backgroundColor: 'rgb(255, 255, 255)',
      boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.14)',
      padding: '4px 5px 2px 10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '30px',
    },
    text: {
      fontFamily: 'Arial',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.25px',
      color: 'rgba(0, 0, 0, 0.87)',
      margin: 0,
      textTransform: 'none',
      userSelect: 'none',
      textDecoration: 'none',
    },
    icon: {
      marginLeft: '5px',
      paddingRight: '0',
    },
    selected: {
      backgroundColor: '#E6F1FC',
    },
    textSelected: {
      color: 'rgb(26, 88, 159)',
    },
  }),
);

export default function ObjectButton(props) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState(false);
  return (
    <div>
      <span className={`${classes.button} ${selected ? classes.selected : ''}`}>
        <div
          onClick={() => {
            setSelected(!selected);
          }}
        >
          <span
            className={`${classes.text} ${
              selected ? classes.textSelected : ''
            }`}
          >
            {props.text}
          </span>
          <span
            className={`${classes.text} ${classes.icon} ${
              selected ? classes.textSelected : ''
            }`}
          >
            {props.icon}
          </span>
        </div>
      </span>
    </div>
  );
}
