import React, { createContext, useMemo, useEffect, useCallback } from 'react';
import { flow, isNil } from 'lodash';
import { observer } from 'mobx-react';
import { ModalProvider, DataSet, Spin, Button } from 'choerodon-ui/pro';

import withRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';

import { executionDS, headerDS } from './indexDS';
import { ErrorHeadCustCodeMap, ExeCustCodeMap, HeadCustCodeMap, PermissionCodeMap } from '../../utils/type';
import permissionDS from '../../../../utils/permissionDS';

export const Store = createContext<StoreValueType>({} as StoreValueType);

export interface StoreValueType {
  remote: any,
  boolMap: {
    modalFlag: boolean,
    errorFlag: boolean,
  },
  loading: Boolean,
  headerDs: DataSet,
  executionDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ExeCustCodeMap.Grid,
      ...Object.values(HeadCustCodeMap),
      ...Object.values(ErrorHeadCustCodeMap),
    ],
  }),
  withRemote({
    code: 'SBSM.PAYMENT_POOL_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.paymentPool'] }),
)((props) => {
  const {
    modal,
    remote,
    children,
    customizeForm,
    customizeTable,
  } = props;

  const { payId, payErrorId } = props;
  const headerDs = useMemo(() => new DataSet(headerDS(payId, payErrorId)), [payId, payErrorId]);
  const executionDs = useMemo(() => new DataSet(executionDS(payId)), [payId]);

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const { importDimension, documentId, documentType } = headerDs.current?.get(['importDimension', 'documentId', 'documentType']) || {};

  const boolMap = useMemo(() => ({
    modalFlag: Boolean(modal),
    errorFlag: !isNil(payErrorId),
  }), [modal, payErrorId]);

  const handleViewSourceDetail = useCallback(() => {
    if (documentType === 'PAYMENT_WHOLE') {
      openTab({
        key: `/ssta/new-purchase-settle/payment/${documentId}`,
        title: intl.get('sbsm.common.view.title.settleWorkspace').d('采购方结算单工作台'),
        search: queryString.stringify({
          source: 'sbsm',
          type: 'all',
        }),
      });
    } else if (documentType === 'PREPAYMENT_WHOLE') {
      openTab({
        key: `/ssta/new-purchase-settle/pre-payment`,
        title: intl.get('sbsm.common.view.title.settleWorkspace').d('采购方结算单工作台'),
        search: queryString.stringify({
          source: 'detail',
          documentType: 'PREPAYMENT',
          settleHeaderId: documentId,
        }),
      });
    }
  }, [documentType, documentId]);

  useEffect(() => {
    if (modal) {
      modal.update({
        footer: (okBtn) => [
          okBtn,
          permissionMap?.get('sourceDetail') && importDimension === 'WHOLE' && (<Button onClick={() => handleViewSourceDetail()}>{intl.get('sbsm.paymentPool.model.paymentPool.sourceDocDetail').d('查看来源单据详情')}</Button>),
        ],
      });
    }
  }, [modal, handleViewSourceDetail, permissionMap, importDimension]);

  const loading = headerDs.status !== 'ready';

  const value = useMemo(() => ({
    remote,
    boolMap,
    loading,
    headerDs,
    executionDs,
    customizeForm,
    customizeTable,
  }), [
    remote,
    boolMap,
    loading,
    headerDs,
    executionDs,
    customizeForm,
    customizeTable,
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
