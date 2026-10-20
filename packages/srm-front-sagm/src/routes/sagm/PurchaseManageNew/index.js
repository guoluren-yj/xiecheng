import React, { useCallback, useEffect, useState } from 'react';
import { flowRight, isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';

import Loading from '@/components/loading';
import { fetchConfig } from '@/services/PurchaseManageNewService';
import PurchaseSetting from './PurchaseSetting';
import Performance from './Performance';

function PurchaseManageNew() {
  const [type, setType] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    fetchConfig().then((res) => {
      // 新租户无返回值， {}
      if (isEmpty(res)) {
        setType('set');
      } else {
        setType('use');
        setConfig(res);
      }
    });
    // 窗口1
    // setType('set');
  }, []);

  const enterPage = useCallback(
    (_type, _config = {}) => {
      setType(_type);
      if (!isEmpty(_config)) {
        setConfig({ ..._config, isNewTenant: true });
      }
    },
    [type, config]
  );

  return (
    <>
      {!type ? (
        <Loading />
      ) : type === 'set' ? (
        <PurchaseSetting enterPage={enterPage} />
      ) : (
        <Performance config={config} />
      )}
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['small.purchaseManage', 'sagm.common', 'sagm.purchaseManageNew'],
  })
)(PurchaseManageNew);
