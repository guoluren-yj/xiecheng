/**
 * EcCategoryPlatformCatalog -平台目录映射
 * @date: 2019-1-30
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Table, Modal } from 'hzero-ui';
import Icons from 'components/Icons';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import queryString from 'querystring';

// import { SRM_SCEC } from '_utils/config';
import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import ExcelExport from 'components/ExcelExport';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import EcProductModal from './EcProductModal';
import FilterForm from './FilterForm';

const FormItem = Form.Item;

const modelPrompt = 'scec.ecCategoryPlatformCatalog.model';
const viewPrompt = 'scec.ecCategoryPlatformCatalog.view';
@formatterCollections({
  code: [
    'scec.ecCategoryPlatformCatalog',
    'scec.ecPlatformCategory',
    'scec.ecCatalog',
    'scec.common',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, ecCategoryPlatformCatalog }) => ({
  ecCategoryPlatformCatalog,
  loading: loading.effects['ecCategoryPlatformCatalog/fetchEcCategoryPlatformCatalog'],
  saveLoading: loading.effects['ecCategoryPlatformCatalog/setPlatformEcCategoryMap'],
  enableLoading: loading.effects['ecCategoryPlatformCatalog/setPermissionSetEnable'],
}))
export default class EcCategoryPlatformCatalog extends Component {
  form;

  searchEcModalForm;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      platformCatalogList: [],
      dataSource: [],
      modalVisible: false,
      _back: 0, // 判断返回是否需要重新查询
    };
  }

  componentDidMount() {
    this.queryMapStatusList();
    this.fetchEcData();
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
    }
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询映射值集
   */
  @Bind()
  queryMapStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryPlatformCatalog/queryMapStatusList',
    });
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/CTGY_PLAT_CATA_MAP`,
      search: queryString.stringify({
        title: 'hzero.common.button.import',
        action: intl.get('hzero.common.button.import').d('批量导入'),
        prefixPatch: '/scec',
      }),
    });
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params = {}) {
    const {
      dispatch,
      ecCategoryPlatformCatalog: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({
      dataSource: [],
    });
    dispatch({
      type: 'ecCategoryPlatformCatalog/fetchEcCategoryPlatformCatalog',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    }).then(() => {
      const {
        ecCategoryPlatformCatalog: { list = {} },
      } = this.props;
      this.setState({
        dataSource: list.content,
        // selectedRows: [],
      });
    });
  }

  /**
   * 展示批量映射目录lov
   */
  @Bind()
  showMapsCatalogLov() {
    this.platformCatalog.onSearchBtnClick();
  }

  /**
   * 批量映射
   */
  @Bind()
  setMapsPlatfrom(_, record) {
    const { selectedRows = [] } = this.state;
    const mapsRows = selectedRows.map(n => {
      const m = {
        ...n,
      };
      m.catalogName = record.catalogName;
      m.catalogId = record.catalogId;
      return m;
    });
    this.handleSetMap(mapsRows);
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { platformCatalogList } = this.state;
    this.handleSetMap(platformCatalogList);
  }

  @Bind()
  handleSetMap(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryPlatformCatalog/setPlatformEcCategoryMap',
      payload: params,
    }).then(res => {
      if (res) {
        notification.info({
          message: intl
            .get(`${modelPrompt}.waiting`)
            .d('变更电商分类映射关系后，商城选买页面需要等待2-10分钟加载更新的内容，请您耐心等待'),
        });
        this.fetchEcData();
        this.setState({
          platformCatalogList: [],
        });
      }
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
   * 需要保存的目录代码list
   * @param {*} _
   * @param {*} lovRecord - lov选中的record
   * @param {*} record - table的record
   */
  @Bind()
  setPlatformCatalogList(_, lovRecord, record) {
    const { platformCatalogList = [] } = this.state;
    const platformCatalogkeys = platformCatalogList.map(n => {
      return n.ecCategoryId;
    });
    let list = platformCatalogList;
    document.getElementById([`catalogName#${record.ecCategoryId}`]).innerHTML =
      lovRecord.catalogName;
    if (platformCatalogkeys.indexOf(record.ecCategoryId) >= 0) {
      list = platformCatalogList.map(n => {
        const m = {
          ...n,
        };
        if (m.ecCategoryId === record.ecCategoryId) {
          m.catalogId = lovRecord.catalogId;
        }
        return m;
      });
    } else {
      const m = {
        ...record,
      };
      m.catalogId = lovRecord.catalogId;
      list.push(m);
    }
    this.setState({
      platformCatalogList: list,
    });
  }

  /**
   * 启用和禁用
   */
  @Bind()
  handleDisable(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryPlatformCatalog/setPermissionSetEnable',
      payload: {
        ...record,
        enabledFlag: record.enabledFlag ? 0 : 1,
      },
    }).then(res => {
      if (res) {
        this.fetchEcData();
      }
    });
  }

  /**
   * 电商商品查询弹框
   */
  @Bind
  productDetails(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryPlatformCatalog/updateState',
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
        Eclist: {},
        Ecpagination: {},
        Ecdetail: {},
        totalElements: 0,
      },
    });
    this.searchEcModalForm.setFieldsValue({
      ecProductNum: undefined,
      ecProductName: undefined,
    });
    this.setState({
      modalVisible: false,
    });
  }

  render() {
    const {
      ecCategoryPlatformCatalog: {
        pagination = {},
        mapStatusList = [],
        ecCategoryName,
        ecCategoryId,
        ecPlatformCode,
      },
      form: { getFieldDecorator },
      loading,
      saveLoading,
      enableLoading,
    } = this.props;
    const { dataSource = [], selectedRows = [], modalVisible } = this.state;
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
        title: intl.get(`${modelPrompt}.catalogId`).d('平台目录代码'),
        width: 100,
        dataIndex: 'catalogId',
        render: (text, record) => {
          return (
            <Form>
              <FormItem style={{ margin: 0 }}>
                {getFieldDecorator(`catalogId#${record.ecCategoryId}`, {
                  initialValue: record.catalogId,
                })(
                  <Lov
                    allowClear={false}
                    textValue={record.catalogCode}
                    code="SCEC.PLATFORM.CATALOG"
                    onChange={(_, params) => this.setPlatformCatalogList(_, params, record)}
                  />
                )}
              </FormItem>
            </Form>
          );
        },
      },
      {
        title: intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称'),
        width: 100,
        dataIndex: 'catalogName',
        render: (_, record) => {
          return <span id={`catalogName#${record.ecCategoryId}`}>{record.catalogName}</span>;
        },
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
            </span>
          );
        },
      },
      {
        title: intl.get('scec.ecPlatformCategory.model.catalogDetails').d('电商商品详情'),
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
      mapStatusList,
    };
    const tableProps = {
      columns,
      pagination,
      dataSource,
      bordered: true,
      className: 'editable-table',
      rowKey: 'ecCategoryId',
      onChange: this.fetchEcData,
      loading: loading || saveLoading || enableLoading,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.ecCategoryId),
        onChange: this.onTableSelectedRowChange,
      },
    };
    const modalList = {
      ecCategoryName,
      ecCategoryId,
      ecPlatformCode,
      _back: this.state._back,
      onRef: node => {
        this.searchEcModalForm = node.props.form;
      },
    };
    // const filterValues = isUndefined(this.form)
    //   ? {}
    //   : filterNullValueObject(this.form.getFieldsValue());
    return (
      <React.Fragment>
        <Header title={intl.get(`${viewPrompt}.title`).d('平台目录映射')}>
          <Button type="primary" icon="save" style={{ marginLeft: 8 }} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="primary"
            onClick={this.showMapsCatalogLov}
            disabled={selectedRows.length <= 0}
          >
            <Icons type="main-batch-mapping" style={{ marginRight: '8px' }} />
            {intl.get('scec.ecCategoryPlatformCatalog.button.batchMapping').d('批量映射')}
          </Button>
          {/* <ExcelExport
            requestUrl={`${SRM_SCEC}/v1/category-plat-cata-maps/export`}
            queryParams={filterValues}
            otherButtonProps={{ icon: 'export' }}
          /> */}
          <Button onClick={this.handleImport} style={{ marginLeft: '8px' }}>
            <Icons type="main-batch-import" style={{ marginRight: '8px' }} />
            {intl.get('hzero.common.button.import').d('批量导入')}
          </Button>
          <Lov
            code="SCEC.PLATFORM.CATALOG"
            ref={c => {
              this.platformCatalog = c;
            }}
            style={{ display: 'none' }}
            onChange={this.setMapsPlatfrom}
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table {...tableProps} />
        </Content>
        {modalVisible && (
          <EcProductModal
            modalVisible={modalVisible}
            onHandleCancel={this.closeModal}
            {...modalList}
          />
        )}
      </React.Fragment>
    );
  }
}
