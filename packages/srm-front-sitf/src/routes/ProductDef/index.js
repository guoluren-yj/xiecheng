/**
 * ProductDef -产品线定义页面
 * @date: 2018-9-11
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import ProductDefModal from './ProductDefModal';
import FilterForm from './FilterForm';

@formatterCollections({ code: ['sitf.productDef', 'sitf.common'] })
@connect(({ productDef, loading }) => ({
  productDef,
  loading: loading.effects['productDef/queryProductDef'],
}))
@CacheComponent({ cacheKey: '/sitf/product-def' })
export default class ProductDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tableRecord: {},
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productDef/queryProductDef',
      payload: {
        page: {},
      },
    });
  }
  /**
   * 查询产品线列表
   * @param {object} params  查询参数
   */
  @Bind()
  queryProductDef(params = {}) {
    const {
      dispatch,
      productDef: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productDef/queryProductDef',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建表格
   */
  @Bind()
  handleCreateProduct() {
    this.setState({
      tableRecord: {},
      modalVisible: true,
    });
  }

  /**
   * 编辑
   * @param {object} record 编辑参数
   */
  @Bind()
  handlerEditProduct(record = {}) {
    this.setState({
      tableRecord: record,
      modalVisible: true,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
      tableRecord: {},
    });
  }

  /**
   * 保存数据
   * @param {object} values 保存参数
   */
  @Bind()
  handleSaveProduct(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'productDef/updateProduct',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
          tableRecord: {},
        });
        this.queryProductDef();
      }
    });
  }

  render() {
    const {
      productDef: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const { modalVisible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get('sitf.productDef.model.productDef.productLineCode').d('产品线代码'),
        dataIndex: 'productLineCode',
        width: 200,
        align: 'left',
      },
      {
        title: intl.get('sitf.productDef.model.productDef.productLineName').d('产品线描述'),
        dataIndex: 'productLineName',
        width: 200,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        align: 'left',
        width: 80,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 100,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handlerEditProduct(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterForm = {
      onRef: this.handleRef,
      onFetchData: this.queryProductDef,
    };
    const detailProps = {
      modalVisible,
      loading,
      tableRecord,
      anchor: 'right',
      onHandleSaveProduct: this.handleSaveProduct,
      onCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sitf.productDef.view.productDef.headerTitle').d('产品线定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateProduct}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterForm} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            loading={loading}
            rowKey="productLineId"
            columns={columns}
            bordered
            onChange={page => this.queryProductDef(page)}
          />
        </Content>
        <ProductDefModal {...detailProps} />
      </React.Fragment>
    );
  }
}
