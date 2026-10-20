import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Dropdown, Button, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';

import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

export default function DecimalPlaces({ item, disabled }) {
  const { name, type, title, options } = item;
  const [value, setValue] = useState(null);
  const [showText, setShowText] = useState(null);

  useEffect(() => {
    setValue(options[0].value);
    setShowText(options[0].title);
  }, []);

  const changeItem = (clickItem, key) => {
    const target = options.find(option => option.value === clickItem.key);
    if (target) {
      setValue(target.value);
      setShowText(target.title);
    }
  };

  const menu = !disabled && (
    <Menu className={styles['sheet-toolbar-decimal-places-menu']} onClick={changeItem}>
      {options.map(item => (
        <Menu.Item value={item.value}>
          <span className={styles[item.clsName]} />
          <span>{item.title}</span>
        </Menu.Item>
      ))}
    </Menu>
  );

  const renderTriggerNode = () => {
    if (type === ToolBarType.CUSTOME) {
      return (
        <Button className={styles['sheet-toolbar-dropdown-item']}>
          {showText}
          <Icon type="arrow_drop_down" />
        </Button>
      );
    } else {
      return (
        <Button funcType="link">
          {showText}
          <Icon type="arrow_drop_down" />
        </Button>
      );
    }
  };

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Tooltip title={showText}>
        <Button disabled={disabled} funcType="link" className={styles['sheet-toolbar-decimal-places']}>
          <span
            className={
              styles[`${value === 'add' ? 'sheet-icon-addDecimal' : 'sheet-icon-lessDecimal'}`]
            }
          />
          <Icon type="arrow_drop_down" />
        </Button>
      </Tooltip>
    </Dropdown>
  );
}
