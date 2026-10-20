import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, Radio, Alert } from 'hzero-ui';
import { TreeSelect, Tooltip } from 'choerodon-ui/pro';
import { Text, Icon } from 'choerodon-ui';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import { isUndefined, isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import Switch from 'components/Switch';
import styles from './index.less';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const RadioGroup = Radio.Group;
const { TreeNode } = TreeSelect;
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
export default class VariableDrawer extends Component {
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
      checkValue: '', // 字段来源
      businessObjectRelationFieldId: '',
      businessObjectCode: '',
      businessObjectFieldCode: '',
    };
  }

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { form, onHandleOk, itemData } = this.props;
    if (onHandleOk) {
      form.validateFields((err, values) => {
        const { variableId } = itemData;
        const { fieldType } = values;
        const {
          businessObjectRelationFieldId,
          businessObjectCode,
          businessObjectFieldCode,
        } = this.state;
        const fieldId =
          fieldType === 'model' && !variableId
            ? { businessObjectRelationFieldId, businessObjectCode, businessObjectFieldCode }
            : {};
        if (isEmpty(err)) {
          onHandleOk({
            ...itemData,
            ...values,
            ...fieldId,
          });
        }
      });
    }
  }

  /**
   * 条件编码唯一性校验
   * @param {!object} documents - 规则
   * @param {!string} value - 表单值
   * @param {!Function} callback
   */
  @Bind()
  checkUnique(documents, value, callback) {
    const { ruleList, itemData } = this.props;
    if (isUndefined(itemData.code)) {
      // 非编辑时，校验规则编码是否重复
      const target = ruleList.find((item) => item.code === +value);
      if (target) {
        callback(
          intl.get('hwfp.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    }
  }

  changeCheckValue = (e) => {
    this.setState({ checkValue: e.target.value });
    const { form } = this.props;
    form.setFieldsValue({
      variableName: '',
      variableType: '',
      description: '',
      modelCode: '',
      requiredFlag: 0,
      componentType: '',
      lovCode: '',
      variableDynamicFlag: null,
    });
  };

  // 树选择
  renderTree(list) {
    return list.map((item) => (
      <TreeNode
        value={item.uniqueKey}
        title={`${item.businessObjectFieldName || '-'}(${item.businessObjectFieldCode || '-'})`}
      >
        {item.businessObjectRelationFieldList &&
          item.businessObjectRelationFieldList.length > 0 &&
          this.renderTree(item.businessObjectRelationFieldList)}
      </TreeNode>
    ));
  }

  @Bind()
  handleTreeSelect() {
    const { customizeField, itemData } = this.props;
    const { businessObjectRelationFieldList = [] } = customizeField;
    return (
      <TreeSelect
        style={{ width: '100%' }}
        onChange={this.handleTreeSelectChange}
        searchable
        disabled={itemData.variableName}
      >
        {this.renderTree(businessObjectRelationFieldList)}
      </TreeSelect>
    );
  }

  // 处理字段名称数组
  @Bind()
  handleFieldArr(oldArr, newArr) {
    oldArr.forEach((item) => {
      newArr.push(item);
      if (item.businessObjectRelationFieldList && item.businessObjectRelationFieldList.length > 0) {
        this.handleFieldArr(item.businessObjectRelationFieldList, newArr);
      }
    });
    return newArr;
  }

  // 选中的值
  @Bind()
  handleTreeSelectChange(value) {
    const { customizeField, form } = this.props;
    if (value === null) {
      form.setFieldsValue({
        variableType: '',
        description: '',
        modelCode: '',
        modelName: '',
        variablePath: '',
        componentType: '',
        lovCode: '',
      });
      return;
    }
    const { businessObjectRelationFieldList = [] } = customizeField;
    const newCustomizeField = [];
    const newArr = this.handleFieldArr(businessObjectRelationFieldList, newCustomizeField);
    newArr.forEach((item) => {
      if (item.uniqueKey === value) {
        const { businessObjectRelationFieldId, businessObjectCode, businessObjectFieldCode } = item;
        this.setState({
          businessObjectRelationFieldId,
          businessObjectCode,
          businessObjectFieldCode,
        });
        form.setFieldsValue({
          variableType: item.processVariableType,
          description: item.businessObjectFieldName,
          modelCode: item.businessObjectRelationId,
          modelName: item.businessObjectName,
          variablePath: item.fieldPath,
          componentType: item.componentType,
          lovCode: item.lovCode,
        });
      }
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
      loading = false,
      enumMap = {},
      fieldSource,
      isHeaderSelectModalCode,
      canUpdateCode,
      documentServiceName,
    } = this.props;
    const { variableTypes = [], componentTypes = [], documentCuszFieldList = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    const { checkValue } = this.state;
    const lovCodeFlag = getFieldValue('componentType')
      ? getFieldValue('componentType') === 'SINGLE_LOV'
      : itemData.componentType === 'SINGLE_LOV';
    const isSiteFlag = !isTenantRoleLevel();
    const editable = !itemData.copyFlag;
    const variableType = getFieldValue('variableType');
    const optionCuszFieldList =
      documentCuszFieldList && documentCuszFieldList.length
        ? documentCuszFieldList.filter((field) => field.variableType === variableType)
        : [];
    return (
      <Modal
        okButtonProps={{ loading }}
        title={title}
        width={580}
        zIndex={800}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        destroyOnClose
      >
        {!editable && (
          <Alert
            type="info"
            showIcon
            message={intl
              .get('hwfp.common.view.message.title.variableMaintain.title')
              .d('流程单据预定义流程变量，仅支持更改展示属性')}
            closable
            className={styles.alert}
          />
        )}
        <Form>
          <Form.Item
            label={intl.get('hwfp.common.model.common.fieldSource').d('字段来源')}
            {...formLayout}
          >
            {getFieldDecorator('fieldType', {
              initialValue: fieldSource,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.fieldSource').d('字段来源'),
                  }),
                },
              ],
            })(
              <RadioGroup
                onChange={this.changeCheckValue}
                initialValue={fieldSource}
                disabled={!isEmpty(itemData) || !editable}
              >
                <Radio value="customize">
                  {intl.get('hwfp.common.model.common.customize').d('自定义')}
                </Radio>
                <Radio value="model" disabled={!isHeaderSelectModalCode}>
                  {intl.get('hwfp.common.model.common.Modal').d('组合业务对象')}
                </Radio>
              </RadioGroup>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableCode').d('字段编码')}
            {...formLayout}
          >
            {getFieldDecorator('variableName', {
              initialValue: itemData.variableName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
                  }),
                },
              ],
            })(
              (!checkValue && fieldSource === 'customize') || checkValue === 'customize' ? (
                <Input inputChinese={false} disabled={!!canUpdateCode || !editable} />
              ) : (
                this.handleTreeSelect()
              )
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableType').d('字段类型')}
            {...formLayout}
          >
            {getFieldDecorator('variableType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableType').d('字段类型'),
                  }),
                },
              ],
              initialValue: itemData.variableType,
            })(
              <Select disabled={!editable}>
                {variableTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.variableName').d('字段名称')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
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
                disabled={!editable}
                label={intl.get('hwfp.common.model.common.variableName').d('字段名称')}
                field="description"
                inputSize={{ zh: 240, en: 240 }}
                token={itemData._token || ''}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.componentType').d('组件类型')}
            {...formLayout}
          >
            {getFieldDecorator('componentType', {
              rules: [
                {
                  required:
                    (!checkValue && fieldSource === 'customize') || checkValue === 'customize',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.componentType').d('组件类型'),
                  }),
                },
              ],
              initialValue: itemData.componentType,
            })(
              <Select
                disabled={
                  !((!checkValue && fieldSource === 'customize') || checkValue === 'customize') ||
                  !editable
                }
                onChange={(value) => {
                  form.setFieldsValue({ lovCode: '' });
                  if (['SWITCH', 'CHECKBOX'].indexOf(value) !== -1) {
                    form.setFieldsValue({ lovCode: 'HPFM.FLAG' });
                  }
                }}
              >
                {componentTypes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfp.common.model.common.lovCode').d('来源值集')}
            {...formLayout}
          >
            {getFieldDecorator('lovCode', {
              rules: [
                {
                  required:
                    ((!checkValue && fieldSource === 'customize') || checkValue === 'customize') &&
                    ['SINGLE_SELECT', 'SINGLE_LOV', 'SWITCH', 'CHECKBOX'].indexOf(
                      getFieldValue('componentType')
                    ) !== -1,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
                  }),
                },
              ],
              initialValue: itemData.lovCode,
            })(
              <Lov
                code={
                  lovCodeFlag
                    ? isSiteFlag
                      ? 'HPFM.LOV_VIEW'
                      : 'HPFM.LOV.VIEW.ORG'
                    : isSiteFlag
                    ? 'HPFM.LOV.LOV_DETAIL_CODE'
                    : 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
                }
                queryParams={
                  lovCodeFlag && isSiteFlag
                    ? { tenantId: this.props.headerTenantId || this.props.tenantId }
                    : {}
                }
                lovOptions={
                  lovCodeFlag
                    ? {
                        displayField: 'viewName',
                        valueField: 'viewCode',
                      }
                    : {
                        displayField: 'lovName',
                        valueField: 'lovCode',
                      }
                }
                disabled={
                  !editable ||
                  !((!checkValue && fieldSource === 'customize') || checkValue === 'customize') ||
                  ['SINGLE_SELECT', 'SINGLE_LOV', 'RADIO'].indexOf(
                    getFieldValue('componentType')
                  ) === -1
                }
              />
            )}
          </Form.Item>
          {((!checkValue && fieldSource === 'model') || checkValue === 'model') && (
            <>
              <Form.Item
                label={intl.get('hwfp.common.model.common.sourceView').d('所属业务对象')}
                {...formLayout}
              >
                {getFieldDecorator('modelName', {
                  initialValue: itemData.modelName,
                })(<Input disabled />)}
              </Form.Item>
              <Form.Item
                label={intl.get('hwfp.common.model.common.sourceView').d('所属业务对象')}
                {...formLayout}
                style={{ display: 'none' }}
              >
                {getFieldDecorator('modelCode', {
                  initialValue: itemData.modelCode,
                })(<Input disabled />)}
              </Form.Item>
              <Form.Item label="variablePath" {...formLayout} style={{ display: 'none' }}>
                {getFieldDecorator('variablePath', {
                  initialValue: itemData.variablePath,
                })(<Input disabled />)}
              </Form.Item>
            </>
          )}
          <Form.Item
            {...formLayout}
            label={intl.get('hwfp.common.model.common.requiredFlag').d('是否必输')}
          >
            {getFieldDecorator('requiredFlag', {
              initialValue: itemData.requiredFlag === 1 ? 1 : 0,
            })(<Switch disabled={!editable} />)}
          </Form.Item>
          {!isSiteFlag && (
            <>
              <Form.Item
                {...formLayout}
                label={
                  <>
                    <Text style={{ maxWidth: '80px' }}>
                      {intl.get('hwfp.common.model.common.cuszFieldName').d('展示字段映射')}
                    </Text>
                    <Tooltip
                      title={intl
                        .get('hwfp.documents.view.message.cuszFieldName.help')
                        .d(
                          '展示字段映射用于维护将当前字段作为单独列展示在审批工作台页面，维护后发起流程后则不允许更改；配置顺序：需维护请现在【页面个性化】配置需要展示的Attribute字段列，再【流程单据】维护业务字段与Attribute字段映射关系'
                        )}
                    >
                      <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                    </Tooltip>
                  </>
                }
              >
                {getFieldDecorator('cuszFieldName', {
                  initialValue: itemData.cuszFieldName,
                })(
                  <Select allowClear>
                    {optionCuszFieldList.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={
                  <>
                    <Text style={{ maxWidth: '136px' }}>
                      {intl.get('hwfp.common.model.common.rejectValidate').d('拒绝再提交参数校验')}
                    </Text>
                    <Tooltip
                      title={intl
                        .get('hwfp.common.model.common.rejectValidate.help')
                        .d(
                          '审批拒绝单据且选择再次提交单据跳过中间已审批节点，开启参数校验当前参数发生变更，则跳过中间节点失败，需审批人重新审批'
                        )}
                    >
                      <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                    </Tooltip>
                  </>
                }
              >
                {getFieldDecorator('refuseCheckFlag', {
                  initialValue: isNil(itemData.refuseCheckFlag) ? 0 : itemData.refuseCheckFlag,
                })(<Switch />)}
              </Form.Item>
              <Form.Item
                {...formLayout}
                label={
                  <>
                    <Text style={{ maxWidth: '110px' }}>
                      {intl.get('hwfp.common.model.common.jumpValidate').d('驳回跳过节点参数校验')}
                    </Text>
                    <Tooltip
                      title={intl
                        .get('hwfp.common.model.common.jumpValidate.help')
                        .d(
                          '驳回已审批节点且选择跳过中间节点，开启参数校验当前参数发生变更，则跳过中间节点失败，需审批人重新审批'
                        )}
                    >
                      <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                    </Tooltip>
                  </>
                }
              >
                {getFieldDecorator('rebutCheckFlag', {
                  initialValue: isNil(itemData.rebutCheckFlag) ? 0 : itemData.rebutCheckFlag,
                })(<Switch />)}
              </Form.Item>
              {documentServiceName && (
                <Form.Item
                  {...formLayout}
                  label={
                    <>
                      <Text style={{ maxWidth: '110px' }}>
                        {intl
                          .get('hwfp.common.model.common.variableDynamicFlag')
                          .d('变量值动态获取')}
                      </Text>
                      <Tooltip
                        title={intl
                          .get('hwfp.common.model.common.variableDynamicFlag.help')
                          .d(
                            '开启配置后，组合业务对象值动态查询单据参数值，适用于审批中更改参数值，后续审批节点需获取最新值执行相关规则'
                          )}
                      >
                        <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
                      </Tooltip>
                    </>
                  }
                >
                  {getFieldDecorator('variableDynamicFlag', {
                    initialValue: isNil(itemData.variableDynamicFlag)
                      ? 0
                      : itemData.variableDynamicFlag,
                  })(<Switch disabled={getFieldValue('fieldType') !== 'model'} />)}
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>
    );
  }
}
