/*
 * Finance - 财务
 * @date: 2018/11/07 19:17:21
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Modal, Radio, InputNumber } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';

import DocMergeRulesModal from '../../../sodr/DocMergeRulesModal';
import OnlyInvoiceRule from '../../../sodr/OnlyInvoiceRule';
import BillUpdateRule from '../../../sodr/BillUpdateRule';
import InvoiceRuleModal from '../../../sodr/InvoiceUpdateRule';
import ToleranceRuleModal from '../../../sodr/ToleranceRule';
import SubMessage from '../../components/SubMessage';
import SubCheckBox from '../../components/SubCheckBox';
import PurBusCheckRules from './PurBusCheckRules';
import AccountChecking from './AccountChecking';
import ReconciliationSourceModal from './ReconciliationSourceModal';
import BusinessTypeModal from './BusinessTypeModal';
import SourcePrice from './SourcePrice';
import BillApprovalRules from './BillApprovalRules';
import InvoiceApprovalRules from './InvoiceApprovalRules';
import CollaboarationMode from '../../../sfin/CollaboarationMode';
import InvoiceCheckRuleModal from './InvoiceCheckRuleModal';
import styles from './index.less';

const RadioGroup = Radio.Group;
/**
 * 配置中心-采购方-财务
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@connect(({ loading }) => ({
  loading: loading.effects['configServer/queryTaxInvoiceLine'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
export default class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docMergeRulesVisible: false,
      onlyInvoiceRuleVisible: false, // 开票即对账规则
      billUpdateRuleVisible: false, // 对账单价修改规则
      invoiceRuleVisible: false, // 开具发票规则
      toleranceRuleVisible: false, // 发票允差
      purBusCheckRulesVisible: false, // 采购事务类型校验规则
      businessTypeVisible: false, // 业务类别配置
      billApprovalVisible: false, // 对账单审批规则定义
      invoiceApprovalVisible: false, // 发票审批规则定义
      collaboarationModeVisible: false, // 协同模式定义
      disabled010502: false,
      disabled010503: false,
      disabled010505: false,
      disabled010506: false,
      disabled010507: false,
      disabled010515: props.settings['010514'] || false,
      disabled010516: props.settings['010514'] || false,
      deductionMethod: props.settings['010523'] || 'ACCOUNT_DEDUCT',
      accountCheckingVisible: false,
      billFlag: '',
    };
    props.onRef(this);
  }

  @Bind()
  openTabTo(path) {
    this.props.history.push(path);
  }

  /**
   * 改变state
   */
  @Bind()
  handleStateChange(field, value, otherParams) {
    this.setState({ [field]: value, ...otherParams });
  }

  @Bind()
  handleStateChange2(field, value, flag) {
    this.setState({
      [field]: value,
      billFlag: flag,
    });
  }

  @Bind()
  handleResetErr(e) {
    const {
      form: { setFields, setFieldsValue },
    } = this.props;
    if (e.target.checked === 0) {
      setFields({
        '010541': {
          value: null,
          errors: null,
        },
      });
    } else {
      setFieldsValue({ '010541': 999 });
    }
  }

  // 打开价格配置弹窗
  @Bind()
  handleHidePriceDefine(flag, documentCategory) {
    const { onHidePriceDefine } = this.props;
    if (onHidePriceDefine) {
      onHidePriceDefine('priceShieldVisible', !!flag, { documentCategory });
    }
  }

  @Bind()
  handleChange010523(value) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (value) {
      this.setState({ deductionMethod: value });
      if (value === 'ACCOUNT_DEDUCT') {
        setFieldsValue({ '010522': 0 });
      }
    }
  }

  @Bind()
  handleChange010514(e) {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ '010515': 0, '010516': 0 });
    this.setState({
      disabled010515: e.target.checked === 1,
      disabled010516: e.target.checked === 1,
    });
    if (e.target.checked) {
      dispatch({
        type: 'configServer/fetchOpenResult',
        applicationCode: 'AP_INVOICE',
      }).then((res) => {
        if (!res) {
          Modal.confirm({
            content: intl
              .get('spfm.configServer.view.confirm.noOpenService')
              .d('您尚未开通发票查验服务，是否前往开通？'),
            onOk: () => {
              setFieldsValue({ '010514': 0 });
              this.props.history.push(`/spfm/amkt-appstore`);
            },
            onCancel: () => {
              setFieldsValue({ '010514': 0 });
            },
          });
        }
      });
    }
  }

  /**
   * 财务配置修改回调
   * @param {*} e
   */
  @Bind()
  changeFinanceSystem(e) {
    const {
      form: { validateFields },
    } = this.props;
    if (e.target.value === '010525') {
      this.setState(
        {
          disabled010502: true,
          disabled010503: true,
          disabled010505: true,
          disabled010506: true,
          disabled010507: true,
          disabled010545: true,
          disabled010544: true,
        },
        () => {
          validateFields({ force: true });
        }
      );
    } else {
      this.setState({
        disabled010502: false,
        disabled010503: false,
        disabled010505: false,
        disabled010506: false,
        disabled010507: false,
        disabled010545: false,
        disabled010544: false,
      });
    }
  }

  // 按并单规则自动拆分对账单点击
  @Bind()
  handleFinanceChange() {
    const {
      settings,
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('010532')) {
      // 此值为修改之前，故逻辑相反
      settings['010534'] = null;
    } else {
      settings['010534'] = 'NEW';
    }
  }

  /**
   * 发票查验规则弹窗
   */
  @Bind
  handleOpenInvoiceRuleModal(checkSource) {
    C7nModal.open({
      title: intl
        .get(`spfm.configServer.view.finance.message.invoiceCheckRuleConfig`)
        .d('发票查验规则配置'),
      closable: true,
      style: { width: 700 },
      className: styles['sfin-invoice-check-rule-modal'],
      children: <InvoiceCheckRuleModal checkSource={checkSource} />,
      footer: null,
    });
  }

  render() {
    const {
      docMergeRulesVisible,
      onlyInvoiceRuleVisible,
      billUpdateRuleVisible,
      invoiceRuleVisible,
      toleranceRuleVisible,
      purBusCheckRulesVisible,
      reconciliationSourceVisible,
      businessTypeVisible,
      disabled010515,
      disabled010516,
      disabled010502,
      disabled010503,
      disabled010505,
      disabled010506,
      disabled010507,
      disabled010545,
      disabled010544,

      deductionMethod,
      accountCheckingVisible,
      sourcePriceVisible,
      billApprovalVisible,
      invoiceApprovalVisible,
      collaboarationModeVisible,
      billFlag,
    } = this.state;
    const {
      enumMap,
      settings,
      configHideArr = [],
      form: { getFieldDecorator, getFieldValue },
      form,
    } = this.props;
    const docMergeRules = {
      docMergeRulesVisible,
      billFlag,
      onHandleShowMergeRules: this.handleStateChange,
      onRef: (ref) => {
        this.docMergeRulesRef = ref;
      },
    };
    const onlyInvoiceRuleProps = {
      visible: onlyInvoiceRuleVisible,
      handleModal: this.handleStateChange,
    };
    const billUpdateRuleProps = {
      visible: billUpdateRuleVisible,
      handleModal: this.handleStateChange,
    };
    const invoiceRuleProps = {
      visible: invoiceRuleVisible,
      handleModal: this.handleStateChange,
    };
    const toleranceRuleProps = {
      visible: toleranceRuleVisible,
      handleModal: this.handleStateChange,
    };
    const purBusCheckRulesProps = {
      visible: purBusCheckRulesVisible,
      handleModal: this.handleStateChange,
    };
    const accountCheckingRulesProps = {
      visible: accountCheckingVisible,
      handleModal: this.handleStateChange,
    };
    const reconciliationSourceProps = {
      enumMap,
      reconciliationSourceVisible,
      handleModal: this.handleStateChange,
    };
    const businessTypeProps = {
      enumMap,
      businessTypeVisible,
      handleModal: this.handleStateChange,
    };
    const sourcePriceProps = {
      visible: sourcePriceVisible,
      onClose: this.handleStateChange,
    };
    const billApprovalProps = {
      enumMap,
      settings,
      visible: billApprovalVisible,
      onState: this.handleStateChange,
    };
    const invoiceApprovalProps = {
      enumMap,
      settings,
      visible: invoiceApprovalVisible,
      onState: this.handleStateChange,
    };
    const collaboarationModeProps = {
      visible: collaboarationModeVisible,
      onState: this.handleStateChange,
    };
    const configList = [
      {
        key: 1,
        href: 'purDeduction',
        title: intl.get(`spfm.configServer.view.finance.message.deduction`).d('扣款单'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.finance.message.deduction`).d('扣款单')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              <Form.Item
                label={intl.get(`spfm.configServer.view.deduction.message.010531`).d('扣款基准价')}
              >
                {getFieldDecorator('010531', {
                  initialValue: settings['010531'] || 'TAX_INCLUDED_PRICE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.deduction.message.010531`)
                          .d('扣款基准价'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lovCode="SFIN.BENCHMARK_PRICE"
                    style={{ width: '150px' }}
                    lazyLoad={false}
                  />
                )}
              </Form.Item>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.deduction.message.010531submsg`)
                .d('选择不同基准价，影响税额计算。')}
            />
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', display: 'none' }}
            >
              <Form.Item
                label={intl
                  .get(`spfm.configServer.view.purchaseContract.010529Label`)
                  .d('扣款单审批方式')}
              >
                {getFieldDecorator('010529', {
                  initialValue: settings['010529'] || 'NONE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.deduction.message.010529`)
                          .d('扣款审批方式'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lovCode="SFIN.DEDUCTION_APPROVAL_METHOD"
                    style={{ width: '150px' }}
                    lazyLoad={false}
                  />
                )}
              </Form.Item>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.deduction.message.010529submsg`)
                .d(
                  '启用扣款单审批，则扣款单需在SRM通过功能或工作流完成审批，工作流审批需配合工作流定义使用。'
                )}
              style={{ display: 'none' }}
            />
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', display: 'none' }}
            >
              {getFieldDecorator('010530', {
                initialValue: settings['010530'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.deduction.confirm.message.010530`)
                    .d('扣款单自动确认')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.deduction.confirm.message.010530subMsg`)
                .d('勾选自动确认，则供应商无需手动确认扣款单，扣款单发布后状态自动置为"已确认"')}
              style={{ display: 'none' }}
            />
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purAccountStatement',
        title: intl.get(`spfm.configServer.view.finance.message.accountStatement`).d('对账单'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.finance.message.accountStatement`).d('对账单')}
            </Col>
            {!configHideArr.includes('purAccountStatement-1') && (
              <>
                <Col span={24} className={classnames('sub-item-fields')}>
                  {intl.get(`spfm.configServer.view.receive.financeSystem`).d('对账系统')}
                </Col>
                <Col span={24} className="sub-item-fields">
                  <Form.Item>
                    {getFieldDecorator('financeSystem', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`spfm.configServer.view.receive.financeSystem`)
                              .d('对账系统'),
                          }),
                        },
                      ],
                      initialValue:
                        settings['010525'] === 1
                          ? '010525'
                          : settings['010524'] === 1
                          ? '010524'
                          : null,
                    })(
                      <RadioGroup onChange={this.changeFinanceSystem}>
                        <Radio value="010525">
                          {intl.get(`spfm.configServer.view.receive.010525`).d('在ERP中做对账')}
                        </Radio>
                        <Radio value="010524">
                          {intl.get(`spfm.configServer.view.receive.010524`).d('在SRM中做对账')}
                        </Radio>
                      </RadioGroup>
                    )}
                  </Form.Item>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.receive.010525subMsg`)
                    .d('选择在何系统进行对账业务，必选且只可选择一个。')}
                />
              </>
            )}
            {/* <Col span={24} className="sub-item-fields">
              {intl
                .get(`spfm.configServer.view.finance.message.reconciliationSource`)
                .d('对账数据来源')}
              <a
                onClick={() => this.handleStateChange('reconciliationSourceVisible', true)}
                className="operate-item-link"
              >
                {intl
                  .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                  .d('进入定义列表')}
              </a>
            </Col> */}
            {!configHideArr.includes('purAccountStatement-2') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.businessType`)
                    .d('业务类别配置')}
                  <a
                    onClick={() => this.handleStateChange('businessTypeVisible', true)}
                    className="operate-item-link"
                  >
                    {intl
                      .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                      .d('进入定义列表')}
                  </a>
                </Col>
              </>
            )}
            <Col span={24} className="sub-item-fields" style={{ display: 'none' }}>
              {intl
                .get(`spfm.configServer.view.finance.message.billApprovalRules`)
                .d('对账单审批规则定义')}
              <a
                onClick={() => this.handleStateChange('billApprovalVisible', true)}
                className="operate-item-link"
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.finance.message.010519and010537subMsg`)
                .d('开票申请/开票通知单的审批方式，根据维护的方式不同，在不同页面进行单据的审批')}
              style={{ display: 'none' }}
            />
            {!configHideArr.includes('purAccountStatement-3') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010501', {
                    initialValue: settings['010501'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.010501`)
                        .d('在对账单创建、维护及查询页面不展示单价、金额等价格信息。')}
                    </Checkbox>
                  )}
                  {getFieldValue('010501') === 1 && (
                    <a
                      onClick={() => this.handleHidePriceDefine(true, 'BILL')}
                      style={{ marginLeft: '8px' }}
                    >
                      {intl
                        .get(`spfm.configServer.view.finance.message.010501href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010501subMsg`)
                    .d(
                      '勾选并定义规则后，所定义的内部角色/外部供应商在对账单相关界面的单价、总额等金额相关字段将显示为***'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-4') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010503', {
                    initialValue: settings['010503'],
                  })(
                    <Checkbox disabled={disabled010503}>
                      {intl
                        .get(`spfm.configServer.view.finance.message.010503`)
                        .d('允许供应商在对账时修改单价。')}
                    </Checkbox>
                  )}
                  {getFieldValue('010503') === 1 && (
                    <a
                      onClick={() => this.handleStateChange('billUpdateRuleVisible', true)}
                      className="operate-item-link"
                      disabled={disabled010503}
                    >
                      {intl
                        .get(`spfm.configServer.view.finance.message.010501href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010503subMsg`)
                    .d('勾选并定义规则后，所定义的供应商将可以在发起对账时修改对账的基准价。')}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-5') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.010504label`)
                    .d('对账和开票参考价来源为')}
                  <a
                    onClick={() => this.handleStateChange('sourcePriceVisible', true)}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010504subMsg`)
                    .d('对账事务和发票行物料的参考价格来源。')}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-6') && (
              <>
                <Col span={24} className={styles['version-rule']}>
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], 'sub-item-fields')}
                  >
                    <Form.Item
                      label={`${intl
                        .get(`spfm.configServer.view.finance.message.010505label`)
                        .d('对账及开票基准价为')}：`}
                    >
                      {getFieldDecorator('010505', {
                        initialValue: settings['010505'],
                        rules: [
                          {
                            required: !disabled010505,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.finance.message.010505`)
                                .d('对账及开票基准价'),
                            }),
                          },
                        ],
                      })(
                        <ValueList
                          allowClear
                          lovCode="SFIN.BENCHMARK_PRICE"
                          style={{ width: '150px' }}
                          lazyLoad={false}
                          disabled={disabled010505}
                        />
                      )}
                    </Form.Item>
                  </Form>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010505subMsg`)
                    .d('选择不同基准价，影响税额计算。')}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-7') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.bill.010506`)
                    .d('对账单并单规则设置')}
                  <a
                    disabled={disabled010506}
                    onClick={() => this.handleStateChange2('docMergeRulesVisible', true, 'BILL')}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
              </>
            )}
            {/* <SubCheckBox
              content={intl
                .get(`spfm.configServer.view.finance.message.010532`)
                .d('按并单规则自动拆分对账单')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010532']}
              field="010532"
            /> */}
            {!configHideArr.includes('purAccountStatement-8') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010532', {
                    initialValue: settings['010532'],
                  })(
                    <Checkbox onClick={() => this.handleFinanceChange()}>
                      {intl
                        .get(`spfm.configServer.view.finance.message.010532`)
                        .d('按并单规则自动拆分对账单')}
                    </Checkbox>
                  )}
                  {getFieldValue('010532') === 1 && (
                    <Form.Item>
                      {getFieldDecorator('010534', {
                        initialValue: settings['010534'],
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.finance.message.010532`)
                                .d('按并单规则自动拆分对账单'),
                            }),
                          },
                        ],
                      })(
                        <ValueList
                          allowClear
                          lovCode="SFIN.BILL_AUTO_SPLIT_STATUS"
                          style={{ width: '150px' }}
                          lazyLoad={false}
                        />
                      )}
                    </Form.Item>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010532subMessage`)
                    .d('若勾选不同并单规则的单据，则根据并单规则自动生成多张相关状态的对账单')}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-9') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {/* {getFieldDecorator('010502', {
                    initialValue: settings['010502'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.finance.message.010502`).d('无需单独对账，创建发票即对账。')}
                    </Checkbox>
                  )}
                  {getFieldValue('010502') === 1 && (
                    <a onClick={() => this.handleOnlyInvoiceRule()} className="operate-item-link">
                      {intl.get(`spfm.configServer.view.finance.message.010501href`).d('进入定义列表')}
                    </a>
                  )} */}
                  {intl.get(`spfm.configServer.view.finance.message.010502.temp`).d('对账规则配置')}
                  <a
                    disabled={disabled010502}
                    onClick={() => this.handleStateChange('onlyInvoiceRuleVisible', true)}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010502subMsg.temp`)
                    .d('配置采用不同对账方式的对账规则。')}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-10') && (
              <>
                <SubCheckBox
                  disabled={disabled010507}
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010507`)
                    .d('暂估价不允许对账及开票')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010507']}
                  field="010507"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010507subMsg`)
                    .d(
                      '当订单行上价格有暂估价标识时，勾选则对应的入库事务不允许进入对账和开票流程。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-11') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010528`)
                    .d('对账时校验扣款单')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010528']}
                  field="010528"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010528subMsg`)
                    .d(
                      '当供应商名下有未处理的扣款单或账扣的索赔单时，勾选则相关供应商不允许提交对账单。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purAccountStatement-12') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.purBusTypeCheckRule`)
                    .d('对账开票校验规则配置')}
                  <a
                    onClick={() => this.setState({ accountCheckingVisible: true })}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.purBusTypeCheckRuleSubMsg`)
                    .d('根据配置，采用不同校验维度，控制对账开票。')}
                />
              </>
            )}

            {!configHideArr.includes('purAccountStatement-13') && (
              <>
                <SubCheckBox
                  disabled={disabled010544}
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010544`)
                    .d('对账单审批通过的同时执行导入ERP')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010544']}
                  field="010544"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010544subMsg`)
                    .d(
                      '勾选表示对账单已确认的同时执行将对账单导入ERP操作，不勾选则需要用户在导入功能中单独执行导入操作'
                    )}
                />
              </>
            )}

            {!configHideArr.includes('purAccountStatement-14') && (
              <>
                <SubCheckBox
                  disabled={disabled010545}
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010545`)
                    .d('对账单同步至ERP后,允许SRM进行退回对账单')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010545']}
                  field="010545"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010545subMsg`)
                    .d(
                      '勾选启用后，对账单在成功导入ERP后，在SRM可通过【退回开票申请单】功能进行对账单退回，同时将对账单退回状态回传给ERP'
                    )}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purInvoice',
        title: intl.get(`spfm.configServer.view.finance.message.invoice`).d('发票'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.finance.message.invoice`).d('发票')}
            </Col>
            {!configHideArr.includes('purInvoice-1') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.collaborationMode`)
                    .d('协同模式定义')}
                  <a
                    onClick={() => this.handleStateChange('collaboarationModeVisible', true)}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.collaborationModeMsg`)
                    .d('定义发票流程协同交互模式')}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-2') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010508', {
                    initialValue: settings['010508'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.010508`)
                        .d('在发票创建、维护及查询页面不展示单价、金额等价格信息。')}
                    </Checkbox>
                  )}
                  {getFieldValue('010508') === 1 && (
                    <a
                      onClick={() => this.handleHidePriceDefine(true, 'INVOICE')}
                      style={{ marginLeft: '8px' }}
                    >
                      {intl
                        .get(`spfm.configServer.view.finance.message.010501href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010508subMsg`)
                    .d(
                      '勾选并定义规则后，所定义的内部角色/外部供应商在发票创建相关界面的单价、总额等金额相关字段将显示为***'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-3') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl.get(`spfm.configServer.view.finance.message.010509`).d('开具发票规则设置')}
                  <a
                    onClick={() => this.handleStateChange('invoiceRuleVisible', true)}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010509subMsg`)
                    .d('定义供应商用户在开具发票时的相关规则')}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-4') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010510', {
                    initialValue: settings['010510'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.finance.message.010510`)
                        .d('允许应付发票允差。')}
                    </Checkbox>
                  )}
                  {getFieldValue('010510') === 1 && (
                    <a
                      onClick={() => this.handleStateChange('toleranceRuleVisible', true)}
                      style={{ marginLeft: '8px' }}
                    >
                      {intl
                        .get(`spfm.configServer.view.finance.message.010501href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010510subMsg`)
                    .d('勾选表示允许PO总额和发票金额存在差异，点击明细可以设置允差。')}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-5') && (
              <>
                <Col span={24} className="sub-item-fields" style={{ display: 'none' }}>
                  {intl
                    .get(`spfm.configServer.view.finance.message.invoiceApprovalRules`)
                    .d('发票审批规则配置')}
                  <a
                    onClick={() => this.handleStateChange('invoiceApprovalVisible', true)}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010538and010539subMsg`)
                    .d('应收发票/应付发票的审批方式，根据维护的方式不同，在不同页面进行单据的审批')}
                  style={{ display: 'none' }}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-6') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010511`)
                    .d('SRM发票审核之后无需复核。')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010511']}
                  field="010511"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010511subMsg`)
                    .d('勾选表示应付发票审核之后自动复核，不需要人工复核。')}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-7') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010512`)
                    .d('SRM发票复核通过的同时执行导入ERP。')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010512']}
                  field="010512"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010512subMsg`)
                    .d(
                      '勾选表示在发票复核时，复核通过的同时执行将发票导入ERP操作，不勾选则需要用户在导入功能中单独执行导入操作。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-8') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010513`)
                    .d('SRM发票退回时直接退回至供应商。')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010513']}
                  field="010513"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010513subMsg`)
                    .d('勾选则表示直接退回至供应商维护；不勾选表示发票退回时，需要逐级退回。')}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-9') && (
              <>
                <Col
                  span={24}
                  className={classnames(styles['version-rule'], 'sub-item-fields')}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010517', {
                    initialValue: settings['010517'],
                  })(
                    <Checkbox onChange={(e) => this.handleResetErr(e)}>
                      {intl
                        .get(`spfm.configServer.view.message.010517`)
                        .d('启用SRM需导入SAP的发票行项目<=')}
                    </Checkbox>
                  )}
                  <Form layout="inline" className={classnames(styles['form-item'])}>
                    <Form.Item>
                      {getFieldDecorator('010541', {
                        initialValue: settings['010541'],
                        rules: [
                          {
                            required: getFieldValue('010517'),
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.message.sub.010517`)
                                .d('发票行项目行数'),
                            }),
                          },
                        ],
                      })(<InputNumber min={0} precision={0} disabled={!getFieldValue('010517')} />)}
                    </Form.Item>
                  </Form>
                  <span>{intl.get(`spfm.configServer.view.message.010541`).d('项')}</span>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010517subMsg`)
                    .d(
                      '勾选则表示当发票行项目>定义项时，则启用校验：发票行项目必须<=定义项；不勾选则表示发票行项目可超过定义项。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-10') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010518`)
                    .d('启用供应商扣款单无须审批')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010518']}
                  field="010518"
                  style={{ display: 'none' }}
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010518subMsg`)
                    .d('勾选则表示供应商扣款录入后，无须审批则自动状态变更为已审核。')}
                  style={{ display: 'none' }}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-11') && (
              <>
                <Col span={24} className={styles['version-rule']}>
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], 'sub-item-fields')}
                  >
                    <Form.Item
                      label={`${intl
                        .get(`spfm.configServer.view.finance.message.010523label`)
                        .d('发票金额扣减方式')}：`}
                    >
                      {getFieldDecorator('010523', {
                        initialValue: settings['010523'],
                      })(
                        <ValueList
                          textValue="ACCOUNT_DEDUCT"
                          // allowClear
                          lovCode="SECE.INVOICE_AMOUNT_METHOD"
                          style={{ width: '150px' }}
                          lazyLoad={false}
                          onChange={this.handleChange010523}
                        />
                      )}
                    </Form.Item>
                  </Form>
                </Col>
              </>
            )}
            {!configHideArr.includes('purInvoice-12') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010522`)
                    .d('网上发票含税金额(系统)和税额扣减扣款金额')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010522']}
                  field="010522"
                  disabled={deductionMethod === 'ACCOUNT_DEDUCT'}
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010522subMsg`)
                    .d(
                      '勾选则表示网上发票的含税金额（系统）和税额（系统）需要扣减完扣款金额和税额进行展示。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-13') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010540`)
                    .d('发票同步至ERP后,允许SRM进行退回应付发票。')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010540']}
                  field="010540"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010540subMsg`)
                    .d(
                      '勾选启用后,发票在成功导入ERP后,在SRM可通过退回应付发票功能进行发票取消,同时将发票退回状态回传ERP。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purInvoice-14') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {intl
                    .get(`spfm.configServer.view.finance.message.invoice.010506`)
                    .d('发票并单规则设置')}
                  <a
                    disabled={disabled010506}
                    onClick={() => this.handleStateChange2('docMergeRulesVisible', true, 'INVOICE')}
                    className="operate-item-link"
                  >
                    {intl.get('hzero.common.button.view').d('查看')}
                  </a>
                </Col>
              </>
            )}
            {!configHideArr.includes('purInvoice-15') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010546`)
                    .d('按并单规则自动拆分发票。')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010546']}
                  field="010546"
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010546subMsg`)
                    .d('若勾选不同并单规则的数据行，则根据并单规则自动生成多张新建状态的发票。')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purCheckTheInvoice',
        title: intl.get(`spfm.configServer.view.finance.message.checkTheInvoice`).d('发票检验'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.finance.message.checkTheInvoice`).d('发票检验')}
            </Col>
            {!configHideArr.includes('purCheckTheInvoice-1') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010514`)
                    .d('启用发票查验')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010514']}
                  onChange={this.handleChange010514}
                  field="010514"
                  otherComponnets={
                    form.getFieldValue('010514') ? (
                      <a
                        style={{ marginLeft: '20px' }}
                        onClick={() => this.handleOpenInvoiceRuleModal('AUDIT')}
                      >
                        {intl
                          .get(`spfm.configServer.view.finance.message.checkRuleConfig`)
                          .d('查验规则配置')}
                      </a>
                    ) : (
                      ''
                    )
                  }
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010514newSubTips`)
                    .d(
                      '当应用商店开启此服务或您对接自有查验服务商后，启用此功能可以通过【发票查验】、【创建&维护应付发票】功能进行税务发票的查验。'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purCheckTheInvoice-2') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010515`)
                    .d('允许供应商发票查验')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010515']}
                  disabled={!disabled010515}
                  field="010515"
                  otherComponnets={
                    form.getFieldValue('010515') ? (
                      <a
                        style={{ marginLeft: '20px' }}
                        onClick={() => this.handleOpenInvoiceRuleModal('RECEIVABLES')}
                      >
                        {intl
                          .get(`spfm.configServer.view.finance.message.checkRuleConfig`)
                          .d('查验规则配置')}
                      </a>
                    ) : (
                      ''
                    )
                  }
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010515newSubMsg`)
                    .d('启用后，供应商能进行发票查验。')}
                />
              </>
            )}
            {!configHideArr.includes('purCheckTheInvoice-3') && (
              <>
                <SubCheckBox
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010516`)
                    .d('应付发票审核启用发票查验')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010516']}
                  disabled={!disabled010516}
                  field="010516"
                  otherComponnets={
                    form.getFieldValue('010516') ? (
                      <a
                        style={{ marginLeft: '20px' }}
                        onClick={() => this.handleOpenInvoiceRuleModal('COPE')}
                      >
                        {intl
                          .get(`spfm.configServer.view.finance.message.checkRuleConfig`)
                          .d('查验规则配置')}
                      </a>
                    ) : (
                      ''
                    )
                  }
                />
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.finance.message.010516subMsg`)
                    .d('启用后，采购方可在应付发票审核界面进行税务发票批量查验。')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 5,
        href: 'purPayment',
        title: intl.get(`spfm.configServer.view.finance.message.payment`).d('付款'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.finance.message.payment`).d('付款')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', display: 'none' }}
            >
              {getFieldDecorator('010520', {
                initialValue: settings['010520'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.010521`)
                    .d('启用到票付款审批')}
                </Checkbox>
              )}
              {getFieldValue('010520') === 1 && (
                <Form.Item>
                  {getFieldDecorator('010521', {
                    initialValue: settings['010521'],
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.configServer.view.purchaseContract.message.010521`)
                            .d('启用到票付款审批'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      allowClear
                      lovCode="SFIN.PAYMENT_APPROVE_TYPE"
                      style={{ width: '150px' }}
                      lazyLoad={false}
                    />
                  )}
                </Form.Item>
              )}
            </Col>
            {/* <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.010521subMsg`)
                .d('勾选启用，则到票付款申请需在SRM进行审批，工作流审批需配合工作流定义使用。')}
            /> */}
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', display: 'none' }}
            >
              {getFieldDecorator('010526', {
                initialValue: settings['010526'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.010526`)
                    .d('启用预付款审批')}
                </Checkbox>
              )}
              {getFieldValue('010526') === 1 && (
                <Form.Item>
                  {getFieldDecorator('010527', {
                    initialValue: settings['010527'],
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.configServer.view.purchaseContract.message.010526`)
                            .d('启用预付款审批'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      allowClear
                      lovCode="SFIN.PAYMENT_APPROVE_TYPE"
                      style={{ width: '150px' }}
                      lazyLoad={false}
                    />
                  )}
                </Form.Item>
              )}
            </Col>
            {/* <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.010526subMsg`)
                .d('勾选启用，则预付款申请需在SRM进行审批，工作流审批需配合工作流定义使用。')}
            /> */}
            <SubCheckBox
              content={intl
                .get(`spfm.configServer.view.finance.message.010533`)
                .d('启用记账冻结供应商不允许付款')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010533']}
              field="010533"
            />
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.finance.message.010533subMsg`)
                .d('勾选启用，则记账冻结供应商无法进行预付款（预收款）及到票付款')}
            />
            <SubCheckBox
              content={intl
                .get(`spfm.configServer.view.finance.message.010542`)
                .d('启用付款申请审核通过的同时自动执行导入ERP')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010542']}
              field="010542"
            />
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.finance.message.010542subMsg`)
                .d(
                  '勾选启用，则在预付款(预收款)及到票付款申请审核通过的同时执行将付款申请导入ERP操作,不勾选则需要用户在导入功能中单独执行导入操作'
                )}
            />

            <SubCheckBox
              content={intl
                .get(`spfm.configServer.view.finance.message.010543`)
                .d('付款申请同步至ERP后，允许SRM进行退回付款申请')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010543']}
              field="010543"
            />
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.finance.message.010543subMsg`)
                .d(
                  '勾选启用后，已导入erp但未付款的付款申请,在SRM可通过【付款申请查询】功能进行退回,同时将付款申请取消状态回传ERP。'
                )}
            />
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purFinance">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.finance.message.finance`).d('财务')}：
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

        {docMergeRulesVisible && <DocMergeRulesModal {...docMergeRules} />}
        {onlyInvoiceRuleVisible && <OnlyInvoiceRule {...onlyInvoiceRuleProps} />}
        {billUpdateRuleVisible && <BillUpdateRule {...billUpdateRuleProps} />}
        {invoiceRuleVisible && <InvoiceRuleModal {...invoiceRuleProps} />}
        {toleranceRuleVisible && <ToleranceRuleModal {...toleranceRuleProps} />}
        {purBusCheckRulesVisible && <PurBusCheckRules {...purBusCheckRulesProps} />}
        {accountCheckingVisible && <AccountChecking {...accountCheckingRulesProps} />}
        {reconciliationSourceVisible && (
          <ReconciliationSourceModal {...reconciliationSourceProps} />
        )}
        {businessTypeVisible && <BusinessTypeModal {...businessTypeProps} />}
        {sourcePriceVisible && <SourcePrice {...sourcePriceProps} />}
        {billApprovalVisible && <BillApprovalRules {...billApprovalProps} />}
        {invoiceApprovalVisible && <InvoiceApprovalRules {...invoiceApprovalProps} />}
        {collaboarationModeVisible && <CollaboarationMode {...collaboarationModeProps} />}
      </Row>
    );
  }
}
