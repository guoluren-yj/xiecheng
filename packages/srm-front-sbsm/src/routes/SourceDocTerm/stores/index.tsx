import type { ReactElement } from 'react';
import React, { createContext, useMemo, useEffect, useCallback } from 'react';
// import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow, isUndefined } from 'lodash';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { sourceDocHeaderDS, sourceDocListDS, sourceDocSyncListDS } from './detailDS';

import { DetailCustomizeCode } from '../utils/type';

import styles from '../index.less';

export interface StoreValueType {
  loading: boolean,
  modalFlag: boolean,
  readOnlyFlag: boolean,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
  sourceDocListDs: DataSet,
  sourceDocHeaderDs: DataSet,
  sourceDocSyncListDs: DataSet,
  editFlag: boolean,
  // sourceDocListLineDs: DataSet,
  // sourceDocHeaderLineDs: DataSet,
  onPartChildRef: (partChildRef: Record<string, any>) => void,
  dimensionType?: string,
  modal?: any,
  isChange: boolean,
  documentTermHeaderDTOList: any,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ...Object.values(DetailCustomizeCode),
    ],
  }),
  formatterCollections({ code: ['sbsm.fundPlanForecast', 'sbsm.common', 'sbsm.payTermsCtrl', 'sbsm.fundPlan'] }),
)((props) => {

  const {
    modal,
    children,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    // props传入的下面这些参数预留，用于引用组件打开侧弹框
    onPartChildRef,
    sourcePageData, // 页面来源数据，传入id，维度等
    sourceCacheData, // 缓存的ds数据, 目前只有订单用到和sourcePageData分开
  } = props;
  // headerData来源单据的头信息 lineData来源单据的行信息
  const { dimensionType, operate, lineData, headerData, documentTermHeaderDTOList } = sourcePageData || {};
  const sourceDocId = headerData?.poHeaderId;
  const isChange = !!sourceCacheData || isUndefined(sourceCacheData);

  const { sourceDocHeaderDs: sourceDocHeaderDsProps, sourceDocListDs: sourceDocListDsProps } = sourceCacheData || {};
  const modalFlag = Boolean(modal);

  const readOnlyFlag = !operate || operate === 'view';
  const editFlag = operate === 'edit';

  // 如果是比例切变更场景重新计算行金额
  const calculateLineAgain = useCallback((list, total) => {
    if (math.isNaN(total)) return list;
    const len = list.length;
    const rowAmount: any = [];
    return list.map((item, index) => {
      const { stagePercent } = item;
      if (index < len - 1) {
        const stageAmount = math.multipliedBy(math.div(stagePercent, 100), total);
        item.stageAmount = stageAmount;
        rowAmount.push(stageAmount);
      } else {
        item.stageAmount = math.minus(total, math.sum(...rowAmount))
      }
      return item;
    })
  }, []);

  // 构造缓存数据，需要把来源单据金额替换，只有订单有缓存场景 订单用得到
  const catchData = useMemo(() => {
    if (sourceDocHeaderDsProps) {
      const data = sourceDocHeaderDsProps?.toData();
      if (dimensionType === 'ORDER') {
        const info = documentTermHeaderDTOList[0] || {};
        return data.map((item) => {
          item.dtAmount = info.dtAmount;
          if (['STAGE_PERCENT', 'INPUT_PERCENT'].includes(item.amountComputeRule)) {
            item.docTermLineList = calculateLineAgain(item.docTermLineList, item.dtAmount);
            // 重新计算后，差异金额为0
            item.diffAmount = 0;
            item.docTermAmount = info.dtAmount;
          } else item.diffAmount = math.isNaN(info.dtAmount) ? item.diffAmount : math.minus(info.dtAmount, item.docTermAmount);
          return item;
        });
      } else {
        return data.map((item) => {
          // 使用行号，订单变更 拆分出来的行没lineId
          const info = documentTermHeaderDTOList.find((v) => v?.sourceDocLineNum === item.sourceDocLineNum) || {};
          item.dtLineAmount = info.dtLineAmount;
          item.diffAmount = math.isNaN(info.dtLineAmount) ? item.diffAmount : math.minus(info.dtLineAmount, item.docTermAmount);
          if (['STAGE_PERCENT', 'INPUT_PERCENT'].includes(item.amountComputeRule)) {
            item.docTermLineList = calculateLineAgain(item.docTermLineList, item.dtLineAmount);
             // 重新计算后，差异金额为0
            item.diffAmount = 0;
            item.docTermAmount = info.dtLineAmount;
          }
          return item;
        });
      }
    }
    return [];
  }, [sourceDocHeaderDsProps, documentTermHeaderDTOList, dimensionType, calculateLineAgain]);

  // 获取变更场景渲染行数据
  const renderLineDataChange = useCallback(() => {
    if (!sourceDocHeaderDsProps) return [];
    const list = sourceDocListDsProps?.toData();
    const info = documentTermHeaderDTOList[0] || {};
    const { dtLineAmount, dtAmount } = info;
    const { amountComputeRule } = sourceDocHeaderDsProps.current?.get(['amountComputeRule']) || {};
    const amount = dimensionType === 'ORDER' ? dtAmount : dtLineAmount;
    if (['STAGE_PERCENT', 'INPUT_PERCENT'].includes(amountComputeRule)) {
      return calculateLineAgain(list, amount);
    }
    return list;
  }, [sourceDocHeaderDsProps, sourceDocListDsProps, calculateLineAgain]);

  // 判断有缓存场景需要调预构造接口标识，订单变更有拆分出行的场景会多出一行，缓存中没有该行数据，同时缓存已有的需要使用缓存行的数据
  const cacheUpdateFlag = useMemo(() => {
    return dimensionType === 'PO_LINE' && sourceDocHeaderDsProps && documentTermHeaderDTOList.length !== sourceDocHeaderDsProps?.length;
  }, [documentTermHeaderDTOList, sourceDocHeaderDsProps, dimensionType]);

  // 判断变更场景 订单的条款是否发生变化
  const updateTermHeaderIdFlag = useMemo(() => {
    if (!isChange || !sourceDocHeaderDsProps) return false;
    const termHeaderId = sourceDocHeaderDsProps?.getState('termHeaderIdOrigin');
    return termHeaderId !== documentTermHeaderDTOList?.[0]?.termHeaderId;
  }, [isChange, sourceDocHeaderDsProps, documentTermHeaderDTOList]);


  const handleLineUpdate = useCallback(({ name, record, value }) => {
    if (name === 'fcDateRule') {
      if (value === 'NO_NEED_CALCULATE') {
        record.set({
          fcBaseDateType: null,
          fcDeadLine: null,
          fcFixedDay: null,
          fcAccountPeriod: null,
          fcAddMonth: null,
        });
      } else if (value === 'DYNAMIC_PAY_DATE') {
        record.set({
          fcDeadLine: null,
          fcFixedDay: null,
          fcAddMonth: null,
        });
      }
    } else if (name === 'exDateRule') {
      if (value === 'NO_NEED_CALCULATE') {
        record.set({
          exBaseDateType: null,
          exDeadLine: null,
          exFixedDay: null,
          exAccountPeriod: null,
          exAddMonth: null,
        });
      } else if (value === 'DYNAMIC_PAY_DATE') {
        record.set({
          exDeadLine: null,
          exFixedDay: null,
          exAddMonth: null,
        });
      }
    } else if (name === 'stageType') {
      record.set({
        fcBaseDateType: null,
        exBaseDateType: null,
      });
    }
  }, []);

  const sourceDocListDs = useMemo<DataSet>(() => new DataSet({
    ...sourceDocListDS(dimensionType),
    events: { update: handleLineUpdate },
  }), [handleLineUpdate, dimensionType]);

  const sourceDocSyncListDs = useMemo<DataSet>(() => new DataSet({
    ...sourceDocSyncListDS(),
  }), []);

  const onHeaderUpdate = useCallback(({ name, value, record }) => {
    // 如果阶段计算金额规则不是比例(按实际维护) 清空行上的阶段比例的值且不可编辑
    if (name === 'amountComputeRule') {
      const { dtAmount, dtLineAmount, docTermAmount } = record?.get(['dtAmount', 'dtLineAmount', 'docTermAmount']);
      if (value === 'INPUT_PERCENT' && math.eq(docTermAmount, 0)) {
        const amount = ['ORDER'].includes(dimensionType) ? dtAmount : dtLineAmount;
        record.set({docTermAmount: amount});
      }
      sourceDocListDs.forEach((line) => {
        line.set({
          amountComputeRule: value,
        });
      });
    }
  }, [sourceDocListDs, dimensionType]);

  const dsParam = useMemo(() => {
    return { controlDimension: dimensionType, documentTermHeaderDTOList, lineData, cacheUpdateFlag, catchData };
  }, [dimensionType, lineData, documentTermHeaderDTOList, cacheUpdateFlag, catchData]);

  const sourceDocHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...sourceDocHeaderDS(dsParam, readOnlyFlag),
    children: {
      docTermLineList: sourceDocListDs,
      docTermSyncList: sourceDocSyncListDs,
    },
    events: { update: onHeaderUpdate },
  }), [sourceDocListDs, onHeaderUpdate, dsParam, readOnlyFlag, sourceDocSyncListDs]);


  const updateLen = sourceDocListDs?.updated?.length || sourceDocListDs?.created?.length;
  useEffect(() => {
    // 更新存表标识
    if (sourceDocHeaderDs?.current) {
      sourceDocHeaderDs.current.set({
        existStageFlag: updateLen > 0 ? 1 : 0,
      });
    }
  }, [sourceDocHeaderDs, updateLen]);

  const loading = sourceDocHeaderDs.status !== 'ready';

  useEffect(() => {
    if (!sourceDocHeaderDsProps || cacheUpdateFlag || updateTermHeaderIdFlag) {
      sourceDocHeaderDs.query();
    } else {
      sourceDocHeaderDs.loadData(catchData);
      sourceDocListDs.loadData(renderLineDataChange());
    }
  }, [sourceDocHeaderDs, sourceDocHeaderDsProps, renderLineDataChange, sourceDocListDs, cacheUpdateFlag, catchData, updateTermHeaderIdFlag]);

  useEffect(() => {
    if (modal) {modal.update({
      className: styles['sbsm-modal-warp'],
    });}
  }, [modal]);

  const value = useMemo<StoreValueType>(() => {
    return {
      loading,
      modalFlag,
      readOnlyFlag,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      sourceDocHeaderDs,
      sourceDocListDs,
      editFlag,
      // sourceDocListLineDs,
      // sourceDocHeaderLineDs,
      onPartChildRef,
      dimensionType,
      modal,
      sourceDocSyncListDs,
      isChange,
      documentTermHeaderDTOList,
    };
  }, [
    loading,
    modalFlag,
    readOnlyFlag,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    sourceDocHeaderDs,
    sourceDocListDs,
    editFlag,
    // sourceDocListLineDs,
    // sourceDocHeaderLineDs,
    onPartChildRef,
    dimensionType,
    modal,
    sourceDocSyncListDs,
    isChange,
    documentTermHeaderDTOList,
  ]);


  if (sourceDocId && !sourceDocHeaderDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
