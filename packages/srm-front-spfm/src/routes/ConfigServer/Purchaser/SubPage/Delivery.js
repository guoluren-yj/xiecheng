/*
 * 配置中心-采购方-送货单
 * @date: 2018/10/09 14:56:50
 * @author: Liu zhaohui <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Select, Form } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import SubMessage from '../../components/SubMessage';
import SubCheckBox from '../../components/SubCheckBox';
import MergeRuleModal from './MergeRuleModal';
import DeliverClosedModal from './DeliverClosedModal';
import ApprovalRulesModal from './ApprovalRulesModal';
import styles from './index.less';

// const RadioGroup = Radio.Group;
const deliveryPrompt = 'spfm.configServer.view.delivery.message';

/**
 * 配置中心-采购方-送货单
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@Form.create({ fieldNameProp: null })
export default class Delivery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      singleRuleVisible: false,
      approvalRulesVisible: false,
      // openDeliverCreateTimeLimiteFlag: false,
      // disabled010404: props.settings['010404'] === 1 || false,
      // dateRequired010309: props.settings['010309'] || false,
    };
    props.onRef(this);
  }

  // componentDidMount() {
  //   const { settings } = this.props;
  //   this.setState({ openDeliverCreateTimeLimiteFlag: !!Number(settings['010299']) });
  // }

  @Bind()
  handleSingleRule() {
    this.setState({ singleRuleVisible: true });
  }

  // @Bind()
  // handleChange010299(e) {
  //   const { form } = this.props;
  //   this.setState(
  //     {
  //       openDeliverCreateTimeLimiteFlag: !e.target.value,
  //     },
  //     () => {
  //       form.validateFields({ force: true });
  //     }
  //   );
  // }

  @Bind()
  handleChangeDeliveryApproval() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ '010303': 0 });
  }

  /**
   * erp回传checkbox改变回调
   */
  @Bind()
  handleChange010305() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ '010307': 0 });
  }

  @Bind()
  handleChange010308() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ '010311': 0 });
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

  render() {
    const {
      singleRuleVisible,
      deliverClosedVisible,
      // disabled010404,
      // openDeliverCreateTimeLimiteFlag,
      approvalRulesVisible,
    } = this.state;
    const {
      settings,
      enumMap,
      deliverPrint = [],
      configHideArr = [],
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { mergeRules } = enumMap;
    const singleRuleProps = {
      visible: singleRuleVisible,
      handleModal: this.handleStateVisible,
    };
    const approvalRulesProps = {
      settings,
      visible: approvalRulesVisible,
      handleModal: this.handleStateVisible,
    };
    const deliverClosedProps = {
      enumMap,
      visible: deliverClosedVisible,
      handleModal: this.handleStateVisible,
    };
    const configList = [
      {
        key: 1,
        href: 'purDeliveryRule',
        title: intl.get(`${deliveryPrompt}.singleRule`).d('并单规则'),
        component: (
          <Row>
            <Col span={24}>{intl.get(`${deliveryPrompt}.singleRule`).d('并单规则')}</Col>
            {!configHideArr.includes('purDeliveryRule-1') && (
              <>
                <Col span={24} className={styles['version-rule']}>
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], 'sub-item-fields')}
                  >
                    <Form.Item
                      label={`${intl
                        .get(`${deliveryPrompt}.010301label`)
                        .d('送货单创建并单规则定义')}：`}
                    >
                      {getFieldDecorator('010301', {
                        initialValue: settings['010301'],
                      })(
                        <Select showSearch style={{ width: '150px' }} allowClear>
                          {(mergeRules || []).map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Form>
                  {getFieldValue('010301') === 'CUSTOMIZE' && (
                    <a onClick={() => this.handleSingleRule()}>
                      {intl.get(`${deliveryPrompt}.010301href`).d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`${deliveryPrompt}.010301subMsg`)
                    .d('供应商创建送货单时，会根据所配置的规则判断是否可以合并生成同一张送货单。')}
                />
              </>
            )}
            {!configHideArr.includes('purDeliveryRule-2') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010312', {
                    initialValue: settings['010312'],
                  })(
                    <Checkbox>
                      {intl.get(`${deliveryPrompt}.010312label`).d('按并单规则自动合并送货单')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`${deliveryPrompt}.010312subMsg`)
                    .d('若勾选不同并单规则的单据，则根据并单规则自动生成多张送货单')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purDeliverPrint',
        title: intl.get(`${deliveryPrompt}.deliverPrint`).d('送货单打印'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${deliveryPrompt}.deliverPrint`).d('送货单打印')}</Col>
            <Col span={24} className={classnames(styles['order-print'], 'sub-item-fields')}>
              <div className={styles.templateSelect}>
                <span style={{ lineHeight: '40px' }}>
                  {intl.get(`${deliveryPrompt}.deliverPrintTemplate`).d('送货单打印模板')}
                </span>
                <Form
                  layout="inline"
                  className={classnames(styles['form-item'], styles['margin-form-item'])}
                >
                  <Form.Item label={intl.get(`${deliveryPrompt}.010309abel`).d('选择模板')}>
                    {getFieldDecorator('010309', {
                      initialValue: settings['010309'] || 'STD',
                      rules: [
                        {
                          required: this.state.dateRequired010309,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${deliveryPrompt}.010309abel`).d('选择模板'),
                          }),
                        },
                      ],
                      // TODO 下面的disabled有数据时去掉
                    })(
                      <Select showSearch style={{ width: '150px' }} allowClear>
                        {deliverPrint.length > 0 &&
                          (deliverPrint || []).map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                </Form>
              </div>
            </Col>
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010309subMsg`)
                .d('送货单打印将根据所选择的模板样式生成。')}
            />
          </Row>
        ),
      },
      // {
      //   key: 3,
      //   href: 'purDeliverCancel',
      //   title: intl.get(`${deliveryPrompt}.deliverCancel`).d('送货单取消'),
      //   component: (
      //     <Row className="sub-item">
      //       <Col span={24}>{intl.get(`${deliveryPrompt}.deliverCancel`).d('送货单取消')}</Col>
      //       <SubCheckBox
      //         disabled
      //         content={intl.get(`${deliveryPrompt}.010310`).d('可按行取消送货单')}
      //         getFieldDecorator={getFieldDecorator}
      //         initialValue={settings['010310']}
      //         field="010310"
      //       />
      //       <SubMessage
      //         content={intl.get(`${deliveryPrompt}.010310subMsg`).d('勾选后，可以按行取消送货单。')}
      //       />
      //     </Row>
      //   ),
      // },
      {
        key: 4,
        href: 'purDeliverClosed',
        title: intl.get(`${deliveryPrompt}.deliverClosed`).d('送货单关闭'),
        component: (
          <Row className="sub-item">
            <Col span={24}>{intl.get(`${deliveryPrompt}.deliverClosed`).d('送货单关闭')}</Col>
            <Col span={24}>
              <Row>
                <SubCheckBox
                  content={intl.get(`${deliveryPrompt}.010308`).d('送货单单次接收后自动关闭')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010308']}
                  field="010308"
                  onChange={this.handleChange010308}
                  span={8}
                />
                <SubCheckBox
                  content={intl.get(`${deliveryPrompt}.010311`).d('冲销后允许关闭送货单')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['010311']}
                  field="010311"
                  span={8}
                  disabled={!getFieldValue('010308')}
                />
                {getFieldValue('010308') === 1 && (
                  <a
                    onClick={() => this.handleStateVisible('deliverClosedVisible', true)}
                    className="operate-item-link"
                  >
                    {intl
                      .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                      .d('进入定义列表')}
                  </a>
                )}
              </Row>
            </Col>
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010308subMsg`)
                .d('勾选自动关闭，则送货单行首次匹配接收事务后，自动关闭，无法再次匹配接收事务。')}
            />
          </Row>
        ),
      },
      // {
      //   key: 5,
      //   href: 'purDeliverApprovalRule',
      //   title: intl.get(`${deliveryPrompt}.approvalRule`).d('送货单审批规则'),
      //   component: (
      //     <Row className="sub-item">
      //       <Col span={24}>{intl.get(`${deliveryPrompt}.approvalRule`).d('送货单审批规则')}</Col>
      //       <Col span={24} className="sub-item-fields">
      //         {intl.get(`${deliveryPrompt}.approvalRuleDefinition`).d('送货单审批规则定义')}：
      //         <a onClick={() => this.handleStateVisible('approvalRulesVisible', true)}>
      //           {intl.get(`${deliveryPrompt}.010301href`).d('进入定义列表')}
      //         </a>
      //       </Col>
      //     </Row>
      //   ),
      // },
    ];
    return (
      <Row className="tab-content" id="purDelivery">
        <Col span={3}>
          <span className="label-col">{intl.get(`${deliveryPrompt}.deliver`).d('送货单')}：</span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
          {/* <Row className="sub-item">
            <Col span={24}>{intl.get(`${deliveryPrompt}.deliverTime`).d('送货时间')}</Col>
            <Col
              span={24}
              className={classnames(
                styles['order-print'],
                'sub-item-fields',
                styles['version-rule']
              )}
              style={{ lineHeight: '40px' }}
            >
              <Form layout="inline" className={styles['margin-form-item']}>
                <Form.Item>
                  {getFieldDecorator('010299', {
                    initialValue: settings['010299'],
                  })(
                    <Checkbox onChange={this.handleChange010299}>
                      {intl
                        .get(`spfm.configServer.view.purchaseContract.message.010300label`)
                        .d('启用送货单创建时间限制')}
                    </Checkbox>
                  )}
                </Form.Item>
                <Form.Item className={classnames(styles['input-num'])}>
                  {intl.get(`${deliveryPrompt}.010300subMsg.head`).d('需求日期前')}
                  {getFieldDecorator('010300', {
                    initialValue: settings['010300'] || 0,
                    rules: [
                      {
                        required: openDeliverCreateTimeLimiteFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${deliveryPrompt}.010300subMsg.head`).d('需求日期前'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      disabled={!openDeliverCreateTimeLimiteFlag}
                      precision={0}
                      min={0}
                    />
                  )}
                  {intl.get(`${deliveryPrompt}.010300tail`).d('天可创建送货单')}
                </Form.Item>
              </Form>
            </Col>
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010300subMsg`)
                .d('启用后限制供应商在规定日期内才可以创建送货单')}
            />
          </Row> */}
          {/* <Row className="sub-item">
            <Col span={24}>{intl.get(`${deliveryPrompt}.deliverApproval`).d('送货单审批')}</Col>
            <SubCheckBox
              content={intl.get(`${deliveryPrompt}.010302`).d('启用送货单审批')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010302']}
              field="010302"
              onChange={this.handleChangeDeliveryApproval}
            />
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010302subMsg`)
                .d('勾选启用审批，则供应商提交送货单后需要采购方审批。')}
            />
            <SubCheckBox
              content={intl.get(`${deliveryPrompt}.010303`).d('启用送货单复审批')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010303']}
              field="010303"
              disabled={!getFieldValue('010302')}
            />
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010303subMsg`)
                .d('勾选启用复审，则审批通过后还需复审。')}
            />
          </Row> */}
          {/* <Row className="sub-item">
            <Col span={24}>{intl.get(`${deliveryPrompt}.deliverReturn`).d('送货单回传')}</Col>
            <Col span={24}>
              <Row>
                <SubCheckBox
                  content={intl.get(`${deliveryPrompt}.010305`).d('送货单提交回传ERP')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={disabled010404 ? 0 : settings['010305']}
                  field="010305"
                  span={8}
                  onChange={this.handleChange010305}
                  disabled={disabled010404}
                />
                <SubCheckBox
                  content={intl.get(`${deliveryPrompt}.010307`).d('送货单取消/关闭回传ERP')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={disabled010404 ? 0 : settings['010307']}
                  field="010307"
                  span={12}
                  disabled={!getFieldValue(disabled010404 || '010305')}
                />
              </Row>
            </Col>
            <SubMessage
              content={intl
                .get(`${deliveryPrompt}.010306subMsg`)
                .d('勾选回传，则送货单提交/取消后会回传ERP。')}
            />
          </Row> */}
        </Col>
        {singleRuleVisible && <MergeRuleModal {...singleRuleProps} />}
        {deliverClosedVisible && <DeliverClosedModal {...deliverClosedProps} />}
        {approvalRulesVisible && <ApprovalRulesModal {...approvalRulesProps} />}
      </Row>
    );
  }
}
