/*
 * AllInvestigation - 全部-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import querystring from 'querystring';
import React, { Component, createRef } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { Collapse, Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import remote from 'utils/remote';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';

// import { queryAiConfig } from '@/services/commonService';
import TempateDetail from '@/routes/components/Investigation';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handlePrint } from '@/services/investigationWriteService';
import { checkInvestigation, handleCancel } from '@/services/sendInvestigationService';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import styles from '../../index.less';
import HeaderBtns from '../../components/HeaderBtns';
import DetailHeaderWrapper from '../../components/DetailHeaderWrapper';
import CompareInvestiga from '../Compare';
import { getDetailHeaderDS } from '../stores/indexDS';

const { Panel } = Collapse;

const organizationId = getCurrentOrganizationId();

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
  unitCode: ['SSLM.INVESTIGATION_WORKBENCH_DETAIL.ALL_HEADER_BTNS'],
})
@remote({
  code: 'SSLM_PURCHASER_ALLINVESTIGATION', // 对应二开模块暴露的Expose的编码
  name: 'allApproveRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class AllInvestigation extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const { sourceType } = routerParams;
    const { match: { params: { investgHeaderId, investigateTemplateId } = {} } = {} } = props;
    const isIncludeFlag = props.location.pathname.includes('/include'); // 判断是否为include页面
    const isPub = props.location.pathname.includes('/pub/'); // 判断是否为include页面
    this.state = {
      investgHeaderId,
      investigateTemplateId,
      allLoading: false,
      processStatus: '',
      isIncludeFlag,
      subSurveyFormFlag: false,
      compareFlag: false,
      triggerByCode: '',
      supplierBasicId: null,
      approvalBtnInfo: {}, // 审批，撤销审批按钮
      isPub,
      // aiApprove: false,
      isAmktClient: sourceType === 'AMKT_CLIENT', // 单据来源为应用商店
    };
    this.headerDs = new DataSet(getDetailHeaderDS());
  }

  investRef = createRef(null);

  componentDidMount() {
    const { investgHeaderId } = this.state;
    this.handleQuery(investgHeaderId);
    // this.handleAiConfig();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { match: { params: { investgHeaderId } = {} } = {} } = this.props;
    // 这里取prevProps，取prevState会异步
    const { match: { params: { investgHeaderId: oldInvestgHeaderId } = {} } = {} } = prevProps;
    return investgHeaderId !== oldInvestgHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      const { match: { params: { investgHeaderId } = {} } = {} } = this.props;
      if (investgHeaderId) {
        this.handleQuery(investgHeaderId);
      }
    }
  }

  // 变更loading
  @Bind()
  setLoading(flag) {
    this.setState({ allLoading: flag });
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

  // 查询
  @Bind()
  handleQuery(investgHeaderId) {
    this.setState({
      allLoading: true,
    });
    this.headerDs.setQueryParameter('investgHeaderId', investgHeaderId);
    this.headerDs
      .query()
      .then(res => {
        if (getResponse(res)) {
          const {
            processStatus,
            mergerInvestigateFlag,
            mainInvestigateFlag,
            investigateTemplateId,
            triggerByCode,
            supplierBasicId,
            aiApproveStatus,
            aiApproveDTOList,
          } = res;
          // 副调查表标识
          const isSubSurveyForm =
            ['RELEASE', 'REJECT'].includes(processStatus) &&
            mergerInvestigateFlag === 1 &&
            mainInvestigateFlag === 0;
          this.setState({
            processStatus,
            aiApproveStatus,
            aiApproveDTOList,
            subSurveyFormFlag: isSubSurveyForm,
            investgHeaderId,
            investigateTemplateId,
            triggerByCode,
            supplierBasicId,
          });
          // 查询审批、撤销审批
          this.handleAllApprovalData(res);
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  // 查询能否审批，撤销审批
  @Bind()
  handleAllApprovalData(params = {}) {
    const { businessKey } = params;
    if (businessKey) {
      queryAllApprovalData({ businessKeys: [businessKey], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          this.setState({
            approvalBtnInfo: {
              approvalDataMap,
              revokeDataMap,
            },
          });
        }
      });
    } else {
      this.setState({
        approvalBtnInfo: {},
      });
    }
  }

  // 跳转
  @Bind()
  handleJumpList() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/sslm/purchaser-investigation/list',
      })
    );
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { investgHeaderId } = this.state;
    const payload = {
      investgHeaderId,
      tenantId: organizationId,
    };
    this.setState({
      allLoading: true,
    });
    handlePrint(payload)
      .then(res => {
        if (getResponse(res)) {
          if (res.type.indexOf('application/json') > -1) {
            notification.warning({
              description: intl
                .get(`sslm.common.view.printwarning.noTemplate`)
                .d('未设置打印模板，不可打印'),
            });
            return;
          }
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  // 版本对比
  @Bind()
  handleVersionCompare() {
    const { compareFlag } = this.state;
    this.setState({
      compareFlag: !compareFlag,
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

  /**
   * 取消按钮回调
   * sevenFlag - 调查表发布是否超过7天
   * inviteFlag - 是否是邀约调查表
   * allFlag - 是否是邀约调查表 且 调查表发布是否超过7天
   */
  @Bind()
  handleCancel() {
    const { investgHeaderId } = this.state;
    this.setState({
      allLoading: true,
    });
    checkInvestigation([investgHeaderId])
      .then(res => {
        if (getResponse(res)) {
          const { sevenFlag, inviteFlag, allFlag } = res;
          if (sevenFlag || inviteFlag || allFlag) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: allFlag
                ? intl
                    .get('sslm.investigationCorrelation.view.message.allWarn')
                    .d('发布未超过七天的邀约调查表取消后，邀约将被拒绝，是否确认取消？')
                : inviteFlag
                ? intl
                    .get('sslm.investigationCorrelation.view.message.inviteWarn')
                    .d('邀约调查表取消后，该邀约将被拒绝，是否确认取消？')
                : intl
                    .get('sslm.investigationCorrelation.view.message.sevenWarn')
                    .d('调查表发布未超过七天，是否确认取消？'),
              onOk: () => {
                this.cancelCallBack();
              },
            });
          } else {
            this.cancelCallBack();
          }
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  /**
   * 取消
   */
  @Bind()
  cancelCallBack() {
    const { investgHeaderId } = this.state;
    this.setState({
      allLoading: true,
    });
    handleCancel([investgHeaderId])
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          this.handleQuery(investgHeaderId);
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  // 处理版本对比loading
  @Bind()
  handleCompareInfoLoading(flag = false) {
    this.setState({
      allLoading: flag,
    });
  }

  // 处理埋点
  @Bind()
  handleBurialPoint() {
    const { location } = this.props;
    const headerData = this.headerDs.current ? this.headerDs.current.toData() : {};
    const result = {
      type: 'allInvestg',
      otherProps: {
        location,
        ...headerData,
      },
    };
    return result;
  }

  render() {
    const {
      investgHeaderId,
      investigateTemplateId,
      allLoading,
      processStatus,
      isIncludeFlag,
      subSurveyFormFlag,
      compareFlag,
      triggerByCode,
      supplierBasicId,
      approvalBtnInfo,
      isPub,
      // aiApprove,
      isAmktClient,
      aiApproveStatus,
      aiApproveDTOList,
    } = this.state;
    const { location, dispatch, customizeBtnGroup, allApproveRemote } = this.props;
    const showCompareBtn =
      !['RELEASE', 'NEW', 'CANCEL', 'APPROVE'].includes(processStatus) &&
      triggerByCode === 'COMMON';
    const cancelBtnFlag = !['RELEASE', 'REJECT'].includes(processStatus) || subSurveyFormFlag;
    // const aiApproveFlag = aiApprove && !['NEW', 'RELEASE', 'CANCEL'].includes(processStatus);
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.investDefOrg.view.title.viewInvestigateDetail').d('查看调查表')}
          backPath={isIncludeFlag || isAmktClient ? '' : '/sslm/purchaser-investigation/list'}
        >
          <HeaderBtns
            sourceKey="all"
            dispatch={dispatch}
            loading={allLoading}
            headerDs={this.headerDs}
            compareFlag={compareFlag}
            investRef={this.investRef}
            cancelBtnFlag={cancelBtnFlag}
            showCompareBtn={showCompareBtn}
            customizeBtnGroup={customizeBtnGroup}
            onPrint={this.handlePrint}
            setLoading={this.setLoading}
            onCancel={this.handleCancel}
            onOperate={this.handleOperate}
            onVersionCompare={this.handleVersionCompare}
            customizeCode="SSLM.INVESTIGATION_WORKBENCH_DETAIL.ALL_HEADER_BTNS"
            approvalBtnInfo={approvalBtnInfo}
            handleQuery={this.handleQuery}
            isPub={isPub}
            location={location}
            remote={allApproveRemote}
          />
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content className={styles['purchaser-investigate-detail-content']}>
          <Spin spinning={allLoading} wrapperClassName={styles['purchaser-investigate-detail']}>
            <Collapse
              bordered={false}
              defaultActiveKey={['investigateInfo']}
              expandIconPosition="text-right"
              trigger="text-icon"
            >
              <Panel
                header={intl
                  .get('sslm.investTempConfig.view.title.InvestigateInfo')
                  .d('调查表信息')}
                key="investigateInfo"
                forceRender
              >
                <DetailHeaderWrapper
                  editFlag={false}
                  dataSet={this.headerDs}
                  sourcePage="allInvestigation"
                />
              </Panel>
            </Collapse>
            <div className={styles['purchaser-investigate-detail-line']}>
              <Card
                bordered={false}
                title={intl.get('sslm.common.view.title.detailInfo').d('详细信息')}
              >
                {!compareFlag ? (
                  <TempateDetail
                    investigateTemplateId={investigateTemplateId}
                    investgHeaderId={investgHeaderId}
                    editable={false}
                    showTabBar={false}
                    ref={this.investRef}
                    // aiApproveFlag={aiApproveFlag}
                    otherRemoteProps={this.handleBurialPoint()}
                    investgRemote={allApproveRemote}
                  />
                ) : (
                  <CompareInvestiga
                    investigateTemplateId={investigateTemplateId}
                    investgHeaderId={investgHeaderId}
                    supplierBasicId={supplierBasicId}
                    setLoading={this.handleCompareInfoLoading}
                  />
                )}
              </Card>
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
