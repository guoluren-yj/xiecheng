/*
 * 配置中心 - 接收
 * @date: 2018/11/08 14:56:50
 * @author: Liu zhaohui <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Radio, Form, Select, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import styles from './index.less';
import PurchaseTransModal from './PurchaseTransModal';
import SubMessage from '../../components/SubMessage';
import SubCheckBox from '../../components/SubCheckBox';
import CheckUpdateRule from '../../../sinv/CheckUpdateRule';

const RadioGroup = Radio.Group;
/**
 * 配置中心-采购方-送货单
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@Form.create({ fieldNameProp: null })
export default class Deliver extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      purchaseTransVisible: false,
      checkUpdateRuleVisible: false, // 验收单定义列表弹窗
      disabled010404: props.settings['010404'] === 1 || false,
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
   * 采购事务类型配置弹窗
   */
  @Bind()
  handleShowPurchaseTrans() {
    this.setState({ purchaseTransVisible: true });
  }

  /**
   * 接收配置修改回调
   * @param {*} e
   */
  @Bind()
  handleChangeReceiveSystem(e) {
    const {
      onRefStateChange,
      form: { setFieldsValue },
    } = this.props;
    if (e.target.value === '010404') {
      this.setState({ disabled010404: true });
      onRefStateChange('deliveryRef', { disabled010404: true }, { '010305': 0, '010307': 0 });
      setFieldsValue({ '010401': 1, '010402': 1 });
    } else {
      onRefStateChange('deliveryRef', { disabled010404: false });
      this.setState({ disabled010404: false });
    }
  }

  /**
   * 改变state
   * @param {*} param
   * @param {*} flag
   * @param {*} [otherParams={}]
   */
  @Bind()
  handleStateVisible(param, flag, otherParams = {}) {
    this.setState({
      [param]: !!flag,
      ...otherParams,
    });
  }

  /**
   * 禁用电商订单自动接收时重置校验信息
   * @param {*} e
   */
  @Bind()
  handleResetErr(e) {
    const {
      form: { setFields },
    } = this.props;
    const errorMessage = intl.get('hzero.common.validation.notNull', {
      name: intl.get(`spfm.configServer.view.deliveryNote.timeout`).d('电商送货单超时时间'),
    });
    setFields({
      '010410': {
        value: null,
        errors: e.target.checked === 1 ? [new Error(errorMessage)] : null,
      },
    });
  }

  render() {
    const { purchaseTransVisible, checkUpdateRuleVisible, disabled010404 } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      settings,
      saveCompany,
      enumMap,
      configHideArr = [],
    } = this.props;

    const { checkApprove = [] } = enumMap;
    const purchaseTrans = {
      purchaseTransVisible,
      onHandleShowPurchaseTrans: this.handleStateVisible,
    };
    const checkUpdateRuleProps = {
      visible: checkUpdateRuleVisible,
      handleModal: this.handleStateVisible,
      saveCompany,
      settings,
    };
    const configList = [
      {
        key: 1,
        href: 'purReceiveWorkMatch',
        title: intl.get(`spfm.configServer.view.receive.message.receiveMatch`).d('接收事务匹配'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.receive.message.receiveMatch`).d('接收事务匹配')}
            </Col>
            {!configHideArr.includes('purReceiveWorkMatch-1') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.receive.message.010401`)
                    .d('采购订单发运行数据自动匹配ERP接收事务')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010401']}
                  field="010401"
                  disabled={disabled010404}
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.receive.message.010401subMsg`)
                    .d('勾选自动匹配，则ERP接收事务自动匹配订单并更新相关值。')}
                />
              </>
            )}
            {!configHideArr.includes('purReceiveWorkMatch-2') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.receive.message.010402`)
                    .d('送货单数据自动匹配ERP接收事务')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010402']}
                  field="010402"
                  disabled={disabled010404}
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.receive.message.010402subMsg`)
                    .d('勾选自动匹配，则ERP接收事务自动匹配送货单并更新相关值。')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purPurchaseTrans',
        title: intl
          .get(`spfm.configServer.model.purchaser.view.purchaseTrans.title`)
          .d('采购事务类型配置'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-20px' }}>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.model.purchaser.view.purchaseTrans.title`)
                .d('采购事务类型配置')}
              <a onClick={() => this.handleShowPurchaseTrans()} className="operate-item-link">
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </Col>
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purReceiveSystem',
        title: intl.get(`spfm.configServer.view.receive.receiveSystem`).d('接收系统'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.receive.receiveSystem`).d('接收系统')}
            </Col>
            <Col span={24}>
              <Form.Item className="receive-system">
                {getFieldDecorator('receiveSystem', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.receive.receiveSystem`)
                          .d('接收系统'),
                      }),
                    },
                  ],
                  initialValue:
                    settings['010403'] === 1
                      ? '010403'
                      : settings['010404'] === 1
                      ? '010404'
                      : null,
                })(
                  <RadioGroup onChange={this.handleChangeReceiveSystem}>
                    <Radio value="010403">
                      {intl.get(`spfm.configServer.view.receive.010403`).d('在ERP中做接收')}
                    </Radio>
                    <Radio value="010404">
                      {intl.get(`spfm.configServer.view.receive.010404`).d('在SRM中做接收')}
                    </Radio>
                  </RadioGroup>
                )}
                {/* <SubCheckBox
                  content={intl.get(`spfm.configServer.view.receive.010403`).d('在ERP中做接收')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010403']}
                  field="010403"
                  span={8}
                />
                <SubCheckBox
                  content={intl.get(`spfm.configServer.view.receive.010404`).d('在SRM中做接收')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010404']}
                  field="010404"
                  span={12}
                /> */}
              </Form.Item>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.receive.010404subMsg`)
                .d('选择在何系统进行接收退货业务，必选且只可选择一个。')}
            />
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purAcceptance',
        title: intl.get(`spfm.configServer.view.receive.acceptance`).d('验收单'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`spfm.configServer.view.receive.acceptance`).d('验收单')}</Col>
            {!configHideArr.includes('purAcceptance-1') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010405', {
                    initialValue: settings['010405'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.enabled.dimension.010405`)
                        .d('验收单启用维度')}
                    </Checkbox>
                  )}
                  {getFieldValue('010405') === 1 && (
                    <a
                      onClick={() => this.handleStateVisible('checkUpdateRuleVisible', true)}
                      className="operate-item-link"
                    >
                      {intl
                        .get(`spfm.configServer.view.finance.message.enabled.list.010405`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.enabled.dimension.subMsg.010405`)
                    .d(
                      '勾选验收单启用维度，则符合定义列表启用维护的单据可以使用验收单功能录入验收结果。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purAcceptance-2') && (
              <>
                <Col
                  span={24}
                  className={classnames(styles['version-rule'], 'sub-item-fields')}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010406', {
                    initialValue: settings['010406'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.approved.010405`)
                        .d('启用验收单审批')}
                    </Checkbox>
                  )}
                  <Form layout="inline" className={classnames(styles['form-item'])}>
                    {getFieldValue('010406') ? (
                      <Form.Item>
                        {getFieldDecorator('010407', {
                          initialValue: settings['010407'],
                          rules: [
                            {
                              required: getFieldValue('010405') || getFieldValue('010406'),
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`spfm.configServer.view.acceptance.approve`)
                                  .d('验收单审批'),
                              }),
                            },
                          ],
                        })(
                          <Select
                            showSearch
                            style={{ width: '150px' }}
                            allowClear
                            disabled={!getFieldValue('010406')}
                          >
                            {checkApprove.map((item) => (
                              <Select.Option key={item.value} value={item.value}>
                                {item.meaning}
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    ) : null}
                  </Form>
                </Col>
              </>
            )}
            {!configHideArr.includes('purAcceptance-3') && (
              <>
                <Col span={24} className={classnames('sub-item-fields')}>
                  {getFieldDecorator('010411', {
                    initialValue: settings['010411'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.approved.010411`)
                        .d('验收单回传ERP')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.enabled.dimension.subMsg.010411`)
                    .d('勾选回传，验收单及审批状态自动同步至ERP。')}
                />
              </>
            )}
            {!configHideArr.includes('purAcceptance-4') && (
              <>
                <Col
                  span={24}
                  className={classnames(styles['version-rule'], 'sub-item-fields')}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010409', {
                    initialValue: settings['010409'],
                  })(
                    <Checkbox onChange={(e) => this.handleResetErr(e)}>
                      {intl.get(`spfm.configServer.view.message.010409`).d('电商订单妥投后')}
                    </Checkbox>
                  )}
                  <Form layout="inline" className={classnames(styles['form-item'])}>
                    <Form.Item>
                      {getFieldDecorator('010410', {
                        initialValue: settings['010410'],
                        rules: [
                          {
                            required: getFieldValue('010409'),
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.deliveryNote.timeout`)
                                .d('电商送货单超时时间'),
                            }),
                          },
                        ],
                      })(<InputNumber min={0} precision={0} disabled={!getFieldValue('010409')} />)}
                    </Form.Item>
                  </Form>
                  <span>
                    {intl.get(`spfm.configServer.view.message.010410`).d('天系统自动做接收')}
                  </span>
                </Col>
              </>
            )}
          </Row>
        ),
      },
    ];
    return (
      <Row className={classnames('tab-content', styles.receive)} id="purReceive">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.receive.message.receive`).d('接收')}：
          </span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
        </Col>
        {purchaseTransVisible && <PurchaseTransModal {...purchaseTrans} />}
        {checkUpdateRuleVisible && <CheckUpdateRule {...checkUpdateRuleProps} />}
      </Row>
    );
  }
}
