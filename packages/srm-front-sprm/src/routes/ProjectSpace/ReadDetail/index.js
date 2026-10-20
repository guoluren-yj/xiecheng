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
  const path = match?.path || '';
  const projectId = params.id || params.projectId || modalProjectId;
  const pubPathFlag = !(path.includes('/pub/sprm/') || href.includes('/pub/sprm/'));
  const headerUnitCode = 'SIEC.PROJECT_READ.BASE,SIEC.PROJECT_READ.ATTACHMENT';
  const taskUnitCode = 'SIEC.PROJECT_READ.COST_LIST,SIEC.PROJECT_READ.TASK_FILTER';
  const purListUnitCode = 'SIEC.PROJECT_READ.PUR_LIST,SIEC.PROJECT_READ.PURLIST_FILTER';
  const supplierListUnitCode = 'SIEC.PROJECT_READ.SUPPLIER';

  return (
    <StoreProvider
      {...{
        ...props,
        projectId,
        headerUnitCode,
        taskUnitCode,
        purListUnitCode,
        supplierListUnitCode,
        pubPathFlag,
        source: 'readOnly',
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
      'SIEC.PROJECT_READ.BTN',
      'SIEC.PROJECT_READ.BASE',
      'SIEC.PROJECT_READ.ATTACHMENT',
      'SIEC.PROJECT_READ.TABS',
      'SIEC.PROJECT_READ.COST_LIST',
      'SIEC.PROJECT_READ.PUR_LIST',
      'SIEC.PROJECT_READ.SUPPLIER',
      'SIEC.PROJECT_READ.COST_FORM',
      'SIEC.PROJECT_READ.HEADER_LIST',
      'SIEC.PROJECT_READ.ORIGIN_LIST',
      'SIEC.PROJECT_READ.LINK_TABLE',
      'SIEC.PROJECT_READ.LINKDETAIL_FLAT',
    ],
  })(Index)
);
