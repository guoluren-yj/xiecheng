/*
 * SupplierManage - 配置中心-采购方-供应商管理
 * @date: 2018/09/11 14:51:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Row, Col, Form, Select } from 'hzero-ui';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import classnames from 'classnames';
import Checkbox from 'components/Checkbox';
import styles from './index.less';

import SubMessage from '../../components/SubMessage';

/**
 * 配置中心-采购方-供应商管理
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@withRouter
@Form.create({ fieldNameProp: null })
@connect(({ configServer }) => ({
  configServer,
}))
export default class SupplierManage extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    this.fetchEnuMap();
  }

  // 合格供应商申请值集
  @Bind()
  fetchEnuMap() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/init',
    });
  }

  @Bind()
  openTabTo(path) {
    this.props.history.push(path);
  }

  /**
   * 模态框的显示/隐藏
   */
  @Bind()
  handleModalVisible(visibleKey) {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal(visibleKey, true);
    }
  }

  // 判断时间从比至小
  @Bind()
  judgeLineNumber(rule, value, callback) {
    const { settings } = this.props;
    const dateFrom = settings['010005'];
    if (value < dateFrom) {
      callback(
        intl.get(`spfm.configServer.view.tip.dateFromError`).d('结束时间不能小于开始时间！')
      );
    } else {
      callback();
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      settings,
      configHideArr = [],
      configServer: { enumMap = {} },
    } = this.props;
    const { formPrint = [] } = enumMap;
    const configList = [
      {
        key: 1,
        href: 'purSupplierLifeConfig',
        title: intl.get(`spfm.configServer.view.button.supplierLifeConfig`).d('生命周期阶段配置'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.button.supplierLifeConfig`).d('生命周期阶段配置')}
              <a
                onClick={() => this.openTabTo('/spfm/config-server/supplier-life-config')}
                style={{
                  width: '40px',
                  height: '20px',
                  display: 'inline-block',
                  marginLeft: '16px',
                }}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </Col>
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purlifeCycleDimConfig',
        title: intl
          .get(`spfm.configServer.view.button.lifeCycleDimConfig`)
          .d('生命周期管控维度配置'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.button.lifeCycleDimConfig`)
                .d('生命周期管控维度配置')}
              <a
                onClick={() => this.openTabTo('/spfm/config-server/life-cycle-dim-config')}
                style={{
                  width: '40px',
                  height: '20px',
                  display: 'inline-block',
                  marginLeft: '16px',
                }}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </Col>
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purSupplierRiskControlConfig',
        title: intl
          .get(`spfm.configServer.view.button.supplierRiskControlConfig`)
          .d('供应商风险管控配置'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.button.supplierRiskControlConfig`)
                .d('供应商风险管控配置')}
            </Col>
            {/* {!configHideArr.includes('purSupplierRiskControlConfig-1') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010001', {
                    initialValue: settings['010001'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.message.010001label`)
                        .d('启用供应商加入监控功能')}
                    </Checkbox>
                  )}
                  {getFieldValue('010001') === 1 && (
                    <a onClick={() => this.handleModalVisible('supplierAddMonitorVisible')}>
                      {intl
                        .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.message.010001subMsg`)
                    .d('启用该功能，可在各功能下将供应商加入监控')}
                />
              </>
            )}
            {!configHideArr.includes('purSupplierRiskControlConfig-2') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010002', {
                    initialValue: settings['010002'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.message.010002label`)
                        .d('启用未加入监控企业的风险扫描功能')}
                    </Checkbox>
                  )}
                  {getFieldValue('010002') === 1 && (
                    <a onClick={() => this.handleModalVisible('riskScanVisible')}>
                      {intl
                        .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.message.010002subMsg`)
                    .d('启用该功能，未加入监控供应商进行风险扫描时扣除风险扫描额度')}
                />
              </>
            )} */}
            {!configHideArr.includes('purSupplierRiskControlConfig-3') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010011', {
                    initialValue: settings['010011'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.message.010011label`).d('启用合作条款')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.message.010011subMsg`)
                    .d('启用合作条款，供应商邀约，和填写调查表之前，必须同意条款才能进行下一步')}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purImportErp',
        title: intl.get(`spfm.configServer.view.button.importErp`).d('导入erp'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>{intl.get(`spfm.configServer.view.button.importErp`).d('导入erp')}</Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('010003', {
                initialValue: settings['010003'],
              })(
                <Checkbox>
                  {intl.get(`spfm.configServer.view.message.010003subMsg`).d('启用导入sap默认值')}
                </Checkbox>
              )}
              {getFieldValue('010003') === 1 && (
                <a onClick={() => this.handleModalVisible('importErpDefaultVisible')}>
                  {intl
                    .get(`spfm.configServer.view.common.message.definitionList`)
                    .d('进入定义列表')}
                </a>
              )}
            </Col>
          </Row>
        ),
      },
      {
        key: 6,
        href: 'purFormPrinting',
        title: intl.get(`spfm.configServer.view.message.formPrinting`).d('合格申请单打印'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.formPrinting`).d('合格申请单打印')}
            </Col>
            <Col span={24} className={classnames(styles['order-print'], 'sub-item-fields')}>
              <div className={styles.templateSelect}>
                <span style={{ lineHeight: '40px' }}>
                  {intl.get(`spfm.configServer.view.message.printTemplate`).d('申请单打印模板')}
                </span>
                <Form
                  layout="inline"
                  className={classnames(styles['form-item'], styles['margin-form-item'])}
                >
                  <Form.Item
                    label={intl.get(`spfm.configServer.view.button.selectTemplate`).d('选择模板')}
                  >
                    {getFieldDecorator('010010', {
                      initialValue: settings['010010'],
                    })(
                      <Select showSearch style={{ width: '120px' }}>
                        {formPrint.map((item) => (
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
          </Row>
        ),
      },
      {
        key: 7,
        href: 'purSupplierEvaluation',
        title: intl.get(`spfm.configServer.view.message.supplierEvaluation`).d('供应商考评'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.message.supplierEvaluation`).d('供应商考评')}
            </Col>
            <Col span={24}>
              <Form layout="inline" className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item
                  label={`${intl
                    .get(`spfm.configServer.view.message.resultRules`)
                    .d('考评评分通知')}`}
                >
                  {getFieldDecorator('010007', {
                    initialValue: settings['010007'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.button.shortMessage`).d('短信')}
                    </Checkbox>
                  )}
                  {getFieldDecorator('010008', {
                    initialValue: settings['010008'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.button.mailBox`).d('邮箱')}
                    </Checkbox>
                  )}
                  {getFieldDecorator('010009', {
                    initialValue: settings['010009'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.button.worktableToDo`).d('工作台待办')}
                    </Checkbox>
                  )}
                </Form.Item>
              </Form>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.message.010009subMsg`)
                .d(
                  '选择工作台，则评分人可在工作台待办中查询待评分的考评档案，选择短信/邮箱需要配合消息模板定义。'
                )}
            />
          </Row>
        ),
      },
      {
        key: 8,
        href: 'purSupplierFreezingControl',
        title: intl
          .get('spfm.configServer.view.message.supplierFreezingControl')
          .d('供应商记账冻结控制'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl
                .get('spfm.configServer.view.message.supplierFreezingControl')
                .d('供应商记账冻结控制')}
            </Col>
            <Col span={24}>
              <Form className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item
                  label={`${intl
                    .get(`spfm.configServer.view.message.businessDocument`)
                    .d('业务单据')}`}
                >
                  {getFieldDecorator('010010', {
                    initialValue: settings['010010'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.button.orders`).d('订单')}
                    </Checkbox>
                  )}
                  <span className="sub-right-message">
                    {intl
                      .get('spfm.configServer.view.tips.unableToOrderForFrozenVendor')
                      .d('若勾选，则无法对记账冻结的供应商下单')}
                  </span>
                  <br />
                  {getFieldDecorator('010011', {
                    initialValue: settings['010011'],
                  })(
                    <Checkbox>
                      {intl.get(`spfm.configServer.view.button.contract`).d('协议')}
                    </Checkbox>
                  )}
                  <span className="sub-right-message">
                    {intl
                      .get('spfm.configServer.view.tips.unableToSignProtocol')
                      .d('若勾选，则无法和记账冻结的供应商签署协议')}
                  </span>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        ),
      },
      {
        key: 9,
        href: 'purSupplierPartner',
        title: intl.get('spfm.configServer.view.message.supplierPartner').d('我的合作伙伴'),
        component: (
          <Row className="sub-item">
            <Col span={24} style={{ marginTop: '-10px' }}>
              {intl.get('spfm.configServer.view.message.supplierPartner').d('我的合作伙伴')}
            </Col>
            <Col span={24}>
              <Form className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item>
                  {getFieldDecorator('010013', {
                    initialValue: settings['010013'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.button.autoErp`)
                        .d('SRM平台供应商导入ERP后, 在SRM自动生成ERP供应商')}
                    </Checkbox>
                  )}
                </Form.Item>
              </Form>
            </Col>
          </Row>
        ),
      },
    ];
    return (
      <Row className="first-tab-content" id="purSslm">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.title.purchaser.sslm`).d('供应商管理')}:
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
          {
            // <Col span={24} className={styles['version-rule']}>
            //   <Form layout="inline" className={classnames(styles['form-item'], 'sub-item-fields')}>
            //     <Form.Item
            //       label={intl
            //         .get(`test`)
            //         .d('风险事件消息默认视图：')}
            //     >
            //       {getFieldDecorator('test', {
            //         initialValue: '日报视图',
            //       })(
            //         <Select showSearch style={{ width: '150px' }}>
            //           <Select.Option key={1} value='日报视图'>
            //              日报视图
            //           </Select.Option>
            //           <Select.Option key={2} value='详情视图'>
            //              详情视图
            //           </Select.Option>
            //         </Select>
            //       )}
            //     </Form.Item>
            //   </Form>
            // </Col>
            // <SubMessage
            //   content={intl.get(`test`).d('选择风险事件消息的默认展示视图')}
            // />
          }
        </Col>
      </Row>
    );
  }
}
