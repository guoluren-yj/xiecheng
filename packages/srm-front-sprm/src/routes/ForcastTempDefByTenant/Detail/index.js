/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-06 23:09:57
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import Detail from './Details';

import StoreProvider from './stores';
import './index.less';

const Index = function Index(props) {
  const {
    match: { params },
    location,
  } = props;
  const { id } = params;
  const changeFlag = location.search.includes('change');
  return (
    <StoreProvider {...{ ...props, templateHeaderId: id, changeFlag }}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'hpfm.individual',
    'hpfm.customize',
    'hwfp.serviceDefinition',
    'sprm.fcst',
    'srpm.common',
    'sprm.forecastWorkbench',
    'sprm.forecastMgt',
    'sprm.forecast',
  ],
})(Index);
