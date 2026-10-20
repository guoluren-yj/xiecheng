/*
 * AffixDetail - 锚点
 * @date: 2021-06-09 11:47:39
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default function Affix(props) {
  const { linkKeys, hrefAttr } = props;

  function renderLinks() {
    const linkList = [
      {
        key: 'shipInfo',
        link: (
          <Link
            href={`#${hrefAttr}-shipInfo`}
            title={intl
              .get(`sinv.purchaserDelivery.view.message.title.orderHeaderShip`)
              .d('发货信息')}
          />
        ),
      },
      {
        key: 'receiveInfo',
        link: (
          <Link
            href={`#${hrefAttr}-receiveInfo`}
            title={intl
              .get(`sinv.purchaserDelivery.view.message.title.headerDispatched`)
              .d('收货信息')}
          />
        ),
      },
      {
        key: 'basicInfo',
        link: (
          <Link
            href={`#${hrefAttr}-basicInfo`}
            title={intl.get(`sinv.purchaserDelivery.view.message.title.basicInfo`).d('基础信息')}
          />
        ),
      },
      {
        key: 'attachInfo',
        link: (
          <Link
            href={`#${hrefAttr}-attachInfo`}
            title={intl.get(`sinv.common.attachment.upload`).d('附件管理')}
          />
        ),
      },
    ];
    return linkList.filter((i) => linkKeys.includes(i.key)).map((i) => i.link);
  }

  const {
    currentOffsetTop = null,
    currentAnchorContainer = () => document.getElementById(hrefAttr) || document.body,
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
