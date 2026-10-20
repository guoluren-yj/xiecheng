import React, { useCallback } from 'react';

import PositionAnchor from '_components/PositionAnchor';

import intl from 'utils/intl';

const { Link, AnchorToolTip } = PositionAnchor;

export default function Anchor({ sourceCategory, lineItemFlag }) {
  const renderLinks = useCallback(() => {
    return [
      <Link
        href="#basicInfoCard"
        title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.basicInfos').d('基本信息'))}
      />,
      <Link
        href="#organizationAndStaffCard"
        title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.purPeople').d('采购组织及人员'))}
      />,
      lineItemFlag && (
        <Link
          href="#rfItemLineCard"
          title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.item').d('标的物'))}
        />
      ),
      <Link
        href="#programmeCard"
        title={AnchorToolTip(
          sourceCategory === 'RFP'
            ? intl.get('ssrc.rf.view.card.title.programme').d('方案要求')
            : intl.get('ssrc.rf.view.card.title.inquiryContent').d('征询内容')
        )}
      />,
      <Link
        href="#inviteRangeCard"
        title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.inviteRange').d('邀请范围'))}
      />,
      <Link
        href="#ruleCard"
        title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.rule').d('规则设置'))}
      />,
      <Link
        href="#attachmentCard"
        title={AnchorToolTip(intl.get('ssrc.rf.view.card.title.attachmentUuid').d('附件'))}
      />,
    ].filter(Boolean);
  }, [sourceCategory, lineItemFlag]);

  return (
    <PositionAnchor
      currentOffsetTop={null}
      currentAnchorContainer={() =>
        document.getElementsByClassName('rf-page-content-warp')[0] || document.body
      }
    >
      {renderLinks()}
    </PositionAnchor>
  );
}
