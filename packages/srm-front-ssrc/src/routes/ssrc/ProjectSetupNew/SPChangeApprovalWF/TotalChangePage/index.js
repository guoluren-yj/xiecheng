import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import {
  HeaderInfo,
  AttachmentCard,
  PurOrganizationAndStaffDemandCmp,
  PurOrganizationAndStaffExecutorCmp,
  RequirementOnSupplier,
  SourceDemand,
} from './CardIndex';
import ItemLine from '../CardList/ItemLineTable';
import PlanLineTable from '../CardList/PlanLineTable';
import SecAndPacketTable from '../CardList/SecAndPacketTable';
import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

const Page = () => {
  const { commonDs: { headerDs } = {}, getHocInstance, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const {
    subjectMatterRule, // 是否分标段
  } = headerDs?.current?.get(['subjectMatterRule']) || {};

  return (
    <div>
      <TopSection
        code={getCustomizeUnitCode('baseInfoCard')}
        getHocInstance={getHocInstance}
        title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
        className={Style['sp-common-top-section-card']}
      >
        <HeaderInfo />
      </TopSection>
      <TopSection
        title={intl
          .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
          .d('采购组织及人员')}
        getHocInstance={getHocInstance}
        code={getCustomizeUnitCode('purAndOrgCard')}
        className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
      >
        <SecondSection
          title={intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
          code="demand"
        >
          <PurOrganizationAndStaffDemandCmp />
        </SecondSection>
        <SecondSection
          title={intl.get('ssrc.projectSetup.view.subTitle.spChange.executor').d('执行人')}
          code="executor"
        >
          <PurOrganizationAndStaffExecutorCmp />
        </SecondSection>
      </TopSection>
      <TopSection
        code={getCustomizeUnitCode('itemInfoCard')}
        getHocInstance={getHocInstance}
        title={intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
        className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
      >
        <SecondSection
          title={intl.get('ssrc.projectSetup.view.title.spChange.item').d('标的物')}
          code="item"
        >
          <ItemLine />
        </SecondSection>
        {subjectMatterRule === 'PACK' && (
          <SecondSection
            title={intl
              .get('ssrc.projectSetup.view.title.spChange.sectionInformation')
              .d('标段/包信息')}
            code="secAndPacket"
          >
            <SecAndPacketTable />
          </SecondSection>
        )}
      </TopSection>
      <TopSection
        code={getCustomizeUnitCode('reqOnSupplierCard')}
        getHocInstance={getHocInstance}
        title={intl.get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest').d('对供应商要求')}
        className={Style['sp-common-top-section-card']}
      >
        <RequirementOnSupplier />
      </TopSection>
      <TopSection
        code={getCustomizeUnitCode('sourceDemandCard')}
        getHocInstance={getHocInstance}
        title={intl.get('ssrc.projectSetup.view.title.spChange.sourcingRequirement').d('寻源要求')}
        className={Style['sp-common-top-section-card']}
      >
        <SourceDemand />
      </TopSection>
      <TopSection
        code={getCustomizeUnitCode('projectPlanCard')}
        getHocInstance={getHocInstance}
        title={intl.get('ssrc.projectSetup.view.title.spChange.planList').d('项目计划')}
        className={Style['sp-common-top-section-card']}
      >
        <PlanLineTable />
      </TopSection>
      <TopSection
        title={intl.get('hzero.common.upload.modal.title').d('附件')}
        getHocInstance={getHocInstance}
        code={getCustomizeUnitCode('attachmentCard')}
        className={Style['sp-common-top-section-card']}
      >
        <AttachmentCard />
      </TopSection>
    </div>
  );
};

export default observer(Page);
