import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';

import { getLocationParam } from '@/utils/utils';

import Comp from './Invest';

const Invest = props => {
  const params = getLocationParam(props?.location?.search);

  return (
    <>
      <Comp {...params} />
    </>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness', 'sdat.supplierBlacklistManage'],
})(Invest);
