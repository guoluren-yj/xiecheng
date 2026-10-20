/**
 * ProductDefine - 产品定义
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import CacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 产品定义
 * @extends {Component} - React.Component
 * @reactProps {Object} productDefine - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.productDefine'] })
@connect(({ productDefine, loading }) => ({
  productDefine,
  saveLoading: loading.effects['productDefine/saveProductDefine'],
  fetchLoading: loading.effects['productDefine/fetchProduct'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/product-define' })
export default class ProductDefine extends PureComponent {
  form;
  /**
   * 内部状态
   */
  state = {
    modalVisible: false,
    editRowData: {},
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productDefine/fetchProductType',
      payload: {},
    });
    this.fetchProductData();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchProductData(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productDefine/fetchProduct',
      payload: {
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  showEditModal(flag, record = {}) {
    const state = {
      modalVisible: !!flag,
      editRowData: record,
    };
    if (!flag) {
      state.editRowData = {};
    }
    this.setState(state);
  }

  /**
   * 新增产品
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAddProduct(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'productDefine/saveProductDefine',
      payload: {
        ...editRowData,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      productDefine: { data = {} },
    } = this.props;
    this.fetchProductData(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  fetchProduct(queryData = {}) {
    this.fetchProductData(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchProductData(pagination);
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
   * 渲染方法
   * @returns
   */
  render() {
    const {
      productDefine: { data = [], pagination = {} },
      saveLoading,
      fetchLoading,
    } = this.props;
    const { modalVisible, editRowData } = this.state;
    const columns = [
      {
        title: intl.get(`seci.productDefine.model.productDefine.productCode`).d('产品代码'),
        dataIndex: 'productCode',
        width: 150,
      },
      {
        title: intl.get(`seci.productDefine.model.productDefine.productName`).d('产品名称'),
        dataIndex: 'productName',
      },
      {
        title: intl.get(`seci.productDefine.model.productDefine.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
        width: 140,
      },
      {
        title: intl.get(`seci.productDefine.model.productDefine.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        align: 'center',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
        align: 'center',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 80,
        align: 'center',
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.showEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      loading: saveLoading,
      onHandleAddProduct: this.handleAddProduct,
      showEditModal: this.showEditModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`seci.productDefine.view.message.title`).d('产品定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <QueryForm onFetchProduct={this.fetchProduct} onRef={this.handleBindRef} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="productId"
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
