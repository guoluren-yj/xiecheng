/**
 * MessageQueueProModal -消息队列处理定义-modal 编辑页
 * @date: 2018-9-13
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';

import intl from 'utils/intl';

const FormItem = Form.Item;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSaveMessage - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class MessageQueueProModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      interfaceId: '',
      //  applicationGroupId: '',
    };
  }

  /**
   * 确定并保存
   */
  @Bind()
  onOk() {
    const { form, onHandleSaveMessage, tableRecord = {} } = this.props;
    const { interfaceId } = this.state;
    const { createdBy, creationDate, lastUpdateDate, lastUpdatedBy, ...otherValue } = tableRecord;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveMessage({
          ...otherValue,
          ...values,
          interfaceId: interfaceId || tableRecord.interfaceId,
          applicationGroupCode:
            values.applicationGroupCode === tableRecord.applicationGroupName
              ? tableRecord.applicationGroupCode
              : values.applicationGroupCode,
        });
      }
    });
  }

  /**
   * 选择接口lov
   * @param {String} val    lov当前选择值
   * @param {Object} record lov当前行数据
   */
  @Bind()
  onChangeInterface(val, record) {
    this.setState({
      interfaceId: record.interfaceId,
    });
  }

  // 应用组lov选择
  // @Bind()
  // onChangeApplicationGroupCode(val, record) {
  //   const { form } = this.props;
  //   // this.setState({
  //   //   applicationGroupId: record.applicationGroupId,
  //   // });
  //   // 将接口lov中的值去除
  //   form.setFieldsValue({ interfaceId: undefined, interfaceName: undefined });
  // }

  render() {
    const { visible, onFetchCancel, anchor, tableRecord = {}, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={intl
          .get('sitf.messageQueueProDef.view.messageQueueProDef.create')
          .d('消息队列处理维护')}
        destroyOnClose
        width={520}
        onCancel={onFetchCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl.get('sitf.common.queueHandler.code').d('队列处理代码')}
            {...formLayout}
          >
            {getFieldDecorator('queueHandlerCode', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.queueHandler.code').d('队列处理代码'),
                  }),
                },
              ],
              initialValue: tableRecord.queueHandlerCode,
            })(
              tableRecord.queueHandlerCode === undefined ? (
                <Input typeCase="upper" trim inputChinese={false} />
              ) : (
                <Input typeCase="upper" trim inputChinese={false} disabled />
              )
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.queueHandler.name').d('队列处理名称')}
            {...formLayout}
          >
            {getFieldDecorator('queueHandlerName', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.queueHandler.name').d('队列处理名称'),
                  }),
                },
              ],
              initialValue: tableRecord.queueHandlerName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('entity.application.group').d('应用组')} {...formLayout}>
            {getFieldDecorator('applicationGroupCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.application.group`).d('应用组'),
                  }),
                },
              ],
              initialValue: tableRecord.applicationGroupName,
            })(<Lov code="SIFC.APPLICATION_GROUPS" textValue={tableRecord.applicationGroupName} />)}
          </FormItem>
          <FormItem label={intl.get('entity.interface.tag').d('接口')} {...formLayout}>
            {getFieldDecorator('interfaceCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.interface.tag`).d('接口'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCode,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.feignPath')
              .d('Feign调用路径')}
            {...formLayout}
          >
            {getFieldDecorator('feignPath', {
              initialValue: tableRecord.feignPath,
              rules: [
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 50,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.interface.handlerTimeout').d('处理超时')}
            {...formLayout}
          >
            {getFieldDecorator('handlerTimeout', {
              initialValue: tableRecord.handlerTimeout,
              rules: [
                // {
                //   message: intl.get('hzero.common.validation.notNull', {
                //     name: intl.get(`hzero.common.validation.max`, {
                //       max: 20,
                //     }),
                //   }),
                // },
              ],
            })(<InputNumber style={{ width: '100%' }} min={0} />)}
          </FormItem>
          <FormItem
            label={intl.get('sitf.common.data.handlerInterface').d('处理接口')}
            {...formLayout}
          >
            {getFieldDecorator('handlerInterface', {
              initialValue: tableRecord.handlerInterface,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerBeanName')
              .d('处理bean名称')}
            {...formLayout}
          >
            {getFieldDecorator('handlerBeanName', {
              initialValue: tableRecord.handlerBeanName,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerImplements')
              .d('处理方法实现')}
            {...formLayout}
          >
            {getFieldDecorator('handlerImplements', {
              initialValue: tableRecord.handlerImplements,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerFactoryInterface')
              .d('处理工厂接口')}
            {...formLayout}
          >
            {getFieldDecorator('handlerFactoryInterface', {
              initialValue: tableRecord.handlerFactoryInterface,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handleFactoryBeanName')
              .d('处理工厂bean名称')}
            {...formLayout}
          >
            {getFieldDecorator('handlerFactoryBeanName', {
              initialValue: tableRecord.handlerFactoryBeanName,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handlerFactoryImplements')
              .d('处理工厂方法实现')}
            {...formLayout}
          >
            {getFieldDecorator('handlerFactoryImplements', {
              initialValue: tableRecord.handlerFactoryImplements,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.messageQueueProDef.model.messageQueueProDef.handleProviderInterface')
              .d('处理提供接口')}
            {...formLayout}
          >
            {getFieldDecorator('handlerProviderInterface', {
              initialValue: tableRecord.handlerProviderInterface,
              rules: [
                {
                  max: 150,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 150,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('sitf.common.view.parameter').d('参数')} {...formLayout}>
            {getFieldDecorator('properties', {
              initialValue: tableRecord.properties,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
