import React, { Fragment, useContext } from 'react';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import Store from './store/index';
import Card from '../rfComponents/Card';
import BasicInfo from './CardManage//Create/BasicInfo';
import OrganizationAndStaff from './CardManage/Create/OrganizationAndStaff';
import RfItemLine from './CardManage/Create/RfItemLine';
import Programme from './CardManage/Create/Programme';
import InviteRange from './CardManage/Create/InviteRange';
import Rule from './CardManage/Create/Rule';
import Attachment from './CardManage/Create/Attachment';

export default observer(function Create(props) {
  const { doubleUnitFlag, configSheet, sslmLifeCycleFlag } = props;
  const {
    routerParams: { sourceCategory },
    commonDs: { ruleFormDs },
  } = useContext(Store);

  const rfItemLineProps = {
    doubleUnitFlag,
    configSheet,
  };
  const inviteRangeProps ={
    sslmLifeCycleFlag,
  };

  return (
    <Fragment>
      <Card
        id="basicInfoCard"
        title={intl.get('ssrc.rfDetail.view.card.title.basicInfos').d('基本信息')}
        component={<BasicInfo />}
      />
      <Card
        id="organizationAndStaffCard"
        title={intl.get('ssrc.rfDetail.view.card.title.purPeople').d('采购组织及人员')}
        component={<OrganizationAndStaff />}
      />
      {ruleFormDs?.current?.get('lineItemsFlag') ? (
        <Card
          id="rfItemLineCard"
          title={intl.get('ssrc.rfDetail.view.card.title.item').d('标的物')}
          component={<RfItemLine {...rfItemLineProps} />}
        />
      ) : null}
      <Card
        id="programmeCard"
        title={
          sourceCategory === 'RFP'
            ? intl.get('ssrc.rfDetail.view.card.title.programme').d('方案要求')
            : intl.get('ssrc.rfDetail.view.card.title.inquiryContent').d('征询内容')
        }
        component={<Programme />}
      />
      <Card
        id="inviteRangeCard"
        title={intl.get('ssrc.rfDetail.view.card.title.inviteRange').d('邀请范围')}
        component={<InviteRange {...inviteRangeProps} />}
      />
      <Card
        id="ruleCard"
        title={intl.get('ssrc.rfDetail.view.card.title.rule').d('规则设置')}
        component={<Rule />}
      />
      <Card
        id="attachmentCard"
        title={intl.get('ssrc.rfDetail.view.card.title.attachmentUuid').d('附件')}
        component={<Attachment />}
      />
    </Fragment>
  );
});
