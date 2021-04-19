import React, { useState } from 'react';
import { createStyles, makeStyles, withStyles } from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Button from '@material-ui/core/Button';
import { ToggleButtonGroup } from '@material-ui/lab';
import ToggleButton from '@material-ui/lab/ToggleButton';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import InfoPaper from '../InfoPaper';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles(() =>
  createStyles({
    divider: {
      width: '30px',
      border: '2px solid rgb(158, 158, 158)',
      borderRadius: '2px',
    },
    rowContainer: {
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
    },
    header: {
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: '16px',
      letterSpacing: '0.15px',
      lineHeight: '24px',
      color: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      fontFamily: 'Arial',
      fontSize: '12px',
      letterSpacing: '0.4px',
      lineHeight: '16px',
      color: 'rgb(26, 88, 159)',
      float: 'right',
      textTransform: 'none',
    },
    icon: {
      fontSize: '12px',
      marginRight: '3px',
    },
  }),
);

const StyledToggleButton = withStyles({
  root: {
    fontFamily: 'Arial',
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '15px 15px',
    textTransform: 'none',
    width: '100%',
    '&$selected': {
      backgroundColor: 'rgba(33, 137, 214, 0.14)',
      color: 'rgb(26, 88, 159)',
      '&:hover': {
        backgroundColor: 'rgba(33, 137, 214, 0.14)',
        color: 'rgb(26, 88, 159)',
      },
    },
  },
  selected: {},
})(ToggleButton);

const StyledGroupButton = withStyles({
  root: {
    padding: '15px 15px',
    width: '100%',
  },
})(ToggleButtonGroup);

export default function ObjectViewCard(props) {
  const classes = useStyles();

  const { t } = useTranslation();

  const [alignment, setAlignment] = React.useState(() =>
    props.registerChosen == true ? 'left' : 'right',
  );

  const [showLegend, setShowLegend] = useState<boolean>(false);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setAlignment(newAlignment);
    props.onChange();
  };

  const children = [
    <StyledToggleButton key={1} value="left">
      {props.leftButtonContent}
    </StyledToggleButton>,
    <StyledToggleButton key={2} value="right">
      {props.rightButtonContent}
    </StyledToggleButton>,
  ];

  if (showLegend == true) {
    return (
      <div style={{ paddingBottom: '20px' }}>
        <InfoPaper
          registerChosen={props.registerChosen}
          setShowInfoStatus={setShowLegend}
          center={true}
        />
      </div>
    );
  } else {
    return (
      <SwipeableBottomSheet
        overflowHeight={30}
        overlay={false}
        topShadow={false}
        defaultOpen={true}>
        <div style={{ height: '142px' }}>
          <Card>
            <hr className={classes.divider} />
            <div className={`row ${classes.rowContainer}`}>
              <div className="col-6">
                <span className={classes.header}>
                  {t(translations.chooseView)}
                </span>
              </div>
              <div className="col-6">
                <Button
                  className={classes.info}
                  onClick={() => setShowLegend(true)}>
                  <InfoOutlinedIcon className={classes.icon} />
                  {t(translations.mapPage.info)}
                </Button>
              </div>
            </div>
            <StyledGroupButton
              value={alignment}
              exclusive
              onChange={handleChange}>
              {children}
            </StyledGroupButton>
          </Card>
        </div>
      </SwipeableBottomSheet>
    );
  }
}
