import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Tree } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { isNil } from 'lodash';

import { getResponse } from 'utils/utils';
import { queryTree } from '@/services/customizeConfigService';
import { unitTypeColorMap } from '@/utils/constConfig.js';
import {
  PRIMARY_KEY,
  EXPAND_KEY,
  treeToArr,
  findRelatedNode,
  deDuplicationArr,
  CHECK_KEY,
} from '../store';

const UnitTree = ({ treeDataCacheKeys, checkedRecords, treeDs, unitTreeRef, unitTypeObj, onCheck }) => {
  useImperativeHandle(unitTreeRef, () => ({
    filterDataByName,
    filterDataByKeys,
  }));
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // eslint-disable-next-line no-param-reassign
    treeDs.status = 'loading';
    queryTree({
      loadUnit: true,
      onlyHasCuszUnitGroup: true,
    }).then(res => {
      if (getResponse(res)) {
        const data = treeToArr(res);
        // const data = transformTreeDataChildren(res);
        setTableData(data);
        treeDataCacheKeys.clear();
        data.forEach(r => treeDataCacheKeys.add(r[PRIMARY_KEY]));
        // eslint-disable-next-line no-param-reassign
        treeDs.status = 'ready';
        treeDs.loadData(data);
      }
    });
  };

  const checkDataIsChecked = data => {
    if (!data.length) {
      return [];
    }
    return data.map(item => {
      const isChecked = checkedRecords.some(record => record[PRIMARY_KEY] === item[PRIMARY_KEY]);
      return {
        ...item,
        [CHECK_KEY]: isChecked,
      };
    });
  };

  const filterDataByKeys = keys => {
    if (!keys.length || !tableData.length) {
      return [];
    }
    return tableData.filter(item => keys.includes(item[PRIMARY_KEY]));
  };

  const filterDataByName = filterValue => {
    if (!tableData.length) {
      return [];
    }
    let dataArr = [];
    if (!filterValue) {
      dataArr = tableData;
    } else {
      tableData.forEach(item => {
        if (item.code && item.code.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_KEY]));
        }
        if (item.name && item.name.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_KEY]));
        }
      });
      dataArr = deDuplicationArr(dataArr);
      if (dataArr.length > 0) {
        dataArr = dataArr.map(item => ({ ...item, [EXPAND_KEY]: true }));
      }
    }
    if (checkedRecords.length > 0) {
      dataArr = checkDataIsChecked(dataArr);
    }
    treeDs.loadData(dataArr);
  };

  const tagRenderer = useCallback(
    value => (!value ? null : <Tag color={unitTypeColorMap[value]}>{unitTypeObj[value]}</Tag>),
    [unitTypeObj]
  );

  const nodeRenderer = useCallback(
    ({ record }) => {
      const { name, unitName, code, unitType } = record.get([
        'name',
        'code',
        'unitName',
        'unitType',
      ]);
      const isUnit = !isNil(unitName);
      const icon = isUnit ? tagRenderer(unitType) : null;
      const nameStyle = isUnit ? { fontWeight: 400 } : null;
      return (
        <div>
          <div>
            {icon}
            <span style={nameStyle}>{name}</span>
          </div>
          {isUnit && <div style={{ color: 'rgba(0,0,0,0.45)' }}>{code}</div>}
        </div>
      );
    },
    [unitTypeObj]
  );

  return (
    <Tree
      showLine={{ showLeafIcon: false }}
      checkable
      dataSet={treeDs}
      renderer={nodeRenderer}
      onCheck={onCheck}
    />
  );
};

export default UnitTree;
