import React from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme, withStyles,
} from '@material-ui/core/styles';
import {
  Box, Button,
  Card,
  CardContent, CircularProgress, CircularProgressProps,
  LinearProgress,
  LinearProgressProps,
  Typography,
  useMediaQuery
} from "@material-ui/core";

const CustomProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#1A589F',
    },
  }),
)(LinearProgress);

const useStyles = makeStyles({
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0px 5px 11px 0px rgba(50, 50, 50, 0.75)',
    zIndex: 500,
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    maxWidth: 200,
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
  cancelBtn: {
    color: '#fff',
    float: 'right',
    padding: 5,
    margin: '10px 0',
    '&&:hover': {
      backgroundColor: '#ac1616',
    }
  }
});

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" style={{color: '#fff'}}>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function DownloadProgress(props: any) {
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  let MAX = props.max;
  let MIN = 0;
  const normalise = value => (value - MIN) * 100 / (MAX - MIN);


  return (
    <div>

    {!smallScreen && (
    <Card classes={{root: classes.card}}>
      <CardContent>
        <h1 className={classes.title}>Laster ned kart</h1>
        <p className={classes.content}>Vennligst ikke forlat siden før det er ferdig lastet ned.</p>
        <CustomProgress variant="determinate" value={normalise(props.value)} />
        <Button onClick={() => props.cancel()} classes={{root: classes.cancelBtn}}>Avbryt</Button>
      </CardContent>
    </Card>
  )}
      {smallScreen && (
        <Card classes={{root: classes.card}}>
          <CardContent classes={{root: classes.cardContent}}>
            <h1 className={classes.title}>Laster ned kart</h1>
            <p className={classes.content}>Ikke forlat kartet</p>
            <CircularProgressWithLabel size={60} thickness={6} value={normalise(props.value)} />
            <Button onClick={() => props.cancel()} classes={{root: classes.cancelBtn}}>Avbryt</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
