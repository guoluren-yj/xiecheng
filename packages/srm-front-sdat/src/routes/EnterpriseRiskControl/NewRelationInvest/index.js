import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'utils/remote';
import { getLocationParam } from '@/utils/utils';

import Comp from './Invest';

const Invest = props => {
  const params = getLocationParam(props?.location?.search);

  return (
    <>
      <Comp {...params} remote={props?.remote} />
    </>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness', 'sdat.supplierBlacklistManage'],
})(remote({
    code: 'SDAT_NEW_RELATION_INVEST',
    name: 'remote',
  })(Invest));
