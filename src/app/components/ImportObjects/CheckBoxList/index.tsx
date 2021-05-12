import React from 'react';
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from '@material-ui/core/styles';
import {Checkbox, CheckboxProps, Switch} from '@material-ui/core';
import {green} from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flex: {
      display: 'flex',
      paddingBottom: '16px',
    },
    text: {
      padding: '15px 0',
      borderBottom: '1px solid rgb(245, 245, 245)',
    },
  }),
);

const StyledCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600],
    },
  },
  checked: {},
})((props: CheckboxProps) => <Checkbox {...props} />);

export default function CheckBoxList (props) {
  const classes = useStyles();
  // const [state, setState] = React.useState({
  //   value: props.checked,
  // });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setState({ ...state, value: event.target.checked });
    props.onChange(event.target.checked);
  };

  return (
    <div className={`row ${classes.flex}`}>
      <div className={'col-2'} style={{paddingTop: '16px'}}>
        <StyledCheckbox
          checked={props.checked}
          onChange={event => handleChange(event)}
          inputProps={{'aria-label': `${props.content}`}}
        />
      </div>
      <div style={{flex: '1', paddingRight: '32px', paddingLeft: '16px'}}>
        {props.content}
      </div>
    </div>
  );
}
