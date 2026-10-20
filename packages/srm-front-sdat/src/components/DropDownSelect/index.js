/**
 * dropDown 下拉选择组件
 */
import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Menu, Dropdown } from 'hzero-ui';
import { Icon } from 'choerodon-ui/pro';
import './index.less';

const DropDownSelect = React.forwardRef((props, ref) => {
  const {
    defaultValue = '',
    keyIndex = '',
    optionList = [],
    label = '',
    onSelect,
    ...rest
  } = props;

  const [showVisible, setVisible] = useState(false);
  const [selectValue, setValue] = useState('');
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    if (optionList.length) {
      optionList.forEach((item) => {
        if (item.value === defaultValue) {
          setValue(item.meaning);
        }
      });
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, optionList]);

  /**
   * 选择数据
   * @param {string} value
   */
  const handleSelect = (value) => {
    setVisible(false);

    optionList.forEach((item) => {
      if (item.value === value.key) {
        setValue(item.meaning);
      }
    });

    if (onSelect && typeof onSelect === 'function') {
      onSelect(value.key);
    }
  };

  /**
   * 清除数据
   */
  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onSelect && typeof onSelect === 'function') {
      onSelect('');
      setValue('');
    }
  };

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  const menu = () => {
    return (
      <Menu onClick={handleSelect}>
        {optionList.map((item) => {
          return <Menu.Item key={item.value}>{item.meaning}</Menu.Item>;
        })}
      </Menu>
    );
  };

  const resetValue = () => {
    setValue('');
  };

  useImperativeHandle(ref, () => ({
    resetValue: () => resetValue(),
  }));

  const elementId = `wideAreaDropdown${keyIndex}`;

  return (
    <div
      ref={ref}
      id={elementId}
      tabIndex="-1"
      className="wide-area-dropdown"
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
      {...rest}
    >
      <Dropdown
        overlay={menu()}
        trigger={['click']}
        getPopupContainer={() => document.getElementById(elementId)}
        onVisibleChange={handleVisibleChange}
      >
        <span>
          <span className="ant-dropdown-link" style={{ padding: '0 5px' }}>
            <span style={{ verticalAlign: 'middle' }}>{label}</span>
            <span
              style={{
                fontWeight: 600,
                margin: '0 5px',
                color: 'rgba(0,0,0,0.85)',
                verticalAlign: 'middle',
              }}
            >
              {selectValue}
            </span>
          </span>
          <span className="wide-area-dropdown-clear">
            {showIcon && selectValue ? (
              <Icon type="close" onClick={handleClear} />
            ) : (
              <Icon type={showVisible ? 'expand_less' : 'expand_more'} />
            )}
          </span>
        </span>
      </Dropdown>
    </div>
  );
});

export default DropDownSelect;
