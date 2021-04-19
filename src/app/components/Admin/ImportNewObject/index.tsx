import * as React from 'react';
import './style.scss';

interface Props {
  className: string;
  title?: any;
  titleTooltip?: any;
  dbText?: any;
  dbTextMobile?: any;
  dbTooltip?: any;
  localText?: any;
  localTextMobile?: any;
  localTooltip?: any;
}

const ImportNewObjectPanel = (props: Props) => {
  const { className, title, titleTooltip, dbText, localText } = props;

  return (
    <div className={className}>
      <h4>{title}</h4>
      <small>{titleTooltip}</small>
      <div className="buttons">
        <div className="btn btn-outlin-primary">{dbText}</div>
        <div className="btn btn-outlin-primary">{localText}</div>
      </div>
    </div>
  );
};

export default ImportNewObjectPanel;
