import React, { useState, createContext } from "react";


export const ToolTipContext = createContext<{
  showToolTips: boolean;
  setShowToolTips: (value: boolean) => void;
}>({
  showToolTips: true,
  setShowToolTips: (value: boolean) => {},
});

const ToolTipProvider: React.FC = (props) => {
  const [showToolTips, setShowToolTips] = useState(true);

  return (
    <ToolTipContext.Provider
      value={{
        showToolTips,
        setShowToolTips
      }}
    >
      {props.children}
    </ToolTipContext.Provider>
  );
};
export default ToolTipProvider;
