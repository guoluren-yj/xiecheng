/**
 * ViewSearch
 * lov弹窗自定义搜索列表
 * @date: 2021-11-01
 * @author: Danica <ke.wang01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useMemo, useState, memo, useCallback } from 'react';
import { Spin, TextField } from 'choerodon-ui/pro';
import { Icon, Tree } from 'choerodon-ui';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { getResponse, getCurrentTenant } from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import intl from '@/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ContactIcon from './ContactIcon';
import { CommonTreeProps } from './ContactLov';
import styles from './index.less';
import { ROOT, getKey, SEPARATOR } from './ViewRender';

const { TreeNode } = Tree;
const isSTARBUCKS = getCurrentTenant().tenantNum === 'SRM-STARBUCKS';

const ViewSearch = props => {
  const {
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
    lovConfig: { code, parentIdField = 'parentId' },
    disabledKeys,
    multiple,
    getCheckedRealValues,
    lovPara = {},
  } = props;
  const [searchList, setSearchList] = useState<any>([]); // 搜索列表
  const [spinning, setSpinning] = useState(false); // 搜索状态
  const [searchValue, setSearchValue] = useState('');

  // 拼接部门路径
  const initRecordsPath = (data, pathName = '', path: any[] = []) => {
    data.forEach(item => {
      if (item.childrenCount) {
        initRecordsPath(item.children, `${pathName }/${ item[textField]}`, path);
      }
      item.pathName = pathName;
      if (!item.children) {
        path.push(item);
      }
    });
    return path;
  };

  // 整理records data
  const records = useMemo(() => {
    if (!searchList.length) return [];
    const addKeys: string[] = [];
    const commonRecords: any[] = [];
    const otherRecords: any[] = [];
    searchList.forEach(item => {
      const value = item[valueField]?.toString();
      if (commonTreeKeys.includes(value)) {
        commonRecords.push({ ...item });
      } else {
        otherRecords.push(item);
      }
      if (getCheckedRealValues().includes(value)) {
        addKeys.push(getKey(item[valueField], item[parentIdField]));
      }
    });
    // 查询结果可能存在选中项，所以过滤一遍key
    setCheckedKeys([...new Set([...checkedKeys, ...addKeys])]);
    return [...commonRecords, ...otherRecords];
  }, [dataSet, searchList]);

  const getHighlight = text => {
    if (!text) return '---';
    const index = text.indexOf(searchValue);
    if (index === -1) return text;
    const beforeStr = text.substr(0, index);
    const afterStr = text.substr(index + searchValue.length);
    return [beforeStr, <span className='hl'>{searchValue}</span>, afterStr];
  };

  // 加载数据
  const loopData = useMemo(() => {
    if (!records.length) {
      return null;
    }
    return records.map(item => {
      const disabled = disabledKeys.includes(item[valueField]);
      const tooltipProps = {
        dataSet,
        record: item,
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
      const titleStr = getHighlight(`${item[textField]}${isSTARBUCKS ? '' : `(${item[valueField]})`}`);
      const pathStr = getHighlight(item.pathName.slice(1));
      const title = (
        <>
          <div className="title-container">
            <span>
              <Icon type="person" style={{ color: item.gender ? '#3091F2' : ' #FC9300' }} />
              <span className="title">{titleStr} </span>
            </span>
            <ContactIcon {...tooltipProps} />
          </div>
          <div className="title-path">{pathStr}</div>
        </>
      );
      const key = getKey(item[valueField], item[parentIdField]);
      return <TreeNode key={key} title={title} disabled={disabled} />;
    });
  }, [dataSet, records, checkedKeys, commonTreeKeys, commonRootIndex]);

  // 超长数据提示
  const maxLengthRender = useMemo(() => {
    if (records.length === 100) {
      return (
        <div className={styles['search-max-tip']}>
          {intl
            .get('srm.contactlov.view.tip.maxlength')
            .d('查询结果仅展示前100条， 请输入更多信息缩小查询范围!')}
        </div>
      );
    }
    return null;
  }, [records]);

  // 空数据提示
  const emptyRender = useMemo(() => {
    if (records.length === 0) {
      return <div className={styles['search-empty-tip']}>{$l('Table', 'empty_data')}</div>;
    }
    return null;
  }, [records]);

  // 点击同步dataSet
  const onCheck = useCallback(
    (_, info: any) => {
      const { key } = info.node;
      const eventKey = key.split(SEPARATOR)[0];
      const record = dataSet.find(item => item.get(valueField) == eventKey);
      let value: any;
      if (info.checked) {
        if (!multiple) {
          dataSet.unSelectAll();
        }
        if (record) {
          dataSet.select(record);
          value = record.get(valueField);
        } else {
          // dataSet中不存在此条record时需手动create，用于右侧选中列表展示
          const recordData = searchList.find(item => item[valueField] == eventKey);
          if (!recordData) return;
          const newRecord = dataSet.create({
            ...recordData,
            hidden: true,
            __id: `${recordData[valueField]}-${ROOT}`,
          });
          dataSet.select(newRecord);
          value = newRecord.get(valueField);
        }
        const sameKeys: string[] = [];
        records.forEach(item => {
          if (item[valueField] == value) {
            sameKeys.push(getKey(value, item[parentIdField]));
          }
        });
        if (multiple) {
          dataSet.filter(item => {
            if (item.get(valueField) == value) {
              sameKeys.push(getKey(value, item.get(parentIdField)));
            }
          });
          setCheckedKeys([...new Set([...checkedKeys, key, `${eventKey}${SEPARATOR}${ROOT}`, ...sameKeys])]);
        } else {
          setCheckedKeys([...new Set([key, `${eventKey}${SEPARATOR}${ROOT}`, ...sameKeys])]);
        }
      } else {
        dataSet.unSelect(dataSet.selected.find(item => item.get(valueField) == eventKey));
        setCheckedKeys(checkedKeys.filter(item => item.split(SEPARATOR)[0] != eventKey));
        if (!dataSet.treeSelected.length) {
          dataSet.unSelectAll();
        }
      }
    },
    [dataSet, checkedKeys, searchList]
  );

  // 搜索
  const onSearch = useCallback(value => {
    if (!value) {
      onClear();
      return;
    };
    setSpinning(true);
    setSearchEnabledFlag(true);
    setSearchValue(value);
    request(dataSet.performance.url, {
      method: 'GET',
      query: { nameOrCode: value, ...lovPara, enabledShowUnit: true },
    })
      .then(res => {
        if (getResponse(res)) {
          setSearchList(initRecordsPath(res));
        }
        setSpinning(false);
      })
      .catch(e => {
        notification.error({ description: e.message });
      });
  }, []);

  // 清除
  const onClear = useCallback(() => {
    // setSearchValue('');
    setSearchEnabledFlag(false);
    setSearchValue('');
  }, []);

  return (
    <>
      <div className={styles['search-top']}>
        <TextField
          placeholder={intl.get('hpfm.common.view.input.placeholder').d('请输入员工编码、名称查询')}
          prefix={<Icon type="search" />}
          value={searchValue}
          clearButton
          onClear={onClear}
          onChange={onSearch}
        />
      </div>
      {searchEnabledFlag && (
        <Spin spinning={spinning}>
          {spinning || records.length > 0 ? (
            <div>
              {maxLengthRender}
              <Tree
                {...CommonTreeProps}
                onCheck={onCheck}
                checkedKeys={checkedKeys}
                className={styles['search-tree']}
              >
                {loopData}
              </Tree>
            </div>
          ) : (
            emptyRender
          )}
        </Spin>
      )}
    </>
  );
};
export default formatterCollections({
  code: ['hpfm.common', 'srm.contactlov'],
})(memo(ViewSearch));
