import React from 'react';
import { Modal, Form } from 'hzero-ui';

import intl from 'utils/intl';

import TreeSelect from '@/routes/Components/TreeSelect';

@Form.create()
export default class QuickModal extends React.Component {
  handleOk = () => {
    const {
      onOk = (e) => e,
      form: { validateFields },
    } = this.props;
    validateFields((err, { cid }) => {
      if (!err) {
        onOk(cid);
      }
    });
  };

  render() {
    const {
      visible,
      loading,
      treeList = [],
      onCancel = (e) => e,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        visible={visible}
        destroyOnClose
        title={intl.get('small.common.view.addScope').d('添加范围')}
        width={550}
        onOk={this.handleOk}
        confirmLoading={loading}
        onCancel={onCancel}
      >
        <Form>
          <Form.Item
            label={intl.get('small.common.model.product.category').d('商品分类')}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            {getFieldDecorator('cid', {
              rules: [
                {
                  required: true,
                  message: intl.get('small.common.model.choose.category').d('请选择分类'),
                },
              ],
            })(<TreeSelect allowClear={false} treeList={treeList} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
