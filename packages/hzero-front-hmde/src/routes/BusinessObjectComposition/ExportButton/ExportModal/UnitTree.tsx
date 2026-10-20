import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Tree, DataSet } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { isNil } from 'lodash';

import { getResponse } from 'utils/utils';
import { queryTemplateTree } from '../../../../services/businessObjectService';
import {
  PRIMARY_KEY,
  EXPAND_KEY,
  treeToArr,
  findRelatedNode,
  deDuplicationArr,
  CHECK_KEY,
} from '../store';

const UnitTree = ({ treeDataCacheKeys, checkedRecords, treeDs, unitTreeRef, onCheck }: {
  treeDataCacheKeys: Set<any>;
  checkedRecords: any[];
  treeDs: DataSet;
  unitTreeRef: any;
  onCheck: () => void;
}) => {
  useImperativeHandle(unitTreeRef, () => ({
    filterDataByName,
    filterDataByKeys,
  }));
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // eslint-disable-next-line no-param-reassign
    treeDs.status = DataSetStatus.loading;
    queryTemplateTree().then(res => {
      if (getResponse(res) && res && res.combines) {
        const data = treeToArr(res.combines);
        // const data = transformTreeDataChildren(res);
        setTableData(data);
        treeDataCacheKeys.clear();
        data.forEach(r => treeDataCacheKeys.add(r[PRIMARY_KEY]));
        // eslint-disable-next-line no-param-reassign
        treeDs.status = DataSetStatus.ready;
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
    let dataArr: any[] = [];
    if (!filterValue) {
      dataArr = tableData;
    } else {
      tableData.forEach(item => {
        if (item.combineCode && item.combineCode.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_KEY]));
        }
        if (item.combineName && item.combineName.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_KEY]));
        }
        if (item.templateCode && item.templateCode.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_KEY]));
        }
        if (item.templateName && item.templateName.includes(filterValue)) {
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

  const nodeRenderer = useCallback(
    ({ record }) => {
      const { name, combineName, templateName, templateCode } = record.get([
        'name',
        'combineName',
        'templateName',
        'templateCode',
      ]);
      const isUnit = !isNil(templateCode);
      const nameStyle = isUnit ? { fontWeight: 400 } : {};
      return (
        <div>
          <div>
            <span style={nameStyle}>{combineName || name || templateName}</span>
          </div>
          {isUnit && <div style={{ color: 'rgba(0,0,0,0.45)' }}>{templateCode}</div>}
        </div>
      );
    },
    []
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
