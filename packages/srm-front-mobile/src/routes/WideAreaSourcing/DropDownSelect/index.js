/**
 * dropDown 下拉选择组件
 */
import React, { useState, useEffect } from 'react';
import { Menu, Dropdown } from 'hzero-ui';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

export default function DropDownSelect(props) {
  const {
    defaultValue = '',
    keyIndex = '',
    allowClear = false,
    optionList = [],
    label = '',
    onSelect,
    ...rest
  } = props;

  const [showVisible, setVisible] = useState(false);
  const [selectValue, setValue] = useState('');

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  /**
   * 选择数据
   * @param {string} value
   */
  const handleSelect = (value) => {
    setVisible(false);

    let target;
    optionList.forEach((item) => {
      if (item.value === value.key) {
        setValue(item.meaning);
        target = item;
      }
    });

    if (onSelect && typeof onSelect === 'function') {
      onSelect(target);
    }
  };

  /**
   * 清除数据
   */
  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const elementId = `wideAreaDropdown${keyIndex}`;

  return (
    <div id={elementId} className="wide-area-dropdown" {...rest}>
      <Dropdown
        overlay={menu()}
        trigger={['click']}
        getPopupContainer={() => document.getElementById(elementId)}
        onVisibleChange={handleVisibleChange}
      >
        <span
          className="ant-dropdown-link"
          style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
        >
          {label}
          <span style={{ fontWeight: 600, marginLeft: '5px' }}>{selectValue}</span>
          {allowClear && selectValue && (
            <Icon style={{ paddingLeft: '5px' }} onClick={handleClear} type="close" />
          )}
          <Icon style={{ paddingLeft: '5px' }} type={showVisible ? 'expand_less' : 'expand_more'} />
        </span>
      </Dropdown>
    </div>
  );
}
