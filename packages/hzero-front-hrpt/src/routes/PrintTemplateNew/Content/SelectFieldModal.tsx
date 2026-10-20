import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DataSet, Table, Form, TextField, Button } from 'choerodon-ui/pro';
import { Record } from 'choerodon-ui/dataset';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isNil } from 'lodash';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { queryCanAddModelField } from '@/services/printTemplateService';
import { treeIdField, treeParentIdField, treeTypeField, treeExpandField } from '../store';
import { TableMode } from 'choerodon-ui/pro/lib/table/enum';

interface ISelectFieldModal {
  docId: string;
  dataSet: DataSet;
  modalRef: any;
  lineRecord: Record;
  handleModalSubmit: Function;
}

const SelectFieldModal: FC<ISelectFieldModal> = ({
  docId,
  dataSet: tableDs,
  modalRef,
  lineRecord,
  handleModalSubmit,
}) => {
  const formDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'fieldCode',
          label: intl.get('hrpt.printTemplate.model.fieldCode').d('字段编码'),
        },
        {
          name: 'fieldName',
          label: intl.get('hrpt.printTemplate.model.fieldName').d('字段名称'),
        },
      ]
    });
  }, []);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    tableDs.status = DataSetStatus.loading;
    const res = await queryCanAddModelField(docId);
    if (getResponse(res) && res) {
      const data: any[] = transformData(res);
      setTableData(data);
      tableDs.loadData(data);
    } else {
      setTableData([]);
    }
    tableDs.status = DataSetStatus.ready;
  };

  const transformData = useCallback((masterObject) => {
    const result: any[] = [];

    const _func = (object, parentId = '') => {
      const { businessObjectRelationFieldList, businessObjectName, businessObjectRelationList, businessObjectRelationId, relateType } = object;
      if (relateType === 'MASTER') {
        result.push({
          fieldName: businessObjectName,
          [treeIdField]: businessObjectRelationId,
          [treeParentIdField]: null,
          [treeTypeField]: 'object',
        });
      }
      if (businessObjectRelationFieldList && businessObjectRelationFieldList.length > 0) {
        businessObjectRelationFieldList.forEach(fieldItem => {
          const { businessObjectFieldCode, businessObjectFieldName } = fieldItem;
          result.push({
            modelCode: businessObjectRelationId,
            fieldCode: businessObjectFieldCode,
            fieldName: businessObjectFieldName,
            [treeIdField]: `${businessObjectRelationId}-${businessObjectFieldCode}`,
            [treeParentIdField]: relateType === 'MASTER' ? businessObjectRelationId : parentId,
            [treeTypeField]: 'field',
          });
        });
      }
      if (businessObjectRelationList && businessObjectRelationList.length > 0) {
        businessObjectRelationList.forEach(objItem => {
          const { businessObjectRelationId: childBusinessObjectRelationId, relBusinessObjectFieldName } = objItem;
          const _id = `${businessObjectRelationId}-${childBusinessObjectRelationId}`
          result.push({
            modelCode: childBusinessObjectRelationId,
            // fieldCode: businessObjectFieldCode,
            fieldName: relBusinessObjectFieldName,
            [treeIdField]: _id,
            [treeParentIdField]: relateType === 'MASTER' ? businessObjectRelationId : parentId,
            [treeTypeField]: 'object',
          });
          _func(objItem, _id);
        });
      }
    }
    _func(masterObject);
    return result;
  }, []);

  const handleSearch = useCallback(() => {
    if (tableData.length === 0) {
      tableDs.loadData([]);
      return;
    }
    if (!formDs.current) {
      tableDs.loadData(tableData);
      return;
    }
    const { fieldCode, fieldName } = formDs.current.get(['fieldCode', 'fieldName']);
    if (isNil(fieldCode) && isNil(fieldName)) {
      tableDs.loadData(tableData);
    } else if (tableData && tableData.length > 0) {
      const filterDataLsit: any[] = tableData.filter((item) => {
        let flag = true;
        if (!isNil(fieldCode)) {
          flag = !!item.fieldCode && item.fieldCode.includes(fieldCode);
        }
        if (flag && !isNil(fieldName)) {
          flag =
            !!item.fieldName &&
            item.fieldName.includes(fieldName);
        }
        return flag;
      });
      const filterDataParentList: any[] = [];
      const filterDataParentMap = {};
      const _filterPartent = (child) => {
        if (child[treeParentIdField] && !filterDataParentMap[child[treeParentIdField]]) {
          const parentData = tableData.find(parent => parent[treeIdField] === child[treeParentIdField]);
          filterDataParentList.push({ ...parentData, [treeExpandField]: true });
          filterDataParentMap[parentData.treeIdField] = true;
          _filterPartent(parentData);
        }
      }
      if (filterDataLsit.length > 0) {
        filterDataLsit.forEach(child => {
          _filterPartent(child);
        });
      }
      tableDs.loadData([...filterDataLsit, ...filterDataParentList]);
    }
  }, [tableData, tableDs]);

  const handleReset = useCallback(() => {
    formDs.loadData([]);
  }, [formDs]);

  const columns = useMemo(() => {
    return [
      { name: 'fieldName' },
      { name: 'fieldCode' },
    ]
  }, []);

  const handleSelet = useCallback(({ dataSet, record }) => {
    if (dataSet && record && record.selectable) {
      dataSet.select(record);
      const flag = handleModalSubmit(tableDs, lineRecord);
      if (flag && modalRef.current && modalRef.current.close) {
        modalRef.current.close();
      }
    }
  }, [tableDs, lineRecord]);

  const onRow = useCallback((row) => {
    return {
      onDoubleClick: () => handleSelet(row),
    }
  }, [handleSelet]);

  return (
    <>
      <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
        <Form
          dataSet={formDs}
          columns={2}
          labelLayout={LabelLayout.float}
          style={{ flex: 'auto' }}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              handleSearch();
            }
          }}
        >
          <TextField name="fieldName" />
          <TextField name="fieldCode" />
        </Form>
        <div
          style={{
            marginLeft: '16px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button onClick={handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color={ButtonColor.primary} onClick={handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </div>
      </div>
      <Table
        dataSet={tableDs}
        columns={columns}
        onRow={onRow}
        mode={TableMode.tree}
        style={{maxHeight: "400px"}}
      />
    </>
  )
};

export default SelectFieldModal;