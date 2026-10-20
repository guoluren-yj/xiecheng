/*
 * WorkFlow - 审批表单详情-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import remote from 'utils/remote';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content } from 'components/Page';
import { getResponse, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import { TopSection, SecondSection } from '_components/Section';

import { renderStatus } from '@/routes/components/utils';
import TempateDetail from '@/routes/components/Investigation';
import { enterpriseTagsConfig } from '@/services/commonService';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { openRelationChart, RiskProfile } from '@/routes/components/EnterpriseRelationSearch';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

import DetailHeader from '../../components/DetailHeader';
import { getDetailHeaderDS } from '../stores/indexDS';
import styles from '../../index.less';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境
const tenantId = getCurrentOrganizationId();

/**
 * 调查表模板配置-详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.common',
    'sslm.investDefOrg',
    'sslm.investTempConfig',
    'sslm.investigCorrelat',
    'sslm.investigationCorrelation',
    'smbl.checkRules',
  ],
})
@WithCustomize({
  isTemplate: true,
})
@remote({
  code: 'SSLM_INVESTIGATION_WORKFLOW', // 对应二开模块暴露的Expose的编码
  name: 'investgWfRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class AllInvestigation extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { investgHeaderId, investigateTemplateId },
      },
      location,
    } = props;
    const routerParams = querystring.parse(location.search.substr(1));

    const { templateCode, templateVersion, stageCode, pageCode } = routerParams;
    const wfParams = {
      cuszTplStageCode: stageCode,
      cuszTplPageCode: pageCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
      customizeUnitCode: 'SSLM.INVESTIGATION_APPROVE.DETAIL.WF.HEADER',
    };

    this.state = {
      investgHeaderId,
      investigateTemplateId,
      queryLoading: false,
      queryCustomizeLoading: false,
      wfParams,
      headerInfo: {},
      // aiApprove: false,
      showTagFlag: true, // 默认展示企业标签
    };
    this.headerDs = new DataSet(getDetailHeaderDS());
  }

  componentDidMount() {
    const { investgHeaderId } = this.state;
    // this.handleAiConfig();
    this.handleTemplateConfig(investgHeaderId);
    this.handleEnterpriseTags();
  }

  // 业务规则是否开启AI审批
  // @Bind()
  // handleAiConfig() {
  //   const { investgHeaderId } = this.state;
  //   queryAiConfig({
  //     documentId: investgHeaderId,
  //     documentType: 'INVESTG',
  //   }).then(response => {
  //     const res = getResponse(response);
  //     if (res) {
  //       this.setState({ aiApprove: res === 1 });
  //     }
  //   });
  // }

  // 查询单据样式版本
  @Bind()
  handleTemplateConfig(investgHeaderId) {
    const { wfParams = {} } = this.state;
    const { queryTemplateConfig } = this.props;
    const { cuszTplStageCode, cuszTplPageCode, cuszTplTemplateCode, cuszTplVersion } = wfParams;
    this.setState({
      queryCustomizeLoading: true,
    });
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode: cuszTplTemplateCode,
        templateVersion: cuszTplVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode: cuszTplStageCode,
      pageCode: cuszTplPageCode,
    }).finally(() => {
      this.handleQuery(investgHeaderId);
      this.setState({
        queryCustomizeLoading: false,
      });
    });
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: {
        params: { investgHeaderId },
      },
    } = this.props;
    // 这里取prevProps，取prevState会异步
    const {
      match: {
        params: { investgHeaderId: oldInvestgHeaderId },
      },
    } = prevProps;
    return investgHeaderId !== oldInvestgHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      const {
        match: {
          params: { investgHeaderId },
        },
      } = this.props;
      if (investgHeaderId) {
        this.handleTemplateConfig(investgHeaderId);
      }
    }
  }

  // 查询
  @Bind()
  handleQuery(investgHeaderId) {
    if (investgHeaderId) {
      const { wfParams } = this.state;
      this.setState({
        queryLoading: true,
      });
      this.headerDs.setQueryParameter('investgHeaderId', investgHeaderId);
      this.headerDs.setQueryParameter('otherParmas', { ...wfParams });
      this.headerDs
        .query()
        .then(res => {
          if (getResponse(res)) {
            const { investigateTemplateId } = res;
            this.setState({
              investgHeaderId,
              investigateTemplateId,
              headerInfo: res,
            });
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  // 查询当前功能是否开启企业标签功能
  @Bind()
  handleEnterpriseTags() {
    enterpriseTagsConfig({ menuNum: '1' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        this.setState({ showTagFlag: false });
      }
    });
  }

  // 操作记录
  @Bind()
  handleOperate() {
    const { investgHeaderId } = this.state;
    operationRecordsModal({
      documentType: 'INVESTIGATE',
      investgHeaderId,
      documentId: investgHeaderId,
    });
  }

  // 操作按钮集合
  @Bind()
  handleBottomRender() {
    const { customizeBtnGroup } = this.props;
    const { queryLoading, queryCustomizeLoading, headerInfo } = this.state;
    const { partnerCompanyName: supplierCompanyName } = headerInfo || {};
    const allLoading = queryLoading || queryCustomizeLoading;
    const buttons = [
      {
        name: 'operation',
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => this.handleOperate(),
          wait: 500,
          waitType: 'throttle',
          loading: allLoading,
        },
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
      {
        name: 'relationSearch',
        child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
        btnProps: {
          icon: 'relate',
          funcType: 'flat',
          onClick: () => openRelationChart({ supplierCompanyName, businessType: 'QUESTIONNAIRE' }),
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: 'SSLM.INVESTIGATION_APPROVE.DETAIL.WF.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons trigger="hover" defaultBtnType="c7n-pro" buttons={buttons} />
    );
  }

  // 处理埋点
  @Bind()
  handleBurialPoint() {
    const headerData = this.headerDs.current ? this.headerDs.current.toData() : {};
    const result = {
      type: 'workFlowInvestg',
      otherProps: headerData,
    };
    return result;
  }

  render() {
    const { customizeCommon, customizeForm, investgWfRemote, getHocInstance } = this.props;
    const {
      // aiApprove,
      headerInfo,
      showTagFlag,
      investgHeaderId,
      investigateTemplateId,
      queryLoading,
      queryCustomizeLoading,
    } = this.state;
    const allLoading = queryLoading || queryCustomizeLoading;
    const showFlag =
      showTagFlag &&
      !isEmpty(headerInfo.zhimaLabels) &&
      headerInfo.triggerByCode === 'INVITE' &&
      isChinese;
    const { aiApproveStatus, aiApproveDTOList } = headerInfo;
    const tagFields = aiApproveStatus
      ? ['investigateLevelMeaning', 'investigateTypeMeaning', 'aiApproveStatusMeaning']
      : ['investigateLevelMeaning', 'investigateTypeMeaning'];
    return (
      <React.Fragment>
        <Content className={styles['purchaser-investigate-detail-workflow']}>
          <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
          <Spin spinning={allLoading} wrapperClassName={styles['purchaser-investigate-detail']}>
            {customizeCommon(
              {
                code: 'SSLM.INVESTIGATION_APPROVE.DETAIL.WF.BASICS',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={this.headerDs}
                titleField="documentTitle"
                tagFields={tagFields}
                normalFields={['createUserRealName', 'creationDate']}
                contentBottomRender={this.handleBottomRender}
                fieldsConfig={{
                  documentTitle: {
                    render: ({ record }) => {
                      if (record) {
                        const { supplierZhOrEnCompanyNum, investgNumber } = record.get([
                          'supplierZhOrEnCompanyNum',
                          'investgNumber',
                        ]);
                        return `${investgNumber}—${supplierZhOrEnCompanyNum}`;
                      }
                    },
                  },
                  aiApproveStatusMeaning: {
                    render: params => {
                      return (
                        <span className={styles['ai-approve-status']}>
                          {renderStatus({ ...params, IconComp: IntelligentReviewIcon })}
                        </span>
                      );
                    },
                  },
                }}
              />
            )}
            {customizeCommon(
              {
                code: 'SSLM.INVESTIGATION_APPROVE.DETAIL.WF.EXTRA',
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra dataSet={this.headerDs} fields={[]} />
            )}
            <TopSection
              code="SSLM.INVESTIGATION_APPROVE.DETAIL.WF.CARDS"
              getHocInstance={getHocInstance}
            >
              {showFlag && (
                <SecondSection code="enterpriseTag">
                  <div className={styles['enterprise-tags-wrap']}>
                    <div className={styles['enterprise-tags-title']}>
                      {headerInfo.supplierZhOrEnCompanyNum}
                    </div>
                    <EnterpriseTags
                      key="PUR_INVESTIGATE_WORKFLOW"
                      tagList={headerInfo.zhimaLabels}
                      parentId="sslmPurInvestigateWorkflow"
                      tagClassName="sslm-pur-investigate-workflow"
                    />
                  </div>
                </SecondSection>
              )}
              <SecondSection code="investigateInfo">
                <div className={styles['purchaser-investigate-detail-wf-header']}>
                  <Card
                    bordered={false}
                    title={intl
                      .get('sslm.investTempConfig.view.title.InvestigateInfo')
                      .d('调查表信息')}
                  >
                    <DetailHeader
                      editFlag={false}
                      dataSet={this.headerDs}
                      sourcePage="wfApprove"
                      customizeForm={customizeForm}
                      code="SSLM.INVESTIGATION_APPROVE.DETAIL.WF.HEADER"
                    />
                  </Card>
                </div>
              </SecondSection>
              {/* 风险档案 */}
              <SecondSection code="riskProfile">
                <div className={styles['purchaser-investigate-detail-riskProfile']}>
                  <RiskProfile
                    params={{
                      companyName: headerInfo.partnerCompanyName,
                      organizationId: tenantId,
                    }}
                  />
                </div>
              </SecondSection>
              <SecondSection code="investigateInfo">
                <div className={styles['purchaser-investigate-detail-line']}>
                  <Card
                    bordered={false}
                    title={intl.get('sslm.common.view.title.detailInfo').d('详细信息')}
                  >
                    <TempateDetail
                      investigateTemplateId={investigateTemplateId}
                      investgHeaderId={investgHeaderId}
                      editable={false}
                      _status="approval"
                      showTabBar={false}
                      // aiApproveFlag={aiApprove}
                      otherRemoteProps={this.handleBurialPoint()}
                      investgRemote={investgWfRemote}
                    />
                  </Card>
                </div>
              </SecondSection>
            </TopSection>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
