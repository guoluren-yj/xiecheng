/**
 * ShoppingBasket\Detail\index.js - 购物篮创建和编辑
 * @date: 2019年11月5日 15:03:41
 * @author: lizhijian <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import qs from 'querystring';
import moment from 'moment';
import { isEmpty, isUndefined } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Collapse,
  Icon,
  Modal,
  Spin,
} from 'hzero-ui';
import notification from 'hzero-front/lib/utils/notification';

import intl from 'utils/intl';
import {
  DEFAULT_DATETIME_FORMAT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { Content, Header } from 'components/Page';

import style from './index.less';
import FilterForm from './FilterForm';

const { Panel } = Collapse;
const FormItem = Form.Item;
const prompt = 'scec.shopBasket.model.shoppingBasket';

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.shopBasket', 'scec.common'] })
@connect(({ loading, shoppingBasket, goodsPreview }) => ({
  saveLoading: loading.effects['shoppingBasket/createBasket'],
  ProductListLoading: loading.effects['shoppingBasket/fetchProductList'],
  BasketBarLoading: loading.effects['shoppingBasket/fetchBasketBar'],
  shoppingBasket,
  goodsPreview,
}))
export default class CreateShoppingBasket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['shoppingBasketDetail', 'shoppingBasketProduct'],
      selectedRowKeys: [],
      selectedRows: {},
      marketBasketId: props.match.params.marketBasketId,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state = { _back: 1 } },
      match,
    } = this.props;
    let data = {};
    data = { marketBasketId: match.params.marketBasketId, companyId: match.params.companyId };
    if (!isUndefined(data.marketBasketId) && state && state._back !== -1) {
      this.fetchBarData();
      dispatch({
        type: 'shoppingBasket/fetchProductList',
        payload: data,
      });
    }
    dispatch({
      type: 'shoppingBasket/init',
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 查询购物篮的基本信息
   */
  @Bind()
  fetchBarData(page = {}) {
    const { dispatch } = this.props;
    const { marketBasketId } = this.state;
    dispatch({
      type: 'shoppingBasket/fetchBasketBar',
      payload: {
        page,
        marketBasketId,
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
   * 购物篮保存
   */
  @Bind()
  handleDataSave() {
    const {
      dispatch,
      form,
      match: { params },
      shoppingBasket: { shoppingBasket = {}, productList = {} },
    } = this.props;
    const { content } = productList;
    const editData = getEditTableData(content, ['productListId']);
    if (Array.isArray(content) && editData.length === 0 && content.length !== 0) {
      return;
    }
    const data = {
      ...shoppingBasket,
      basketAssignList: editData.map(ele => ({ ...ele, supplierCompanyId: ele.supplierId })),
      companyId: params.companyId,
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
          remark: values.remark,
          basketName: values.basketName,
        };
        dispatch({
          type: 'shoppingBasket/createBasket',
          payload,
        }).then(res => {
          if (res) {
            this.setState(
              {
                marketBasketId: res.marketBasketId,
              }
              // () => {
              //   this.props.history.push(
              //     `/scec/shopping-basket/detail/${data.companyId}/${this.state.marketBasketId}`
              //   );
              // }
            );
            notification.success();
            this.fetchBarData();
            this.fetchAssignData();
          }
        });
      }
    });
  }

  /**
   * 商品-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      shoppingBasket: { assignDataChange = false },
    } = this.props;
    if (!assignDataChange) {
      dispatch({
        type: 'shoppingBasket/updateState',
        payload: {
          assignDataChange: true,
        },
      });
    }
  }

  /**
   * 查询商品数据
   */
  @Bind()
  fetchAssignData(page = {}) {
    const { dispatch } = this.props;
    const { marketBasketId } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'shoppingBasket/fetchProductList',
      payload: {
        page,
        marketBasketId,
        ...filterValues,
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
        current <
          moment()
            .subtract(1, 'days')
            .endOf('day') -
            1 || moment(getFieldValue('endDate')).isBefore(current, 'day')
      );
    } else {
      return (
        current &&
        current <
          moment()
            .subtract(1, 'days')
            .endOf('day') -
            1
      );
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
      return (
        current &&
        current <
          moment()
            .subtract(1, 'days')
            .endOf('day')
      );
    }
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    const { getFieldValue } = record.$form;
    if (!getFieldValue('productId')) {
      Modal.confirm({
        title: intl.get('scec.shopBasket.view.message.products').d('请选择商品！'),
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
      dispatch,
      // shoppingBasket: { productList = {} },
    } = this.props;
    // const editData = getEditTableData(productList.content);
    // if (
    //   Array.isArray(productList.content) &&
    //   editData.length === 0 &&
    //   productList.content.length !== 0
    // ) {
    //   return;
    // }
    // dispatch({
    //   type: 'shoppingBasket/updateState',
    //   payload: {
    //     productList: {
    //       ...productList,
    //       content: [...editData],
    //     },
    //   },
    // });
    const {
      location: { pathname = '', search = '' },
    } = this.props;
    const detailUrl = pathname + search;
    const pathLevel = 'shopping-basket';
    dispatch({
      type: 'goodsPreview/fetchProductDetail',
      payload: {
        ecProductId: getFieldValue('productId'),
        companyId,
        platformCode: getFieldValue('sourceFrom'),
      },
    }).then(res => {
      if (res) {
        const {
          ecProductId,
          ecProductImageList,
          ecProductDetail,
          productImageList,
          productDetail,
          ecPlatform,
        } = res;
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
        const router = {
          pathname: `/scec/${pathLevel}/goods-preview`,
          state: {
            baseInfoList: qs.stringify(res),
            htmlList: qs.stringify(detail),
            productImageList: newImageList,
            detailUrl,
            sourceFrom: !ecProductId ? 'CATA' : ecPlatform,
            selectImg,
            is7ToReturn: res.ecProductCheckVO ? res.ecProductCheckVO.is7ToReturn : undefined,
          },
        };
        this.props.history.push(router);
      }
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
      shoppingBasket: { productList = {}, productPagination = {} },
    } = this.props;
    const newRecord = {
      _status: 'create', // 新增节点的标识
      productListId: uuid(), // Table 的 rowKey，新建行的唯一标识
      sourceFrom: '',
      supplierCompanyName: '',
      supplierCompanyId: -1,
      productName: '',
      operation: '',
      companyId: match.params.companyId,
    };
    dispatch({
      type: 'shoppingBasket/updateState',
      payload: {
        productList: {
          ...productList,
          content: [newRecord, ...productList.content],
        },
        productPagination: addItemToPagination(productList.content.length, productPagination),
      },
    });
  }

  /**
   * 勾选点击删除商品
   */
  @Bind()
  handleProductRemove() {
    const {
      dispatch,
      shoppingBasket: { productList = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const updateRecord = [];
    const createRecord = [];
    selectedRows.forEach(item => {
      if (item._status === 'update') {
        updateRecord.push(item);
      }
      if (item._status === 'create') {
        createRecord.push(item);
      }
    });
    // 过滤选出新建的数据
    const record = productList.content.filter(item => !createRecord.includes(item));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'shoppingBasket/updateState',
          payload: {
            productList: {
              ...productList,
              content: [...record],
            },
          },
        });
        // 调用删除接口删除已保存的数据
        if (updateRecord.length > 0) {
          dispatch({
            type: 'shoppingBasket/deleteProduct',
            payload: updateRecord,
          }).then(res => {
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
   *
   * @param {object} ref - 绑定表单ref
   */
  @Bind()
  handleRef(ref = {}) {
    this.filterForm = (ref.props || {}).form;
  }

  /**
   * 行内编辑表格change事件
   * @param {分页} page
   */
  @Bind()
  handleEditTableChange(page = {}) {
    const {
      dispatch,
      shoppingBasket: { assignDataChange },
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
            type: 'shoppingBasket/updateState',
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
   * 渲染购物篮商品列表
   * @returns
   */
  @Bind()
  getProductColumns() {
    const {
      shoppingBasket: {
        lov: { sourceType = [] },
      },
      match: {
        params: { companyId },
      },
    } = this.props;
    this.productColumns = [
      {
        title: intl.get(`${prompt}.sourceType`).d('商品类型'),
        dataIndex: 'sourceType',
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = record.$form;
          getFieldDecorator('sourceFrom', { initialValue: record.sourceFrom });
          getFieldDecorator('sourceFromName', { initialValue: record.sourceFromName });
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
                  onChange={(key, item) => {
                    setFieldsValue({
                      supplierCompanyId: undefined,
                      productId: undefined,
                      productName: undefined,
                      supplierTenantId: undefined,
                      sourceType: key,
                      sourceFrom: key,
                      sourceFromName: item ? item.props.children : undefined,
                    });
                  }}
                  style={{ width: '80px' }}
                >
                  {sourceType.map(item => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
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
          getFieldDecorator('supplierCompanyName', { initialValue: val });
          getFieldDecorator('sourceFromName', { initialValue: record.sourceFromName });
          getFieldDecorator('supplierCompanyName', { initialValue: val });
          getFieldDecorator('ecPlatformCode'); // 挂空表单
          getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
          getFieldDecorator('supplierId', { initialValue: record.supplierCompanyId });
          return record._status === 'update' ||
            (record._status === 'create' && getFieldDecorator) ? (
            <FormItem>
              {getFieldDecorator('supplierCompanyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.supplier`).d('供应商'),
                    }),
                  },
                ],
                initialValue: record.supplierCompanyId,
              })(
                <Lov
                  style={{ width: '133px' }}
                  textValue={$getFieldValue('supplierCompanyName')}
                  code={
                    $getFieldValue('sourceType') === 'EC'
                      ? 'SCEC.COMPANY_EC_CLIENT'
                      : 'SCEC.COMPANY_SUPPLIER'
                  }
                  disabled={!$getFieldValue('sourceType')}
                  queryParams={{ companyId }}
                  onChange={(_, item) => {
                    setFieldsValue({
                      productId: undefined,
                      productName: undefined,
                      supplierTenantId: item.supplierTenantId,
                      supplierId: item.supplierId,
                      supplierCompanyName: item.supplierName,
                      ecPlatformCode: item.ecPlatform ? item.ecPlatform : undefined,
                      sourceFrom: $getFieldValue('sourceType') === 'EC' ? item.ecPlatform : 'CATA',
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
        title: intl.get(`${prompt}.commodityCode`).d('商品编号'),
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
                      name: intl.get(`${prompt}.commodityCode`).d('商品编号'),
                    }),
                  },
                ],
                initialValue: record.productId,
              })(
                <Lov
                  style={{ width: '133px' }}
                  textValue={$getFieldValue('productNum')}
                  code={
                    $getFieldValue('sourceType') === 'EC'
                      ? 'SCEC.EC_COMPANY_PRODUCT_LIST'
                      : 'SCEC.COMPANY_PRODUCT'
                  }
                  queryParams={{
                    supplierId: $getFieldValue('supplierCompanyId'),
                    companyId,
                    platform: [$getFieldValue('ecPlatformCode')],
                  }}
                  disabled={!$getFieldValue('supplierCompanyName')}
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
        width: 600,
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
   * 渲染购物篮明细
   */
  renderShoppingBasketForm() {
    let {
      shoppingBasket: { shoppingBasket = {} },
    } = this.props;
    shoppingBasket = this.state.marketBasketId ? shoppingBasket : {};
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${prompt}.basketName`).d('购物篮名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('basketName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.basketName`).d('购物篮名称'),
                    }),
                  },
                  {
                    max: 10,
                    message: intl.get('hzero.common.validation.max', {
                      max: 10,
                    }),
                  },
                ],
                initialValue: shoppingBasket.basketName,
              })(<Input maxLength={10} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${prompt}.startDate`).d('开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.startDate`).d('开始时间'),
                    }),
                  },
                ],
                initialValue: shoppingBasket.startDate
                  ? moment(shoppingBasket.startDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
                  disabledDate={this.selectDisabledDate}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${prompt}.endDate`).d('截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.endDate`).d('截止时间'),
                    }),
                  },
                ],
                initialValue: shoppingBasket.endDate
                  ? moment(shoppingBasket.endDate, DEFAULT_DATETIME_FORMAT)
                  : null,
              })(
                <DatePicker
                  showTime
                  format={DEFAULT_DATETIME_FORMAT}
                  style={{ width: '100%' }}
                  disabledDate={this.selectToDisabledDate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row last-form-item half-row">
          <Col span={12}>
            <FormItem
              label={intl.get(`${prompt}.remark`).d('购物篮介绍')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('remark', {
                initialValue: shoppingBasket.remark,
                rules: [
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
              })(<Input.TextArea rows={4} maxLength={60} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 生成购物篮商品表格
   */
  renderShoppingBasketTable() {
    const {
      shoppingBasket: { productList = {}, productPagination = {} },
      match: {
        params: { companyId },
      },
      ProductListLoading,
    } = this.props;

    const filterProps = {
      companyId,
      onSearch: this.fetchAssignData,
      onRef: this.handleRef,
    };

    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <Fragment>
        <div className={style['table-list-search']}>
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
          <Button onClick={this.handleProductCreate} style={{ marginRight: 0 }} icon="plus">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          dataSource={productList.content}
          pagination={productPagination}
          loading={ProductListLoading}
          columns={this.getProductColumns()}
          onChange={this.handleEditTableChange}
          onDataChange={this.changeTableData}
          rowSelection={rowSelection}
          rowKey="productListId"
          bordered
        />
      </Fragment>
    );
  }

  render() {
    const { saveLoading, BasketBarLoading, match } = this.props;
    const { collapseKeys, marketBasketId } = this.state;
    return (
      <Fragment>
        <Header
          title={
            match.params.marketBasketId
              ? intl.get(`${prompt}.edit`).d('编辑购物篮')
              : intl.get(`${prompt}.new`).d('新建购物篮')
          }
          backPath="/scec/shopping-basket/list"
        >
          <Button icon="save" type="primary" onClick={this.handleDataSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={BasketBarLoading === undefined ? false : BasketBarLoading}
            wrapperClassName="ued-detail-wrapper"
          >
            <Collapse
              defaultActiveKey={['shoppingBasketDetail', 'shoppingBasketProduct']}
              onChange={arr => this.onCollapseChange(arr, 'shoppingBasketDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get('scec.shopBasket.model.view.messge.detail').d('购物篮明细')}</h3>
                    <a>
                      {collapseKeys.includes('shoppingBasketDetail')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('shoppingBasketDetail') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="shoppingBasketDetail"
              >
                {this.renderShoppingBasketForm()}
              </Panel>
              {marketBasketId ? (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get('scec.shopBasket.model.view.messge.product').d('购物篮商品')}
                      </h3>
                      <a>
                        {collapseKeys.includes('shoppingBasketProduct')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('shoppingBasketProduct') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="shoppingBasketProduct"
                >
                  {this.renderShoppingBasketTable()}
                </Panel>
              ) : (
                ''
              )}
            </Collapse>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
