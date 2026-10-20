/**
 * ProductAssign - 产品分配
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Button, Table, Row, Col } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import DataModal from './DataModal';

/**
 * 消费明细
 * @extends {Component} - React.Component
 * @reactProps {Object} productAssign - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['seci.productAssign', 'entity.tenant'],
})
@connect(({ productAssign, loading }) => ({
  productAssign,
  saveLoading: loading.effects['productAssign/saveProductAssign'],
  fetchLoading: loading.effects['productAssign/fetchProductAssign'],
  fetchProductLoading: loading.effects['productAssign/fetchModalData'],
}))
@withRouter
export default class ProductAssign extends PureComponent {
  form;
  dataModalRef;
  constructor(props) {
    super(props);
    const { tenantId = undefined } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      modalVisible: false,
      tenantId,
    };
  }

  componentDidMount() {
    this.fetchTenantInfo();
    this.onFetchProductAssign();
  }

  /**
   * 查询租户信息
   */
  @Bind()
  fetchTenantInfo() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'productAssign/fetchTenantInfo',
      payload: {
        tenantId,
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchProductAssign(pageData = {}) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productAssign/fetchProductAssign',
      payload: {
        page: isEmpty(pageData) ? {} : pageData,
        ...filterValues,
        organizationId: tenantId,
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveProductAssign(addRows) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'productAssign/addProductAssign',
      payload: {
        organizationId: tenantId,
        tenantProductAssigns: addRows,
      },
    }).then(res => {
      if (res) {
        this.onHideModal();
        this.refreshValue();
        notification.success();
      }
    });
  }

  /**
   * 启用/禁用产品
   * @param {Object} record 行数据
   */
  @Bind()
  handleDisabled(record) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'productAssign/handleDisabledProductAssign',
      payload: {
        ...record,
        enabledFlag: +!record.enabledFlag, // 取反状态标记
        tenantId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.onFetchProductAssign();
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   *
   * @param {object} ref - DataModal子组件对象
   */
  @Bind()
  getModalRef(ref) {
    this.dataModalRef = ref;
  }

  /**
   * 显示产品添加弹框
   */
  @Bind()
  onShowModal() {
    this.fetchModalData();
    this.setState({
      modalVisible: true,
    });
  }

  /**
   * 隐藏产品添加弹框
   */
  @Bind()
  onHideModal() {
    this.dataModalRef.setState({
      addRows: [],
    });
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 查询要添加的产品数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'productAssign/fetchModalData',
      payload: {
        organizationId: tenantId,
        ...queryData,
      },
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      match,
      productAssign: { data = [], productData = [], productPagination = {}, tenantInfo = {} },
      saveLoading,
      fetchLoading,
      fetchProductLoading,
    } = this.props;

    const { modalVisible } = this.state;

    const columns = [
      {
        title: intl.get(`seci.productAssign.model.productAssign.productCode`).d('产品代码'),
        dataIndex: 'productCode',
        width: 200,
      },
      {
        title: intl.get(`seci.productAssign.model.productAssign.productName`).d('产品名称'),
        dataIndex: 'productName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        align: 'center',
        width: 80,
        render: (val, record) => {
          return record.enabledFlag ? (
            <a
              onClick={() => {
                this.handleDisabled(record);
              }}
            >
              {intl.get('hzero.common..status.disable').d('禁用')}
            </a>
          ) : (
            <a
              onClick={() => {
                this.handleDisabled(record);
              }}
            >
              {intl.get('hzero.common..status.enable').d('启用')}
            </a>
          );
        },
      },
    ];

    const modalProps = {
      modalVisible,
      saveLoading,
      fetchProductLoading,
      onRef: this.getModalRef,
      fetchModalData: this.fetchModalData,
      dataSource: productData,
      pagination: productPagination,
      onHideModal: this.onHideModal,
      onSaveProductAssign: this.onSaveProductAssign,
    };

    const basePath = match.path.substring(0, match.path.indexOf('/product-assign'));
    return (
      <React.Fragment>
        <Header
          title={intl.get(`seci.productAssign.view.message.title`).d('产品配置')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.onShowModal()}>
            {intl.get(`seci.productAssign.view.message.button.add`).d('添加产品')}
          </Button>
        </Header>
        <Content>
          <Row gutter={24} style={{ marginBottom: '10px' }}>
            <Col span={3}>{intl.get('entity.tenant.code').d('租户代码')}:</Col>
            <Col span={4} style={{ borderBottom: '1px solid #999' }}>
              {tenantInfo.tenantNum}
            </Col>
            <Col span={3}>{intl.get('entity.tenant.name').d('租户名称')}:</Col>
            <Col span={4} style={{ borderBottom: '1px solid #999' }}>
              {tenantInfo.tenantName}
            </Col>
          </Row>
          <Table
            bordered
            loading={fetchLoading}
            rowKey="assignId"
            dataSource={data}
            columns={columns}
            pagination={false}
          />
          <DataModal {...modalProps} />
        </Content>
      </React.Fragment>
    );
  }
}
