/*
 * @Description: 付款计划详情页store
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-26 12:59:58
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { parse } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { DataSet, ModalProvider, Spin } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { isNil, isFunction } from 'lodash';

import withRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate } from '../../utils/type';
import permissionDS from '../../../../stores/permissionDS';
import { validatePlanNum } from '../../utils/utils';
import { permissionCodeMap } from '../../List/stores';
import { parseRouteHref } from '../../../../utils/utils';
import { DetailCollapseCode, DetailCustomizeCode, PlanSourceCode } from '../../utils/type';
import { planLineDS, cuszLineDS, planHeaderDS, messageRuleDS, dateRuleDS, amountRuleDS, wholeAmountRuleDS, payDateValidRuleDS } from './detailDS';

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  source: 'sodr' | 'spcm',
};
export interface StoreValueType {
  state: any,
  remote: any,
  search: string,
  history: any,
  pathname: string,
  loading: boolean,
  allFlag: boolean,
  editFlag: boolean,
  sodrFlag: boolean,
  spcmFlag: boolean,
  modalFlag: boolean,
  changeFlag: boolean,
  historyFlag: boolean,
  sourceCode: PlanSourceCode,
  planLineDs: DataSet,
  cuszLineDs: DataSet,
  messageRuleDs: DataSet, // 消息提醒行ds
  dateRuleDs: DataSet, // 日期默认值规则
  amountRuleDs: DataSet, // 金额默认值规则与校验规则行ds
  headerTitle: string,
  planHeaderDs: DataSet,
  permissionMap: DSRecord | undefined,
  wholeAmountRuleDs: DataSet,
  contentStyleType?: 'fullfit',
  payDateValidRuleDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  customizeCollapse: Function,
  onPartChildRef: (partChildRef: Record<string, any>) => void,
  handleSetLoading: (loadingFlag: boolean) => void,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailCollapseCode,
      ...Object.values(DetailCustomizeCode),
    ],
  }),
  withRemote({
    code: 'SSTA.PAYMENT_PLAN_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['ssta.paymentPlan', 'ssta.common'] }),
)((props) => {
  const {
    href,
    modal,
    match,
    remote,
    history,
    location,
    children,
    termsData: externalTermData = {},
    headerTitle,
    sourceAmount: externalSourceAmount,
    customizeForm,
    customizeTable,
    customizeCollapse,
    onPartChildRef,
    sourcePageData = {},
    contentStyleType,
    onSetSourceLoading,
  } = props;
  // pcHeaderId, pcStatusFlag, pcNum, mainPcNum 为协议字段
  const { pcHeaderId, pcStatusFlag, pcNum, mainPcNum } = sourcePageData || {};
  const { termHeaderId: externalTermHeaderId, termNum: externalTermNum } = externalTermData || {};
  const { match: manualMatch, location: manualLocation } = parseRouteHref(href, [
    '/ssta/payment-plan/detail/:planHeaderId',
    '/ssta/payment-plan/detail-by-num/:planNum',
  ]);
  const { params } = match || manualMatch || {};
  const { pathname, state, search = '' } = location || manualLocation || {};
  const { planHeaderId, planNum } = params || {};
  const { operate, source } = parse(search.substring(1)) as ParsedSearchType;
  // 此处的 sourceCode、sodrFlag、spcmFlag 只是为了加载数据，页面控制后续会用头字段覆盖
  let sourceCode = PlanSourceCode[source];
  let sodrFlag = sourceCode === PlanSourceCode.sodr;
  let spcmFlag = sourceCode === PlanSourceCode.spcm;
  const allFlag = operate === 'all';
  const editFlag = operate === 'edit';
  const changeFlag = operate === 'change';
  const historyFlag = operate === 'history';
  const modalFlag = Boolean(modal);
  const planLineDs = useMemo<DataSet>(() => new DataSet(planLineDS({ editFlag })), [editFlag]);
  const cuszLineDs = useMemo<DataSet>(() => new DataSet(cuszLineDS()), []);
  const messageRuleDs = useMemo<DataSet>(() => new DataSet(messageRuleDS()), []);
  const dateRuleDs = useMemo<DataSet>(() => new DataSet(dateRuleDS()), []);
  const amountRuleDs = useMemo<DataSet>(() => new DataSet(amountRuleDS()), []);
  const wholeAmountRuleDs = useMemo<DataSet>(() => new DataSet(wholeAmountRuleDS()), []);
  const payDateValidRuleDs = useMemo<DataSet>(() => new DataSet(payDateValidRuleDS()), []);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleLoadHeader = useCallback(({ dataSet }) => {
    if (!sodrFlag) return;
    // 协议不存在 externalSourceAmount
    if (!editFlag || isNil(externalSourceAmount)) return;
    // 初始化的过程中不能用init，避免受dataToJSON的影响导致不传给后端
    const headerDsCurrent = dataSet.current;
    if (!headerDsCurrent) return;
    headerDsCurrent.set({ sourceAmount: externalSourceAmount });
  }, [externalSourceAmount, editFlag, sodrFlag]);

  const planHeaderDs: DataSet = useMemo(() => {
    const privateParams: Record<string, any> = { sourceCode, editFlag };
    // 有id优先传id，没有优先传编码，会有字符串null的情况，后端已过滤
    if (planHeaderId) privateParams.planHeaderId = planHeaderId;
    else if (validatePlanNum(planNum)) privateParams.planNum = planNum;
    // 历史记录接口参数
    if (historyFlag) privateParams.showHeaderCode = 'HISTORY';
    // 订单编辑接口参数
    if (sodrFlag && editFlag && !isNil(externalSourceAmount)) {
      const sodrEditParams = { termNum: externalTermNum, termHeaderId: externalTermHeaderId, sourceAmount: externalSourceAmount };
      Object.assign(privateParams, sodrEditParams);
    };
    // 协议编辑接口参数
    if (spcmFlag) {
      const spcmEditParams = { pcStatusFlag, sourceNum: mainPcNum || pcNum, contractId: pcHeaderId };
      Object.assign(privateParams, spcmEditParams);
    }
    return new DataSet({
      ...planHeaderDS(privateParams),
      children: {
        planLineDTOS: planLineDs,
        planLineExpandList: cuszLineDs,
        messageRules: messageRuleDs,
        planDateRules: dateRuleDs,
        planAmountRules: amountRuleDs,
        planDateValidRules: payDateValidRuleDs,
        planExecutedAmountRuleList: wholeAmountRuleDs,
      },
      events: { load: handleLoadHeader },
    });
  }, [
    pcNum,
    mainPcNum,
    planLineDs,
    cuszLineDs,
    planHeaderId,
    planNum,
    messageRuleDs,
    dateRuleDs,
    amountRuleDs,
    handleLoadHeader,
    editFlag,
    sodrFlag,
    spcmFlag,
    pcHeaderId,
    sourceCode,
    pcStatusFlag,
    externalTermNum,
    externalSourceAmount,
    externalTermHeaderId,
    historyFlag,
    wholeAmountRuleDs,
    payDateValidRuleDs,
  ]);

  const loading = planHeaderDs.status !== 'ready';
  // 查询数据需要其他单据中使用时传入了 source来明确接口参数
  // 付款计划台账页面没有 source，需要根据头字段来判断
  if (!source) {
    sourceCode = planHeaderDs.current?.get('sourceCode');
    sodrFlag = sourceCode === PlanSourceCode.sodr;
    spcmFlag = sourceCode === PlanSourceCode.spcm;
  }

  const handleInitPlanHeader = useCallback(async () => {
    const res = await planHeaderDs.query();
    if (!res) return;
    // editFlag=1会触发草稿版本，因为除了初始化 query 的后续查询需要传入这个参数
    // 协议初始化没有planNum参数，初始化完成后需要注入以便后续查询不报错
    if (editFlag) {
      planHeaderDs.setQueryParameter('showHeaderCode', 'DRAFT');
      if (!validatePlanNum(planHeaderDs.getQueryParameter('planNum'))) {
        planHeaderDs.setQueryParameter('planNum', res.planNum);
      }
    }
  }, [planHeaderDs, editFlag]);

  useEffect(() => {
    handleInitPlanHeader();
  }, [handleInitPlanHeader]);

  useEffect(() => {
    if (isFunction(onSetSourceLoading)) onSetSourceLoading(loading || !planHeaderDs.current);
  }, [loading, onSetSourceLoading, planHeaderDs]);

  const handleSetLoading = useCallback((loadingFlag: boolean) => {
    planHeaderDs.status = loadingFlag ? DataSetStatus.loading : DataSetStatus.ready;
  }, [planHeaderDs]);

  const value = useMemo<StoreValueType>(() => {
    return {
      state,
      remote,
      search,
      history,
      pathname,
      loading,
      allFlag,
      editFlag,
      sodrFlag,
      spcmFlag,
      modalFlag,
      changeFlag,
      historyFlag,
      sourceCode,
      planLineDs,
      cuszLineDs,
      messageRuleDs,
      dateRuleDs,
      amountRuleDs,
      headerTitle,
      planHeaderDs,
      permissionMap,
      wholeAmountRuleDs,
      payDateValidRuleDs,
      customizeForm,
      customizeTable,
      customizeCollapse,
      onPartChildRef,
      contentStyleType,

      handleSetLoading,
    };
  }, [
    state,
    remote,
    search,
    history,
    pathname,
    loading,
    allFlag,
    editFlag,
    sodrFlag,
    spcmFlag,
    modalFlag,
    changeFlag,
    historyFlag,
    sourceCode,
    planLineDs,
    cuszLineDs,
    messageRuleDs,
    dateRuleDs,
    amountRuleDs,
    headerTitle,
    planHeaderDs,
    permissionMap,
    wholeAmountRuleDs,
    payDateValidRuleDs,
    customizeForm,
    customizeTable,
    customizeCollapse,
    onPartChildRef,
    contentStyleType,
    handleSetLoading,
  ]);

  if (!planHeaderDs.current) {
    return <Spin />;
  }

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default (StoreProvider);
