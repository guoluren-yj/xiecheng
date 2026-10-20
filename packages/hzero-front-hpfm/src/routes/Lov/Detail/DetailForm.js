/**
 * DetailForm - 值集视图行编辑侧滑Form
 * @date: 2018-6-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Form, Input, InputNumber, Modal, Row, Select, Col, Icon, Tooltip } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';

import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const MODAL_FORM_ITEM_LAYOUT = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
/**
 * 使用 Select 的 Option 组件
 */
const { Option } = Select;
/**
 * modal的侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * lov维护Form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DetailForm extends React.Component {
  /**
   * 组件挂载后触发方法
   */
  componentDidMount() {
    const { editRecordData, form } = this.props;
    form.setFieldsValue({
      ...editRecordData,
    });
  }

  /**
   * 点击确定后方法
   */
  @Bind()
  okHandle() {
    const { form, editRecordData, formHook } = this.props;
    formHook(form, editRecordData);
  }

  /**
   * 渲染函数
   * @returns
   */
  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      modalVisible,
      showEditModal,
      loading,
      isTenant,
      isNotCurrentTenant,
      title,
      editRecordData = {},
      dataTypeList = [],
      desensitizeTypeList = [],
    } = this.props;
    const {
      queryFieldFlag = 0,
      tableFieldFlag = 0,
      fuzzyQueryFlag = 1,
      enabledFlag = 1,
      desensitizeType,
      defaultQueryFlag = 0,
    } = editRecordData;
    return (
      <Modal
        title={title}
        visible={modalVisible}
        width={600}
        confirmLoading={loading}
        destroyOnClose
        onCancel={() => showEditModal(false)}
        footer={
          isTenant && isNotCurrentTenant
            ? null
            : [
                <Button key="cancel" onClick={() => showEditModal(false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>,
                <Button key="on" type="primary" loading={loading} onClick={this.okHandle}>
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>,
              ]
        }
        {...otherProps}
      >
        <Form>
          <Row gutter={24}>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.fieldName').d('表格字段名')}
              >
                {getFieldDecorator('fieldName', {
                  initialValue: editRecordData.fieldName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.lov.model.lov.fieldName').d('表格字段名'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input disabled={isTenant && isNotCurrentTenant} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.display').d('表格列标题')}
              >
                {getFieldDecorator('display', {
                  initialValue: editRecordData.display,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.lov.model.lov.display').d('表格列标题'),
                      }),
                    },
                    {
                      max: 80,
                      message: intl.get('hzero.common.validation.max', {
                        max: 80,
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl.get(`hpfm.lov.model.lov.display`).d('表格列标题')}
                    field="display"
                    token={editRecordData._token}
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.tableFieldWidth').d('列宽度')}
              >
                {getFieldDecorator('tableFieldWidth', {
                  initialValue: editRecordData.tableFieldWidth,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.lov.model.lov.tableFieldWidth').d('列宽度'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={isTenant && isNotCurrentTenant}
                    min={0}
                    style={{ width: '50%' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.orderSeq').d('列序号')}
              >
                {getFieldDecorator('orderSeq', {
                  initialValue: editRecordData.orderSeq,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.lov.model.lov.orderSeq').d('列序号'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={isTenant && isNotCurrentTenant}
                    min={0}
                    style={{ width: '50%' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.dataType').d('字段类型')}
              >
                {getFieldDecorator('dataType', {
                  initialValue: editRecordData.dataType,
                })(
                  <Select style={{ width: '100%' }} allowClear>
                    {dataTypeList.map((option) => {
                      return (
                        <Option key={option.value} value={option.value}>
                          {option.meaning}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
            {form.getFieldValue('dataType') === 'SELECT' && (
              <Col>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={
                    <span>
                      {intl.get('hpfm.lov.model.lov.sourceCode').d('值集编码')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hpfm.lov.model.lov.sourceCode.toolTip')
                          .d('仅支持独立值集')}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('sourceCode', {
                    initialValue: editRecordData.sourceCode,
                    rules: [
                      {
                        required: form.getFieldValue('dataType') === 'SELECT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.sourceCode').d('值集编码'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            {form.getFieldValue('dataType') === 'LOV_CODE' && (
              <Col>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.lov.model.lov.view.sourceCode').d('值集视图编码')}
                >
                  {getFieldDecorator('sourceCode', {
                    initialValue: editRecordData.sourceCode,
                    rules: [
                      {
                        required: form.getFieldValue('dataType') === 'LOV_CODE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.lov.model.lov.view.sourceCode').d('值集视图编码'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.queryFieldFlag').d('查询字段')}
              >
                {getFieldDecorator('queryFieldFlag', {
                  initialValue: queryFieldFlag,
                })(
                  <Switch
                    disabled={isTenant && isNotCurrentTenant}
                    onChange={(v) => {
                      if (!v) {
                        setFieldsValue({
                          defaultQueryFlag: 0,
                          fuzzyQueryFlag: 0,
                        });
                      }
                    }}
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.tableFieldFlag').d('表格列')}
              >
                {getFieldDecorator('tableFieldFlag', {
                  initialValue: tableFieldFlag,
                })(<Switch disabled={isTenant && isNotCurrentTenant} />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.desensitizeType').d('脱敏类型')}
              >
                {getFieldDecorator('desensitizeType', {
                  initialValue: !isNil(desensitizeType) ? desensitizeType : 'NOT',
                })(
                  <Select disabled={isTenant && isNotCurrentTenant}>
                    {desensitizeTypeList && desensitizeTypeList.length > 0
                      ? desensitizeTypeList.map((i) => (
                          <Select.Option value={i.value}>{i.meaning}</Select.Option>
                        ))
                      : null}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={
                  <>
                    <Text style={{ minWidth: '100px', maxWidth: 'calc( 100% - 32px )', flexDirection: 'column-reverse' }}>
                      {intl.get('hpfm.lov.model.lov.defaultQueryFlag').d('筛选默认查询字段')}
                    </Text>
                    <Tooltip
                      title={intl
                        .get('hpfm.lov.model.lov.defaultQueryFlag.help')
                        .d(
                          '此配置用于确定：在将当前值集视图应用于筛选器单元的筛选字段时，默认的筛选参数是哪个，并且默认筛选字段需唯一，租户级支持调整，且全租户生效'
                        )}
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ verticalAlign: 'text-top', marginLeft: '6px' }}
                      />
                    </Tooltip>
                  </>
                }
              >
                {getFieldDecorator('defaultQueryFlag', {
                  initialValue: defaultQueryFlag,
                })(
                  <Switch
                    disabled={
                      (isTenant && isNotCurrentTenant) || getFieldValue('queryFieldFlag') !== 1
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={
                  <>
                    <Text style={{ minWidth: '100px', maxWidth: 'calc( 100% - 32px )', flexDirection: 'column-reverse' }}>
                      {intl.get('hpfm.lov.model.lov.fuzzyQueryFlag').d('模糊查询')}
                    </Text>
                    <Tooltip title={intl.get('hpfm.lov.model.lov.fuzzyQueryFlag.help').d('当前字段用于查询时，是否启用模糊查询')}>
                      <Icon
                        type="question-circle-o"
                        style={{ verticalAlign: 'text-top', marginLeft: '6px' }}
                      />
                    </Tooltip>
                  </>
                }
              >
                {getFieldDecorator('fuzzyQueryFlag', {
                  initialValue: fuzzyQueryFlag,
                })(
                  <Switch
                    disabled={
                      (isTenant && isNotCurrentTenant) || getFieldValue('queryFieldFlag') !== 1
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                {...MODAL_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.lov.model.lov.enabledFlag').d('状态')}
              >
                {getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag,
                })(<Switch disabled={isTenant && isNotCurrentTenant} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
