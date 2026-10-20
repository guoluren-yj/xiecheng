import { stringify } from 'querystring';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

import withRemote from 'utils/remote';
import withProps from 'utils/withProps';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate} from '../../utils/type';
import { fetchPayDocListTotal } from '../../utils/api';
import permissionDS from '../../../../utils/permissionDS';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import { wholeListDS, paymentListDS, settlementListDS } from './listDS';
import { ActiveKey, ListTabsCustCode, GridCustCodeMap, ListBtnsCustCode, PermissionCodeMap } from '../../utils/type';

interface ContextValueType {
  dsMap: Record<ActiveKey, DataSet>,
  remote: any,
  history: any,
  cacheState: Map<string, any>,
  permissionMap: any,
  handleToDetail: (id: any, operateType?: Operate) => void,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  defaultActiveKey: ActiveKey,
  fetchTabKeysCount: (tabKeys: ActiveKey[]) => void,
};

export const Store = createContext<ContextValueType>({} as ContextValueType);

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ListBtnsCustCode,
      ...Object.values(GridCustCodeMap),
    ],
  }),
  withRemote({
    code: 'SBSM.PAYMENT_WORKBENCH_LIST_CUX',
    name: 'remote',
  }),
  withProps(
    (() => {
      const cacheState = new Map(); // 缓存tab页编码
      const dsMap: Record<ActiveKey, DataSet> = {
        [ActiveKey.WholeAll]: new DataSet(wholeListDS(ActiveKey.WholeAll)),
        [ActiveKey.WholeEdit]: new DataSet(wholeListDS(ActiveKey.WholeEdit)),
        [ActiveKey.WholeApprove]: new DataSet(wholeListDS(ActiveKey.WholeApprove)),
        [ActiveKey.WholeConfirm]: new DataSet(wholeListDS(ActiveKey.WholeConfirm)),
        [ActiveKey.WholeReverse]: new DataSet(wholeListDS(ActiveKey.WholeReverse)),
        [ActiveKey.DetailPayment]: new DataSet(paymentListDS(ActiveKey.DetailPayment)),
        [ActiveKey.DetailStatement]: new DataSet(settlementListDS(ActiveKey.DetailStatement)),
      };
      return {
        dsMap,
        cacheState,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['sbsm.common', 'sbsm.paymentWorkbench'] }),
)((props) => {

  const {
    dsMap = {},
    remote,
    history,
    children,
    cacheState = new Map(),
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;
  // 初始化过的activeKey对象
  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const defaultActiveKey = fieldCode || cacheState?.get('activeKey') || ActiveKey.WholeAll;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleToDetail = useCallback((id: any, operateType: Operate) => {
    if (id) {
      history.push({
        pathname: `/sbsm/payment-workbench/detail/${id}`,
        search: stringify(filterNullValueObject({ operate: operateType })),
      });
    }
  }, [history]);

  // 查询所有总数目
  const fetchTabKeysCount = useCallback(async (tabKeys: ActiveKey[] = []) => {
    const resMap = await Promise.all(
      tabKeys.map((item) => fetchPayDocListTotal(item))
    );
    runInAction(() => {
      resMap.forEach((res, index) => {
        const { totalElements = 0 } = getResponse(res) || {};
        dsMap[tabKeys[index]].setState('totalCount', totalElements);
      });
    });
  }, [dsMap]);

  useEffect(() => {
    fetchTabKeysCount(Object.values(ActiveKey));
  }, [fetchTabKeysCount]);

  useEffect(() => {
    dsMap[ActiveKey.WholeAll].setState('workflowCaller', new WorkflowCaller(dsMap[ActiveKey.WholeAll]));
    dsMap[ActiveKey.WholeApprove].setState('workflowCaller', new WorkflowCaller(dsMap[ActiveKey.WholeApprove]));
    return () => {
      dsMap[ActiveKey.WholeAll].getState('workflowCaller').destroy();
      dsMap[ActiveKey.WholeApprove].getState('workflowCaller').destroy();
    };
  }, [dsMap]);

  const value = useMemo(() => ({
    dsMap,
    remote,
    history,
    cacheState,
    permissionMap,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  }), [
    dsMap,
    remote,
    history,
    cacheState,
    permissionMap,
    handleToDetail,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    fetchTabKeysCount,
  ]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as React.FC;

export default StoreProvider;