import React, { useState, useRef } from 'react';
import { TextField } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { Popover, Icon } from 'choerodon-ui';

import './index.less';

const stylePrefix = 'c7n-pro-table-search-bar';

export default function PopoverTextField(props) {
  const { onChange = () => {}, label = '' } = props;

  const [visible, setVisible] = useState(false);
  const [isEnter, setEnter] = useState(false);
  const [popValue, setPopValue] = useState('');
  const [inputVal, setInput] = useState('');

  const textRef = useRef(null);

  const handleInputPop = (e) => {
    setPopValue(e?.target?.value ?? '');
  };

  const handleClearPop = () => {
    setPopValue('');
  };

  const handleOpenPop = () => {
    setVisible(true);
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setInput('');
    setPopValue('');
    onChange('');
    setVisible(false);
  };

  const handleVisibleChange = (tag) => {
    if (!tag) {
      setVisible(tag);
      setInput(popValue);
      onChange(popValue);
    }
  };

  const handleEnter = () => {
    setEnter(true);
    if (textRef && textRef.current) {
      if (textRef.current.focus) {
        textRef.current.focus();
      }
      if (textRef.current.handleFocus) {
        textRef.current.handleFocus();
      }
    }
  };

  const handleLeave = () => {
    setEnter(false);
  };

  const handleEnterDown = () => {
    setVisible(false);
    setInput(popValue);
    onChange(popValue);
  };

  const overlayClsNames = classnames({
    [`${stylePrefix}-field-editor`]: true,
  });

  return (
    <div id="datasheet-pop-text" className="base-page-style">
      <Popover
        content={
          <TextField
            ref={textRef}
            clearButton
            value={popValue}
            border={false}
            onInput={handleInputPop}
            onClear={handleClearPop}
            onEnterDown={handleEnterDown}
          />
        }
        title=""
        trigger="click"
        visible={visible}
        placement="bottomLeft"
        overlayClassName={overlayClsNames}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => document.getElementById('datasheet-pop-text')}
      >
        <span
          className="pop-text-field"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleOpenPop}
        >
          <span style={{ color: 'rgba(0, 0, 0, .65)', fontSize: '13px' }}>{label}</span>
          <span style={{ marginLeft: '5px', fontWeight: 500, fontSize: '13px' }}>{inputVal}</span>
          {inputVal && isEnter ? (
            <Icon
              type="close"
              style={{
                cursor: 'pointer',
                marginLeft: '5px',
                fontSize: '14px',
              }}
              onClick={handleClear}
            />
          ) : (
            <Icon
              type="expand_more"
              style={{
                cursor: 'pointer',
                marginLeft: '5px',
                fontSize: '14px',
              }}
            />
          )}
        </span>
      </Popover>
    </div>
  );
}
