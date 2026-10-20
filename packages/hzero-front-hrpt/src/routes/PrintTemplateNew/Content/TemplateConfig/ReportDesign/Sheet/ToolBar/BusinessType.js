import React, { useMemo, useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import { Menu, Dropdown } from 'choerodon-ui/pro';
import { Tooltip, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';

import styles from '../../index.less';
import { exitEditMode } from '../../utils/utils';

const clsPrefix = 'sheet-toolbar-business-type';

export default function BusinessType({ cell, item, sheetRef, disabled }) {
  const { name, type, title } = item;
  const [options, setOptions] = useState([]);
  const [visible, setVisible] = useState(false);
  const editabled = useMemo(() => {
    return cell && cell.value && cell.value.extra && cell.value.extra.type === 'FIELD';
  }, [cell]);
  const [value, setValue] = useState((cell && cell.value && cell.value.extra && cell.value.extra.fieldBusinessType) || 'NONE');
  const text =
    !options.length ?
      intl.get('hzero.common.none').d('无')
      : (options.find(i => i.value === value) || {}).meaning || intl.get('hzero.common.none').d('无');

  useEffect(() => {
    fetchOptions();
  }, []);
  
  useEffect(() => {
    if (!editabled) {
      setVisible(false);
    }
  }, [editabled]);

  useEffect(() => {
    setValue((cell && cell.value && cell.value.extra && cell.value.extra.fieldBusinessType) || 'NONE');
  }, [cell]);

  const fetchOptions = () => {
    queryIdpValue('HRPT.FIELD_BUSINESST_YPE').then(res => {
      if (getResponse(res) && res && res.length) {
        setOptions(res);
      }
    });
  };

  const handleChange = ({ key: v }) => {
    const newType = v || 'NONE';
    setValue(newType);
    const { c: col_index, r: row_index } = cell.position;
    sheetRef.current.setCellValue(row_index, col_index, {
      ...(cell.value || {}),
      extra: {
        ...(cell.value.extra || {}),
        fieldBusinessType: newType,
      },
    });
  };

  return (
    <Dropdown
      overlay={(
        <Menu className={styles['sheet-toolbar-dropdown-menu']} onClick={handleChange}>
          {options.map((option) => (
            <Menu.Item key={option.value} className={styles['sheet-toolbar-dropdown-menu-item']}>
              <span style={{ width: '20px' }}>
                {value === option.value && (
                  <Icon type="check" className={styles['dropdown-menu-item-check-icon']} />
                )}
              </span>
              {option.meaning}
            </Menu.Item>
          ))}
        </Menu>
      )}
      trigger={['click']} 
      visible={visible}
      onVisibleChange={v => setVisible(v)}
      disabled={!editabled}
    >
      <Tooltip title={title}>
        <div
          className={classnames(
            styles['sheet-toolbar-dropdown-item'],
            styles['sheet-toolbar-business-type'],
            { [styles['sheet-toolbar-diabled']]: !editabled }
          )}
        >
          <span>{text}</span>
          <Icon type="arrow_drop_down" />
        </div>
      </Tooltip>
    </Dropdown>  
  );
}
