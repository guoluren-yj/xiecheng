import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { parse } from 'querystring';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withRemote from 'utils/remote';

import { headerDS, lineDS } from './indexDS';

export type Operate = 'edit' | 'view' | undefined;

export const BasicCode = 'SSTA.PURCHASE_SETTLE_DETAIL.BATCH_PAY_BASIC';
export const LineSearchCode = 'SSTA.PURCHASE_SETTLE_DETAIL.BATCH_PAY_LIST_SEARCH';
export const LineCode = 'SSTA.PURCHASE_SETTLE_DETAIL.BATCH_PAY_LIST_GRID';

export const Store = createContext<StoreValueType>({} as StoreValueType);

export interface StoreValueType {
  remote: any,
  customizeTable: Function,
  customizeForm: Function,
  lineDs: DataSet,
  headerDs: DataSet,
  operate: Operate,
  notPub: boolean,
  handleBackList: () => void,
  batchApproveId: string,
  loading: boolean,
  modal: any,
  location: any,
  editFlag: boolean,
};


const StoreProvider = flow(
  observer,
  withRemote({
    code: 'SSTA.PURCHASE_SETTLE_BATCH_SUBMIT_CUX',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      BasicCode,
      LineSearchCode,
      LineCode,
    ],
  }),
  formatterCollections({ code: ['ssta.common', 'ssta.purchaseSettle'] }),
)((props) => {
  const {
    remote,
    children,
    customizeTable,
    customizeForm,
    match,
    location,
    batchApproveId: batchApproveIdProps,
    operate: operateProps,
    history,
    modal,
    handleOk: handleOkProps,
    remoteProps,
    listSelected,
  } = props;

  const { params } = match || {};
  const { search = '', pathname = '' } = location || {};
  const { batchApproveId: batchApproveIdParams, batchId } = params || {};
  const { operate: operateUrl } = parse(search.substring(1)) || {};

  // 功能页面标识
  const notPub = pathname?.split('/')[1] !== 'pub';

  const batchApproveId = batchApproveIdParams || batchApproveIdProps || batchId;
  const operate = operateUrl || operateProps;
  const editFlag = operate === 'edit';

  // 结算单明细
  const lineDs = useMemo(() => new DataSet(lineDS(batchApproveId)), [batchApproveId]);
  // 批次头信息
  const headerDs = useMemo(() => new DataSet(remoteProps ? remoteProps.process(
    'SSTA_PURCHASESETTLE_LIST.SUBMIT_BATCH_HEADERDS',
    { ...headerDS(batchApproveId) },
    { lineDs, listSelected }
  ) : {
    ...headerDS(batchApproveId),
    // children: {},
  }), [lineDs, listSelected, remoteProps, batchApproveId]);

  const loading = headerDs.status !== 'ready';

  const handleBackList = useCallback(() => {
    history.push({
      pathname: '/ssta/new-purchase-settle/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleBeforeSubmitFinal = useCallback(async () => {
    if (remote?.event) {
      const res = await remote.event.fireEvent('beforeSubmitFinal', {
        lineDs,
        headerDs,
        listSelected,
        batchApproveId,
      });
      return res;
    }
  }, [
    remote,
    lineDs,
    headerDs,
    listSelected,
    batchApproveId,
  ]);

  const handleOk = useCallback(async () => {
    const data = headerDs.current?.toData();
    if (handleOkProps) {
      const res = await handleOkProps(data, { handleBeforeSubmitFinal });
      if (!res) return false;
    }
    return true;
  }, [handleOkProps, headerDs, handleBeforeSubmitFinal]);

  useEffect(() => {
    if (!modal) return;
    const mergeData = editFlag ? {
      onOk: handleOk,
    } : {
      okText: intl.get(`hzero.common.btn.close`).d('关闭'),
    };
    modal.update({
      ...mergeData,
      footer: (okBtn, cancelBtn) => {
        const normalBtns = editFlag ? [okBtn, cancelBtn] : [okBtn];
        return remote
          ? remote.process(
            'SSTA.PURCHASE_SETTLE_BATCH_SUBMIT_CUX.MODAL_FOOTER',
            normalBtns,
            {
              modal,
              lineDs,
              headerDs,
              editFlag,
              listSelected,
              batchApproveId,
            }
          )
          : normalBtns;
      },
    });
  }, [
    modal,
    remote,
    lineDs,
    headerDs,
    editFlag,
    handleOk,
    listSelected,
    batchApproveId,
  ]);

  const value = useMemo(() => ({
    remote,
    customizeTable,
    customizeForm,
    lineDs,
    headerDs,
    loading,
    operate,
    notPub,
    handleBackList,
    batchApproveId,
    modal,
    location,
    editFlag,
  }), [
    remote,
    customizeTable,
    customizeForm,
    lineDs,
    headerDs,
    loading,
    operate,
    notPub,
    handleBackList,
    batchApproveId,
    modal,
    location,
    editFlag,
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
