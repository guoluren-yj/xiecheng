/*
 * SendInvestigationDetail - 我发出的调查表明细
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Spin, Button, Row, Col, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { Button as PerButton } from 'components/Permission';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { formatInternationalTel } from '@/routes/components/utils';
import Investigation from '../Component/Investigation';
import OperatingRecord from '../../OperatingRecord';
import '@/routes/index.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const customizeUnitCode = 'SSLM.SEND_INVESTIGATION_DETAIL.HEADER';

/**
 * 我发出的调查表页面
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
  code: 'SSLM_SEND_INVESTIGATION_DETAIL', // 对应二开模块暴露的Expose的编码
  name: 'sendInvestigationRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@connect(({ loading, sendInvestigation, investigationWrite }) => ({
  investigationWrite,
  allLoading:
    loading.effects['sendInvestigation/checkInvestigation'] ||
    loading.effects['sendInvestigation/handleCancel'] ||
    loading.effects['sendInvestigation/fetchInvestigationDetail'] ||
    loading.effects['investigationWrite/handlePrint'],
  sendInvestigation,
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.investigationCorrelation', 'sslm.investCorrelat'],
})
@withCustomize({
  unitCode: ['SSLM.SEND_INVESTIGATION_DETAIL.HEADER', 'SSLM.SEND_INVESTIGATION_DETAIL.BTN_GROUP'],
})
export default class SendInvestigationDetail extends Component {
  constructor(props) {
    super(props);
    const isPub = this.props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const isIncludeFlag = props.location.pathname.includes('/include'); // 其他单据工作流条调查表统一采用openTab
    const { pageReadOnly = 0, sourceType } = routerParam;
    const { state: locationParam = {} } = props.location;
    this.state = {
      pageReadOnly: !!Number(pageReadOnly), // 角色工作台跳转,需要设置页面只读
      isPub,
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
      historyVisible: false, // 操作历史是否显示
      historyBack: locationParam.historyBack,
      isIncludeFlag,
      isAmktClient: sourceType === 'AMKT_CLIENT', // 单据来源为应用商店
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { investgHeaderId } = routerParam;
    // 这里取prevProps，取prevState会异步
    const { investgHeaderId: oldInvestgHeaderId } = querystring.parse(
      prevProps.location.search.substr(1)
    );
    if (investgHeaderId !== oldInvestgHeaderId) {
      this.setState({
        investgHeaderId: routerParam.investgHeaderId,
        investigateTemplateId: routerParam.investigateTemplateId,
      });
    }
    return investgHeaderId !== oldInvestgHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      const { location } = this.props;
      const routerParam = querystring.parse(location.search.substr(1));
      const { investgHeaderId } = routerParam;
      if (investgHeaderId) {
        this.handleSearch({ investgHeaderId });
      }
    }
  }

  componentDidMount() {
    const { investigateTemplateId, investgHeaderId } = this.state;
    // this.props.dispatch({
    //   type: 'sendInvestigation/fetchTemplate',
    //   payload: {
    //     investigateTemplateId,
    //   },
    // });
    this.handleSearch({ investgHeaderId, investigateTemplateId });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    if (fields.investgHeaderId) {
      dispatch({
        type: 'sendInvestigation/fetchInvestigationDetail',
        payload: {
          ...fields,
          customizeUnitCode,
        },
      });
    }
  }

  // 获取埋点参数
  @Bind()
  getRemoteParams() {
    const {
      sendInvestigation: { detail = {} },
    } = this.props;
    return {
      headerInfo: { ...detail },
      type: 'oldSendInvestg',
    };
  }

  @Bind()
  renderForm() {
    const {
      form,
      customizeForm,
      form: { getFieldDecorator },
      sendInvestigation: { detail = {} },
      allLoading,
      organizationId,
      sendInvestigationRemote,
    } = this.props;
    const { investigateTemplateId, investgHeaderId } = this.state;
    return (
      <Spin spinning={allLoading || false}>
        <div style={{ marginLeft: 16 }}>
          {customizeForm(
            {
              code: customizeUnitCode,
              form,
              dataSource: detail,
              readOnly: true,
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
                    label={intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度')}
                  >
                    {getFieldDecorator('investigateLevel', {
                      initialValue: detail.investigateLevel,
                    })(<span>{detail.investigateLevelMeaning}</span>)}
                  </FormItem>
                </Col>
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
              </Row>
              <Row gutter={48} className="read-row">
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
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.common.model.investigate.template.code`)
                      .d('调查表模板代码')}
                  >
                    {getFieldDecorator('investigateTemplateCode', {
                      initialValue: detail.investigateTemplateCode,
                    })(<span>{detail.investigateTemplateCode}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.model.investigate.template`).d('调查表模板')}
                  >
                    {getFieldDecorator('investigateTemplateName', {
                      initialValue: detail.investigateTemplateName,
                    })(<span>{detail.investigateTemplateName}</span>)}
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
              </Row>
              <Row gutter={48} className="read-row">
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
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.lastUpdateByName`)
                      .d('最后审批人')}
                  >
                    {getFieldDecorator('lastUpdatedBy', {
                      initialValue: detail.lastUpdatedBy,
                    })(<span>{detail.lastUpdateRealName || detail.lastUpdateByName}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.releaseDate`)
                      .d('发布时间')}
                  >
                    {getFieldDecorator('releaseDate', {
                      initialValue: detail.releaseDate,
                    })(<span>{dateTimeRender(detail.releaseDate)}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.submitDate`)
                      .d('提交时间')}
                  >
                    {getFieldDecorator('submitDate', {
                      initialValue: detail.submitDate,
                    })(<span>{dateTimeRender(detail.submitDate)}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.lastUpdateDate`)
                      .d('最后审批时间')}
                  >
                    {getFieldDecorator('lastUpdateDate', {
                      initialValue: detail.lastUpdateDate,
                    })(<span>{dateTimeRender(detail.lastUpdateDate)}</span>)}
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
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.partnerBuildDate`)
                      .d('注册时间')}
                  >
                    {getFieldDecorator('partnerBuildDate', {
                      initialValue: detail.partnerBuildDate,
                    })(<span>{dateTimeRender(detail.partnerBuildDate)}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.common.view.contact.name`).d('联系人')}
                  >
                    {getFieldDecorator('partnerContactor', {
                      initialValue: detail.partnerContactor,
                    })(<span>{detail.partnerContactor}</span>)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem {...formItemLayout} label={intl.get(`hzero.common.phone`).d('电话')}>
                    {getFieldDecorator('partnerContactPhone', {
                      initialValue: detail.partnerContactPhone,
                    })(
                      <span>
                        {formatInternationalTel(
                          detail.internationalTelMeaning,
                          detail.partnerContactPhone
                        )}
                      </span>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem {...formItemLayout} label={intl.get(`hzero.common.email`).d('邮箱')}>
                    {getFieldDecorator('partnerContactMail', {
                      initialValue: detail.partnerContactMail,
                    })(<span>{detail.partnerContactMail}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="all-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.remark`)
                      .d('调查说明')}
                  >
                    {getFieldDecorator('remark', {
                      initialValue: detail.remark,
                    })(<span>{detail.remark}</span>)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48} className="all-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`sslm.investigationCorrelation.view.message.partnerRemark`)
                      .d('反馈备注')}
                  >
                    {getFieldDecorator('partnerRemark', {
                      initialValue: detail.partnerRemark,
                    })(<span>{detail.partnerRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
              {detail.processStatus === 'REJECT' && (
                <Row gutter={48} className="all-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`sslm.investCorrelat.view.message.rejectRemark`)
                        .d('拒绝原因')}
                    >
                      {getFieldDecorator('rejectRemark', {
                        initialValue: detail.rejectRemark,
                      })(<span>{detail.rejectRemark}</span>)}
                    </FormItem>
                  </Col>
                </Row>
              )}
            </Form>
          )}
        </div>
        <Investigation
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          organizationId={organizationId}
          configIgnore={detail.configIgnore}
          investgRemote={sendInvestigationRemote}
          remoteParams={this.getRemoteParams()}
        />
      </Spin>
    );
  }

  // 是否打开弹框
  @Bind()
  showOperating() {
    const { historyVisible } = this.state;
    this.setState({
      historyVisible: !historyVisible,
    });
  }

  /**
   * 打印功能
   * @author  姚格格
   * @date    2020-04-20 16:15
   */
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { investgHeaderId } = this.state;
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'investigationWrite/handlePrint',
      payload: {
        investgHeaderId,
        tenantId: organizationId,
      },
    }).then(res => {
      if (res) {
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
    });
  }

  /**
   * 取消
   */
  @Bind()
  cancelCallBack() {
    const { dispatch } = this.props;
    const { investigateTemplateId, investgHeaderId } = this.state;
    dispatch({
      type: 'sendInvestigation/handleCancel',
      payload: [investgHeaderId],
    }).then(response => {
      if (response) {
        this.handleSearch({ investgHeaderId, investigateTemplateId });
      }
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
    const { dispatch } = this.props;
    dispatch({
      type: 'sendInvestigation/checkInvestigation',
      payload: [investgHeaderId],
    }).then(res => {
      if (res) {
        const { sevenFlag, inviteFlag, allFlag } = res;
        if (sevenFlag || inviteFlag || allFlag) {
          Modal.confirm({
            title: allFlag
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
            onOk: this.cancelCallBack,
          });
        } else {
          this.cancelCallBack();
        }
      }
    });
  }

  render() {
    const {
      investgHeaderId,
      historyVisible,
      historyBack,
      isPub,
      isAmktClient,
      pageReadOnly,
      isIncludeFlag,
    } = this.state;
    const {
      sendInvestigation: { detail = {} },
      organizationId,
      allLoading,
      customizeBtnGroup,
    } = this.props;
    const { processStatus, businessKeyList, aiApproveDTOList, aiApproveStatus } = detail;
    const historyParams = {
      investgHeaderId,
      organizationId,
      historyVisible,
      key: investgHeaderId,
      businessKeyList,
      onShowOperatingRecord: this.showOperating,
    };
    const backPatn =
      isIncludeFlag || isAmktClient ? '' : isPub ? historyBack : '/sslm/investigation-send/list';
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigationCorrelation.view.message.detailTitle`)
            .d('调查表明细查询')}
          backPath={backPatn}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SEND_INVESTIGATION_DETAIL.BTN_GROUP',
            },
            [
              <Button
                type="primary"
                icon="clock-circle-o"
                data-name="operationRecord"
                loading={allLoading}
                onClick={this.showOperating}
                style={{
                  display: !isEmpty(detail) ? 'block' : 'none',
                }}
              >
                {intl
                  .get(`sslm.investigationCorrelation.view.message.operationRecord`)
                  .d('操作记录')}
              </Button>,
              <PerButton
                icon="printer"
                loading={allLoading}
                data-name="print"
                permissionList={[
                  {
                    code: `srm.partner.investigation-po.my-sent-investigatation.ps.button.print`,
                    type: 'button',
                    meaning: '我发出的调查表-打印',
                  },
                ]}
                onClick={this.handlePrint}
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </PerButton>,
              <Button
                icon="close"
                data-name="cancel"
                loading={allLoading}
                onClick={this.handleCancel}
                style={{
                  display:
                    ['RELEASE', 'REJECT'].includes(processStatus) && !isPub && !pageReadOnly
                      ? 'block'
                      : 'none',
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>,
            ]
          )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content>{this.renderForm()}</Content>
        {historyVisible && <OperatingRecord {...historyParams} />}
      </React.Fragment>
    );
  }
}
