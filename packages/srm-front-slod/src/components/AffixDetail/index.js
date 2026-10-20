/*
 * AffixDetail - 锚点
 * @date: 2021-06-09 11:47:39
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment } from 'react';
import intl from 'utils/intl';
// import PositionAnchor from '_components/PositionAnchor';

import PositionAnchor from '../PositionAnchor';

const { Link } = PositionAnchor;

export default function Affix(props) {
  function renderLinks() {
    return (
      <Fragment>
        <Link
          href="#delivery-workSpace-detail-content-basicInfo"
          title={intl.get(`slod.deliveryWorkbench.view.title.receipHeaderInfo`).d('基本信息')}
        />
        <Link
          href="#delivery-workSpace-detail-content-receipShipment"
          title={intl
            .get(`slod.deliveryWorkbench.view.title.receipShipmentsHeaderInfo`)
            .d('发货信息')}
        />
        <Link
          href="#delivery-workSpace-detail-content-receipReceiving"
          title={intl
            .get(`slod.deliveryWorkbench.view.title.receipReceivingHeaderInfo`)
            .d('收货信息')}
        />
        <Link
          href="#delivery-workSpace-detail-content-list"
          title={intl.get(`slod.deliveryWorkbench.view.title.lineList`).d('明细信息')}
        />
        <Link
          href="#delivery-workSpace-detail-content-asnLineItemTable"
          title={intl.get(`slod.deliveryWorkbench.view.title.lineItemList`).d('明细信息-物料汇总')}
        />
        <Link
          href="#delivery-workSpace-detail-content-receipAttachment"
          title={intl.get(`slod.deliveryWorkbench.view.title.receipAttachment`).d('附件信息')}
        />
      </Fragment>
    );
  }

  const {
    currentOffsetTop = null,
    currentAnchorContainer = () =>
      document.getElementById('delivery-workspace-detail-container') || document.body,
  } = props;
  return (
    <PositionAnchor
      offsetTop={currentOffsetTop || 100}
      currentAnchorContainer={currentAnchorContainer}
    >
      {renderLinks()}
    </PositionAnchor>
  );
}
