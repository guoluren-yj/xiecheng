/**
 * SourceManage - 配置中心-采购方-寻源
 * @date: 2019 10/22
 * @author: jing.chen05@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Select } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import classnames from 'classnames';
import Checkbox from 'components/Checkbox';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const sourceManagePrompt = 'spfm.configServer.view.sourceManage';

/**
 * 配置中心-采购方-寻源
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@withRouter
@connect(({ configServer }) => ({
  configServer,
}))
@Form.create({ fieldNameProp: null })
export default class SourceManage extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
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

  /**
   * 清空手工创建“价格库”审批方式
   */
  @Bind()
  handCreatePriceWay(data) {
    const {
      form: { setFieldsValue },
    } = this.props;
    if (data.target.value) {
      setFieldsValue({ '011113': 'NONE' });
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      configServer: {
        enumMap: { createPriceWay, evaluateClarifyRule = [], itemGenerateRuleMap = [] } = {},
      },
      settings,
      sourcePriceLibFlag,
      configHideArr = [],
    } = this.props;
    const configList = [
      {
        key: 1,
        href: 'purMergeSource',
        title: intl.get(`${sourceManagePrompt}.message.mergeSource`).d('申请转寻源'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`${sourceManagePrompt}.message.mergeSource`).d('申请转寻源')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginBottom: '24px' }}
            >
              {intl.get(`${sourceManagePrompt}.message.mergeSourceSet`).d('申请转寻源并单规则定义')}
              <a onClick={() => this.handleModalVisible('mergeSourceSetVisible')}>
                {intl.get(`${sourceManagePrompt}.message.mergeSourceList`).d('进入定义列表')}
              </a>
            </Col>
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purSourceMatter',
        title: intl.get(`${sourceManagePrompt}.message.sourceMatter`).d('寻源事项说明配置'),
        component: (
          <Row style={{ marginBottom: '24px' }}>
            <Col span={24} className={classnames(styles['flex-form-item'])}>
              {intl.get(`${sourceManagePrompt}.message.sourceMatter`).d('寻源事项说明配置')}
              <a onClick={() => this.handleModalVisible('sourceMatterVisible')}>
                {intl.get(`${sourceManagePrompt}.message.sourceMatterList`).d('进入定义列表')}
              </a>
            </Col>
            <Col span={24} className={styles.subMsg011101}>
              {intl
                .get(`${sourceManagePrompt}.message.011117subMsg`)
                .d('用于配置供应商参与寻源时是否必须阅读寻源事项须知及须知内容')}
            </Col>
          </Row>
        ),
      },
      {
        key: 3,
        href: 'purSourceNoMaterial',
        title: intl.get(`${sourceManagePrompt}.message.sourceNoMaterial`).d('无物料编码寻源配置'),
        component: (
          <Row>
            <Col span={24} className={classnames(styles['flex-form-item'])}>
              {intl.get(`${sourceManagePrompt}.message.sourceNoMaterial`).d('无物料编码寻源配置')}
            </Col>
            <Col span={24} className={styles.subMsg011101}>
              {intl
                .get(`${sourceManagePrompt}.message.011101subMsg`)
                .d('用于配置无物料寻源在核价和定标节点能否补充或创建物品编码')}
            </Col>
            <Col span={24} className={styles.subLabel011101} style={{ marginBottom: '8px' }}>
              <FormItem
                label={intl.get(`${sourceManagePrompt}.message.checkPriceLabel`).d('核价')}
                className={styles.supplierQuotation}
              >
                {getFieldDecorator('011101', {
                  initialValue: isUndefined(settings['011101'])
                    ? '0'
                    : settings['011101'].toString(),
                })(
                  <Select style={{ width: 150 }}>
                    {itemGenerateRuleMap &&
                      itemGenerateRuleMap.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={24} className={styles.subLabel011101}>
              <FormItem
                label={intl.get(`${sourceManagePrompt}.message.calibrationLabel`).d('定标')}
                className={styles.supplierQuotation}
              >
                {getFieldDecorator('011118', {
                  initialValue: isUndefined(settings['011118'])
                    ? '0'
                    : settings['011118'].toString(),
                })(
                  <Select style={{ width: 150 }}>
                    {itemGenerateRuleMap &&
                      itemGenerateRuleMap.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        ),
      },
      {
        key: 4,
        href: 'purPriceLibConfig',
        title: intl.get(`${sourceManagePrompt}.message.priceLibConfig`).d('价格库价格来源配置'),
        component: (
          <Row>
            {sourcePriceLibFlag ? (
              <React.Fragment>
                <Col span={24}>
                  {intl.get(`${sourceManagePrompt}.message.priceLibConfig`).d('价格库价格来源配置')}
                </Col>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginBottom: '24px' }}
                >
                  {getFieldDecorator('011102', {
                    initialValue: settings['011102'],
                  })(
                    <Checkbox>
                      {intl.get(`${sourceManagePrompt}.message.syncSourceResult`).d('同步寻源结果')}
                    </Checkbox>
                  )}
                  {getFieldDecorator('011103', {
                    initialValue: settings['011103'],
                  })(
                    <Checkbox onChange={(data) => this.handCreatePriceWay(data)}>
                      {intl.get(`${sourceManagePrompt}.message.manualCreate`).d('手工创建')}
                    </Checkbox>
                  )}
                  {getFieldDecorator('011104', {
                    initialValue: settings['011104'],
                  })(
                    <Checkbox>
                      {intl.get(`${sourceManagePrompt}.message.syncConPrice`).d('同步合同价格')}
                    </Checkbox>
                  )}
                  {getFieldDecorator('011105', {
                    initialValue: settings['011105'],
                  })(
                    <Checkbox>
                      {intl.get(`${sourceManagePrompt}.message.syncOrderPrice`).d('同步订单价格')}
                    </Checkbox>
                  )}
                </Col>
              </React.Fragment>
            ) : (
              ''
            )}
          </Row>
        ),
      },
      {
        key: 5,
        href: 'purCreatePriceWay',
        title: intl
          .get(`${sourceManagePrompt}.message.createPriceWay`)
          .d('手工创建“价格库”审批方式'),
        component: (
          <Row>
            {sourcePriceLibFlag ? (
              <React.Fragment>
                <Col span={24}>
                  {intl
                    .get(`${sourceManagePrompt}.message.createPriceWay`)
                    .d('手工创建“价格库”审批方式')}
                </Col>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginBottom: '24px' }}
                >
                  {getFieldDecorator('011113', {
                    initialValue: isUndefined(settings['011113']) ? 'NONE' : settings['011113'],
                  })(
                    <Select style={{ width: 180 }} disabled={!getFieldValue('011103')}>
                      {createPriceWay &&
                        createPriceWay.map((item) => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Col>
              </React.Fragment>
            ) : (
              ''
            )}
          </Row>
        ),
      },
      {
        key: 6,
        href: 'purReslutAutoSync',
        title: intl
          .get(`${sourceManagePrompt}.message.reslutAutoSync`)
          .d('寻源结果自动同步到“价格信息导入”功能'),
        component: (
          <Row style={{ marginBottom: '24px' }}>
            {sourcePriceLibFlag ? (
              <React.Fragment>
                <Col span={24}>
                  {getFieldDecorator('011114', {
                    initialValue: isUndefined(settings['011114']) ? 1 : settings['011114'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`${sourceManagePrompt}.message.reslutAutoSync`)
                        .d('寻源结果自动同步到“价格信息导入”功能')}
                    </Checkbox>
                  )}
                </Col>
              </React.Fragment>
            ) : (
              ''
            )}
          </Row>
        ),
      },
      {
        key: 7,
        href: 'purAllChangeInfo',
        title: intl
          .get(`${sourceManagePrompt}.message.allChangeInfo`)
          .d('允许在“价格信息导入”功能中，将价格信息引用到其它组织，并导入erp'),
        component: (
          <Row>
            {sourcePriceLibFlag ? (
              <React.Fragment>
                <Col span={24} style={{ marginBottom: '24px' }}>
                  {getFieldDecorator('011115', {
                    initialValue: settings['011115'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`${sourceManagePrompt}.message.allChangeInfo`)
                        .d('允许在“价格信息导入”功能中，将价格信息引用到其它组织，并导入erp')}
                    </Checkbox>
                  )}
                </Col>
              </React.Fragment>
            ) : (
              ''
            )}
          </Row>
        ),
      },
      {
        key: 8,
        href: 'pur011107label',
        title: intl
          .get(`${sourceManagePrompt}.message.011107label`)
          .d('开启“供应商IP地址校验”功能'),
        component: (
          <Row>
            <Col span={24}>
              {getFieldDecorator('011107', {
                initialValue: settings['011107'],
              })(
                <Checkbox>
                  {intl
                    .get(`${sourceManagePrompt}.message.011107label`)
                    .d('开启“供应商IP地址校验”功能')}
                </Checkbox>
              )}
            </Col>
          </Row>
        ),
      },
      {
        key: 9,
        href: 'purExpertScoring',
        title: intl.get(`${sourceManagePrompt}.message.expertScoring`).d('专家评分'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl.get(`${sourceManagePrompt}.message.expertScoring`).d('专家评分')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('011106', {
                initialValue: settings['011106'],
              })(
                <Checkbox>
                  {intl.get(`${sourceManagePrompt}.message.reScoring`).d('启用全部重新评分')}
                </Checkbox>
              )}
            </Col>
          </Row>
        ),
      },
      {
        key: 10,
        href: 'purClarification',
        title: intl.get(`${sourceManagePrompt}.message.clarification`).d('澄清答疑'),
        component: (
          <Row className="sub-item" style={{ marginTop: '-10px' }}>
            <Col span={24}>
              {intl.get(`${sourceManagePrompt}.message.clarification`).d('澄清答疑')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginBottom: '24px' }}
            >
              <FormItem
                className={styles.clarification}
                {...formItemLayout}
                label={intl
                  .get(`${sourceManagePrompt}.message.evaluateClarifyRule`)
                  .d('评审澄清规则')}
              >
                {getFieldDecorator('011117', {
                  initialValue: isUndefined(settings['011117'])
                    ? 'NEED_SUMMAY'
                    : settings['011117'],
                })(
                  <Select style={{ width: 150 }}>
                    {evaluateClarifyRule.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purSourceManage">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`${sourceManagePrompt}.message.title`).d('寻源')}:
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
      </Row>
    );
  }
}
