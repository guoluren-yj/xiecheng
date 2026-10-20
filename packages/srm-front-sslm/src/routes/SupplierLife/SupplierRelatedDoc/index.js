/**
 * SupplierRelatedDoc - 供应商关联业务单据
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment } from 'react';
import querystring from 'querystring';
import { Button } from 'hzero-ui';
import { compose } from 'lodash';

import intl from 'utils/intl';
import { withRouter } from 'dva/router';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';

const SupplierRelatedDocBtn = props => {
  const {
    companyId,
    customizeUnitCode,
    isPub,
    history,
    sourceTarget,
    supplierCompanyId,
    requisitionId,
    toStageId,
    customizeBtnGroup,
    customizeUnitBtnCode,
    dimensionCode,
  } = props;

  /**
   * 关联单据查询所需参数：
   * @param {*} companyId 公司id
   * @param {*} supplierCompanyId 供应商id
   * @param {*} customizeUnitCode 个性化编码
   * 申请单查询所需参数：
   * @param {*} requisitionId 申请单id
   * @param {*} toStageId 目标阶段id
   */
  const handleJumpDetail = () => {
    if (isPub) {
      history.push({
        pathname: `/pub/sslm/supplier-related-doc/list`,
        search: querystring.stringify({
          companyId,
          toStageId,
          sourceTarget,
          requisitionId,
          supplierCompanyId,
          customizeUnitCode,
          dimensionCode,
        }),
      });
    } else {
      openTab({
        title: 'hzero.common.view.title.supplierRelatedDoc',
        key: '/sslm/supplier-related-doc/list',
        path: '/sslm/supplier-related-doc/list',
        search: querystring.stringify({
          companyId,
          supplierCompanyId,
          customizeUnitCode,
          requisitionId,
          dimensionCode,
        }),
      });
    }
  };

  return (
    <Fragment>
      {customizeBtnGroup({ code: customizeUnitBtnCode }, [
        <Button data-name="checkSupplierRelatedDoc" onClick={handleJumpDetail}>
          {intl.get('sslm.common.view.button.checkSupplierRelatedDoc').d('查看供应商关联业务单据')}
        </Button>,
      ])}
    </Fragment>
  );
};

export default compose(
  formatterCollections({ code: ['sslm.common'] }),
  withRouter
)(SupplierRelatedDocBtn);
