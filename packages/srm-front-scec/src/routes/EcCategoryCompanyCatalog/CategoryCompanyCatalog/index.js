/**
 * ecCategoryCompanyCatalog -公司目录映射
 * @date: 2019-1-30
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Button, Table, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import queryString from 'querystring';

// import { SRM_SCEC } from '_utils/config';
import {
  filterNullValueObject,
  // getCurrentOrganizationId
} from 'utils/utils';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
// import ExcelExport from 'components/ExcelExport';
import Lov from 'components/Lov';

import FilterForm from './FilterForm';
import Drawer from './Drawer';
import CompanyProductModal from './CompanyProductModal';

// const organizationId = getCurrentOrganizationId();
const modelPrompt = 'scec.ecCategoryPlatformCatalog.model';
@connect(({ loading, ecCategoryCompanyCatalog }) => ({
  ecCategoryCompanyCatalog,
  loading: loading.effects['ecCategoryCompanyCatalog/fetchEcCategoryCompanyCatalog'],
  saveLoading: loading.effects['ecCategoryCompanyCatalog/setEcCategoryMap'],
  enableLoading: loading.effects['ecCategoryCompanyCatalog/setPermissionSetEnable'],
}))
@withRouter
export default class CategoryCompanyCatalog extends PureComponent {
  form;

  searchCompanyModalForm;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
      visible: false,
      modalVisible: false,
      tableRecord: {},
      _back: 0, // 判断返回是否需要重新查询
    };
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state._back === -1) {
      this.setState({
        _back: 0,
        modalVisible: true,
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
  fetchEcData(params = {}, val) {
    const {
      dispatch,
      ecCategoryCompanyCatalog: { comPagination = {} },
      companyId,
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecCategoryCompanyCatalog/fetchEcCategoryCompanyCatalog',
      payload: {
        companyId: params.companyId ? params.companyId : companyId,
        page: isEmpty(params) ? comPagination : params,
        ...filterValues,
      },
    });
    if (val !== 'isPage') {
      this.setState({
        selectedRows: [],
      });
    }
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/CTGY_COM_CATA_MAP`,
      search: queryString.stringify({
        title: 'hzero.common.button.import',
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
    });
  }

  /**
   * 勾选行
   */
  @Bind()
  onTableSelectedRowChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 展示批量映射目录lov
   */
  @Bind()
  showMapsCatalogLov() {
    this.catalog.onSearchBtnClick();
  }

  /**
   * 批量映射
   */
  @Bind()
  setMapsPlatfrom(_, record) {
    const { companyId } = this.props;
    const { selectedRows = [] } = this.state;
    const mapsRows = selectedRows.map(n => {
      const m = {
        ...n,
      };
      m.catalogName = record.catalogName;
      m.catalogId = record.catalogId;
      m.companyId = companyId;
      return m;
    });
    this.handleSetMap(mapsRows);
  }

  @Bind()
  handleSetMap(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryCompanyCatalog/setEcCategoryMap',
      payload: params,
    }).then(res => {
      if (res) {
        notification.info({
          message: intl
            .get(`${modelPrompt}.waiting`)
            .d('变更电商分类映射关系后，商城选买页面需要等待2-10分钟加载更新的内容，请您耐心等待'),
        });
        this.fetchEcData();
        this.handleCancel();
      }
    });
  }

  /**
   * 启用和禁用
   */
  @Bind()
  handleDisable(record) {
    const { dispatch, companyId } = this.props;
    dispatch({
      type: 'ecCategoryCompanyCatalog/setPermissionSetEnable',
      payload: {
        ...record,
        companyId,
        enabledFlag: record.enabledFlag ? 0 : 1,
      },
    }).then(res => {
      if (res) {
        this.fetchEcData();
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateData() {
    this.setState({
      visible: true,
      tableRecord: {},
    });
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record) {
    this.setState({
      visible: true,
      tableRecord: record,
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  /**
   * 电商商品查询弹框
   */
  @Bind
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
      modalVisible: true,
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
        companylist: {},
        companypagination: {},
        companydetail: {},
        ComtotalElements: 0,
      },
    });
    this.searchCompanyModalForm.setFieldsValue({
      ecProductNum: undefined,
      ecProductName: undefined,
    });
    this.setState({
      modalVisible: false,
    });
  }

  render() {
    const {
      ecCategoryCompanyCatalog: {
        companyList = {},
        comPagination = {},
        ecCategoryName,
        ecCategoryId,
        ecPlatformCode,
      },
      loading,
      saveLoading,
      enableLoading,
      companyId,
      mapStatusList = [],
    } = this.props;
    const { selectedRows = [], visible, tableRecord = {}, modalVisible } = this.state;
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
        title: intl.get('scec.ecCategoryCompanyCatalog.model.catalogCode').d('公司目录代码'),
        width: 100,
        dataIndex: 'catalogCode',
      },
      {
        title: intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称'),
        width: 100,
        dataIndex: 'catalogName',
      },
      {
        title: intl.get('scec.ecPlatformCategory.model.catalogLevel').d('目录层级'),
        width: 60,
        dataIndex: 'catalogLevel',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'edit',
        render: (_, record) => {
          return (
            <span className="action-link">
              <a
                disabled={!record.mappingId}
                onClick={() => {
                  if (record.enabledFlag === 1) {
                    Modal.confirm({
                      title: intl.get('scec.ecCatalog.view.confirm.enabledTitle').d('确认禁用?'),
                      onOk: () => {
                        this.handleDisable(record);
                      },
                    });
                  } else {
                    this.handleDisable(record);
                  }
                }}
              >
                {record.mappingId && record.enabledFlag
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </a>
              <a
                onClick={() => {
                  this.handleEditData(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            </span>
          );
        },
      },
      {
        title: intl.get(`scec.ecPlatformCategory.model.catalogDetails`).d('电商商品详情'),
        width: 80,
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
      companyId,
      mapStatusList,
    };
    const tableProps = {
      rowKey: 'ecCategoryId',
      columns,
      bordered: true,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.ecCategoryId),
        onChange: this.onTableSelectedRowChange,
      },
      pagination: comPagination,
      onChange: page => {
        this.fetchEcData(page, 'isPage');
      },
      dataSource: companyList.content || [],
      loading: loading || saveLoading || enableLoading,
    };
    const detailProps = {
      visible,
      saveLoading,
      companyId,
      tableRecord,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSave: this.handleSetMap,
    };
    const modalList = {
      companyId,
      ecCategoryName,
      ecCategoryId,
      ecPlatformCode,
      _back: this.state._back,
      onRef: node => {
        this.searchCompanyModalForm = node.props.form;
      },
    };
    // const filterValues = isUndefined(this.form)
    //   ? {}
    //   : filterNullValueObject(this.form.getFieldsValue());
    return (
      <React.Fragment>
        <div style={{ padding: '16px' }}>
          <Lov
            code="SCEC.COM.CATALOG"
            ref={c => {
              this.catalog = c;
            }}
            queryParams={{
              companyId,
            }}
            style={{ display: 'none' }}
            onChange={this.setMapsPlatfrom}
          />
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <div style={{ margin: '8px 0 16px', textAlign: 'right' }}>
            {/* <ExcelExport
              requestUrl={`${SRM_SCEC}/v1/${organizationId}/com-category-catalog-maps/exports?companyId=${companyId}`}
              queryParams={filterValues}
              otherButtonProps={{ icon: '' }}
            /> */}
            <Button onClick={this.handleImport} style={{ marginLeft: '8px' }}>
              {intl.get('hzero.common.button.import').d('批量导入')}
            </Button>
            <Button
              onClick={this.showMapsCatalogLov}
              disabled={selectedRows.length <= 0}
              style={{ marginLeft: '8px' }}
            >
              {intl.get('scec.ecCategoryPlatformCatalog.button.batchMapping').d('批量映射')}
            </Button>
            <Button type="primary" onClick={this.handleCreateData} style={{ marginLeft: '8px' }}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <Table {...tableProps} />
        </div>
        <Drawer {...detailProps} />
        {modalVisible && (
          <CompanyProductModal
            modalVisible={modalVisible}
            onHandleCancel={this.closeModal}
            {...modalList}
          />
        )}
      </React.Fragment>
    );
  }
}
