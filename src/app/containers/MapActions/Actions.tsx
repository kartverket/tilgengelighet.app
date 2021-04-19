import React from 'react';
import { IconButton } from '@material-ui/core';
import LayersIcon from '@material-ui/icons/Layers';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import ZoomIcon from '@material-ui/icons/ZoomIn';

export interface Props {
  indexOfSelected?: number;
}

export default function Actions(props: Props) {
  return (
    <div
      style={{
        top: '138px',
        position: 'fixed',
        height: '200px',
        width: '200px',
        backgroundColor: '#FFFFFF',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
    >

        {/* Add FAB */}
      <div
        style={{
          height: '40px',
          width: '40px',
          backgroundColor: '#F5F5F5',
          borderRadius: '50%',
          marginBottom: '20px',
        }}
      >
          <IconButton><LayersIcon></LayersIcon></IconButton>
      </div>
      <div
        style={{
          height: '40px',
          width: '40px',
          backgroundColor: '#F5F5F5',
          borderRadius: '50%',
          marginBottom: '20px',
        }}
      ></div>
      <div
        style={{
          height: '40px',
          width: '40px',
          backgroundColor: '#F5F5F5',
          borderRadius: '50%',
        }}
      ></div>
    </div>
  );
}
{
  /* <div
      style={{
        top: '138px',
        right: "16px",
        zIndex: 1000,
        position: 'fixed',
        height: '25px',
        width: '25px',
        backgroundColor: '#bbb',
        borderRadius: '50%',
        marginLeft: '20px',
        display: 'flex',
      }} */
}
