import React, { PureComponent } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';
import { isEmpty, isUndefined } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import uuidv4 from 'uuid/v4';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getUserOrganizationId,
} from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import OperationRecordModal from './OperationRecordModal';
import OccupancyModal from './OccupancyModal';

import List from './List';
import FilterForm from './Search';

const messagePrompt = 'sinv.common.view.message';

@withCustomize({
  unitCode: ['SINV.MY_INVENTORY_LINE.LIST', 'SINV.MY_INVENTORY_LINE.SEARCH'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, myInventory }) => ({
  loadingList: loading.effects['myInventory/queryMyInventoryList'],
  loadingSave: loading.effects['myInventory/saveInventory'],
  loadingDelete: loading.effects['myInventory/deleteInventory'],
  loadingOperation: loading.effects['myInventory/fetchOperationList'],
  loadingOccupancy: loading.effects['myInventory/fetchOccupancyList'],
  myInventory,
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'hzero.common',
    'sinv.common',
    'entity.item',
    'entity.roles',
    'entity.business',
    'sinv.acceptanceSheetCreate',
    'sinv.deliveryCreation',
  ],
})
@remote(
  {
    code: 'SINV.MY_INVENTORY.LIST',
    name: 'remotes',
  },
  {
    events: {
      cuxHandleClick() {},
    },
  }
)
export default class MyInventory extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      cuxEditor: false,
      operationList: [],
      operationPagination: {},
      occupancyList: [],
      occupancyPagination: {},
      selectedRowKeys: [],
      selectedRows: [],
      currentRecord: {},
      currentRecords: {},
      formValue: undefined,
      modalVisible: false,
      occupancyModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearchInventory();
    this.remotesChange();
  }

  /**
   * 埋点方法
   * 内置埋点逻辑
   */
  @Bind()
  async remotesChange() {
    const { remotes } = this.props;
    if (remotes?.event) {
      const res = await remotes.event.fireEvent('cuxHandleClick');
      if (res) {
        this.setState({ cuxEditor: res });
      }
    }
  }

  /**
   * 维护列表查询
   * @param {Object} page - 查询参数
   */
  @Bind()
  handleSearchInventory(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({ formValue: filterValues });
    dispatch({
      type: 'myInventory/updateState',
      payload: {
        myInventoryData: [],
      },
    });
    dispatch({
      type: 'myInventory/queryMyInventoryList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...filterValues,
        customizeUnitCode: 'SINV.MY_INVENTORY_LINE.SEARCH,SINV.MY_INVENTORY_LINE.LIST',
      },
    });
  }

  /**
   * 新建列表
   */
  @Bind()
  handleCreateInventory() {
    const {
      myInventory: { myInventoryData },
      dispatch,
    } = this.props;
    dispatch({
      type: 'myInventory/queryIdpValue',
      payload: {
        tenantId: getCurrentOrganizationId(),
        supplierTenantId: getUserOrganizationId(),
      },
    }).then((res) => {
      if (Array.isArray(res) && res.length) {
        const newPayload = {
          // companyName: getCurrentUser().groupName,
          itemStorageId: uuidv4(),
          tenantId: getCurrentOrganizationId(),
          itemId: undefined,
          itemCode: undefined,
          itemName: undefined,
          lastUpdateDate: undefined,
          undeliveredQuantity: undefined,
          supplierTenantId: getUserOrganizationId(),
          supplierId: res[0] && res[0].supplierId,
          supplierCompanyId: res[0] && res[0].supplierCompanyId,
          supplierCompanyName: res[0] && res[0].supplierName,
          supplierCompanyNum: res[0] && res[0].supplierNum,
          _status: 'create',
        };
        dispatch({
          type: 'myInventory/updateState',
          payload: {
            myInventoryData: [newPayload, ...myInventoryData],
          },
        });
      }
    });
  }

  /**
   * 保存列表
   */
  @Bind()
  handleSaveInventory() {
    const {
      dispatch,
      form,
      myInventory: { myInventoryData },
    } = this.props;
    const params = {
      data: getEditTableData(myInventoryData, ['itemStorageId']),
      customizeUnitCode: 'SINV.MY_INVENTORY_LINE.SEARCH,SINV.MY_INVENTORY_LINE.LIST',
    };
    const { validateFields } = form;
    validateFields((error) => {
      if (isEmpty(error)) {
        if (Array.isArray(params.data) && params.data.length > 0) {
          dispatch({
            type: 'myInventory/saveInventory',
            params,
          }).then((res) => {
            if (res) {
              notification.success({
                message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
              });
              this.handleSearchInventory();
              myInventoryData.forEach((n) => {
                if (n && n.form) {
                  n.form.resetFields('inputQuantity');
                  n.form.resetFields('comment');
                }
              });
            }
          });
        }
      }
    });
  }

  /**
   * 删除库存行
   */
  @Bind()
  handleDeleteInventory() {
    const { dispatch, myInventory = {} } = this.props;
    const { selectedRows = [] } = this.state;
    const { myInventoryData } = myInventory;
    const fliterArr = myInventoryData.filter((item) => item._status === 'create');
    const deleteRow = selectedRows.map((n) => {
      const m = { ...n };
      if (m._status === 'create') m.itemStorageId = null;
      return m;
    });
    Modal.confirm({
      title:
        fliterArr.length <= 0
          ? intl.get(`hzero.common.view.message.deleteConfirm`).d('是否删除')
          : intl
              .get(`hzero.common.message.confirm.deleteNotSave`)
              .d('当前有未保存数据，继续操作将造成数据丢失，是否继续'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'myInventory/deleteInventory',
          data: deleteRow,
        }).then((res) => {
          if (res) {
            notification.success({
              message: intl.get(`hzero.common.notification.success.delete`).d('删除成功'),
            });
            this.handleSearchInventory();
            this.setState({ selectedRows: [], selectedRowKeys: [] });
          }
        });
      },
    });
  }

  /**
   * 获取操作记录列表
   */
  @Bind()
  fetchOperationList(page = {}) {
    const { dispatch } = this.props;
    const { currentRecord } = this.state;
    const { itemStorageId } = currentRecord;
    dispatch({
      type: 'myInventory/fetchOperationList',
      payload: {
        page,
        itemStorageId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        this.setState({
          operationList: content,
          operationPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 获取占用数量列表
   */
  @Bind()
  fetchOccupancyList(page = {}) {
    const { dispatch } = this.props;
    const { currentRecords } = this.state;
    const { itemStorageId } = currentRecords;
    dispatch({
      type: 'myInventory/fetchOccupancyList',
      payload: {
        page,
        itemStorageId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        this.setState({
          occupancyList: content,
          occupancyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 操作记录弹窗
   */
  @Bind()
  handleOperationRecModal(flag = false, currentRecord = {}) {
    this.setState({ modalVisible: !!flag, currentRecord }, () => {
      if (flag) {
        this.fetchOperationList();
      }
    });
  }

  /**
   * 占用数量弹窗
   */
  @Bind()
  handleOccupancyModal(flag = false, currentRecords = {}) {
    this.setState({ occupancyModalVisible: !!flag, currentRecords }, () => {
      if (flag) {
        this.fetchOccupancyList();
      }
    });
  }

  /**
   * 导入列表
   */
  @Bind()
  handleExport() {
    const { tenantId, history } = this.props;
    history.push({
      pathname: `/sinv/myInventory/STOCK.STOCK_ITEM_IMPORT`,
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        backPath: '/sinv/myInventory/list',
        args: JSON.stringify({
          tenantId,
          templateCode: 'ASN.BATCH_IMPORT',
        }),
      }),
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 供应商改变
   */
  @Bind()
  handleSupCompanyIdChange(record, lovRecord) {
    const {
      dispatch,
      myInventory: { myInventoryData = [] },
    } = this.props;
    const newDate = myInventoryData.map((n) => {
      const m = {
        ...n,
      };
      if (m.itemStorageId === record.itemStorageId) {
        m.supplierCompanyId = lovRecord.supplierCompanyId;
        m.supplierId = lovRecord.supplierId || null;
      }
      return m;
    });
    dispatch({
      type: 'myInventory/updateState',
      payload: {
        myInventoryData: newDate,
      },
    });
    record.$form.setFieldsValue({
      supplierId: lovRecord.supplierId || null,
      supplierCompanyId: lovRecord.supplierCompanyId,
      supplierCompanyName: lovRecord.supplierName,
      supplierCompanyNum: lovRecord.supplierNum,
    });
  }

  render() {
    const {
      selectedRowKeys,
      selectedRows,
      modalVisible,
      occupancyModalVisible,
      operationList,
      operationPagination,
      occupancyList,
      occupancyPagination,
      formValue,
      cuxEditor,
    } = this.state;
    const {
      tenantId,
      myInventory: { myInventoryData, myInventoryPagination },
      loadingList,
      loadingSave,
      loadingDelete,
      customizeTable,
      loadingOperation,
      loadingOccupancy,
      customizeFilterForm,
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onRowSelectChange,
    };
    const listProps = {
      cuxEditor,
      selectedRows,
      rowSelection,
      customizeTable,
      dataSource: myInventoryData,
      pagination: myInventoryPagination,
      loading: loadingList,
      onSearch: this.handleSearchInventory,
      onModalVisible: this.handleOperationRecModal,
      onOccupancyModalVisible: this.handleOccupancyModal,
      onSupCompanyIdChange: this.handleSupCompanyIdChange,
      onRef: (node) => {
        this.form = node.props.form;
      },
    };
    const FormProps = {
      customizeFilterForm,
      onRef: (node) => {
        this.form = node.props.form;
      },
      onSearch: this.handleSearchInventory,
    };
    const operationRecordProps = {
      onCancel: this.handleOperationRecModal,
      visible: modalVisible,
      loading: loadingOperation,
      dataSource: operationList,
      pagination: operationPagination,
      onFetchOperationList: this.fetchOperationList,
    };
    const occupancyProps = {
      onCancel: this.handleOccupancyModal,
      onFetchOccupancyList: this.fetchOccupancyList,
      visible: occupancyModalVisible,
      loading: loadingOccupancy,
      dataSource: occupancyList,
      pagination: occupancyPagination,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${messagePrompt}.title.myInventory`).d('我的库存录入')}>
          <Button icon="save" loading={loadingSave} onClick={this.handleSaveInventory}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleCreateInventory}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            loading={loadingDelete}
            onClick={this.handleDeleteInventory}
            disabled={!(selectedRows.length > 0)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <ExcelExportPro
            buttonText={intl.get(`hzero.common.button.newExport`).d('新版导出')}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/supplier/export`}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.logistics.my.stock.my.inventory.entry.ps.button.newexport',
                  type: 'c7n-pro',
                },
              ],
            }}
            queryParams={{
              tenantId,
              ...formValue,
              customizeUnitCode: 'SINV.MY_INVENTORY_LINE.SEARCH,SINV.MY_INVENTORY_LINE.LIST',
            }}
            templateCode="SPUC_SSTK_SUPPLIER_EXPORT"
          />
          <CommonImport
            businessObjectTemplateCode="STOCK.STOCK_ITEM_IMPORT"
            prefixPatch={SRM_SPUC}
            refreshButton
            buttonText={intl.get(`sinv.deliveryCreation.view.button.newImport`).d('新版导入')}
            args={{
              tenantId,
              templateCode: 'STOCK.STOCK_ITEM_IMPORT',
            }}
            // buttonProps={{}}
            buttonProps={{
              icon: 'archive',
              permissionList: [
                {
                  code: `srm.logistics.my.stock.my.inventory.entry.ps.button.newimport`,
                  type: 'button',
                  meaning: '批量导入-新',
                },
              ],
            }}
          />
          <ExcelExport
            otherButtonProps={{
              icon: 'export',
              permissionList: [
                {
                  code: 'srm.logistics.my.stock.my.inventory.entry.button.export',
                  type: 'c7n-pro',
                },
              ],
            }}
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/supplier/export`}
            queryParams={{
              tenantId,
              ...formValue,
              customizeUnitCode: 'SINV.MY_INVENTORY_LINE.SEARCH,SINV.MY_INVENTORY_LINE.LIST',
            }}
          />
          <PermissionButton
            icon="to-top"
            permissionList={[
              {
                code: `srm.logistics.my.stock.my.inventory.entry.button.import`,
                type: 'c7n-pro',
              },
            ]}
            onClick={this.handleExport}
          >
            {intl.get('hzero.common.button.import').d('导入')}
          </PermissionButton>
        </Header>
        <Content>
          <FilterForm {...FormProps} />
          <List {...listProps} />
          <OperationRecordModal {...operationRecordProps} />
          <OccupancyModal {...occupancyProps} />
        </Content>
      </React.Fragment>
    );
  }
}
