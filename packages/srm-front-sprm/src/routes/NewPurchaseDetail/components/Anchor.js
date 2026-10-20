/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 20:40:58
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-02 17:34:17
 */

import React, { Component, Fragment } from 'react';
import intl from 'utils/intl';

import PositionAnchor from './PositionAnchor';
// import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default class OrderAffix extends Component {
  renderLinks = () => {
    const { prSourcePlatform } = this.props;
    return (
      <Fragment>
        <Link
          href="#sprm-workSpace-detail-content-basicInfo"
          title={intl.get('sprm.common.view.panel.basicInfo').d('申请基础信息')}
        />
        {prSourcePlatform !== 'ERP' && (
          <Link
            href="#sprm-workSpace-detail-content-organizationInfo"
            title={intl.get('sprm.common.view.panel.organization').d('采购方及采买组织信息')}
          />
        )}
        {prSourcePlatform === 'E-COMMERCE' && (
          <Link
            href="#sprm-workSpace-detail-content-deliveryInfo"
            title={intl.get('sprm.common.view.panel.deliveryInfo').d('收货/收单信息')}
          />
        )}

        {prSourcePlatform === 'E-COMMERCE' && (
          <Link
            href="#sprm-workSpace-detail-content-billingInfo"
            title={intl.get('sprm.common.view.panel.billingInfo').d('开票信息')}
          />
        )}
        <Link
          href="#sprm-workSpace-detail-content-detailInfo"
          title={intl.get('sprm.common.view.panel.detailInfo').d('申请明细信息')}
        />
        <Link
          href="#sprm-workSpace-detail-content-attachmentInfo"
          title={intl.get('sprm.common.view.panel.attachmentInfo').d('附件')}
        />
      </Fragment>
    );
  };

  render() {
    const {
      currentOffsetTop = null,
      currentAnchorContainer = () =>
        document.getElementsByClassName('sprm-detail')[0] || document.body,
    } = this.props;
    return (
      <PositionAnchor offsetTop={currentOffsetTop || 150} getContainer={currentAnchorContainer}>
        {this.renderLinks()}
      </PositionAnchor>
    );
  }
}
