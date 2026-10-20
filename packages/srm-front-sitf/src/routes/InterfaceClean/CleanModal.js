/**
 * CleanModal - 接口清理 - 清理数据弹出框
 * @date: 2018-11-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Modal, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 清理数据弹出框
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = {
    interfaceCode: '',
    externalSystemName: '',
  };
  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { form, onCleanData } = this.props;
    const { interfaceCode, externalSystemName } = this.state;
    const onOk = () => {
      form.validateFields((err, fieldsValue) => {
        if (!err) {
          onCleanData({
            ...fieldsValue,
            interfaceCode,
            externalSystemName,
          });
        }
      });
    };
    Modal.confirm({
      title: intl.get('sitf.interfaceClean.view.message.info').d('确定清理数据?'),
      onOk,
    });
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  onCancelHandle() {
    const { onShowCleanModal } = this.props;
    onShowCleanModal(false);
  }

  /**
   * 获取接口code
   */
  @Bind()
  changeInterface(_, record) {
    this.setState({
      interfaceCode: record.interfaceCode,
    });
  }

  /**
   * 获取外部系统名称
   */
  @Bind()
  externalSystem(_, record) {
    this.setState({
      externalSystemName: record.externalSystemName,
    });
  }

  render() {
    const { form, modalVisible, loading } = this.props;
    const { getFieldValue } = form;
    return (
      <Modal
        title={intl.get('sitf.interfaceClean.view.message.title.modal').d('清理数据')}
        width={520}
        visible={modalVisible}
        confirmLoading={loading}
        onOk={this.okHandle}
        onCancel={this.onCancelHandle}
        destroyOnClose
      >
        <React.Fragment>
          <FormItem
            label={intl.get('sitf.common.data.externalSystemName').d('外部系统名称')}
            {...formLayout}
          >
            {form.getFieldDecorator('externalSystemCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
                  }),
                },
              ],
            })(
              <Lov
                code="SIFC.EXTERNAL_SYSTEM"
                onChange={(_, record) => this.externalSystem(_, record)}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
            {form.getFieldDecorator('interfaceId', {
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
                code="SITF.INTERFACE"
                disabled={!form.getFieldValue('externalSystemCode')}
                queryParams={{ externalSystemCode: form.getFieldValue('externalSystemCode') }}
                onChange={(_, record) => this.changeInterface(_, record)}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('sitf.interfaceClean.model.interfaceClean.cleanDateFrom')
              .d('清理日期从')}
            {...formLayout}
          >
            {form.getFieldDecorator('cleanDateFrom')(
              <DatePicker
                style={{ width: '100%' }}
                showTime
                format={getDateTimeFormat()}
                placeholder=""
                disabledDate={currentDate =>
                  getFieldValue('cleanDateTo') &&
                  moment(getFieldValue('cleanDateTo')).isBefore(currentDate, 'time')
                }
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('sitf.interfaceClean.model.interfaceClean.cleanDateTo').d('清理日期至')}
            {...formLayout}
          >
            {form.getFieldDecorator('cleanDateTo')(
              <DatePicker
                showTime
                style={{ width: '100%' }}
                format={getDateTimeFormat()}
                placeholder=""
                disabledDate={currentDate =>
                  getFieldValue('cleanDateFrom') &&
                  moment(getFieldValue('cleanDateFrom')).isAfter(currentDate, 'time')
                }
              />
            )}
          </FormItem>
        </React.Fragment>
      </Modal>
    );
  }
}
