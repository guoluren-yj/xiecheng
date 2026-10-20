/*
 * 配置中心 - 质量
 * @date: 2019-11-26
 * @author: WT <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, InputNumber, Form } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { connect } from 'dva';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import SubMessage from '../../components/SubMessage';
import IncomingSearchModal from './IncomingSearchModal';
import styles from './index.less';

/**
 * 配置中心-质量
 * @extends {Component} - React.Component
 * @reactProps {Object} settings - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
@Form.create({ fieldNameProp: null })
@connect(({ configServer }) => ({
  configServer,
}))
export default class DemandPool extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      incomingSearchVisible: false, // 定义「引用质检单创建」查询条件
    };
    props.onRef(this);
  }

  componentDidMount() {}

  @Bind()
  handleStateChange() {
    const { handleModal } = this.props;
    if (isFunction(handleModal)) {
      handleModal('autoDeductNoteVisible', true);
    }
  }

  // 更改 state
  @Bind()
  handleStateVisible(param, value) {
    this.setState({ [param]: value });
  }

  // 手动设置表单参数
  @Bind()
  handleResetCheckBox(item, val) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      [item]: val,
    });
  }

  // 强制校验
  @Bind()
  handleClearError() {
    const {
      form: { validateFields },
    } = this.props;
    validateFields({ force: true });
  }

  // 重置错误
  @Bind()
  handleResetErr(e) {
    const {
      form: { setFields, setFieldsValue },
    } = this.props;
    if (e.target.checked === 0) {
      setFields({
        '010705': {
          value: null,
          errors: null,
        },
      });
    } else {
      setFieldsValue({ '010705': 0 });
    }
  }

  render() {
    const { incomingSearchVisible } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
      configHideArr = [],
      settings,
    } = this.props;
    const IncomingSearchProps = {
      visible: incomingSearchVisible,
      onState: this.handleStateVisible,
    };
    const configList = [
      {
        key: 1,
        href: 'purQualityRectification',
        title: intl
          .get(`spfm.configServer.view.quality.message.qualityRectification`)
          .d('质量整改单'),
        component: (
          <Row>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.quality.message.qualityRectification`)
                .d('质量整改单')}
            </Col>
            {!configHideArr.includes('purQualityRectification-1') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010703', {
                    initialValue: settings['010703'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.quality.message.010703`)
                        .d('展示部分质检单')}
                    </Checkbox>
                  )}
                  {getFieldValue('010703') === 1 && (
                    <a
                      onClick={() => this.handleStateVisible('incomingSearchVisible', true)}
                      className="operate-item-link"
                    >
                      {intl
                        .get(`spfm.configServer.view.quality.message.010703href`)
                        .d('定义查询条件')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.quality.message.010703subMsg`)
                    .d(
                      '引用质检单创建整改单界面默认展示全部已决策质检单，勾选后可基于质检单评估结果、决策结果定义可创建整改单的质检单'
                    )}
                />
              </>
            )}
          </Row>
        ),
      },
      {
        key: 2,
        href: 'purClaimForm',
        title: intl.get(`spfm.configServer.view.quality.message.claimForm`).d('索赔单'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.quality.message.claimForm`).d('索赔单')}
            </Col>
            {!configHideArr.includes('purClaimForm-1') && (
              <>
                <Col
                  span={24}
                  className={classnames(styles['version-rule'], 'sub-item-fields')}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010704', {
                    initialValue: settings['010704'],
                  })(
                    <Checkbox onChange={(e) => this.handleResetErr(e)}>
                      {intl
                        .get(`spfm.configServer.view.message.010704`)
                        .d('索赔要求反馈时间到期提醒，到期前')}
                    </Checkbox>
                  )}
                  <Form layout="inline" className={classnames(styles['form-item'])}>
                    <Form.Item>
                      {getFieldDecorator('010705', {
                        initialValue: settings['010705'],
                        rules: [
                          {
                            required: getFieldValue('010704'),
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.claimFeedback.timeout`)
                                .d('索赔要求反馈时间'),
                            }),
                          },
                        ],
                      })(<InputNumber min={0} precision={0} disabled={!getFieldValue('010704')} />)}
                    </Form.Item>
                  </Form>
                  <span>
                    {intl
                      .get(`spfm.configServer.view.message.010705`)
                      .d('天，发送系统消息/邮件提醒')}
                  </span>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.quality.message.010705subMsg`)
                    .d(
                      '勾选启用，可在索赔要求反馈时间到期或到期前发送系统消息及邮件提醒供应商及时反馈'
                    )}
                />
              </>
            )}
            {!configHideArr.includes('purClaimForm-2') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010701', {
                    initialValue: settings['010701'],
                  })(
                    <Checkbox>
                      {intl
                        .get(`spfm.configServer.view.edution.message.010701`)
                        .d('自动生成扣款单')}
                    </Checkbox>
                  )}
                  {getFieldValue('010701') === 1 && (
                    <a
                      onClick={() => this.handleStateChange('autoDeductNoteVisible', true)}
                      className="operate-item-link"
                    >
                      {intl
                        .get(`spfm.configServer.view.quality.message.010701href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.quality.message.010701subMsg`)
                    .d('已确认状态索赔单，可基于“费用处理方式”定义是否自动新建、提交扣款单')}
                />
              </>
            )}
          </Row>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Row className="tab-content" id="purQuality">
          <Col span={3}>
            <span className="label-col">
              {intl.get(`spfm.configServer.view.quality.message.quality`).d('质量')}：
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
        {incomingSearchVisible && <IncomingSearchModal {...IncomingSearchProps} />}
      </React.Fragment>
    );
  }
}
