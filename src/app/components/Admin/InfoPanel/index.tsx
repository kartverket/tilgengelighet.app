import * as React from 'react';
import './style.scss';

const InfoPanel = ({ object, className, closePanel }) => (
  <div className={className}>
    <div className="container-fluid">
      <div className="row close-button-wrapper">
        <button type="button" className="close" onClick={() => closePanel()}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="row mb-2">
        <div className="col-12 border-bottom">
          <h4>{object?.name}</h4>
          <small className="text-small">{object?.createdDate}</small>
        </div>
      </div>
      <div className="row mb-5">
        <div className="col-12">
          <small>Kartområdet inneholder kommune(r)</small>
          <br />
          <span>{object?.location.join(', ')}</span>
        </div>
      </div>
      <div className="row">
        <div className="col-12">more info</div>
      </div>
    </div>
  </div>
);

export default InfoPanel;
