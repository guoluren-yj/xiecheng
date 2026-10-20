/**
 * CustomBar\PlatformDetail\Detail.js - 平台自定义栏管理编辑界面
 * @date: 2019年3月2日 09:03:41
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { Content, Header } from 'components/Page';
import Upload from 'components/Upload/UploadButton';
import { connect } from 'dva';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Spin,
  Tabs,
  Collapse,
  Icon,
} from 'hzero-ui';
import qs from 'querystring';
import { isEmpty, isUndefined, map } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';
import { openTab } from 'utils/menuTab';
import uuid from 'uuid/v4';
import FilterForm from './FilterForm';

const { Panel } = Collapse;
const prompt = 'scec.customBar.model.customBar';
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const tenantId = getCurrentOrganizationId();
@connect(({ loading, groupCustomBar, goodsPreview }) => ({
  saveLoading: loading.effects['groupCustomBar/updateCustomBar'],
  barLoading: loading.effects['groupCustomBar/fetchCustomBar'],
  barAssignLoading: loading.effects['groupCustomBar/fetchCustomBarAssignList'],
  productPreviewLoading: loading.effects['goodsPreview/fetchProductDetail'],
  groupCustomBar,
  goodsPreview,
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.customBar', 'scec.common'] })
export default class PlatformDetail extends Component {
  filterForm;

  barId = this.props.match.params.barId;

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: {},
      selectedRowKeys: [],
      selectedRows: {},
      productPreviewLoading: props.productPreviewLoading || false,
      barId: props.match.params.barId,
      companyId: 0,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state = { _back: 1 } },
    } = this.props;
    const data = { barId: this.barId, companyId: 0 };
    if (!isUndefined(data.barId) && state && state._back !== -1) {
      this.fetchBarData();
      dispatch({
        type: 'groupCustomBar/fetchCustomBarAssignList',
        payload: data,
      });
    }
    dispatch({
      type: 'groupCustomBar/init',
    });
    dispatch({
      type: 'groupCustomBar/fetchBannerSupplier',
      payload: { tenantId, lovCode: 'SCEC.EC_CLIENT_BY_TENANT' },
    });
  }

  /**
   *
   * @param {object} ref - 绑定表单ref
   */
  @Bind()
  handleRef(ref = {}) {
    this.filterForm = (ref.props || {}).form;
  }

  /**
   * 数据保存
   */
  @Bind()
  handleDataSave() {
    const {
      dispatch,
      form,
      groupCustomBar: { customBar = {}, assignList = {} },
      match: { params },
    } = this.props;
    const { content } = assignList;
    const editData = getEditTableData(content, ['barAssginId']);
    if (Array.isArray(content) && editData.length === 0 && content.length !== 0) {
      return;
    }
    const data = {
      ...customBar,
      customBarAssignList: [...editData],
      organizationId: tenantId,
      companyId: isTenantRoleLevel() ? params.companyId : undefined,
    };
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const payload = {
          ...data,
          ...values,
          startDate: values.startDate
            ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          tenantId: getCurrentOrganizationId(),
        };
        dispatch({
          type: 'groupCustomBar/updateCustomBar',
          payload,
        }).then((res) => {
          if (res) {
            this.setState({
              barId: res.barId,
            });
            notification.success();
            this.fetchBarData();
            this.fetchAssignData();
          }
        });
      }
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
   * 查询自定义栏明细数据
   */
  @Bind()
  fetchBarData(page = {}) {
    const { dispatch } = this.props;
    const { barId } = this.state;
    dispatch({
      type: 'groupCustomBar/fetchCustomBar',
      payload: {
        page,
        barId,
      },
    });
  }

  /**
   * 查询商品数据
   */
  @Bind()
  fetchAssignData(page = {}) {
    const { dispatch } = this.props;
    const { barId } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'groupCustomBar/fetchCustomBarAssignList',
      payload: {
        page,
        barId,
        ...filterValues,
      },
    });
  }

  /**
   * 非首页清空目录化商品
   */
  @Bind()
  clearCatalogTable() {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupCustomBar/updateState',
      payload: {
        assignList: { content: [] },
      },
    });
  }

  /**
   * 点击添商品
   */
  @Bind()
  handleProductCreate() {
    const {
      match,
      dispatch,
      groupCustomBar: { assignList = {}, assignPagination = {} },
    } = this.props;
    const { barId } = this.state;
    const newRecord = {
      _status: 'create', // 新增节点的标识
      barAssginId: uuid(), // Table 的 rowKey，新建行的唯一标识
      barId,
      orderSeq: '',
      sourceFrom: '',
      supplierCompanyName: '',
      supplierCompanyId: -1,
      productNum: '',
      productName: '',
      operation: '',
      companyId: isTenantRoleLevel() ? match.params.companyId : -1,
    };
    dispatch({
      type: 'groupCustomBar/updateState',
      payload: {
        assignList: {
          ...assignList,
          content: [newRecord, ...assignList.content],
        },
        assignPagination: addItemToPagination(assignList.content.length, assignPagination),
      },
    });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      groupCustomBar: { assignDataChange = false },
    } = this.props;
    if (!assignDataChange) {
      dispatch({
        type: 'groupCustomBar/updateState',
        payload: {
          assignDataChange: true,
        },
      });
    }
  }

  /**
   * 勾选点击删除商品
   */
  @Bind()
  handleProductRemove() {
    const {
      dispatch,
      groupCustomBar: { assignList = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const updateRecord = [];
    const createRecord = [];
    selectedRows.forEach((item) => {
      if (item._status === 'update') {
        updateRecord.push(item);
      }
      if (item._status === 'create') {
        createRecord.push(item);
      }
    });
    // 过滤掉新建的数据
    const record = assignList.content.filter((item) => !createRecord.includes(item));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'groupCustomBar/updateState',
          payload: {
            assignList: {
              ...assignList,
              content: [...record],
            },
          },
        });
        // 调用删除接口删除已保存的数据
        if (updateRecord.length > 0) {
          dispatch({
            type: 'groupCustomBar/deleteCustomBarAssign',
            payload: updateRecord,
          }).then((res) => {
            if (res) {
              this.fetchAssignData();
            }
          });
        }
        notification.success();
        this.setState({ selectedRowKeys: [], selectedRows: {} });
      },
    });
  }

  /**
   *选中行
   */
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  };

  /**
   * 修改自定义栏类型
   * @param {自定义栏类型} value
   */
  @Bind()
  handleTypeChange(value, item) {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'groupCustomBar/updateState',
      payload: {
        barType: value,
      },
    });
    form.setFieldsValue({
      barTypeName: item ? item.props.children : undefined,
      barType: value,
    });
    // getFieldDecorator('barTypeName', { initialValue: item ? item.props.children : undefined });
  }

  /**
   * 行内编辑表格change事件
   * @param {分页} page
   */
  @Bind()
  handleEditTableChange(page = {}) {
    const {
      dispatch,
      groupCustomBar: { assignDataChange = false },
    } = this.props;
    if (assignDataChange) {
      Modal.confirm({
        title: intl.get(`${prompt}.saveFirstBeforeChange`).d('切换分页前请先保存数据！'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchAssignData(page);
          dispatch({
            type: 'companyBanner/updateState',
            payload: {
              assignDataChange: false,
            },
          });
        },
      });
    } else {
      this.fetchAssignData(page);
    }
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    // const {
    //   groupCustomBar: { supplier = [] },
    // } = this.props;
    const { getFieldValue } = record.$form;
    // const supplierId = record.supplierCompanyId;
    // const ecClientId = supplier.map(item =>
    //   item.supplierId === supplierId ? item.ecClientId : ''
    // );
    if (!getFieldValue('productId')) {
      Modal.confirm({
        title: intl.get(`${prompt}.Please.select.products!`).d('请选择商品！'),
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
    // const pathLevel = 'group-custom-bar';
    // this.setState({
    //   productPreviewLoading: true,
    // });
    // dispatch({
    //   type: 'goodsPreview/fetchGroupProductDetail',
    //   payload: {
    //     ecProductId: getFieldValue('productId'),
    //     platformCode: getFieldValue('sourceFrom'),
    //     ecClientId: ecClientId[0],
    //   },
    // }).then(res => {
    //   if (res) {
    //     const {
    //       ecProductId,
    //       ecProductImageList,
    //       ecProductDetail,
    //       productImageList,
    //       productDetail,
    //       ecPlatform,
    //     } = res;
    //     const imageList = ecProductImageList || productImageList || [];
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
   * 禁用的时间范围
   * @param {*} start
   * @param {*} end
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

  @Bind()
  fetchCompanyId(ecClientId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupCustomBar/fetchCompanyId',
      payload: ecClientId,
    }).then((res) => {
      if (res) {
        this.setState({ companyId: res });
      }
    });
  }

  /**
   * 生成行表格
   * @returns
   */
  @Bind()
  getProductColumns() {
    const { companyId } = this.state;
    this.productColumns = [
      {
        title: intl.get(`${prompt}.queue.number`).d('排序号'),
        dataIndex: 'orderSeq',
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return record._status === 'update' ||
            (record._status === 'create' && getFieldDecorator) ? (
            <FormItem>
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.queue.number`).d('排序号'),
                    }),
                  },
                ],
                initialValue: record.orderSeq,
              })(<InputNumber min={1} max={99999999} style={{ width: '80px' }} />)}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${prompt}.sourceType`).d('商品类型'),
        dataIndex: 'sourceType',
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = record.$form;
          getFieldDecorator('sourceFrom', { initialValue: record.sourceFrom });
          // getFieldDecorator('sourceFromName', { initialValue: record.sourceFromName });
          return record._status === 'update' ||
            (record._status === 'create' && getFieldDecorator) ? (
            <FormItem>
              {getFieldDecorator('sourceType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.sourceType`).d('商品类型'),
                    }),
                  },
                ],
                initialValue: record.sourceType,
              })(
                <Select
                  onChange={() => {
                    setFieldsValue({
                      // supplierCompanyId: undefined,
                      productId: undefined,
                      productNum: undefined,
                      productName: undefined,
                      // supplierTenantId: undefined,
                      // sourceType: key,
                      // sourceFrom: key,
                      // sourceFromName: item ? item.props.children : undefined,
                    });
                  }}
                  style={{ width: '80px' }}
                >
                  <Select.Option value="EC" key="EC">
                    {intl.get(`${prompt}.E-commerce`).d('电商')}
                  </Select.Option>
                </Select>
              )}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${prompt}.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue, getFieldValue: $getFieldValue } = record.$form;
          // const whether = this.props.form.getFieldValue('labelCode');
          // getFieldDecorator('ecPlatformCode', { initialValue: val }); // 挂空表单
          getFieldDecorator('supplierCompanyName', { initialValue: val });
          getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
          getFieldDecorator('supplierId', { initialValue: record.supplierCompanyId });
          getFieldDecorator('supplierCompanyId', { initialValue: record.supplierCompanyId });
          getFieldDecorator('sourceFrom', { initialValue: record.sourceFrom });
          getFieldDecorator('ecClientId');
          return record._status === 'update' ||
            (record._status === 'create' && getFieldDecorator) ? (
            <FormItem>
              {getFieldDecorator('supplierCompanyName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.supplier`).d('供应商'),
                    }),
                  },
                ],
              })(
                <Lov
                  style={{ width: '133px' }}
                  textValue={val}
                  code="SCEC.EC_CLIENT_BY_TENANT"
                  disabled={!$getFieldValue('sourceType')}
                  queryParams={{ companyId, tenantId }}
                  onChange={(_, item) => {
                    setFieldsValue({
                      productId: undefined,
                      productName: undefined,
                      ecClientId: item.ecClientId,
                      supplierId: item.supplierId,
                      supplierCompanyId: item.supplierId,
                      ecPlatformName: item.ecPlatformName,
                      supplierTenantId: item.supplierTenantId,
                      supplierCompanyName: item.supplierCompanyName,
                      sourceFrom: item.ecPlatform,
                    });
                    if (item.ecClientId) {
                      this.fetchCompanyId($getFieldValue('ecClientId'));
                    }
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${prompt}.Commodity.code`).d('商品编号'),
        dataIndex: 'productNum',
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue, getFieldValue: $getFieldValue } = record.$form;
          getFieldDecorator('productNum', { initialValue: val });
          return record._status === 'update' ||
            (record._status === 'create' && getFieldDecorator) ? (
            <FormItem>
              {getFieldDecorator('productId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.Commodity.code`).d('商品编号'),
                    }),
                  },
                ],
                initialValue: record.productId,
              })(
                <Lov
                  style={{ width: '133px' }}
                  textValue={$getFieldValue('productNum')}
                  code="SCEC.EC_COMPANY_PRODUCT_LIST"
                  queryParams={{
                    supplierId: $getFieldValue('supplierId'),
                    companyId,
                    platform: [$getFieldValue('sourceFrom')],
                  }}
                  disabled={!$getFieldValue('ecPlatformName')}
                  lovOptions={{ displayField: 'productNum', valueField: 'productId' }}
                  textField="productNum"
                  onChange={(_, item) => {
                    setFieldsValue({
                      productNum: item.productNum,
                      productId: item.productId,
                      productName: item.productName,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`${prompt}.goodsName`).d('商品名称'),
        dataIndex: 'productName',
        width: 500,
        render: (val, record) => {
          const { getFieldDecorator, getFieldValue: $getFieldValue } = record.$form;
          getFieldDecorator('productName', { initialValue: val });
          return <Form.Item>{$getFieldValue('productName')}</Form.Item>;
        },
      },
      {
        title: intl.get(`${prompt}.operation`).d('操作'),
        dataIndex: 'operation',
        width: 60,
        render: (_, record) => (
          <a onClick={() => this.productPreview(record)}>
            {intl.get(`${prompt}.preview`).d('预览')}
          </a>
        ),
      },
    ];
    return this.productColumns;
  }

  /**
   * 渲染自定义栏明细
   */
  renderCustomBarForm() {
    const {
      groupCustomBar: {
        lov: { customBarType = [] },
        customBar = {},
        barType,
      },
    } = this.props;
    const { barId, companyId } = this.state;

    const { getFieldDecorator, getFieldValue } = this.props.form;
    getFieldDecorator('barTypeName', { initialValue: customBar.barTypeName });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`${prompt}.queue.number`).d('排序号')} {...formLayout}>
              {getFieldDecorator('orderSeq', {
                initialValue: customBar.orderSeq,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.queue.number`).d('排序号'),
                    }),
                  },
                ],
              })(<InputNumber min={1} max={99999999} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${prompt}.barName`).d('自定义栏名称')} {...formLayout}>
              {getFieldDecorator('barName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.barName`).d('自定义栏名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: customBar.barName,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${prompt}.barType`).d('自定义栏类型')} {...formLayout}>
              {getFieldDecorator('barType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.barType`).d('自定义栏类型'),
                    }),
                  },
                ],
                initialValue: customBar.barType,
              })(
                <Select allowClear onChange={this.handleTypeChange}>
                  {map(customBarType, (item) => {
                    return (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`${prompt}.labelCode`).d('标签页')} {...formLayout}>
              {getFieldDecorator('labelCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.labelCode`).d('标签页'),
                    }),
                  },
                ],
                initialValue: customBar.labelCode,
              })(
                <Lov
                  code="SCEC.CUSTOM_BAR_LABEL_CODE"
                  textValue={customBar.labelName}
                  queryParams={{
                    tenantId: getCurrentOrganizationId(),
                    companyId,
                  }}
                  disabled={barId}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`scec.shopBasket.model.shoppingBasket.startDate`).d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`scec.shopBasket.model.shoppingBasket.startDate`)
                        .d('开始时间'),
                    }),
                  },
                ],
                initialValue: customBar.startDate
                  ? moment(customBar.startDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
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
              label={intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间'),
                    }),
                  },
                ],
                initialValue: customBar.endDate
                  ? moment(customBar.endDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
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
        {barType === 'IMAGE' && (
          <Row gutter={48} className="writable-row">
            <Col span={8}>
              <FormItem
                label={intl.get(`${prompt}.imagePath`).d('上传图片')}
                extra={intl
                  .get('scec.customBar.model.customBar.uploadSize.uploadSize')
                  .d('上传格式：*.png;*.jpeg，上传大小：220x604px')}
                style={{ marginBottom: '0px' }}
                required
                {...formLayout}
              >
                <Upload
                  single
                  accept=".jpeg,.png"
                  fileType="image/jpeg;image/png"
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="scec-custom-bar"
                  fileList={
                    !customBar.imagePath
                      ? []
                      : [
                          {
                            uid: '-1',
                            name: customBar.imageName,
                            status: 'done',
                            url: customBar.imagePath,
                          },
                        ]
                  }
                  onUploadSuccess={this.uploadSuccess}
                  onRemove={this.cancelSuccess}
                />
              </FormItem>
              <FormItem wrapperCol={{ span: 12, offset: 9 }} style={{ marginBottom: '0px' }}>
                {getFieldDecorator('imageName')}
                {getFieldDecorator('imagePath', {
                  initialValue: customBar.imagePath,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.imagePath`).d('上传图片'),
                      }),
                    },
                  ],
                })(<div />)}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  render() {
    const {
      saveLoading,
      barLoading,
      barAssignLoading,
      groupCustomBar: { assignList = {}, assignPagination = {}, customBar = {} },
    } = this.props;

    const { selectedRowKeys, productPreviewLoading, collapseKeys, companyId } = this.state;

    const barIdFlag = customBar && customBar.barId;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const filterProps = {
      companyId,
      onSearch: this.fetchAssignData,
      onRef: this.handleRef,
    };

    const currentLevel = 'group';
    const titleLevel = '集团自定义栏';
    return (
      <Fragment>
        <Header title={`${titleLevel}`} backPath={`/scec/${currentLevel}-custom-bar/list`}>
          <Button
            icon="save"
            type="primary"
            onClick={this.handleDataSave}
            loading={saveLoading || barLoading || barAssignLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={(barLoading === undefined ? false : barLoading) || productPreviewLoading}
            wrapperClassName="ued-detail-wrapper"
          >
            <Collapse
              defaultActiveKey={['customBarDetail']}
              onChange={(arr) => this.onCollapseChange(arr, 'customBarDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${prompt}.customBarDetail`).d('自定义栏明细')}</h3>
                    <a>
                      {collapseKeys.customBarDetail
                        ? collapseKeys.customBarDetail.some((o) => o === 'customBarDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.customBarDetail
                          ? collapseKeys.customBarDetail.some((o) => o === 'customBarDetail')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="customBarDetail"
              >
                {this.renderCustomBarForm()}
              </Panel>
            </Collapse>
            {barIdFlag && (
              <Tabs defaultActiveKey="goods" animated={false}>
                <Tabs.TabPane tab={intl.get(`${prompt}.commodity`).d('商品')} key="goods">
                  <Fragment>
                    <div className="table-list-search">
                      <FilterForm {...filterProps} />
                    </div>
                    <div className="table-list-operator" style={{ textAlign: 'right' }}>
                      <Button
                        onClick={this.handleProductRemove}
                        style={{ marginRight: 8 }}
                        disabled={selectedRowKeys.length === 0}
                        icon="delete"
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </Button>
                      <Button
                        onClick={this.handleProductCreate}
                        style={{ marginRight: 0 }}
                        icon="plus"
                      >
                        {intl.get('hzero.common.button.create').d('新建')}
                      </Button>
                    </div>
                    <EditTable
                      dataSource={assignList.content}
                      pagination={assignPagination}
                      loading={barAssignLoading}
                      columns={this.getProductColumns()}
                      onChange={this.handleEditTableChange}
                      onChangeTableData={this.changeTableData}
                      rowSelection={rowSelection}
                      rowKey="barAssginId"
                      bordered
                    />
                  </Fragment>
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
