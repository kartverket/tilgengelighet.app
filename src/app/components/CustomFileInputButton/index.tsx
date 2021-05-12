import React from 'react';
import { Button } from '@material-ui/core';

export default function FileInput(props) {
  const { handleUploadFile, buttonClass, icon, buttonLabel, inputId } = props;
  return (
    <>
      <input
        color="primary"
        accept="image/*"
        type="file"
        onChange={event => handleUploadFile(event)}
        id={inputId}
        style={{ display: 'none' }}
      />

      <label htmlFor={inputId}>
        <Button className={buttonClass} component="span" startIcon={icon}>
          {buttonLabel}
        </Button>
      </label>
    </>
  );
}
