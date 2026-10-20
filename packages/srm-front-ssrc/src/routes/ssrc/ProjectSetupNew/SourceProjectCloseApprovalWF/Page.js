import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import {
  HeaderInfo,
  CloseReason,
  RelatedBillTable,
  BaseInfo,
  ItemLineDetail,
  SecAndPacketTable,
  AttachmentCmp,
  PurOrganizationAndStaffDemandCmp,
  PurOrganizationAndStaffExecutorCmp,
  RequirementOnSupplier,
  PlanLineTable,
} from './CardList';
import { StoreContext } from './store/StoreProvider';

import Style from './index.less';

const Page = () => {
  const {
    commonDs: { headerDs, relatedBillDs, itemLineDs } = {},
    getHocInstance,
    getCustomizeUnitCode,
    pageLoading,
    doubleUnitFlag,
    customizeTable,
    custConfig,
  } = useContext(StoreContext);

  return (
    <div className={Style['ssrc-source-project-approval-wrapper']}>
      <Spin spinning={pageLoading}>
        <TopSection
          code={getCustomizeUnitCode('pageCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']} ${Style['ssrc-source-project-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <HeaderInfo />
        </TopSection>
        <TopSection
          title={intl.get(`ssrc.projectSetupApprovalWf.view.title.closedReason`).d('关闭原因')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('closeReasonCard')}
          className={Style['approval-common-top-section-card']}
        >
          <CloseReason />
        </TopSection>
        {relatedBillDs?.length > 0 ? (
          <TopSection
            title={intl.get(`ssrc.projectSetupApprovalWf.view.title.relatedBill`).d('关联单据')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('relatedBillCard')}
            className={Style['approval-common-top-section-card']}
          >
            <RelatedBillTable />
          </TopSection>
        ) : null}
        <TopSection
          title={intl.get(`ssrc.projectSetupApprovalWf.view.title.baseInfo`).d('基础信息')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('basicInfoCard')}
          className={Style['approval-common-top-section-card']}
        >
          <BaseInfo />
        </TopSection>
        <TopSection
          title={intl
            .get(`ssrc.projectSetupApprovalWf.view.title.purOrganizationAndStaff`)
            .d('采购组织及人员')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('purAndOrgCard')}
          className={`${Style['approval-common-top-section-card']} ${Style['approval-top-section-pur_org_card']}`}
        >
          <SecondSection
            title={intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
            code="demand"
          >
            <PurOrganizationAndStaffDemandCmp />
          </SecondSection>
          <SecondSection
            title={intl.get('ssrc.projectSetupApprovalWf.view.title.executor').d('执行人')}
            code="executor"
          >
            <PurOrganizationAndStaffExecutorCmp />
          </SecondSection>
        </TopSection>
        <TopSection
          title={intl.get('ssrc.projectSetupApprovalWf.view.title.item').d('标的物')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('itemCard')}
          className={Style['approval-common-top-section-card']}
        >
          <ItemLineDetail
            ds={itemLineDs}
            doubleUnitFlag={doubleUnitFlag}
            headerDs={headerDs}
            customizeTable={customizeTable}
            getCustomizeUnitCode={getCustomizeUnitCode}
          />
        </TopSection>
        {headerDs?.current?.get('subjectMatterRule') === 'PACK' ? (
          <TopSection
            title={intl
              .get('ssrc.projectSetupApprovalWf.view.title.secPacketInfo')
              .d('标段/包信息')}
            getHocInstance={getHocInstance}
            code={getCustomizeUnitCode('secPacketCard')}
            className={Style['approval-common-top-section-card']}
          >
            <SecAndPacketTable />
          </TopSection>
        ) : null}
        {custConfig?.[getCustomizeUnitCode('reqOnSupplierCard')] ? ( // 解决用户没有重新发布版本导致卡片默认显示问题
          <TopSection
            title={intl
              .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
              .d('对供应商要求')}
            code={getCustomizeUnitCode('reqOnSupplierCard')}
            getHocInstance={getHocInstance}
            className={Style['approval-common-top-section-card']}
          >
            <RequirementOnSupplier />
          </TopSection>
        ) : null}
        {custConfig?.[getCustomizeUnitCode('projectPlanCard')] ? ( // 解决用户没有重新发布版本导致卡片默认显示问题
          <TopSection
            title={intl.get('ssrc.projectSetup.view.title.spChange.planList').d('项目计划')}
            code={getCustomizeUnitCode('projectPlanCard')}
            getHocInstance={getHocInstance}
            className={Style['approval-common-top-section-card']}
          >
            <PlanLineTable />
          </TopSection>
        ) : null}
        <TopSection
          title={intl.get('hzero.common.upload.modal.title').d('附件')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('attachmentCard')}
          className={Style['approval-common-top-section-card']}
        >
          <AttachmentCmp />
        </TopSection>
      </Spin>
    </div>
  );
};

export default observer(Page);
