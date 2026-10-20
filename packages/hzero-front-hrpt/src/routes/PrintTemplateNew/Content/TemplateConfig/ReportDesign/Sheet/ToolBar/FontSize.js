import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import classnames from 'classnames';
import { Dropdown, Menu } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';

import styles from '../../index.less';
import Store from '../../store';

export default function FontSize({ cell, item, sheetRef, disabled }) {
  const { title, options, unitOptions } = item;
  const { selectRange } = useContext(Store).store;
  const [size, setSize] = useState(10);
  const [sizeUnit, setSizeUnit] = useState('px');
  // 未知原因使用dropdown组件会在点击非空单元格时出现下拉列表未收起情况，故使用key临时解决该问题
  const [dropdownKey, setDropdownKey] = useState();
  useEffect(() => {
    if (item.name === "fontSize" && sheetRef.current) {
      const { data } = sheetRef.current.getAllSheets()[0];
      let cols = 0;
      // 整列
      let isAllRow = false;
      // 整行
      let isAllCol = false;
      if (!selectRange || !selectRange[0]) return;
      if (data && data[0] && data[0].length) cols = data[0].length;
      const [colSt, colEnd] = selectRange[0].column;
      const [rowSt, rowEnd] = selectRange[0].row;
      if (colSt === 0 && colEnd + 1 === cols) {
        isAllCol = true;
      }
      if (data && rowSt === 0 && rowEnd + 1 === data.length) {
        isAllRow = true;
      }
      if (isAllCol || isAllRow) setSize(10);
      else if (data && data[rowSt] && data[rowSt][colSt]){
        setSize(Number(data[rowSt][colSt].fs || 10));
        setSizeUnit(data[rowSt][colSt].fsu || 'px');
      }
    }
    setDropdownKey(new Date().valueOf());
  }, [selectRange]);

  const changeItem = useCallback((clickItem, type) => {
    const { key } = clickItem;
    if (type === 'size') {
      setSize(key);
      sheetRef.current.updateFormat('fs', key);
    } else if (type === 'unit') {
      setSizeUnit(key);
      sheetRef.current.updateFormat('fsu', key);
    }
  }, []);

  const onInputValue = useCallback((e) => {
    const rawValue = e.target.value || "";
    const validValue = rawValue.replace(/[^0-9.]/g, "").replace(/(\.\d*)\./g, "$1");
    // 临时存原始有效字符串（保留 7. 这种状态）
    setSize(validValue);
    // 仅当值为有效数值（非空/非纯小数点）时，更新业务逻辑
    if (validValue && validValue !== ".") {
      // 转数值（7. 会转成 7，7.5 转成 7.5）
      const numValue = Number(validValue);
      // 范围限制：最小1，最大80
      const finalValue = Math.max(1, Math.min(80, numValue));
      sheetRef.current.updateFormat('fs', finalValue);
    }
  }, []);

  const onInputBlur = useCallback((e) => {
    let rawValue = e.target.value || "";
    let finalValue = "5"; // 默认值
    // 情况1：空值 → 设为5
    if (!rawValue) {
      finalValue = "5";
    } 
    // 情况2：纯小数点（如 "."）→ 设为5
    else if (rawValue === ".") {
      finalValue = "5";
    } 
    // 情况3：有效数值（含小数）→ 处理范围后保留
    else {
      const numValue = Number(rawValue);
      // 范围限制：1~80
      finalValue = Math.max(1, Math.min(80, numValue)).toString();
    }
    // 更新状态 + 业务逻辑
    setSize(finalValue);
    sheetRef.current.updateFormat('fs', Number(finalValue));
  }, []);

  const menu = useCallback(
    (type) => (
      <Menu
        className={classnames(
          styles['sheet-toolbar-dropdown-menu'],
          styles['sheet-toolbar-fontSize-dropdown-menu']
        )}
        onClick={(e) => changeItem(e, type)}
      >
        {type === 'size' && options.map((option) => (
          <Menu.Item key={option} className={styles['sheet-toolbar-dropdown-menu-item']}>
            <span style={{ width: '20px' }}>
              {Number(size) === Number(option) && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {option}
          </Menu.Item>
        ))}
        {type === 'unit' && unitOptions.map((unit) => (
          <Menu.Item key={unit} className={styles['sheet-toolbar-dropdown-menu-item']}>
            <span style={{ width: '20px' }}>
              {unit === sizeUnit && (
                <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
              )}
            </span>
            {unit}
          </Menu.Item>
        ))}
      </Menu>
    ),
    [changeItem, options, cell, size, sizeUnit, unitOptions]
  );

  return (
    <>
      <Dropdown key={dropdownKey} overlay={menu('size')} trigger={['click']} disabled={disabled}>
        <Tooltip title={title}>
          <div
            className={classnames(
              styles['sheet-toolbar-dropdown-item'],
              styles['sheet-toolbar-font-size'],
              { [styles['sheet-toolbar-diabled']]: disabled }
            )}
          >
            <input value={size} onChange={onInputValue} onBlur={onInputBlur} onClick={preventEvent} />
            <Icon type="arrow_drop_down" style={{ fontSize: '18px', fontWeight: 600 }} />
          </div>
        </Tooltip>
      </Dropdown>
      <Dropdown overlay={menu('unit')} trigger={['click']} disabled={disabled}>
        <div
          className={classnames(
            styles['sheet-toolbar-dropdown-item'],
            styles['sheet-toolbar-font-size'],
            { [styles['sheet-toolbar-diabled']]: disabled }
          )}
        >
          {sizeUnit}
          <Icon type="arrow_drop_down" style={{ fontSize: '18px', fontWeight: 600 }} />
        </div>
      </Dropdown>
    </>  
  );
}

function preventEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}