import {
  Button,
  createStyles,
  makeStyles,
  Paper,
  TextField,
} from '@material-ui/core';
import React, { useState } from 'react';
import PrimaryButton from '../PrimaryButton';

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      '&$focusedLabel': {
        color: 'rgb(26, 88, 159)',
      },
      '&$erroredLabel': {
        color: 'orange',
      },
    },
    focusedLabel: {},
    erroredLabel: {},
    underline: {
      '&$error:after': {
        borderBottomColor: 'orange',
      },
      '&:after': {
        borderBottomColor: `rgb(26, 88, 159)`,
      },
    },
    error: {},
    button: {
      height: '36px',
      color: 'white',
      width: '106px',
      fontSize: '14px',
      letterSpacing: '1.55px',
      fontFamily: 'Arial',
      textTransform: 'none',
      lineHeight: '16px',
      fontWeight: 'bold',
      backgroundColor: '#1A589F',
      '&:hover': {
        backgroundColor: '#1A589F',
      },
    },
  }),
);

export interface AddFavoriteFilterProps {
  onSave: (name: string) => void;
}

export default function AddFavoriteFilter(props: AddFavoriteFilterProps) {
  const classes = useStyles();

  const [value, setValue] = useState<string>('');

  const [error, setError] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  const onChange = event => {
    const value = event.target.value;

    if (error) {
      setError(false);
    }

    if (errorMsg != undefined) {
      setErrorMsg(undefined);
    }

    setValue(value);
  };

  const onSave = () => {
    if (value.trim() != '' && value != undefined) {
      props.onSave(value);
    } else {
      setError(true);
      setErrorMsg('Navn må fylles inn');
    }
  };

  return (
    <Paper
      elevation={10}
      style={{ position: 'fixed', zIndex: 300, width: '332px' }}>
      <div style={{ padding: '20px 20px' }}>
        <TextField
          autoFocus={true}
          fullWidth
          variant={'filled'}
          id={name}
          label={'Gi favorittfilteret et navn'}
          type={'text'}
          required={true}
          error={error}
          helperText={errorMsg}
          InputLabelProps={{
            classes: {
              root: classes.label,
              focused: classes.focusedLabel,
            },
          }}
          InputProps={{
            classes: {
              root: classes.underline,
            },
          }}
          value={value}
          onChange={event => onChange(event)}
        />
      </div>
      <div
        style={{
          paddingLeft: '20px',
          paddingBottom: '20px',
        }}>
        <Button className={classes.button} onClick={() => onSave()}>
          Lagre
        </Button>
      </div>
    </Paper>
  );
}
