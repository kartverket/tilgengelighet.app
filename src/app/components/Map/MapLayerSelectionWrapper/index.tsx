import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Choice from './Choice';

interface ComponentProps {
  choices: any[];
  setMapLayer: any;
  handleCloseMapLayerSelection: any;
  chosenLayer: any;
}

const useStyles = makeStyles(() =>
  createStyles({
    rootPaper: {
      display: 'flex',
      flexDirection: 'row',
      padding: '20px',
      justifyContent: 'center',
    },
  }),
);

const MapLayerSelectionWrapperWithRef = React.forwardRef(
  (props: ComponentProps, ref) => {
    const {
      choices,
      setMapLayer,
      handleCloseMapLayerSelection,
      chosenLayer,
    } = props;
    const classes = useStyles();
    return (
      <div itemRef={ref?.toString()} className={classes.rootPaper}>
        {choices.map(choice => {
          const customProps = {
            choice,
            handleClick: () => {
              setMapLayer(choice);
              handleCloseMapLayerSelection();
            },
            selected: chosenLayer.name === choice.name,
          };
          return <Choice {...customProps} key={choice.name}></Choice>;
        })}
      </div>
    );
  },
);
export default MapLayerSelectionWrapperWithRef;
