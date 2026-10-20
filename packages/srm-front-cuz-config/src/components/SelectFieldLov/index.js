import React, { useState, useEffect } from 'react';
import { Input, Icon } from 'hzero-ui';

import LovModal from './LovModal';
import styles from './index.less';

const SelectFieldLov = props => {
  const { queryParams, textValue, onChangeField: onChange, disabled, value, displayWithName = false } = props;
  const [modelVisible, setModelVisible] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    setText(textValue);
  }, [textValue]);

  const openModal = () => setModelVisible(true);

  const closeModal = () => setModelVisible(false);

  const handleChange = (newValue, record) => {
    setText(displayWithName ? record.fieldName : newValue);
    if (onChange) {
      onChange(newValue, record);
    }
  };

  const clearValue = () => {
    handleChange(undefined, {});
  };

  const suffix = (
    <>
      {text && !disabled && (
        <Icon type="close-circle" className={styles['close-icon']} onClick={clearValue} />
      )}
      <Icon type="search" style={{ cursor: 'pointer' }} onClick={openModal} />
    </>
  );

  const modelProps = {
    queryParams,
    onClose: closeModal,
    onChange: handleChange,
  };

  return (
    <>
      <Input readOnly value={text} className={styles.input} suffix={suffix} disabled={disabled} />
      {modelVisible && <LovModal {...modelProps} />}
    </>
  );
};

export default SelectFieldLov;
