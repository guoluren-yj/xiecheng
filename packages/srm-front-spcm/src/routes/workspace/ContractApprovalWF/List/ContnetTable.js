/*
 * @Description: 表格信息
 * @Date: 2023-08-29 15:43:06
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useCallback, useState, useEffect, useImperativeHandle } from 'react';
import { Spin, useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';
import { Content } from 'components/Page';
import { TopSection, SecondSection } from '_components/Section';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryCommonDoubleUomConfig } from '@/utils/util';
import { readOnlyWFCodeList } from '@/utils/enum';
import EditorOnline from '@/routes/components/EditorOnline';
import PreferentialRule from '@/routes/components/PreferentialRule';
import SmartReview from '@/routes/components/SmartReview';

import { querySealType } from '@/services/workspaceService';


import {
  subjectDS as pcSubjectDS,
  stageDS as pcStageDS,
  rebateDS,
  partnerDS,
  businessTermsDS,
  replenishDS,
} from '../../Detail/components/DataSet';

import TextComparisonModal from '../../Detail/components/TextComparisonModal';
import ModeTag from '../../Detail/components/modeTag';
import ContractPartner from '../../Detail/components/ContractPartner';
import ContractSubject from '../../Detail/components/ContractSubject';
import ContractStage from '../../Detail/components/ContractStage';
import ContractRebate from '../../Detail/components/ContractRebate';
import ContractBusinessTerms from '../../Detail/components/ContractBusinessTerms';
import ContractReplenish from '../../Detail/components/ContractReplenish';
import SmartAbstract from '../../Detail/components/SmartContract/SmartAbstract';

// import { StoreContext } from '../store/StoreProvider';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

const ContnetTable = (props) => {
  const {
    headerFormDs,
    headerInfo = {},
    // pcHeaderId = '',
    permissionCode = 'VIEW',
    customizeTable = () => {},
    customizeForm = () => {},
    getHocInstance = () => {},
    templateInfo,
    children,
    isTextMode,
    shareEditConfig,
    contentRef,
    smartContractConfig: { enableSmartContract } = {},
  } = props;
  const {
    rebateFlag,
    pcKindCode,
    enableRule,
    pcNum,
    version,
    supplementFlag,
    mainContractId,
    pcHeaderId = '',
    reviewTemplateId,
  } = headerInfo;

  const [changedMode, setChangeMode] = useState(true);
  const [compareMode, setCompareMode] = useState(true);
  const [queryLoading, setQueryLoading] = useState(true);
  const [sealType, setSealType] = useState("");

  let editorOnlineRef = null;

  const differeFlag = pcHeaderId && mainContractId;

  if (contentRef) {
    useImperativeHandle(
      contentRef,
      () => ({
        editorOnlineRef,
      }),
      [editorOnlineRef]
    );
  }

  const newDSFunc = (ds, urlStr) => {
    ds.fields.push({
      name: 'objectFlagMeaning',
      type: 'string',
      label: intl.get(`spcm.common.model.changeFlag`).d('变更类型'),
    });
    ds.transport.read = ({ data }) => {
      const { queryParams, ...others } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}${urlStr}`,
        method: 'GET',
        data: {
          ...others,
          ...queryParams,
          pcHeaderId,
          mainContractId,
          isPub: true,
        },
      };
    };
    return ds;
  };

  const partnerDs = useDataSet(() => {
    const ds = partnerDS({ pcHeaderId });
    if (mainContractId && pcHeaderId) {
      return newDSFunc(ds, '/pc-compare/approve-partner');
    } else if (pcHeaderId) {
      return ds;
    }
  }, [pcHeaderId, mainContractId]);
  const pcSubjectDs = useDataSet(() => {
    const ds = pcSubjectDS({ pcHeaderId });
    if (mainContractId && pcHeaderId) {
      return newDSFunc(ds, '/pc-compare/approve-subject');
    } else if (pcHeaderId) {
      return ds;
    }
  }, [pcHeaderId, mainContractId]);
  const pcStageDs = useDataSet(() => {
    const ds = pcStageDS({ pcHeaderId });
    if (mainContractId && pcHeaderId) {
      return newDSFunc(ds, '/pc-compare/approve-stage');
    } else if (pcHeaderId) {
      return ds;
    }
  }, [pcHeaderId, mainContractId]);
  const rebateDs = useDataSet(() => {
    const ds = rebateDS({ pcHeaderId });
    if (mainContractId && pcHeaderId) {
      return newDSFunc(ds, '/pc-compare/approve-rebates');
    } else if (pcHeaderId) {
      return ds;
    }
  }, [pcHeaderId, mainContractId]);
  const businessTermsDs = useDataSet(() => {
    const ds = businessTermsDS({ pcHeaderId });
    if (mainContractId && pcHeaderId) {
      return newDSFunc(ds, '/pc-compare/approve-terms');
    } else if (pcHeaderId) {
      return ds;
    }
  }, [pcHeaderId, mainContractId]);
  const replenishDs = useDataSet(() => replenishDS({ pcHeaderId }), [pcHeaderId]);

  useEffect(() => {
    if (pcHeaderId || mainContractId) {
      queryContent();
      fetchSealType();
    }
  }, [pcHeaderId, mainContractId, changedMode]);

  /**
   * 查询表格数据
   * @param {*} ds dataset
   * @param {*} customizeUnitCode 个性化单元code
   */
  const fetchTableList = (ds, customizeUnitCode) => {
    const changeQuery = differeFlag
      ? {
          showFlag: changedMode ? 1 : 2,
        }
      : {};
    ds.setQueryParameter('queryParams', {
      customizeUnitCode,
      ...changeQuery,
      ...templateInfo,
    });
    return ds.query();
  };

  const fetchSealType = async () => {
      const res = await querySealType();
      // 此处不要用getResponse处理，因为‘核企未开通签章套餐’也会作为错误抛出，但是我们不需要将此错误可视化。
      setSealType(res?.sealType);
    };

  const queryContent = useCallback(async () => {
    setQueryLoading(true);
    await Promise.all([
      fetchTableList(pcSubjectDs, readOnlyWFCodeList.SUBJECT),
      fetchTableList(partnerDs, readOnlyWFCodeList.PARTNER),
      fetchTableList(pcStageDs, readOnlyWFCodeList.STAGE),
      fetchTableList(rebateDs, readOnlyWFCodeList.REBATE),
      fetchTableList(businessTermsDs, readOnlyWFCodeList.BUSINESSTERMS),
      fetchTableList(replenishDs, readOnlyWFCodeList.CONTRACTREPLENISH),
    ]).catch((err) => {
      setQueryLoading(false);
      throw err;
    });
    // 双单位
    const res = await queryCommonDoubleUomConfig();
    pcSubjectDs.setState({ doubleUnitEnabled: res });
    setQueryLoading(false);
  }, [
    pcHeaderId,
    pcSubjectDs,
    partnerDs,
    pcStageDs,
    rebateDs,
    businessTermsDs,
    replenishDs,
    changedMode,
  ]);

  // 伙伴
  const partnerListProps = {
    customizeTable,
    partnerDs,
    differeFlag,
    intelligent: enableSmartContract,
    custCode: readOnlyWFCodeList.PARTNER,
  };

  // 标的
  const contractSubjectListProps = {
    customizeTable,
    pcSubjectDs,
    headerInfo,
    headerFormDs,
    differeFlag,
    intelligent: enableSmartContract,
    custCode: readOnlyWFCodeList.SUBJECT,
  };

  // 阶段
  const contractStageListProps = {
    pcStageDs,
    customizeTable,
    differeFlag,
    intelligent: enableSmartContract,
    custCode: readOnlyWFCodeList.STAGE,
  };

  // 返利
  const contractRebateProps = {
    customizeTable,
    rebateDs,
    headerInfo,
    differeFlag,
    custCode: readOnlyWFCodeList.REBATE,
  };

  // 业务条款
  const contractBusinessTermsListProps = {
    customizeTable,
    businessTermsDs,
    headerInfo,
    differeFlag,
    intelligent: enableSmartContract,
    custCode: readOnlyWFCodeList.BUSINESSTERMS,
  };

  // 优惠规则-返利
  const rebateRuleProps = {
    majorPcNum: `${pcNum}|${version}`,
    type: 'rebate',
    headerInfo,
  };

  // 优惠规则-折扣
  const discountRuleProps = {
    majorPcNum: `${pcNum}|${version}`,
    type: 'discount',
    headerInfo,
  };

  // 补充协议列表
  const contractReplenishProps = {
    customizeTable,
    pcHeaderId,
    replenishDs,
    custCode: readOnlyWFCodeList.CONTRACTREPLENISH,
    sealType,
  };

  return (
    <div className={styles['content-table']}>
      <Content className={styles['content-table-header-content']}>
        <div className={styles['content-table-title-content']}>
          <div className={styles['content-table-title']}>
            {intl.get('spcm.workspace.title.detail.info').d('协议明细信息')}
          </div>
          {differeFlag && !isTextMode && (
            <ModeTag
              activeKey={changedMode}
              leftTitle={intl.get('spcm.common.title.displayChangedDoc').d('展示变更后单据')}
              rightTitle={intl.get('spcm.common.title.displayOnlyChanged').d('仅展示变更项')}
              onRightClick={() => setChangeMode(!changedMode)}
              onLeftClick={() => setChangeMode(!changedMode)}
            />
          )}
          {differeFlag && isTextMode && (
            <ModeTag
              activeKey={compareMode}
              leftTitle={intl.get('spcm.common.view.title.contractFile').d('合同文本')}
              rightTitle={intl.get('spcm.common.view.title.textComparison').d('文本对比')}
              onRightClick={() => setCompareMode(!compareMode)}
              onLeftClick={() => setCompareMode(!compareMode)}
            />
          )}
        </div>
        {isTextMode && compareMode && pcHeaderId && (
          <EditorOnline
            menuCode={CONTRACT_WORKSPACE_MAINTAIN}
            permissionCode={permissionCode}
            // 是否是工作台标识,默认只有工作台使用这个组件
            isContratWorkspace
            isOtherPageEdit={['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(
              headerInfo.pcStatusCode
            )}
            onRef={(node) => {
              editorOnlineRef = node;
            }}
            // 开启在线编辑协同，开启是否仅编辑通配符替换前的文件，协议确认/协议提交的，审批表单中使用新的获取url的接口
            isNewAPIUrlFlag={
              shareEditConfig?.onlyEditReplaceWildcardBefore === '1' &&
              shareEditConfig?.enableEditShare === '1' &&
              ['SUBMITTED', 'APPROVAL_PENDING'].includes(headerInfo.pcStatusCode)
            }
            pcHeaderId={pcHeaderId}
            headerInfo={headerInfo}
            iframeStyle={{
              width: '100%',
              height: '700px',
              marginTop: '16px',
            }}
          />
        )}
        {isTextMode && !compareMode && pcHeaderId && (
          <TextComparisonModal
            pcHeaderId={pcHeaderId}
            compareStyles={{ className: styles['approval-compare'] }}
            visible={!compareMode}
            //  上次版本已发布走原接口，上次版本已生效提供一个新接口
            needOldLastApi={supplementFlag === 0 && version > 1 && mainContractId}
          />
        )}
        <Spin style={{ display: isTextMode ? 'none' : 'block' }} spinning={queryLoading}>
          <div
            className={styles['content-table-list']}
            style={{ marginTop: '16px', display: isTextMode ? 'none' : 'block' }}
          >
            <TopSection code="SPCM.WORKSPACE.APPROVAL.CARDS" getHocInstance={getHocInstance}>
              {/* 智能摘要 */}
              <SecondSection code="smartAbstract">
                <div className={styles['content-table-list-smartCard']}>
                  <SmartAbstract showFlag pcHeaderId={pcHeaderId} />
                </div>
              </SecondSection>
              {/* 智能审查 */}
              {!isNil(reviewTemplateId) && (
                <SecondSection code="smartReview">
                  <div className={styles['content-table-list-smartReviewCard']}>
                    <SmartReview
                      workFlowFlag
                      pcHeaderId={pcHeaderId}
                      customizeForm={customizeForm}
                      code={readOnlyWFCodeList.SMARTREVIEW}
                    />
                  </div>
                </SecondSection>
              )}
              <SecondSection
                code="partner"
                title={intl
                  .get('spcm.common.view.message.title.contractPartnerInformation')
                  .d('采购协议伙伴信息')}
              >
                <ContractPartner {...partnerListProps} />
              </SecondSection>
              <SecondSection
                code="subject"
                title={intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的')}
              >
                <ContractSubject {...contractSubjectListProps} />
              </SecondSection>
              <SecondSection
                code="stage"
                title={intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段')}
              >
                <ContractStage {...contractStageListProps} />
              </SecondSection>
              {rebateFlag ? (
                <SecondSection
                  code="rebate"
                  title={intl.get('spcm.common.view.message.title.ContractRebate').d('返利信息')}
                >
                  <ContractRebate {...contractRebateProps} />
                </SecondSection>
              ) : null}
              {pcHeaderId && !['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'].includes(pcKindCode) ? (
                <SecondSection
                  code="businessTerms"
                  title={intl
                    .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                    .d('采购协议业务条款')}
                >
                  <ContractBusinessTerms {...contractBusinessTermsListProps} />
                </SecondSection>
              ) : null}
              {enableRule ? (
                <SecondSection
                  code="rebateRule"
                  title={intl.get('spcm.common.view.message.title.rebateRule').d('优惠规则-返利')}
                >
                  <PreferentialRule key="rebateRule" {...rebateRuleProps} />
                </SecondSection>
              ) : null}
              {enableRule ? (
                <SecondSection
                  code="dicountRule"
                  title={intl.get('spcm.common.view.message.title.dicountRule').d('优惠规则-折扣')}
                >
                  <PreferentialRule key="dicountRule" {...discountRuleProps} />
                </SecondSection>
              ) : null}
              {!supplementFlag && (
                <SecondSection
                  code="replenish"
                  title={intl
                    .get(`spcm.common.view.message.title.contractReplenishList`)
                    .d('补充协议列表')}
                >
                  <ContractReplenish {...contractReplenishProps} />
                </SecondSection>
              )}
            </TopSection>
            {children}
          </div>
        </Spin>
      </Content>
    </div>
  );
};

export default observer(ContnetTable);
