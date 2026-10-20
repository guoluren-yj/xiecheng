import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import type { Modal} from 'choerodon-ui/pro';
import { ModalProvider, DataSet, Spin, Lov, Select, CheckBox, NumberField, DatePicker } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import remote from 'hzero-front/lib/utils/remote';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { parse, stringify } from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { filterNullValueObject } from 'utils/utils';

import { ruleDS, dimensionLineDS, cumulativeMultiLineDS, cumulativeSingleLineDS, getEffectiveData, permissionDS } from './mainDS';
import { getFieldsConfig } from '../../utils/api';
import { DimensionType } from '../../../../BasicConfiguration/utils/type';
import { edit, fetchRuleHistory } from '../../utils/api';
import { setNewDisplayColumns } from '../../../../utils';



export interface CreateStoreValueType
{
  modal: Modal,
  ruleDs: DataSet,
  applyRangeDs: DataSet,
  cumulativeSingleLineDs: DataSet,
  cumulativeMultiLineDs: DataSet,
  cumulativeLineDs: DataSet, // 计算规则-累计维度
  rebateLineDs: DataSet // 行列表
  configFieldsArr: Array<Object>,
  stepNameList: Array<String>,
  handleToDetail: Function,
  defaultCurrentStep,
  loading: boolean,
  editFlag: boolean,
  addFlag: boolean,
  approveFlag: boolean,
  historyFlag: boolean,
  viewFlag: boolean,
  routeEditFlag: boolean,
  setEditFlag: Function,
  editable: boolean,
  changeFlag: boolean,
  spcmHeaderInfo: object | undefined,
  majorPcNum: string,
  state: { backPath: string } | undefined,
  handleEdit,
  backPath,
  historyVersionNums: number,
  history,
  modalRuleId: boolean,
  customizeTable: Function,
  permissionDs: DataSet,
  notPub: boolean,
  isReadOnly: boolean,
}

export const statusColorMap = {
  UN_PUBLISHED: 'warn',
  PUBLISHED: 'success',
  DISABLED: 'error',
};

export const Store = createContext<any>({});

// 每个step的所有columns;

// 适用/计算规则-累计维度
export const dimensionColumns = [
  'dimensionCode',
  'dimensionOperation',
  'dimensionValue'];
// 触发条件
export const triggerColumns = [
  {
    name: 'sourceDocumentCodeLov',
    editor: Lov,
  },
  {
    name: 'targetDocumentCodeLov',
    editor: Lov,
  },
];
// 计算规则-基础信息
export const basicColumns = [
  { name: 'deductBaseAmountFlag', editor: CheckBox },
  { name: 'baseAmount', editor: NumberField },
  { name: 'cumulativeMode', editor: Select },
  { name: 'cumulativeRule', editor: Select },
  { name: 'cumulativePeriod', editor: Select },
  { name: 'cumulativePeriodClearFlag', editor: Select },
  { name: 'cumulativeDateFrom', editor: DatePicker },
  { name: 'cumulativeDateTo', editor: DatePicker },
  { name: 'cumulativeTimePoint', editor: Select },
  { name: 'cumulativeNature', editor: Select },
];
// 计算规则-累计行
export const cumulateColumns = [
  'rangeFromValue',
  'rangeToValue',
  'resultValue',

];
// 计算规则-单笔行
export const singleColumns = [
  'fixedValue',
  'resultValue',
];
// 计算规则-计算规则
export const calculateColumns = [
  'calculateTimePoint',
  'calculateRule',
  'calculateTaxRateType',
  'calculateRateLov',
  'calculateDimension',
  'priceLibServiceCodeLov',
];
// 出单规则
export const issueColumns = [
  { name: 'orderingCycle', editor: Select },
  { name: 'orderingChargeCode', editor: Select },
  {
    name: 'orderingMergeDimension',
    editor: Select,
  },
  {
    name: 'orderingSummaryDimension',
    editor: Select,
  },
  {name: 'orderingRule', editor: Select },
  { name: 'orderingByLov', editor: Lov },
  { name: 'orderingStatus', editor: Select },
];

const permBtnCodePrefix = 'sta.supplier.favoured-policy.config-manage.rebate-maintain.button';
const permissionCodeMap = {
  approveBtn: `${permBtnCodePrefix}.approve`,
  returnBtn: `${permBtnCodePrefix}.return`,
};

export const CreateStorProvider = flow(
  observer,
  withCustomize({
    unitCode: [],
  }),
  remote({
    code: 'SPFP.RULE_REBATE_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['spfp.ruleMaintenance', 'spfp.common', 'hzero.common'] }),

)(props =>
{

  const {
    children,
    modal,
    rebateLineDs,
    history,
    ruleId: modalRuleId, // 弹窗编辑
    // 协议传过来的字段
    defaultCurrentStep: propsStepDefault,
    majorPcNum,
    editable = true,
    changeFlag,
    headerInfo: spcmHeaderInfo,
    remote: remoteProps,
    match,
    location,
    customizeTable,
  } = props;

  const { state, pathname, search } = location || {};
  const { step: routeStepDefault } = parse(search?.substring(1) || '{}');
  const { ruleId: routeRuleId, operate } = match?.params || {};// 内页编辑/新
  const defaultCurrentStep = routeStepDefault || propsStepDefault;
  const addFlag = routeRuleId === 'add'; // 内页新建
  const historyFlag = operate === 'history';
  const viewFlag = ['view', 'history', 'approve', 'readOnly'].includes(operate);
  const routeEditFlag = operate === 'update';// 内页编辑
  const approveFlag = operate === 'approve'; // 审核页
  const notPub = pathname?.split('/')[1] !== 'pub';
  const isReadOnly = operate === 'readOnly';
  // operate === 'update' 内页编辑
  // addFlag 内页新建
  // modalRuleId === undefined 弹窗新建
  // editable 弹窗控制显示还是只读

  const [editFlag, setEditFlag] = useState<Boolean>(editable && (operate === 'update' || addFlag || !!majorPcNum));
  const [configFieldsArr, setConfigFieldsArr] = useState([]); // 规则字段配置项
  const [historyVersionNums, setHistoryVersionNums] = useState(0);// 历史记录版本
  const applyRangeDs = useMemo(() => new DataSet(dimensionLineDS(DimensionType.apply, remoteProps)), [remoteProps]);
  const cumulativeSingleLineDs = useMemo(() => new DataSet(cumulativeSingleLineDS()), []);
  const cumulativeMultiLineDs = useMemo(() => new DataSet(cumulativeMultiLineDS()), []);
  const cumulativeLineDs = useMemo(() => new DataSet(dimensionLineDS(DimensionType.cumulative, remoteProps)), [remoteProps]);// 计算规则-维度范围
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);

  const autoCreateLine = useCallback((isLadder) =>
  {
    if (isLadder)
    {
      // 重新查询,防止被校验住
      cumulativeSingleLineDs.reset();
      if (!cumulativeMultiLineDs.length)
      {
        cumulativeMultiLineDs.create({ rangeFromValue: 0 });
      }
    } else
    {
      // 删除 cumulativeMultiLineDs前端新建数据
      cumulativeMultiLineDs.reset();
      if (!cumulativeSingleLineDs.length)
      {
        cumulativeSingleLineDs.create({});
      }

    }

  }, [cumulativeMultiLineDs, cumulativeSingleLineDs]);

  const ruleDs = useMemo(() => new DataSet({
    ...ruleDS(true, remoteProps),
    children: {
      fixedRuleList: cumulativeSingleLineDs,
      ladderRuleList: cumulativeMultiLineDs,
      ruleDimensionInfoList: applyRangeDs,
      cumulativeDimensionInfoList: cumulativeLineDs,
    },
    events: {
      update: ({ name, value, record }) =>
      {
        if (['scenarioConfigIdLov'].includes(name))
        {
          // 场景发生改变，重新查询字段配置项
          if (value?.scenarioConfigId)
          {
            getFieldsConfig(value.scenarioConfigId).then(scenarioListRes =>
            {
              setConfigFieldsArr(scenarioListRes || []);
            });
          }
        }
        // 来源单据发生变化,【其他参数】清空
        if (['sourceDocumentCodeLov'].includes(name))
        {
          record.set('calculateDimension', undefined);

        }
        if (['cumulativeMode'].includes(name))
        {
          const effectDatas = getEffectiveData(cumulativeLineDs?.toData() || []) || [];
          // 累计模式为【累计】时，累计范围若无数据默认新增一行
          if (value === 'CUMULATIVE' && cumulativeLineDs && !cumulativeLineDs.length)
          {
            // cumulativeLineDs.create({});
            const dimensionCodeLookupDatas = cumulativeLineDs.getField('dimensionCode')?.getOptions()?.toData() || [];
            if (dimensionCodeLookupDatas.length && spcmHeaderInfo)
            {
              dimensionCodeLookupDatas.map((dimension: any) =>
              {
                const { dimensionCode, componentType } = dimension;
                const isLovType = ['LOV'].includes(componentType);
                if (['supplierCompanyId', 'companyId', 'pcNum'].includes(dimensionCode))
                {
                  cumulativeLineDs.create({
                    ...dimension,
                    dimensionValue: isLovType ? spcmHeaderInfo : spcmHeaderInfo[dimensionCode],
                    dimensionOperation: 'EQUALS',
                  });
                }
              });
            }
            if (!cumulativeLineDs.length)
            {
              cumulativeLineDs.create({});
            }

          }
          // 累计模式为【单笔】时，累计范围应该删去默认新增的一行
          if (value === 'SINGLE' && cumulativeLineDs && cumulativeLineDs.length && !effectDatas.length)
          {
            // cumulativeLineDs.delete(cumulativeLineDs.records[0], false);
            cumulativeLineDs.deleteAll(false);

          }

        }
        if (['deductBaseAmountFlag'].includes(name) && !value)
        {
          record.init({ baseAmount: 0 });
        }
        // 规则模式变化，规则计算规则表格默认一行
        if (name === 'cumulativeRule')
        {
          record.set({ calculateDimension: undefined });
          const isLadder = (ruleDs?.getField('cumulativeRule')?.getLookupData(value, ruleDs.current) as any)?.parentValue === 'LADDER_RULE';
          autoCreateLine(isLadder);
        }
      },
    },
  }), [
    cumulativeSingleLineDs,
    cumulativeMultiLineDs,
    applyRangeDs,
    setConfigFieldsArr,
    cumulativeLineDs,
    spcmHeaderInfo,
    autoCreateLine,
  ]);

  // 每个step下的全部字段是否都是隐藏
  const [applyIsHideAll, triggerIsHideAll, issueIsHideAll] = [
    setNewDisplayColumns(dimensionColumns, configFieldsArr, DimensionType.apply).length === 0,
    setNewDisplayColumns(triggerColumns, configFieldsArr).length === 0,
    setNewDisplayColumns(issueColumns, configFieldsArr).length === 0,
  ];

  const loading = ruleDs.status !== DataSetStatus.ready;

  const stepNameList = useMemo(() => [
    'BASE_INFO',
    !applyIsHideAll && 'APPLICATION_SCOPE',
    !triggerIsHideAll && 'TRIGGER_CONDITION',
    'CALCULATE_RULE',
    !issueIsHideAll && 'ORDERING_RULE',
    'END',
  ], [applyIsHideAll, issueIsHideAll, triggerIsHideAll]);

  useEffect(() =>
  {
    const ruleId = routeRuleId && routeRuleId !== 'add' ? routeRuleId : undefined
      || modalRuleId
      || ruleDs?.current?.get('ruleId');

    // 新建
    if (ruleId)
    {
      // 列表跳到新建弹窗
      ruleDs.setState('ruleId', ruleId).query().then(res =>
      {
        if (res)
        {
          const { scenarioConfigId, ruleNum, ruleId } = res || {};
          // 查询字段配置项
          if (scenarioConfigId)
          {
            getFieldsConfig(scenarioConfigId).then(scenarioListRes =>
            {
              setConfigFieldsArr(scenarioListRes || []);
            });
          }
          fetchRuleHistory({ ruleNum, ruleId }).then(historyRes =>
          {
            if (getResponse(historyRes))
            {
              setHistoryVersionNums(historyRes?.content?.length || 0);
            }
          });

        }
      });

    } else
    {
      const { endDateActive, startDateActive, ruleName } = spcmHeaderInfo || {};
      const newData = majorPcNum ? {
        majorPcNum,
        endDate: endDateActive,
        startDate: startDateActive,
        sourceType: 'PROTOCOL',
        ruleName,
      } : {};
      ruleDs.create(newData);

    }
  }, [ruleDs, majorPcNum, spcmHeaderInfo, modalRuleId, routeRuleId]);

  // 跳转详情
  const handleToDetail = useCallback(
    (data, operate) =>
    {
      const { ruleId } = data || {};
      const step = ['view', 'history', 'approve'].includes(operate) ? 'END' : undefined;

      history.push({
        pathname: `/spfp/rule-maintenance/rebate/detail/${ruleId}/${operate}`,
        search: stringify(filterNullValueObject({ step })),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
      updateTab({
        key: getActiveTabKey(),
        search: stringify(filterNullValueObject({ step })),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
    },
    [history, pathname, search],
  );


  /**
  * @description: 跳转详情页面
  * @param {String} 行主键
  */
  const handleEdit = useCallback(
    async () =>
    {
      const { ruleId, ruleStatus, step } = ruleDs?.current?.get(['ruleId', 'ruleStatus', 'step']);
      if (['PUBLISHED'].includes(ruleStatus))
      {
        const res = getResponse(await edit(ruleDs?.current?.toData()));
        if (res?.ruleId)
        {
          handleToDetail(res, 'update');
        }
      } else
      {
        handleToDetail({ ruleId, step }, 'update');
      }
    },
    [handleToDetail, ruleDs]
  );


  const value = useMemo(() =>
  {
    return {
      modal,
      rebateLineDs,
      ruleDs,
      applyRangeDs,
      cumulativeSingleLineDs,
      cumulativeMultiLineDs,
      cumulativeLineDs,
      configFieldsArr,
      stepNameList,
      handleToDetail,
      defaultCurrentStep,
      loading,
      editFlag,
      setEditFlag,
      editable,
      changeFlag,
      spcmHeaderInfo,
      majorPcNum,
      remoteProps,
      state,
      addFlag,
      historyFlag,
      handleEdit,
      viewFlag,
      routeEditFlag,
      historyVersionNums,
      history,
      modalRuleId,
      customizeTable,
      approveFlag,
      permissionDs,
      notPub,
      isReadOnly,
    };

  }, [
    modal,
    rebateLineDs,
    ruleDs,
    applyRangeDs,
    cumulativeSingleLineDs,
    cumulativeMultiLineDs,
    cumulativeLineDs,
    configFieldsArr,
    stepNameList,
    handleToDetail,
    defaultCurrentStep,
    loading,
    editFlag,
    setEditFlag,
    editable,
    changeFlag,
    spcmHeaderInfo,
    majorPcNum,
    remoteProps,
    state,
    addFlag,
    historyFlag,
    handleEdit,
    viewFlag,
    routeEditFlag,
    historyVersionNums,
    history,
    modalRuleId,
    customizeTable,
    approveFlag,
    permissionDs,
    notPub,
    isReadOnly,
  ]);

  // eslint-disable-next-line no-unused-expressions
  if (!ruleDs?.current) <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>

    </Store.Provider>

  );


}) as (props: any) => ReactElement;

