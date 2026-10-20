/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 19:50:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-23 19:42:35
 */
import React, { useMemo, useEffect, useContext } from 'react';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { useDataSet, Tooltip } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import HeaderDs from '../stores/HeaderDs';
import ListDs from '../stores/ListDs';

import { Store } from '../stores';
// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

// 变更中状态的行展示逻辑
const LineChangeTable = function LineChangeTable({
  columns = [],
  code,
  buttons,
  onRow,
  selectionMode,
  buttonCode,
}) {
  const { headerDs, listDs, prSourcePlatform, customizeTable, remote, location } = useContext(
    Store
  );

  const { current } = headerDs;

  // 变更前的ds
  const beforelistDs = useDataSet(
    () =>
      ListDs({
        source: 'inquery',
      }),
    []
  );

  const beforeHeaderDs = useDataSet(
    () =>
      HeaderDs({
        listDs,
      }),
    [beforelistDs]
  );

  // 变更前
  const handleUpdate = ({ dataSet }) => {
    beforelistDs.loadData([]);

    dataSet.forEach((record) => {
      const changeFiledMap = record.get('changeFiledMap');

      const changeFileds = Object.keys(changeFiledMap || {});

      // 改变的lov对应映射 name-展示文本
      const changeLovTextMap = {};

      // beforelistDs 获取数据
      const beforeRecord = beforelistDs.create({
        ...record.toData(),
        ...changeFiledMap,
      });

      // 改变的值可能是值集
      changeFileds.forEach((ele) => {
        const filed = beforeRecord.getField(ele);
        if (filed && filed.get('bind')) {
          const changeLovName = filed.get('bind').split('.')[0];
          const changeLovFiled = beforeRecord.getField(changeLovName);
          changeLovTextMap[changeLovName] = changeLovFiled.getText();
        }
      });

      // 将改变的 Lov 的属性赋值上去
      beforeRecord.set({
        changeFiledMap: {
          ...changeFiledMap,
          ...changeLovTextMap,
        },
      });
    });
  };

  // 渲染变更前的
  const renderChangeField = ({ value, record, name, text, dataSet }, renderFunc) => {
    const beforeRecord = beforelistDs.get(listDs.indexOf(record));

    const result = isFunction(renderFunc)
      ? renderFunc({ value, record, name, text, dataSet })
      : text;

    if (beforeRecord) {
      const changeFiledMap = beforeRecord.get('changeFiledMap');

      const changeFileds = Object.keys(changeFiledMap || {});

      if (changeFileds.includes(name)) {
        const beforeValue = beforeRecord.get(name);

        const beforeText = changeFiledMap[name];

        // 改变了的字段
        const beforeResult = isFunction(renderFunc)
          ? renderFunc({
              value: beforeValue,
              record: beforeRecord,
              name,
              text: beforeText,
              dataSet: beforelistDs,
            })
          : beforeText;

        return (
          <Tooltip
            title={intl
              .get(`${commonPrompt}.beforeChanged`, {
                value: beforeResult,
              })
              .d(`变更前：${beforeResult}`)}
          >
            <span style={{ color: 'red' }}> {result || '-'} </span>
          </Tooltip>
        );
      }
    }
    if (record.get('changeInsertFlag') === 1 && name === 'displayLineNum') {
      return (
        <Tooltip title={intl.get(`${commonPrompt}.addLine`).d(`新增行`)}>
          <span style={{ color: 'red' }}> {result || '-'} </span>
        </Tooltip>
      );
    }
    return result;
  };

  useEffect(() => {
    // beforeHeaderDs.loadData([current ? current.toData() : {}]);

    // beforeHeaderDs.loadData([{}]);
    // beforeHeaderDs.create(current ? current.toData() : {});
    listDs.addEventListener('load', handleUpdate);

    return () => {
      listDs.removeEventListener('load', handleUpdate);
    };
  }, [beforelistDs, beforeHeaderDs, current]);

  const newColums = useMemo(() => {
    // 不会改变的字段
    const noChangefields = [
      'customAttributeList',
      'lastPurPrice',
      'executionBillDetail',
      'productSpecsJson',
      'attachmentUuid',
      'customSpecsJson',
      'executorName',
      'occupiedQuantity',
      'changeQuantity',
      'executionHeaderBillNum',
      'sourceOccupiedQuantity',
      'restSourceQuantity',
      'orderOccupiedQuantity',
      'restPoQuantity',
      'secondLevelStrategyCode',
      'sourceExecuteStatus',
      'orderExecuteStatus',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'changeAttachmentUuid',
      'secondaryQuantity',
      'secondaryUomId',
      'secondaryTaxInUnitPrice',
    ];

    if (prSourcePlatform === 'ERP') {
      noChangefields.push('prRequestedName');
    }

    return columns.map((ele) => {
      const renderFunc = ele.renderer;
      return {
        ...ele,
        renderer: !noChangefields.includes(ele.name)
          ? ({ value, record, name, text, dataSet }) =>
              renderChangeField({ value, record, name, text, dataSet }, renderFunc)
          : renderFunc,
      };
    });
  }, [columns, beforelistDs, handleUpdate, renderChangeField]);

  const cuxTableProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_LINE_CHANGE_TABLE',
    {},
    {
      code,
      headerDs,
      listDs,
      newColums,
      buttons,
      selectionMode,
      location,
    }
  );

  return customizeTable(
    {
      code,
      dataSet: listDs,
      custLoading: false,
      lovIgnore: false,
      buttonCode: buttonCode || 'SPRM.PURCHASE_PLAFORM_CANCEL.TABLE_BTN',
    },
    <SearchBarTable
      style={{ maxHeight: '450px' }}
      dataSet={listDs}
      columns={newColums}
      buttons={buttons}
      code="queryTable"
      onRow={onRow}
      selectionMode={selectionMode}
      pagination={{
        pageSizeOptions: ['10', '20', '50', '100', '200'],
      }}
      searchCode={`${code}_SEARCHBAR`}
      virtual
      virtualSpin
      virtualCell
      {...cuxTableProps}
    />
  );
};

export default LineChangeTable;
