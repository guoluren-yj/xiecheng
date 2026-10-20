/**
 * 平台电商商品详情弹框
 * * @date: 2019-8-02
 * @author LH <heng.liu@hand-china.com>
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Modal, Table, Form, Button, Input, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import qs from 'querystring';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const prompt = 'scec.productDetailsModal.model';
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-category-platform-catalog/list' })
@connect(({ productDetailsModal, loading }) => ({
  productDetailsModal,
  loading: loading.effects['productDetailsModal/fetchEcGoodsList'],
  previewLoading: loading.effects['productDetailsModal/fetchEcGoodsPreview'],
}))
@withRouter
export default class index extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: '0',
      companyId: '-1',
      isFirst: true,
    };
  }

  componentDidMount() {
    if (this.props._back === -1) {
      this.fetchGoodsList();
    }
  }

  /**
   * Modal查询
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch, ecCategoryId, ecPlatformCode } = this.props;
    const { companyId, tenantId } = this.state;
    this.props.form.validateFields((err, values) => {
      const fieldValues = filterNullValueObject(values);
      if (!err) {
        dispatch({
          type: 'productDetailsModal/fetchEcGoodsList',
          payload: {
            page: isEmpty(params) ? {} : params,
            ...fieldValues,
            companyId,
            tenantId,
            ecCategoryId,
            ecPlatformCode,
          },
        }).then(res => {
          if (this.state.isFirst) {
            this.setState({
              isFirst: false,
            });
            dispatch({
              type: 'productDetailsModal/updateState',
              payload: {
                totalElements: res.totalElements,
              },
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
  preview(params) {
    const { dispatch, ecPlatformCode } = this.props;
    const { companyId } = this.state;
    dispatch({
      type: 'productDetailsModal/fetchEcGoodsPreview',
      payload: {
        ecProductId: params,
        companyId,
        ecPlatformCode,
      },
    }).then(() => {
      const data = this.props.productDetailsModal.Ecdetail;
      if (data) {
        this.openPreview(data);
      }
    });
  }

  /**
   * 打开详情页
   */
  @Bind
  openPreview(res) {
    const {
      location: { pathname = '', search = '' },
    } = this.props;
    const detailUrl = pathname + search; // 商品详情返回跳转路径
    const { ecProductImageList, ecProductDetail, productImageList, productDetail } = res;
    const imageList = ecProductImageList || productImageList || [];
    const detail = ecProductDetail || productDetail;
    const primaryImgIndex = imageList.findIndex(item => !!item.ecPrimaryFlag);
    const newImageList =
      primaryImgIndex === -1
        ? imageList
        : [
            imageList[primaryImgIndex],
            ...imageList.slice(0, primaryImgIndex),
            ...imageList.slice(primaryImgIndex + 1),
          ];
    const selectImg = newImageList[0] && newImageList[0].imagePath;
    const pathnameUrl = `/scec/ec-category-platform-catalog/goods-preview`;
    const router = {
      pathname: pathnameUrl,
      state: {
        sourceFrom: 'EC',
        baseInfoList: qs.stringify(res),
        htmlList: qs.stringify(detail),
        productImageList: newImageList,
        detailUrl,
        selectImg,
      },
    };
    this.props.history.push(router);
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
      productDetailsModal: { Ecpagination = {}, Eclist = {}, totalElements },
      loading,
      onHandleCancel,
      ecCategoryName,
      modalVisible,
      previewLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.ecplatformname`).d('电商名称'),
        dataIndex: 'ecPlatformName',
        width: 100,
      },
      {
        title: intl.get(`${prompt}.ecproductnum`).d('电商商品编码'),
        dataIndex: 'ecProductNum',
        width: 140,
      },
      {
        title: intl.get(`${prompt}.ecproductname`).d('电商商品名称'),
        dataIndex: 'ecProductName',
        width: 260,
        render: (_, record) => {
          return <span title={record.ecProductName}>{record.ecProductName}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.button.action').d('操作'),
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
        title={`${intl
          .get('scec.productDetailsModal.model.classify')
          .d('当前电商分类')}：${ecCategoryName || ''}
          ${intl.get('scec.productDetailsModal.model.total').d('下共有')}${totalElements || 0}
          ${intl.get('scec.productDetailsModal.model.productNum').d('件商品')}`}
        visible={modalVisible}
        onCancel={onHandleCancel}
        footer={null}
        width={740}
      >
        <Form layout="inline" className="fields-form">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.ecproductnum`).d('电商商品编码')}
                {...formlayout}
              >
                {getFieldDecorator('ecProductNum')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.ecproductname`).d('电商商品名称')}
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
          dataSource={Eclist.content || []}
          columns={columns}
          pagination={Ecpagination}
          style={{ marginTop: '10px' }}
          onChange={page => this.fetchGoodsList(page)}
        />
      </Modal>
    );
  }
}
