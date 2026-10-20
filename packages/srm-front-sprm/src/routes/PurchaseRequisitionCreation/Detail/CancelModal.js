/**
 * index - 需求关闭取消提示框
 * @date: 2020-6-10
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import { Modal, Input, Row, Col, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import styles from './index.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const { TextArea } = Input;

const CancelModal = ({ form, handleOk, cancelModalVisible, onCancel }) => {
  const modalProps = {
    visible: cancelModalVisible,
    width: 500,
    bodyStyle: {
      height: 148,
    },
    onOk: () => {
      form.validateFields((err, values) => {
        if (!err) {
          handleOk(values.cancelledRemark);
        }
      });
    },
    onCancel: () => onCancel('cancelModalVisible', false),
  };
  return (
    <Modal {...modalProps}>
      <Form layout="inline" className="more-fields-search-form" style={{ marginTop: '20px' }}>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={styles.udpstyle}>
          <Col span={20}>
            <Form.Item
              label={intl.get(`sprm.common.view.message.cancelReason`).d('取消原因')}
              {...formItemLayout}
            >
              {form.getFieldDecorator('cancelledRemark', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sprm.common.view.message.cancelReason`).d('取消原因'),
                    }),
                  },
                ],
              })(<TextArea style={{ marginBottom: '8px' }} rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create({ fieldNameProp: null })(CancelModal);
