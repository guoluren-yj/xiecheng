import React, { useContext, useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import { Header } from 'components/Page';
import { getActiveTabKey } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import { throttle, isNil } from 'lodash';
import querystring from 'querystring';

import useOperationRecordModal from '@/routes/components/ProjectOperationRecord/useModal';
import HistoryVersionListBtn from '@/routes/ssrc/ProjectSetupNew/Components/HistoryVersionListBtn';

import {
  AFBasicCard,
  HeaderInfo,
  AttachmentCard,
  ItemLine,
  PurOrganizationAndStaffDemandCmp,
  PurOrganizationAndStaffExecutorCmp,
  RequirementOnSupplier,
  SecAndPacketTable,
  SourceDemand,
  PlanLineTable,
} from './CardList';
import { StoreContext } from './store/StoreProvider';

import Style from './index.less';

const { openModal } = useOperationRecordModal();

const Page = () => {
  const {
    commonDs: { headerDs, itemLineDs } = {},
    getCustomizeUnitCode,
    getHocInstance,
    pageSourceCategory,
    customizeBtnGroup,
    routerParams,
    sourceProjectId,
    sourceProjectHistoryId,
    history,
    approveRemote,
    onLoad,
  } = useContext(StoreContext);

  const {
    subjectMatterRule, // 是否分标段
  } = headerDs?.current?.get(['subjectMatterRule']) || {};

  useEffect(() => {
    // 使用 onLoad 函数注册 submit 回调函数
    if (pageSourceCategory === 'approval' && typeof onLoad === 'function') {
      onLoad({
        submit: handleApproveSubmit,
      });
    }
  }, []);

  // 审批通过
  const handleApproveSubmit = (approveResult) => {
    const submitCallBack = () => {
      // submit 函数需返回一个 Promise 对象
      return new Promise((resolve) => {
        resolve();
      });
    };
    if (approveRemote && approveRemote.event) {
      return approveRemote.event.fireEvent('handleRemoteApproveSubmit', {
        submitCallBack,
        approveResult,
        headerDs,
        itemLineDs,
      });
    } else {
      return submitCallBack();
    }
  };

  // 获取版本查看标题
  const versionTitle = useMemo(() => {
    const dataVersion = headerDs?.current?.get('dataVersion');
    return `${intl
      .get('ssrc.projectSetup.view.spVersion.viewSourceProjectVersion')
      .d('查看寻源项目')} ${!isNil(dataVersion) && dataVersion !== '' ? `v${dataVersion}` : ''}`;
  }, [headerDs?.current]);

  // 详情标题
  const detailHeaderTitle = useMemo(() => {
    return `${intl.get('ssrc.projectSetup.view.detail.detailSourceProject').d('查看寻源项目')}`;
  }, [sourceProjectId]);

  // 获取返回路径
  const getBackPath = useMemo(() => {
    // todo: 等产品s设计这一块如何跳转
    // if (sourceProjectHistoryId) { // 从版本查看页面进来的版本查看，也要回到上一级版本查看页面
    //   return `/ssrc/new-project-setup/sp-version/${sourceProjectId}/${sourceProjectHistoryId}`;
    // }
    return `${getActiveTabKey()}/list`;
  }, [sourceProjectHistoryId]);

  // 打开操作记录弹框
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        sourceProjectId,
      });
    }, 500),
    [sourceProjectId]
  );

  // 跳转版本查看
  const handleHistoryVersion = (payload) => {
    const { versionRecord } = payload || {};
    const { sourceProjectHistoryId: jumpSourceProjectHistoryId, dataVersion } = versionRecord || {};
    if (!sourceProjectHistoryId) return;
    history.push({
      pathname: `/ssrc/new-project-setup/sp-version/${sourceProjectId}/${jumpSourceProjectHistoryId}`,
      search: querystring.stringify({
        dataVersion,
      }),
    });
  };

  // 获取版本查看头按钮
  const getVersionHeaderButtons = useCallback(() => {
    const buttons = [
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
          funcType: 'flat',
          style: { color: '#1d2129' },
        },
      },
      {
        name: 'historyVersion',
        btnComp: HistoryVersionListBtn,
        btnProps: {
          sourceProjectId,
          currentDataVersion: routerParams?.dataVersion,
          handleJumpVersion: handleHistoryVersion,
          buttonProps: { icon: 'schedule' },
        },
      },
    ];

    return customizeBtnGroup(
      {
        code: getCustomizeUnitCode('headerButtons'),
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={buttons} />
    );
  }, [sourceProjectId, sourceProjectHistoryId, routerParams]);

  // 获取类名
  const getClassName = useCallback(() => {
    const classNameDto = {
      version: Style['ssrc-sp-content-version-wrapper'], // 版本明细页面
      approval: Style['ssrc-sp-content-approval-wrapper'], // 审批页面
      default: Style['ssrc-sp-content-wrapper'], // 明细
    };
    return classNameDto[pageSourceCategory] || classNameDto.default;
  }, [pageSourceCategory]);

  return (
    <div className={Style['ssrc-sp-wrapper']}>
      {pageSourceCategory === 'version' && (
        <Header title={versionTitle} backPath={getBackPath}>
          {getVersionHeaderButtons()}
        </Header>
      )}
      {pageSourceCategory === 'detail' && routerParams?.singlePage === 'Y' && (
        <Header title={detailHeaderTitle} backPath={`${getActiveTabKey()}/list`} />
      )}
      <div className={getClassName()}>
        {pageSourceCategory === 'approval' && ( // 发布审批基础卡片
          <TopSection
            code={getCustomizeUnitCode('headerInfoCard')}
            getHocInstance={getHocInstance}
            className={`${Style['sp-common-top-section-card']} ${Style['ssrc-source-project-approval-af-basic-card']}`}
            titleProps={{ style: { display: 'none' } }}
          >
            <AFBasicCard />
          </TopSection>
        )}
        <TopSection
          title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          code={getCustomizeUnitCode('baseInfoCard')}
          getHocInstance={getHocInstance}
          className={Style['sp-common-top-section-card']}
        >
          <HeaderInfo />
        </TopSection>
        <TopSection
          title={intl
            .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
            .d('采购组织及人员')}
          code={getCustomizeUnitCode('purAndOrgCard')}
          getHocInstance={getHocInstance}
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
          title={intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          code={getCustomizeUnitCode('itemInfoCard')}
          getHocInstance={getHocInstance}
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
          title={intl
            .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
            .d('对供应商要求')}
          code={getCustomizeUnitCode('reqOnSupplierCard')}
          getHocInstance={getHocInstance}
          className={Style['sp-common-top-section-card']}
        >
          <RequirementOnSupplier />
        </TopSection>
        <TopSection
          title={intl
            .get('ssrc.projectSetup.view.title.spChange.sourcingRequirement')
            .d('寻源要求')}
          code={getCustomizeUnitCode('sourceDemandCard')}
          getHocInstance={getHocInstance}
          className={Style['sp-common-top-section-card']}
        >
          <SourceDemand />
        </TopSection>
        <TopSection
          title={intl.get('ssrc.projectSetup.view.title.spChange.planList').d('项目计划')}
          code={getCustomizeUnitCode('projectPlanCard')}
          getHocInstance={getHocInstance}
          className={Style['sp-common-top-section-card']}
        >
          <PlanLineTable />
        </TopSection>
        <TopSection
          title={intl.get('hzero.common.upload.modal.title').d('附件')}
          code={getCustomizeUnitCode('attachmentCard')}
          getHocInstance={getHocInstance}
          className={Style['sp-common-top-section-card']}
        >
          <AttachmentCard />
        </TopSection>
      </div>
    </div>
  );
};

export default observer(Page);
