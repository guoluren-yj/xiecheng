// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useCallback } from 'react';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { parse, stringify } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remoteUtils from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';

import { headerDS, preLineDS, prepResultDS } from './indexDS';
// import type { Operate } from '../../utils/type';
import { DetailCustomizeCode, DetailBtnCode, DetailCollapseCode, PermissionCode, CreateSourceCode, CreateStageCode } from '../../utils/type';
import type { Operate } from '../../utils/type';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import permissionDS from '../../../../utils/permissionDS';

export const Store = createContext<any>({});



export interface StoreValueType {
  history: any,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  customizeCollapse: Function,
  preLineDs: DataSet,
  headerDs: DataSet,
  handleToList: Function,
  handleToDetail: Function,
  viewFlag: boolean,
  editFlag: boolean,
  location: any,
  prepHeaderId: any,
  loading: boolean,
  prepResultDs: DataSet,
  checkFlag: boolean,
  remote: any,
  cancelFlag: boolean,
  pubFlag: boolean,
  workflowCaller: any,
  permissionMap: DSRecord | undefined,
};

type ParsedSearchType = ParsedUrlQuery & {
    operate: Operate,
    type?: string,
  };

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [...Object.values(DetailCustomizeCode), DetailBtnCode, DetailCollapseCode, ...Object.values(CreateSourceCode), ...Object.values(CreateStageCode)],
  }),
  remoteUtils({
    code: 'SBSM.FUND_PLAN_PREPARATION_DETAIL_CUX',
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
  const { search = '', pathname } = location || {};
  const { prepHeaderId } = params;
  const { operate } = parse(search.substring(1)) as ParsedSearchType;
  const viewFlag = operate === 'view';
  const editFlag = operate === 'edit';
  const checkFlag = operate === 'check';
  const cancelFlag = operate === 'cancel';
  const pubFlag = pathname.split('/')[1] === 'pub';

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;

  // 多维度编制结果
  const prepResultDs = useMemo(() => new DataSet(prepResultDS(prepHeaderId)), [prepHeaderId]);
  // 编制明细
  const preLineDs = useMemo(() => new DataSet(preLineDS(prepHeaderId)), [prepHeaderId]);
  // 头信息
  const headerDs = useMemo(() => new DataSet({
    ...headerDS(prepHeaderId),
    children: {
      prepLineList: preLineDs,
    },
  }), [preLineDs, prepHeaderId]);
  const workflowCaller = useMemo(() => new WorkflowCaller(headerDs), [headerDs]);

  const handleToList = useCallback(() => {
    notification.success({});
    history.push({
      pathname: '/sbsm/fund-plan-preparation/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleToDetail = useCallback((id: string | number, operateType: Operate) => {
    if (!id) return;
    history.push({
      pathname: `/sbsm/fund-plan-preparation/detail/${id}`,
      search: stringify({ operate: operateType }),
    });
  }, [history]);

  const loading = headerDs.status !== 'ready';

  const value: StoreValueType = useMemo(() => ({
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    preLineDs,
    headerDs,
    history,
    handleToList,
    handleToDetail,
    viewFlag,
    editFlag,
    location,
    customizeCollapse,
    prepHeaderId,
    loading,
    prepResultDs,
    checkFlag,
    remote,
    cancelFlag,
    pubFlag,
    workflowCaller,
    permissionMap,
  }), [
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    preLineDs,
    headerDs,
    history,
    handleToList,
    handleToDetail,
    viewFlag,
    editFlag,
    location,
    customizeCollapse,
    prepHeaderId,
    loading,
    prepResultDs,
    checkFlag,
    remote,
    cancelFlag,
    pubFlag,
    workflowCaller,
    permissionMap,
  ]);

  if (!headerDs?.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;
