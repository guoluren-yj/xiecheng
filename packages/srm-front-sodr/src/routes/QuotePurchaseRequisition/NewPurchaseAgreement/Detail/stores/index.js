import React, { createContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';
import Exception from 'components/Exception';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  getUserOrganizationId,
} from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { ModalProvider, Spin, useDataSet } from 'choerodon-ui/pro';
import remote from 'hzero-front/lib/utils/remote';
import LineDs from './LineDs';
import HeaderDs from './HeaderDs';
import { purchaseAgreement } from './purchaseAgreementDs';
import MaintainDs from '@/routes/QuotePurchaseRequisition/NewPurchaseAgreement/Detail/stores/MaintainDs';
import { queryCommonDoubleUomConfig } from '@/routes/components/utils';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    history,
    cuxRemote,
    location: { search },
    children,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
  } = props;
  const userId = getCurrentUserId();
  const tenantId = getCurrentOrganizationId();
  const organizationId = getUserOrganizationId();
  const { poHeaderId, source, itemKey } = querystring.parse(search.substr(1));
  const sourcePath =
    source === 'maintain'
      ? '/sodr/purchase-order-maintain/list'
      : '/sodr/purchase-order-maintain/purchase/list';
  const internationalTelCodeDs = useDataSet(() => {}, []);
  const excessOrderTypeDs = useDataSet(() => {}, []);
  const batchMaintainDs = useDataSet(() => {}, []);
  const purchaseAgreementDs = useDataSet(() => purchaseAgreement(), []);
  const [loadings, loading] = useState(false);
  const lineDs = useDataSet(
    () => LineDs({ internationalTelCodeDs, excessOrderTypeDs, tenantId, organizationId, userId }),
    [internationalTelCodeDs, excessOrderTypeDs, tenantId, organizationId, userId]
  );
  const headerDs = useDataSet(
    () =>
      HeaderDs({
        poHeaderId,
        tenantId,
        organizationId,
        lineDs,
        history,
        sourcePath,
        // purchaseAgreementDs,
      }),
    [poHeaderId, tenantId, organizationId, lineDs, history, sourcePath, purchaseAgreementDs]
  );
  const header = headerDs.current;
  const maintainDs = useDataSet(
    () =>
      header
        ? MaintainDs({
            tenantId,
            batchMaintainDs,
            lineDs,
            header,
            type: 'agreement',
          })
        : {},
    [batchMaintainDs, lineDs, header, tenantId]
  );
  const useSetstate = (state = {}) => {
    [headerDs, lineDs, maintainDs].forEach((i) => {
      i.setState(state);
    });
  };
  useEffect(() => {
    useSetstate({
      headerDs,
      lineDs,
      maintainDs,
    });
  }, []);
  const value = useMemo(() => {
    return {
      tenantId,
      organizationId,
      poHeaderId,
      sourcePath,
      itemKey,
      history,
      lineDs,
      headerDs,
      maintainDs,
      customizeTable,
      customizeForm,
      header,
      loadings,
      cuxRemote,
      purchaseAgreementDs,
      customizeBtnGroup,
    };
  }, [
    tenantId,
    organizationId,
    poHeaderId,
    sourcePath,
    itemKey,
    history,
    lineDs,
    headerDs,
    maintainDs,
    customizeTable,
    customizeForm,
    header,
    loadings,
    cuxRemote,
    purchaseAgreementDs,
    customizeBtnGroup,
  ]);
  useEffect(() => {
    const handleUpdate = ({ name }) => {
      switch (name) {
        case 'invOrganizationId':
          maintainDs.current.set({
            invInventoryId: undefined,
            invLocationId: undefined,
          });
          break;
        case 'invInventoryId':
          maintainDs.current.set('invLocationId', undefined);
          break;
        default:
      }
    };
    lineDs.addEventListener('update', handleUpdate);
    return () => {
      lineDs.removeEventListener('update', handleUpdate);
    };
  }, [lineDs, maintainDs]);

  useEffect(() => {
    queryMapIdpValue({
      internationalTelCode: 'HPFM.IDD',
      excessOrderType: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
      tenantId,
    }).then((resp) => {
      const enumMap = getResponse(resp);
      if (enumMap) {
        internationalTelCodeDs.loadData(enumMap.internationalTelCode);
        excessOrderTypeDs.loadData(enumMap.excessOrderType);
      }
    });
  }, [internationalTelCodeDs, excessOrderTypeDs, batchMaintainDs, maintainDs, tenantId]);

  useEffect(() => {
    fetchDoubleUom();
  }, []);

  const fetchDoubleUom = async () => {
    const result = await queryCommonDoubleUomConfig({ moduleCode: 'SPCM' });
    lineDs.setState('loading', loading);
    lineDs.setState('doubleUnitEnabled', result);
  };

  if (!header) {
    if (headerDs.status !== 'ready') {
      return <Spin />;
    }
    return <Exception type="500" />;
  }

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default remote({
  code: 'SODR_PURCHASE_AGREEMENT_C7N',
  name: 'cuxRemote',
})(observer(StoreProvider));
