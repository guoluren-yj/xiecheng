/**
 * InventoryOrg -库存组织页面
 * @date: 2018-7-5
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { openTab } from 'utils/menuTab';
import { Content, Header } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { HZERO_PLATFORM } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import notification from 'utils/notification';
import intl from 'utils/intl';
import remote from 'utils/remote';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getEditTableData,
  delItemToPagination,
  addItemToPagination,
  filterNullValueObject,
} from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

export const EditableContext = React.createContext();

@withCustomize({
  unitCode: ['SPFM_ORG-INFO_INVENTORYORG.LIST', 'SPFM_ORG-INFO_INVENTORYORG.SEARCH'],
})
@connect(({ inventoryOrg, loading }) => ({
  inventoryOrg,
  fetchInventoryDataLoading: loading.effects['inventoryOrg/fetchInventoryData'],
  updateLoading:
    loading.effects['inventoryOrg/updateAllInventoryData'] ||
    loading.effects['inventoryOrg/fetchInventoryData'],
}))
@formatterCollections({
  code: 'hpfm.inventoryOrg',
})
@remote({
  code: 'SPFM_ORGINFO_INVENTOTYORG', // 对应二开模块暴露的Expose的编码
  name: 'inventotyOrgRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@Form.create({ fieldNameProp: null })
export default class InventoryOrg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getOrganizationId: getCurrentOrganizationId(),
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.fetchLov();
    this.queryInventory();
  }

  @Bind()
  fetchLov() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inventoryOrg/fetchLov',
    });
  }

  /**
   * 子组件
   * @param {Object} ref
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: (ref.props || {}).form });
  }

  /**
   * 查询库存组织
   * @param {object} params --查询参数
   * @param {?number} params.page --页码
   * @param {?number} params.size --条数
   * @param {?string} params.getOrganizationId --租户ID
   */
  @Bind()
  queryInventory(params = {}) {
    const { dispatch } = this.props;
    const { form, getOrganizationId } = this.state;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'inventoryOrg/fetchInventoryData',
      payload: {
        body: {
          page: isEmpty(params) ? {} : params,
          ...fieldValues,
          customizeUnitCode: 'SPFM_ORG-INFO_INVENTORYORG.LIST,SPFM_ORG-INFO_INVENTORYORG.SEARCH',
        },
        organizationId: getOrganizationId,
      },
    });
  }

  /**
   * 表单为编辑状态
   * @param {?object} record
   * @param {?boolean} flag 编辑/取消编辑
   */
  @Bind()
  handleOrgEdit(record, flag) {
    const {
      dispatch,
      inventoryOrg: {
        fetchInventoryData: { content = {} },
      },
    } = this.props;
    const index = content.findIndex((item) => item.organizationId === record.organizationId);
    const updateFlag = flag ? 'update' : '';
    dispatch({
      type: 'inventoryOrg/editData',
      payload: {
        content: [
          ...content.slice(0, index),
          {
            ...record,
            _status: updateFlag,
          },
          ...content.slice(index + 1),
        ],
      },
    });
  }

  // 新建，添加一列子表单
  @Bind()
  handleCreateOrg() {
    const {
      dispatch,
      commonSourceCode,
      commonExternalSystemCode,
      inventoryOrg: { fetchInventoryData = {}, pagination = {} },
    } = this.props;
    const newContent = fetchInventoryData.content;
    dispatch({
      type: 'inventoryOrg/updateStateReducer',
      payload: {
        fetchInventoryData: {
          content: [
            {
              organizationCode: '',
              organizationName: '',
              ouName: '',
              organizationId: uuidv4(),
              sourceCode: commonSourceCode,
              externalSystemCode: commonExternalSystemCode,
              enabledFlag: 1,
              _status: 'create',
            },
            ...newContent,
          ],
        },
        pagination: addItemToPagination(fetchInventoryData.content.length, pagination),
      },
    });
  }

  @Bind()
  handleCleanLine(record = {}) {
    const {
      dispatch,
      inventoryOrg: {
        fetchInventoryData: { content = [] },
        pagination = {},
      },
    } = this.props;
    const newList = content.filter((item) => item.organizationId !== record.organizationId);
    dispatch({
      type: 'inventoryOrg/updateStateReducer',
      payload: {
        fetchInventoryData: {
          content: [...newList],
        },
        pagination: delItemToPagination(content.length, pagination),
      },
    });
  }

  /**
   * 新建数据/更新数据
   */
  @Bind()
  handleUpdateOrg() {
    const {
      dispatch,
      inventoryOrg: {
        fetchInventoryData: { content = {} },
        pagination = {},
      },
    } = this.props;
    const { getOrganizationId } = this.state;
    const editData = content.filter((item) => item._status);
    const params = getEditTableData(editData, ['organizationId']);
    const paramsList = params.map((item) => {
      const copyList = { ...item };
      copyList.tenantId = getOrganizationId;
      if (copyList.ouName === '') {
        copyList.organizationId = '';
      }
      return copyList;
    });
    if (Array.isArray(paramsList) && paramsList.length === 0) {
      return;
    }
    dispatch({
      type: 'inventoryOrg/updateAllInventoryData',
      payload: {
        organizationId: getOrganizationId,
        body: paramsList,
        customizeUnitCode: 'SPFM_ORG-INFO_INVENTORYORG.LIST',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryInventory(pagination);
      }
    });
  }

  /**
   *导入
   */

  handleImport() {
    openTab({
      key: `/spfm/org-info/inventory-org/comment-import/SPFM.IMOPRT.INV_ORG`,
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
      type: 'inventoryOrg/updateStateReducer',
      payload: {
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  render() {
    const {
      inventoryOrg: { fetchInventoryData = {}, pagination = {}, selectedRowKeys, iddList = [] },
      match,
      fetchInventoryDataLoading,
      updateLoading,
      commonSourceCode,
      customizeTable,
      customizeFilterForm,
      inventotyOrgRemote,
    } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    const { getOrganizationId } = this.state;
    const filterForm = {
      getOrganizationId,
      customizeFilterForm,
      onHandleBindRef: this.handleBindRef,
      onFetchOrg: this.queryInventory,
    };
    const listTable = {
      customizeTable,
      commonSourceCode,
      match,
      iddList,
      pagination,
      rowSelection,
      getOrganizationId,
      fetchInventoryData,
      fetchInventoryDataLoading,
      inventotyOrgRemote,
      onFetchInventory: this.queryInventory,
      onHandleOrgEdit: this.handleOrgEdit,
      onHandleCancelOrg: this.handleCleanLine,
      onHandleUpdateOrg: this.handleUpdateOrg,
    };
    const editList = fetchInventoryData.content.filter((item) => item._status);
    // const values = (this.filterForm.props && this.filterForm.props.form.getFieldsValue()) || {};
    const { form } = this.state;
    const values = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.inventoryOrg.view.inventoryOrg.headerTitle').d('库存组织定义')}
        >
          <ButtonPermission
            type="primary"
            icon="save"
            onClick={this.handleUpdateOrg}
            loading={updateLoading && !isEmpty(editList)}
            disabled={isEmpty(editList)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </ButtonPermission>
          <ButtonPermission
            icon="plus"
            permissionList={[
              {
                code: `${match.path}.button.create`,
                type: 'button',
                meaning: '库存组织-新建',
              },
            ]}
            onClick={this.handleCreateOrg}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
          <ExcelExportPro
            templateCode="HPFM_INV_ORGANIZATION_EXPORT"
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                : intl.get('hzero.common.export.new').d('导出-新')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${getOrganizationId}/invOrganization/export`}
            queryParams={{
              ...values,
              exportInvOrganizationIds: isEmpty(selectedRowKeys)
                ? undefined
                : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.new.invorg.list.export',
                  type: 'button',
                },
              ],
            }}
          />
          <CommonImport
            prefixPatch="/spfm"
            businessObjectTemplateCode="SPFM.IMOPRT.INV_ORG"
            buttonProps={{
              // icon: 'to-top',
              permissionList: [
                {
                  code: `srm.mdm.enterprise.srm-org-info.ps.new.inv-org.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.button.import.new').d('导入-新')}
          />
          <ExcelExport
            buttonText={
              selectedRowKeys?.length
                ? intl.get('hzero.common.button.exports').d('勾选导出')
                : intl.get('hzero.common.export').d('导出')
            }
            requestUrl={`${HZERO_PLATFORM}/v1/${getOrganizationId}/invOrganization/export`}
            queryParams={{
              ...values,
              exportInvOrganizationIds: isEmpty(selectedRowKeys)
                ? undefined
                : selectedRowKeys.join(),
            }}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.mdm.enterprise.srm-org-info.ps.invorg.list.export',
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
                code: `srm.mdm.enterprise.srm-org-info.ps.inv-org.import`,
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
            <FilterForm {...filterForm} />
          </div>
          <ListTable {...listTable} />
        </Content>
      </React.Fragment>
    );
  }
}
