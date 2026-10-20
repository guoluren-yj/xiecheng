import React, { createContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';

import { orderLineInfoDS, searchDS, BOMTableDS, orderHeaderInfoDS } from './OrderLineInfoDS';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    changeFields,
    children,
    match: {
      params: { id },
    },
  } = props;

  const tenantId = getCurrentOrganizationId();

  const searchDs = useDataSet(() => searchDS(), []);

  const BOMTableDs = useDataSet(() => BOMTableDS(), []);

  const orderHeaderInfoDs = useDataSet(() => orderHeaderInfoDS({ changeFields }), [changeFields]);

  const orderLineInfoDs = useDataSet(() => orderLineInfoDS({ changeFields, orderHeaderInfoDs }), [
    changeFields,
    orderHeaderInfoDs,
  ]);

  const [enumMap, setEnumMap] = useState([]);

  useEffect(() => {
    queryMapIdpValue({
      operateType: 'SODR.OPERATION_TYPE',
      // freeFlag: 'HPFM.FLAG',
      batchMaintain: 'SPUC.ORDER_BATCH_MAINTENANCE',
      tenantId,
    }).then((resp) => {
      setEnumMap(getResponse(resp));
    });
    orderHeaderInfoDs.setState({ orderLineInfoDs });
    orderLineInfoDs.setState({ orderHeaderInfoDs, changeFields });
  }, [tenantId, orderLineInfoDs, orderHeaderInfoDs]);

  const value = useMemo(() => {
    return {
      searchDs,
      BOMTableDs,
      orderLineInfoDs,
      orderHeaderInfoDs,
      poHeaderId: id,
      enumMap,
      organizationId: tenantId,
    };
  }, [searchDs, BOMTableDs, orderLineInfoDs, orderHeaderInfoDs, id, enumMap, tenantId]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
