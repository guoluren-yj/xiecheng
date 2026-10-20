import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Row, Col, Select, notification } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import { queryTL } from 'hzero-front/lib/services/api';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import { getResponse } from 'hzero-front/lib/utils/utils';

const { TextArea } = Input;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * Form.Item 组件label、wrapper长度比例划分
 * templateContent 模板内容的长度比例
 */
const temcLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 },
};
/**
 * 跳转条件-数据修改滑窗(抽屉)
 * @extends {Component} - React.Component
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onHandleOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EmailDrawer extends Component {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onHandleOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onHandleOk: (e) => e,
    onCancel: (e) => e,
  };

  constructor(props) {
    super(props);
    this.state = {
      contentObj: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.itemData)) {
      const { itemData = {} } = this.props;
      if (itemData.templateId !== nextProps.itemData.templateId) {
        queryTL({ fieldName: 'templateContent', _token: nextProps.itemData._token }).then((res) => {
          if (getResponse(res)) {
            const value = {};
            res.forEach((item) => {
              value[item.code] = item.value;
            });
            this.setState({
              contentObj: value,
            });
          }
        });
      }
    } else if (this.props.visible !== nextProps.visible && nextProps.visible) {
      // 新增清空模板内容
      this.setState({
        contentObj: {},
      });
    }
  }

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData, currentLanguage } = this.props;
    const { contentObj } = this.state;
    if (onHandleOk) {
      const { interfaceCode, ...rest } = itemData;
      form.validateFields((err, values) => {
        const { _tls = {}, templateContent } = values;
        const newContentObj = {
          ...contentObj,
          [form.getFieldValue('remarkLanguage')]: templateContent || '',
        };
        _tls.templateContent = newContentObj;
        this.setState({
          contentObj: { ...newContentObj },
        });
        if (isEmpty(err)) {
          if (newContentObj.zh_CN) {
            const dataSource = {
              ...rest,
              ...omit(values, ['templateContent']),
              templateContent: newContentObj[currentLanguage],
              _tls,
            };
            onHandleOk(dataSource);
          } else {
            notification.warning({
              message: intl
                .get('hwfp.common.model.common.templateContent.zh_CN.isNotNull')
                .d('模板内容中文必填'),
            });
          }
        }
      });
    }
  }

  /**
   * 切换模板内容语言类型
   */
  @Bind()
  changeRemarkLanguage(value, oldValue, oldRemark) {
    const { form } = this.props;
    const { contentObj } = this.state;
    this.setState({
      contentObj: { ...contentObj, [oldValue]: oldRemark },
    });
    form.setFieldsValue({
      templateContent: contentObj[value] || '',
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      title,
      itemData,
      onCancel,
      form,
      form: { getFieldDecorator },
      loading = false,
      isSiteFlag,
      languageList,
      currentLanguage,
    } = this.props;
    const { contentObj } = this.state;
    return (
      <Modal
        okButtonProps={{ loading }}
        title={title}
        width={1000}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        destroyOnClose
        maskClosable={false}
      >
        <Form>
          <Row type="flex">
            <Col span={12}>
              <Form.Item
                label={intl.get('hwfp.common.model.common.templateCode').d('模板编码')}
                {...formLayout}
              >
                {getFieldDecorator('templateCode', {
                  initialValue: itemData.templateCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hwfp.common.model.common.templateCode').d('模板编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(
                  <Input inputChinese={false} disabled={itemData.templateCode} typeCase="upper" />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get('hwfp.common.model.common.templateName').d('模板名称')}
                {...formLayout}
              >
                {getFieldDecorator('templateName', {
                  initialValue: itemData.templateName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hwfp.common.model.common.templateName').d('模板名称'),
                      }),
                    },
                    {
                      max: 40,
                      message: intl.get('hzero.common.validation.max', {
                        max: 40,
                      }),
                    },
                  ],
                })(
                  // <Input />
                  <TLEditor
                    label={intl.get('hwfp.common.model.common.templateName').d('模板名称')}
                    field="templateName"
                    inputSize={{ zh: 40, en: 40 }}
                    token={itemData._token || ''}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get('hwfp.common.model.common.interfaceCode').d('数据来源')}
                {...formLayout}
              >
                {getFieldDecorator('interfaceId', {
                  initialValue: itemData.interfaceId,
                })(
                  <Lov
                    code={isSiteFlag ? 'HWFP.INTERFACE_DEFINE' : 'SWFP.INTERFACE_DEFINE_TENANT'}
                    textValue={itemData.interfaceCode}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get('hwfp.common.model.common.templateRemark').d('模板描述')}
                {...formLayout}
              >
                {getFieldDecorator('templateRemark', {
                  initialValue: itemData.templateRemark,
                  rules: [
                    {
                      max: 40,
                      message: intl.get('hzero.common.validation.max', {
                        max: 40,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={intl
                  .get('hwfp.common.model.common.templateContent.language')
                  .d('模板内容语言')}
                {...formLayout}
              >
                {getFieldDecorator('remarkLanguage', {
                  initialValue: currentLanguage,
                  rules: [
                    {
                      required: true,
                    },
                  ],
                })(
                  <Select
                    onChange={(value) =>
                      this.changeRemarkLanguage(
                        value,
                        form.getFieldValue('remarkLanguage'),
                        form.getFieldValue(`templateContent`)
                      )
                    }
                  >
                    {languageList.map((item) => (
                      <Select.Option value={item.code}>{item.name}</Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get('hwfp.common.model.common.templateContent').d('模板内容')}
                {...temcLayout}
              >
                {getFieldDecorator('templateContent', {
                  initialValue: contentObj[currentLanguage],
                  rules: [
                    {
                      required: form.getFieldValue('remarkLanguage') === 'zh_CN',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hwfp.common.model.common.templateContent').d('模板内容'),
                      }),
                    },
                  ],
                })(
                  <TextArea
                    rows={20}
                    placeholder={intl
                      .get('hwfp.common.view.message.placeholder.pleaseInput')
                      .d(
                        '请输入完整的HTML代码,并且将<#assign json=text?eval />嵌入到<html>后面......'
                      )}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
                {getFieldDecorator('enabledFlag', {
                  initialValue: itemData.enabledFlag === 0 ? 0 : 1,
                })(<Switch />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
