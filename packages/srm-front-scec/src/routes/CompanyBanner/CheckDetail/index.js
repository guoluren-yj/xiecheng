/**
 * CompanyBanner - 公司Banner管理查看详情页面
 * @date: 2019-7-10
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Tabs, Modal, Spin, Collapse, Icon } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { addItemToPagination, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import GoodsLine from './GoodsLine';

const { Panel } = Collapse;
const FormItem = Form.Item;
// const viewPrompt = 'ssrc.companyBanner.view.message';
const messagePrompt = 'scec.companyBanner.model.companyBanner';
const UEDDisplayFormItem = props => {
  const { label, value } = props;
  return (
    <Form.Item label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </Form.Item>
  );
};
@connect(({ companyBanner, loading, goodsPreview }) => ({
  goodsPreview,
  companyBanner,
  organizationId: getCurrentOrganizationId(),
  fetchCompanyBannerHeaderLoading: loading.effects['companyBanner/fetchCompanyBannerHeader'],
  fetchCompanyBannerLineLoading: loading.effects['companyBanner/fetchCompanyBannerLine'],
  saveGoodsLineLoading: loading.effects['companyBanner/saveGoodsLine'],
  deleteGoodsLineLoading: loading.effects['companyBanner/deleteGoodsLines'],
  productPreviewLoading: loading.effects['goodsPreview/fetchDetail'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.companyBanner', 'scec.common'] })
@cacheComponent({ cacheKey: '/scec/company-banner/Detail' })
export default class CheckDetail extends Component {
  state = {
    goodsLineSelectedRowKeys: [], // 商品复选框
    bannerTypeValue: undefined, // banner类型值
    productPreviewLoading: this.props.productPreviewLoading || false,
    collapseKeys: {},
  };

  componentDidMount() {
    const {
      location: { state = { _back: 1 } },
    } = this.props;
    if (state && state._back !== -1) {
      this.handleSearch();
    }
  }

  @Bind()
  handleSearch() {
    this.fetchBannerHeader();
    this.fetchBannerLine();
    this.fetchSourceFrom();
    this.fetchBannerTypeValue();
  }

  /**
   * 查询-banner头
   * 租户级传organizationId
   */
  @Bind()
  fetchBannerHeader() {
    const {
      dispatch,
      organizationId,
      match: { params },
      location: { pathname },
    } = this.props;
    let payload = {};
    payload = pathname.match('platform-banner')
      ? { bannerId: params.bannerId }
      : { bannerId: params.bannerId, organizationId };
    dispatch({
      type: 'companyBanner/fetchCompanyBannerHeader',
      payload,
    }).then(res => {
      if (res) {
        this.setState({
          bannerTypeValue: res.bannerType,
        });
      }
    });
  }

  /**
   * 查询-Banner类型值集
   */
  @Bind()
  fetchBannerTypeValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'companyBanner/fetchBannerTypeValue',
    });
  }

  /**
   * 查询-banner行
   * 租户级传organizationId
   */
  @Bind()
  fetchBannerLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      location: { pathname },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let payload = {};
    payload = pathname.match('platform-banner')
      ? { ...fieldValues, bannerId: params.bannerId, page }
      : { ...fieldValues, bannerId: params.bannerId, page, organizationId };
    dispatch({
      type: 'companyBanner/fetchCompanyBannerLine',
      payload,
    });
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询-商品来源值集
   */
  @Bind()
  fetchSourceFrom() {
    const { dispatch } = this.props;
    dispatch({
      type: 'companyBanner/fetchSourceFrom',
    });
  }

  /**
   * 图片上传成功后的回调
   */
  @Bind()
  uploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        imagePath: file.response,
      });
    }
  }

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        imagePath: '',
      });
    }
  }

  /**
   * 商品-新增行
   */
  @Bind()
  createGoodsLine() {
    const {
      dispatch,
      match: { params },
      companyBanner: { line = [], linePagination = {} },
    } = this.props;
    dispatch({
      type: 'companyBanner/updateState',
      payload: {
        line: [
          {
            bannerId: params.bannerId,
            bannerAssginId: uuidv4(),
            sourceType: '',
            supplierCompanyId: -1,
            productId: '',
            productNum: '',
            productName: '',
            _status: 'create',
          },
          ...line,
        ],
        linePagination: addItemToPagination(line.length, linePagination),
      },
    });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeGoodsLineTableData() {
    const {
      dispatch,
      companyBanner: { goodsLineChange = false },
    } = this.props;
    if (!goodsLineChange) {
      dispatch({
        type: 'companyBanner/updateState',
        payload: {
          goodsLineChange: true,
        },
      });
    }
  }

  /**
   * 商品-分页
   */
  @Bind()
  changeGoodsLinePage(page) {
    const {
      dispatch,
      companyBanner: { goodsLineChange = false },
    } = this.props;
    if (goodsLineChange) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.saveFirstBeforeChange`).d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchBannerLine(page);
          dispatch({
            type: 'companyBanner/updateState',
            payload: {
              goodsLineChange: false,
            },
          });
        },
      });
    } else {
      // eslint-disable-next-line
      this.fetchBannerLine(page);
    }
  }

  /**
   * 改变banner类型
   * 单一商品切换到多商品，纯图片切换到多商品，不提示
   * 多商品(>1)切换到单一商品，提示删除，纯图片切换到单一商品，不提示
   * 商品切换到纯图片，提示删除，单一商品切换到纯图片，提示删除
   * 1-单一商品，2-多商品，3-纯图片
   */
  @Bind()
  changeBannerType(value, item) {
    const {
      form: { getFieldValue, setFieldsValue },
      companyBanner: { line = [] },
    } = this.props;
    // 单一商品
    if (getFieldValue('bannerType') === '1') {
      // 单一商品切换到纯图片
      if (value === '3') {
        if (!isEmpty(line)) {
          Modal.confirm({
            title: intl.get(`${messagePrompt}.deleteItemsFirst`).d('请先删除商品！'),
            //           footer:
            //             <Button key="submit" type="primary" onClick={this.handleOk} >
            //               确定
            // </Button>,
            onOk: () => {
              this.setState({
                bannerTypeValue: getFieldValue('bannerType'),
              });
            },
          });
        } else {
          this.setState({
            bannerTypeValue: value,
          });
          setFieldsValue({
            bannerType: value,
          });
        }
      }
      // 单一商品切换到多商品
      if (value === '2') {
        this.setState({
          bannerTypeValue: value,
        });
        setFieldsValue({
          bannerType: value,
        });
      }
    }
    // 多商品
    if (getFieldValue('bannerType') === '2') {
      // 多商品切换到单一商品
      if (value === '1') {
        if (line && line.length > 1) {
          Modal.confirm({
            title: intl.get(`${messagePrompt}.deleteItemsFirst`).d('请先删除商品！'),
            onOk: () => {
              this.setState({
                bannerTypeValue: getFieldValue('bannerType'),
              });
            },
          });
        } else {
          this.setState({
            bannerTypeValue: value,
          });
          setFieldsValue({
            bannerType: value,
          });
        }
      }
      // 多商品切换到纯图片
      if (value === '3') {
        if (!isEmpty(line)) {
          Modal.confirm({
            title: intl.get(`${messagePrompt}.deleteItemsFirst`).d('请先删除商品！'),
            onOk: () => {
              this.setState({
                bannerTypeValue: getFieldValue('bannerType'),
              });
            },
          });
        } else {
          this.setState({
            bannerTypeValue: value,
          });
          setFieldsValue({
            bannerType: value,
          });
        }
      }
    }
    // 纯图片
    if (getFieldValue('bannerType') === '3') {
      this.setState({
        bannerTypeValue: value,
      });
      setFieldsValue({
        bannerType: value,
      });
    }

    setFieldsValue({
      bannerTypeName: item ? item.props.children : undefined,
    });
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    const { getFieldValue } = record.$form;
    openTab({
      key: '/scec/commom-goods-preview',
      title: intl.get('scec.common.button.goodsPreview').d('商品预览'),
      search: qs.stringify({
        productId: getFieldValue('productId'),
        platformCode: getFieldValue('sourceFrom'),
      }),
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  renderHeaderForm() {
    const {
      companyBanner: { header = {} },
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    getFieldDecorator('bannerTypeName', { initialValue: header.bannerTypeName });
    return (
      <React.Fragment>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${messagePrompt}.orderSeq`).d('排序号')}
              value={header.orderSeq || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${messagePrompt}.bannerName`).d('Banner名称')}
              value={header.bannerName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${messagePrompt}.bannerType`).d('Banner类型')}
              value={header.bannerTypeName || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${messagePrompt}.image`).d('图片')}
            >
              <div
                className="border"
                style={{ border: '1px solid rgb(233, 232, 232)', width: '195px', height: '66px' }}
              >
                <img
                  src={header.imagePath}
                  alt={intl.get(`${messagePrompt}.image`).d('图片')}
                  style={{
                    display: 'inline-block',
                    width: '60px',
                    height: '60px',
                    padding: '5px 0 5px 5px',
                  }}
                />
                <a
                  href={header.imagePath}
                  target="blank"
                  style={{
                    display: 'inline-block',
                    width: '120px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    margin: '10px 0 0 5px',
                  }}
                >
                  {header.imageName}
                </a>
              </div>
            </FormItem>
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.startDate').d('开始时间')}
              value={header.startDate || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间')}
              value={header.endDate || ''}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }

  render() {
    const {
      fetchCompanyBannerHeaderLoading,
      fetchCompanyBannerLineLoading,
      saveGoodsLineLoading,
      deleteGoodsLineLoading,
      location: { pathname },
      match: { params },
      companyBanner: { line = [], linePagination = {}, sourceType },
    } = this.props;
    const {
      goodsLineSelectedRowKeys,
      productPreviewLoading,
      bannerTypeValue,
      collapseKeys,
    } = this.state;

    const goodsLineProps = {
      pathname,
      bannerTypeValue,
      sourceType,
      goodsLineSelectedRowKeys,
      loading: fetchCompanyBannerLineLoading,
      saveLoading: saveGoodsLineLoading,
      deleteLoading: deleteGoodsLineLoading,
      companyId: params.companyId,
      dataSource: line,
      pagination: linePagination,
      onRef: this.handleBindRef,
      onSearch: this.fetchBannerLine,
      onCreateLine: this.createGoodsLine,
      onChange: this.changeGoodsLinePage,
      onPreviewProduct: this.productPreview,
      // onSaveLine: this.saveGoodsLine,
      onDeleteLines: this.deleteGoodsLines,
      onChangeTableData: this.changeGoodsLineTableData,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${messagePrompt}.viewBanner`).d('查看banner')}
          backPath={
            pathname.match('platform-banner')
              ? '/scec/platform-banner/list'
              : '/scec/company-banner/list'
          }
        />
        <Content>
          <Spin
            spinning={fetchCompanyBannerHeaderLoading || productPreviewLoading}
            wrapperClassName="ued-detail-wrapper"
          >
            <Collapse
              defaultActiveKey={['bannerDetail']}
              onChange={arr => this.onCollapseChange(arr, 'bannerDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${messagePrompt}.bannerDetail`).d('Banner明细')}</h3>
                    <a>
                      {collapseKeys.bannerDetail
                        ? collapseKeys.bannerDetail.some(o => o === 'bannerDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.bannerDetail
                          ? collapseKeys.bannerDetail.some(o => o === 'bannerDetail')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="bannerDetail"
              >
                {this.renderHeaderForm()}
              </Panel>
            </Collapse>
            {bannerTypeValue === '3' ? (
              ''
            ) : (
              <Tabs defaultActiveKey="goods" animated={false}>
                <Tabs.TabPane tab={intl.get(`${messagePrompt}.commodity`).d('商品')} key="goods">
                  <GoodsLine {...goodsLineProps} />
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
