/*
 * @Description: 计算规则
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useContext, useMemo, useCallback, useEffect, Fragment, useState } from 'react';
import { observer } from 'mobx-react';
import { Table, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { isString, isNil, isEmpty } from 'lodash';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';

import EditorForm from '../../../Components/EditorForm';
import { Store, basicColumns, cumulateColumns, singleColumns, calculateColumns, dimensionColumns } from '../Detail/stores';
import { setNewColumnsProps } from '../../../utils';
import DimensionLine from './DimensionLine';
import { DimensionType } from '../../../BasicConfiguration/utils/type';
import { getSelectedNegActConfirmMsg, renderBubblePrompt } from '../../../../utils/renderer';

const CalculateRule = observer(() =>
{
  const {
    ruleDs,
    cumulativeSingleLineDs,
    cumulativeMultiLineDs,
    cumulativeLineDs,
    configFieldsArr,
    editFlag = true,
    changeFlag,
    remoteProps,
    modal,
    customizeTable,
  } = useContext(Store);
  const [bubblePrompt, setBubblePrompt] = useState('');


  const {
    cumulativeMode,
    calculateTaxRateType,
    calculateDimension,
    cumulativeNature,
    sourceFieldName,
    cumulativeRule,
    cumulativePeriod,
  } = ruleDs?.current?.get([
    'cumulativeMode',
    'calculateTaxRateType',
    'calculateDimension',
    'cumulativeNature',
    'sourceFieldName',
    'cumulativeRule',
    'cumulativePeriod',
  ]) || {};

  // 【累计模式】为【累计】
  const isCumulate = cumulativeMode !== 'SINGLE';

  // 【规则模式】为【阶梯规则】
  const isLadder = (() => {
    const ladder = ruleDs && ruleDs.current && ruleDs
      .getField('cumulativeRule')
      .getLookupData(ruleDs.current.get('cumulativeRule'), ruleDs.current)?.parentValue === 'LADDER_RULE';
    return remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.IS_LADDER', ladder, { ruleDs }) : ladder;
  })();


  // 【税率类型】为 【固定税率】
  const isFixedRate = calculateTaxRateType === 'FIXED_TAX_RATE';
  // 【其他参数】为【最高含税单价】、【最高未税单价】、【最低含税单价】、【最低未税单价】
  const isPriceFlag = [
    'MAXIMUM_TAX_INCLUDED_PRICE',
    'MAXIMUM_NET_PRICE',
    'MINIMUM_TAX_INCLUDED_PRICE',
    'MINIMUM_NET_PRICE'].includes(calculateDimension);

  const tableDs = useMemo(() => isLadder ? cumulativeMultiLineDs : cumulativeSingleLineDs, [isLadder, cumulativeMultiLineDs, cumulativeSingleLineDs]);
  const { length } = tableDs;
  // const widthStyle = useMemo(() => { return { width: modal ? '100%' : '75%' }; }, [modal]);

  const cumulativeLineHelpMap = useMemo(() => ({
    'GIFT': intl.get(`spfp.ruleMaintenance.view.giftHelps`, { sourceFieldName }).d('{sourceFieldName}每达量一次赠送一定数量赠品'),
    'FIXED_DISCOUNT': intl.get(`spfp.ruleMaintenance.view.fixedDiscountHelp`, { sourceFieldName }).d('{sourceFieldName}每达量一次折扣固定金额'),
    'FIXED_REBATES': intl.get(`spfp.ruleMaintenance.view.fixedRebatesHelp`, { sourceFieldName }).d('{sourceFieldName}每达量一次折扣百分比'),
    'LADDER_DISCOUNT': intl.get(`spfp.ruleMaintenance.view.ladderDiscountHelp`, { sourceFieldName }).d('{sourceFieldName}按阶梯折扣固定金额'),
    'LADDER_REBATES': intl.get(`spfp.ruleMaintenance.view.ladderRebatesHelp`, { sourceFieldName }).d('{sourceFieldName}按阶梯折扣百分比'),
  }), [sourceFieldName]);

  const handleLoad = useCallback(() =>
  {
    // isEmpty(tableDs.created) : 分页修改时，会一直新增行，平台那边113迭代修改，这里做一下兜底
    if (ruleDs?.current && editFlag && isEmpty(tableDs) && isEmpty(tableDs.created) && length === 0)
    {
      const data = isLadder ? { rangeFromValue: 0 } : {};
      tableDs.create(data);
    }
  }, [editFlag, tableDs, isLadder, ruleDs, length]);

  useEffect(() =>
  {
    tableDs.addEventListener('load', handleLoad);
    return () =>
    {
      tableDs.removeEventListener('load', handleLoad);
    };

  }, [tableDs, handleLoad]);

  const editorColumns = useMemo(() =>
  {
    const newBasicColumns = basicColumns.map(column =>
    {
      if (['cumulativePeriod', 'cumulativeTimePoint'].includes(column.name))
      {
        return { ...column, visible: Boolean(cumulativeMode && isCumulate) };
      } else if (['cumulativeNature'].includes(column.name))
      {
        // 规则模式为【阶梯】,显示【累计性质】
        return {
          ...column,
          visible: Boolean(isLadder),
          help: cumulativeNature && (['REACH_VOLUME'].includes(cumulativeNature)
            ? intl.get('spfp.ruleMaintenance.view.help.reachVolume').d('累计数据按照最高返利规则计算全部数据')
            : intl.get('spfp.ruleMaintenance.view.help.stepInfo').d('累计数据中分阶梯获取当前阶梯的返利结果')
          ),
        };
      }
      else if (['deductBaseAmountFlag'].includes(column.name))
      {
        if (!editFlag)
        {
          return {
            ...column, renderer: ({ value }) => !isNil(value) ? yesOrNoRender(value) : null,
          };
        } else
        {
          return column;
        }

      } else if (['cumulativeDateFrom', 'cumulativeDateTo'].includes(column.name)) {
        return { ...column, visible: cumulativePeriod === 'CUSTOM' && Boolean(cumulativeMode && isCumulate) };
      } else if (['cumulativePeriodClearFlag'].includes(column.name)) {
        return { ...column, visible: Boolean(cumulativeMode && isCumulate) };
      } else {
        return column;
      }

    });
    const normalColumns = setNewColumnsProps(newBasicColumns, ruleDs, configFieldsArr);
    return remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.BASIC_FORM_COLUMNS', normalColumns, { ruleDs, editFlag, changeFlag, cumulativeRule }) : normalColumns;
  }, [
    ruleDs,
    configFieldsArr,
    isCumulate,
    isLadder,
    cumulativeMode,
    editFlag,
    cumulativeNature,
    cumulativePeriod,
    changeFlag,
    remoteProps,
    cumulativeRule,
  ]);


  const columns: ColumnProps[] = useMemo(() =>
  {
    const targetColumns = isLadder ? cumulateColumns : singleColumns;
    const normalColumns = setNewColumnsProps(targetColumns.map((item, index) =>
    {
      if (targetColumns.length === index + 1) return { name: item, editor: editFlag };
      return {
        name: item,
        // width: 250,
        editor: editFlag || changeFlag,
        help: sourceFieldName && cumulativeRule
          ? cumulativeLineHelpMap[cumulativeRule]
          : undefined,
      };
    }), tableDs, configFieldsArr);
    return remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.BASIC_TABLE_COLUMNS', normalColumns, { ruleDs, editFlag, changeFlag, cumulativeRule }) : normalColumns;
  }, [
    isLadder,
    editFlag,
    tableDs,
    configFieldsArr,
    cumulativeRule,
    sourceFieldName,
    cumulativeLineHelpMap,
    changeFlag,
    ruleDs,
    remoteProps,
  ]);

  // 新增
  const handleAdd = useCallback(
    () =>
    {
      let newData = {};
      if (isLadder)
      {
        if (tableDs.length)
        {
          const lastRecord = tableDs.records[tableDs.length - 1] || {};
          const initialValue = lastRecord?.get('rangeToValue');
          if (!isNil(initialValue))
          {
            newData = { rangeFromValue: initialValue };
          }
        } else
        {
          newData = { rangeFromValue: 0 };

        }
      }
      tableDs.create(newData);
    },
    [tableDs, isLadder],
  );

  // // 删除
  const handleDelete = useCallback(
    async () =>
    {
      const res = await tableDs.delete(tableDs.selected, getSelectedNegActConfirmMsg('delete', tableDs));
      if (res)
      {
        tableDs.query();
      }
    },
    [tableDs],
  );

  const buttons = useMemo(
    () => [
      [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],
      [TableButtonType.delete, { onClick: handleDelete, icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
    ],
    [handleAdd, handleDelete]
  );

  // 计算规则，显示隐藏是对整个表格生效
  const effectCalculateolumns = useMemo(() =>
  {
    return setNewColumnsProps(
      calculateColumns,
      ruleDs,
      configFieldsArr);

  }, [ruleDs, configFieldsArr]);

  // 累计维度
  const cumulativeDimensionColumns = useMemo(() =>
  {
    return setNewColumnsProps(dimensionColumns, cumulativeLineDs, configFieldsArr, DimensionType.cumulative);
  }, [cumulativeLineDs, configFieldsArr]);

  // 计算规则，获取字段的必输，label和禁用
  const ruleColumnsFieldsProps = useMemo(() =>
  {
    const columns = calculateColumns.map(fieldCode =>
    {
      if (fieldCode === 'calculateRateLov')
      {
        return { name: 'calculateRateLov', visible: Boolean(isFixedRate) };
      } else if (fieldCode === 'priceLibServiceCodeLov')
      {
        return { name: 'priceLibServiceCodeLov', visible: Boolean(isPriceFlag) };
      } else
      {
        return fieldCode;
      }
    });
    return setNewColumnsProps(columns, ruleDs, configFieldsArr);
  }, [isFixedRate, configFieldsArr, ruleDs, isPriceFlag]);

  // 计算规则
  const calColumns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'calculateTimePoint',
        width: 200,
        editor: editFlag,
      },
      {
        name: 'calculateRule',
        width: 200,
        editor: editFlag,
      },
      {
        header: intl.get('spfp.ruleMaintenance.view.header.ruleMaintenance.calculateParam').d('计算参数'),
        children: [
          {
            header: intl.get('spfp.ruleMaintenance.view.header.ruleMaintenance.taxRate').d('税率'),
            children: [
              {
                name: "calculateTaxRateType",
                editor: editFlag,
                width: 240,
              },
              isFixedRate && {
                name: "calculateRateLov",
                editor: editFlag,
              },
            ],
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

  useEffect(() =>
  {
    // 缓存显示表单字段，供新建校验
    ruleDs.setState('calculateFields',
      [
        ...editorColumns.map(item => item.name),
        ...ruleColumnsFieldsProps.map(column => isString(column) ? column : column?.name),
      ]);
    ruleDs.setState('isLadder', isLadder);
  }, [ruleDs, editorColumns, ruleColumnsFieldsProps, isLadder]);

  const isEdit = editFlag || changeFlag;
  // 每返表格添加埋点
  const isShowBtns = remoteProps && !isLadder
    ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.SINGLE_OPERATE_SHOW', isEdit, { ruleDs })
    : isEdit;

  if (!ruleDs || !ruleDs.current) return <Spin />;

  return (
    <div>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.basicInfo').d('基础信息')}
      >
        <EditorForm
          useWidthPercent={!modal}
          dataSet={ruleDs}
          useColon={false}
          columns={3}
          editorFlag={editFlag}
          editorColumns={editorColumns}
        />

        {ruleDs?.current?.get('cumulativeRule') && (
          <Fragment>
            {customizeTable(
              { code: 'SSPFP.RULE_DISCOUNT_DETAIL.BASIC_LIST' },
              <Table
                dataSet={tableDs}
                columns={columns}
                buttons={isShowBtns ? buttons : []}
                style={{ maxHeight: 400, width: '100%', marginTop: 16 }}
                selectionMode={isShowBtns ? SelectionMode.rowbox : SelectionMode.none}
              />
            )}
          </Fragment>
        )}

      </Card>
      {cumulativeDimensionColumns.length > 0 && (
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<span>{intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.cumulativeDimension').d('累计维度')}{renderBubblePrompt(bubblePrompt)}</span>}
        >
          <DimensionLine dataSet={cumulativeLineDs} dimensionType={DimensionType.cumulative} setBubblePrompt={setBubblePrompt} />
        </Card>
      )}
      {/* 计算规则的字段配置要么全部显示，要么全部隐藏 */}
      {effectCalculateolumns.length > 0 && (
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={intl.get('spfp.ruleMaintenance.view.title.ruleMaintenance.calculateRule').d('计算规则')}
        >
          {customizeTable(
            { code: 'SSPFP.RULE_DISCOUNT_DETAIL.CALCULATE_RULE_LIST' },
            <Table dataSet={ruleDs} style={{ width: '100%' }} columns={calColumns} />
          )}
        </Card>
      )}

    </div>
  );
});

export default CalculateRule;
