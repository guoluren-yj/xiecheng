/**
 * EditForm - 外部系统定义 - 编辑弹框
 * @date: 2018-09-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker, InputNumber } from 'hzero-ui';
import lodash from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getDateTimeFormat } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 下拉列表组件
 */
const { Option } = Select;

/**
 * modal侧滑属性
 */
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

const otherStyle = {
  style: {
    width: '100%',
  },
};

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * EditForm - 编辑form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = { publickKeyText: '' };

  @Bind()
  okHandle() {
    const { form, onHandleAddSystem } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onHandleAddSystem(
          {
            ...fieldsValue,
            secretKey: this.state.publickKeyText,
            applicationCode: lodash.trim(fieldsValue.applicationCode),
          },
          form
        );
      }
      this.setState({ publickKeyText: '' });
    });
  }

  /**
   * 取消模态框
   */
  @Bind()
  cancelHandle() {
    const { form, onShowEditModal } = this.props;
    onShowEditModal(false);
    form.resetFields();
    this.setState({ publickKeyText: '' });
  }

  /**
   * 获取密钥
   */
  @Bind()
  fetchPublickKey(key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystems/fetchPublickKey',
      payload: { keySize: key },
    }).then((res) => {
      if (res) {
        this.setState({ publickKeyText: res });
      }
    });
  }

  render() {
    const { form, lovCode, modalVisible, editRowData = {}, loading, SystemType = [] } = this.props;
    const { publickKeyText } = this.state;
    return (
      <Modal
        title={intl.get('sitf.externalSystems.view.message.title.list.modal').d('外部系统定义维护')}
        {...otherProps}
        destroyOnClose
        width={520}
        confirmLoading={loading}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.cancelHandle}
      >
        <React.Fragment>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
              .d('系统代码')}
          >
            {form.getFieldDecorator('externalSystemCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
                      .d('系统代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
              initialValue: editRowData.externalSystemCode,
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                disabled={editRowData.externalSystemId}
                {...otherStyle}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.externalSystemName')
              .d('系统名称')}
          >
            {form.getFieldDecorator('externalSystemName', {
              initialValue: editRowData.externalSystemName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.externalSystems.model.externalSystems.externalSystemName')
                      .d('系统名称'),
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
            {...formLayout}
            label={intl.get('sitf.common.applicationGroup.name').d('应用组名称')}
          >
            {form.getFieldDecorator('applicationGroupCode', {
              initialValue: editRowData.applicationGroupCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
                  }),
                },
              ],
            })(
              <Lov
                textValue={editRowData.applicationGroupName}
                code="SIFC.APPLICATION_GROUPS"
                disabled={!!editRowData.applicationId}
                {...otherStyle}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('sitf.externalSystems.model.externalSystems.systemType').d('系统类别')}
          >
            {form.getFieldDecorator('systemType', {
              initialValue: editRowData.systemType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('sitf.externalSystems.model.externalSystems.systemType')
                      .d('系统类别'),
                  }),
                },
              ],
            })(
              <Select {...otherStyle}>
                {SystemType &&
                  SystemType.map((type) => {
                    return (
                      <Option value={type.value} key={type.value}>
                        {type.meaning}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.systemVersion')
              .d('系统版本')}
          >
            {form.getFieldDecorator('systemVersion', {
              initialValue: editRowData.systemVersion,
            })(<InputNumber min={0} {...otherStyle} />)}
          </FormItem>

          <FormItem {...formLayout} label={intl.get('hzero.common.roles.contacts').d('联系人')}>
            {form.getFieldDecorator('contactPerson', {
              initialValue: editRowData.contactPerson,
              rules: [
                {
                  max: 70,
                  message: intl.get('hzero.common.validation.max', {
                    max: 70,
                  }),
                },
              ],
            })(<Input {...otherStyle} />)}
          </FormItem>

          <FormItem {...formLayout} label={intl.get('hzero.common.phone').d('电话')}>
            {form.getFieldDecorator('contactPhone', {
              initialValue: editRowData.contactPhone,
              rules: [
                {
                  max: 20,
                  message: intl.get('hzero.common.validation.max', {
                    max: 20,
                  }),
                },
              ],
            })(<Input {...otherStyle} />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.common.email').d('邮箱')}>
            {form.getFieldDecorator('contactEmail', {
              rules: [
                {
                  pattern: EMAIL,
                  message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
              initialValue: editRowData.contactEmail,
            })(<Input {...otherStyle} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('sitf.externalSystems.model.externalSystems.startDate').d('上线时间')}
          >
            {form.getFieldDecorator('startDate', {
              getValueFromEvent: (momentDate) =>
                momentDate && momentDate.format(DEFAULT_DATETIME_FORMAT),
              getValueProps: (dateStr) => ({
                value: dateStr && moment(dateStr, DEFAULT_DATETIME_FORMAT),
              }),
              initialValue: editRowData.startDate,
            })(<DatePicker {...otherStyle} placeholder="" showTime format={getDateTimeFormat()} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('sitf.externalSystems.model.externalSystems.ip').d('IP地址')}
          >
            {form.getFieldDecorator('ip', {
              initialValue: editRowData.ip,
              rules: [
                {
                  max: 15,
                  message: intl.get('hzero.common.validation.max', {
                    max: 15,
                  }),
                },
              ],
            })(<Input {...otherStyle} />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('entity.interface.version').d('接口版本')}>
            {form.getFieldDecorator('interfaceVersion', {
              initialValue: editRowData.interfaceVersion,
            })(<InputNumber {...otherStyle} min={0} max={999999} />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.common.remark').d('备注')}>
            {form.getFieldDecorator('remark', {
              initialValue: editRowData.remark,
            })(<Input {...otherStyle} />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl
              .get('sitf.externalSystems.model.externalSystems.primaryFlag')
              .d('主系统标识')}
          >
            {form.getFieldDecorator('primaryFlag', {
              initialValue: editRowData.primaryFlag === undefined ? 0 : editRowData.primaryFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('sitf.externalSystems.model.externalSystems.ipCheckFlag').d('IP校验')}
          >
            {form.getFieldDecorator('ipCheckFlag', {
              initialValue: editRowData.ipCheckFlag === undefined ? 0 : editRowData.ipCheckFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get('hzero.commom.status.enable').d('启用')}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: editRowData.enabledFlag === undefined ? 1 : editRowData.enabledFlag,
            })(<Switch />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('hzero.commom.status.encryptFlag').d('接口加密')}
          >
            {form.getFieldDecorator('encryptFlag', {
              initialValue: editRowData.encryptFlag === undefined ? 0 : editRowData.encryptFlag,
            })(<Switch />)}
          </FormItem>
          {(editRowData.encryptFlag === 1 || form.getFieldValue('encryptFlag') === 1) && (
            <FormItem label={intl.get(`sitf.common.createPublicKey`).d('密钥生成')} {...formLayout}>
              <Select {...otherStyle} onChange={this.fetchPublickKey}>
                {lovCode.getPublickKey &&
                  lovCode.getPublickKey.map((type) => {
                    return (
                      <Option value={type.value} key={type.value}>
                        {type.meaning}
                      </Option>
                    );
                  })}
              </Select>
            </FormItem>
          )}
          {(editRowData.encryptFlag === 1 || form.getFieldValue('encryptFlag') === 1) && (
            <FormItem label={intl.get(`sitf.common.privatePublicKey`).d('私钥')} {...formLayout}>
              <Input.TextArea disabled rows={6} value={publickKeyText} />
            </FormItem>
          )}
        </React.Fragment>
      </Modal>
    );
  }
}
