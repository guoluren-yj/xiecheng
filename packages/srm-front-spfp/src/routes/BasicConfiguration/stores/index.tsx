import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { ModalProvider, DataSet, Modal } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import type Record from 'choerodon-ui/dataset/data-set/Record';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import remote from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { enableDS, billDS, dimensionDS, fieldDefineDS, sceneMenuDS } from './indexDS';
import { DimensionType } from '../utils/type';
import { handlePlagFormConfigApi } from '../utils/api';


export interface StoreValueType
{
  activeKey,
  enableDs: DataSet,
  billDs: DataSet,
  dimensionDs: DataSet,
  reflexDimensionDs: DataSet,
  cumulativeDimensionDs: DataSet
  fieldDefineDs: DataSet,
  sceneMenuDs: DataSet,
  handleSetActiveKey,
  queryActiveFieldData: Function,
  handlePlagFormConfig,
  handleEnable: (record: Record, opr: Function, dimentionType?: DimensionType) => void,
  handleSave,
  isShowPlatFlag,
  querySceneInfo: Function,
  loading: boolean,
  remoteProps: any,
};


export const Store = createContext<any>({});



const StoreProvider = flow(
  observer,
  remote({
    code: 'SPFP.BASIC_CONFIGURATION_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['spfp.basicConfiguration', 'spfp.common', 'hzero.common'] }),
)(props =>
{

  const { children, remote: remoteProps } = props;
  const [activeKey, setActiveKey] = useState('');
  const [isShowPlatFlag, setIsShowPlatFlag] = useState(false);



  const enableDs = useMemo(() => new DataSet(enableDS()), []);
  const billDs = useMemo(() => new DataSet(billDS()), []);
  const reflexDimensionDs = useMemo(() => new DataSet(dimensionDS(DimensionType.reflex)), []); // 维度映射配置
  const dimensionDs = useMemo(() => new DataSet(dimensionDS(DimensionType.apply)), []);// 适用维度配置
  const cumulativeDimensionDs = useMemo(() => new DataSet(dimensionDS(DimensionType.cumulative)), []);// 累计维度配置
  const fieldDefineDs = useMemo(() => new DataSet(fieldDefineDS()), []); // 字段配置Ds
  const sceneMenuDs = useMemo(() => new DataSet(sceneMenuDS()), []);// 场景菜单

  const loading = billDs.status !== 'ready';


  const queryActiveFieldData = useCallback(
    (scenarioConfigId) =>
    {

      setActiveKey(scenarioConfigId);
      fieldDefineDs.setQueryParameter('scenarioConfigId', scenarioConfigId);
      fieldDefineDs.query();
    },
    [fieldDefineDs, setActiveKey],
  );

  const querySceneInfo = useCallback(
    () =>
    {
      // 查询场景菜单
      sceneMenuDs.query().then(res =>
      {
        if (res && res.length > 0)
        {
          // 查询字段信息
          // eslint-disable-next-line prefer-destructuring
          const scenarioConfigId = res[0].scenarioConfigId;
          queryActiveFieldData(scenarioConfigId);
        }
      });
    },
    [queryActiveFieldData, sceneMenuDs],
  );

  useEffect(() =>
  {
    // 查询单据
    billDs.query().then(billRes =>
    {
      if (billRes)
      {
        setIsShowPlatFlag(billRes?.content.length === 0);
      }
    });
    // 查询场景菜单
    querySceneInfo();
  }, [querySceneInfo, setIsShowPlatFlag, billDs]);

  const handleSetActiveKey = useCallback(
    (newValue) =>
    {
      const currentIsEdit = sceneMenuDs.find(record => record.get('scenarioConfigId') === newValue)?.getState('isEdit');
      // 若要切换的tab处于编辑状态，则不能切换tab
      if (activeKey !== newValue && currentIsEdit) return;

      const handleChange = () =>
      {
        setActiveKey(newValue);
        fieldDefineDs.setQueryParameter('scenarioConfigId', newValue);
        fieldDefineDs.query();

      };
      // 若字段Ds发生了变化提示
      if (fieldDefineDs.dirty)
      {
        // 切换tab
        Modal.confirm({
          children: <div>{intl.get('spfp.basicConfiguration.view.message.menuChangeWarning').d('切换场景后，修改的信息将会丢失，确定要切换吗？')}</div>,
          onOk: handleChange,
        });
      } else
      {
        handleChange();
      }
    },
    [setActiveKey, activeKey, fieldDefineDs, sceneMenuDs],
  );

  const handlePlagFormConfig = useCallback(
    async () =>
    {
      billDs.status = DataSetStatus.loading;
      let res;
      try
      {
        res = await handlePlagFormConfigApi();
      } finally
      {
        billDs.status = DataSetStatus.ready;
      }
      if (getResponse(res))
      {
        // 重新查询全部信息
        billDs.query().then(billRes =>
        {
          if (billRes)
          {
            setIsShowPlatFlag(billRes?.content.length === 0);
          }
        });
        reflexDimensionDs.query();
        dimensionDs.query();
        cumulativeDimensionDs.query();
        querySceneInfo();
      }
    },
    [
      billDs,
      setIsShowPlatFlag,
      reflexDimensionDs,
      dimensionDs,
      cumulativeDimensionDs,
      querySceneInfo]);

  // 禁用
  const handleEnable = useCallback(
    async (record, opr, dimentionType?: DimensionType) =>
    {
      let data = { ...record?.toData(), enableFlag: Number(!record?.get('enableFlag')) };

      if (dimentionType
        && [DimensionType.apply, DimensionType.cumulative]
          .includes(dimentionType))
      {
        data = [{ ...data }];
      }
      const res = await opr(data);
      if (getResponse(res))
      {
        // eslint-disable-next-line no-unused-expressions
        record?.dataSet?.query();
        // eslint-disable-next-line no-unused-expressions
        record?.dataSet?.setState('isEditFlag', true);
      }
    },
    [],
  );

  const isMissingFieldArea = useCallback((fields, areaName) =>
  {
    const isshowAll = fields.every(field =>
    {
      const definedRecord = fieldDefineDs.find(record => record.get('scenarioInfoType') === field);
      // console.log('definedRecord', definedRecord)
      return definedRecord?.get('displayFlag');
    });
    return !isshowAll ? areaName : false;

  }, [fieldDefineDs]);

  const getAreasMissingIntl = useCallback(() =>
  {
    return [
      isMissingFieldArea(
        [
          'APPLICATION_DIMENSION_RANGE',
          'APPLICATION_SPECIFIC_VALUE',
          'APPLICATION_DIMENSION_VALUE'],
        intl.get(`spfp.basicConfiguration.view.title.applyRange`).d('适用范围')
      ),
      isMissingFieldArea(
        [
          'CUMULATIVE_DIMENSION_RANGE',
          'CUMULATIVE_SPECIFIC_VALUE',
          'CUMULATIVE_DIMENSION_VALUE'],
        intl.get(`spfp.basicConfiguration.view.title.dimensionDefinition`).d('维度范围')
      ),
      isMissingFieldArea([
        'CALCULATE_TIME_POINT',
        'CALCULATE_RULE',
        'CALCULATE_TAX_RATE_TYPE',
        'CALCULATE_DIMENSION',
        'PRICE_LIB_SERVICE_CODE',
        'CALCULATE_RATE',
      ],
        intl.get(`spfp.basicConfiguration.view.title.calculationRules`).d('计算规则')
      ),
      isMissingFieldArea(['ORDERING_CYCLE',
        'ORDERING_CHARGE_CODE',
        'ORDERING_MERGE_DIMENSION',
        'ORDERING_SUMMARY_DIMENSION',
        'ORDERING_BY',
      ],
        intl.get(`spfp.basicConfiguration.view.title.issueRules`).d('出单规则')

      ),
    ].filter(item => item);

  }, [isMissingFieldArea]);

  // 保存 字段定义信息
  const handleSave = useCallback(
    async () =>
    {
      billDs.status = DataSetStatus.loading;
      const validateFlag = await fieldDefineDs.validate();
      const areaArr = getAreasMissingIntl();
      if (!validateFlag) return;
      if (!areaArr.length)
      {
        try
        {
          return fieldDefineDs.submit();
        } finally
        {
          billDs.status = DataSetStatus.ready;
        }

      }
      const areaMissingIntl = areaArr.join('、');
      Modal.confirm({
        children: intl.get(`spfp.basicConfiguration.view.title.fieldAreaMissingFieldInfo`, {
          areaMissingIntl,
        }).d(`当前{areaMissingIntl}区域表格配置了部分显示，可能导致区域显示异常，请注意！`),
        onOk: () =>
        {
          try
          {
            fieldDefineDs.submit();
          } finally
          {
            billDs.status = DataSetStatus.ready;
          }
        },
      });

    },
    [fieldDefineDs, billDs, getAreasMissingIntl],
  );

  const value = useMemo<StoreValueType>(
    () =>
    {
      return {
        activeKey,
        enableDs,
        billDs,
        dimensionDs,
        reflexDimensionDs,
        cumulativeDimensionDs,
        fieldDefineDs,
        sceneMenuDs,
        handleSetActiveKey,
        queryActiveFieldData,
        handlePlagFormConfig,
        handleEnable,
        handleSave,
        isShowPlatFlag,
        querySceneInfo,
        loading,
        remoteProps,
      };
    },
    [
      activeKey,
      enableDs,
      billDs,
      dimensionDs,
      reflexDimensionDs,
      cumulativeDimensionDs,
      fieldDefineDs,
      sceneMenuDs,
      handleSetActiveKey,
      queryActiveFieldData,
      handlePlagFormConfig,
      handleEnable,
      handleSave,
      isShowPlatFlag,
      querySceneInfo,
      loading,
      remoteProps,
    ]);


  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
