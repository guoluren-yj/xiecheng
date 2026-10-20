/**
 * CustomBar\CheckDetail\Detail.js - 平台自定义栏管理查看界面
 * @date: 2019年3月2日 09:03:41
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { Content, Header } from 'components/Page';
import { connect } from 'dva';
import { Col, Form, Modal, Row, Spin, Tabs, Collapse, Icon } from 'hzero-ui';
import qs from 'querystring';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { EDIT_FORM_ITEM_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getEditTableData,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';
import FilterForm from './FilterForm';

const { Panel } = Collapse;
const prompt = 'scec.customBar.model.customBar';
const FormItem = Form.Item;
const UEDDisplayFormItem = props => {
  const { label, value } = props;
  return (
    <Form.Item label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </Form.Item>
  );
};
@connect(({ loading, customBar, goodsPreview }) => ({
  saveLoading: loading.effects['customBar/updateCustomBar'],
  barLoading: loading.effects['customBar/fetchCustomBar'],
  barAssignLoading: loading.effects['customBar/fetchCustomBarAssignList'],
  productPreviewLoading: loading.effects['goodsPreview/fetchDetail'],
  customBar,
  goodsPreview,
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.customBar', 'scec.common'] })
export default class Detail extends Component {
  filterForm;

  barId = this.props.match.params.barId;

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: {},
      productPreviewLoading: props.productPreviewLoading || false,
      barId: props.match.params.barId,
    };
  }

  componentDidMount() {
    const {
      match,
      dispatch,
      location: { state = { _back: 1 } },
    } = this.props;
    let data = {};
    if (!isTenantRoleLevel()) {
      data = { barId: this.barId };
    } else {
      data = { barId: this.barId, companyId: match.params.companyId };
    }
    if (!isUndefined(data.barId) && state && state._back !== -1) {
      this.fetchBarData();
      dispatch({
        type: 'customBar/fetchCustomBarAssignList',
        payload: data,
      });
    }
    dispatch({
      type: 'customBar/init',
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
      customBar: { customBar = {}, assignList = {} },
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
          type: 'customBar/updateCustomBar',
          payload,
        }).then(res => {
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
      type: 'customBar/fetchCustomBar',
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
      type: 'customBar/fetchCustomBarAssignList',
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
      type: 'customBar/updateState',
      payload: {
        assignList: { content: [] },
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
      customBar: { assignDataChange = false },
    } = this.props;
    if (!assignDataChange) {
      dispatch({
        type: 'companyBanner/updateState',
        payload: {
          assignDataChange: true,
        },
      });
    }
  }

  /**
   * 修改自定义栏类型
   * @param {自定义栏类型} value
   */
  @Bind()
  handleTypeChange(value, item) {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'customBar/updateState',
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
      customBar: { assignDataChange = false },
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

  /**
   * 生成行表格
   * @returns
   */
  getProductColumns() {
    const {
      match: {
        params: { companyId },
      },
      form: { getFieldValue },
    } = this.props;
    if (!isTenantRoleLevel()) {
      this.productColumns = [
        {
          title: intl.get(`${prompt}.queue.number`).d('排序号'),
          dataIndex: 'orderSeq',
        },
        {
          title: intl.get(`${prompt}.supplier`).d('供应商'),
          dataIndex: 'sourceFromName',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getFieldValue,
            } = record.$form;
            getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
            getFieldDecorator('supplierCompanyId', { initialValue: record.supplierCompanyId });
            getFieldDecorator('sourceFromName', { initialValue: val });
            return record._status === 'update' ||
              (record._status === 'create' && getFieldDecorator) ? (
              <FormItem>
                {getFieldDecorator('sourceFrom', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.supplier`).d('供应商'),
                      }),
                    },
                  ],
                  initialValue: record.sourceFrom,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={$getFieldValue('sourceFromName')}
                    code="SCEC.PLATFORM_EC_CLIENT"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    disabled="ture"
                    onChange={(_, item) => {
                      setFieldsValue({
                        productName: undefined,
                        productNum: undefined,
                        productId: undefined,
                        supplierCompanyId: item.supplierCompanyId,
                        supplierTenantId: item.supplierTenantId,
                        sourceFrom: item.ecPlatformCode,
                        // sourceFromName: item.ecPlatformName,
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
          title: intl.get(`${prompt}.Commodity.code`).d('商品编号'),
          dataIndex: 'productNum',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getFieldValue,
            } = record.$form;
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
                    code="SCEC.PLATFORM_EC_PRODUCT"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                      supplierCompanyId: getFieldValue('supplierCompanyId'),
                    }}
                    disabled="ture"
                    onChange={(_, item) => {
                      setFieldsValue({
                        productNum: item.productNum,
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
    } else {
      this.productColumns = [
        {
          title: intl.get(`${prompt}.queue.number`).d('排序号'),
          dataIndex: 'orderSeq',
        },
        {
          title: intl.get(`${prompt}.sourceType`).d('商品类型'),
          dataIndex: 'sourceType',
          width: 100,
          render: (val, record) => (
            <React.Fragment>
              {record.$form.getFieldDecorator('sourceType')}
              {record.sourceType && record.sourceType === 'CATA' ? (
                <span>{intl.get(`${prompt}.directory`).d('目录化')}</span>
              ) : (
                <span>{intl.get(`${prompt}.E-commerce`).d('电商')}</span>
              )}
            </React.Fragment>
          ),
        },
        {
          title: intl.get(`${prompt}.supplier`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getfieldValue,
            } = record.$form;
            const whether = this.props.form.getFieldValue('labelCode');
            getFieldDecorator('supplierCompanyName', { initialValue: val });
            getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
            getFieldDecorator('sourceFrom', { initialValue: record.sourceFrom });
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
                    textValue={$getfieldValue('supplierCompanyName')}
                    code={
                      $getfieldValue('sourceType') === 'EC'
                        ? 'SCEC.COMPANY_EC_CLIENT'
                        : 'SCEC.COMPANY_SUPPLIER'
                    }
                    disabled="ture"
                    queryParams={{ companyId, ecPlatform: whether !== 'ALL' ? whether : undefined }}
                    onChange={(_, item) => {
                      setFieldsValue({
                        productId: undefined,
                        productName: undefined,
                        supplierTenantId: item.supplierTenantId,
                        supplierCompanyName: item.supplierName,
                        sourceFrom:
                          $getfieldValue('sourceType') === 'EC' ? item.ecPlatform : 'CATA',
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
          title: intl.get(`${prompt}.Commodity.code`).d('商品编号'),
          dataIndex: 'productNum',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getfieldValue,
            } = record.$form;
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
                    textValue={$getfieldValue('productNum')}
                    code="SCEC.COMPANY_PRODUCT"
                    queryParams={{
                      supplierId: $getfieldValue('supplierCompanyId'),
                      companyId,
                      // sourceFrom: this.props.form.getFieldValue('labelCode'),
                      sourceFrom: $getfieldValue('sourceType'),
                    }}
                    disabled="true"
                    onChange={(_, item) => {
                      setFieldsValue({
                        productNum: item.productNum,
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
    }
    return this.productColumns;
  }

  /**
   * 渲染自定义栏明细
   */
  renderCustomBarForm() {
    const {
      customBar: { customBar = {}, barType },
    } = this.props;

    const { getFieldDecorator } = this.props.form;
    getFieldDecorator('barTypeName', { initialValue: customBar.barTypeName });
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${prompt}.queue.number`).d('排序号')}
              value={customBar.orderSeq || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${prompt}.barName`).d('自定义栏名称')}
              value={customBar.barName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${prompt}.barType`).d('自定义栏类型')}
              value={customBar.barTypeName || ''}
            />
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`${prompt}.labelCode`).d('标签页')}
              value={customBar.labelName || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`scec.shopBasket.model.shoppingBasket.startDate`).d('开始时间')}
              value={customBar.startDate || ''}
            />
          </Col>
          <Col span={8}>
            <UEDDisplayFormItem
              label={intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间')}
              value={customBar.endDate || ''}
            />
          </Col>
        </Row>
        {barType === 'IMAGE' && (
          <Row gutter={48} className="writable-row">
            <Col span={8}>
              <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`${prompt}.image`).d('图片')}>
                <div
                  className="border"
                  style={{ border: '1px solid rgb(233, 232, 232)', width: '195px', height: '66px' }}
                >
                  <img
                    src={customBar.imagePath}
                    alt={intl.get(`${prompt}.image`).d('图片')}
                    style={{
                      display: 'inline-block',
                      width: '60px',
                      height: '60px',
                      padding: '5px 0 5px 5px',
                    }}
                  />
                  <a
                    href={customBar.imagePath}
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
                    {customBar.imageName}
                  </a>
                </div>
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  render() {
    const {
      barLoading,
      barAssignLoading,
      customBar: { customBar, assignList = {}, assignPagination = {} },
      match: {
        params: { companyId },
      },
    } = this.props;

    const { productPreviewLoading, collapseKeys } = this.state;

    const barIdFlag = customBar && customBar.barId;

    const filterProps = {
      companyId,
      onSearch: this.fetchAssignData,
      onRef: this.handleRef,
    };

    const currentLevel = !isTenantRoleLevel() ? `platform` : `company`;
    const titleLevel = !isTenantRoleLevel()
      ? intl.get(`${prompt}.Platform.Catelogue.Mapping`).d('平台自定义栏')
      : intl.get(`${prompt}.Company.Catelogue.Mapping`).d('公司自定义栏');
    return (
      <Fragment>
        <Header title={`${titleLevel}`} backPath={`/scec/${currentLevel}-custom-bar/list`} />
        <Content>
          <Spin
            spinning={(barLoading === undefined ? false : barLoading) || productPreviewLoading}
            wrapperClassName="ued-detail-wrapper"
          >
            <Collapse
              defaultActiveKey={['customBarDetail']}
              onChange={arr => this.onCollapseChange(arr, 'customBarDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${prompt}.customBarDetail`).d('自定义栏明细')}</h3>
                    <a>
                      {collapseKeys.customBarDetail
                        ? collapseKeys.customBarDetail.some(o => o === 'customBarDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.customBarDetail
                          ? collapseKeys.customBarDetail.some(o => o === 'customBarDetail')
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
                    <EditTable
                      dataSource={assignList.content}
                      pagination={assignPagination}
                      loading={barAssignLoading}
                      columns={this.getProductColumns()}
                      onChange={this.handleEditTableChange}
                      onChangeTableData={this.changeTableData}
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
