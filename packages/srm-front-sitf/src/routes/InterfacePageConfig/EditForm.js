/**
 * InterfacePageConfig - 接口页面配置 - 弹框表单
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 侧滑弹框样式属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 弹框表单
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = {
    recordInterfaceId: '',
    parentPageConfigDisabled: false, // 父级id可编辑标志位
    interfaceCurrentType: '', // 当前接口表类型
  };

  /**
   * 点击确认按钮事件
   */
  @Bind()
  okHandle() {
    const { form, handleAdd } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        handleAdd(fieldsValue, form);
      }
    });
  }

  /**
   * 弹出框隐藏事件
   */
  @Bind()
  cancelHandle() {
    const { form, showEditModal } = this.props;
    showEditModal(false);
    form.resetFields();
    this.setState({
      recordInterfaceId: '',
    });
  }

  /**
   * 设置接口id
   * @param {Nmuber} index 索引
   * @param {Object} record 行数据
   */
  @Bind()
  setInterfaceId(index, record = {}) {
    const { form } = this.props;
    this.setState({
      recordInterfaceId: record.interfaceId,
    });
    form.setFieldsValue({
      interfaceCode: record.interfaceCode,
    });
  }

  /**
   * 接口表类型切换事件
   * @param {String} value
   */
  @Bind()
  onChangeTableType(value) {
    this.setState({
      parentPageConfigDisabled: value === 'seitf',
      interfaceCurrentType: value,
    });
  }

  render() {
    const { form, modalVisible, editRowData, loading, level } = this.props;
    const { recordInterfaceId, parentPageConfigDisabled, interfaceCurrentType } = this.state;
    const {
      interfaceId,
      interfaceCode,
      interfaceName,
      parentPageConfigId,
      interfaceUrl,
      tableName,
      pageConfigId,
      numberColumnName,
      erpDateColumnName,
      srmDateColumnName,
      interfaceTableType,
      tableTypeName,
    } = editRowData;
    const queryParams = level ? { queryParams: { tenantId: getCurrentOrganizationId() } } : {};
    return (
      <Modal
        {...otherProps}
        confirmLoading={loading}
        title={intl.get('sitf.interfacePageConfig.view.title.modal').d('接口页面配置维护')}
        visible={modalVisible}
        destroyOnClose
        onOk={this.okHandle}
        width={520}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.tableTypeName')
              .d('接口表类型')}
            {...formLayout}
          >
            {form.getFieldDecorator('interfaceTableType', {
              initialValue: interfaceTableType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.interfacePageConfig.model.interfacePageConfig.tableTypeName')
                      .d('接口表类型'),
                  }),
                },
              ],
            })(
              <ValueList
                textValue={tableTypeName}
                style={{ width: '100%' }}
                lovCode="SITF.INTERFACE_TABLE_TYPE"
                allowClear
                onChange={this.onChangeTableType}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
            {form.getFieldDecorator('interfaceId', {
              initialValue: interfaceId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.name').d('接口名称'),
                  }),
                },
              ],
            })(
              <Lov
                code={level ? 'SITF.INTERFACE' : 'SIFC.INTERFACE'}
                onChange={this.setInterfaceId}
                textValue={interfaceName}
                {...queryParams}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.parentPageConfigId')
              .d('父级配置ID')}
            {...formLayout}
          >
            {form.getFieldDecorator('parentPageConfigId', {
              initialValue: parentPageConfigId,
            })(
              <Lov
                code={level ? 'SITF.INTERFACE_PAGE_CONFIG' : 'SIFC.INTERFACE_PAGE_CONFIG'}
                textValue={parentPageConfigId}
                queryParams={{
                  interfaceId: recordInterfaceId || interfaceId,
                  pageConfigId,
                  interfaceTableType: interfaceCurrentType,
                }}
                disabled={!form.getFieldValue('interfaceCode') || parentPageConfigDisabled}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.interfaceUrl')
              .d('查询接口url')}
            {...formLayout}
          >
            {form.getFieldDecorator('interfaceUrl', {
              initialValue: interfaceUrl,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.interfacePageConfig.model.interfacePageConfig.interfaceUrl')
                      .d('查询接口url'),
                  }),
                },
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.tableName')
              .d('接口表名')}
            {...formLayout}
          >
            {form.getFieldDecorator('tableName', {
              initialValue: tableName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.interfacePageConfig.model.interfacePageConfig.tableName')
                      .d('接口表名'),
                  }),
                },
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.numberColumnName')
              .d('编号列名')}
            {...formLayout}
          >
            {form.getFieldDecorator('numberColumnName', {
              initialValue: numberColumnName,
              rules: [
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.erpDateColumnName')
              .d('ERP业务时间列名')}
            {...formLayout}
          >
            {form.getFieldDecorator('erpDateColumnName', {
              initialValue: erpDateColumnName,
              rules: [
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfacePageConfig.model.interfacePageConfig.srmDateColumnName')
              .d('SRM业务时间列名')}
            {...formLayout}
          >
            {form.getFieldDecorator('srmDateColumnName', {
              initialValue: srmDateColumnName,
              rules: [
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
          <FormItem style={{ display: 'none' }} {...formLayout}>
            {form.getFieldDecorator('interfaceCode', {
              initialValue: interfaceCode,
            })(<Input disabled />)}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
