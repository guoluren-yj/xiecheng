/* eslint-disable no-param-reassign */
import React, { memo, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Tree } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { fetchExportData } from '@/services/serviceDefinitionService';

import {
  PRIMARY_FIELD,
  EXPAND_FIELD,
  findRelatedNode,
  deDuplicationArr,
  CHECK_FIELD,
  PARENT_FIELD,
  TEXT_FIELD,
  LEAF_FIELD,
  tagRenderer,
} from '../store';

function UnitTree({ treeCacheKeySet, checkedRecords, treeDs, unitTreeRef, onCheck }) {
  useImperativeHandle(unitTreeRef, () => ({
    filterDataByName,
    filterDataByKeys,
  }));
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    treeDs.status = DataSetStatus.loading;
    fetchExportData().then((res) => {
      if (getResponse(res)) {
        const data = transfromTreeToArr(res);
        setTableData(data);
        treeDs.loadData(data);
        // 初始化 treeCacheKeysSet
        treeCacheKeySet.clear();
        data.forEach((r) => treeCacheKeySet.add(r[PRIMARY_FIELD]));
        treeDs.status = DataSetStatus.ready;
      }
    });
  };

  const transfromTreeToArr = (treeData) => {
    const arr = [];
    if (treeData && treeData.length) {
      treeData.forEach((category, index) => {
        const { name: categoryName, childer } = category;
        arr.push({
          ...category,
          [PRIMARY_FIELD]: `cat_${index}`,
          [TEXT_FIELD]: categoryName,
        });
        if (childer && childer.length) {
          childer.forEach((item, itemIndex) => {
            if (item.type === 'DOCUMENT') {
              arr.push({
                ...item,
                [PRIMARY_FIELD]: `cat_${index}_doc_${itemIndex}`,
                [PARENT_FIELD]: `cat_${index}`,
                [TEXT_FIELD]: item.name,
              });
              if (item.childer && item.childer.length) {
                item.childer.forEach((service) => {
                  arr.push({
                    ...service,
                    [PRIMARY_FIELD]: service.id,
                    [PARENT_FIELD]: `cat_${index}_doc_${itemIndex}`,
                    [TEXT_FIELD]: service.name,
                    [LEAF_FIELD]: true,
                  });
                });
              }
            } else if (item.type === 'SERVICE') {
              arr.push({
                ...item,
                [PRIMARY_FIELD]: item.id,
                [PARENT_FIELD]: `cat_${index}`,
                [TEXT_FIELD]: item.name,
                [LEAF_FIELD]: true,
              });
            }
          });
        }
      });
    }
    return arr;
  };

  const checkDataIsChecked = (data) => {
    if (!data.length) {
      return [];
    }
    return data.map((item) => {
      const isChecked = checkedRecords.some(
        (record) => record[PRIMARY_FIELD] === item[PRIMARY_FIELD]
      );
      return {
        ...item,
        [CHECK_FIELD]: isChecked,
      };
    });
  };

  const filterDataByKeys = (keys) => {
    if (!keys.length || !tableData.length) {
      return [];
    }
    return tableData.filter((item) => keys.includes(item[PRIMARY_FIELD]));
  };

  const filterDataByName = (filterValue) => {
    if (!tableData.length) {
      return [];
    }
    let dataArr = [];
    if (!filterValue) {
      dataArr = tableData;
    } else {
      tableData.forEach((item) => {
        if (item[TEXT_FIELD] && item[TEXT_FIELD].includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_FIELD]));
        }
        if (item.code && item.code.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_FIELD]));
        }
      });
      dataArr = deDuplicationArr(dataArr);
      if (dataArr.length > 0) {
        dataArr = dataArr.map((item) => ({ ...item, [EXPAND_FIELD]: true }));
      }
    }
    if (checkedRecords.length > 0) {
      dataArr = checkDataIsChecked(dataArr);
    }
    treeDs.loadData(dataArr);
  };

  const nodeRenderer = useCallback(({ record }) => {
    const {
      code,
      serviceType,
      serviceTypeMeaning,
      [TEXT_FIELD]: text,
      [LEAF_FIELD]: isLeaf,
    } = record.get(['code', 'serviceType', 'serviceTypeMeaning', TEXT_FIELD, LEAF_FIELD]);
    if (isLeaf) {
      return (
        <div>
          <div style={{ color: '#000' }}>
            {tagRenderer(serviceType, serviceTypeMeaning)}
            {text}
          </div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{code}</div>
        </div>
      );
    } else {
      return (
        <div>
          <span style={{ fontWeight: 400, color: '#000' }}>{text}</span>
        </div>
      );
    }
  }, []);

  return (
    <Tree
      showLine={{ showLeafIcon: false }}
      checkable
      dataSet={treeDs}
      renderer={nodeRenderer}
      onCheck={onCheck}
    />
  );
}

export default memo(UnitTree);
