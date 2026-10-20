import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import IntlField from './IntlField';

interface IProps {
  name?: string;
  record?: any;
  init?: any;
  disabled?: boolean;
  required?: boolean;
  textFieldStyle?: any;
}

const MultiIntlField = observer((props: IProps) => {
  const { name, record, init, disabled, textFieldStyle, required } = props;
  const [currentValue, setCurrentValue] = useState({});
  useEffect(() => {
    setCurrentValue(init || {});
  }, [init]);

  return (
    <IntlField
      fieldName={name}
      record={record}
      value={currentValue}
      setCurrentValue={setCurrentValue}
      disabled={disabled}
      textFieldStyle={textFieldStyle}
      required={required}
    />
  );
});

export default MultiIntlField;
