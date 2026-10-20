/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-08-03 10:40:43
 */
import React, { Component } from 'react';
import PositionAnchor from '_components/PositionAnchor';

import intl from 'utils/intl';
// import { isEmpty } from 'lodash';

const { Link, AnchorToolTip } = PositionAnchor;

export default class AnchorSsrc extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderLinks = () => {
    const {
      rfxLineSupplierSnapId = null,
      rfx = {},
      newBiddingFlag, // 是否是竞价大厅-竞价单
    } = this.props;
    const { omitName = '', sourceCategoryName = '' } = rfx;

    return [
      rfxLineSupplierSnapId ? (
        <Link
          href="#newAddSupplierCompany"
          title={AnchorToolTip(
            intl.get('ssrc.inquiryHall.view.inquiryHall.newAddSupplierCompany').d('新添加供应商')
          )}
        />
      ) : null,
      <Link
        href="#rfxBasicInfo"
        title={AnchorToolTip(
          intl
            .get('ssrc.inquiryHall.view.inquiryHall.rfxBasicInfoRFX', { omitName })
            .d(`{omitName}基础信息`)
        )}
      />,
      <Link
        href="#organizationAndStaff"
        title={AnchorToolTip(
          intl.get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff').d('采购组织及人员')
        )}
      >
        {/* <Link
          href="#rfxDemandSide"
          title={AnchorToolTip(
            intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')
          )}
        />
        <Link
          href="#rfxPurchaseExecute"
          title={AnchorToolTip(
            intl.get('ssrc.inquiryHall.view.inquiryHall.purchaseExecute').d('采购执行人')
          )}
        /> */}
      </Link>,
      <Link
        href="#rfxItemLines"
        title={AnchorToolTip(
          intl
            .get('ssrc.inquiryHall.view.inquiryHall.rfxItemLinesRFX', { omitName })
            .d(`{omitName}标的物`)
        )}
      />,
      <Link
        href="#supplierWithRequest"
        title={AnchorToolTip(
          intl.get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest').d('对供应商要求')
        )}
      />,
      <Link
        href="#rfxDeamnd"
        title={AnchorToolTip(
          !newBiddingFlag
            ? intl
                .get('ssrc.inquiryHall.view.inquiryHall.rfxDeamndRFX', { sourceCategoryName })
                .d(`{sourceCategoryName}要求`)
            : intl.get('ssrc.common.view.biddingRequest').d('竞价要求')
        )}
      >
        {/* <Link
          href="#rfxPrepare"
          title={AnchorToolTip(
            intl.get('ssrc.inquiryHall.view.inquiryHall.rfxPrepare').d('寻源准备')
          )}
        />
        {!!preQualificationFlag && (mergeType || !isEmpty(prequalHeaderDsMap)) ? (
          <Link
            href="#rfxPreQualification"
            title={AnchorToolTip(
              intl.get(`ssrc.inquiryHall.view.message.tab.preQualification`).d('资格预审')
            )}
          />
        ) : null}
        <Link
          href="#rfxMaintaionQuotation"
          title={AnchorToolTip(
            intl.get(`ssrc.inquiryHall.view.title.rfxMaintaionQuotation`).d('报价')
          )}
        />
        {expertFlag ? (
          <>
            <Link
              href="#rfxExperts"
              title={AnchorToolTip(intl.get(`ssrc.inquiryHall.view.message.experts`).d('专家'))}
            />
            {initialReview === 'NEED' ? (
              <Link
                href="#rfxComplianceCheck"
                title={AnchorToolTip(
                  intl.get(`ssrc.inquiryHall.view.message.tab.complianceCheck`).d('符合性检查')
                )}
              />
            ) : null}
            <Link
              href="#rfxScoringElements"
              title={AnchorToolTip(
                intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')
              )}
            />
          </>
        ) : null} */}
      </Link>,
      <Link
        href="#attachments"
        title={AnchorToolTip(intl.get('ssrc.common.attachment').d('附件'))}
      />,
    ];
  };

  render() {
    const {
      currentOffsetTop = null,
      currentAnchorContainer = () =>
        document.getElementsByClassName('page-content-wrap')[0] || document.body,
    } = this.props;

    return (
      // <PositionAnchor offsetTop={currentOffsetTop || 150} getContainer={currentAnchorContainer}>
      <PositionAnchor
        offsetTop={currentOffsetTop || 150}
        currentAnchorContainer={currentAnchorContainer}
      >
        {this.renderLinks()}
      </PositionAnchor>
    );
  }
}
