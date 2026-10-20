/**
 * 电商商品详情弹框
 * * @date: 2019-7-24
 * @author LH <heng.liu@hand-china.com>
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Modal, Table, Form, Button, Input, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject, getUserOrganizationId } from 'utils/utils';
import qs from 'querystring';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const promptKey = 'scec.productDetailsModal.model';
@formatterCollections({
  code: ['scec.productDetailsModal', 'scec.goodsApprove'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec' })
@connect(({ productDetailsModal, loading }) => ({
  productDetailsModal,
  loading: loading.effects['productDetailsModal/fetchGoodsList'],
  previewLoading: loading.effects['productDetailsModal/fetchGoodsPreview'],
}))
@withRouter
export default class index extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      organizationId: getUserOrganizationId(),
      companyId: '-1',
      isFirst: true,
    };
  }

  componentDidMount() {
    if (this.props._back === -1) {
      this.fetchGoodsList();
    }
  }

  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productDetailsModal/updateState',
      payload: {
        list: {},
        pagination: {},
        detail: {},
      },
    });
  }

  /**
   * Modal查询
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch, ecCategoryId, ecPlatformCode } = this.props;
    const { companyId, organizationId, isFirst } = this.state;
    this.props.form.validateFields((err, values) => {
      const fieldValues = filterNullValueObject(values);
      if (!err) {
        dispatch({
          type: 'productDetailsModal/fetchGoodsList',
          payload: {
            page: isEmpty(params) ? {} : params,
            ...fieldValues,
            companyId,
            organizationId,
            ecCategoryId,
            ecPlatformCode,
          },
        }).then(res => {
          if (isFirst) {
            dispatch({
              type: 'productDetailsModal/updateState',
              payload: {
                JTtotalElements: res.totalElements,
              },
            });
            this.setState({
              isFirst: false,
            });
          }
        });
      }
    });
  }

  /**
   * 电商详情
   */
  @Bind
  preview(productId) {
    const { ecPlatformCode, onHandleCancel } = this.props;
    onHandleCancel();
    openTab({
      key: '/scec/commom-goods-preview',
      title: intl.get('scec.common.button.goodsPreview').d('商品预览'),
      search: qs.stringify({
        productId,
        platformCode: ecPlatformCode,
      }),
    });
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      productDetailsModal: { pagination = {}, list = {}, JTtotalElements },
      loading,
      onHandleCancel,
      ecCategoryName,
      modalVisible,
      previewLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptKey}.ecplatformname`).d('电商名称'),
        dataIndex: 'ecPlatformName',
        width: 100,
      },
      {
        title: intl.get(`${promptKey}.ecproductnum`).d('电商商品编码'),
        dataIndex: 'ecProductNum',
        width: 140,
      },
      {
        title: intl.get(`${promptKey}.ecproductname`).d('电商商品名称'),
        dataIndex: 'ecProductName',
        width: 260,
        render: (_, record) => {
          return <span title={record.ecProductName}>{record.ecProductName}</span>;
        },
      },
      {
        title: intl.get(`scec.goodsApprove.model.goodsApprove.operate`).d('操作'),
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.preview(record.ecProductId);
              }}
            >
              {intl.get('scec.goodsApprove.model.goodsApprove.preview').d('预览')}
            </a>
          );
        },
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl
          .get(`${promptKey}.currentEcCatalogNumber`, {
            ecCategoryName: ecCategoryName || '',
            JTtotalElements: JTtotalElements || 0,
          })
          .d(`当前电商分类：${ecCategoryName || ''}下共有${JTtotalElements || 0}件商品`)}
        visible={modalVisible}
        onCancel={onHandleCancel}
        footer={null}
        width={740}
      >
        <Form layout="inline" className="fields-form">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${promptKey}.ecproductnum`).d('电商商品编码')}
                {...formlayout}
              >
                {getFieldDecorator('ecProductNum')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${promptKey}.ecproductname`).d('电商商品名称')}
                {...formlayout}
              >
                {getFieldDecorator('ecProductName')(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Button data-code="reset" onClick={this.handlerFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: '8px' }}
                  onClick={this.fetchGoodsList}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          loading={loading || previewLoading}
          rowKey="ecProductId"
          dataSource={list.content || []}
          columns={columns}
          pagination={pagination}
          style={{ marginTop: '10px' }}
          onChange={page => this.fetchGoodsList(page)}
        />
      </Modal>
    );
  }
}
