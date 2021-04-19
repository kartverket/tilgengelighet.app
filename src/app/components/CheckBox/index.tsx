import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox, {
  CheckboxProps,
} from '@material-ui/core/Checkbox';

export const GreenCheckbox = withStyles({
  root: {
    // color: 'white',
    '&$checked': {
      color: '#249446',
    },
  },
  checked: {},
})((props: CheckboxProps) => (
  <Checkbox color="default" {...props} />
));

export interface Props {
  label?: string;
  value?: boolean;
  intlLabel?: any;
  onChanged (value: boolean): any;
}

export default function CheckBox (props: Props) {
  const [state, setState] = React.useState({
    value: props.value,
  });

  const intlLabel =
    props.intlLabel != null
      ? props.intlLabel
      : props.label !== null
        ? props.label
        : '';

  const handleChange = (prop: keyof Props) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setState({...state, [prop]: event.target.checked});
    props.onChanged(event.target.checked);
  };

  return (
    <div>
      <FormControlLabel
        control={
          <GreenCheckbox
            checked={state.value}
            onChange={handleChange('value')}
            name="checked"
            size="medium"
          />
        }
        label={intlLabel}
      />
    </div>
  );
}
