import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  createPagination,
  getUserOrganizationId,
} from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import OperationRecordModal from './OperationRecordModal';
import OccupancyModal from './OccupancyModal';

import List from './List';
import FilterForm from './Search';

const messagePrompt = 'sinv.common.view.message';

@withCustomize({
  unitCode: [
    'SINV.SUPPLIER_INVENTORY.SEARCH',
    'SINV.SUPPLIER_INVENTORY.LIST',
    'SINV.SUPPLIER_INVENTORY.BTN',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, supplierInventory }) => ({
  loadingList: loading.effects['supplierInventory/querySupplierInventoryList'],
  loadingOperation: loading.effects['supplierInventory/fetchOperationList'],
  loadingOccupancy: loading.effects['supplierInventory/fetchOccupancyList'],
  supplierInventory,
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hzero.common', 'sinv.common', 'entity.item', 'entity.roles', 'entity.company'],
})
export default class SupplierInventory extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      operationList: [],
      operationPagination: {},
      occupancyList: [],
      occupancyPagination: {},
      currentRecord: {},
      currentRecords: {},
      modalVisible: false,
      formValue: undefined,
      occupancyModalVisible: false,
    };
  }

  componentDidMount() {
    this.handleSearchInventory();
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
      type: 'supplierInventory/querySupplierInventoryList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...filterValues,
        customizeUnitCode: 'SINV.SUPPLIER_INVENTORY.SEARCH,SINV.SUPPLIER_INVENTORY.LIST',
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
      type: 'supplierInventory/fetchOperationList',
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
      type: 'supplierInventory/fetchOccupancyList',
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

  render() {
    const {
      modalVisible,
      occupancyModalVisible,
      operationList,
      operationPagination,
      occupancyList,
      occupancyPagination,
      formValue,
    } = this.state;
    const {
      supplierInventory: { supplierInventoryData = [], supplierInventoryPagination = {} },
      tenantId,
      loadingList,
      loadingOperation,
      loadingOccupancy,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
    } = this.props;
    const organizationId = getUserOrganizationId();
    const listProps = {
      customizeTable,
      dataSource: supplierInventoryData,
      pagination: supplierInventoryPagination,
      loading: loadingList,
      onSearch: this.handleSearchInventory,
      onModalVisible: this.handleOperationRecModal,
      onOccupancyModalVisible: this.handleOccupancyModal,
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
      onFetchOperationList: this.fetchOperationList,
      visible: modalVisible,
      loading: loadingOperation,
      dataSource: operationList,
      pagination: operationPagination,
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
        <Header title={intl.get(`${messagePrompt}.title.supplierInventory`).d('供应商库存查询')}>
          {customizeBtnGroup({ code: `SINV.SUPPLIER_INVENTORY.BTN` }, [
            <ExcelExportPro
              data-name="newExport"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.logistics.supplier.inventory.query.ps.button.newexport',
                    type: 'c7n-pro',
                  },
                ],
              }}
              icon="export"
              buttonText={intl.get(`hzero.common.button.newExport`).d('新版导出')}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/purchaser/export`}
              queryParams={{
                tenantId,
                ...formValue,
                customizeUnitCode: 'SINV.SUPPLIER_INVENTORY.SEARCH,SINV.SUPPLIER_INVENTORY.LIST',
              }}
              templateCode="SPUC_SSTK_PURCHASER_EXPORT"
            />,
            <ExcelExport
              data-name="export"
              otherButtonProps={{
                icon: 'export',
                permissionList: [
                  {
                    code: 'srm.logistics.supplier.inventory.query.button.export',
                    type: 'c7n-pro',
                  },
                ],
              }}
              buttonText={intl.get(`hzero.common.button.export`).d('导出')}
              requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/purchaser/export`}
              queryParams={{
                tenantId,
                ...formValue,
                customizeUnitCode: 'SINV.SUPPLIER_INVENTORY.SEARCH,SINV.SUPPLIER_INVENTORY.LIST',
              }}
            />,
          ])}
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
