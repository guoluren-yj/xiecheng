import React, { Component } from 'react';
import { Modal, Form, Input, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { isArray } from 'util';

const promptCode = 'sfin.invoiceBill';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

@connect(({ loading }) => ({
  queryLogisticsLoading: loading.effects['invoice/queryLogisticsInfo'],
  submitLogisticsLoading: loading.effects['invoice/submitLogisticsInfo'],
}))
@Form.create({ fieldNameProp: null })
export default class TypeInModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 保存 modal 数据，并且关闭 modal
   */
  @Bind()
  handleOk() {
    const { form, dispatch, pagination, handleSearch, clearSelectedRows } = this.props;
    form.validateFields((err, values) => {
      if (!err && isArray(this.record)) {
        dispatch({
          type: 'invoice/submitLogisticsInfo',
          payload: this.record.map(item => {
            const { invoiceHeaderId, objectVersionNumber, _token } = item;
            return {
              ...values,
              invoiceHeaderId,
              objectVersionNumber,
              _token,
            };
          }),
        }).then(res => {
          if (res) {
            handleSearch(pagination.supplier);
            clearSelectedRows();
            this.handleCancel();
            notification.success({
              message: intl.get(`${promptCode}.modifiedSuccess`).d('修改成功'),
            });
          }
        });
      }
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCancel() {
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    onClose();
    resetFields();
  }

  /**
   * 初始表单数据
   */
  @Bind()
  init(data) {
    if (!isEmpty(data)) {
      const {
        form: { setFieldsValue },
      } = this.props;
      const {
        logisticsCompany,
        logisticsNum,
        logisticsRemark,
        logisticsReceiver,
        logisticsReceiveTelNum,
        logisticsReceiveAddress,
      } = data;
      setFieldsValue({
        logisticsCompany,
        logisticsNum,
        logisticsRemark,
        logisticsReceiver,
        logisticsReceiveTelNum,
        logisticsReceiveAddress,
      });
    }
  }

  render() {
    const {
      visible,
      form: { getFieldDecorator },
      queryLogisticsLoading,
      submitLogisticsLoading = false,
    } = this.props;
    return (
      <Modal
        visible={visible}
        title={intl.get(`${promptCode}.title.applyAssignment`).d('物流信息录入')}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        okButtonProps={{ disabled: queryLogisticsLoading || submitLogisticsLoading }}
      >
        <Spin spinning={queryLogisticsLoading || submitLogisticsLoading}>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.logisticsCompany`).d('物流公司：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsCompany', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get(`${promptCode}.suspendReason`, {
                      name: intl.get(`${promptCode}.logisticsCompany`).d('物流公司'),
                    })
                    .d(`${intl.get(`${promptCode}.logisticsCompany`).d('物流公司')}不能为空`),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.logisticsNumber`).d('物流单号：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsNum', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get(`${promptCode}.suspendReason`, {
                      name: intl.get(`${promptCode}.logisticsNumber`).d('物流单号'),
                    })
                    .d(`${intl.get(`${promptCode}.logisticsNumber`).d('物流单号')}不能为空`),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.logisticsNote`).d('物流备注：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsRemark')(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.accepterName`).d('收件人姓名：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsReceiver')(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.accepterPhone`).d('收件人电话：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsReceiveTelNum')(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.model.invoiceBill.accepterAddress`).d('收件人地址：')}
            {...formItemLayout}
          >
            {getFieldDecorator('logisticsReceiveAddress')(<Input />)}
          </Form.Item>
        </Spin>
      </Modal>
    );
  }
}
