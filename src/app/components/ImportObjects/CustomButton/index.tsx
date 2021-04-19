import React from 'react';
import { Theme, withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const StyledButton = withStyles((theme: Theme) => ({
  root: {
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: '16px',
    backgroundColor: '#1A589F',
    width: '100%',
    padding: '15px',
    textTransform: 'none',
    letterSpacing: '2px',
    '&:hover': {
      backgroundColor: '#e4e4e4',
    },
  },
  label: {
    height: '15px',
  },
}))(Button);

export default function CustomButton(props) {
  return (
    <StyledButton href={props.href} aria-label={props.label} {...props}>
      {props.label}
    </StyledButton>
  );
}
