import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from 'hzero-ui';
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';

import LovModal from './LovModal';

export default (props) => {
  const {
    textValue,
    queryParams,
    code,
    form,
    disabled,
    lovOptions,
    value,
    title,
    onChange,
    onMouseEnter,
    onMouseLeave,
    onChangeSelf,
    ...otherProps
  } = props;
  const [outValue, setOutValue] = useState(textValue);
  const [visible, setVisible] = useState(false);
  const [column, setColumn] = useState({});
  const [visibleClear, setVisibleClear] = useState(false);
  const inputRef = useRef(null);

  const fetchColumn = useCallback(() => {
    request(`${HZERO_PLATFORM}/v1/30/lov-view/info`, {
      method: 'GET',
      query: { viewCode: code },
    }).then((res) => {
      if (res) {
        setColumn(res);
      }
    });
  });

  useEffect(() => {
    setOutValue(textValue);
    return () => setOutValue('');
  }, []);

  useEffect(() => {
    const enterFunc = () => {
      setVisibleClear(true);
    };
    const leaveFunc = () => {
      setVisibleClear(false);
    };
    inputRef.current.addEventListener('mouseenter', enterFunc);
    inputRef.current.addEventListener('mouseleave', leaveFunc);
    return () => {
      inputRef.current.removeEventListener('mouseenter', enterFunc);
      inputRef.current.removeEventListener('mouseleave', leaveFunc);
      onChange([]);
    };
  }, []);

  useEffect(() => {
    fetchColumn();
    return () => setColumn([]);
  }, []);

  const onOk = (selectRowKeys, selectRows) => {
    const out = selectRows.map((item) => item.inventoryName);
    setOutValue(out);
    onChange(selectRowKeys);
    onChangeSelf(selectRows);
    form.setFieldsValue({ multiInventoryName: out.toString() });
    setVisible(false);
  };

  const handleEmpity = () => {
    setOutValue([]);
    onChange([]);
    onChangeSelf([]);
    form.setFieldsValue({ multiInventoryName: '' });
  };

  return (
    <span
      className="ant-input-affix-wrapper"
      ref={inputRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <input
        {...otherProps}
        type="text"
        disabled
        value={outValue}
        className={`ant-input ${disabled ? 'ant-input-disabled' : ''}`}
      />
      <div
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
        }}
      >
        {visibleClear && !disabled && (
          <Icon
            key="clear"
            className="lov-clear"
            type="close-circle"
            onClick={handleEmpity}
            style={{ marginRight: '5px' }}
          />
        )}
        <Icon
          key="search"
          onClick={() => (!disabled ? setVisible(true) : null)}
          type="search"
          style={{
            color: 'rgba(0, 0, 0, 0.25)',
            cursor: !disabled ? 'pointer' : 'not-allowed',
          }}
        />
      </div>
      {visible && (
        <LovModal
          onOk={onOk}
          visible={visible}
          column={column}
          onCancel={() => setVisible(false)}
          title={title}
          queryParams={queryParams}
          code={code}
          selectedRowKeys={value}
        />
      )}
    </span>
  );
};
