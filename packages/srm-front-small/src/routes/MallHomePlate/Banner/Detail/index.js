/**
 * CompanyBanner - 公司Banner管理详情页面
 * @date: 2019-2-27
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Button,
  Select,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Tabs,
  Modal,
  // InputNumber,
  Spin,
  Collapse,
  Icon,
} from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import { routerRedux } from 'dva/router';
import { isEmpty, filter, isUndefined } from 'lodash';
// import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  // addItemToPagination,
  getEditTableData,
  delItemsToPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

import GoodsLine from './GoodsLine';
import MultipleSelectionLov from '../MultipleSelectionLov';
import CroperModal from '@/routes/Components/CroperModal';

const { Panel } = Collapse;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
// const viewPrompt = 'ssrc.companyBanner.view.message';

@connect(({ mallHomePlate, loading, goodsPreview }) => ({
  mallHomePlate,
  goodsPreview,
  organizationId: getCurrentOrganizationId(),
  saveCompanyBannerLoading: loading.effects['mallHomePlate/saveBanner'],
  fetchCompanyBannerHeaderLoading: loading.effects['mallHomePlate/fetchBannerHeader'],
  fetchCompanyBannerLineLoading: loading.effects['mallHomePlate/getBannerProduct'],
  deleteGoodsLineLoading: loading.effects['mallHomePlate/delBannerGoodsLines'],
  productPreviewLoading: loading.effects['goodsPreview/fetchProductDetail'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['small.companyBanner', 'small.common'] })
@cacheComponent({ cacheKey: '/small/company-banner/Detail' })
export default class Create extends Component {
  state = {
    goodsLineSelectedRowKeys: [], // 商品复选框
    bannerTypeValue: undefined, // banner类型值
    productPreviewLoading: this.props.productPreviewLoading || false,
    collapseKeys: {},
    imageType: 1,
  };

  croperModal;

  componentDidMount() {
    const {
      location: { state = { _back: 1 } },
    } = this.props;
    if (state && state._back !== -1) {
      this.handleSearch();
    }
    this.fetchTree();
    this.props.dispatch({
      type: 'mallHomePlate/init',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/updateState',
      payload: {
        bannerHeaderInfo: {},
        bannerProductList: [],
      },
    });
  }

  @Bind()
  fetchTree() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/fetchTypeTree',
    });
  }

  @Bind()
  handleSearch() {
    this.props.form.resetFields();
    this.fetchBannerHeader();
    this.fetchBannerLine();
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
    } = this.props;
    const payload = { bannerId: params.bannerId, organizationId };
    dispatch({
      type: 'mallHomePlate/fetchBannerHeader',
      payload,
    }).then((res) => {
      if (res) {
        this.setState({
          bannerTypeValue: res.bannerType,
        });
      }
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
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const payload = { ...fieldValues, bannerId: params.bannerId, page, organizationId };
    dispatch({
      type: 'mallHomePlate/getBannerProduct',
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
   * 图片上传成功后的回调
   */
  @Bind()
  uploadSuccess(file = { url: '' }) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        imagePath: url,
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
   * 图片上传成功后的回调
   */
  @Bind()
  uploadMobileSuccess(file) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        mobileImageUrl: url,
      });
    }
  }

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelMobileSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        mobileImageUrl: '',
      });
    }
  }

  /**
   * 保存-公司banner
   * 租户级传organizationId
   */
  @Bind()
  saveCompanyBanner() {
    const {
      dispatch,
      form,
      organizationId,
      mallHomePlate: {
        bannerHeaderInfo = {},
        bannerProductList = [],
        productBannerDataChange = false,
      },
      // match: { params },
    } = this.props;
    // 先验证头
    const save = (payload) => {
      dispatch({
        type: 'mallHomePlate/saveBanner',
        payload,
      }).then((res) => {
        if (res) {
          if (productBannerDataChange) {
            dispatch({
              type: 'smallCompanyBanner/updateState',
              payload: {
                productBannerDataChange: false,
              },
            });
          }
          notification.success();
          this.handleSearch();
        }
      });
    };
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        // 有行的话，验证行
        const params = {
          orderSeq: 1,
          ...bannerHeaderInfo,
          ...values,
          bannerType: this.state.bannerTypeValue,
          organizationId,
          startDate: values.startDate
            ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
        };
        if (!isEmpty(bannerProductList)) {
          const line = bannerProductList && getEditTableData(bannerProductList, ['bannerAssginId']);
          if (!isEmpty(line)) {
            // 预览后getEditTableData字段值丢失（暂时这么处理）
            params.bannerAssignList = line.map((n) => {
              const newLine = bannerProductList.find((m) => m.productNum === n.productNum);
              const { productId, sourceFrom } = newLine;
              return {
                ...n,
                productId,
                sourceFrom,
              };
            });
            save(params);
          }
        } else {
          save(params);
        }
      }
    });
  }

  /**
   * 绑定供应商ref
   */
  @Bind()
  handleBindMtpLovRef(ref = {}) {
    this.mtpLovRecord = ref;
  }

  /**
   * 商品-新增行
   */
  @Bind()
  handleCreateLine() {
    this.mtpLovRecord.handleSupplierModal();
  }

  /**
   * 商品 - 批量删除
   * 租户级传organizationId
   */
  @Bind()
  deleteGoodsLines() {
    const {
      dispatch,
      organizationId,
      mallHomePlate: { bannerProductList = [], bannerProductPage = {} },
    } = this.props;
    const { goodsLineSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(bannerProductList, (item) => {
      return goodsLineSelectedRowKeys.indexOf(item.bannerAssginId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newSupplierList = filter(bannerProductList, (item) => {
      return goodsLineSelectedRowKeys.indexOf(item.bannerAssginId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          this.setState({ goodsLineSelectedRowKeys: [] }, () => {
            dispatch({
              type: 'smallCompanyBanner/updateState',
              payload: {
                bannerProductList: newSupplierList,
                bannerProductPage: delItemsToPagination(
                  newParameters.length,
                  bannerProductList.length,
                  bannerProductPage
                ),
              },
            });
          });
        } else {
          const payload = { remoteDelete, organizationId };
          dispatch({
            type: 'mallHomePlate/delBannerGoodsLines',
            payload,
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              this.setState({ goodsLineSelectedRowKeys: [] }, () => {
                this.fetchBannerLine(bannerProductPage);
              });
            }
          });
        }
      },
    });
  }

  /**
   * 物品-获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleGoodsLineRowSelectChange(selectedRowKeys) {
    this.setState({ goodsLineSelectedRowKeys: selectedRowKeys });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeGoodsLineTableData() {
    const {
      dispatch,
      mallHomePlate: { productBannerDataChange = false },
    } = this.props;
    if (!productBannerDataChange) {
      dispatch({
        type: 'mallHomePlate/updateState',
        payload: {
          productBannerDataChange: true,
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
      mallHomePlate: { productBannerDataChange = false },
    } = this.props;
    if (productBannerDataChange) {
      Modal.confirm({
        title: intl
          .get(`small.mallHomePlate.model.saveFirstBeforeChange`)
          .d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchBannerLine(page);
          dispatch({
            type: 'mallHomePlate/updateState',
            payload: {
              productBannerDataChange: false,
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
      mallHomePlate: { bannerProductList = [] },
    } = this.props;
    // 单一商品
    if (getFieldValue('bannerType') === '1') {
      // 单一商品切换到纯图片
      if (value === '3') {
        if (!isEmpty(bannerProductList)) {
          Modal.confirm({
            title: intl.get(`small.mallHomePlate.model.deleteItemsFirst`).d('请先删除商品！'),
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
        if (bannerProductList && bannerProductList.length > 1) {
          Modal.confirm({
            title: intl.get(`small.mallHomePlate.model.deleteItemsFirst`).d('请先删除商品！'),
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
        if (!isEmpty(bannerProductList)) {
          Modal.confirm({
            title: intl.get(`small.mallHomePlate.model.deleteItemsFirst`).d('请先删除商品！'),
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
    if (!getFieldValue('productId') && !record.productId) {
      Modal.confirm({
        title: intl.get(`small.mallHomePlate.model.pleaseSelectItems`).d('请选择商品！'),
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
        productId: getFieldValue('productId') || record.productId,
        sourceFrom: getFieldValue('sourceFrom') || record.sourceFrom,
        companyId,
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

  /**
   * 开始时间
   * @param {*} current
   */
  @Bind()
  selectDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('endDate')) {
      return (
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('endDate')).isBefore(current, 'day')
      );
    } else {
      return current && current < moment().subtract(1, 'days').endOf('day') - 1;
    }
  }

  /**
   * 结束时间
   * @param {*} current
   */
  @Bind()
  selectToDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (
      getFieldValue('startDate') &&
      current &&
      current <
        Math.max.apply(this, [
          moment(getFieldValue('startDate')).startOf('day'),
          moment(current).startOf('day'),
        ])
    ) {
      // return moment(getFieldValue('startDate')).isAfter(current, 'day');
      return true;
    } else {
      return current && current < moment().subtract(1, 'days').endOf('day');
    }
  }

  /**
   * 时间禁用范围
   */
  @Bind
  range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   * 时间禁用
   */
  @Bind
  disabledDateTime(currentDate) {
    const startDate = this.props.form.getFieldValue('startDate');
    if (moment(currentDate).format('YYYYMMDD') === moment(startDate).format('YYYYMMDD')) {
      return {
        disabledHours: () => this.range(0, 24).splice(0, moment(startDate).hours()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === moment(startDate).hours()) {
            return this.range(0, 60).splice(0, moment(startDate).minutes());
          } else {
            return [];
          }
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (
            selectedHour === moment(startDate).hours() &&
            selectedMinute === moment(startDate).minutes()
          ) {
            return this.range(0, 60).splice(0, moment(startDate).seconds());
          } else {
            return [];
          }
        },
      };
    }
  }

  renderHeaderForm() {
    const {
      mallHomePlate: { bannerType = [], bannerHeaderInfo: header = {} },
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    getFieldDecorator('bannerTypeName', { initialValue: header.bannerTypeName });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.bannerName`).d('Banner名称')}
              {...formLayout}
            >
              {getFieldDecorator('bannerName', {
                initialValue: header.bannerName || null,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.bannerName`).d('Banner名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.bannerType`).d('Banner类型')}
              {...formLayout}
              required
            >
              <Select onChange={this.changeBannerType} value={this.state.bannerTypeValue}>
                {bannerType &&
                  bannerType.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('bannerType', {
                initialValue: header.bannerType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.bannerType`).d('Banner类型'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.startTime`).d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                initialValue: header.startDate && moment(header.startDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.startTime`).d('开始时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={this.selectDisabledDate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`small.common.model.endTime`).d('截止时间')} {...formLayout}>
              {getFieldDecorator('endDate', {
                initialValue: header.endDate && moment(header.endDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.endTime`).d('截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={this.selectToDisabledDate}
                  disabledTime={this.disabledDateTime}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`hzero.common.title.uploadImage`).d('上传图片')}
              extra={intl
                .get(`small.mallHomePlate.model.banner.uploadSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：2:1')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
              required
            >
              <Button
                onClick={() => {
                  this.setState({ imageType: 1 });
                  if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                }}
              >
                <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
              </Button>
              {getFieldValue('imagePath') && (
                <p
                  style={{
                    padding: 8,
                    borderRadius: 2,
                    border: '1px solid #d9d9d9',
                    position: 'relative',
                    marginTop: 8,
                  }}
                >
                  <img style={{ width: 90 }} src={getFieldValue('imagePath')} alt="" />
                  <Icon
                    onClick={() => {
                      setFieldsValue({
                        imagePath: '',
                      });
                    }}
                    style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                    type="close"
                  />
                </p>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('imagePath', {
                initialValue: header.imagePath,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.uploadMobileImage`).d('上传移动端图片')}
              extra={intl
                .get(`small.common.model.banner.uploadMobileSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：690x328px')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
            >
              <Button
                onClick={() => {
                  this.setState({ imageType: 2 });
                  if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                }}
              >
                <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
              </Button>
              {getFieldValue('mobileImageUrl') && (
                <p
                  style={{
                    padding: 8,
                    borderRadius: 2,
                    border: '1px solid #d9d9d9',
                    position: 'relative',
                    marginTop: 8,
                  }}
                >
                  <img style={{ width: 90 }} src={getFieldValue('mobileImageUrl')} alt="" />
                  <Icon
                    onClick={() => {
                      setFieldsValue({
                        mobileImageUrl: '',
                      });
                    }}
                    style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                    type="close"
                  />
                </p>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('mobileImageUrl', { initialValue: header.mobileImageUrl })(
                <div />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      saveCompanyBannerLoading,
      fetchCompanyBannerHeaderLoading,
      fetchCompanyBannerLineLoading,
      deleteGoodsLineLoading,
      match: { params },
      mallHomePlate: { bannerProductList = [], bannerProductPage = {}, sourceType = [] },
    } = this.props;
    const {
      goodsLineSelectedRowKeys,
      productPreviewLoading,
      bannerTypeValue,
      collapseKeys,
    } = this.state;
    const goodsRowSelection = {
      selectedRowKeys: goodsLineSelectedRowKeys,
      onChange: this.handleGoodsLineRowSelectChange,
    };

    const goodsLineProps = {
      bannerTypeValue,
      sourceType,
      goodsRowSelection,
      goodsLineSelectedRowKeys,
      loading: fetchCompanyBannerLineLoading,
      deleteLoading: deleteGoodsLineLoading,
      companyId: params.companyId,
      dataSource: bannerProductList,
      pagination: bannerProductPage,
      onRef: this.handleBindRef,
      onSearch: this.fetchBannerLine,
      onCreateLine: this.handleCreateLine,
      onChange: this.changeGoodsLinePage,
      onPreviewProduct: this.productPreview,
      onDeleteLines: this.deleteGoodsLines,
      onChangeTableData: this.changeGoodsLineTableData,
    };
    const multipleLovProps = {
      bannerId: params.bannerId,
      companyId: params.companyId,
      bannerType: bannerTypeValue,
      onRef: this.handleBindMtpLovRef,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`small.mallHomePlate.model.banner.edit`).d('编辑Banner')}
          backPath="/small/mall-home-plate/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.saveCompanyBanner}
            loading={saveCompanyBannerLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={fetchCompanyBannerHeaderLoading || productPreviewLoading}
            wrapperClassName="ued-detail-wrapper"
          >
            <Collapse
              defaultActiveKey={['bannerDetail']}
              onChange={(arr) => this.onCollapseChange(arr, 'bannerDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`small.mallHomePlate.model.bannerDetail`).d('Banner明细')}</h3>
                    <a>
                      {collapseKeys.bannerDetail
                        ? collapseKeys.bannerDetail.some((o) => o === 'bannerDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.bannerDetail
                          ? collapseKeys.bannerDetail.some((o) => o === 'bannerDetail')
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
                <Tabs.TabPane tab={intl.get(`small.common.model.goods`).d('商品')} key="goods">
                  <GoodsLine {...goodsLineProps} />
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
          <CroperModal
            fn={(ele) => {
              this.croperModal = ele;
            }}
            width={this.state.imageType === 1 ? 2 : 690}
            height={this.state.imageType === 1 ? 1 : 328}
            canvasStyle={
              this.state.imageType === 1 ? { width: 800, height: 400 } : { width: 690, height: 328 }
            }
            callback={this.state.imageType === 1 ? this.uploadSuccess : this.uploadMobileSuccess}
          />
        </Content>
        <MultipleSelectionLov {...multipleLovProps} />
      </React.Fragment>
    );
  }
}
