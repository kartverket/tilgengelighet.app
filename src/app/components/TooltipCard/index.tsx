import React, {useState} from 'react';
import {Button, Card, CardContent, makeStyles} from '@material-ui/core';
import {tooltip} from 'leaflet';

const useStyles = makeStyles({
  card: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translate(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    width: 328,
    boxShadow: '0px 5px 11px 0px rgba(50, 50, 50, 0.75)',
    zIndex: 500,
  },
  title: {
    fontFamily: 'arial',
    fontWeight: 700,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1.472,
  },
  content: {
    fontFamily: 'arial',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.25,
  },
  button: {
    color: 'rgb(85, 196, 252)',
    float: 'right',
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1.25,
    padding: 15,
  },
});

interface TooltipProps {
  title: string;
  content: string;
  onPop?: () => void;
  isToolTip?: boolean;
}

export default function TooltipCard (props: TooltipProps) {
  const classes = useStyles();
  const [hidden, setHidden] = React.useState(false);

  const addToolTip = value => {
    let storedVals =
      JSON.parse(localStorage.getItem('ToolTips') as string) || [];
    storedVals.push({title: value});
    localStorage.setItem('ToolTips', JSON.stringify(storedVals));
    setHidden(true);
  };

  React.useEffect(() => {
    JSON.parse(localStorage.getItem('ToolTips') as string)?.map(toolTip => {
      if (toolTip.title === props.title) {
        setHidden(true);
      }
    });
    let globalHideTooltip = JSON.parse(
      localStorage.getItem('all_tooltips') as string,
    );
    if (globalHideTooltip === null) {
      localStorage.setItem('all_tooltips', JSON.stringify({hidden: false}));
    }
    if (globalHideTooltip?.hidden) {
      setHidden(true);
    }
  }, []);

  return (
    <div>
      {!hidden && (
        <Card classes={{root: classes.card}}>
          <CardContent>
            <h1 className={classes.title}>{props.title}</h1>
            <p className={classes.content}>{props.content}</p>
            <Button
              className={classes.button}
              onClick={() => {
                if (props.isToolTip != false) {
                  addToolTip(props.title);
                } else if (props.onPop != undefined) {
                  props.onPop();
                }
              }}>
              Skjønner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
