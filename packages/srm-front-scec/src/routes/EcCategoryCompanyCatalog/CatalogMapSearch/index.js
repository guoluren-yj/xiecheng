/**
 * CatalogMapSearch - 集团映射查询
 * @date: 2019-1-30
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Table, Form } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
// import ExcelExport from 'components/ExcelExport';
import ProductDetailsModal from '../../ProductDetailsModal';

import FilterForm from './FilterForm';

const modelPrompt = 'scec.ecCategoryPlatformCatalog.model';

@Form.create({ fieldNameProp: null })
@connect(({ loading, ecCategoryCompanyCatalog }) => ({
  ecCategoryCompanyCatalog,
  loading: loading.effects['ecCategoryCompanyCatalog/fetchEcCategoryCatalog'],
}))
@withRouter
export default class CatalogMapSearch extends PureComponent {
  form;

  searchModalForm;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      visible: false,
      _back: 0, // 判断返回是否需要重新查询
      fromType: 1, // 判断详情页来源,1指公司目录中集团
    };
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state._back === -1) {
      this.setState({
        _back: 0,
        visible: true,
      });
      this.props.history.push({
        state: {
          _back: 0,
        },
      });
    } else {
      this.fetchEcData();
    }
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params = {}) {
    const {
      dispatch,
      ecCategoryCompanyCatalog: { pagination = {} },
      companyId,
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecCategoryCompanyCatalog/fetchEcCategoryCatalog',
      payload: {
        companyId: params.companyId ? params.companyId : companyId,
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    });
  }

  /**
   * 电商商品查询弹框
   */
  @Bind()
  productDetails(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryCompanyCatalog/updateState',
      payload: {
        ecCategoryId: params.ecCategoryId,
        ecPlatformCode: params.ecPlatformCode,
        ecCategoryName: params.ecCategoryName,
      },
    });
    this.setState({
      visible: true,
      _back: -1,
    });
  }

  /**
   * 关闭弹框
   */
  @Bind()
  closeModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'productDetailsModal/updateState',
      payload: {
        list: {},
        pagination: {},
        detail: {},
        JTtotalElements: 0,
      },
    });
    this.searchModalForm.setFieldsValue({
      ecProductNum: undefined,
      ecProductName: undefined,
    });
    this.setState({
      visible: false,
    });
  }

  render() {
    const {
      ecCategoryCompanyCatalog: {
        list = {},
        pagination = {},
        ecCategoryName,
        ecCategoryId,
        ecPlatformCode,
      },
      loading,
      mapStatusList = [],
    } = this.props;
    const { visible, fromType } = this.state;
    const columns = [
      {
        title: intl.get('scec.common.model.ecPlatformName').d('电商名称'),
        width: 100,
        dataIndex: 'ecPlatformName',
      },
      {
        title: intl.get(`${modelPrompt}.ecCategoryName`).d('电商分类名称'),
        width: 100,
        dataIndex: 'ecCategoryName',
      },
      {
        title: intl
          .get('scec.ecCategoryCatalog.model.ecCategoryCatalog.catalogCode')
          .d('集团目录代码'),
        width: 100,
        dataIndex: 'catalogCode',
      },
      {
        title: intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称'),
        width: 100,
        dataIndex: 'catalogName',
      },
      {
        title: intl.get('scec.ecCatalog.model.ecCatalog.catalogLevel').d('目录层级'),
        width: 60,
        dataIndex: 'catalogLevel',
      },
      {
        title: intl.get(`scec.ecPlatformCategory.model.catalogDetails`).d('电商商品详情'),
        width: 70,
        dataIndex: 'productDetails',
        render: (_, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.productDetails(record)}>
                {intl.get('hzero.common.button.examine').d('查看')}
              </a>
            </span>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
      mapStatusList,
    };
    const tableProps = {
      rowKey: 'ecCategoryId',
      columns,
      loading,
      bordered: true,
      pagination,
      dataSource: list.content || [],
      onChange: this.fetchEcData,
    };
    const modalList = {
      fromType,
      ecCategoryName,
      ecCategoryId,
      ecPlatformCode,
      _back: this.state._back,
      onRef: node => {
        this.searchModalForm = node.props.form;
      },
    };
    return (
      <React.Fragment>
        <div style={{ padding: '0 16px' }}>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table {...tableProps} />
        </div>
        {visible && (
          <ProductDetailsModal
            modalVisible={visible}
            onHandleCancel={this.closeModal}
            {...modalList}
          />
        )}
      </React.Fragment>
    );
  }
}
