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
  const { projectReqHeaderId: modalProjectReqId } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};
  const projectReqHeaderId = params.id || params.projectReqHeaderId || modalProjectReqId;
  const headerUnitCode = 'SIEC.PROJECT_CHANGE.ATTACH,SIEC.PROJECT_CHANGE.BASEINFO';
  const taskUnitCode = 'SIEC.PROJECT_CHANGE.TASK,SIEC.PROJECT_CHANGE.TASK_FILTER';
  const purListUnitCode = 'SIEC.PROJECT_CHANGE.PUR_LIST';
  const supplierListUnitCode = 'SIEC.PROJECT_CHANGE.SUPPLIER';

  return (
    <StoreProvider
      {...{
        ...props,
        projectReqHeaderId,
        headerUnitCode,
        taskUnitCode,
        purListUnitCode,
        supplierListUnitCode,
        source: 'change',
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
      'SIEC.PROJECT_CHANGE.HEADER_BTNS',
      'SIEC.PROJECT_CHANGE.BASEINFO',
      'SIEC.PROJECT_CHANGE.ATTACH',
      'SIEC.PROJECT_CHANGE.TABS',
      'SIEC.PROJECT_CHANGE.TASK',
      'SIEC.PROJECT_CHANGE.PUR_LIST',
      'SIEC.PROJECT_CHANGE.SUPPLIER',
      'SIEC.PROJECT_CHANGE.COST_FORM',
    ],
  })(Index)
);
