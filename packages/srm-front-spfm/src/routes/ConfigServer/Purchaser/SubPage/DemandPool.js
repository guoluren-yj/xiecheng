/*
 * 配置中心 - 需求池
 * @date: 2019-01-22
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form, Select } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import SubMessage from '../../components/SubMessage';
import styles from './index.less';

/**
 * 配置中心-需求池
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@Form.create({ fieldNameProp: null })
export default class DemandPool extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // dateRequired010902: props.settings['010901'] || false,
      dateRequired010904: props.settings['010904'] || false,
    };
    props.onRef(this);
  }

  // @Bind()
  // handlePRAVisible() {
  //   const { handleModal } = this.props;
  //   if (isFunction(handleModal)) {
  //     handleModal('purchaseRACVisible', true);
  //   }
  // }

  @Bind()
  handleStateChange(modalType) {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal(modalType, true);
    }
  }

  @Bind()
  handleShieldNeedsInfVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('shieldNeedsInfVisible', true);
    }
  }

  @Bind()
  handlePurchaserUpdateModalVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('purchaserUpdateModalVisible', true);
    }
  }

  @Bind()
  handleEnableAutomaticOrderCreationVisible() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('enableAutomaticOrderCreationVisible', true);
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      settings,
      enumMap,
      configHideArr = [],
    } = this.props;
    const { assignPurchasers = [], freightCategory = [] } = enumMap;
    const { dateRequired010904 } = this.state;
    const configList = [
      {
        key: 1,
        href: 'purDemandAutoSubmit',
        title: intl
          .get(`spfm.configServer.view.demandPool.message.demandAutoSubmit`)
          .d('采购申请提交'),
        component: (
          <Row>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.demandPool.message.demandAutoSubmit`)
                .d('采购申请提交')}
            </Col>
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('010914', {
                initialValue: settings['010914'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.demandPool.message.010914`)
                    .d('采购申请自动提交')}
                </Checkbox>
              )}
              {getFieldValue('010914') === 1 && (
                <a
                  onClick={() => this.handleStateChange('demandAutoSubmitVisible', true)}
                  className="operate-item-link"
                >
                  {intl.get(`spfm.configServer.view.demandPool.010501href`).d('进入定义列表')}
                </a>
              )}
            </Col>
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purReceiveMatch',
        title: intl.get(`spfm.configServer.view.demandPool.message.receiveMatch`).d('采购申请审批'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.demandPool.message.receiveMatch`).d('采购申请审批')}
            </Col>
            {/* <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010901', {
                initialValue: settings['010901'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.demandPool.message.010901`)
                    .d('启用SRM采购申请审批')}
                </Checkbox>
              )}
              {getFieldValue('010901') === 1 && (
                <Form.Item>
                  {getFieldDecorator('010902', {
                    initialValue: settings['010902'],
                    rules: [
                      {
                        required: dateRequired010902,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.configServer.view.demandPool.message.010901`)
                            .d('启用SRM采购申请审批'),
                        }),
                      },
                    ],
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear>
                      {approvalMethod.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              )}
              {getFieldValue('010901') === 1 && isString(getFieldValue('010902')) && (
                <a onClick={this.handlePRAVisible}>
                  {intl
                    .get(`spfm.configServer.view.demandPool.message.enterDefineList`)
                    .d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010901subMsg`)
                .d(
                  '启用SRM采购申请审批，则采购申请需在SRM通过功能或工作流完成审批，工作流审批需配合工作流定义使用。'
                )}
            /> */}
            {/* <SubCheckBox
              content={intl.get(`${demandPool}.message.010903`).d('采购申请回传ERP')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010903']}
              field="010903"
            /> */}
            <Col span={24} className="sub-item-fields">
              {getFieldDecorator('010903', {
                initialValue: settings['010903'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.demandPool.message.010903`)
                    .d('采购申请回传ERP')}
                </Checkbox>
              )}
              {getFieldValue('010903') === 1 && (
                <a
                  onClick={() => this.handleStateChange('billUpdateRuleVisible', true)}
                  className="operate-item-link"
                >
                  {intl.get(`spfm.configServer.view.demandPool.010501href`).d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010903subMsg`)
                .d('勾选回传，SRM采购申请及审批状态自动同步至ERP。')}
            />
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purNeedAllocate',
        title: intl.get(`spfm.configServer.view.message.needAllocate`).d('需求分配'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.needAllocate`).d('需求分配')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010904', {
                initialValue: settings['010904'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010904`).d('自动分配')}
                </Checkbox>
              )}
              {getFieldValue('010904') === 1 && (
                <Form.Item>
                  {getFieldDecorator('010907', {
                    initialValue: settings['010907'],
                    rules: [
                      {
                        required: dateRequired010904,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfm.configServer.view.message.010904`).d('自动分配'),
                        }),
                      },
                    ],
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear>
                      {assignPurchasers.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              )}
            </Col>
            {getFieldValue('010904') === 1 ? (
              <SubMessage
                content={intl
                  .get(`spfm.configServer.view.demandPool.message.0109042subMsg`)
                  .d(
                    '勾选自动分配，则可以支持基于物料品类或采购员分配规则，进行采购申请的自动分配'
                  )}
              />
            ) : (
              <SubMessage
                content={intl
                  .get(`spfm.configServer.view.demandPool.message.010904subMsg`)
                  .d('勾选自动分配，则将需求自动分配给需求申请单据中的采购员。')}
              />
            )}
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purNeedExecutorNew',
        title: intl
          .get(`spfm.configServer.view.message.needExecutorNew`)
          .d('是否启用申请转单根据需求执行人维度过滤'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.message.needExecutorNew`)
                .d('是否启用申请转单根据需求执行人维度过滤')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              <Row gutter={48}>
                <Col span={6}>
                  {getFieldDecorator('010908', {
                    initialValue: settings['010908'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.message.010908new`).d('申请转订单')}
                    </Checkbox>
                  )}
                </Col>
                <Col span={6}>
                  {getFieldDecorator('010916', {
                    initialValue: settings['010916'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.message.010916new`).d('申请转寻源')}
                    </Checkbox>
                  )}
                </Col>
                <Col span={6}>
                  {getFieldDecorator('010918', {
                    initialValue: settings['010918'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.message.010918`).d('申请转协议')}
                    </Checkbox>
                  )}
                </Col>
                <Col span={6}>
                  {getFieldDecorator('010919', {
                    initialValue: settings['010919'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.message.010919`).d('已分配申请')}
                    </Checkbox>
                  )}
                </Col>
              </Row>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010918subMsg`)
                .d('勾选对应的申请转单，则会根据需求执行人这个维度在对应的界面进行单据过滤。')}
            />
          </Row>
        ),
      },
      {
        key: 5,
        href: 'purExecutionStrategy',
        title: intl.get(`spfm.configServer.view.message.executionStrategy`).d('需求执行策略'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.executionStrategy`).d('需求执行策略')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010915', {
                initialValue: settings['010915'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010915`).d('是否启用需求执行策略')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010915subMsg`)
                .d(
                  '启用此配置，则采购申请提交时根据是否有参考价格去判断该采购申请转寻源还是订单，并控制此采购申请在对应的功能下进行流转'
                )}
            />
          </Row>
        ),
      },
      {
        key: 6,
        href: 'purShieldNeedsInf',
        title: intl.get(`spfm.configServer.view.message.shieldNeedsInf`).d('需求信息屏蔽'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.shieldNeedsInf`).d('需求信息屏蔽')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010909', {
                initialValue: settings['010909'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010909`).d('隐藏目录化需求供应商信息')}
                </Checkbox>
              )}
              {getFieldValue('010909') === 1 && (
                <a
                  onClick={() => this.handleShieldNeedsInfVisible('shieldNeedsInfVisible', true)}
                  className="operate-item-link"
                >
                  {intl.get(`spfm.configServer.view.demandPool.010501href`).d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010909subMsg`)
                .d(
                  '勾选并定义屏蔽规则后，所定义的角色在需求创建、需求取消、需求查询界面，来源为目录化商城的单据对应供应商字段将显示为***'
                )}
            />
          </Row>
        ),
      },
      {
        key: 7,
        href: 'purFreightCategory',
        title: intl.get(`spfm.configServer.view.message.freightCategory`).d('运费行项目类别配置'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.freightCategory`).d('运费行项目类别配置')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010912', {
                initialValue: settings['010912'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010912`).d('运费行项目类别设置')}
                </Checkbox>
              )}
              {getFieldValue('010912') === 1 && (
                <Form.Item>
                  {getFieldDecorator('010913', {
                    initialValue: settings['010913'],
                    rules: [
                      {
                        required: getFieldValue('010912') === 1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.configServer.view.message.010912`)
                            .d('运费行项目类别设置'),
                        }),
                      },
                    ],
                  })(
                    <Select showSearch style={{ width: '150px' }} allowClear>
                      {freightCategory.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010912subMsg`)
                .d(
                  '启用此功能后,电商运费类别若选择为运费单类类型,预占订单回传SRM/ERP时,运费行项目类别会展示当前维护类别'
                )}
            />
          </Row>
        ),
      },
      {
        key: 8,
        href: 'purPurchaserUpdate',
        title: intl.get(`spfm.configServer.view.message.purchaserUpdate`).d('需求变更'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.purchaserUpdate`).d('需求变更')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010910', {
                initialValue: settings['010910'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010910`).d('允许需求变更')}
                </Checkbox>
              )}
              {getFieldValue('010910') === 1 && (
                <a
                  onClick={() =>
                    this.handlePurchaserUpdateModalVisible('purchaserUpdateModalVisible', true)
                  }
                  className="operate-item-link"
                >
                  {intl.get(`spfm.configServer.view.demandPool.010501href`).d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010910subMsg`)
                .d(
                  '勾选允许需求变更，则来源为非目录化和电商的采购申请在采购方审批通过后方可变更。'
                )}
            />
            {/* <Col span={24}>
              {intl.get(`spfm.configServer.view.message.autoCreateConfig`).d('订单自动创建配置项')}
            </Col> */}
            {/* <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010911', {
                initialValue: settings['010911'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010911`).d('启用订单自动创建')}
                </Checkbox>
              )}
              {getFieldValue('010911') === 1 && (
                <a
                  onClick={() =>
                    this.handleEnableAutomaticOrderCreationVisible(
                      'enableAutomaticOrderCreationVisible',
                      true
                    )
                  }
                  className="operate-item-link"
                >
                  {intl.get(`spfm.configServer.view.demandPool.010501href`).d('进入定义列表')}
                </a>
              )}
            </Col> */}
            {/* <SubMessage
              content={intl
                .get(`spfm.configServer.view.demandPool.message.010910subMsg`)
                .d(
                  '勾选允许需求变更，则来源为非目录化和电商的采购申请在采购方审批通过后方可变更。'
                )}
            /> */}
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purDemandPoll">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.demandPool.message.0109`).d('需求池')}：
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
          {/* <Row className="sub-item">
            <Col span={24}>
              {intl.get(`${demandPool}.message.sourcingSelect`).d('寻源策略选择')}
            </Col>
            <SubCheckBox
              content={intl.get(`${demandPool}.message.010905`).d('沿用上次寻源策略')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010905']}
              field="010905"
            />
            <SubMessage
              content={intl
                .get(`${demandPool}.message.010905subMsg`)
                .d('勾选沿用上次寻源策略，则采购申请自动沿用该物料上次寻源所选择的寻源策略。')}
            />
            <SubCheckBox
              content={intl.get(`${demandPool}.message.010906`).d('依据物品分类')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['010906']}
              field="010906"
            />
            <SubMessage
              content={intl
                .get(`${demandPool}.message.010906subMsg`)
                .d('勾选并定义物品分类的寻源方式后，采购申请将自动选择对应的寻源方式。')}
            />
          </Row> */}
        </Col>
      </Row>
    );
  }
}
