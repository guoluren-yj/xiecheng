import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import ItemLine from '../CardList/ItemLineTable';
import RequirementOnSupplier from './RequirementOnSupplier';
import SecAndPacketTable from '../CardList/SecAndPacketTable';
import PlanLineTable from '../CardList/PlanLineTable';
import CommonChangeForm from './CommonChangeForm';

import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

const Page = () => {
  const {
    onlyChangeCommonDs: {
      headerDs,
      itemLineDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
      planLineTableDs,
    } = {},
  } = useContext(StoreContext);

  const {
    groupedDiffFields, // 调整块map数据
  } = headerDs?.current?.get(['groupedDiffFields']) || {};

  const {
    baseInfoDSFields, // 基础信息调整字段
    purAndOrgDemandFields, // 采购组织-需求方调整字段
    purAndOrgExecutorFields, // 采购组织-执行人调整字段
    sourceDemandFields, // 寻源要求调整字段
    attachmentFields, // 附件调整字段
    sourceMethodFields, // 寻源方式调整字段
  } = groupedDiffFields || {};

  return (
    <div>
      {baseInfoDSFields?.length ? (
        <TopSection
          title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          className={Style['sp-common-top-section-card']}
        >
          <CommonChangeForm ds={headerDs} fields={baseInfoDSFields} />
        </TopSection>
      ) : null}
      {purAndOrgDemandFields?.length || purAndOrgExecutorFields?.length ? (
        <TopSection
          title={intl
            .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
            .d('采购组织及人员')}
          className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
        >
          {purAndOrgDemandFields?.length ? (
            <SecondSection
              title={intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
            >
              <CommonChangeForm ds={headerDs} fields={purAndOrgDemandFields} />
            </SecondSection>
          ) : null}
          {purAndOrgExecutorFields?.length ? (
            <SecondSection
              title={intl.get('ssrc.projectSetup.view.subTitle.spChange.executor').d('执行人')}
            >
              <CommonChangeForm ds={headerDs} fields={purAndOrgExecutorFields} />
            </SecondSection>
          ) : null}
        </TopSection>
      ) : null}
      {itemLineDs?.length || sectionOrPacketInfoDs?.length ? (
        <TopSection
          title={intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          className={`${Style['sp-common-top-section-card']} ${Style['sp-common-top-section-has-child']}`}
        >
          {itemLineDs?.length ? (
            <SecondSection
              title={intl.get('ssrc.projectSetup.view.title.spChange.item').d('标的物')}
            >
              <ItemLine changeType="onlyChange" />
            </SecondSection>
          ) : null}
          {sectionOrPacketInfoDs?.length ? (
            <SecondSection
              title={intl
                .get('ssrc.projectSetup.view.title.spChange.sectionInformation')
                .d('标段/包信息')}
            >
              <SecAndPacketTable changeType="onlyChange" />
            </SecondSection>
          ) : null}
        </TopSection>
      ) : null}
      {supplierLineTableDs?.length || sourceMethodFields?.length ? (
        <TopSection
          title={intl
            .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
            .d('对供应商要求')}
          className={Style['sp-common-top-section-card']}
        >
          <RequirementOnSupplier />
        </TopSection>
      ) : null}
      {sourceDemandFields?.length ? (
        <TopSection
          title={intl
            .get('ssrc.projectSetup.view.title.spChange.sourcingRequirement')
            .d('寻源要求')}
          className={Style['sp-common-top-section-card']}
        >
          <CommonChangeForm ds={headerDs} fields={sourceDemandFields} />
        </TopSection>
      ) : null}
      {planLineTableDs?.length ? (
        <TopSection
          title={intl.get('ssrc.projectSetup.view.title.spChange.planList').d('项目计划')}
          className={Style['sp-common-top-section-card']}
        >
          <PlanLineTable changeType="onlyChange" />
        </TopSection>
      ) : null}
      {attachmentFields?.length ? (
        <TopSection
          title={intl.get('hzero.common.upload.modal.title').d('附件')}
          className={Style['sp-common-top-section-card']}
        >
          <CommonChangeForm
            ds={headerDs}
            fields={attachmentFields}
            formConfig={{
              columns: 2,
              labelLayout: 'float',
              className: Style['sp-change-common-red'],
            }}
          />
        </TopSection>
      ) : null}
    </div>
  );
};

export default observer(Page);
