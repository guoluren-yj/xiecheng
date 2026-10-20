/*
 * @Description: 付款条款管控详情页Store
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-16 10:20:44
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { parse, stringify } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { pick, flow } from 'lodash';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { DataSet, ModalProvider, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import withRemote from 'utils/remote';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate } from '../../utils/type';
import { fetchTermHeaderData } from '../../utils/api';
import { DetailCollapseCode, DetailCustomizeCode } from '../../utils/type';
import { termHeaderDS, termLineDS, cuszLineDS, messageRuleDS, amountRuleDS, dateRuleDS, wholeAmountRuleDS, payDateValidRuleDS } from './detailDS';

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  hideBackFlag: string, // 是否隐藏返回按钮
};
export type StoreValueType = {
  state: any,
  remote: any,
  search: string,
  pathname: string,
  history: any,
  termHeaderId: string | number, // 付款条款单主键id
  operate: Operate, // 路由操作
  allFlag: boolean, // 全部可操作按钮
  editFlag: boolean, // 可编辑
  copyFlag: boolean, // 可复制
  viewFlag: boolean, // 只读
  createFlag: boolean, // 新建
  historyFlag: boolean, // 历史记录
  termLineDs: DataSet, // 结构化行ds
  cuszLineDs: DataSet, // 自定义行ds
  hideBackFlag: string, // 是否隐藏返回按钮
  termHeaderDs: DataSet, // 条款头ds
  messageRuleDs: DataSet, // 消息提醒行ds
  dateRuleDs: DataSet, // 日期默认值规则
  amountRuleDs: DataSet, // 金额默认值规则与校验规则行ds
  wholeAmountRuleDs: DataSet, // 整单金额
  payDateValidRuleDs: DataSet, // 阶段付款日期校验规则
  customizeForm: Function,
  customizeTable: Function,
  customizeCollapse: Function,
  handleBackList: () => void; // 返回列表页
  handleToDetail: (termHeaderId: string | number, operate: Operate) => void, // 跳转详情页
};

export const Store = createContext<any>({});

export const wholeAmountEnableJSONData = {
  enableFlag: 1,
  excessCheckLevel: 'BAN',
  tolControlType: 'AMOUNT',
  excessTolerance: 0,
};

const termPlanDefaultData = [
  { enableFlag: 0, settleType: 'PREPAYMENT' },
  { enableFlag: 0, settleType: 'PAYMENT' },
];

const processChildrenData = (termHeaderDs: DataSet) => {
  if (!termHeaderDs) return;
  const { children } = termHeaderDs;
  const defaultModeChildrenData = termHeaderDs.getState('defaultModeChildrenData');
  const termHeader = termHeaderDs.current;
  const enableTermFlag = termHeader?.get('enableTermFlag');
  if(!termHeader) return;
  const data: Record<string, object[]> = {
    termPlanMessageRuleList: [],
    termPlanDateRuleList: [],
    termPlanAmountRuleList: [],
    termPlanDateValidRuleList: [],
    termLineList: [],
    termPlanExecutedAmountRuleList: [],
  };
  if (defaultModeChildrenData && termHeaderDs.getField('enableTermFlag')?.isDirty(termHeader) === false) {
    Object.assign(data, defaultModeChildrenData);
  } else {
    if (Number(enableTermFlag) === 0) {
      Object.assign(data, {
        termPlanExecutedAmountRuleList: [{ enableFlag: 0 }],
      });
    }
    if (Number(enableTermFlag) === 1) {
      Object.assign(data, {
        termPlanMessageRuleList: termPlanDefaultData,
        termPlanDateRuleList: termPlanDefaultData,
        termPlanAmountRuleList: termPlanDefaultData,
        termPlanDateValidRuleList: termPlanDefaultData,
        termPlanExecutedAmountRuleList: [wholeAmountEnableJSONData],
      });
    }
    if (Number(enableTermFlag) === 2) {
      Object.assign(data, {
        termPlanExecutedAmountRuleList: [wholeAmountEnableJSONData],
        termLineList: [{
          stageNum: '01',
          stageDesc: termHeaderDs.getField('enableTermFlag')?.getText(),
          prepayFlag: 0,
          enableStageAmountFlag: 1,
          amountMaintainCode: 'COUNT_HUNDRED_PERCENT',
          stagePercent: 100,
          baseAmountFieldCode: 'paymentAmount',
          grandFlag: 0,
          enableStageDateFlag: 0,
        }],
      });
    }
  }
  Object.entries(data).forEach(([childName, childData]) => {
    // null 值会引发端侧报错，需要默认为空数组
    children[childName].loadData(childData || []);
  });
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailCollapseCode,
      ...Object.values(DetailCustomizeCode),
    ],
  }),
  withRemote({
    code: 'SMDM.PAY_TERMS_CTRL_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['smdm.payTermsCtrl'] }),
)((props) => {
  const { remote, history, match, location, children, customizeForm, customizeTable, customizeCollapse } = props;
  const { params } = match || {};
  const { state, pathname = '', search = '' } = location || {};
  const { termId, termNum, termHeaderId } = params;
  const { operate, hideBackFlag } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = operate === 'all';
  const editFlag = operate === 'edit';
  const copyFlag = operate === 'copy';
  const historyFlag = operate === 'history';
  const viewFlag = ['view', 'all', 'history', undefined].includes(operate);
  const createFlag = operate === 'create' || termHeaderId === 'create';
  const fetchReleasedFlag = pathname.includes('released');

  const termLineDs = useMemo(() => new DataSet(
    remote 
    ? remote.process('SMDM_PAY_TERM_LINE_DS_PROPS', termLineDS({ viewFlag }), {})
    : termLineDS({ viewFlag })
  ), [viewFlag, remote]);

  const cuszLineDs = useMemo(() => new DataSet(cuszLineDS()), []);
  const messageRuleDs = useMemo(() => new DataSet(messageRuleDS()), []);
  const dateRuleDs = useMemo(() => new DataSet(dateRuleDS()), []);
  const amountRuleDs = useMemo(() => new DataSet(amountRuleDS()), []);
  const wholeAmountRuleDs = useMemo(() => new DataSet(wholeAmountRuleDS()), []);
  const payDateValidRuleDs = useMemo(() => new DataSet(payDateValidRuleDS()), []);

  // 条款取消结构化后行重置行防止不必要的校验
  const onHeaderUpdate = (({ name, dataSet }) => {
    if (name === 'enableTermFlag') {
      processChildrenData(dataSet);
    }
  });

  const termHeaderDs = useMemo(() => new DataSet({
    ...termHeaderDS({ termId, termNum, termHeaderId, createFlag, copyFlag, fetchReleasedFlag }),
    children: {
      termLineList: termLineDs,
      termLineExpandList: cuszLineDs,
      termPlanMessageRuleList: messageRuleDs,
      termPlanDateRuleList: dateRuleDs,
      termPlanAmountRuleList: amountRuleDs,
      termPlanDateValidRuleList: payDateValidRuleDs,
      termPlanExecutedAmountRuleList: wholeAmountRuleDs,
    },
    events: { update: onHeaderUpdate },
  }), [termId, termNum, termHeaderId, createFlag, copyFlag, fetchReleasedFlag, termLineDs, cuszLineDs, messageRuleDs, dateRuleDs, amountRuleDs, wholeAmountRuleDs, payDateValidRuleDs]);

  const handleManualGetHeader = useCallback(async () => {
    const res = getResponse(await fetchTermHeaderData(termHeaderId));
    if (!res) return;
    termHeaderDs.create({
      ...res,
      versionNumber: null,
      displayStatus: 'UNPUBLISH',
    });
  }, [termHeaderId, termHeaderDs]);

  const handleInitChildrenData = useCallback(async () => {
    processChildrenData(termHeaderDs);
  }, [termHeaderDs]);

  useEffect(() => {
    if (createFlag) handleInitChildrenData();
    if (copyFlag) handleManualGetHeader();
  }, [copyFlag, createFlag, handleManualGetHeader, handleInitChildrenData]);

  // 跳转至详情页
  const handleToDetail = useCallback((termHeaderId, operate) => {
    if (!termHeaderId) return;
    history.push({
      pathname: `/smdm/payment-terms/detail/${termHeaderId}`,
      search: stringify({ operate }),
    });
  }, [history]);

  // 跳回列表页
  const handleBackList = useCallback(() => {
    history.push({
      pathname: `/smdm/payment-terms/list`,
    });
  }, [history]);

  const onBeforeHeaderLoad = ({ data, dataSet }) => {
    const queryData = data[0] || {};
    dataSet.setState('defaultModeChildrenData', pick(queryData, Object.keys(dataSet.children)));
  };

  useEffect(() => {
    termHeaderDs.addEventListener('beforeLoad', onBeforeHeaderLoad);
    return () => {
      termHeaderDs.removeEventListener('beforeLoad', onBeforeHeaderLoad);
    };
  }, [termHeaderDs]);

  const value: StoreValueType = useMemo(() => {
    return {
      state,
      remote,
      search,
      pathname,
      history,
      termHeaderId,
      operate,
      allFlag,
      editFlag,
      copyFlag,
      viewFlag,
      createFlag,
      historyFlag,
      termLineDs,
      cuszLineDs,
      dateRuleDs,
      hideBackFlag,
      termHeaderDs,
      amountRuleDs,
      messageRuleDs,
      wholeAmountRuleDs,
      payDateValidRuleDs,
      customizeForm,
      customizeTable,
      customizeCollapse,
      handleBackList,
      handleToDetail,
    };
  }, [
    state,
    remote,
    search,
    pathname,
    history,
    termHeaderId,
    operate,
    allFlag,
    editFlag,
    copyFlag,
    viewFlag,
    createFlag,
    historyFlag,
    termLineDs,
    cuszLineDs,
    dateRuleDs,
    hideBackFlag,
    termHeaderDs,
    amountRuleDs,
    messageRuleDs,
    wholeAmountRuleDs,
    payDateValidRuleDs,
    customizeForm,
    customizeTable,
    customizeCollapse,
    handleBackList,
    handleToDetail,
  ]);

  if (!termHeaderDs.current) {
    return <Spin />;
  }

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;