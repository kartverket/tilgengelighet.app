import React from 'react';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {Button, Card, CardContent, useMediaQuery} from "@material-ui/core";
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles({
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0px 5px 11px 0px rgba(50, 50, 50, 0.75)',
    zIndex: 500,
    width: 300
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },
  title: {
    fontFamily: 'arial',
    fontWeight: 500,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1.472,
    padding: '10px 0'
  },
  subtitle: {
    fontFamily: 'arial',
    fontWeight: 400,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1.472,
  },
  content: {
    fontFamily: 'arial',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 0.25,
    padding: '0px 10px 0px 10px'
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  confirm: {
    backgroundColor: '#1A589F',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#13437a'
    }
  },
  cancel: {
    '&:hover' : {
      backgroundColor: '#bcbcbc'
    }
  }
});

export default function ConfirmDownloadCard (props) {
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card classes={{root: classes.card}}>
      <CardContent classes={{root: classes.cardContent}}>
        <h1 className={classes.title}>Du valgte <b>{props.totalTiles}</b> kart bilder</h1>
        <p className={classes.content}>Maksimal grense er 100 000 kartbilder om gangen.</p>
        <p className={classes.content}>Zoom lenger inn for å velge et mindre område og prøv igjen.</p>
        <div className={classes.flexContainer}>
        {/*<Button*/}
        {/*  classes={{root: classes.cancel}}*/}
        {/*  variant="contained"*/}
        {/*  startIcon={< CloseIcon/>}*/}
        {/*  onClick={props.cancel}*/}
        {/*>*/}
        {/*  Avbryt*/}
        {/*</Button>*/}
          <Button
            classes={{root: classes.confirm}}
            variant="contained"
            startIcon={< CheckIcon/>}
            onClick={props.confirm}
          >
            Skjønner
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
