import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Row, Col, Icon } from 'choerodon-ui';
import { Form, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import qs from 'querystring';

import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import ImageViewer from '@/routes/Components/ImageViewer';
import { productsDS } from './productsDS';
import styles from './index.less';

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <Form.Item label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      <div
        title={value}
        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {value}
      </div>
    </Form.Item>
  );
};
@connect(({ mallHomePlate, loading }) => ({
  mallHomePlate,
  organizationId: getCurrentOrganizationId(),
  headLoading: loading.effects['mallHomePlate/fetchBannerHeader'],
}))
export default class PreviewDetail extends Component {
  productsDS = new DataSet(productsDS());

  state = {
    viewVisible: false,
    imgList: [],
  };

  componentDidMount() {
    const {
      // dispatch,
      location: { state = { _back: 1 } },
      match: { params },
    } = this.props;
    if (state && state._back !== -1) {
      this.fetchBannerHeader(params.bannerId);
    }
    this.productsDS.setQueryParameter('bannerId', params.bannerId);
    this.productsDS.query();
  }

  @Bind()
  fetchBannerHeader(bannerId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/fetchBannerHeader',
      payload: { bannerId },
    });
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    if (!record.data.productId) {
      Modal.confirm({
        title: intl.get(`small.mallHomePlate.model.Please.select.products!`).d('请选择商品！'),
        onOk: () => {
          this.setState();
        },
      });
      return;
    }
    const {
      match: {
        params: { companyId },
      },
    } = this.props;
    openTab({
      key: `/small/commom-goods-preview`,
      title: intl.get('small.common.button.previewGoods').d('商品预览'),
      search: qs.stringify({
        productId: record.data.productId,
        sourceFrom: record.data.sourceFrom,
        companyId,
      }),
    });
  }

  render() {
    const {
      mallHomePlate: { bannerHeaderInfo: header = {} },
    } = this.props;
    const { viewVisible, imgList } = this.state;
    const bannerColumns = [
      {
        name: 'sourceType',
        width: 100,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'productNum',
        width: 200,
      },
      {
        name: 'productName',
        minWidth: 250,
      },
      {
        name: 'shelfFlag',
        width: 100,
        align: 'left',
        renderer: ({ record }) =>
          record.data.shelfFlag ? (
            intl.get('small.common.model.shelves').d('上架')
          ) : (
            <Popover
              content={
                record.data.shelfErrorMessage ||
                intl.get('small.common.view.manual.unShelf').d('手动下架')
              }
            >
              {intl.get('small.common.model.unShelves').d('下架')}
            </Popover>
          ),
      },
      // {
      //   name: 'operate',
      //   width: 100,
      //   renderer: ({ record }) => (
      //     <a onClick={() => this.productPreview(record)}>
      //       {intl.get(`small.common.model.preview`).d('预览')}
      //     </a>
      //   ),
      // },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('small.mallHomePlate.view.banner.detail').d('查看banner详情')}
          backPath="/small/mall-home-plate/list"
        />
        <Content>
          <div className={styles['small-banner']}>
            <h3 className="small-banner-detail">
              {intl.get('small.mallHomePlate.view.banner.baseInfo').d('Banner基本信息')}
            </h3>
            <Row gutter={48}>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.mallHomePlate.model.bannerName`).d('Banner名称')}
                  value={header.bannerName}
                />
              </Col>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.common.model.endTime`).d('截止时间')}
                  value={header.endDate}
                />
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('small.mallHomePlate.model.mallBannerImg').d('商城Banner图片')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      // display: 'inline-block',
                      // width: '295px',
                    }}
                    title={header.imageName || 'banner'}
                  >
                    {header.imagePath && (
                      <div className="preview-img-box">
                        <img
                          src={header.imagePath}
                          alt={`${header.imageName || 'banner'}`}
                          style={{ width: 100, height: 50 }}
                        />
                        <div className="cover">
                          <a
                            onClick={() =>
                              this.setState({
                                viewVisible: true,
                                imgList: [{ fileUrl: header.imagePath }],
                              })
                            }
                          >
                            <Icon type="visibility" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Item>
                {/* <UEDDisplayFormItem label="商城banner图片" value="甄云默认banner" /> */}
              </Col>
            </Row>
            <Row gutter={48}>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.mallHomePlate.model.bannerType`).d('Banner类型')}
                  value={header.bannerTypeName}
                />
              </Col>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.common.model.startTime`).d('开始时间')}
                  value={header.startDate}
                />
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get('small.mallHomePlate.model.mobileBannerImg')
                    .d('移动端Banner图片')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={header.mobileImageName || 'mobilebanner'}
                  >
                    {header.mobileImageUrl && (
                      <div className="preview-img-box">
                        <img
                          src={header.mobileImageUrl}
                          alt={header.mobileImageName || 'mobilebanner'}
                          style={{ width: 100, height: 50 }}
                        />
                        <div className="cover">
                          <a
                            onClick={() =>
                              this.setState({
                                viewVisible: true,
                                imgList: [{ fileUrl: header.mobileImageUrl }],
                              })
                            }
                          >
                            <Icon type="visibility" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Item>
                {/* <UEDDisplayFormItem label="移动端banner图片" value="甄云默认banner" /> */}
              </Col>
            </Row>
            <h3 className="small-banner-detail">
              {intl.get(`small.common.model.goods`).d('商品')}
            </h3>
            <Table
              key="bannerAssignId"
              border={null}
              dataSet={this.productsDS}
              columns={bannerColumns}
            />
          </div>
          {viewVisible && (
            <ImageViewer
              imgList={imgList}
              closeModal={() => this.setState({ viewVisible: false, imgList: [] })}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
