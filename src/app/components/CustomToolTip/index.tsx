import {Theme, Tooltip, withStyles} from "@material-ui/core";
import React from "react";

export const DarkToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    color: '#fff',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
  arrow: {
    color: 'rgba(0, 0, 0, 0.87)'
  }
}))(Tooltip);

export const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
  arrow: {
    color: theme.palette.common.white
  }
}))(Tooltip);


// export default function CustomToolTip(props: any): any {
//
//   const [open, setOpen] = React.useState(false);
//
//   const handleClose = () => {
//     setOpen(false);
//   };
//
//   const handleOpen = () => {
//     if(props.show) {
//       setOpen(true);
//     }
//   };
//
//   if(props.dark) {
//     // @ts-ignore
//     return <DarkToolTip open={open} onClose={handleClose} onOpen={handleOpen} />
//   } else {
//     // @ts-ignore
//     return <LightToolTip open={open} onClose={handleClose} onOpen={handleOpen} />
//   }
// }
