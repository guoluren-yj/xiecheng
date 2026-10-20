import React, { useEffect, useState, useCallback, useMemo } from 'react';
import classnames from 'classnames';
import { Dropdown, Button, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';

import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

export default function FontStyle({ cell, item, sheetRef, disabled }) {
  const { name, type, title, options } = item;
  const [showText, setShowText] = useState(null);
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (cell && cell.value && !isNil(cell.value[item.menuKey])) {
      const ff = cell.value[item.menuKey];
      const target = options.find((i) => i.text === ff);
      if (target) {
        setShowText(ff);
        setValue(ff);
      } else {
        setShowText(options[0].text);
        setValue(options[0].text);
      }
    } else {
      setShowText(options[0].text);
      setValue(options[0].text);
    }
  }, [cell, options]);

  const changeItem = useCallback(
    (clickItem) => {
      const target = options.find((option) => Number(option.value) === Number(clickItem.key));
      if (target) {
        setShowText(target.text);
        setValue(target.text);
        sheetRef.current.updateFormat('ff', target.text);
      }
    },
    [options]
  );

  const menu = useMemo(
    () => (
      <Menu className={styles['sheet-toolbar-dropdown-menu']} onClick={changeItem}>
        {options.map((option) => (
          <Menu.Item key={option.value} className={styles['sheet-toolbar-dropdown-menu-item']}>
            <span style={{ width: '20px' }}>
              {value === option.value && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {option.text}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [changeItem, options]
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
      <Tooltip title={title}>
        <div
          className={classnames(
            styles['sheet-toolbar-dropdown-item'],
            styles['sheet-toolbar-font-style'],
            { [styles['sheet-toolbar-diabled']]: disabled }
          )}
        >
          <span>{showText}</span>
          <Icon type="arrow_drop_down" />
        </div>
      </Tooltip>
    </Dropdown>
  );
}
