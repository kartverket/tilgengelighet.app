import React from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  root: {
    minWidth: 275,
    fontFamily: 'Arial',
    maxWidth: '100%',
    marginBottom: '10px',
    marginTop: '15px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '15px',
    boxShadow: 'none',
    [theme.breakpoints.down('xs')]: {
      marginTop: '0px',
      marginBottom: '0px',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      borderRadius: 0,
    },
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.15,
  },
  content: {
    fontSize: 14,
    letterSpacing: 0.25,
    lineHeight: '20px',
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: '5px',
    maxWidth: '70vw',
  },
  flex: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    height: '20px',
    position: 'sticky',
    left: '95vw',
    marginTop: '3px',
    width: '100px',
    justifyContent: 'flex-end',
  },
}));

export default function NavigationCard(props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <div className={classes.flex}>
          <Typography className={classes.title}>
            <span>{props.title}</span>
          </Typography>
          <CardActions className={classes.action}>{props.action}</CardActions>
        </div>
        <Typography className={classes.content} variant="body2" component="p">
          {props.content}
        </Typography>
      </CardContent>
    </Card>
  );
}
