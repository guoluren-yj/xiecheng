import React, { PureComponent } from 'react';
import { Button, Form, Input } from 'hzero-ui';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import { Button as ButtonPermission } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab } from 'utils/menuTab';
import querystring from 'querystring';
import { HZERO_PLATFORM } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { CODE } from 'utils/regExp';

import FilterForm from './FilterForm';
import AgentModal from './AgentModal';

const FormItem = Form.Item;
@withCustomize({
  unitCode: [
    'SPFM_ORG-INFO_PURCHASE_ORG.LIST',
    'SPFM_ORG-INFO_PURCHASE_ORG.SEARCH',
    'SPFM_ORG-INFO_PURCHASE_ORG.PURCHASEAGENT',
  ],
})
@connect(({ loading, purchaseOrg, assignAgent }) => ({
  purchaseOrg,
  assignAgent,
  saveOrgLoading:
    loading.effects['purchaseOrg/savePurchaseOrg'] ||
    loading.effects['purchaseOrg/fetchPurchaseOrgList'],
  fetchAgentLoading: loading.effects['assignAgent/fetchPurAgent'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hpfm.purchaseOrg', 'hzero.common', 'hpfm.purchaseAgent'] })
export default class PurchaseOrg extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      orgId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.fetchDataList();
  }

  /**
   * 获取采购组织列表数据
   * @param {object} params - 请求参数
   */
  fetchDataList(params = {}) {
    const {
      dispatch,
      purchaseOrg: { pagination = {} },
    } = this.props;
    const { orgId: organizationId, formValues } = this.state;
    dispatch({
      type: 'purchaseOrg/fetchPurchaseOrgList',
      payload: {
        page: pagination,
        ...formValues,
        organizationId,
        ...params,
        customizeUnitCode: 'SPFM_ORG-INFO_PURCHASE_ORG.LIST,SPFM_ORG-INFO_PURCHASE_ORG.SEARCH',
      },
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchDataList({ page: pagination });
  }

  /**
   * handleSearchOrg - 搜索采购组织
   * @param {object} fieldsValue - 搜索条件
   * @param {string} fieldsValue.organizationCode - 组织编码
   * @param {string} fieldsValue.organizationName - 组织名称
   */
  @Bind()
  handleSearchOrg(fieldsValue) {
    this.setState(
      {
        formValues: fieldsValue,
      },
      () => {
        this.fetchDataList({ page: {} });
      }
    );
  }

  /**
   * handleResetSearch - 重置搜索表单和搜索条件缓存
   * @param {object} form - 表单对象
   */
  @Bind()
  handleResetSearch(form) {
    form.resetFields();
    this.setState({
      formValues: {},
    });
  }

  /**
   * handleOrgEdit - 设置行数据的编辑状态
   * @param {object} record - 行数据
   * @param {boolean} flag - 编辑标识
   */
  @Bind()
  handleOrgEdit(record, flag) {
    const {
      purchaseOrg: { purchaseOrgList = [] },
      dispatch,
    } = this.props;
    const newList = purchaseOrgList.map((item) => {
      if (record.purchaseOrgId === item.purchaseOrgId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'purchaseOrg/updateState',
      payload: { purchaseOrgList: newList },
    });
  }

  /**
   * handleRemoveOrg - 删除未保存的行，分页减少1
   * @param {object} record - 行数据
   */
  @Bind()
  handleRemoveOrg(record) {
    const {
      dispatch,
      purchaseOrg: { purchaseOrgList = [], pagination },
    } = this.props;
    const newList = purchaseOrgList.filter((item) => item.purchaseOrgId !== record.purchaseOrgId);
    dispatch({
      type: 'purchaseOrg/updateState',
      payload: {
        purchaseOrgList: newList,
        pagination: delItemToPagination(purchaseOrgList.length, pagination),
      },
    });
  }

  /**
   * 批量保存采购组织数据
   */
  @Bind()
  handleSaveOrg() {
    const {
      dispatch,
      purchaseOrg: { purchaseOrgList = [] },
    } = this.props;
    const params = getEditTableData(purchaseOrgList, ['purchaseOrgId']);
    if (Array.isArray(params) && params.length > 0) {
      dispatch({
        type: 'purchaseOrg/savePurchaseOrg',
        payload: {
          organizationId: this.state.orgId,
          purchaseOrgList: params,
          query: { customizeUnitCode: 'SPFM_ORG-INFO_PURCHASE_ORG.LIST' },
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchDataList();
        }
      });
    }
  }

  @Bind()
  showAgentModal(flag) {
    this.setState({ agentModalVisible: flag });
  }

  @Bind()
  handleCancelAgent() {
    this.showAgentModal(false);
  }

  @Bind()
  handleSelectAgent(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'assignAgent/updateState',
      payload: {
        purOrgPagination: {},
        purAgentList: [],
      },
    });
    this.showAgentModal(true);
    this.fetchAgentList({ purchaseOrgId: record.purchaseOrgId });
    this.setState({ selectAgeRecord: record });
  }

  @Bind()
  fetchAgentList(params = {}) {
    const { dispatch } = this.props;
    const { selectAgeRecord = {} } = this.state;
    const { purchaseOrgId } = selectAgeRecord;
    dispatch({
      type: 'assignAgent/fetchPurAgent',
      payload: {
        purchaseOrgId,
        ...params,
        customizeUnitCode: 'SPFM_ORG-INFO_PURCHASE_ORG.PURCHASEAGENT',
      },
    });
  }

  @Bind()
  @Debounce(100)
  handleSaveAgent() {
    const { dispatch, assignAgent = {} } = this.props;
    const { purAgentList = [] } = assignAgent;
    const params = getEditTableData(purAgentList, ['orgAgentId']);
    if (Array.isArray(params) && params.length > 0) {
      dispatch({
        type: 'assignAgent/addPurAgent',
        payload: {
          query: { customizeUnitCode: 'SPFM_ORG-INFO_PURCHASE_ORG.PURCHASEAGENT' },
          body: params,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchAgentList();
        }
      });
    }
  }

  @Bind()
  handleDeleteAgent(data = [], keys = []) {
    const {
      dispatch,
      assignAgent: { purAgentList = [] },
    } = this.props;
    const filterData = data.filter((item) => item._status !== 'create');
    // 删除未保存的数据
    const createList = data.filter((item) => item._status === 'create');
    if (createList.length > 0) {
      const deleteList = purAgentList.filter((item) => {
        return !keys.includes(item.purchaseAgentId);
      });
      dispatch({
        type: 'assignAgent/updateState',
        payload: { purAgentList: deleteList },
      });
      notification.success();
    }
    if (filterData.length > 0) {
      dispatch({
        type: 'assignAgent/deletePurAgent',
        payload: filterData,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchAgentList();
        }
      });
    }
  }

  /**
   * 新建采购组织
   */
  @Bind()
  handleCreateOrg() {
    const {
      dispatch,
      commonSourceCode,
      commonExternalSystemCode,
      purchaseOrg: { purchaseOrgList = [], pagination },
    } = this.props;
    dispatch({
      type: 'purchaseOrg/updateState',
      payload: {
        purchaseOrgList: [
          {
            _status: 'create',
            enabledFlag: 1,
            organizationCode: '',
            organizationName: '',
            purchaseOrgId: uuid(),
            sourceCode: commonSourceCode,
            externalSystemCode: commonExternalSystemCode,
          },
          ...purchaseOrgList,
        ],
        pagination: addItemToPagination(purchaseOrgList.length, pagination),
      },
    });
  }

  @Bind()
  handleCreateAgent(data) {
    const {
      dispatch,
      assignAgent: { purAgentList = [], purOrgPagination = {} },
    } = this.props;
    dispatch({
      type: 'assignAgent/updateState',
      payload: {
        purAgentList: [data, ...purAgentList],
        purOrgPagination: addItemToPagination(purAgentList.length, purOrgPagination),
      },
    });
  }

  /**
   *导入
   */

  handleImport() {
    openTab({
      key: `/spfm/org-info/purchase-org/comment-import/SPFM.PURCHASEORG_IMPORT`,
      title: 'hzero.common.button.import',
      search: querystring.stringify({
        action: 'hzero.common.button.import',
      }),
    });
  }

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrg/updateState',
      payload: {
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      saveOrgLoading,
      fetchPurchaseOrgLoading,
      commonSourceCode,
      deleteAgentLoading = false,
      saveAgentLoading = false,
      fetchAgentLoading = false,
      purchaseOrg: { purchaseOrgList = [], pagination, selectedRowKeys },
      assignAgent: { purAgentList = [], purOrgPagination },
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { agentModalVisible = false, selectAgeRecord = {}, orgId, formValues } = this.state;

    const agentProps = {
      customizeTable,
      purOrgPagination,
      selectAgeRecord,
      modalVisible: agentModalVisible,
      saveLoading: saveAgentLoading || deleteAgentLoading,
      initLoading: fetchAgentLoading,
      dataSource: purAgentList,
      onCreate: this.handleCreateAgent,
      onDelete: this.handleDeleteAgent,
      onOk: this.handleSaveAgent,
      onCancel: this.handleCancelAgent,
      onChange: this.fetchAgentList,
    };

    const save = purchaseOrgList.filter((item) => {
      return item._status === 'create' || item._status === 'update';
    });
    const columns = [
      {
        title: intl.get('hpfm.purchaseOrg.model.org.organizationCode').d('采购组织编码'),
        width: 150,
        dataIndex: 'organizationCode',
        render: (val, record) => {
          if (record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('organizationCode', {
                  initialValue: record.organizationCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.purchaseOrg.model.org.organizationCode')
                          .d('采购组织编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      pattern: CODE,
                      message: intl
                        .get('hzero.common.validation.code')
                        .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                    },
                  ],
                })(
                  <Input disabled={record.sourceCode !== commonSourceCode} inputChinese={false} />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseOrg.model.org.organizationName').d('采购组织名称'),
        dataIndex: 'organizationName',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('organizationName', {
                  initialValue: record.organizationName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('hpfm.purchaseOrg.model.org.organizationName')
                          .d('采购组织名称'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input disabled={record.sourceCode !== commonSourceCode} />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hpfm.purchaseOrg.model.org.sourceCode').d('数据来源'),
        align: 'center',
        width: 100,
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('hpfm.purchaseOrg.model.org.externalSystemCode').d('来源系统'),
        align: 'center',
        width: 100,
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        width: 80,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'action',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update') {
            return (
              <span className="action-link">
                <a onClick={() => this.handleOrgEdit(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              </span>
            );
          } else if (record._status === 'create') {
            return (
              <span className="action-link">
                <a onClick={() => this.handleRemoveOrg(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              </span>
            );
          } else {
            return (
              <span className="action-link">
                <a onClick={() => this.handleSelectAgent(record)}>
                  {intl.get('hpfm.purchaseOrg.model.org.purchaseAgent').d('指定采购员')}
                </a>
                <a onClick={() => this.handleOrgEdit(record, true)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </span>
            );
          }
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.purchaseOrg.view.message.title').d('采购组织')}>
          <Button
            type="primary"
            icon="save"
            disabled={isEmpty(save)}
            loading={saveOrgLoading && !isEmpty(save)}
            onClick={this.handleSaveOrg}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <ButtonPermission
            icon="plus"
            onClick={this.handleCreateOrg}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.button.ps.purchaseorg.create`,
                type: 'button',
                meaning: '新建',
              },
            ]}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
          <ExcelExportPro
            templateCode="HPFM_ORGANIZATION_EXPORT"
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                : intl.get('hzero.common.export.new').d('导出-新')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${orgId}/purchases-organizations/export`}
            queryParams={{
              ...formValues,
              exportPurchaseOrgIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.new.purchaseorg.list.export',
                  type: 'button',
                },
              ],
            }}
          />
          <CommonImport
            prefixPatch="/hpfm"
            buttonProps={{
              // icon: 'to-top',
              permissionList: [
                {
                  code: `srm.mdm.enterprise.srm-org-info.ps.new.purchase-org.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
            businessObjectTemplateCode="SPFM.PURCHASEORG_IMPORT"
            buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
          />
          <ExcelExport
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.exports').d('勾选导出')
                : intl.get('hzero.common.export').d('导出')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${orgId}/purchases-organizations/export`}
            queryParams={{
              ...formValues,
              exportPurchaseOrgIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.purchaseorg.list.export',
                  type: 'button',
                },
              ],
            }}
          />
          <ButtonPermission
            icon="archive"
            type="c7n-pro"
            onClick={this.handleImport}
            permissionList={[
              {
                code: `srm.mdm.enterprise.srm-org-info.ps.purchase-org.import`,
                type: 'button',
                meaning: '导入',
              },
            ]}
          >
            {intl.get('hzero.common.button.import').d('导入')}
          </ButtonPermission>
        </Header>
        <Content noCard>
          <div className="table-list-search">
            <FilterForm
              onSearch={this.handleSearchOrg}
              onReset={this.handleResetSearch}
              customizeFilterForm={customizeFilterForm}
            />
          </div>
          {customizeTable(
            {
              code: 'SPFM_ORG-INFO_PURCHASE_ORG.LIST',
            },
            <EditTable
              bordered
              loading={fetchPurchaseOrgLoading}
              rowKey="purchaseOrgId"
              columns={columns}
              dataSource={purchaseOrgList}
              pagination={pagination}
              rowSelection={rowSelection}
              onChange={this.handlePagination}
            />
          )}
        </Content>
        <AgentModal {...agentProps} />
      </React.Fragment>
    );
  }
}
