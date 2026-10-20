/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2023-04-23 21:21:36
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import querystring from 'querystring';

import Detail from './Detail';
import StoreProvider from '../commonDetail/sotreProvider';

const Index = function Index(props) {
  const { match = {}, href = '', onLoad } = props;
  const modalSearch = href.substr(href.indexOf('?'), href.length);
  const { projectId: modalProjectId } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};
  const { source } = querystring.parse(props.location.search.substr(1)) || {};
  const path = match?.path || '';
  const projectId = params.id || params.projectId || modalProjectId;
  const { projectReqHeaderId } = params;
  const pubPathFlag = !(path.includes('/pub/sprm/') || href.includes('/pub/sprm/'));
  const headerUnitCode = 'SIEC.PROJECT_OTHER_TYPE.ATTACHMENT,SIEC.PROJECT_OTHER_TYPE.BASE';
  const taskUnitCode = 'SIEC.PROJECT_OTHER_TYPE.COST_LIST';
  const purListUnitCode = 'SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER,SIEC.PROJECT_OTHER_TYPE.PUR_LIST';
  const supplierListUnitCode = 'SIEC.PROJECT_OTHER_TYPE.SUPPLIER';

  return (
    <StoreProvider
      {...{
        ...props,
        projectId,
        projectReqHeaderId,
        headerUnitCode,
        taskUnitCode,
        purListUnitCode,
        supplierListUnitCode,
        pubPathFlag,
        source: source || 'actionDetail',
      }}
    >
      <Detail onLoad={onLoad} />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'entity.supplier',
    'sprm.common',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.organization',
    'entity.item',
    'ssrc.tenderPlan',
    'entity.order',
    'sprm.purchaseRequest',
    'sprm.common',
    'sprm.project',
    'sprm.purchaseRequest',
  ],
})(
  withCustomize({
    unitCode: [
      'SIEC.PROJECT_OTHER_TYPE.HEADER_BTN',
      'SIEC.PROJECT_OTHER_TYPE.ATTACHMENT',
      'SIEC.PROJECT_OTHER_TYPE.BASE',
      'SIEC.PROJECT_OTHER_TYPE.COST_LIST',
      'SIEC.PROJECT_OTHER_TYPE.TABS',
      'SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER',
      'SIEC.PROJECT_OTHER_TYPE.PUR_LIST',
      'SIEC.PROJECT_OTHER_TYPE.SUPPLIER',
    ],
  })(Index)
);
