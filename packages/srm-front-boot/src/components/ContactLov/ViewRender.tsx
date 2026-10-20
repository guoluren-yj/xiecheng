/**
 * ViewRender
 * lov弹窗自定义view
 * @date: 2021-11-01
 * @author: Danica <ke.wang01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, memo } from 'react';
import type { Record } from 'choerodon-ui/dataset';
import { getResponse } from 'utils/utils';
import { isUndefined } from 'lodash';
import intl from '@/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { getCommonService } from '@/services/ContactIcon';
import ViewTree from './ViewTree';
import ViewSearch from './ViewSearch';
import styles from './index.less';

export const ROOT = '__ROOTKEY__';
export const SEPARATOR = '__$$__';
export const getKey = (id, parentId) => {
  return `${id}${isUndefined(parentId) ? '' : SEPARATOR + parentId}`;
};

const ViewRender = props => {
  const {
    dataSet,
    textField,
    valueField,
    lovConfig,
    lovConfig: { parentIdField = 'parentId' },
    disabledKeys,
    multiple,
    treeData,
  } = props;
  const [searchEnabledFlag, setSearchEnabledFlag] = useState(false); // 开启搜索状态
  const [commonTreeKeys, setCommonTreeKeys] = useState<string[]>([]); // 常用联系人
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]); // 选中项
  const [commonRootIndex, setCommonRootIndex] = useState<number>(0); // 常用联系人 根节点的index

  // 初始化常用联系人
  const initCommonKeys = async () => {
    if (searchEnabledFlag) return;
    // 是否存在常用联系人节点
    const commonRootRecord = dataSet.find(item => item.get(valueField) === ROOT);
    let keys: string[] = [];
    if (commonRootRecord) {
      keys = commonRootRecord.children?.map(item => item.get(valueField)) || [];
      setCommonRootIndex(commonRootRecord.index);
      setCommonTreeKeys(keys);
    } else {
      const res = await getCommonService({ viewCode: lovConfig.code });
      if (getResponse(res)) {
        const children = res.map(item => {
          keys.push(item.selectValue);
          const { id: selectedId, selectValueMeaning, selectValue } = item;
          item[textField] = selectValueMeaning;
          item[valueField] = selectValue;
          item[parentIdField] = ROOT;
          return { ...item, type: 'E', hasNextFlag: 0, selectedId, selectValue, __id: `${selectValue}-${ROOT}` };
        });
        const rootValue = {};
        rootValue[valueField] = ROOT;
        const commonRecord = dataSet.create({
          ...rootValue,
          name: intl.get('hpfm.common.view.treenode.common.name').d('常用联系人'),
          children: [],
          id: ROOT,
          hasNextFlag: 1,
          type: 'U',
          __id: ROOT,
        });
        dataSet.appendData(children, commonRecord);
        setCommonRootIndex(commonRecord.index);
        setCommonTreeKeys(keys);
      }
    }
    initCheckedKeys(keys);
  };

  // 初始化选中列表
  const initCheckedKeys = (list) => {
    const keys: string[] = [];
    dataSet.treeSelected.forEach((item: Record) => {
      const value = item.get(valueField);
      keys.push(getKey(value, item.get(parentIdField)));
      if (list.includes(value)) {
        keys.push(getKey(value, ROOT));
      }
    });
    setCheckedKeys(keys);
  };

  // 添加常用联系人
  const addCommonKeys = (value: string) => {
    const newData = [...commonTreeKeys, value];
    setCommonTreeKeys(newData);
  };

  // 删除常用联系人
  const removeCommonKeys = (value: string) => {
    const newData = commonTreeKeys.filter(item => item != value);
    setCommonTreeKeys(newData);
    if (!newData.length) {
      dataSet.unSelect(dataSet.get(commonRootIndex));
    }
  };

  const getCheckedRealValues = () => {
    return checkedKeys.map(item => item.split(SEPARATOR)[0]);
  };

  // 选中项values
  const getCheckedValues = dataSet => {
    return dataSet.treeSelected.map(item => {
      return item.get(valueField).toString();
    });
  };

  const onSelect = ({ dataSet }) => {
    const values = getCheckedValues(dataSet);
    const sameRecordKeys: string[] = [];
    dataSet.forEach(item => {
      const value = item.get(valueField);
      if (values.includes(value.toString())) {
        sameRecordKeys.push(getKey(value, item.get(parentIdField)));
      }
    });
    setCheckedKeys((pre) => ([...new Set( multiple ? [...pre, ...sameRecordKeys] : [...sameRecordKeys])]));
  };

  const onUnSelect = ({ dataSet }) => {
    if (multiple) {
      const values = getCheckedValues(dataSet);
      setCheckedKeys((pre) => (
        pre.filter(item =>
          values.includes(item.split(SEPARATOR)[0])
        )
      ));
    } else {
      setCheckedKeys([]);
    }
  };

  useEffect(() => {
    if (treeData.length) {
      dataSet.appendData(treeData);
      initCommonKeys();
    }
  }, [treeData]);

  useEffect(() => {
    if (dataSet.status === 'ready') {
      initCommonKeys();
    }
    dataSet.addEventListener('load', initCommonKeys);
    return () => {
      dataSet.removeEventListener('load', initCommonKeys);
      if (dataSet.selected.length === 0) {
        dataSet.reset();
      }
    };
  }, [dataSet]);

  useEffect(() => {
    dataSet.addEventListener('batchSelect', onSelect);
    dataSet.addEventListener('batchUnSelect', onUnSelect);
    return () => {
      dataSet.removeEventListener('batchSelect', onSelect);
      dataSet.removeEventListener('batchUnSelect', onUnSelect);
    };
  }, [dataSet]);

  // 联系人列表props
  const treeProps = {
    dataSet,
    valueField,
    textField,
    searchEnabledFlag,
    commonTreeKeys,
    commonRootIndex,
    setSearchEnabledFlag,
    checkedKeys,
    setCheckedKeys,
    addCommonKeys,
    removeCommonKeys,
    disabledKeys,
    multiple,
    getCheckedRealValues,
    ...props,
  };

  return (
    <div className={styles['view-tree-container']}>
      {!treeData.length && <ViewSearch {...treeProps} />}
      <div
        style={{ overflowX: 'auto', display: searchEnabledFlag ? 'none' : 'block' }}
        className={styles['view-tree-container']}
      >
        <ViewTree {...treeProps} type="common" />
        <ViewTree {...treeProps} />
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['hpfm.common'],
})(memo(ViewRender));

