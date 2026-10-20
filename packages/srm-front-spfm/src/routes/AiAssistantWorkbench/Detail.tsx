import React, { useCallback } from "react";
import DigitalEmployeeDetail from '../DigitalEmployeeDetail';


const Detail = (props) => {

  const { history } = props;

  const onClose = useCallback(() => {
    history.push({
      pathname: '/spfm/ai-assistant-workbench',
    });
  }, []);

  return (
    <DigitalEmployeeDetail {...props} onClose={onClose} />
  );
};

export default Detail;