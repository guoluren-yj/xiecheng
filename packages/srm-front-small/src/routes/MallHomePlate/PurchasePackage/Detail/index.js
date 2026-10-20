/**
 * ShoppingBasket\Detail\index.js - 采购套餐创建和编辑
 * @date: 2019年11月5日 15:03:41
 * @author: lizhijian <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import qs from 'querystring';
import moment from 'moment';
import { isEmpty, isUndefined } from 'lodash';
// import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  // Select,
  Collapse,
  Icon,
  Modal,
  Spin,
  InputNumber,
} from 'hzero-ui';
import notification from 'hzero-front/lib/utils/notification';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import {
  DEFAULT_DATETIME_FORMAT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import {
  // addItemToPagination,
  getCurrentOrganizationId,
  getEditTableData,
  filterNullValueObject,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { Content, Header } from 'components/Page';

import style from './index.less';
import FilterForm from './FilterForm';
import MultipleSelectionLov from '../MultipleSelectionLov';

const { Panel } = Collapse;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['small.mallHomePlate', 'small.common'] })
@connect(({ mallHomePlate, loading }) => ({
  mallHomePlate,
  saveLoading: loading.effects['mallHomePlate/savePackage'],
  headerLoading: loading.effects['mallHomePlate/fetchPackageHeader'],
  lineLoading: loading.effects['mallHomePlate/getPackageProduct'],
  delLineLoading: loading.effects['mallHomePlate/delPackageGoodsLines'],
}))
export default class CreateShoppingBasket extends Component {
  constructor(props) {
    super(props);
    const { companyId, marketBasketId } = props.match.params;
    this.state = {
      companyId,
      marketBasketId,
      selectedRows: [],
      selectedRowKeys: [],
      collapseKeys: ['top', 'bottom'],
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state = { _back: 1 } },
    } = this.props;
    const { companyId, marketBasketId } = this.state;
    if (isUndefined(marketBasketId)) {
      dispatch({
        type: 'mallHomePlate/updateState',
        payload: {
          packageHeaderInfo: {},
          packageProductList: [],
        },
      });
    }
    if (!isUndefined(marketBasketId) && state && state._back !== -1) {
      this.fetchBarData();
      dispatch({
        type: 'mallHomePlate/getPackageProduct',
        payload: { companyId, marketBasketId },
      });
    }
    this.fetchTree();
    dispatch({
      type: 'mallHomePlate/init',
    });
  }

  @Bind()
  fetchTree() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallHomePlate/fetchTypeTree',
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
   * 查询采购套餐的基本信息
   */
  @Bind()
  fetchBarData(page = {}) {
    const { dispatch } = this.props;
    const { marketBasketId } = this.state;
    dispatch({
      type: 'mallHomePlate/fetchPackageHeader',
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
   * 采购套餐保存
   */
  @Bind()
  handleDataSave() {
    const {
      dispatch,
      form,
      mallHomePlate: { packageHeaderInfo = {}, packageProductList = [] },
    } = this.props;
    const { companyId } = this.state;
    const data = {
      ...packageHeaderInfo,
      basketAssignList: getEditTableData(packageProductList),
      companyId,
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
          type: 'mallHomePlate/savePackage',
          payload,
        }).then((res) => {
          if (res) {
            this.setState({
              marketBasketId: res.marketBasketId,
            });
            notification.success();
            this.fetchAssignData();
          }
          this.fetchBarData();
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
      mallHomePlate: { packageDataChange = false },
    } = this.props;
    if (!packageDataChange) {
      dispatch({
        type: 'mallHomePlate/updateState',
        payload: {
          packageDataChange: true,
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
      type: 'mallHomePlate/getPackageProduct',
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
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('endDate')).isBefore(current, 'day')
      );
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day') - 1;
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
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
      // return current && current < moment().subtract(1, 'days').endOf('day');
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
  }

  /**
   * 打开商品预览框
   */
  @Bind()
  productPreview(record) {
    const { companyId } = this.state;
    const { getFieldValue } = record.$form;
    openTab({
      key: '/small/commom-goods-preview',
      title: intl.get('small.common.button.previewGoods').d('商品预览'),
      search: qs.stringify({
        productId: getFieldValue('productId') || record.productId,
        sourceFrom: getFieldValue('sourceFrom') || record.sourceFrom,
        companyId,
      }),
    });
  }

  /**
   * 点击添商品
   */
  @Bind()
  handleProductCreate() {
    this.mtpLovRecord.handleSupplierModal();
  }

  /**
   * 勾选点击删除商品
   */
  @Bind()
  handleProductRemove() {
    const {
      dispatch,
      mallHomePlate: { packageProductList = [] },
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
    // 过滤选出新建的数据
    const filterCreate = packageProductList.filter((item) => !createRecord.includes(item));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'mallHomePlate/updateState',
          payload: {
            packageProductList: filterCreate,
          },
        });
        // 调用删除接口删除已保存的数据
        if (updateRecord.length > 0) {
          dispatch({
            type: 'mallHomePlate/delPackageGoodsLines',
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
      mallHomePlate: { packageDataChange, packageProductList },
    } = this.props;
    if (packageDataChange || packageProductList.some((p) => p._status === 'create')) {
      Modal.confirm({
        title: intl
          .get(`small.mallHomePlate.view.saveFirstBeforeChange`)
          .d('切换分页前请先保存数据!'),
        onOk: () => {
          this.setState({});
        },
        onCancel: () => {
          this.fetchAssignData(page);
          dispatch({
            type: 'mallHomePlate/updateState',
            payload: {
              packageDataChange: false,
            },
          });
        },
      });
    } else {
      this.fetchAssignData(page);
    }
  }

  /**
   * 渲染采购套餐商品列表
   * @returns
   */
  @Bind()
  getProductColumns() {
    this.productColumns = [
      {
        title: intl.get(`small.common.model.sourceType`).d('商品类型'),
        dataIndex: 'sourceType',
        render: (val) =>
          val === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
      },
      {
        title: intl.get(`small.common.model.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`small.common.model.productCode`).d('商品编码'),
        dataIndex: 'productNum',
      },
      {
        title: intl.get(`small.common.model.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 440,
      },
      {
        title: intl.get('small.common.model.purchaseQuantity').d('采购数量'),
        dataIndex: 'purchaseQuantity',
        width: 160,
        render: (val, record) => {
          const { $form, _status } = record;
          return ['update', 'create'].includes(_status) ? (
            <Form.Item>
              {$form.getFieldDecorator('productId', { initialValue: record.productId })}
              {$form.getFieldDecorator('purchaseQuantity', {
                initialValue: val || 1,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('small.common.model.purchaseQuantity').d('采购数量'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  style={{ width: '140px' }}
                  max={999999999}
                  min={1}
                  step={1}
                  precision={0}
                  onChange={(value) => $form.setFieldsValue({ purchaseQuantity: value })}
                />
              )}
            </Form.Item>
          ) : (
            val
          );
        },
      },
      // {
      //   title: intl.get(`hzero.common.action`).d('操作'),
      //   dataIndex: 'operation',
      //   width: 60,
      //   render: (_, record) => {
      //     const id = record.$form.getFieldValue('productId') || record.productId;
      //     return (
      //       <a
      //         onClick={id ? () => this.productPreview(record) : null}
      //         style={{ color: id ? '#29BECE' : '#d9d9d9' }}
      //       >
      //         {intl.get(`small.common.model.preview`).d('预览')}
      //       </a>
      //     );
      //   },
      // },
    ];
    return this.productColumns;
  }

  /**
   * 渲染采购套餐明细
   */
  renderShoppingBasketForm() {
    let {
      mallHomePlate: { packageHeaderInfo = {} },
    } = this.props;
    packageHeaderInfo = this.state.marketBasketId ? packageHeaderInfo : {};
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.packageName`).d('采购套餐名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('basketName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.packageName`).d('采购套餐名称'),
                    }),
                  },
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: packageHeaderInfo.basketName,
              })(<Input maxLength={50} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.startTime`).d('开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.startTime`).d('开始时间'),
                    }),
                  },
                ],
                initialValue: packageHeaderInfo.startDate
                  ? moment(packageHeaderInfo.startDate, DEFAULT_DATETIME_FORMAT)
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
              label={intl.get(`small.common.model.endTime`).d('截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.endTime`).d('截止时间'),
                    }),
                  },
                ],
                initialValue: packageHeaderInfo.endDate
                  ? moment(packageHeaderInfo.endDate, DEFAULT_DATETIME_FORMAT)
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
              label={intl.get(`small.mallHomePlate.model.packageRemark`).d('采购套餐介绍')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('remark', {
                initialValue: packageHeaderInfo.remark,
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
   * 通用导入
   */
  @Bind()
  handleImport() {
    const { companyId, marketBasketId } = this.state;
    openTab({
      key: `/small/data-import/SMAL.BASKET_ASSIGN`,
      //  title: 'srm.common.view.purchasePackageImport',
      title: intl.get('srm.common.view.purchasePackageImport').d('采购套餐导入'),
      search: qs.stringify({
        action: intl.get('srm.common.view.purchasePackageImport').d('采购套餐导入'),
        backPath: `/small/mall-home-plate/edit-package/${companyId}/${marketBasketId}`,
        args: JSON.stringify({
          marketBasketId,
        }),
      }),
    });
  }

  /**
   * 生成采购套餐商品表格
   */
  renderShoppingBasketTable() {
    const {
      lineLoading,
      mallHomePlate: { packageProductList = [], packageProductPage = {} },
    } = this.props;

    const { companyId } = this.state;

    const filterProps = {
      companyId,
      onRef: this.handleRef,
      onSearch: this.fetchAssignData,
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
          <Button icon="archive" onClick={this.handleImport}>
            {intl.get('small.common.button.import').d('导入')}
          </Button>
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
          className="small-table-all-space"
          dataSource={packageProductList}
          pagination={packageProductPage}
          loading={lineLoading}
          columns={this.getProductColumns()}
          onChange={this.handleEditTableChange}
          onDataChange={this.changeTableData}
          rowSelection={rowSelection}
          rowKey="productId"
          bordered
        />
      </Fragment>
    );
  }

  render() {
    const { saveLoading, headerLoading } = this.props;
    const { collapseKeys, marketBasketId } = this.state;
    const multipleLovProps = {
      marketBasketId,
      onRef: this.handleBindMtpLovRef,
    };
    return (
      <Fragment>
        <Header
          title={
            marketBasketId
              ? intl.get(`small.mallHomePlate.view.package.edit`).d('编辑采购套餐')
              : intl.get(`small.mallHomePlate.view.package.create`).d('新建采购套餐')
          }
          backPath="/small/mall-home-plate/list?key=package"
        >
          <Button icon="save" type="primary" onClick={this.handleDataSave} loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={!!headerLoading} wrapperClassName="ued-detail-wrapper">
            <Collapse
              defaultActiveKey={['top', 'bottom']}
              onChange={(arr) => this.onCollapseChange(arr, 'top')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get('small.mallHomePlate.view.package.baseInfo').d('采购套餐基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('top')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('top') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="top"
              >
                {this.renderShoppingBasketForm()}
              </Panel>
              {marketBasketId && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get('small.mallHomePlate.view.package.product').d('采购套餐商品')}
                      </h3>
                      <a>
                        {collapseKeys.includes('bottom')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('bottom') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="bottom"
                >
                  {this.renderShoppingBasketTable()}
                </Panel>
              )}
            </Collapse>
          </Spin>
        </Content>
        <MultipleSelectionLov {...multipleLovProps} />
      </Fragment>
    );
  }
}
