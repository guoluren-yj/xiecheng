import React, { memo, useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Tree } from 'choerodon-ui/pro';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryReportDirectory } from '../../../../services/printTemplateService';
import { DataSet } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import {
  PRIMARY_FIELD,
  EXPAND_FIELD,
  findRelatedNode,
  deDuplicationArr,
  CHECK_FIELD,
  IDirectory,
  TYPE_FIELD,
  TreeNodeType,
  PARENT_FIELD,
  TEXT_FIELD,
  ITreeNodeData,
} from './store';

interface IUnitTree {
  treeCacheKeySet: Set<string | number>;
  treeDs: DataSet;
  checkedRecords: ITreeNodeData[],
  unitTreeRef: any,
  onCheck: () => void;
}

function UnitTree({ treeCacheKeySet, checkedRecords, treeDs, unitTreeRef, onCheck }: IUnitTree) {
  useImperativeHandle(unitTreeRef, () => ({
    filterDataByName,
    filterDataByKeys,
  }));
  const [tableData, setTableData] = useState<ITreeNodeData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    treeDs.status = DataSetStatus.loading;
    queryReportDirectory().then(res => {
      if (getResponse(res)) {
        const data = transfromTreeToArr(res);
        setTableData(data);
        treeDs.loadData(data);
        // 初始化 treeCacheKeysSet
        treeCacheKeySet.clear();
        data.forEach(r => treeCacheKeySet.add(r[PRIMARY_FIELD]));
        treeDs.status = DataSetStatus.ready;
      }
    });
  };

  const transfromTreeToArr = (treeData: IDirectory[]): ITreeNodeData[] => {
    const arr: ITreeNodeData[] = [];
    if (treeData && treeData.length) {
      treeData.forEach(dir => {
        const { linkCode, parentLinkCode, directoryName, printDocumentList } = dir;
        arr.push({
          ...dir,
          [PRIMARY_FIELD]: linkCode,
          [PARENT_FIELD]: parentLinkCode,
          [TEXT_FIELD]: directoryName,
          [TYPE_FIELD]: TreeNodeType.DIRECTORY,
        });
        if (printDocumentList && printDocumentList.length) {
          printDocumentList.forEach(doc => {
            const { docCode, docName, printReportList } = doc;
            arr.push({
              ...doc,
              [PRIMARY_FIELD]: docCode,
              [PARENT_FIELD]: linkCode,
              [TEXT_FIELD]: docName,
              [TYPE_FIELD]: TreeNodeType.DOCUMENT,
            });
            if (printReportList && printReportList.length) {
              printReportList.forEach(report => {
                const { reportCode, reportName } = report;
                arr.push({
                  ...report,
                  [PRIMARY_FIELD]: `REPORTCODE:${reportCode}`,
                  [PARENT_FIELD]: docCode,
                  [TEXT_FIELD]: reportName,
                  [TYPE_FIELD]: TreeNodeType.REPORT,
                })
              });
            }
          });
        }
      })
    }
    return arr;
  };

  const checkDataIsChecked = (data: ITreeNodeData[]) => {
    if (!data.length) {
      return [];
    }
    return data.map(item => {
      const isChecked = checkedRecords.some(record => record[PRIMARY_FIELD] === item[PRIMARY_FIELD]);
      return {
        ...item,
        [CHECK_FIELD]: isChecked,
      };
    });
  };

  const filterDataByKeys = (keys: (string | number)[]): ITreeNodeData[] => {
    if (!keys.length || !tableData.length) {
      return [];
    }
    return tableData.filter(item => keys.includes(item[PRIMARY_FIELD]));
  };

  const filterDataByName = (filterValue?: string) => {
    if (!tableData.length) {
      return [];
    }
    let dataArr: ITreeNodeData[] = [];
    if (!filterValue) {
      dataArr = tableData;
    } else {
      tableData.forEach(item => {
        if (item[TEXT_FIELD] && item[TEXT_FIELD].includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_FIELD]));
        }
        if (item.reportCode && item.reportCode.includes(filterValue)) {
          dataArr.push(item);
          dataArr.push(...findRelatedNode(tableData, item[PRIMARY_FIELD]));
        }
      });
      dataArr = deDuplicationArr(dataArr);
      if (dataArr.length > 0) {
        dataArr = dataArr.map(item => ({ ...item, [EXPAND_FIELD]: true }));
      }
    }
    if (checkedRecords.length > 0) {
      dataArr = checkDataIsChecked(dataArr);
    }
    treeDs.loadData(dataArr);
  };

  const nodeRenderer = useCallback(
    ({ record }) => {
      const { reportCode, [TEXT_FIELD]: text, [TYPE_FIELD]: type } = record.get([
        TEXT_FIELD,
        'reportCode',
        TYPE_FIELD,
      ]);
      const isReport = type === TreeNodeType.REPORT;
      return (
        <div>
          <div>
            <span style={isReport ? { fontWeight: 400 } : {}}>{text}</span>
          </div>
          {isReport && <div style={{ color: 'rgba(0,0,0,0.45)' }}>{reportCode}</div>}
        </div >
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

export default memo(UnitTree);
