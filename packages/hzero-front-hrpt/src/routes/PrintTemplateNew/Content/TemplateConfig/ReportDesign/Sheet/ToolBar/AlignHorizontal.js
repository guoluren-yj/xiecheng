import React, { useEffect, useMemo, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Dropdown, Button, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import alignLeftSvg from '@/assets/sheet/alignLeft.svg';
import alignCenterSvg from '@/assets/sheet/alignCenter.svg';
import alignRightSvg from '@/assets/sheet/alignRight.svg';
import { ToolBarType } from '../../utils/constant';
import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-align-horizontal';

export default function AlignHorizontal({ cell, item, sheetRef, disabled }) {
  const { name, type, title, options } = item;
  const [value, setValue] = useState(options[0].value);
  const [icon, setIcon] = useState(options[0].icon);

  useEffect(() => {
    let target = null;
    if (item.menuKey && cell && cell.value && !isNil(cell.value[item.menuKey])) {
      const initialValue = cell.value[item.menuKey];
      target = options.find((option) => Number(option.value) === Number(initialValue));
    }
    if (target) {
      setValue(target.value);
      setIcon(target.icon);
    } else {
      setValue(options[0].value);
      setIcon(options[0].icon);
    }
  }, [cell]);

  const changeItem = useCallback(
    (clickItem, key) => {
      const target = options.find((option) => Number(option.value) === Number(clickItem.key));
      if (target) {
        setValue(target.value);
        setIcon(target.icon);
        setCellStyle(target.value);
      }
    },
    [options, setCellStyle]
  );

  const setCellStyle = useCallback(
    (newValue) => {
      sheetRef.current.updateFormat('ht', Number(!isNil(newValue) ? newValue : value));
    },
    [value]
  );

  const menu = useMemo(
    () => (
      <Menu
        onClick={changeItem}
        className={classnames(
          styles['sheet-toolbar-dropdown-menu'],
          styles['sheet-toolbar-align-horizontal-menu']
        )}
      >
        {options.map((option) => (
          <Menu.Item key={option.value} value={option.value}>
            <span style={{ width: '20px', display: 'inline-block' }}>
              {value === option.value && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            <img src={require(`@/assets/sheet/${option.icon}.svg`)} />
            <span>{option.text}</span>
          </Menu.Item>
        ))}
      </Menu>
    ),
    [changeItem, options, value, cell]
  );
  return (
    <Tooltip title={title}>
      <div
        className={classnames(styles[`${clsPrefix}`], {
          [styles['sheet-toolbar-diabled']]: disabled,
        })}
      >
        <div onClick={() => setCellStyle()}>
          <img src={require(`@/assets/sheet/${icon}.svg`)} />
        </div>
        <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
          <div>
            <Icon type="arrow_drop_down" />
          </div>
        </Dropdown>
      </div>
    </Tooltip>
  );
}
