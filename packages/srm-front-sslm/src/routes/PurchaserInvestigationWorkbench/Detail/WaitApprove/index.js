/*
 * WaitApprove - 待审批-详情
 * @date: 2020/10/26 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, createRef } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Spin, Modal, Form, TextArea } from 'choerodon-ui/pro';
import { Collapse, Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import remote from 'utils/remote';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { TopSection, SecondSection } from '_components/Section';

// import { queryAiConfig } from '@/services/commonService';
import TempateDetail from '@/routes/components/Investigation';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handleAgree, inviteRefuse, handleReject } from '@/services/investigationApprovalService';
import { saveData } from '@/services/investigationService';
import { RiskProfile } from '@/routes/components/EnterpriseRelationSearch';

import {
  getDetailHeaderDS,
  inviteRejectModalDS,
  investigateRejectModalDS,
} from '../stores/indexDS';

import DetailHeaderWrapper from '../../components/DetailHeaderWrapper';
import CompareInvestiga from '../Compare';
import styles from '../../index.less';
import { handleRejectModal } from '../../utils';
import HeaderBtns from '../../components/HeaderBtns';

const { Panel } = Collapse;

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
    'spfm.disposeInvite',
    'smbl.checkRules',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_WORKBENCH_DETAIL.WAIT_APPROVE_HEADER_BTNS',
    'SSLM.INVESTIGATION_WORKBENCH_DETAIL.INVESTIGATE_REJECT_FORM',
    'SSLM.INVESTIGATION_WAIT_APPROVE.DETAIL_CARDS',
  ],
})
@remote({
  code: 'SSLM_WAITAPPROVE_DEFINITION', // 对应二开模块暴露的Expose的编码
  name: 'waitApproveRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class WaitApprove extends Component {
  constructor(props) {
    super(props);
    const { match: { params: { investgHeaderId, investigateTemplateId }, path } = {} } = props;
    const isPub = path.includes('/pub/');

    this.state = {
      investgHeaderId,
      investigateTemplateId,
      allLoading: false,
      triggerByCode: '',
      isPub,
      compareFlag: false,
      supplierBasicId: null,
      // aiApprove: false,
      // processStatus: null,
    };
    this.headerDs = new DataSet(getDetailHeaderDS());
    this.headerDs.setQueryParameter('investgHeaderId', investgHeaderId);
  }

  investRef = createRef(null);

  componentDidMount() {
    this.handleQueryHeaderInfo();
    // this.handleAiConfig();
    // 工作流审批通过回调
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
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

  // 查询头信息
  @Bind()
  handleQueryHeaderInfo() {
    const { isPub } = this.state;
    this.setState({
      allLoading: true,
    });
    this.headerDs
      .query()
      .then(res => {
        if (getResponse(res)) {
          const {
            triggerByCode,
            processStatus,
            supplierBasicId,
            aiApproveStatus,
            aiApproveDTOList,
          } = res;
          this.setState({
            // processStatus,
            triggerByCode,
            supplierBasicId,
            aiApproveStatus,
            aiApproveDTOList,
          });

          if (!isPub && !['WFL_REJECT', 'SUBMIT'].includes(processStatus)) {
            // 站内信非法进入，返回列表页
            notification.info({
              message: intl
                .get('sslm.common.view.message.pleaseRefresh')
                .d('数据已发生变更，请刷新页面重试'),
            });
            this.handleJumpList();
          }
        }
      })
      .finally(() => {
        this.setState({
          allLoading: false,
        });
      });
  }

  // 工作流审批回调
  @Bind()
  workflowSubmit(approveResult) {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        if (!this.headerDs.current) {
          reject();
        } else {
          // 校验必填
          const validateFlag = await this.headerDs.current.validate(true);
          if (validateFlag) {
            const data = this.headerDs.current.toJSONData() || {};
            const { investgHeaderId } = data;
            const payload = {
              headerInfo: data,
              customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
              customizeTenantId: tenantId,
              purWflEditFlag: 1,
            };
            this.setState({
              allLoading: true,
            });
            saveData(payload, investgHeaderId)
              .then(res => {
                if (getResponse(res)) {
                  resolve(res);
                } else {
                  reject(new Error(res));
                }
              })
              .finally(() =>
                this.setState({
                  allLoading: false,
                })
              );
          } else {
            notification.error({
              message: intl
                .get('sslm.common.view.message.requiredMsg')
                .d('请检查是否有必填项未填写！'),
            });
            reject();
          }
        }
      } else {
        resolve();
      }
    });
  }

  // 变更loading
  @Bind()
  setLoading(flag) {
    this.setState({ allLoading: flag });
  }

  /**
   *同意
   *
   */
  @Bind()
  async handleAgree() {
    // 校验必填
    const validateFlag = this.headerDs.current ? await this.headerDs.current.validate(true) : false;
    if (validateFlag) {
      const data = this.headerDs.current.toJSONData() || {};
      const { investgHeaderId } = data;
      const payload = {
        ...data,
        investigateHeaderId: investgHeaderId,
        customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
      };
      this.setState({
        allLoading: true,
      });
      return handleAgree(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            this.handleJumpList();
          }
        })
        .finally(() =>
          this.setState({
            allLoading: false,
          })
        );
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
   * 邀约拒绝
   */
  @Bind()
  handleInviteReject() {
    const { investgHeaderId } = this.state;
    const rejectModalDs = new DataSet(inviteRejectModalDS());
    const currentRecord = rejectModalDs?.current || {};
    Modal.open({
      key: Modal.key(),
      closable: false,
      movable: false,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      title: intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <TextArea name="rejectRemark" resize="vertical" rows={16} />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const validateFlag = await currentRecord.validate();
          const data = currentRecord.toJSONData();
          if (validateFlag) {
            const { rejectRemark } = data;
            // 带调查表
            const payload = {
              investgHeaderId,
              rejectRemark,
            };
            this.setState({
              allLoading: true,
            });
            const res = await inviteRefuse(payload);
            this.setState({
              allLoading: false,
            });
            if (getResponse(res)) {
              resolve();
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              this.handleJumpList();
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }),
    });
  }

  /**
   * 调查表拒绝
   */
  @Bind()
  handleInvestigateReject() {
    const { investgHeaderId } = this.state;
    const { customizeForm } = this.props;
    const headerData = this.headerDs.current ? this.headerDs.current.toData() : {};
    const { companyId } = headerData;
    const investigateRejectDs = new DataSet(investigateRejectModalDS());
    if (investigateRejectDs.current) {
      investigateRejectDs.current.set({
        companyIds: companyId,
      });
    }
    const currentRecord = investigateRejectDs.current || {};
    const onOk = () => {
      return new Promise(async resolve => {
        const validateFlag = await currentRecord.validate();
        if (validateFlag) {
          const data = currentRecord.toJSONData();
          const { isChange, ...others } = data;
          const payload = {
            ...others,
            investgHeaderId,
            customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.INVESTIGATE_REJECT_FORM',
          };
          this.setState({
            allLoading: true,
          });
          const res = await handleReject(payload);
          this.setState({
            allLoading: false,
          });
          if (getResponse(res)) {
            resolve();
            notification.success();
            // 返回列表
            this.handleJumpList();
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    };
    handleRejectModal({
      dataSet: investigateRejectDs,
      onOk,
      customizeForm,
      customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.INVESTIGATE_REJECT_FORM',
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

  // 版本对比
  @Bind()
  handleVersionCompare() {
    const { compareFlag } = this.state;
    this.setState({
      compareFlag: !compareFlag,
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
      type: 'waitApproveInvestg',
      otherProps: {
        location,
        ...headerData,
      },
    };
    return result;
  }

  render() {
    const {
      location,
      dispatch,
      customizeBtnGroup = () => {},
      waitApproveRemote,
      getHocInstance,
    } = this.props;
    const {
      // aiApprove,
      // processStatus,
      investgHeaderId,
      investigateTemplateId,
      allLoading,
      triggerByCode,
      isPub,
      compareFlag,
      supplierBasicId,
      aiApproveStatus,
      aiApproveDTOList,
    } = this.state;
    const inviteBtn = triggerByCode === 'INVITE';
    const showCompareBtn = triggerByCode === 'COMMON';
    const remoteParams = {
      investgHeaderId,
      handleQuery: this.handleQueryHeaderInfo,
      loading: allLoading,
    };
    const partnerCompanyName = this.headerDs.current
      ? this.headerDs.current.get('partnerCompanyName')
      : null;
    // const aiApproveFlag = aiApprove && !['NEW', 'RELEASE', 'CANCEL'].includes(processStatus);
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.investDefOrg.view.title.viewInvestigateDetail').d('查看调查表')}
          backPath={isPub ? '' : '/sslm/purchaser-investigation/list'}
        >
          <HeaderBtns
            isPub={isPub}
            dispatch={dispatch}
            location={location}
            loading={allLoading}
            inviteBtn={inviteBtn}
            sourceKey="waitApprove"
            headerDs={this.headerDs}
            compareFlag={compareFlag}
            investRef={this.investRef}
            remote={waitApproveRemote}
            showCompareBtn={showCompareBtn}
            customizeBtnGroup={customizeBtnGroup}
            onAgree={this.handleAgree}
            setLoading={this.setLoading}
            onOperate={this.handleOperate}
            onInviteReject={this.handleInviteReject}
            handleQuery={this.handleQueryHeaderInfo}
            onVersionCompare={this.handleVersionCompare}
            onInvestigateReject={this.handleInvestigateReject}
            customizeCode="SSLM.INVESTIGATION_WORKBENCH_DETAIL.WAIT_APPROVE_HEADER_BTNS"
          />
          {/* 按钮埋点 */}
          {waitApproveRemote &&
            waitApproveRemote.render(
              'SSLM_WAITAPPROVE_DEFINITION_CUSTOMER_BUTTONS',
              <></>,
              remoteParams
            )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content className={styles['purchaser-investigate-detail-content']}>
          <Spin spinning={allLoading} wrapperClassName={styles['purchaser-investigate-detail']}>
            <TopSection
              code="SSLM.INVESTIGATION_WAIT_APPROVE.DETAIL_CARDS"
              getHocInstance={getHocInstance}
            >
              <SecondSection code="headerInfo">
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
                      sourcePage="waitApprove"
                    />
                  </Panel>
                </Collapse>
              </SecondSection>
              {/* 风险档案 */}
              <SecondSection code="riskProfile">
                <div className={styles['purchaser-investigate-detail-riskProfile']}>
                  <RiskProfile
                    params={{ companyName: partnerCompanyName, organizationId: tenantId }}
                  />
                </div>
              </SecondSection>
              <SecondSection code="detailInfo">
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
                        _status="approval"
                        showTabBar={false}
                        ref={this.investRef}
                        // aiApproveFlag={aiApproveFlag}
                        otherRemoteProps={this.handleBurialPoint()}
                        investgRemote={waitApproveRemote}
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
              </SecondSection>
            </TopSection>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
