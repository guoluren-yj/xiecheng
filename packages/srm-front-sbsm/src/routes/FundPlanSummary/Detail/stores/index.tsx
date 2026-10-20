import React, { createContext, useMemo, useCallback } from 'react';
import { flow, isNil } from 'lodash';
import { observer } from 'mobx-react';
import { parse, stringify } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import remoteUtils from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate } from '../../utils/type';
import { actionFlagger } from '../../utils/utils';
import { headerDS, lineDS, multiLineDS } from './indexDS';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import { DetailCustomizeCode, DetailBtnCode, DetailCollapseCode, PermissionCode } from '../../utils/type';
import permissionDS from '../../../../utils/permissionDS';

export const Store = createContext<StoreValueType>({} as StoreValueType);

export interface StoreValueType {
  history: any,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  customizeCollapse: Function,
  lineDs: DataSet,
  headerDs: DataSet,
  handleToDetail: Function,
  boolMap: {
    editBtn: boolean,
    approveBtn: boolean,
    cancelBtn: boolean,
    revokeApprovalBtn: boolean,
    allFlag: boolean,
    viewFlag: boolean,
    editFlag: boolean,
    cancelFlag: boolean,
    pubFlag: boolean,
  },
  location: any,
  balHeaderId: any,
  loading: boolean,
  multiLineDs: DataSet,
  remote: any,
  workflowCaller: WorkflowCaller,
  permissionMap: DSRecord | undefined,
};

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  type?: string,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailBtnCode,
      DetailCollapseCode,
      ...Object.values(DetailCustomizeCode),
    ],
  }),
  remoteUtils({
    code: 'SBSM.FUND_PLAN_SUMMARY_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.payTermsCtrl', 'sbsm.fundPlanForecast'] }),
)((props) => {
  const {
    children,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    customizeCollapse,
    history,
    match,
    location,
    remote,
  } = props;

  const { params } = match || {};
  const { search = '', pathname = '' } = location || {};
  const { balHeaderId } = params;
  const { operate } = parse(search.substring(1)) as ParsedSearchType;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;
  // 多维度编制结果
  const multiLineDs = useMemo(() => new DataSet(multiLineDS(balHeaderId)), [balHeaderId]);
  // 编制明细
  const lineDs = useMemo(() => new DataSet(lineDS()), []);
  // 头信息
  const headerDs = useMemo(() => new DataSet({
    ...headerDS(balHeaderId),
    children: {
       balLineList: lineDs,
    },
  }), [lineDs, balHeaderId]);
  const workflowCaller = useMemo(() => new WorkflowCaller(headerDs), [headerDs]);

  const [editBtn, approveBtn, cancelBtn, revokeApprovalBtn] = actionFlagger({
    workflowCaller,
    record: headerDs.current,
    action: ['edit', 'approve', 'cancel', 'revokeApproval'],
    permissionMap,
  });

  const boolMap = useMemo(() => {
    return {
      editBtn,
      approveBtn,
      cancelBtn,
      revokeApprovalBtn,
      allFlag: operate === 'all',
      viewFlag: isNil(operate),
      editFlag: operate === 'edit',
      cancelFlag: operate === 'cancel',
      pubFlag: pathname.split('/')[1] === 'pub',
    };
  }, [operate, editBtn, pathname, approveBtn, cancelBtn, revokeApprovalBtn]);

  const handleToDetail = useCallback((id: string | number, operateType: Operate) => {
    if (!id) return;
    history.push({
      pathname: `/sbsm/fund-plan-summary/detail/${id}`,
      search: stringify({ operate: operateType }),
    });
  }, [history]);

  const loading = headerDs.status !== 'ready';

  const value = useMemo(() => ({
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    lineDs,
    headerDs,
    history,
    handleToDetail,
    boolMap,
    location,
    customizeCollapse,
    balHeaderId,
    loading,
    multiLineDs,
    remote,
    workflowCaller,
    permissionMap,
  }), [
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    lineDs,
    headerDs,
    history,
    handleToDetail,
    boolMap,
    location,
    customizeCollapse,
    balHeaderId,
    loading,
    multiLineDs,
    remote,
    workflowCaller,
    permissionMap,
  ]);

  if (!headerDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as React.FC;

export default StoreProvider;
