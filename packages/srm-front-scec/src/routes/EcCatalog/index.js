/**
 * EcCatalog -集团目录维护
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { connect } from 'dva';
import queryString from 'querystring';
import { Button, Table, Badge, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import Drawer from './AddDrawer';
import EditDrawer from './EditDrawer';

const modelPrompt = 'scec.ecCatalog.model.ecCatalog';
const viewPrompt = 'scec.ecCatalog.view.ecCatalog';
@formatterCollections({ code: ['scec.ecCatalog', 'scec.ecPlatformCategory', 'scec.common'] })
@connect(({ loading, ecCatalog, ecPlatformCategory }) => ({
  ecCatalog,
  ecPlatformCategory,
  loading: loading.effects['ecCatalog/queryTreeList'],
  saveLoading: loading.effects['ecCatalog/addOrUpdateEcCatalog'],
  enableLoading: loading.effects['ecCatalog/setPermissionSetEnable'],
}))
export default class EcCatalog extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      addMOdalTitle: '',
      visible: false,
      editVisible: false,
      tableRecord: {},
      expandedRowKeys: [],
    };
  }

  componentDidMount() {
    this.fetchEcData();
    this.fetchEnabledStatus();
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
      ecCatalog: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecCatalog/queryTreeList',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    }).then(() => {
      const {
        ecCatalog: { list = {} },
      } = this.props;
      const { catalogCode, catalogName } = params;
      let rowKeys;
      if (!isEmpty(catalogCode) || !isEmpty(catalogName)) {
        rowKeys = list.rowKeys || [];
      }
      this.setState({
        expandedRowKeys: rowKeys || [],
      });
    });
  }

  /**
   * 查询状态值集
   */
  @Bind()
  fetchEnabledStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecPlatformCategory/queryEnabledStatus',
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCatalog/addOrUpdateEcCatalog',
      payload: data,
    }).then(res => {
      if (res) {
        this.fetchEcData();
        this.handleEditCancel();
        this.handleCancel();
      }
    });
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/CATALOG_IMPORT`,
      title: intl.get('hzero.common.button.import').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
    });
  }

  /**
   * 启用禁用目录
   */
  @Bind()
  handleDisable(record) {
    // 禁用操作
    if (record.enabledFlag === 1) {
      // 判断是否为第三级目录
      if (record.catalogLevel === 3) {
        this.isCategoryProduct(record);
        return;
      }
      Modal.confirm({
        title: intl.get('scec.ecCatalog.view.confirm.enabledTitle').d('确认禁用?'),
        content: intl
          .get('scec.ecCatalog.view.confirm.enabledContentNew')
          .d('禁用该目录，所属子目录同时将会被禁用，且该目录下的商品将会被下架，无法选买'),
        onOk: () => {
          this.isCategoryProduct(record);
        },
      });
      return;
    }
    // 启用操作和禁用无商品上架目录方法一样
    this.handleDisableNoProduct(record);
  }

  /**
   * 判断禁用的目录是否有商品上架
   */
  @Bind()
  isCategoryProduct(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCatalog/setPermissionSetEnable',
      payload: {
        ...record,
        everconfirmed: 0,
        enabledFlag: record.enabledFlag ? 0 : 1,
      },
    }).then(res => {
      // 有商品上架的目录
      if (res) {
        if (res.whetherProduct === 1) {
          this.handleDisableProduct(record);
        } else {
          this.fetchEcData();
        }
      }
    });
  }

  /**
   * 启用操作和禁用无商品上架目录
   */
  @Bind()
  handleDisableNoProduct(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCatalog/setPermissionSetEnable',
      payload: {
        ...record,
        everconfirmed: 0,
        enabledFlag: record.enabledFlag ? 0 : 1,
      },
    }).then(res => {
      if (res) {
        this.fetchEcData();
      }
    });
  }

  /**
   * 确认禁用有商品上架的目录
   */
  @Bind()
  handleDisableProduct(record) {
    const { dispatch } = this.props;
    Modal.confirm({
      title: intl.get('scec.ecCatalog.view.confirm.enabledTitle').d('确认禁用?'),
      content: intl
        .get('scec.ecCatalog.view.confirm.unSheleveContent')
        .d('此目录下有上架商品，该操作会导致商品下架'),
      onOk: () => {
        dispatch({
          type: 'ecCatalog/setPermissionSetEnable',
          payload: {
            ...record,
            everconfirmed: 1,
            enabledFlag: record.enabledFlag ? 0 : 1,
          },
        }).then(res => {
          if (res) {
            this.fetchEcData();
          }
        });
      },
    });
  }

  /**
   * 新增顶级目录
   */
  @Bind()
  handleCreateTopCategory() {
    this.setState({
      addMOdalTitle: intl.get('scec.ecCatalog.button.createTopCatalog').d('新增顶级目录'),
      visible: true,
      tableRecord: {},
    });
  }

  /**
   * 新增下级目录
   */
  @Bind()
  handleCreateSubCategory(record) {
    this.setState({
      addMOdalTitle: intl.get('scec.ecCatalog.button.createNextCatalog').d('新增下级目录'),
      visible: true,
      tableRecord: record,
    });
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      editVisible: true,
      tableRecord: record,
    });
  }

  /**
   * 取消编辑
   */
  @Bind()
  handleEditCancel() {
    this.setState({
      editVisible: false,
      tableRecord: {},
    });
  }

  /**
   * 新增取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  render() {
    const {
      ecCatalog: { list = {}, pagination = {} },
      ecPlatformCategory: { enabledStatusList = [] },
      loading,
      saveLoading,
      enableLoading,
    } = this.props;
    const { visible, editVisible, tableRecord, addMOdalTitle, expandedRowKeys = [] } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.catalogCode`).d('目录编码'),
        width: 250,
        dataIndex: 'catalogCode',
      },
      {
        title: intl.get(`${modelPrompt}.catalogName`).d('目录名称'),
        dataIndex: 'catalogName',
      },
      {
        title: intl.get(`${modelPrompt}.orderSeq`).d('排序号'),
        width: 100,
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get(`${modelPrompt}.catalogLevel`).d('目录层级'),
        width: 100,
        dataIndex: 'catalogLevel',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (_, record) => (
          <Badge
            status={record.enabledFlag ? 'success' : 'error'}
            text={
              record.enabledFlag
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        dataIndex: 'edit',
        render: (_, record) => {
          return (
            <span className="action-link">
              {
                <a
                  disabled={record.catalogLevel === 3 || record.enabledFlag === 0}
                  onClick={() => {
                    this.handleCreateSubCategory(record);
                  }}
                >
                  {intl.get('scec.ecPlatformCategory.button.createNextCatalog').d('新增下级目录')}
                </a>
              }
              <a
                onClick={() => {
                  this.handleDisable(record);
                }}
              >
                {record.enabledFlag
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
    ];
    const filterList = {
      enabledStatusList,
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
    };
    const tableProps = {
      columns,
      pagination,
      expandedRowKeys,
      bordered: true,
      uncontrolled: true,
      rowKey: 'catalogId',
      onChange: this.fetchEcData,
      childrenColumnName: 'subMenus',
      dataSource: list.dataSource || [],
      loading: loading || saveLoading || enableLoading,
    };
    const detailProps = {
      visible,
      tableRecord,
      addMOdalTitle,
      anchor: 'right',
      saveLoading,
      onCancel: this.handleCancel,
      onHandleSave: this.handleSaveData,
    };
    const editProps = {
      editVisible,
      tableRecord,
      anchor: 'right',
      saveLoading,
      onCancel: this.handleEditCancel,
      onHandleSave: this.handleSaveData,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${viewPrompt}.title`).d('集团目录维护')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateTopCategory}>
            {intl.get('scec.ecCatalog.button.createTopCatalog').d('新增顶级目录')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Button onClick={this.handleImport}>
              {intl.get('hzero.common.button.import').d('批量导入')}
            </Button>
          </div>
          <Table {...tableProps} />
        </Content>
        <Drawer {...detailProps} />
        <EditDrawer {...editProps} />
      </React.Fragment>
    );
  }
}
