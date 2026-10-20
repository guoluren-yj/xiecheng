/**
 * ContactIcon
 * 收藏icon
 * @date: 2021-11-01
 * @author: Danica <ke.wang01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { memo, useState, useMemo } from 'react';

import { Icon, Tooltip } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from '@/utils/intl';
import { addCommonService, removeCommonService } from '@/services/ContactIcon';
import { ROOT, getKey } from './ViewRender';

const ContactIcon = props => {
  const {
    dataSet,
    record,
    addCommonKeys,
    removeCommonKeys,
    commonTreeKeys = [],
    checkedKeys = [],
    valueField,
    code: viewCode,
    commonRootIndex,
    parentIdField,
    disabled,
    setCheckedKeys,
    getCheckedRealValues,
  } = props;
  const [value] = useState(record ? record[valueField].toString() : '');

  // 收藏状态
  const contactFlag = useMemo(() => {
    if (commonTreeKeys.length) {
      return !!commonTreeKeys.find(item => item == value);
    }
    return false;
  }, [commonTreeKeys]);

  // 修改常用联系人
  const updateTreeData = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const commonRoot = dataSet.get(commonRootIndex);

    if (contactFlag) {
      const curCommonRecord = commonRoot.children?.find(item => {
        return item.get(valueField).toString() === value;
      });
      if (!curCommonRecord) return;
      const id = curCommonRecord.get('selectedId');
      const selectValue = curCommonRecord.get('selectValue');
      removeCommonService({ viewCode, id, selectValue })
        .then(res => {
          if (getResponse(res)) {
            dataSet.remove(curCommonRecord, true);
            removeCommonKeys(selectValue);
          }
        })
        .catch(e => {
          notification.error({ description: e.message });
        });
    } else {
      addCommonService({ viewCode, selectValue: value })
        .then(async res => {
          if (getResponse(res)) {
            const { id: selectedId, selectValue } = res;
            // 是否存在此条record
            const addRecord = commonRoot.children?.find(item => {
              return item.get('selectValue') === selectValue;
            });

            if (addRecord) {
              addRecord.set('hidden', false);
              addRecord.set('selectedId', selectedId);
            } else {
              record[parentIdField] = ROOT;
              const newRecord = {
                ...record, selectedId, selectValue, type: 'E', __id: `${value}-${record[parentIdField]}`,
              };
              dataSet.create(newRecord);
              if (getCheckedRealValues().includes(value)) {
                setCheckedKeys([...new Set([...checkedKeys, getKey(value, ROOT)])]);
              }
            }
            addCommonKeys(record[valueField]);
          }
        })
        .catch(e => {
          notification.error({ description: e.message });
        });
    }
  };

  return (
    <Tooltip title={contactFlag ? intl.get('hpfm.common.view.treenode.common.name.remove').d('取消常用联系人') : intl.get('hpfm.common.view.treenode.common.name.add').d('添加常用联系人')}>
      <Icon type={contactFlag ? 'star' : 'star_border'} onClick={updateTreeData} />
    </Tooltip>
  );
};

export default memo(ContactIcon);
