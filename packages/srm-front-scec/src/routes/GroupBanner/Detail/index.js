/**
 * GroupBanner - 集团Banner管理详情页面
 * @date: 2019-12-30
 * @author: zz <qizheng.wu@hand-china.com>
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
  InputNumber,
  Spin,
  Collapse,
  Icon,
} from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
// import { routerRedux } from 'dva/router';
import { isEmpty, filter, isUndefined } from 'lodash';
import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import Upload from 'components/Upload/UploadButton';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  addItemToPagination,
  getEditTableData,
  delItemToPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  delItemsToPagination,
} from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { openTab } from 'utils/menuTab';
import { PUBLIC_BUCKET } from '_utils/config';
import GoodsLine from './GoodsLine';

const { Panel } = Collapse;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
// const viewPrompt = 'ssrc.groupBanner.view.message';
const messagePrompt = 'scec.groupBanner.model.groupBanner';
const tenantId = getCurrentOrganizationId();

@connect(({ groupBanner, loading, goodsPreview }) => ({
  goodsPreview,
  groupBanner,
  organizationId: getCurrentOrganizationId(),
  saveGroupBannerLoading: loading.effects['groupBanner/saveGroupBanner'],
  fetchGroupBannerHeaderLoading: loading.effects['groupBanner/fetchGroupBannerHeader'],
  fetchGroupBannerLineLoading: loading.effects['groupBanner/fetchGroupBannerLine'],
  saveGoodsLineLoading: loading.effects['groupBanner/saveGoodsLine'],
  deleteGoodsLineLoading: loading.effects['groupBanner/deleteGoodsLines'],
  productPreviewLoading: loading.effects['goodsPreview/fetchProductDetail'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.companyBanner', 'scec.common'] })
@cacheComponent({ cacheKey: '/scec/group-banner/Detail' })
export default class Create extends Component {
  state = {
    goodsLineSelectedRowKeys: [], // 商品复选框
    bannerTypeValue: undefined, // banner类型值
    productPreviewLoading: this.props.productPreviewLoading || false,
    collapseKeys: {},
    companyId: 0,
  };

  componentDidMount() {
    const {
      location: { state = { _back: 1 } },
      dispatch,
    } = this.props;
    if (state && state._back !== -1) {
      this.handleSearch();
    }
    dispatch({
      type: 'groupBanner/fetchBannerSupplier',
      payload: { tenantId, lovCode: 'SCEC.EC_CLIENT_BY_TENANT' },
    });
  }

  @Bind()
  handleSearch() {
    this.fetchBannerHeader();
    this.fetchBannerLine();
    this.fetchSourceFrom();
    this.fetchBannerTypeValue();
  }

  @Bind()
  fetchCompanyId(ecClientId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupBanner/fetchCompanyId',
      payload: { ecClientId, organizationId: tenantId },
    }).then((res) => {
      if (res) {
        this.setState({ companyId: res });
      }
    });
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
    let payload = {};
    payload = { bannerId: params.bannerId, organizationId };
    dispatch({
      type: 'groupBanner/fetchGroupBannerHeader',
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
   * 查询-Banner类型值集
   */
  @Bind()
  fetchBannerTypeValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupBanner/fetchBannerTypeValue',
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
    let payload = {};
    payload = { ...fieldValues, bannerId: params.bannerId, page, organizationId };
    dispatch({
      type: 'groupBanner/fetchGroupBannerLine',
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
      type: 'groupBanner/fetchSourceFrom',
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
        imageName: file.name,
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
   * 保存-公司banner
   * 租户级传organizationId
   */
  @Bind()
  saveGroupBanner() {
    const {
      dispatch,
      form,
      organizationId,
      groupBanner: { header = {}, line = [], goodsLineChange = false },
    } = this.props;
    // 先验证头
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        // 有行的话，验证行
        if (!isEmpty(line)) {
          const newParams = line && getEditTableData(line, ['bannerAssginId']);
          if (!isEmpty(newParams)) {
            let payload = {};
            payload = {
              ...header,
              ...values,
              organizationId,
              startDate: values.startDate
                ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
              bannerAssignList: newParams,
            };
            dispatch({
              type: 'groupBanner/saveGroupBanner',
              payload,
            }).then((res) => {
              if (res) {
                if (goodsLineChange) {
                  dispatch({
                    type: 'groupBanner/updateState',
                    payload: {
                      goodsLineChange: false,
                    },
                  });
                }
                notification.success();
                this.handleSearch();
              }
            });
          }
        } else {
          let payload = {};
          payload = {
            ...header,
            ...values,
            organizationId,
            startDate: values.startDate
              ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          };
          dispatch({
            type: 'groupBanner/saveGroupBanner',
            payload,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      }
    });
  }

  /**
   * 商品-新增行
   */
  @Bind()
  createGoodsLine() {
    const {
      dispatch,
      match: { params },
      groupBanner: { line = [], linePagination = {} },
    } = this.props;
    dispatch({
      type: 'groupBanner/updateState',
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
   * 商品-保存
   * 租户级传organizationId
   */
  @Bind()
  saveGoodsLine() {
    const {
      dispatch,
      organizationId,
      groupBanner: { line = [], linePagination = {}, goodsLineChange = false },
    } = this.props;
    // const { goodsLineSelectedRowKeys = [] } = this.state;
    // const createSupplierLine =
    // line && line.filter(item => item._status === 'create');
    const newParams = getEditTableData(line, ['bannerAssginId']);
    if (!isEmpty(newParams)) {
      let payload = {};
      payload = { newParams, organizationId };
      dispatch({
        type: 'groupBanner/saveGoodsLine',
        payload,
      }).then((res) => {
        if (res) {
          if (goodsLineChange) {
            dispatch({
              type: 'groupBanner/updateState',
              payload: {
                goodsLineChange: false,
              },
            });
          }
          notification.success();
          this.fetchBannerLine(linePagination);
        }
      });
    }
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
      groupBanner: { line = [], linePagination = {} },
      location: { pathname },
    } = this.props;
    const { goodsLineSelectedRowKeys } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(line, (item) => {
      return goodsLineSelectedRowKeys.indexOf(item.bannerAssginId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newSupplierList = filter(line, (item) => {
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
          dispatch({
            type: 'groupBanner/updateState',
            payload: {
              line: newSupplierList,
              linePagination: delItemToPagination(line.length, linePagination),
            },
          });
          this.setState({ goodsLineSelectedRowKeys: [] });
        } else {
          let payload = {};
          payload = pathname.match('platform-banner')
            ? { remoteDelete }
            : { remoteDelete, organizationId };
          dispatch({
            type: 'groupBanner/deleteGoodsLines',
            payload,
          }).then((res) => {
            if (res) {
              // 删除成功
              notification.success();
              dispatch({
                type: 'groupBanner/updateState',
                payload: {
                  line: newSupplierList,
                  linePagination: delItemsToPagination(
                    newParameters.length,
                    line.length,
                    linePagination
                  ),
                },
              });
              this.setState({ goodsLineSelectedRowKeys: [] });
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
      groupBanner: { goodsLineChange = false },
    } = this.props;
    if (!goodsLineChange) {
      dispatch({
        type: 'groupBanner/updateState',
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
      groupBanner: { goodsLineChange = false },
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
            type: 'groupBanner/updateState',
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
      groupBanner: { line = [] },
    } = this.props;
    // 单一商品
    if (getFieldValue('bannerType') === '1') {
      // 单一商品切换到纯图片
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
    // const {
    //   groupBanner: { supplier = [] },
    // } = this.props;
    const { getFieldValue } = record.$form;
    // const supplierId = record.supplierCompanyId;
    // const ecClientId = supplier.map(item =>
    //   item.supplierId === supplierId ? item.ecClientId : ''
    // );
    if (!getFieldValue('productId')) {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.pleaseSelectItems`).d('请选择商品！'),
        onOk: () => {
          this.setState();
        },
      });
      return;
    }
    openTab({
      key: `/scec/commom-goods-preview`,
      title: intl.get('scec.goodsDemand.view.goodsPreview').d('商品预览'),
      search: qs.stringify({
        productId: getFieldValue('productId'),
        platformCode: getFieldValue('sourceFrom'),
      }),
    });
    // const { dispatch } = this.props;
    // const {
    //   location: { pathname = '', search = '' },
    // } = this.props;
    // const detailUrl = pathname + search;
    // const pathLevel = 'group-banner';
    // this.setState({
    //   productPreviewLoading: true,
    // });
    // dispatch({
    //   type: 'goodsPreview/fetchGroupProductDetail',
    //   payload: {
    //     ecProductId: getFieldValue('productId'),
    //     platformCode: record.sourceFrom,
    //     ecClientId: ecClientId[0],
    //   },
    // }).then(res => {
    //   if (res) {
    //     this.setState({
    //       productPreviewLoading: false,
    //     });
    //     const {
    //       ecProductId,
    //       ecProductImageList,
    //       ecProductDetail,
    //       productImageList,
    //       productDetail,
    //       ecPlatform,
    //     } = res;
    //     const imageList = ecProductImageList || productImageList;
    //     const detail = ecProductDetail || productDetail;
    //     const primaryImgIndex = imageList.findIndex(item => !!item.ecPrimaryFlag);
    //     const newImageList =
    //       primaryImgIndex === -1
    //         ? imageList
    //         : [
    //             imageList[primaryImgIndex],
    //             ...imageList.slice(0, primaryImgIndex),
    //             ...imageList.slice(primaryImgIndex + 1),
    //           ];
    //     const selectImg = newImageList[0] && newImageList[0].imagePath;
    //     const router = {
    //       pathname: `/scec/${pathLevel}/goods-preview`,
    //       state: {
    //         baseInfoList: qs.stringify(res),
    //         htmlList: qs.stringify(detail),
    //         productImageList: newImageList,
    //         detailUrl,
    //         sourceFrom: !ecProductId ? 'CATA' : ecPlatform,
    //         selectImg,
    //         is7ToReturn: res.ecProductCheckVO ? res.ecProductCheckVO.is7ToReturn : undefined,
    //       },
    //     };
    //     this.props.history.push(router);
    //   }
    // });
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
      groupBanner: { bannerType = [], header = {} },
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('bannerTypeName', { initialValue: header.bannerTypeName });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`${messagePrompt}.orderSeq`).d('排序号')} {...formLayout}>
              {getFieldDecorator('orderSeq', {
                initialValue: header.orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.orderSeq`).d('排序号'),
                    }),
                  },
                ],
              })(<InputNumber min={1} max={99999999} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${messagePrompt}.bannerName`).d('Banner名称')}
              {...formLayout}
            >
              {getFieldDecorator('bannerName', {
                initialValue: header.bannerName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.bannerName`).d('Banner名称'),
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
              label={intl.get(`${messagePrompt}.bannerType`).d('Banner类型')}
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
                      name: intl.get(`${messagePrompt}.bannerType`).d('Banner类型'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${messagePrompt}.uploadImage`).d('上传图片')}
              extra={intl
                .get(`${messagePrompt}.uploadSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：966x460px')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
              required
            >
              <Upload
                single
                accept=".jpeg,.png"
                fileType="image/jpeg;image/png"
                bucketName={PUBLIC_BUCKET}
                bucketDirectory="scec-group-banner"
                fileList={[
                  {
                    uid: '-1',
                    name: header.imageName,
                    status: 'done',
                    url: header.imagePath,
                  },
                ]}
                onUploadSuccess={this.uploadSuccess}
                onRemove={this.cancelSuccess}
              />
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('imageName')}
              {getFieldDecorator('imagePath', {
                initialValue: header.imagePath,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.imagePath`).d('上传图片'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.startDate').d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                initialValue: header.startDate && moment(header.startDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('scec.shopBasket.model.shoppingBasket.startDate')
                        .d('开始时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={(currentDate) =>
                    getFieldValue('endDate') &&
                    moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('endDate', {
                initialValue: header.endDate && moment(header.endDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={(currentDate) =>
                    getFieldValue('startDate') &&
                    moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                  }
                  disabledTime={this.disabledDateTime}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      saveGroupBannerLoading,
      fetchGroupBannerHeaderLoading,
      fetchGroupBannerLineLoading,
      saveGoodsLineLoading,
      deleteGoodsLineLoading,
      location: { pathname },
      groupBanner: { line = [], linePagination = {}, sourceType },
    } = this.props;
    const {
      goodsLineSelectedRowKeys,
      productPreviewLoading,
      bannerTypeValue,
      collapseKeys,
      companyId,
    } = this.state;
    const goodsRowSelection = {
      selectedRowKeys: goodsLineSelectedRowKeys,
      onChange: this.handleGoodsLineRowSelectChange,
    };

    const goodsLineProps = {
      companyId,
      pathname,
      bannerTypeValue,
      sourceType,
      goodsRowSelection,
      goodsLineSelectedRowKeys,
      loading: fetchGroupBannerLineLoading,
      saveLoading: saveGoodsLineLoading,
      deleteLoading: deleteGoodsLineLoading,
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
      onFetchCompanyId: this.fetchCompanyId,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${messagePrompt}.compile.Banner`).d('编辑Banner')}
          backPath="/scec/group-banner/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.saveGroupBanner}
            loading={saveGroupBannerLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={fetchGroupBannerHeaderLoading || productPreviewLoading}
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
                    <h3>{intl.get(`${messagePrompt}.bannerDetail`).d('Banner明细')}</h3>
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
