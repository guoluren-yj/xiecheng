/**
 * EcPlatformCategory -平台目录维护
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

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import Drawer from './AddDrawer';
import EditDrawer from './EditDrawer';

const modelPrompt = 'scec.ecPlatformCategory.model';
const viewPrompt = 'scec.ecPlatformCategory.view.ecPlatformCategory';
@formatterCollections({
  code: ['scec.ecPlatformCategory', 'scec.common', 'entity.group', 'scec.ecCatalog'],
})
@connect(({ loading, ecPlatformCategory }) => ({
  ecPlatformCategory,
  loading: loading.effects['ecPlatformCategory/queryTreeList'],
  saveLoading: loading.effects['ecPlatformCategory/addOrUpdateEcPlatformCategory'],
  enableLoading: loading.effects['ecPlatformCategory/setPermissionSetEnable'],
}))
export default class EcPlatformCategory extends Component {
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
      ecPlatformCategory: { pagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecPlatformCategory/queryTreeList',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...filterValues,
      },
    }).then(() => {
      const {
        ecPlatformCategory: { list = {} },
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
      type: 'ecPlatformCategory/addOrUpdateEcPlatformCategory',
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
   * 启用禁用目录
   */
  @Bind()
  handleDisable(record) {
    // 判断是否为第三级目录
    if (record.catalogLevel === 3 || record.enabledFlag === 0) {
      this.setPermissionSetEnable(record);
      return;
    }
    Modal.confirm({
      title: intl.get('scec.ecPlatformCategory.view.confirm.enabledTitle').d('确认禁用目录?'),
      content: intl
        .get('scec.ecPlatformCategory.view.confirm.enabledContent')
        .d('禁用该目录，所属子目录同时将会被禁用'),
      onOk: () => {
        this.setPermissionSetEnable(record);
      },
    });
  }

  /**
   * 启用禁用接口
   */
  @Bind()
  setPermissionSetEnable(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecPlatformCategory/setPermissionSetEnable',
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
   * 新增顶级目录
   */
  @Bind()
  handleCreateTopCategory() {
    this.setState({
      addMOdalTitle: intl.get('scec.ecPlatformCategory.button.createTopCatalog').d('新增顶级目录'),
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
      addMOdalTitle: intl.get('scec.ecPlatformCategory.button.createNextCatalog').d('新增下级目录'),
      visible: true,
      tableRecord: record,
    });
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/CATALOG_PLAT_IMPORT`,
      title: intl.get('hzero.common.button.import').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
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
      loading,
      saveLoading,
      enableLoading,
      ecPlatformCategory: { list = {}, pagination = {}, enabledStatusList = [] },
    } = this.props;
    const { visible, editVisible, tableRecord, addMOdalTitle, expandedRowKeys = [] } = this.state;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.catalogCode`).d('目录编码'),
        width: 200,
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
        <Header title={intl.get(`${viewPrompt}.title`).d('平台目录维护')}>
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
