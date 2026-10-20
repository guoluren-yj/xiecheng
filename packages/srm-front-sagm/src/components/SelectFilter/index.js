import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import style from './index.less';

export default function SelectFilter(props) {
  const {
    label,
    width = 'auto',
    showExpandIcon = true,
    disabled,
    autoClear = false,
    options = [],
    onChange = () => null,
  } = props;
  const { value: defaultValue } = options.filter((f) => f.isDefault)[0] || {};
  const [value, setValue] = useState(defaultValue);

  // 初始查询
  useEffect(() => {
    onChange(defaultValue, true);
  }, []);

  const handleChange = useCallback(({ key }) => {
    setValue(key);
    onChange(key);
  });

  function clearValue() {
    setValue('');
    onChange();
  }

  const menu = (
    <Menu onClick={handleChange} style={{ width }}>
      {options.map((m) => (
        <Menu.Item key={m.value}>
          <span className={style['select-value']}> {m.text}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['hover']}
      className={style['filter-select']}
      disabled={disabled}
    >
      <div className={style['filter-select-btn']} style={{ width }}>
        <span className={style['select-label']}>{label}</span>
        <span className={style['select-value']}>
          {(options.filter((f) => f.value === value)[0] || {}).text}
        </span>
        {showExpandIcon && (
          <Icon
            type={value ? (autoClear ? 'close' : 'expand_more') : 'expand_more'}
            onClick={autoClear && clearValue}
          />
        )}
      </div>
    </Dropdown>
  );
}
