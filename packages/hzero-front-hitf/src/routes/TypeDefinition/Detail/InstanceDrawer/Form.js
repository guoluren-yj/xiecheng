/**
 * InstanceForm - 实例配置表单
 * @date: 2019/8/26
 * @author: hulingfangzi <lingfangzi.hu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'hzero-front/lib/components/Switch';
import Lov from 'hzero-front/lib/components/Lov';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'hzero-front/lib/utils/intl';
import { FORM_COL_2_LAYOUT, MODAL_FORM_ITEM_LAYOUT } from 'hzero-front/lib/utils/constants';

import MappingClassModal from '@/components/MappingClassModal';
import getServiceLang from '@/langs/serviceLang';

const FormItem = Form.Item;

/**
 * 实例配置表单
 * @extends {Component} - React.Component
 * @reactProps {Object} instanceDetail - 实例详情
 * @reactProps {Function} onRef - 绑定元素
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InstanceForm extends PureComponent {
  state = {
    currentCode: '',
    isShowModal: false,
  };

  /**
   * 获取映射类内容
   */
  @Bind()
  getCurrentCode() {
    const { currentCode } = this.state;
    const { mappingClass } = this.props.instanceDetail;
    return currentCode || mappingClass;
  }

  /**
   * 显示映射类弹窗
   */
  @Bind()
  handleOpenMappingClassModal() {
    const { instanceDetail = {}, onFetchMappingClass = () => {} } = this.props;
    const { applicationInstId, mappingClass } = instanceDetail;
    const { currentCode } = this.state;
    const params = applicationInstId ? { applicationInstId } : {};
    let code = '';
    if (currentCode) {
      code = currentCode;
    } else if (mappingClass) {
      code = mappingClass;
    } else {
      onFetchMappingClass(params).then((res) => {
        if (res) {
          this.setState({
            currentCode: res.template,
            isShowModal: true,
          });
        }
      });
    }
    this.setState({
      currentCode: code,
      isShowModal: true,
    });
  }

  /**
   * 关闭映射类弹窗
   */
  @Bind()
  handleCloseMappingClassModal(value) {
    this.setState({
      isShowModal: false,
      currentCode: value,
    });
  }

  /**
   * 测试映射类
   * @param {string} value - 映射类代码
   */
  @Bind()
  handleTestMappingClass(value, cb = (e) => e) {
    const {
      onTestMappingClass = () => {},
      instanceDetail = {},
      fetchMappingClassLoading,
      testMappingClassLoading,
    } = this.props;
    const { applicationInstId = null } = instanceDetail;
    this.setState({
      currentCode: value,
    });
    if (fetchMappingClassLoading || testMappingClassLoading) return;
    onTestMappingClass(applicationInstId, value).then((res) => {
      if (res) {
        notification.success();
        cb(res);
      }
    });
  }

  render() {
    const { currentCode, isShowModal } = this.state;
    const {
      form: { getFieldDecorator, setFieldsValue },
      instanceDetail = {},
      isCreate,
      tenantId,
      composePolicy,
      fetchMappingClassLoading,
      testMappingClassLoading,
      onOpenFieldMappingDrawer = () => {},
      onOpenDataMappingDrawer = () => {},
    } = this.props;
    const {
      interfaceName,
      interfaceCode,
      weight,
      remark,
      enabledFlag,
      instInterfaceId,
      orderSeq,
    } = instanceDetail;
    return (
      <>
        <Form>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get('hitf.typeDefinition.model.typeDefinition.instance.code')
                  .d('实例接口代码')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('instInterfaceId', {
                  initialValue: instInterfaceId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hitf.typeDefinition.model.typeDefinition.instance.code')
                          .d('实例接口代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HITF.COMPOSE_INST_INTERFACE"
                    disabled={!isCreate}
                    textValue={interfaceCode}
                    textField="interfaceCode"
                    queryParams={{ tenantId }}
                    onChange={(val, record) => {
                      setFieldsValue({ interfaceName: record.interfaceName });
                    }}
                  />
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get('hitf.typeDefinition.model.typeDefinition.instance.name')
                  .d('实例接口名称')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('interfaceName', {
                  initialValue: interfaceName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hitf.typeDefinition.model.typeDefinition.instance.name')
                          .d('实例接口名称'),
                      }),
                    },
                  ],
                })(<Input disabled={!isCreate} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              {composePolicy === 'WEIGHT' ? (
                <FormItem
                  label={intl
                    .get('hitf.typeDefinition.model.typeDefinition.instance.weight')
                    .d('权重')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('weight', {
                    initialValue: weight,
                    rules: [
                      {
                        pattern: /^[1-9]\d*$/,
                        message: intl
                          .get('hitf.typeDefinition.model.typeDefinition.number.warning')
                          .d('请输入正整数'),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              ) : (
                <FormItem
                  label={intl.get('hzero.common.priority').d('优先级')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: orderSeq,
                    rules: [
                      {
                        pattern: /^[1-9]\d*$/,
                        message: intl
                          .get('hitf.typeDefinition.model.typeDefinition.number.warning')
                          .d('请输入正整数'),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              )}
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get('hzero.common.explain').d('说明')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('remark', {
                  initialValue: remark,
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get('hzero.common.status').d('状态')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('enabledFlag', {
                  initialValue: isCreate ? 1 : enabledFlag,
                })(<Switch />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get('hitf.typeDefinition.model.typeDefinition.instance.class')
                  .d('映射类')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={this.handleOpenMappingClassModal}>
                  {intl
                    .get('hitf.typeDefinition.view.message.title.detail.mapping.class')
                    .d('查看映射类详情')}
                </a>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={getServiceLang('MAINTAIN_REQUEST_MAPPING')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={() => onOpenFieldMappingDrawer('REQUEST')} disabled={isCreate}>
                  {getServiceLang('MAINTAIN_REQUEST_MAPPING')}
                </a>
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={getServiceLang('MAINTAIN_RESPONSE_MAPPING')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={() => onOpenFieldMappingDrawer('RESPONSE')} disabled={isCreate}>
                  {getServiceLang('MAINTAIN_RESPONSE_MAPPING')}
                </a>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={getServiceLang('MAINTAIN_REQUEST_DATA_MAPPING')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={() => onOpenDataMappingDrawer('REQUEST')} disabled={isCreate}>
                  {getServiceLang('MAINTAIN_REQUEST_DATA_MAPPING')}
                </a>
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={getServiceLang('MAINTAIN_RESPONSE_DATA_MAPPING')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={() => onOpenDataMappingDrawer('RESPONSE')} disabled={isCreate}>
                  {getServiceLang('MAINTAIN_RESPONSE_DATA_MAPPING')}
                </a>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <MappingClassModal
          data={currentCode}
          loading={fetchMappingClassLoading}
          testLoading={testMappingClassLoading}
          visible={isShowModal}
          onCancel={this.handleCloseMappingClassModal}
          onTest={this.handleTestMappingClass}
        />
      </>
    );
  }
}
