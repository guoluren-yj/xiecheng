/*
 * @Description:计算规则
 * @Date: 2023-05-06 10:46:10
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { isString, isNil } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import EditorForm from '../../../Components/EditorForm';
import { DimensionType, CUSTOM } from '../../../BasicConfiguration/utils/type';
import MaintainView from './MaintainView';
import { Store, basicColumns, cumulateColumns, singleColumns, calculateColumns, dimensionColumns } from '../Detail/stores';
import { setNewColumnsProps } from '../../../utils';
import { renderBubblePrompt } from '../../../../utils/renderer';

const CalculateRule = observer(() => {
  const {
    ruleDs,
    cumulativeSingleLineDs,
    cumulativeMultiLineDs,
    cumulativeLineDs,
    configFieldsArr,
    editFlag: initEditFlag = true,
    changeFlag,
    customizeTable,
  } = useContext(Store);
  const editFlag = initEditFlag && !changeFlag;
  const [bubblePrompt, setBubblePrompt] = useState('');

  const {
    cumulativeMode,
    calculateTaxRateType,
    calculateDimension,
    cumulativePeriod,
  } = ruleDs?.current?.get([
    'cumulativeMode',
    'calculateTaxRateType',
    'calculateDimension',
    'cumulativePeriod',
  ]) || {};

  // 【累计模式】为【累计】
  const isCumulate = cumulativeMode !== 'SINGLE';

  // 【规则模式】为【阶梯规则】
  const isLadder = ruleDs && ruleDs.current && ruleDs
    .getField('cumulativeRule')
    .getLookupData(ruleDs.current.get('cumulativeRule'), ruleDs.current)?.parentValue === 'LADDER_RULE';

  // 【税率类型】为 【固定税率】
  const isFixedRate = calculateTaxRateType === 'FIXED_TAX_RATE';
  // 【其他参数】为【最高含税单价】、【最高未税单价】、【最低含税单价】、【最低未税单价】
  const isPriceFlag = [
    'MAXIMUM_TAX_INCLUDED_PRICE',
    'MAXIMUM_NET_PRICE',
    'MINIMUM_TAX_INCLUDED_PRICE',
    'MINIMUM_NET_PRICE'].includes(calculateDimension);

  const tableDs = useMemo(() => isLadder ? cumulativeMultiLineDs : cumulativeSingleLineDs, [isLadder, cumulativeMultiLineDs, cumulativeSingleLineDs]);
  // const widthStyle = useMemo(() => { return { width: modal ? '100%' : '75%' }; }, [modal]);

  const editorColumns = useMemo(() => {
    const newBasicColumns = basicColumns.map(column => {
      if (['cumulativePeriod', 'cumulativeTimePoint'].includes(column.name)) {
        return { ...column, visible: Boolean(cumulativeMode && isCumulate) };
      } else if (['cumulativeNature'].includes(column.name)) {
        // 规则模式为【阶梯】,显示【累计性质】
        return { ...column, visible: Boolean(isLadder) };
      } else if (['deductBaseAmountFlag'].includes(column.name)) {
        if (!editFlag) {
          return {
            ...column,
            renderer: ({ value }) => !isNil(value) ? yesOrNoRender(value) : null,
          };
        } else {
          return column;
        }
      } else if (['cumulativeDateTo', 'cumulativeDateFrom'].includes(column.name)) {
        return { ...column, visible: Boolean(cumulativeMode && isCumulate) && cumulativePeriod === CUSTOM };
      } else {
        return column;
      }
    });
    return setNewColumnsProps(newBasicColumns, ruleDs, configFieldsArr);
  }, [ruleDs, configFieldsArr, isCumulate, isLadder, cumulativeMode, editFlag, cumulativePeriod]);


  const columns: ColumnProps[] = useMemo(() => {
    const columnList = isLadder ? cumulateColumns : singleColumns;
    const widthPercent = Math.floor(100 / (columnList.length || 1));
    return setNewColumnsProps((columnList).map(item => {
      return { name: item, width: `${widthPercent}%`, editor: editFlag || changeFlag };
    }), tableDs, configFieldsArr);
  }, [isLadder, editFlag, tableDs, configFieldsArr, changeFlag]);

  // 新增
  const handleAdd = useCallback(
    () => {
      let newData = {};
      if (isLadder && tableDs.length) {
        const lastRecord = tableDs.records[tableDs.length - 1] || {};
        const initialValue = lastRecord?.get('rangeToValue');
        if (!isNil(initialValue)) {
          newData = { rangeFromValue: Number(initialValue) };
        }
      }
      tableDs.create(newData);
    },
    [tableDs, isLadder],
  );

  // // 删除
  const handleDelete = useCallback(
    async () => {
      const selectedRows = tableDs.selected;
      const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
      const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];

      const newParameters: any = []; // 勾选数据(非新建行)
      const newLadderLevel: any = []; // 所有数据(非新建行)
      const allUnselectLine: any = []; // all un selected line

      tableDs.toData().forEach((item: any) => {
        const { ladderRuleId, _status } = item || {};
        if (_status !== 'create') {
          newLadderLevel.push(item);

          if (selectedRows.find((s) => s.get('ladderRuleId') === ladderRuleId)) {
            newParameters.push(item);
          }
        }
        if (!selectedRows.find((s) => s.get('ladderRuleId') === ladderRuleId)) {
          allUnselectLine.push(item);
        }
      });
      // 正常的最后几条
      const endLadderList = newLadderLevel.slice(newLadderLevel.length - newParameters.length);
      // 二者相同项
      const commonLadderList = endLadderList.filter((item: any) => {
        return newParameters.find((param: any) => param?.ladderRuleId === item?.ladderRuleId);
      });

      if (
        newParameters.length &&
        newParameters.length < newLadderLevel.length &&
        commonLadderList.length < newParameters.length
      ) {
        notification.warning({
          message: intl
            .get(`spfp.common.view.message.onlySelectedLast`)
            .d('只能从最后一行已保存行开始删除!'),
        });
      } else {
        // 删除本地数据
        tableDs.remove(newAddRows);
        // 删除线上数据
        const res = await tableDs.delete(existedRows, {
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('spfp.common.view.message.isDeleteSelectedLines').d('确认删除选中行？'),
        });
        if (res) {
          tableDs.query();
        }
      }
    },
    [tableDs],
  );

  const buttons = useMemo(
    () => {
      if (isLadder && (editFlag || changeFlag)) {
        return [
          [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],
          [TableButtonType.delete, { onClick: handleDelete }] as [TableButtonType, TableButtonProps],
        ];
      }
      return [];
    },
    [handleAdd, handleDelete, isLadder, editFlag, changeFlag]
  );

  // 计算规则，显示隐藏是对整个表格生效
  const effectCalculateolumns = useMemo(() => {
    return setNewColumnsProps(
      calculateColumns,
      ruleDs,
      configFieldsArr);

  }, [ruleDs, configFieldsArr]);

  // 累计维度
  const cumulativeDimensionColumns = useMemo(() => {
    return setNewColumnsProps(dimensionColumns, cumulativeLineDs, configFieldsArr, DimensionType.cumulative);
  }, [cumulativeLineDs, configFieldsArr]);

  // 计算规则，获取字段的必输，label和禁用
  const ruleColumnsFieldsProps = useMemo(() => {
    const columns = calculateColumns.map(fieldCode => {
      if (fieldCode === 'calculateRateLov') {
        return { name: 'calculateRateLov', visible: Boolean(isFixedRate) };
      } else if (fieldCode === 'priceLibServiceCodeLov') {
        return { name: 'priceLibServiceCodeLov', visible: Boolean(isPriceFlag) };
      } else {
        return fieldCode;
      }
    });
    return setNewColumnsProps(columns, ruleDs, configFieldsArr);
  }, [isFixedRate, configFieldsArr, ruleDs, isPriceFlag]);

  // 计算规则
  const calColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'calculateTimePoint',
        width: 150,
        // editor: editFlag,
      },
      {
        name: 'calculateRule',
        width: 150,
        editor: editFlag,
      },
      {
        header: intl.get('spfp.ruleMaintenance.view.header.ruleMaintenance.calculateParam').d('计算参数'),
        children: [
          isFixedRate ?
            {
              header: intl.get('spfp.ruleMaintenance.view.header.ruleMaintenance.taxRate').d('税率'),
              children: [
                {
                  name: "calculateTaxRateType",
                  editor: editFlag,
                },
                {
                  name: "calculateRateLov",
                  editor: editFlag,
                },
              ],
            }
            : {
              name: "calculateTaxRateType",
              editor: editFlag,
            },
          {
            name: "calculateDimension",
            editor: editFlag,
          },
          isPriceFlag && {
            name: 'priceLibServiceCodeLov',
            editor: editFlag,
          },
        ] as any,
      },
    ];
  }, [isFixedRate, editFlag, isPriceFlag]);



  useEffect(() => {
    // 缓存显示表单字段，供新建校验
    ruleDs.setState('calculateFields',
      [
        ...editorColumns.map(item => item.name),
        ruleColumnsFieldsProps.map(column => isString(column) ? column : column?.name),
      ]);
  }, [ruleDs, editorColumns, ruleColumnsFieldsProps]);

  useEffect(() => {
    ruleDs.setState('isLadder', isLadder);
  }, [isLadder, ruleDs]);

  // if (!ruleDs || !ruleDs.current) return <Spin />;

  return (
    <div>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.basicInfo').d('基础信息')}
      >
        <EditorForm
          dataSet={ruleDs}
          useColon={false}
          columns={3}
          editorFlag={editFlag}
          editorColumns={editorColumns}
        />
        {ruleDs?.current?.get('cumulativeRule') && (
          customizeTable(
            { code: 'SSPFP.DISCOUNT_DETAIL.BASIC_LIST' }, // 为了UI统一（表格字段最后有设置图标），要求加的假个性化单元
            <Table
              dataSet={tableDs}
              columns={columns}
              buttons={buttons}
              style={{ maxHeight: 400, width: '100%', marginTop: 16 }}
              selectionMode={editFlag || changeFlag ? SelectionMode.rowbox : SelectionMode.none}
            />
          )
        )}
      </Card>
      {cumulativeDimensionColumns.length > 0 ? (
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<span>{intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.cumulativeDimension').d('累计维度')}{renderBubblePrompt(bubblePrompt)}</span>}
        >
          <MaintainView cuxStyle={editFlag ? { height: 'calc(100vh - 630px)' } : {}} dataSet={cumulativeLineDs} dimensionType={DimensionType.cumulative} setBubblePrompt={setBubblePrompt} />
        </Card>
      ) : null}
      {/* 计算规则的字段配置要么全部显示，要么全部隐藏 */}
      {effectCalculateolumns.length > 0 && (
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.calculateRule').d('计算规则')}
        >
          {customizeTable(
            { code: 'SSPFP.DISCOUNT_DETAIL.CALCULATE_LIST' }, // 为了UI统一（表格字段最后有设置图标），要求加的假个性化单元
            <Table dataSet={ruleDs} style={{ width: '100%' }} columns={calColumns} />
          )}
        </Card>
      )}
    </div>
  );
});

export default CalculateRule;
