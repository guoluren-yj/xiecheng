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
  const headerUnitCode = 'SIEC.PROJECT_EDIT.BASE,SIEC.PROJECT_EDIT.ATTACHMENT';
  const taskUnitCode = 'SIEC.PROJECT_EDIT.COST_LIST,SIEC.PROJECT_EDIT.TASK_FILTER';
  const purListUnitCode = 'SIEC.PROJECT_EDIT.PUR_LIST';
  const supplierListUnitCode = 'SIEC.PROJECT_EDIT.SUPPLIER';

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
  ],
})(
  withCustomize({
    unitCode: [
      'SIEC.PROJECT_EDIT.BTN',
      'SIEC.PROJECT_EDIT.BASE',
      'SIEC.PROJECT_EDIT.ATTACHMENT',
      'SIEC.PROJECT_EDIT.TABS',
      'SIEC.PROJECT_EDIT.COST_LIST',
      'SIEC.PROJECT_EDIT.PUR_LIST',
      'SIEC.PROJECT_EDIT.SUPPLIER',
      'SIEC.PROJECT_EDIT.COST_FORM',
    ],
  })(Index)
);
