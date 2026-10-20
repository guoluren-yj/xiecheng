/**
 * index.js - 值集定义
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Tag, Badge, Popconfirm, Table, Tooltip, Button, Dropdown, Menu, Spin } from 'hzero-ui';
import { Button as C7NButton, Modal } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isString, isObject, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';

import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';
import { openTab } from 'utils/menuTab';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  tableScrollWidth,
} from 'utils/utils';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { VERSION_IS_OP, HZERO_PLATFORM } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { exportLov } from '@/services/valueListService';
import CreateForm from './ListForm';

import SearchForm from './SearchForm';
import CopyValue from './CopyValue';
import ImportModal from './ImportModal';
import styles from './styles.less';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

@connect(({ valueList, loading }) => ({
  valueList,
  list: valueList.list,
  loading: loading.effects['valueList/queryLovHeadersList'],
  saving: loading.effects['valueList/saveLovHeaders'],
  copyLoading: loading.effects['valueList/copyLov'],
  deleteLoading: loading.effects['valueList/deleteLovHeaders'],
  tenantId: getCurrentOrganizationId(),
  isSiteFlag: !isTenantRoleLevel(),
}))
@formatterCollections({
  code: ['hpfm.valueList', 'hpfm.common', 'srm.common'],
})
export default class ValueList extends React.Component {
  createForm;

  // 侧边栏内部引用
  constructor(props) {
    super(props);
    this.pageConfig = this.pageConfig();
    this.filterForm = {};
    this.state = {
      selectedRows: [],
      copyValueVisible: false,
      copyValueData: {}, // 复制选择的值集
    };
    this.customConstructor(props); // 初始化自定义数据
  }

  componentDidMount() {
    const {
      pageConfig: { modelName },
    } = this;

    const {
      [modelName]: searchPageData = {},
      location: { state: { _back } = {} },
    } = this.props;
    const { pagination } = searchPageData;
    this.handleSearch(isUndefined(_back) ? {} : pagination);
  }

  /**
   * 列表查询
   * @param {Object} pagination 查询参数
   */
  @Bind()
  handleSearch(pagination = {}) {
    const {
      pageConfig: {
        searchDispatch,
        searchCallback = (e) => e,
        paramsFilter = (e) => e,
        otherParams = {},
      } = {},
    } = this;
    const { dispatch = (e) => e } = this.props;
    const form = this.filterForm.props && this.filterForm.props.form;
    const params = isUndefined(form) ? {} : form.getFieldsValue();
    const filterValues = filterNullValueObject({
      ...params,
      ...paramsFilter(params),
    });
    dispatch({
      type: searchDispatch,
      payload: {
        ...otherParams,
        page: pagination,
        ...filterValues,
      },
    }).then((res) => {
      searchCallback(res);
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 自定义初始化数据
   */
  // eslint-disable-next-line
  customConstructor(props) {
    return {};
  }

  /**
   * Conent 属性, 子类覆盖
   */
  contentProps() {
    return null;
  }

  @Bind()
  handleLovCopy(record) {
    const { dispatch, valueList: { pagination = {} } = {}, isSiteFlag, tenantId } = this.props;
    if (isSiteFlag) {
      this.setState({ copyValueVisible: true, copyValueData: record });
      return;
    }
    this.setState({ currentCopyRecordId: record.lovId });
    dispatch({
      type: 'valueList/copyLov',
      payload: { lovCode: record.lovCode, lovId: record.lovId, tenantId },
    })
      .then((res) => {
        if (res) {
          notification.success();
          this.handleSearch(pagination);
        }
      })
      .finally(() => {
        this.setState({ currentCopyRecordId: undefined });
      });
  }

  @Bind()
  handleCopyValue(data) {
    const { dispatch, valueList: { pagination = {} } = {} } = this.props;
    const {
      copyValueData: { lovCode, lovId },
    } = this.state;
    dispatch({
      type: 'valueList/copyLov',
      payload: { ...data, lovCode, lovId },
    }).then((res) => {
      if (res) {
        this.setState({ copyValueVisible: false, copyValueData: {} });
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  hideCopyValue() {
    this.setState({ copyValueVisible: false });
  }

  render() {
    const { selectedRows = [], copyValueVisible = false } = this.state;
    const {
      copyLoading = false,
      valueList: { lovType = [], list = {}, labelType = [], pagination = {} } = {},
    } = this.props; // 根据 modelName 获取 Model 数据
    const customTableProps = this.tableProps();
    const columns = [];
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.lovId),
      onChange: this.handleRowSelectChange,
    };
    const filterProps = {
      lovType,
      labelType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      bordered: true,
      rowKey: 'lovId',
      dataSource: list.content,
      pagination,
      rowSelection,
      columns,
      onChange: this.handleSearch,
      ...customTableProps,
    };

    const copyValueProps = {
      visible: copyValueVisible,
      loading: copyLoading,
      onOk: this.handleCopyValue,
      onCancel: this.hideCopyValue,
    };

    return (
      <React.Fragment>
        {this.renderHeader()}
        <Content {...this.contentProps()}>
          <div className="table-list-search">
            <SearchForm {...filterProps} />
          </div>
          <Table {...tableProps} />
          {copyValueVisible && <CopyValue {...copyValueProps} />}
        </Content>
        {this.renderOther()}
      </React.Fragment>
    );
  }

  @Bind()
  pageConfig() {
    const { tenantId } = this.props;
    return {
      modelName: 'valueList',
      customSearch: true,
      cacheKey: '/hpfm/value-list/list',
      searchDispatch: 'valueList/queryLovHeadersList',
      searchCallback: this.searchCallback,
      otherParams: { tenantId: isTenantRoleLevel() ? tenantId : '' },
    };
  }

  /**
   * 显示侧边栏
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏侧边栏
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 侧边栏显示控制函数
   * @param {Boolean} flag - 显示隐藏参数
   */
  handleModalVisible(flag) {
    if (flag === false && this.createForm) {
      this.createForm.resetForm();
    }
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 搜索回调
   */
  @Bind()
  searchCallback() {
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 新建值集
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { history, dispatch, tenantId } = this.props;
    const { parentTenantId } = this.state;
    // TODO: 校验表单
    dispatch({
      type: 'valueList/saveLovHeaders',
      payload: {
        tenantId,
        ...fieldsValue,
        enabledFlag: 1,
        mustPageFlag: 1,
        parentTenantId,
      },
    }).then((response) => {
      if (response) {
        this.hideModal();
        notification.success();
        history.push(`/hpfm/value-list/detail/${response.lovId}`);
      }
    });
  }

  /**
   * 删除值集
   */
  @Bind()
  handleDelete(record) {
    const {
      dispatch,
      valueList: { pagination },
    } = this.props;
    this.setState({ currentDeleteRecordId: record.lovId });
    dispatch({
      type: 'valueList/deleteLovHeaders',
      payload: {
        ...record,
      },
    })
      .then((response) => {
        if (response) {
          notification.success();
          this.handleSearch(pagination);
        }
      })
      .finally(() => {
        this.setState({ currentDeleteRecordId: undefined });
      });
  }

  @Bind()
  handleParentLovChange(record) {
    this.setState({
      parentTenantId: record.tenantId,
    });
  }

  /**
   * 导入返回消息
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hpfm/value-list/import-data/HPFM.LOV`,
      title: 'hzero.common.button.import',
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        prefixPatch: HZERO_PLATFORM,
      }),
    });
  }

  @Bind()
  handleImportModal() {
    Modal.open({
      title: intl.get('hzero.common.button.import').d('导入'),
      drawer: true,
      closable: true,
      className: styles['import-modal'],
      children: <ImportModal />,
      footer: null,
    });
  }

  /**
   * 导入返回消息
   */
  @Bind()
  handleValueImport() {
    openTab({
      key: `/hpfm/value-list/import-data/HPFM.LOV_VALUE`,
      title: 'hzero.common.button.import',
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        prefixPatch: HZERO_PLATFORM,
      }),
    });
  }

  /**
   * 设置单元格属性
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  getExportQueryParams() {
    const { selectedRows } = this.state;
    const form = this.filterForm && this.filterForm.props && this.filterForm.props.form;
    const params = isUndefined(form) ? {} : form.getFieldsValue();
    const filterValues = filterNullValueObject(params);
    const queryParams = {
      ...filterValues,
    };
    if (selectedRows && selectedRows.length) {
      queryParams.exportIds = selectedRows.map((i) => i.lovId);
    }
    return queryParams;
  }

  handleExportToJson = async () => {
    const { selectedRows = [] } = this.state;
    const params = {
      tenantId: getCurrentOrganizationId(),
    };
    let data = null;
    if (selectedRows && selectedRows.length) {
      data = selectedRows.map((row) => row.lovId);
    }
    const exprotResult = await exportLov(params, data);
    if (exprotResult && isString(exprotResult)) {
      if (isJSON(exprotResult)) {
        const { failed, message } = JSON.parse(exprotResult);
        if (failed) {
          notification.error({ description: message });
        }
      } else {
        await downloadFileByAxios({
          requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
          queryParams: [
            { name: 'url', value: encodeURIComponent(exprotResult) },
            { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
          ],
          method: 'GET',
        });
      }
    } else {
      notification.error({});
    }
  };

  renderOther() {
    const {
      saving,
      valueList: { lovType, lovTypeFilter, labelType, requestMethods = [] },
    } = this.props;
    return (
      <CreateForm
        title={intl.get('hpfm.valueList.view.title.create').d('新增值集')}
        onRef={(ref) => {
          this.createForm = ref;
        }}
        requestMethods={requestMethods}
        handleAdd={this.handleAdd}
        confirmLoading={saving}
        modalVisible={this.state.modalVisible}
        hideModal={this.hideModal}
        width={520}
        lovType={isTenantRoleLevel() && !VERSION_IS_OP ? lovTypeFilter : lovType}
        onParentLovChange={this.handleParentLovChange}
        labelType={labelType}
      />
    );
  }

  renderHeader() {
    const { selectedRows = [] } = this.state;
    const { match, isSiteFlag, tenantId } = this.props;
    return (
      <Header title={intl.get('hpfm.valueList.view.message.title.valueList').d('值集配置')}>
        <ButtonPermission
          icon="plus"
          type="primary"
          permissionList={[
            {
              code: `${match.path}.button.create`,
              type: 'button',
              meaning: '值集定义-新建',
            },
          ]}
          onClick={this.showModal}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </ButtonPermission>
        {!isSiteFlag && (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="excel">
                  <Button
                    style={{ border: 'none', color: '#1d2129', backgroundColor: 'transparent' }}
                    onClick={this.handleImport}
                  >
                    {intl.get('hzero.common.button.import.excel').d('导入Excel文件')}
                  </Button>
                </Menu.Item>
                <Menu.Item key="json">
                  <Button
                    style={{ border: 'none', color: '#1d2129', backgroundColor: 'transparent' }}
                    onClick={this.handleImportModal}
                  >
                    {intl.get('hzero.common.button.import.json').d('导入JSON文件')}
                  </Button>
                </Menu.Item>
              </Menu>
            }
          >
            <ButtonPermission
              funcType="flat"
              permissionList={[
                {
                  code: `${match.path}.button.import`,
                  type: 'button',
                  meaning: '值集视图-值集头导入',
                },
              ]}
              icon="unarchive"
              type="c7n-pro"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {intl.get('hzero.common.button.import').d('导入')}
                <Icon type="expand_more" style={{ marginLeft: '4px' }} />
              </span>
            </ButtonPermission>
          </Dropdown>
        )}
        {!isSiteFlag && (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="excel">
                  <ExcelExportPro
                    buttonText={
                      selectedRows && selectedRows.length
                        ? intl.get('srm.common.exportSelected.toEXCEL').d('导出勾选EXCEL文件')
                        : intl.get('srm.common.exportAll.toEXCEL').d('导出全量EXCEL文件')
                    }
                    exportAsync
                    formData={{
                      async: 'true',
                    }}
                    otherButtonProps={{
                      icon: undefined,
                      style: { border: 'none' },
                    }}
                    requestUrl={`${HZERO_PLATFORM}/v1/${tenantId}/lov/lov-export`}
                    queryParams={() => {
                      return this.getExportQueryParams();
                    }}
                    defaultSelectAll
                  />
                </Menu.Item>
                <Menu.Item key="json">
                  <Button
                    style={{ border: 'none', color: '#1d2129', backgroundColor: 'transparent' }}
                    onClick={this.handleExportToJson}
                  >
                    {selectedRows && selectedRows.length
                      ? intl.get('srm.common.exportSelected.toJSON').d('导出勾选JSON文件')
                      : intl.get('srm.common.exportAll.toJSON').d('导出全量JSON文件')}
                  </Button>
                </Menu.Item>
              </Menu>
            }
          >
            <C7NButton funcType="flat" icon="archive">
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {intl.get('hzero.common.button.export').d('导出')}
                <Icon type="expand_more" style={{ marginLeft: '4px' }} />
              </span>
            </C7NButton>
          </Dropdown>
        )}
      </Header>
    );
  }

  tableProps() {
    const {
      history,
      loading,
      tenantId,
      isSiteFlag,
      match,
      copyLoading,
      deleteLoading,
    } = this.props;
    const { currentCopyRecordId, currentDeleteRecordId } = this.state;
    const columns = [
      !isTenantRoleLevel() && {
        title: intl.get('hpfm.valueList.model.header.tenantName').d('所属租户'),
        width: 200,
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovCode').d('值集编码'),
        width: 200,
        dataIndex: 'lovCode',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovName').d('值集名称'),
        width: 200,
        dataIndex: 'lovName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型'),
        width: 100,
        dataIndex: 'lovTypeMeaning',
      },
      {
        title: intl.get('hpfm.valueList.model.header.routeName').d('目标路由名'),
        width: 120,
        dataIndex: 'routeName',
      },
      {
        title: intl.get('hpfm.valueList.model.header.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hpfm.valueList.model.header.labelCode').d('值集使用方'),
        dataIndex: 'labelCodeMeaning',
        width: 120,
      },
      {
        title: intl.get('hpfm.valueList.model.header.publicFlag').d('是否公开'),
        width: 100,
        dataIndex: 'publicFlag',
        render: (val, record) => {
          return record.lovTypeCode === 'IDP' ? (
            <Badge status="success" text={intl.get('hzero.common.status.yes').d('是')} />
          ) : (
            yesOrNoRender(val)
          );
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      isTenantRoleLevel() && {
        title: intl.get('hzero.common.source').d('来源'),
        width: 150,
        render: (_, record) => {
          return tenantId === record.tenantId ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 180,
        fixed: 'right',
        render: (_, record) => {
          const disabledCopy =
            !isSiteFlag && (record.limitCustomFlag === 1 || record.lovTypeCode === 'SQL');
          const operators = [
            <span>
              <ButtonPermission
                type="text"
                permissionList={[
                  {
                    code: `${match.path}.button.edit`,
                    type: 'button',
                    meaning: '值集定义-编辑',
                  },
                ]}
                onClick={() => {
                  history.push(`/hpfm/value-list/detail/${record.lovId}`);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </ButtonPermission>
            </span>,
            isSiteFlag
              ? record.tenantId === tenantId && (
                  // eslint-disable-next-line react/jsx-indent
                  <Tooltip
                    title={
                      disabledCopy
                        ? intl
                            .get('hpfm.valueList.view.tooltip.standardLov')
                            .d('不允许复制SQL类型值集或标准预定义值集')
                        : undefined
                    }
                  >
                    <span>
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${match.path}.button.copy`,
                            type: 'button',
                            meaning: '值集定义-复制',
                          },
                        ]}
                        onClick={() => this.handleLovCopy(record)}
                      >
                        {intl.get('hzero.common.button.copy').d('复制')}
                      </ButtonPermission>
                    </span>
                  </Tooltip>
                )
              : record.tenantId !== tenantId && (
                  // eslint-disable-next-line react/jsx-indent
                  <Tooltip
                    title={
                      disabledCopy
                        ? intl
                            .get('hpfm.valueList.view.tooltip.standardLov')
                            .d('不允许复制SQL类型值集或标准预定义值集')
                        : undefined
                    }
                  >
                    <span>
                      {copyLoading && currentCopyRecordId === record.lovId ? (
                        <a>
                          <Spin size="small" style={{ verticalAlign: 'bottom' }} />
                          {intl.get('hzero.common.button.copy').d('复制')}
                        </a>
                      ) : (
                        <ButtonPermission
                          type="text"
                          permissionList={[
                            {
                              code: `${match.path}.button.copy`,
                              type: 'button',
                              meaning: '值集定义-复制',
                            },
                          ]}
                          disabled={disabledCopy}
                          onClick={() => this.handleLovCopy(record)}
                        >
                          {intl.get('hzero.common.button.copy').d('复制')}
                        </ButtonPermission>
                      )}
                    </span>
                  </Tooltip>
                ),
            isSiteFlag ||
              (!isSiteFlag && record.tenantId === tenantId && (
                <span>
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                    onConfirm={() => this.handleDelete(record)}
                  >
                    {deleteLoading && currentDeleteRecordId === record.lovId ? (
                      <a>
                        <Spin size="small" style={{ verticalAlign: 'bottom' }} />
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </a>
                    ) : (
                      <ButtonPermission
                        type="text"
                        permissionList={[
                          {
                            code: `${match.path}.button.delete`,
                            type: 'button',
                            meaning: '值集定义-删除',
                          },
                        ]}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </ButtonPermission>
                    )}
                  </Popconfirm>
                </span>
              )),
          ];
          return <div className={styles.actions}>{operators}</div>;
        },
      },
    ].filter(Boolean);
    return {
      rowKey: 'lovId',
      columns,
      // rowSelection: null,
      loading,
      scroll: { x: tableScrollWidth(columns) },
    };
  }
}
