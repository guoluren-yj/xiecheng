import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Radio, Select, Tooltip, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const RadioGroup = Radio.Group;
const isTenant = isTenantRoleLevel();
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
export default class FormDrawer extends Component {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onHandleOk: PropTypes.func,
    onCancel: PropTypes.func,
    fieldSource: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      checkValue: props.fieldSource,
    };
  }

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    fieldSource: 'customize',
    onHandleOk: (e) => e,
    onCancel: (e) => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData, documentCode, cuszDocCode } = this.props;
    const { protocol } = this.getPcFormUrl(itemData.formUrl);
    if (onHandleOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          const { moduleForm = [] } = values;
          const formObj = values.formCode
            ? {
                formCode: `${documentCode}:${values.formCode}`,
              }
            : {};
          onHandleOk({
            ...itemData,
            ...values,
            moduleForm: moduleForm.toString(),
            cuszDocCode,
            formUrl: values.formUrl ? `${protocol}${values.formUrl}` : undefined,
            ...formObj,
          });
        }
      });
    }
  }

  @Bind()
  getFormCode(code) {
    if (code && code.indexOf(':') > 0) {
      return code.split(':')[1];
    } else {
      return code;
    }
  }

  @Bind()
  getPcFormUrl(url) {
    if (url) {
      const [protocol, host] = url.split('//');
      return {
        protocol: `${protocol || 'include'}//`,
        host,
      };
    } else {
      return {
        protocol: 'include://',
      };
    }
  }

  changeFieldSource = (e) => {
    this.setState({ checkValue: e.target.value });
    const { form } = this.props;
    form.setFieldsValue({
      formCode: '',
      description: '',
      formUrl: '',
      mobileFormUrl: '',
      cuszStageCode: '',
    });
  };

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
      documentCode,
      form: { getFieldDecorator },
      loading = false,
      cuszDocCode,
      isSiteFlag = false,
      enumMap: { moduleForm, usageStatus },
    } = this.props;
    const { checkValue } = this.state;
    // 编辑include情况下
    // 2022-05-12注释，后续有可能释放，暂不删除
    // if (!isEmpty(itemData) && itemData.formUrl && itemData.formUrl.indexOf('include://') > -1) {
    //   itemData.batchFlag = 0;
    // }

    return (
      <Modal
        okButtonProps={{ loading }}
        title={title}
        width={720}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('hwfp.common.form.common.formSource').d('表单来源')}
            {...formLayout}
          >
            {getFieldDecorator('fieldSource', {
              initialValue: checkValue,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.form.common.formSource').d('表单来源'),
                  }),
                },
              ],
            })(
              <RadioGroup
                onChange={this.changeFieldSource}
                disabled={!cuszDocCode || itemData.formId}
              >
                <Radio value="customize">
                  {intl.get('hwfp.common.model.common.customize').d('自定义')}
                </Radio>
                {isSiteFlag && (
                  <Radio value="cuszStage">
                    {intl.get('hwfp.common.model.common.cuszStage').d('表单样式配置')}
                  </Radio>
                )}
              </RadioGroup>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.formCode').d('表单编码')}
            {...formLayout}
          >
            {getFieldDecorator('formCode', {
              initialValue: this.getFormCode(itemData.formCode),
              rules: [
                {
                  required: !itemData.formId,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.formCode').d('表单编码'),
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
              <Input
                inputChinese={false}
                disabled={itemData.formId}
                typeCase="upper"
                addonBefore={documentCode}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.formDescription').d('表单描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.formDescription').d('表单描述'),
                  }),
                },
                {
                  max: 240,
                  message: intl.get('hzero.common.validation.max', {
                    max: 240,
                  }),
                },
              ],
              initialValue: itemData.description,
            })(
              // <Input />
              <TLEditor
                label={intl.get('hwfp.common.model.common.formDescription').d('表单描述')}
                field="description"
                inputSize={{ zh: 240, en: 240 }}
                token={itemData._token || ''}
              />
            )}
          </Form.Item>
          {checkValue === 'cuszStage' && (
            <Form.Item
              label={intl.get('hwfp.common.model.common.cuszStageCode').d('单据样式阶段')}
              {...formLayout}
            >
              {getFieldDecorator('cuszStageCode', {
                initialValue: itemData.cuszStageCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.model.common.cuszStageCode').d('单据样式阶段'),
                    }),
                  },
                ],
              })(
                <Lov
                  textValue={itemData.cuszStageName}
                  code="HWFP.CUSZ_DOC_STAGE_VIEW_LOV"
                  queryParams={{
                    docCode: cuszDocCode,
                  }}
                />
              )}
            </Form.Item>
          )}
          <Form.Item
            label={intl.get('hwfp.common.model.common.pcFormUrl').d('PC端表单URL')}
            {...formLayout}
          >
            {getFieldDecorator('formUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.pcFormUrl').d('PC端表单URL'),
                  }),
                },
                {
                  max: 600,
                  message: intl.get('hzero.common.validation.max', {
                    max: 600,
                  }),
                },
              ],
              initialValue: this.getPcFormUrl(itemData.formUrl).host,
            })(
              <Input
                addonBefore={
                  itemData.formUrl ? this.getPcFormUrl(itemData.formUrl).protocol : 'include://'
                }
              />
            )}
          </Form.Item>
          <Form.Item
            label={
              <span>
                {intl.get('hwfp.common.model.common.moduleSourceFrom').d('所属模块')}&nbsp;
                <Tooltip
                  title={
                    <>
                      <span>
                        1.
                        {intl
                          .get('hwfp.common.moduleForm.tooltip.first')
                          .d('纯二开选srm-front-cux-saax')}
                      </span>
                      <br />
                      <span>
                        2.
                        {intl
                          .get('hwfp.common.moduleForm.tooltip.second')
                          .d('标准和标准二开都选页面开发所在模块')}
                      </span>
                    </>
                  }
                >
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
            {...formLayout}
          >
            {getFieldDecorator('moduleForm', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.moduleSourceFrom').d('所属模块'),
                  }),
                },
              ],
              initialValue: itemData.moduleForm ? itemData.moduleForm.split(',') : [],
            })(
              <Select mode="multiple" allowClear>
                {moduleForm.map((item) => (
                  <Select.Option value={item.value}>{item.meaning}</Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.mobileFormUrl').d('移动端表单URL')}
            {...formLayout}
          >
            {getFieldDecorator('mobileFormUrl', {
              rules: [
                {
                  max: 600,
                  message: intl.get('hzero.common.validation.max', {
                    max: 600,
                  }),
                },
              ],
              initialValue: itemData.mobileFormUrl,
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get('hzero.common.batchFlag').d('启用批量审批')}>
            {getFieldDecorator('batchFlag', {
              initialValue: itemData.batchFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: itemData.enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
          {!isTenant && (
            <Form.Item
              label={intl.get('hwfp.common.model.common.usageStatus').d('统一重构表单')}
              {...formLayout}
            >
              {getFieldDecorator('usageStatus', {
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.model.common.usageStatus').d('统一重构表单'),
                    }),
                  },
                ],
                initialValue: itemData.usageStatus,
              })(
                <Select allowClear>
                  {usageStatus.map((item) => (
                    <Select.Option value={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}
