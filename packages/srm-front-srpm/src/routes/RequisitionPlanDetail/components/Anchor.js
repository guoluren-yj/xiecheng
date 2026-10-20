/*
 * OrderAffix - 工作台明细页面锚点
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component, Fragment } from 'react';
import intl from 'utils/intl';

import PositionAnchor from '_components/PositionAnchor';

const { Link } = PositionAnchor;

export default class OrderAffix extends Component {
  renderLinks = () => {
    return (
      <Fragment>
        <Link
          href="#sprm-workSpace-detail-content-basicInfo"
          title={intl.get('srpm.common.title.baseInfo').d('基本信息')}
        />
        <Link
          href="#sprm-workSpace-detail-content-organizationInfo"
          title={intl.get('srpm.common.view.panel.organization').d('采购方及采买组织信息')}
        />
        <Link
          href="#sprm-workSpace-detail-content-detailInfo"
          title={intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息')}
        />
        <Link
          href="#sprm-workSpace-detail-content-attachmentInfo"
          title={intl.get('hzero.common.upload.modal.title').d('附件')}
        />
      </Fragment>
    );
  };

  render() {
    const {
      currentOffsetTop = null,
      currentAnchorContainer = () =>
        document.getElementsByClassName('page-content-wrap')[0] || document.body,
    } = this.props;
    return (
      <PositionAnchor offsetTop={currentOffsetTop || 150} getContainer={currentAnchorContainer}>
        {this.renderLinks()}
      </PositionAnchor>
    );
  }
}
