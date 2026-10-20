/*
 * Order - 配置中心-采购方-订单
 * @date: 2018/09/07 14:51:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Select, Form, InputNumber } from 'hzero-ui';
import classnames from 'classnames';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

// import OrderPriceModifiableModal from './OrderPriceModifiableModal';
import OrderConfigModal from './OrderConfigModal';
import SubMessage from '../../components/SubMessage';
import SubCheckBox from '../../components/SubCheckBox';
import OrderEvaluateModal from './OrderEvaluateModal';
// import OrderConfirmRuleModal from './OrderConfirmRuleModal';
import OrderCheckModal from './OrderCheckModal';
import styles from './index.less';

const orderPrompt = 'spfm.configServer.view.order.message';
/**
 * 配置中心-采购方-订单
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@withRouter
@Form.create({ fieldNameProp: null })
export default class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderPrintFlag: false,
      // disabled010203: props.settings['010202'] || false,
      // disabled010204: props.settings['010202'] || false,
      // dateRequired010208: props.settings['010207'] || false,
      required010221: props.settings['010220'] || false,
      settings: props.settings || {},
      orderCheckData: props.settings['010224'] ? `${props.settings['010224']}` : '',
      orderConfigVisible: false,
      // orderPriceModifiableVisible: false,
      orderEvaluateVisible: false,
      orderCheckVisible: false,
    };
    props.onRef(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { settings } = nextProps;
    if (settings !== prevState.settings) {
      return {
        settings,
      };
    }
    return null;
  }

  /**
   * 打开和关闭订单打印弹窗
   */
  @Bind()
  handleOrderPrint() {
    const { orderPrintFlag } = this.state;
    this.setState({
      orderPrintFlag: !orderPrintFlag,
    });
  }

  /**
   * 改变state的visible
   * @param {*} field
   * @param {*} value
   */
  @Bind()
  handleStateVisible(field, value, otherParams = {}) {
    this.setState({ [field]: value, ...otherParams });
  }

  /**
   * 父组件state改变回调
   */
  @Bind()
  handleParentFieldChange(field, value, otherParams) {
    const { onOrderConfig } = this.props;
    if (onOrderConfig) {
      onOrderConfig(field, !!value, otherParams);
    }
  }

  /**
   * 设置订单审批状态回传ERP是否必输
   * @param {event} e
   */
  // @Bind()
  // handleChangeOrderApproval(e) {
  //   const { form: { setFieldsValue } } = this.props;
  //   this.setState(
  //     {
  //       disabled010212: e.target.checked === 1,
  //     },
  //     () => {
  //       if (e.target.checked === 1) {
  //         setFieldsValue({ '010212': 1 });
  //       }
  //     }
  //   );
  // }

  // @Bind()
  // handleChangeOrderPrice(e) {
  //   const {
  //     form: { setFieldsValue },
  //   } = this.props;
  //   this.setState(
  //     {
  //       disabled010203: e.target.checked === 1,
  //       disabled010204: e.target.checked === 1,
  //     },
  //     () => {
  //       if (e.target.checked === 1) {
  //         setFieldsValue({ '010203': 1 });
  //         setFieldsValue({ '010204': 1 });
  //       }
  //     }
  //   );
  // }

  // /**
  //  * 改变订单打印校验
  //  * @param {Object} e
  //  */
  // @Bind()
  // handleChangeOrderPrintRequired(e) {
  //   this.setState(
  //     {
  //       dateRequired010208: e.target.checked === 1,
  //     },
  //     () => {
  //       this.props.form.validateFields(['010208'], { force: true });
  //     }
  //   );
  // }

  @Bind()
  change010221(val) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ '010221': val });
  }

  @Bind()
  async change010224(val) {
    const {
      form: { setFieldsValue },
    } = this.props;
    await this.setState({
      orderCheckData: val,
    });
    await setFieldsValue({ '010224': val });
  }

  @Bind()
  handleChange010220(e) {
    const { form } = this.props;
    this.setState(
      {
        required010221: !e.target.value,
      },
      () => {
        form.validateFields({ force: true });
      }
    );
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
      configHideArr = [],
      orderCreateFlag,
    } = this.props;
    const {
      settings,
      orderConfigVisible,
      // orderPriceModifiableVisible,
      orderEvaluateVisible,
      // orderConfirmVisible = false,
      orderCheckData,
      orderCheckVisible,
      required010221,
    } = this.state;
    // const { delivery = [], templates = [], rules = [], approval = [] } = enumMap;
    const { rules = [] } = enumMap;
    const orderConfigProps = {
      visible: orderConfigVisible,
      onOrderConfig: this.handleStateVisible,
      versionNum: getFieldValue('010209'),
    };
    // const orderPriceModifiableProps = {
    //   visible: orderPriceModifiableVisible,
    //   handleModal: this.handleStateVisible,
    // };
    const orderCheckModalProps = {
      settings,
      initData: orderCheckData,
      visible: orderCheckVisible,
      change010224: this.change010224,
      handleModal: this.handleStateVisible,
    };
    const orderEvaluateModalProps = {
      orderEvaluateVisible,
      handleStateVisible: this.handleStateVisible,
    };
    // 订单确认、反馈审核及回传ERP规则-Modal 弹框
    // const orderComfirmRulesModalProps = {
    //   visible: orderConfirmVisible,
    //   onCloseModal: this.handleStateVisible,
    // };
    const configList = [
      {
        key: 1,
        href: 'purSingleRule',
        title: intl.get(`${orderPrompt}.singleRule`).d('订单创建'),
        component: (
          <Row>  {orderCreateFlag? (
            <React.Fragment>
              <Col span={24}>{intl.get(`${orderPrompt}.singleRule`).d('订单创建')}</Col>
              {!configHideArr.includes('purSingleRule-2') && (
              <>
                <Col span={24} className={styles['version-rule']}>
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], 'sub-item-fields')}
                  >
                    <Form.Item
                      label={`${intl
                        .get(`${orderPrompt}.010224msg`)
                        .d('订单创建启用多种来源单据数量校验')}`}
                    >
                      {getFieldDecorator('010224', {
                        initialValue: settings['010224'],
                      })}
                    </Form.Item>
                  </Form>
                  {
                    <a onClick={() => this.handleStateVisible('orderCheckVisible', true)}>
                      {intl.get(`${orderPrompt}.010224href`).d('进入定义列表')}
                    </a>
                  }
                </Col>
              </>
            )}
            </React.Fragment>
): (
              ''
            )}
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purOrderApproval',
        title: intl.get(`${orderPrompt}.orderApproval`).d('订单审批'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.orderApproval`).d('订单审批')}</Col>
            {/* <Col
            span={24}
            className={classnames(styles['version-rule'], 'sub-item-fields')}
            style={{ marginTop: '-10px', lineHeight: '39px' }}
          >
            {getFieldDecorator('010211', {
              initialValue: settings['010211'],
            })(
              <Checkbox onChange={this.handleChangeOrderApproval}>
                {intl.get(`${orderPrompt}.010211label`).d('启用SRM订单审批')}
              </Checkbox>
            )}
            {getFieldValue('010211') === 1 && (
              <Form layout="inline" className={classnames(styles['form-item'])}>
                <Form.Item>
                  {getFieldDecorator('010213', {
                    initialValue: settings['010213'],
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear>
                      {approval.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Form>
            )}
          </Col> */}
            {/* <SubMessage
            content={intl
              .get(`${orderPrompt}.010211subMsg`)
              .d(
                '启用SRM订单审批，则订单需在SRM通过功能或工作流完成审批，工作流审批需配合工作流定义使用。'
              )}
          /> */}
            <SubCheckBox
              content={intl.get(`${orderPrompt}.erp.010212`).d('启用来源ERP订单审批结果回传')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010212']}
              field="010212"
            />
            <SubMessage
              content={intl
                .get(`${orderPrompt}.erp.010212subMsg`)
                .d('勾选回传,来源平台为ERP的订单审批结果同步ERP系统')}
            />
            {/* <SubCheckBox
            content={intl.get(`${orderPrompt}.SRM.010223`).d('SRM采购订单同步ERP')}
            getFieldDecorator={getFieldDecorator}
            initialValue={settings['010223']}
            field="010223"
          />
          <SubMessage
            content={intl
              .get(`${orderPrompt}.erp.010223subMsg`)
              .d('勾选回传,来源平台为SRM的订单同步ERP系统')}
          /> */}
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purOrderRelease',
        title: intl.get(`${orderPrompt}.orderRelease`).d('订单发布'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.orderRelease`).d('订单发布')}</Col>
            {/* <SubCheckBox
              content={intl.get(`${orderPrompt}.010201`).d('采购订单手工发布')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010201']}
              field="010201"
            />
            <SubMessage
              content={intl
                .get(`${orderPrompt}.010201subMsg`)
                .d(
                  '勾选手工发布，则订单需通过“采购订单发布”功能手工点击发布，不勾选则订单自动发布'
                )}
            /> */}
            <Col span={24} className={styles['version-rule']}>
              <Form layout="inline" className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item
                  label={`${intl.get(`${orderPrompt}.010209label`).d('订单版本管理规则')}：`}
                >
                  {getFieldDecorator('010209', {
                    initialValue: settings['010209'],
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${orderPrompt}.010209label`).d('订单版本管理规则'),
                        }),
                      },
                    ],
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear>
                      {rules.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Form>
              {getFieldValue('010209') !== (0 || undefined) && (
                <a onClick={() => this.handleStateVisible('orderConfigVisible', true)}>
                  {intl.get(`${orderPrompt}.010202href`).d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`${orderPrompt}.010209subMsg`)
                .d(
                  '订单基于ERP管理，则订单版本显示ERP订单版本；订单基于SRM管理，则订单版本根据SRM订单版本升级规则进行管理，可在关键字段定义界面进行规则配置。'
                )}
            />
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purOrderEvaluate',
        title: intl.get(`${orderPrompt}.orderEvaluate`).d('订单评价'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.orderEvaluate`).d('订单评价')}</Col>
            {!configHideArr.includes('purOrderEvaluate-1') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010217', {
                    initialValue: settings['010217'],
                  })(<Checkbox>{intl.get(`${orderPrompt}.010217`).d('启用订单评价')}</Checkbox>)}
                  {getFieldValue('010217') === 1 && false && (
                    <a
                      onClick={() => this.handleStateVisible('orderEvaluateVisible', true)}
                      style={{ marginLeft: '8px' }}
                    >
                      {intl.get(`${orderPrompt}.010202href`).d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010217subMsg`)
                    .d('启用后可对已结订单进行评分及评价')}
                />
              </>
            )}
            {!configHideArr.includes('purOrderEvaluate-2') && (
              <>
                <SubCheckBox
                  content={intl.get(`${orderPrompt}.010218`).d('供应商可见订单评价')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010218']}
                  field="010218"
                  disabled={getFieldValue('010217') === 0}
                />
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010218subMsg`)
                    .d('勾选后，供应商方可看见订单评价，否则不可见')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 5,
        href: 'purOrderConfirm',
        title: intl.get(`${orderPrompt}.orderConfirm`).d('订单确认'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.orderConfirm`).d('订单确认')}</Col>
            {/* <SubCheckBox
              content={intl.get(`${orderPrompt}.010215`).d('采购订单自动确认')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010215']}
              field="010215"
            />
            <SubMessage
              content={intl
                .get(`${orderPrompt}.010215subMsg`)
                .d('勾选自动确认，则供应商无需手动确认订单，订单发布后状态自动置为“已确认”')}
            /> */}
            {!configHideArr.includes('purOrderConfirm-1') && (
              <>
                <SubCheckBox
                  content={intl.get(`${orderPrompt}.010219`).d('启用订单确认时校验附件')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010219']}
                  field="010219"
                />
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010219subMsg`)
                    .d(
                      '勾选则当启用了交期审核时，供应商反馈信息时校验附件；未启用交期审核时，供应商确认订单时校验附件。'
                    )}
                />
              </>
            )}
            {/* {!configHideArr.includes('purOrderConfirm-2') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`${orderPrompt}.orderFeedBackOrErpRules`)
                    .d('订单确认、反馈审核及回传ERP规则')}
                  &nbsp;&nbsp;
                  <a onClick={() => this.handleStateVisible('orderConfirmVisible', true)}>
                    {intl.get(`${orderPrompt}.010214href`).d('进入定义列表')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.orderFeedBackRulesMsg`)
                    .d(
                      '根据配置信息确定供应方订单确认阶段可维护的信息、采购方需审核的信息及需回传ERP的信息'
                    )}
                />
              </>
            )} */}
          </Row>
        ),
      },
      {
        key: 6,
        href: 'purOrderPrice',
        title: intl.get(`${orderPrompt}.orderPrice`).d('订单价格'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.orderPrice`).d('订单价格')}</Col>
            {/* {!configHideArr.includes('purOrderPrice-1') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010202', {
                    initialValue: settings['010202'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`${orderPrompt}.010202`)
                        .d('在订单确认、查询页面，不展示单价、总额等价格信息')}
                    </Checkbox>
                  )}
                  {getFieldValue('010202') === 1 && (
                    <a
                      onClick={() =>
                        this.handleParentFieldChange('priceShieldVisible', true, {
                          documentCategory: 'PO',
                        })
                      }
                      style={{ marginLeft: '8px' }}
                    >
                      {intl.get(`${orderPrompt}.010202href`).d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl.get(`${orderPrompt}.new010202subMsg`).d(
                    `勾选并定义屏蔽规则后，所定义的内部角色/外部供应商在订单确认、订单审批、订单发布、
                      我发出的订单、我收到的订单、订单反馈审核、订单评价界面，单价、总额等字段将显示为***`
                  )}
                />
              </>
            )} */}
            {!configHideArr.includes('purOrderPrice-2') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`${orderPrompt}.new010203`)
                    .d(
                      '引用物料价格信息记录（功能即将迭代，如需使用新价格库功能请至业务规则定义配置）'
                    )}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010203']}
                  field="010203"
                  // disabled={this.state.disabled010203}
                />
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010203subMsg`)
                    .d(
                      '勾选引用，则手工创建采购订单时，将自动引用物料价格信息记录中该物料当前有效价格。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purOrderPrice-3') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`${orderPrompt}.new010204`)
                    .d(
                      '自动更新物料价格信息记录（功能即将迭代，如需使用新价格库功能请至业务规则定义配置）'
                    )}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010204']}
                  field="010204"
                  // disabled={this.state.disabled010204}
                />
                <Col span={24} className="sub-message">
                  {intl
                    .get(`${orderPrompt}.010204subMsg`)
                    .d(
                      '勾选自动更新，则订单审批通过后，将以当前物料的价格自动更新物料价格信息记录。'
                    )}
                </Col>
              </>
            )}
            {/* {!configHideArr.includes('purOrderPrice-4') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010216', {
                    initialValue: settings['010216'],
                  })(
                    <Checkbox>
                      {intl.get(`${orderPrompt}.010216`).d('订单维护页面允许修改价格')}
                    </Checkbox>
                  )}
                  {getFieldValue('010216') === 1 && (
                    <a
                      style={{ marginLeft: '8px' }}
                      onClick={() => this.handleStateVisible('orderPriceModifiableVisible', true)}
                    >
                      {intl.get(`${orderPrompt}.010202href`).d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010216subMsg`)
                    .d('勾选允许，则创建订单时，将允许修改从价格库或者商城引用的单价')}
                />
              </>
            )} */}
          </Row>
        ),
      },
      {
        key: 7,
        href: 'purPromiseTime',
        title: intl.get(`${orderPrompt}.promiseTime`).d('承诺交期'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${orderPrompt}.promiseTime`).d('承诺交期')}</Col>
            {!configHideArr.includes('purPromiseTime-1') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl.get(`${orderPrompt}.remindRulesDeploy`).d('交货提醒规则配置')}
                </Col>
                <Col
                  span={24}
                  className={classnames(styles['order-print'], 'sub-item-fields')}
                  style={{ lineHeight: '40px' }}
                >
                  <div className={styles.templateSelect}>
                    {getFieldDecorator('010220', {
                      initialValue: settings['010220'],
                    })(<Checkbox onChange={this.handleChange010220} />)}
                    <Form
                      layout="inline"
                      className={classnames(
                        styles['form-item'],
                        styles['margin-form-item'],
                        styles['version-rule']
                      )}
                    >
                      <Form.Item className={classnames(styles['input-num'])}>
                        {intl.get(`${orderPrompt}.beforeDeliveryDate`).d('承诺交货日期前')}
                        {getFieldDecorator('010221', {
                          initialValue: settings['010221'],
                          rules: [
                            {
                              required: required010221,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`${orderPrompt}.beforeDeliveryDate`)
                                  .d('承诺交货日期前'),
                              }),
                            },
                          ],
                        })(
                          <InputNumber
                            disabled={!required010221}
                            min={0}
                            onChange={(value) => this.change010221(value)}
                          />
                        )}
                        {intl.get(`${orderPrompt}.sendMsg`).d('天，给采购员/供应商发邮件/消息提醒')}
                      </Form.Item>
                    </Form>
                  </div>
                </Col>
              </>
            )}
            {/* {!configHideArr.includes('purPromiseTime-2') && (
              <>
                <SubCheckBox
                  content={intl.get(`${orderPrompt}.010225`).d('延期订单系统消息/邮件提醒')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010225']}
                  field="010225"
                />
                <Col span={24} className="sub-message">
                  {intl
                    .get(`${orderPrompt}.010225subMsg`)
                    .d(
                      '勾选启用，到达承诺交货日期后，订单未关闭且未完全创建送货单，定时给供应商发出系统消息与邮件提醒。'
                    )}
                </Col>
              </>
            )} */}
            {/* {!configHideArr.includes('purPromiseTime-3') && (
              <>
                <Col span={24} className="sub-item-fields">
                  <Form layout="inline" className={styles['form-item']}>
                    <Form.Item
                      label={`${intl.get(`${orderPrompt}.010206label`).d('承诺交货日期缺省值')}：`}
                    >
                      {getFieldDecorator('010206', {
                        initialValue: settings['010206'],
                      })(
                        <Select
                          showSearch
                          style={{ width: '150px' }}
                          allowClear
                          // disabled={this.state.disabled010206}
                        >
                          {delivery.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Form>
                </Col>
                <SubMessage
                  content={intl
                    .get(`${orderPrompt}.010206subMsg`)
                    .d(
                      '缺省值为空，则供应商需要自行填写承诺交期；缺省值为订单需求日期，则默认承诺交货日期=需求日期，供应商可再手工调整。'
                    )}
                />
              </>
            )} */}
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purOrder">
        <Col span={3}>
          <span className="label-col">{intl.get(`${orderPrompt}.order`).d('订单')}：</span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
          {/* <Row className="sub-item" style={{ position: 'relative' }}>
            <Col span={24}>{intl.get(`${orderPrompt}.orderPrint`).d('订单打印')}</Col>
            <Col
              span={24}
              className={classnames(styles['order-print'], 'sub-item-fields')}
              style={{ lineHeight: '40px' }}
            >
              <div className={styles.templateSelect}>
                {getFieldDecorator('010207', {
                  initialValue: settings['010207'],
                })(
                  <Checkbox onChange={(e) => this.handleChangeOrderPrintRequired(e)}>
                    {intl.get(`${orderPrompt}.010207`).d('启用采购订单打印')}
                  </Checkbox>
                )}
                {getFieldValue('010207') === 1 && (
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], styles['margin-form-item'])}
                  >
                    <Form.Item label={intl.get(`${orderPrompt}.010207label`).d('选择模板')}>
                      {getFieldDecorator('010208', {
                        initialValue: settings['010208'] || 'STD',
                        rules: [
                          {
                            required: this.state.dateRequired010208,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${orderPrompt}.010207label`).d('选择模板'),
                            }),
                          },
                        ],
                      })(
                        <Select showSearch style={{ width: '150px' }} allowClear>
                          {templates.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Form>
                )}
              </div>
            </Col>
            <SubMessage
              content={intl
                .get(`${orderPrompt}.010207subMsg`)
                .d(
                  '勾选启用打印，则采购方&供应商可在订单查询界面打印采购订单；集团模板可在报表配置功能中进行配置，未配置集团模板则默认按照标准模板打印。'
                )}
            />
          </Row> */}
          {/*
          {getFieldDecorator('purchaser#order-publish')(
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}>订单发布</Col>
                <Col span={24}>
                  <Checkbox value="A">采购订单手工发布</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          )}
          {getFieldDecorator('purchaser#order-detail-define')(
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}>
                  <Checkbox value="order-print" onClick={this.handleOrderPrint}>
                    启用采购订单打印
                  </Checkbox>
                </Col>
                {orderPrintFlag &&
                  getFieldDecorator('order-print-radio')(
                    <Row>
                      <RadioGroup>
                        <Row>
                          <Col span={24}>
                            <Radio value="use-group-template">使用本集团模板</Radio>
                          </Col>
                          <Col span={24}>
                            <Radio value="use-default-template">使用默认模板</Radio>
                          </Col>
                        </Row>
                      </RadioGroup>
                    </Row>
                  )}
                <Col span={24}>
                  <Checkbox value="account-statement-create">引用物料价格信息记录</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="D">自动更新物料价格信息记录</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">承诺交货日期是否必输</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">规格型号置于物料名称后</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          )} */}
        </Col>
        {orderConfigVisible && <OrderConfigModal {...orderConfigProps} />}
        {/* {orderPriceModifiableVisible && (
          <OrderPriceModifiableModal {...orderPriceModifiableProps} />
        )} */}
        {orderCheckVisible && <OrderCheckModal {...orderCheckModalProps} />}
        {orderEvaluateVisible && <OrderEvaluateModal {...orderEvaluateModalProps} />}
        {/* {orderConfirmVisible && <OrderConfirmRuleModal {...orderComfirmRulesModalProps} />} */}
      </Row>
    );
  }
}
