/*
 * InvestigationApprovalDetail - 调查表审批明细
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty, isFunction } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Spin, Row, Col, Tree } from 'hzero-ui';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import request from 'utils/request';

import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { saveData } from '@/services/investigationService';
import Investigation from '../Component/Investigation';
import OperatingRecord from '../../OperatingRecord';
import InvestigateRefuseModal from './InvestigateRefuseModal';
import '@/routes/index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const inviteRefuseItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const customizeUnitCode = 'SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER';

class PopoverTreeContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
    };
  }

  render() {
    return (
      <div style={{ width: '200px', height: '120px', overflow: 'auto' }}>
        {!isEmpty(this.state.treeData) && (
          <Tree defaultExpandAll="true">{this.renderTreeContent(this.state.treeData)}</Tree>
        )}
      </div>
    );
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const organizationId = getCurrentOrganizationId();
    const { dataSource } = this.props;
    request(
      `/sslm/v1/${organizationId}/investigate-proservices/treeCategory/${dataSource.productCategoryId}`,
      {
        method: 'GET',
      }
    ).then(result => {
      const res = getResponse(result);
      if (res) {
        this.setState({
          treeData: res,
        });
      }
    });
  };

  renderTreeContent = data => {
    if (!data) return null;
    return data.map(item => (
      <Tree.TreeNode title={item.categoryName} key={item.categoryId}>
        {this.renderTreeContent(item.children)}
      </Tree.TreeNode>
    ));
  };
}

export function openTreeList(option) {
  return <PopoverTreeContent {...option} />;
}

/**
 * 调查表审批页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@remote({
  code: 'SSLM_INVESTIGATIONAPPROVE_DEFINITION', // 对应二开模块暴露的Expose的编码
  name: 'investigationApproveRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@connect(({ loading, investigationApproval }) => ({
  investigationApproval,
  allLoading:
    loading.effects['investigationApproval/fetchInvestigationDetail'] ||
    loading.effects['investigationApproval/handleAgree'] ||
    loading.effects['investigationApproval/handleReject'] ||
    loading.effects['investigationApproval/handleInviteRefuse'],
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.investigCorrelat'],
})
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_APPROVAL_DETAIL.HEADER',
    'SSLM.INVESTIGATION_APPROVAL_DETAIL.BTN_GROUP',
    'SSLM.INVESTIGATION_APPROVAL_DETAIL.REJECT_FORM',
  ],
})
export default class InvestigationApprovalDetail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const isPub = this.props.match.path.includes('/pub/');
    this.state = {
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
      rejectModalVisible: false,
      organizationId: getCurrentOrganizationId(),
      historyVisible: false, // 操作记录显示
      isPub,
      inviteRefuseModalVisible: false,
      headerInfo: {}, // 调查表头信息
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const routerParam = querystring.parse(nextProps.location.search.substr(1));
    const { investigateTemplateId, investgHeaderId } = routerParam;
    if (investigateTemplateId !== prevState.investigateTemplateId) {
      nextState.investigateTemplateId = investigateTemplateId;
    }
    if (investgHeaderId !== prevState.investgHeaderId) {
      nextState.investgHeaderId = investgHeaderId;
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(prevProps) {
    const thisParams = querystring.parse(this.props.location.search.substr(1));
    const prevParams = querystring.parse(prevProps.location.search.substr(1));
    const { investgHeaderId } = thisParams;
    const { investgHeaderId: prevInvestgHeaderId } = prevParams;
    return investgHeaderId !== prevInvestgHeaderId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleQuery();
    }
  }

  componentDidMount() {
    this.handleQuery();
    // 工作流审批通过回调
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      headerInfo: {},
    });
  }

  // 工作流审批回调
  @Bind()
  workflowSubmit(approveResult) {
    const { form } = this.props;
    const { organizationId, headerInfo } = this.state;
    const { investgHeaderId } = headerInfo || {};
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        // 校验必填
        form.validateFields((err, fieldsValues) => {
          if (!err) {
            const payload = {
              headerInfo: {
                ...headerInfo,
                ...fieldsValues,
              },
              purWflEditFlag: 1,
              customizeUnitCode,
              customizeTenantId: organizationId,
            };
            const investigateHeaderId = this.state.investgHeaderId || investgHeaderId;
            saveData(payload, investigateHeaderId).then(res => {
              if (getResponse(res)) {
                resolve(res);
              } else {
                reject(new Error(res));
              }
            });
          } else {
            reject();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 初始化查询
   */
  @Bind()
  handleQuery() {
    this.props.dispatch({
      type: 'investigationApproval/init',
    });

    this.handleSearch({ investigateHeaderId: this.state.investgHeaderId });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    if (fields.investigateHeaderId) {
      dispatch({
        type: 'investigationApproval/fetchInvestigationDetail',
        payload: {
          ...fields,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          const { processStatus } = res;
          if (!isPub && !['WFL_REJECT', 'SUBMIT'].includes(processStatus)) {
            // 站内信非法进入，返回列表页
            notification.info({
              message: intl
                .get('sslm.common.view.message.pleaseRefresh')
                .d('数据已发生变更，请刷新页面重试'),
            });
            this.props.history.push('/sslm/investigation-approval/list');
          }
          this.setState({
            headerInfo: res,
          });
        }
      });
    }
  }

  /**
   *同意
   *
   */
  @Bind()
  handleAgree(params) {
    const { dispatch, form } = this.props;
    const { headerInfo } = this.state;
    const { investgHeaderId } = headerInfo || {};
    form.validateFields(async (err, fieldsValues) => {
      if (!err) {
        const investigaSaveData = await this.getInvestigaSaveData();
        if (!isEmpty(investigaSaveData)) {
          dispatch({
            type: 'investigationApproval/handleAgree',
            payload: {
              ...headerInfo,
              ...fieldsValues,
              ...params,
              ...investigaSaveData,
              investigateHeaderId: this.state.investgHeaderId || investgHeaderId,
              customizeUnitCode,
            },
          }).then(result => {
            if (result) {
              notification.success();
              this.props.history.push('/sslm/investigation-approval/list');
            }
          });
        }
      }
    });
  }

  @Bind()
  displayRejectModal() {
    this.setState({
      rejectModalVisible: true,
    });
  }

  @Bind()
  hideRejectModal() {
    this.setState({ rejectModalVisible: false });
  }

  @Bind()
  handleInviteRefuseModal() {
    this.setState({
      inviteRefuseModalVisible: true,
    });
  }

  @Bind()
  hideInviteRefuseModal() {
    this.setState({
      inviteRefuseModalVisible: false,
    });
  }

  /**
   * 调查表审批拒绝
   */
  @Bind()
  handleReject() {
    const { dispatch } = this.props;
    if (this.refuseForm) {
      this.refuseForm.validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'investigationApproval/handleReject',
            payload: {
              ...values,
              investgHeaderId: this.state.investgHeaderId,
              customizeUnitCode: 'SSLM.INVESTIGATION_APPROVAL_DETAIL.REJECT_FORM',
            },
          }).then(result => {
            if (result) {
              notification.success();
              this.props.history.push('/sslm/investigation-approval/list');
            }
          });
        }
      });
    }
  }

  /**
   * 邀约拒绝
   */
  @Bind()
  handleInviteRefuse() {
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const rejectRemark = getFieldValue('rejectRemark');
    dispatch({
      type: 'investigationApproval/handleInviteRefuse',
      payload: {
        investgHeaderId: this.state.investgHeaderId,
        rejectRemark,
      },
    }).then(result => {
      if (result) {
        notification.success();
        this.props.history.push('/sslm/investigation-approval/list');
      }
    });
  }

  // 是否打开弹框
  @Bind()
  showOperatingRecord() {
    const { historyVisible } = this.state;
    this.setState({
      historyVisible: !historyVisible,
    });
  }

  // 获取Investigation的保存参数
  getSaveData = getSaveData => {
    this.getInvestigaSaveData = getSaveData;
  };

  // 获取埋点参数
  @Bind()
  getRemoteParams() {
    const { headerInfo } = this.state;
    return {
      headerInfo: { ...headerInfo },
      type: 'oldInvestgApprove',
    };
  }

  @Bind()
  renderForm() {
    const {
      investigateTemplateId,
      investgHeaderId,
      organizationId,
      headerInfo: detail = {},
    } = this.state;
    const {
      form,
      customizeForm,
      form: { getFieldDecorator },
      allLoading,
      investigationApproveRemote,
    } = this.props;
    return (
      <Spin spinning={allLoading || false}>
        <div style={{ marginLeft: 16 }}>
          {customizeForm(
            {
              code: customizeUnitCode,
              form,
              dataSource: detail,
              // readOnly: isPub,
            },
            <Form className="ued-edit-form form-wrap">
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.code`).d('调查表编号')}
                  >
                    {getFieldDecorator('investgNumber', {
                      initialValue: detail.investgNumber,
                    })(<span>{detail.investgNumber}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.type`).d('调查表类型')}
                  >
                    {getFieldDecorator('investigateType', {
                      initialValue: detail.investigateType,
                    })(<span>{detail.investigateTypeMeaning}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度')}
                  >
                    {getFieldDecorator('investigateLevel', {
                      initialValue: detail.investigateLevel,
                    })(<span>{detail.investigateLevelMeaning}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.company.code`).d('公司编码')}
                  >
                    {getFieldDecorator('companyNum', {
                      initialValue: detail.companyNum,
                    })(<span>{detail.companyNum}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.company.companyName`).d('公司名称')}
                  >
                    {getFieldDecorator('companyName', {
                      initialValue: detail.companyName,
                    })(<span>{detail.companyName}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                  >
                    {getFieldDecorator('processStatus', {
                      initialValue: detail.processStatus,
                    })(<span>{detail.processStatusMeaning}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get('hzero.common.date.releaseTime').d('发布时间')}
                  >
                    {getFieldDecorator('releaseDate', {
                      initialValue: detail.releaseDate,
                    })(<span>{dateTimeRender(detail.releaseDate)}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                  >
                    {getFieldDecorator('createdBy', {
                      initialValue: detail.createdBy,
                    })(<span>{detail.createUserRealName || detail.createUserName}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get('sslm.common.view.creator.unitName').d('创建人部门')}
                  >
                    {getFieldDecorator('unitName', {
                      initialValue: detail.unitName,
                    })(<span>{detail.unitName}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.supplier.code`).d('供应商编码')}
                  >
                    {getFieldDecorator('partnerCompanyNum', {
                      initialValue: detail.partnerCompanyNum,
                    })(<span>{detail.partnerCompanyNum}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.supplier.name`).d('供应商名称')}
                  >
                    {getFieldDecorator('supplierZhOrEnCompanyNum', {
                      initialValue: detail.supplierZhOrEnCompanyNum,
                    })(<span>{detail.supplierZhOrEnCompanyNum}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row all-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.remark`).d('调查说明')}
                  >
                    {getFieldDecorator('remark', {
                      initialValue: detail.remark,
                    })(<span>{detail.remark}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row all-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.partnerRemark`).d('反馈备注')}
                  >
                    {getFieldDecorator('partnerRemark', {
                      initialValue: detail.partnerRemark,
                    })(<span>{detail.partnerRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </div>
        <Investigation
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          organizationId={organizationId}
          _status="approval"
          configIgnore={detail.configIgnore}
          investgRemote={investigationApproveRemote}
          onSaveDataHook={this.getSaveData}
          editProcessCode="SSLM_INVESTIGATIONAPPROVE_DEFINITION_EDITABLE"
          remoteParams={this.getRemoteParams()}
        />
      </Spin>
    );
  }

  render() {
    const {
      form: { getFieldDecorator },
      allLoading,
      customizeBtnGroup,
      customizeForm,
      investigationApproveRemote,
    } = this.props;
    const {
      investgHeaderId,
      organizationId,
      historyVisible,
      isPub,
      rejectModalVisible,
      headerInfo,
      investigateTemplateId,
    } = this.state;
    const {
      triggerByCode,
      companyId,
      businessKeyList,
      processStatus,
      aiApproveDTOList,
      aiApproveStatus,
    } = headerInfo || {};
    const historyRecord = {
      historyVisible,
      investgHeaderId,
      organizationId,
      key: investgHeaderId,
      onShowOperatingRecord: this.showOperatingRecord,
      businessKeyList,
    };
    const btnFlag = ['WFL_REJECT', 'SUBMIT'].includes(processStatus) && !isPub;
    const remoteParams = {
      investgHeaderId,
      investigateTemplateId,
      loading: allLoading,
      btnFlag,
      headerInfo,
      handleQuery: this.handleQuery,
      handleAgree: this.handleAgree,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigCorrelat.view.message.approval.detailTitle`)
            .d('调查表明细审批')}
          backPath={isPub ? '' : '/sslm/investigation-approval/list'}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.INVESTIGATION_APPROVAL_DETAIL.BTN_GROUP',
            },
            [
              <Button
                icon="check"
                type="primary"
                data-name="agree"
                onClick={() => this.handleAgree()}
                loading={allLoading}
                style={{ display: btnFlag ? 'inline-block' : 'none' }}
              >
                {intl.get('hzero.common.button.agree').d('同意')}
              </Button>,
              <Button
                icon="close"
                data-name="approvalRefuse"
                onClick={this.displayRejectModal}
                loading={allLoading}
                style={{ display: btnFlag ? 'inline-block' : 'none' }}
              >
                {intl
                  .get('sslm.investigCorrelat.view.button.investigateApprovalRefuse')
                  .d('调查表审批拒绝')}
              </Button>,
              <Button
                icon="close"
                data-name="inviteRefuse"
                loading={allLoading}
                onClick={this.handleInviteRefuseModal}
                style={{ display: btnFlag && triggerByCode === 'INVITE' ? 'inline-block' : 'none' }}
              >
                {intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝')}
              </Button>,
              <Button
                icon="clock-circle-o"
                data-name="operation"
                onClick={this.showOperatingRecord}
                loading={allLoading}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>,
            ]
          )}
          {/* 按钮埋点 */}
          {investigationApproveRemote &&
            investigationApproveRemote.render(
              'SSLM_INVESTIGATIONAPPROVE_CUSTOMER_BUTTONS',
              <></>,
              remoteParams
            )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content>{this.renderForm()}</Content>
        {/* 调查表审批拒绝弹框 */}
        {rejectModalVisible && (
          <InvestigateRefuseModal
            companyId={companyId}
            allLoading={allLoading}
            onOk={this.handleReject}
            onCancel={this.hideRejectModal}
            customizeForm={customizeForm}
            rejectModalVisible={rejectModalVisible}
            onRef={node => {
              this.refuseForm = node;
            }}
          />
        )}
        {/* 邀约拒绝弹框 */}
        <Modal
          width={640}
          destroyOnClose
          title={intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝')}
          visible={this.state.inviteRefuseModalVisible}
          onCancel={this.hideInviteRefuseModal}
          onOk={this.handleInviteRefuse}
          confirmLoading={allLoading}
        >
          <Spin spinning={allLoading || false}>
            <Form>
              <FormItem
                {...inviteRefuseItemLayout}
                label={intl
                  .get(`sslm.investigCorrelat.view.message.refuseModalTitle`)
                  .d('拒绝原因')}
              >
                {getFieldDecorator('rejectRemark', {})(<TextArea rows={16} />)}
              </FormItem>
            </Form>
          </Spin>
        </Modal>
        {/* 历史记录 */}
        {historyVisible && <OperatingRecord {...historyRecord} />}
      </React.Fragment>
    );
  }
}
