/**
 * 公司电商商品详情弹框
 * * @date: 2019-8-01
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
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject, getUserOrganizationId } from 'utils/utils';
import qs from 'querystring';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const prompt = 'scec.productDetailsModal.model';
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-category-company-catalog/list' })
@connect(({ productDetailsModal, loading }) => ({
  productDetailsModal,
  loading: loading.effects['productDetailsModal/fetchCompanyGoodsList'],
  previewLoading: loading.effects['productDetailsModal/fetchCompanyGoodsPreview'],
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
        companylist: {},
        companypagination: {},
        companydetail: {},
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
    const { organizationId, companyId, isFirst } = this.state;
    this.props.form.validateFields((err, values) => {
      const fieldValues = filterNullValueObject(values);
      if (!err) {
        dispatch({
          type: 'productDetailsModal/fetchCompanyGoodsList',
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
                ComtotalElements: res.totalElements,
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
    const pathnameUrl = `/scec/ec-category-company-catalog/goods-preview`;
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
      productDetailsModal: { companypagination = {}, companylist = {}, ComtotalElements },
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
        title: intl.get(`scec.common.model.button.action`).d('操作'),
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
          .get('scec.goodsApprove.model.goodsApprove.classify')
          .d('当前电商分类：')}${ecCategoryName || ''}${intl
          .get('scec.goodsApprove.model.goodsApprove.total')
          .d('下共有')}${ComtotalElements || 0}${intl
          .get('scec.goodsApprove.model.goodsApprove.productNum')
          .d('件商品')}`}
        visible={modalVisible}
        onCancel={onHandleCancel}
        footer={null}
        width={705}
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
          dataSource={companylist.content || []}
          columns={columns}
          pagination={companypagination}
          style={{ marginTop: '10px' }}
          onChange={page => this.fetchGoodsList(page)}
        />
      </Modal>
    );
  }
}
