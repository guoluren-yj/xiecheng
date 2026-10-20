import React, { Component } from 'react';
import { Modal, Form, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';

import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import intl from 'utils/intl';

import cacheComponent from 'components/CacheComponent';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  fetchLoading: loading.effects['mallProtocolManagement/fetcthProtocolLineData'],
  fetchExitLoading: loading.effects['mallProtocolManagement/fetchExitProductList'],
  fetchNoExitLoading: loading.effects['mallProtocolManagement/fetchNoExitProductList'],
  addLoading: loading.effects['mallProtocolManagement/lineAddProduct'],
  deleteLoading: loading.effects['mallProtocolManagement/lineDeleteProduct'],
  createLoading: loading.effects['mallProtocolManagement/createProduct'],
}))
@cacheComponent({ cacheKey: '/small/mall-protocol-management/detail/item/modal' })
@Form.create({ fieldNameProp: null })
export default class ProtocolSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 创建商品
   */
  @Bind()
  handleProductOK() {
    const {
      onOk = (e) => e,
      form: { getFieldValue, validateFields },
    } = this.props;
    validateFields((err) => {
      if (!err) {
        onOk({
          cid: getFieldValue('cid'),
          details: getFieldValue('content'),
        });
      }
    });
  }

  componentWillReceiveProps(props) {
    const {
      productTemplate = [],
      form: { getFieldValue, setFieldsValue },
    } = props;
    const { templateId, content } = productTemplate.find((f) => f.defaultFlag === 1) || {};
    if (!getFieldValue('templateId') && templateId) {
      setFieldsValue({ templateId, content });
    }
  }

  render() {
    const {
      form,
      visible,
      loading,
      categoryName,
      productTemplate,
      onCancel = (e) => e,
    } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    return (
      <React.Fragment>
        <Modal
          title={intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
          destroyOnClose
          onCancel={onCancel}
          visible={visible}
          onOk={this.handleProductOK}
          confirmLoading={loading}
        >
          <Form.Item
            label={intl.get('small.common.model.productIntroTemp').d('商品介绍模板')}
            {...formLayout}
          >
            {getFieldDecorator('content')}
            {getFieldDecorator('templateId')(
              <Select
                style={{ width: '100%' }}
                onChange={(val) => {
                  const { content = '' } = productTemplate.find((f) => f.templateId === val) || {};
                  setFieldsValue({ content });
                }}
              >
                {productTemplate.map((item) => (
                  <Select.Option key={item.templateId} value={item.templateId}>
                    {item.templateName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('small.common.model.platformCategory').d('平台分类')}
            {...formLayout}
          >
            {getFieldDecorator('cid', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('small.common.model.platformCategory').d('平台分类'),
                  }),
                },
              ],
            })(
              <Lov
                textValue={categoryName}
                code="SMPC.CATEGORY"
                isDbc2Sbc={false}
                queryParams={{
                  supplierTenantId: getCurrentOrganizationId(),
                }}
              />
            )}
          </Form.Item>
        </Modal>
      </React.Fragment>
    );
  }
}
