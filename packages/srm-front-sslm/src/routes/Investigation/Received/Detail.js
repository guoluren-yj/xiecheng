/*
 * ReceivedInvestigationDetail - 我收到的调查表明细
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Spin, Button, Row, Col } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import Investigation from '../Component/Investigation';
import OperatingRecord from '../../OperatingRecord';
import '@/routes/index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 我收到的调查表页面
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
@connect(({ loading, investigationReceived }) => ({
  investigationReceived,
  allLoading:
    loading.effects['investigationReceived/fetchReceivedInvestigationDetail'] ||
    loading.effects['investigationWrite/handlePrint'],
}))
@formatterCollections({
  code: [
    'sslm.investigCorrelat',
    'sslm.common',
    'sslm.investigationCorrelation',
    'sslm.investCorrelat',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.RECEIVED_INVESTIGATION.LIST.HEADER_INFO',
    'SSLM.RECEIVED_INVESTIGATION.DETAIL.BTN_GORUP',
  ],
  manualQuery: true,
})
export default class ReceivedInvestigationDetail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { state: { historyBack } = {} } = props.location;
    this.state = {
      historyBack,
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
      organizationId: routerParam.organizationId,
      historyVisible: false, // 操作历史弹框
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'investigationReceived/init',
    });
    this.handleSearch({ investgHeaderId: this.state.investgHeaderId });
    const { queryUnitConfig } = this.props;
    const { organizationId } = this.state;
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: organizationId || -1 });
    }
  }

  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationReceived/updateState',
      payload: {
        detail: {},
        processStatusList: [], // 状态列表
        investigateLevelList: [], // 调查表管控制度
      },
    });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationReceived/fetchReceivedInvestigationDetail',
      payload: { ...fields, customizeUnitCode: 'SSLM.RECEIVED_INVESTIGATION.LIST.HEADER_INFO' },
    });
  }

  @Bind()
  renderForm() {
    const {
      investigationReceived: { detail, processStatusList = [], investigateLevelList = [] },
      allLoading,
      custLoading,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const { investigateTemplateId, investgHeaderId, organizationId } = this.state;
    const status = processStatusList.find(item => item.value === detail.processStatus);
    const level = investigateLevelList.find(item => item.value === detail.investigateLevel);
    return (
      <Spin spinning={allLoading || false}>
        {customizeForm(
          {
            code: 'SSLM.RECEIVED_INVESTIGATION.LIST.HEADER_INFO',
            form: this.props.form,
            dataSource: detail,
          },
          <Form custLoading={custLoading} className="ued-edit-form" style={{ margin: '0 16px' }}>
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
                  })(
                    <span>
                      {(level && level.meaning) ||
                        detail.investigateLevelMeaning ||
                        detail.investigateLevel}
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.customer.code`).d('客户编码')}
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
                  label={intl.get(`sslm.common.view.customer.name`).d('客户名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: detail.companyName,
                  })(<span> {detail.companyName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                >
                  {getFieldDecorator('processStatus', {
                    initialValue: detail.processStatus,
                  })(<span>{(status && status.meaning) || detail.processStatus}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.common.model.investigate.template.code`)
                    .d('调查表模板代码')}
                >
                  {getFieldDecorator('templateCode', {
                    initialValue: detail.templateCode,
                  })(<span>{detail.templateCode}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.template`).d('调查表模板')}
                >
                  {getFieldDecorator('templateName', {
                    initialValue: detail.templateName,
                  })(<span>{detail.templateName}</span>)}
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
                  label={intl.get('sslm.common.view.creator.name').d('创建人')}
                >
                  {getFieldDecorator('createUserName', {
                    initialValue: detail.createUserRealName || detail.createUserName,
                  })(<span> {detail.createUserRealName || detail.createUserName}</span>)}
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
                  label={intl
                    .get(`sslm.investigationCorrelation.view.message.lastUpdateByName`)
                    .d('最后审批人')}
                >
                  {getFieldDecorator('lastUpdateByName', {
                    initialValue: detail.lastUpdateRealName || detail.lastUpdateByName,
                  })(<span> {detail.lastUpdateRealName || detail.lastUpdateByName}</span>)}
                </FormItem>
              </Col>
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
                  {getFieldDecorator('partnerCompanyName', {
                    initialValue: detail.partnerCompanyName,
                  })(<span>{detail.partnerCompanyName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
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
            <Row gutter={48} className="half-row">
              <Col span={24}>
                <FormItem
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
            <Row gutter={48} className="half-row">
              <Col span={24}>
                <FormItem
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
              <Row gutter={48} className="half-row">
                <Col span={24}>
                  <FormItem
                    label={intl.get(`sslm.investCorrelat.view.message.rejectRemark`).d('拒绝原因')}
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
        <Investigation
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          organizationId={organizationId}
          configIgnore={detail.configIgnore}
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

  render() {
    const {
      investigationReceived: { detail: { businessKeyList } = {} } = {},
      allLoading,
      customizeBtnGroup,
    } = this.props;
    const { investgHeaderId, organizationId, historyVisible, historyBack } = this.state;
    const historyParams = {
      historyVisible,
      investgHeaderId,
      organizationId,
      key: investgHeaderId,
      onShowOperatingRecord: this.showOperating,
      businessKeyList,
      isShowReviewRecord: false,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigationCorrelation.view.message.detailTitle`)
            .d('调查表明细查询')}
          backPath={historyBack}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.RECEIVED_INVESTIGATION.DETAIL.BTN_GORUP',
            },
            [
              <Button
                type="primary"
                icon="clock-circle-o"
                data-name="operationRecord"
                onClick={this.showOperating}
                loading={allLoading}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>,
              <Button
                icon="printer"
                onClick={this.handlePrint}
                loading={allLoading}
                data-name="print"
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </Button>,
            ]
          )}
        </Header>
        <Content>{this.renderForm()}</Content>
        {historyVisible && <OperatingRecord {...historyParams} />}
      </React.Fragment>
    );
  }
}
