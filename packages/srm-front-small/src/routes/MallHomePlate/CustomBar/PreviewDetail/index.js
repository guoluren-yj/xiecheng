import React, { Component } from 'react';
import { connect } from 'dva';
import qs from 'querystring';
import { Form, Modal, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Row, Col, Icon } from 'choerodon-ui';
import { DataSet, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import { productsDS } from './productsDS';
import { channelTableDs } from '../Detail/channelTableDs';
import ImageViewer from '@/routes/Components/ImageViewer';
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
  headerLoading: loading.effects['mallHomePlate/fetchBarHeader'],
  organizationId: getCurrentOrganizationId(),
}))
export default class PreviewDetail extends Component {
  productsDS = new DataSet(productsDS());

  channelTableDs = new DataSet(channelTableDs);

  state = {
    viewVisible: false,
    imgList: [],
  };

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    this.fetchHeader(params);
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

  /**
   * 频道图片预览
   */
  @Bind()
  handleViewImg(imagePath) {
    this.setState({
      viewVisible: true,
      imgList: [{ fileUrl: imagePath }],
    });
  }

  @Bind()
  fetchHeader(params = {}) {
    const { dispatch, organizationId } = this.props;
    let payload = {};
    payload = { barId: params.barId, organizationId };
    dispatch({
      type: 'mallHomePlate/fetchBarHeader',
      payload,
    }).then((res) => {
      if (res) {
        if (res.barType === 'CHANNEL') {
          this.channelTableDs.setQueryParameter('barId', params.barId);
          this.channelTableDs.query();
        } else {
          this.productsDS.setQueryParameter('barId', params.barId);
          this.productsDS.setQueryParameter('companyId', params.companyId);
          this.productsDS.query();
        }
      }
    });
  }

  render() {
    const {
      mallHomePlate: { barHeaderInfo: header = {} },
    } = this.props;
    const { viewVisible, imgList } = this.state;
    const columns = [
      {
        name: 'sourceFrom',
        width: 100,
        renderer: ({ value }) =>
          value === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
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
      //       {intl.get(`small.mallHomePlate.model.preview`).d('预览')}
      //     </a>
      //   ),
      // },
    ];
    const channelColumns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'channelName',
      },
      {
        name: 'channelTypeName',
        width: 150,
      },
      {
        name: 'customChannelRangeList',
        width: 200,
        renderer: ({ record }) => {
          const { channelType, customChannelRangeList = [] } = record.data;
          const newCustomChannelRange = customChannelRangeList.map((n) => {
            let channelRange;
            switch (channelType) {
              case 'SUPPLIER':
                channelRange = n.supplierCompanyName;
                break;
              case 'CATEGORY':
                channelRange = n.categoryName;
                break;
              case 'SALE':
                channelRange = n.productSaleName;
                break;
              default:
                break;
            }
            return channelRange;
          });
          return newCustomChannelRange.join('/');
        },
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'shelfFlag',
        width: 100,
        renderer: ({ record }) => {
          return record.data.shelfFlag === '1'
            ? intl.get('small.ecProductQuery.model.ecProductQuery.onShelves').d('已上架')
            : intl.get('small.ecProductQuery.model.ecProductQuery.notOnShelves').d('未上架');
        },
      },
      // {
      //   name: 'option',
      //   width: 200,
      //   lock: 'right',
      //   renderer: ({ record }) => {
      //     return (
      //       <a onClick={() => this.handleViewImg(record.get('imagePath'))}>
      //         {intl.get('small.common.model.preview').d('预览')}
      //       </a>
      //     );
      //   },
      // },
    ];
    const newColunms = header.barType === 'CHANNEL' ? channelColumns : columns;
    const newDs = header.barType === 'CHANNEL' ? this.channelTableDs : this.productsDS;
    return (
      <React.Fragment>
        <Header
          title={intl.get('small.mallHomePlate.view.viewBarDetail').d('查看自定义栏详情')}
          backPath="/small/mall-home-plate/list?key=bar"
        />
        <Content>
          <div className={styles['small-banner']}>
            <h3 className="small-banner-detail">
              {intl.get(`small.mallHomePlate.view.customBar.detail`).d('自定义栏明细')}
            </h3>
            <Row gutter={48}>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.mallHomePlate.model.barName`).d('自定义栏名称')}
                  value={header.barName}
                />
              </Col>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.mallHomePlate.model.quickPositName`).d('快速定位栏名称')}
                  value={header.mallBarName}
                />
              </Col>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.mallHomePlate.model.barType`).d('自定义栏类型')}
                  value={header.barTypeName}
                />
              </Col>
            </Row>
            <Row gutter={48}>
              {header.barType !== 'CHANNEL' && (
                <Col span={8}>
                  <UEDDisplayFormItem
                    label={intl.get(`small.mallHomePlate.model.labelCode`).d('标签页')}
                    value={header.labelName}
                  />
                </Col>
              )}
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.common.model.startTime`).d('开始时间')}
                  value={header.startDate}
                />
              </Col>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.common.model.endTime`).d('截止时间')}
                  value={header.endDate}
                />
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <UEDDisplayFormItem
                  label={intl.get(`small.common.only.show.stock`).d('包含无货商品')}
                  value={
                    header.stockAvailableEnabled === '1'
                      ? intl.get('hzero.common.button.yes').d('是')
                      : intl.get('hzero.common.button.no').d('否')
                  }
                />
              </Col>
              {header.imagePath && (
                <Col span={8}>
                  <Form.Item
                    label={intl.get('small.mallHomePlate.view.mall.barImage').d('商城自定义栏图片')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
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
                </Col>
              )}
              {header.iconPath && (
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('small.mallHomePlate.model.mobileCustomBarImage')
                      .d('移动端自定义栏图片')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={header.mobileImageName || 'mobileCustomBar'}
                    >
                      {header.iconPath && (
                        <div className="preview-img-box">
                          <img
                            src={header.iconPath}
                            alt={header.mobileImageName || 'mobileCustomBar'}
                            style={{ width: 100, height: 50 }}
                          />
                          <div className="cover">
                            <a
                              onClick={() =>
                                this.setState({
                                  viewVisible: true,
                                  imgList: [{ fileUrl: header.iconPath }],
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
                </Col>
              )}
            </Row>
            <h3 className="small-banner-detail">
              {header.barType !== 'CHANNEL'
                ? intl.get(`small.common.model.goods`).d('商品')
                : intl.get(`small.mallHomePlate.view.channel`).d('频道')}
            </h3>
            <Table key="barAssignId" border={null} dataSet={newDs} columns={newColunms} />
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
