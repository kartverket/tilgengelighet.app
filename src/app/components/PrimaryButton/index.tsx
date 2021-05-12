import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Check from '@material-ui/icons/Check';

const ColorButton = withStyles(() => ({
  root: {
    height: '46px',
    color: 'white',
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
}))(Button);

export interface Props {
  label?: any;
  onClick: any;
  onKeyPress?: () => any;
}

export default function PrimaryButton(props: Props) {
  return (
    <ColorButton
      fullWidth
      variant="contained"
      color="primary"
      type="submit"
      onClick={props.onClick}
      onKeyPress={() => console.log("enter")}
      startIcon={<Check></Check>}
    >
      {props.label}
    </ColorButton>
  );
}
