/**
 * create 创建招标
 * @date: 2019-05-22
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, compose } from 'lodash';
import {
  Button,
  Form,
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Collapse,
  Tabs,
  Icon,
  Tooltip,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import moment from 'moment';
import classnames from 'classnames';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, getCurrentTenant } from 'utils/utils';

import { fetchSourceMethodConfig } from '@/services/bidHallService';
import common from '@/routes/sbid/common.less';

const { Panel } = Collapse;
const { Option } = Select;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companyName: '',
      currencyId: '',
      iconLoading: false,
      currencyCode: '',
      exchangeRate: 1.0,
      collapseKeys: ['baseInfos'], // 折叠面板
      setCurrentValueFlag: false, // 是否选择过币种
      allOpenSelectable: false, // 全平台公开是否可以选择
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;

    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 竞价方式
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      subjectMatterRule: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      sourceStage: 'SSRC.SOURCE_STAGE', // 招标阶段
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };

    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    this.fetchSourceMethodConfig();
    this.handleSearch();
  }

  /**
   * 查询创建人部门
   */
  @Bind()
  handleSearch() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchCreatedUnitName',
      payload: {
        organizationId,
      },
    });
  }

  /**
   * 查询寻源方式配置表
   */
  async fetchSourceMethodConfig() {
    const res = getResponse(
      await fetchSourceMethodConfig({ tenant: getCurrentTenant().tenantNum })
    );
    if (res) {
      this.setState({
        allOpenSelectable: !isEmpty(res),
      });
    }
  }

  /**
   * 创建招标
   *
   * @memberof Create
   */
  @Bind
  handleCreaeBidHall() {
    const { dispatch, organizationId, form } = this.props;

    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        this.setState({ iconLoading: true });

        dispatch({
          type: 'bidHall/createBid',
          payload: {
            values: {
              ...values,
              companyName: this.state.companyName,
              currencyId: this.state.currencyId,
              methodId: '1',
            },
            organizationId,
            customizeUnitCode: 'SSRC.BID_HALL_CREATE.FORM',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            const { bidRuleType = '', subjectMatterRule = '' } = res;
            const search = querystring.stringify({
              bidRuleType,
              subjectMatterRule,
            });
            this.setState({ iconLoading: false });
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/bid-hall/bid-update/${res.bidHeaderId}`,
                search,
              })
            );
          } else {
            this.setState({ iconLoading: false });
          }
        });
      }
    });
  }

  /**
   * 改变寻源模板
   *
   * @param {*} val
   * @param {*} record
   * @memberof Create
   * @return void
   */
  @Bind
  changeTemplateId(val, record) {
    const { form } = this.props;

    form.setFieldsValue({
      sourceCategoryMeaning: record.sourceCategoryMeaning,
      sourceMethod: record.sourceMethod,
      auctionDirection: record.auctionDirection,
      quotationType: record.quotationType,
      subjectMatterRule: record.subjectMatterRule,
      sourceStage: record.sourceStage,
      openBidOrder: record.openBidOrder,
      openBidOrderMeaning: record.openBidOrderMeaning,
      expertScoreType: record.expertScoreType,
      expertScoreTypeMeaning: record.expertScoreTypeMeaning,
    });
  }

  /**
   * 切换公司
   *
   * @param {*} val
   * @param {*} record
   * @memberof Create
   */
  @Bind()
  selectCompany(val, record) {
    const { setCurrentValueFlag } = this.state;
    const { form } = this.props;
    this.setState({
      companyName: record.companyName || '',
    });
    if (setCurrentValueFlag) {
      form.setFieldsValue({
        unitId: undefined,
      });
    } else {
      form.setFieldsValue({
        unitId: undefined,
        currencyId: record.currencyId,
        currencyCode: record.currencyCode,
      });
    }
  }

  /**
   * 根据币种改变值
   */
  @Bind()
  setValue(val, record) {
    const { form } = this.props;
    this.setState({
      currencyId: record.currencyId,
      setCurrentValueFlag: !isEmpty(record),
    });
    form.setFieldsValue({
      currencyCode: record.currencyCode,
      currencyId: record.currencyId,
    });

    if (val === 'RMB') {
      form.setFieldsValue({
        exchangeRate: 1.0,
      });
    } else {
      form.setFieldsValue({
        exchangeRate: null,
      });
    }
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 创建招标form
   * @override 树根互联继承二开，不要改方法名 2021-11-29
   * @returns
   * @memberof Create
   */
  renderCreateForm() {
    const {
      form,
      customizeForm,
      organizationId,
      bidHall: { code = {}, cHallHeader = {} },
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { exchangeRate = 1.0, currencyCode = '', allOpenSelectable } = this.state;
    const {
      sourceMethod = [],
      quotationType = [],
      subjectMatterRule = [],
      sourceStage = [],
      bidType = [],
    } = code;
    const filterQuotationType =
      quotationType && quotationType.filter((item) => item.value === 'ONLINE');

    return customizeForm(
      { code: 'SSRC.BID_HALL_CREATE.FORM', form, dataSource: cHallHeader },
      <Form>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidNum`).d('招标编号')}
              {...formLayout}
            >
              {getFieldDecorator('bidNum')(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项')}
              {...formLayout}
            >
              {getFieldDecorator('bidTitle', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项'),
                    }),
                  },
                ],
              })(<Input maxLength={40} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.rfxModal`).d('寻源模板')}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.rfxModal`).d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  textField="templateName"
                  code="SSRC.TEMPLATE_NAME"
                  queryParams={{
                    sourceCategory: 'BID',
                    subjectMatterRule: form.getFieldValue('subjectMatterRule'),
                  }}
                  onChange={(val, record) => this.changeTemplateId(val, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purchaseOrgName`).d('采购组织名称')}
              {...formLayout}
            >
              {getFieldDecorator('purOrganizationId')(
                <Lov textField="purchaseOrgName" code="SPFM.USER_AUTH.PURORG" />
              )}
            </FormItem>
          </Col>

          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationType`).d('报价方式')}
              {...formLayout}
            >
              {getFieldDecorator('quotationType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.quotationType`).d('报价方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {filterQuotationType &&
                    filterQuotationType.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayout}>
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.company').d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  textField="companyName"
                  onChange={(val, record) => this.selectCompany(val, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.createdUnitName`).d('创建人部门')}
              {...formLayout}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: cHallHeader.unitName,
              })(<Input disabled />)}
              {getFieldDecorator('createdUnitId', {
                initialValue: cHallHeader.unitId,
              })}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别')}
              {...formLayout}
            >
              {getFieldDecorator('bidType', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {bidType &&
                    bidType.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>

          <Col span={8}>
            <FormItem
              label={
                <span>
                  {intl.get('ssrc.bidHall.model.bidHall.sourceMethod').d('寻源方式')}&nbsp;
                  {['OPEN', 'ALL_OPEN'].includes(getFieldValue('sourceMethod')) ? (
                    <Tooltip
                      title={intl
                        .get('ssrc.common.validate.sourceMethod')
                        .d(
                          '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
                        )}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  ) : null}
                </span>
              }
              {...formLayout}
            >
              {getFieldDecorator('sourceMethod', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.sourceMethod`).d('寻源方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {sourceMethod &&
                    sourceMethod
                      .filter((item) => item.value !== 'ALL_OPEN' || allOpenSelectable)
                      .map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.subjectMatterRule`).d('标的规则')}
              {...formLayout}
            >
              {getFieldDecorator('subjectMatterRule', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.subjectMatterRule`).d('标的规则'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {subjectMatterRule &&
                    subjectMatterRule.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourceStage`).d('招标阶段')}
              {...formLayout}
            >
              {getFieldDecorator('sourceStage')(
                <Select allowClear disabled>
                  {sourceStage &&
                    sourceStage.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种')}
              {...formLayout}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: currencyCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textField="currencyCode"
                  onChange={(val, record) => this.setValue(val, record)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...formLayout}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: cHallHeader.purchaseAgentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  lovOptions={{
                    displayField: 'purchaseAgentName',
                    valueField: 'purchaseAgentId',
                  }}
                  textValue={cHallHeader.purchaseAgentName}
                  queryParams={{ organizationId }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8} style={{ display: 'none' }}>
            <React.Fragment>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.exchangeRate`).d('汇率')}
                {...formLayout}
              >
                {getFieldDecorator('exchangeRate', {
                  initialValue: exchangeRate,
                  // rules: [
                  //   {
                  //     required: form.getFieldValue('currencyCode') !== 'CNY',
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`ssrc.bidHall.model.bidHall.exchangeRate`).d('汇率'),
                  //     }),
                  //   },
                  // ],
                })(
                  <InputNumber
                    disabled={form.getFieldValue('currencyCode') === 'RMB'}
                    style={{ width: '100%' }}
                    precision={8}
                    min={0}
                    max={100000}
                  />
                )}
              </FormItem>
              <Form.Item>{getFieldDecorator('openBidOrder')(<div />)}</Form.Item>
              <Form.Item>{getFieldDecorator('openBidOrderMeaning')(<div />)}</Form.Item>
              <Form.Item>{getFieldDecorator('expertScoreType')(<div />)}</Form.Item>
              <Form.Item>{getFieldDecorator('expertScoreTypeMeaning')(<div />)}</Form.Item>
              <Form.Item>{getFieldDecorator('sourceCategoryMeaning')(<div />)}</Form.Item>
              <Form.Item>{getFieldDecorator('auctionDirection')(<div />)}</Form.Item>
            </React.Fragment>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.roundNumber`).d('轮次')}
              {...formLayout}
            >
              {getFieldDecorator('roundNumber')(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.versionNumber`).d('版本')}
              {...formLayout}
            >
              {getFieldDecorator('versionNumber')(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={common.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.createDate`).d('创建时间')}
              {...formLayout}
            >
              {getFieldDecorator('createDate')(
                <DatePicker
                  defaultValue={moment(new Date())}
                  format="YYYY-MM-DD"
                  disabled
                  placeholder=""
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { collapseKeys } = this.state;
    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/bid-hall/list"
          title={intl.get(`ssrc.bidHall.view.message.title.bidCreate`).d('招标创建')}
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.handleCreaeBidHall}
            loading={this.state.iconLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content className={classnames('ued-detail-wrapper')}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={['baseInfos']}
            onChange={this.onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>{intl.get(`ssrc.bidHall.view.message.tab.biddingMaintain`).d('招标维护')}</h3>
                  <a>
                    {collapseKeys.includes('baseInfos')
                      ? intl.get(`hzero.common.button.up`).d('收起')
                      : intl.get(`hzero.common.button.expand`).d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="baseInfos"
            >
              <Tabs defaultActiveKey="baseInfos" animated={false}>
                <Tabs.TabPane
                  tab={intl.get(`ssrc.bidHall.view.message.tab.baseInfos`).d('基本信息')}
                  key="baseInfos"
                >
                  {this.renderCreateForm()}
                </Tabs.TabPane>
              </Tabs>
            </Panel>
          </Collapse>
        </Content>
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_CREATE.FORM', // 头部基本信息
      ],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'],
    }),
    connect(({ bidHall, loading }) => ({
      bidHall,
      createBidHall: loading.effects['bidHall/createBid'],
      organizationId: getCurrentOrganizationId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Com);
};

export default Hooc(Create);

export { Create, Hooc };
