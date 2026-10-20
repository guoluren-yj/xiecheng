/**
 * ViewTree
 * lov个性化tree
 * @date: 2021-11-01
 * @author: Danica <ke.wang01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { action } from 'mobx';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import type { Record } from 'choerodon-ui/dataset';
import { Icon, Tree, Spin, Tooltip } from 'choerodon-ui/pro';
import { Size } from 'choerodon-ui/lib/_util/enum';
import flattenDeep from 'lodash/flattenDeep';
import ContactIcon from './ContactIcon';
import { CommonTreeProps } from './ContactLov';
import { getKey, ROOT } from './ViewRender';

const ViewTree = props => {
  const {
    dataSet,
    valueField,
    textField,
    commonTreeKeys,
    commonRootIndex,
    checkedKeys,
    setCheckedKeys,
    addCommonKeys,
    removeCommonKeys,
    lovConfig: {
      code,
      parentIdField = 'parentId',
      originData: { queryUrl: url = '' },
    },
    type,
    disabledKeys,
    multiple,
    getCheckedRealValues,
    lovPara = {},
  } = props;

  const [queryUrl] = useState(url.replace('{organizationId}', getCurrentOrganizationId()));
  const [isString] = useState(typeof disabledKeys[0] === 'string');

  const getRecords = (records) => {
    const res: any[] = [];
    [...records].map(item => {
      if (item.children) {
        res.push(getRecords(item.children));
      }
      return res.push(item);
    });
    return res;
  };

  const getAlreadyKeys = (records) => {
    const alreadyKeys: string[] = [];
    flattenDeep(getRecords(records)).forEach((item: any) => {
      alreadyKeys.push(getKey(item.get(valueField), item.get(parentIdField)));
    });
    return alreadyKeys;
  };

  // 根据请求数据取消选中record
  const asyncUnSelect = (data: any[] = []) => {
    // 修复异步请求后选择会产生同名联系人 by huazhen.wu01@hand-china.com
    const dataValues = data.reduce((set, item) => {
      set.add(item[valueField].toString());
      return set;
    }, new Set());
    dataSet.batchUnSelect(dataSet.filter((record) => {
      const value = record.get(valueField).toString();
      if (dataValues.has(value)) {
        record.setState('fakeSelected', false);
        if (record.parent) {
          record.setState('fakeSelected', false);
        }
        return true;
      }
      return false;
    }));
  };

  // 根据请求数据选中record
  const asyncSelect = (data: any[] = [], record) => {
    // 修复异步请求后选择会产生同名联系人 by huazhen.wu01@hand-china.com
    dataSet.appendData(data.map(item => {
      return { ...item, hidden: true };
    }), record);
    const dataValues = data.reduce((set, item) => {
      set.add(item[valueField].toString());
      return set;
    }, new Set());
    const checkedRealValues = getCheckedRealValues();
    dataSet.batchSelect(dataSet.filter(item => {
      const value = item.get(valueField).toString();
      if (dataValues.has(value) && item.get(parentIdField) !== ROOT && !checkedRealValues.includes(value)) {
        item.setState('fakeSelected', true);
        dataValues.delete(value);
        return true;
      }
      return false;
    }));
  };

  // 异步加载treeData
  const onLoadData = useCallback(
    async data => {
      const { record, checkEmployees } = data;
      return new Promise<void>(async resolve => {
        const value = record.get(valueField).toString();
        if (!record.get('hasNextFlag') || value === ROOT) {
          resolve();
          return;
        }
        if (checkEmployees) {
          record.setState('loading', true);
        }
        const res = await request(queryUrl, {
          method: 'GET',
          query: {
            id: record.get('id'),
            checkEmployees,
            ...lovPara,
          },
        });

        if (getResponse(res)) {
          // 批量勾选
          if (checkEmployees) {
            if (record.getState('fakeSelected')) {
              asyncSelect(res, record);
            } else {
              asyncUnSelect(res);
            }
          } else {
            dataSet.appendData([...res], record);
          }
        }
        if (checkEmployees) {
          record.setState('loading', false);
        }
        resolve();
      });
    },
    [dataSet, checkedKeys],
  );

  const updateExpanded = (e, record) => {
    if (record.get('type') === 'U' && e.target) {
      e.stopPropagation();
      const { offsetParent } = e.target;
      const checkbox = offsetParent && offsetParent.getElementsByClassName('c7n-tree-switcher')[0];
      if (checkbox) {
        checkbox.click();
      }
    }
  };

  // 渲染节点
  const onTreeNode = useCallback(
    ({ record }) => {
      // TODO: hasNextFlag type 作为组件参数传递
      const isLeaf = record.get('type') === 'E';
      const key = getKey(record.get(valueField), record.get(parentIdField));
      const nodeTitle = record.get(textField) || '---';
      const disabled = disabledKeys.includes(record.get(valueField)) || disabledKeys.includes(isString ? record.get('selectValue')?.toString() : Number(record.get('selectValue')));
      const tooltipProps = {
        dataSet,
        record: { ...record.data },
        addCommonKeys,
        removeCommonKeys,
        commonTreeKeys,
        checkedKeys,
        valueField,
        code,
        commonRootIndex,
        parentIdField,
        disabled,
        setCheckedKeys,
        getCheckedRealValues,
      };

      const titleDom = (<span className="title">{nodeTitle}</span>);
      const title = (
        <div className="title-container">
          <span onClick={(e) => updateExpanded(e, record)}>
            {isLeaf && (<Icon type="person" style={{ color: record.get('gender') ? '#3091F2' : ' #FC9300' }} />)}
            {isLeaf ? titleDom : <Tooltip title={nodeTitle}>{titleDom}</Tooltip>}
          </span>
          {isLeaf ? <ContactIcon {...tooltipProps} /> : null}
          {record.getState('loading') && <Spin size={Size.small} />}
        </div>
      );
      return {
        title,
        key,
        isLeaf,
        disabled,
        className: record.isSelected ? 'treenode-checked' : '',
      };
    },
    [dataSet, commonTreeKeys, checkedKeys],
  );

  // 选中
  const onCheckedRecord = action((record: Record) => {
    const value = record.get(valueField);
    const rootRecord = dataSet.get(commonRootIndex);
    const type = record.get('type');
    const hasNextFlag = record.get('hasNextFlag');
    if (type === 'U') {
      if (!multiple) {
        dataSet.unSelect(record);
      }
      if (!hasNextFlag || hasNextFlag && !record.children) {
        dataSet.unSelect(record);
      }
      if (!hasNextFlag || !multiple) return;
    }
    if (type === 'E') {
      // 叶子节点
      if (!multiple) {
        dataSet.unSelectAll();
      }
      if (record.index === -1) {
        const found = dataSet.find(item => item.get(valueField) === value && item.index !== -1);
        if (found) {
          dataSet.select(found);
        }
      } else {
        dataSet.select(record);
      }
    } else if (value === ROOT) {
      // 修复常用联系人点击无效果 by huazhen.wu01@hand-china.com
      if (rootRecord.children) {
        // 取消勾选常用联系人，防止提交时带上
        dataSet.unSelect(rootRecord);
        dataSet.batchSelect(rootRecord.children);
      }
    } else if (multiple) {
      record.setState('fakeSelected', true);
      // 取消勾选已存在的records
      const alreadyKeys: string[] = getAlreadyKeys([record]);
      setCheckedKeys([...new Set([...checkedKeys, ...alreadyKeys])]);
      // 加载所有叶子节点
      onLoadData({ record, checkEmployees: true });
    }
  });

  // 取消选中
  const onUnCheckedRecord = action((record: Record) => {
    const value = record.get(valueField);
    const type = record.get('type');
    const rootRecord = dataSet.get(commonRootIndex);
    record.setState('fakeSelected', false);
    if (record.parent) {
      record.setState('fakeSelected', false);
    }
    if (type === 'E') {
      const records = dataSet.filter(item => item.get(valueField) == value);
      if (!records.length) return;
      const data = flattenDeep(getRecords(records));
      dataSet.batchUnSelect([...records, ...data]);
    } else if (value === ROOT) {
      // 修复常用联系人点击无效果 by huazhen.wu01@hand-china.com
      if (rootRecord.children) {
        dataSet.batchUnSelect(rootRecord.children.map(item => {
          item.isSelected = true;
          return item;
        }));
      }
    } else if (multiple) {
      // 勾选已存在的records
      const alreadyKeys: string[] = getAlreadyKeys([record]);
      setCheckedKeys([...checkedKeys.filter(item => !alreadyKeys.includes(item))]);
      // 加载所有叶子节点
      onLoadData({ record, checkEmployees: true });
    }
  });

  const viewTreeProps = useMemo(() => {
    const props: any = {
      ...CommonTreeProps,
      dataSet,
      checkedKeys,
      selectable: !multiple,
      checkable: multiple,
      onLoad: (_, { node }) => {
        if (node.record.get(valueField) === ROOT || !node.record.children) return;
        const newRecords = [...node.record.children];
        const fakeSelected = node.record.getState('fakeSelected');
        if (newRecords?.length) {
          const addKeys: string[] = [];
          newRecords.forEach(item => {
            const value = item.get(valueField)?.toString();
            item.isSelected = node.record.isSelected;
            item.setState('fakeSelected', fakeSelected);
            if (getCheckedRealValues().includes(value)) {
              addKeys.push(getKey(value, item.get(parentIdField)));
            }
          });
          // 查询结果可能存在选中项，所以过滤一遍key
          setCheckedKeys([...new Set([...checkedKeys, ...addKeys])]);
        }
      },
      filter: record => {
        const isCommon = record.get(valueField) === ROOT || record.parent?.get(valueField) === ROOT;
        // 在搜索列表勾选后，临时存储的record
        const hidden = record.get('hidden');
        return type === 'common' ? isCommon && !hidden : !isCommon && !hidden;
      },
      onCheck: (_, e) => {
        const { node: { record }, checked, selected } = e;
        if ((multiple ? checked : selected) && !record.getState('fakeSelected')) {
          onCheckedRecord(record);
        } else {
          onUnCheckedRecord(record);
        }
      },
      onExpand: (_, node) => {
        const { expanded, record } = node.node;
        if (!expanded && record && record.children) {
          record.children.map(item => {
            if (item.get('hidden')) {
              item.set('hidden', false);
            }
          });
        }
      },
      loadData: onLoadData,
      onTreeNode,
    };
    if (!multiple) {
      props.onSelect = (_, node) => props.onCheck(_, node);
    }
    return props;
  }, [dataSet, commonTreeKeys, checkedKeys]);

  return (<Tree {...viewTreeProps} className='item-tree' />);
};

export default memo(ViewTree);
