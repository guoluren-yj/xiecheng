/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-12-08 20:04:59
 */
import React, { Component } from 'react';
import PositionAnchor from '_components/PositionAnchor';

import intl from 'utils/intl';
// import { isEmpty } from 'lodash';
import { getParentDocumentSafe } from '@/utils/util';

const commonViewPrompt = 'spcm.common.view.message.title';

const { Link, AnchorToolTip } = PositionAnchor;

export default class AnchorSpcm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderLinks = ({ remoteWorkDetail }) => {
    const links = [
      <Link
        href="#spcm-detail-information"
        title={AnchorToolTip(intl.get(`${commonViewPrompt}.basicInformation`).d('基本信息'))}
      />,
      <Link
        href="#spcm-detail-partner"
        title={AnchorToolTip(intl.get(`${commonViewPrompt}.partnerInformation`).d('伙伴信息'))}
      />,
      <Link
        href="#spcm-detail-subject"
        title={AnchorToolTip(intl.get(`${commonViewPrompt}.subjectInformation`).d('标的信息'))}
      />,
      <Link
        href="#spcm-detail-stage"
        title={AnchorToolTip(intl.get(`${commonViewPrompt}.contractStage`).d('协议阶段'))}
      />,
      <Link
        href="#spcm-detail-rebate"
        title={AnchorToolTip(intl.get(`${commonViewPrompt}.ContractRebate`).d('返利信息'))}
      />,
      <Link
        href="#spcm-detail-business-terms"
        title={AnchorToolTip(
          intl.get(`${commonViewPrompt}.businessTermsInformation`).d('业务条款')
        )}
      />,
      <Link
        href="#spcm-detail-discount"
        title={AnchorToolTip(
          intl.get('spcm.common.view.message.title.dicountRule').d('优惠规则-折扣')
        )}
      />,
      <Link
        href="#spcm-detail-rule"
        title={AnchorToolTip(
          intl.get('spcm.common.view.message.title.rebateRule').d('优惠规则-返利')
        )}
      />,
      <Link
        href="#spcm-detail-replenish"
        title={AnchorToolTip(intl.get(`spcm.common.title.contractReplenish`).d('补充协议'))}
      />,
      <Link
        href="#spcm-detail-customRow"
        title={AnchorToolTip(
          intl.get(`spcm.common.view.message.title.customRowTable`).d('自定义行表')
        )}
      />,
      <Link
        href="#spcm-detail-attachments"
        title={AnchorToolTip(intl.get(`spcm.common.title.enclosure22`).d('附件'))}
      />,
    ];
    const newLinks = remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_ANCHOR_LINK', links)
      : links;
    return newLinks;
  };

  getAffixContainer = () => {
    const { isPub } = this.props;
    if (isPub) {
      const parentDoc = getParentDocumentSafe();
      console.log('ceshi', parentDoc);
      if (parentDoc) {
        const dom = parentDoc.querySelector(
          '.swfl-approval-workbench-task-detail > #content-container'
        );
        if (dom) {
          return dom;
        }
        const dom2 = parentDoc.querySelector(
          '.swfl-approval-workbench-task-new-tab > div > #content-container'
        );
        if (dom2) {
          return dom2;
        }
      }
      // 如果无法访问父文档（跨域），直接降级到当前文档的容器
    }
    const parent = document.getElementById('scrollContent');
    return parent || document.body;
  };

  render() {
    const {
      remoteWorkDetail,
      onRef = () => {},
      currentOffsetTop = null,
      currentAnchorContainer = this.getAffixContainer,
    } = this.props;
    return (
      // <PositionAnchor offsetTop={currentOffsetTop || 150} getContainer={currentAnchorContainer}>
      <PositionAnchor
        onRef={onRef}
        offsetTop={currentOffsetTop || 150}
        currentAnchorContainer={currentAnchorContainer}
      >
        {this.renderLinks({ remoteWorkDetail })}
      </PositionAnchor>
    );
  }
}
