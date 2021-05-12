import React, { HTMLProps } from 'react';
import { IconButton } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Img from 'app/components/Img';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

interface ComponentProps extends HTMLProps<'button'> {
  choice: any;
  handleClick: any;
  selected: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& span': {
        fontSize: '12px',
      },
      maxWidth: '69px',
      textAlign: 'center',
      flex: 1,
      height: '100px',
      '&:not(:last-child)': {
        marginRight: '30px',
      },
      '&.selected span': {
        color: '#1A589F',
      },
      '&.selected .MuiIconButton-label': {
        border: '3px solid #1A589F',
        borderRadius: '6px',
      },
      '& .MuiIconButton-label': {
        border: '3px solid transparent',
        borderRadius: '6px',
      },
    },
      selected: {
          border: '3px solid #1A589F',
          borderRadius: '6px',
      },
    button: {
      padding: 0,
      marginBottom: '10px',
    },
    selectedText: {
      color: '#1A589F',
    },
  }),
);

export default function Choice(props: ComponentProps) {
  const { t } = useTranslation();
    //fix
  const { choice, handleClick, selected } = props;

  const classes = useStyles();
  return (
      <div className={`${classes.wrapper}`}>
      <IconButton className={classes.button} onClick={() => handleClick()}>
        <Img className={`${selected ? `${classes.selected}` : ''}`} src={choice.image}></Img>
      </IconButton>
      {/*{t(translations.select)}*/}
      <p className={`${selected ? classes.selectedText : ''}`} style={{fontSize: 12, fontFamily: 'Arial', margin: 0, wordBreak: 'break-word'}}>{choice.name === 'topo4' ? t(translations.mapLayers.topo4) : null}</p>
      <p className={`${selected ? classes.selectedText : ''}`} style={{fontSize: 12, fontFamily: 'Arial', margin: 0, wordBreak: 'break-word'}}>{choice.name === 'topo4gray' ? t(translations.mapLayers.topo4gray) : null}</p>
      <p className={`${selected ? classes.selectedText : ''}`} style={{fontSize: 12, fontFamily: 'Arial', margin: 0, wordBreak: 'break-word'}}>{choice.name === 'imageLayer' ? t(translations.mapLayers.imageLayer) : null}</p>
      <br />
    </div>
  );
}
