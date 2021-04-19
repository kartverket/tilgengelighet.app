import React from 'react';
import {createStyles, makeStyles, Theme, withStyles} from '@material-ui/core/styles';
import IconButton from "@material-ui/core/IconButton";


const StyledIconButton = withStyles((theme: Theme) => ({
  root: {
    color: '#1D1D1D',
    backgroundColor: '#F5F5F5',
    borderRadius: '20px',
    width: '40px',
    height: '40px',
    boxShadow: '0px 4px 5px 0px rgba(0,0,0,0.2)',
    marginBottom: '20px',
    '&:hover': {
      backgroundColor: '#e4e4e4',
    },
  },
  label: {
    height: '15px',
  },
}))(IconButton);

export default function IconButtons(props) {
  return (
    <StyledIconButton onClick={props.onClick} aria-label={props.ariaLabel}>
      {props.icon}
    </StyledIconButton>
  )
}
