import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getUserOrganizationId,
} from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import List from './List';
import FilterForm from './Search';

const messagePrompt = 'sinv.common.view.message';

@withCustomize({
  unitCode: [
    'SINV.SUPPLIER_INVENTORY_INQUIRY.SEARCH',
    'SINV.SUPPLIER_INVENTORY_INQUIRY.LIST',
    'SINV.SUPPLIER_INVENTORY_INQUIRY.BTN',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, supplierInventory }) => ({
  loadingList: loading.effects['supplierInventory/querySupplierInventoryInputList'],
  supplierInventory,
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'hzero.common',
    'sinv.common',
    'entity.item',
    'entity.roles',
    'spfm.configServer',
    'entity.business',
    'sinv.acceptanceSheetCreate',
    'sinv.inventoryInquiry',
    'entity.company',
  ],
})
export default class SupplierInventoryInquiry extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      formValue: undefined,
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
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ formValue: handleFormValues });
    dispatch({
      type: 'supplierInventory/querySupplierInventoryInputList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...filterValues,
        ...handleFormValues,
        customizeUnitCode:
          'SINV.SUPPLIER_INVENTORY_INQUIRY.SEARCH,SINV.SUPPLIER_INVENTORY_INQUIRY.LIST',
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['lastDateFrom', 'lastDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  render() {
    const {
      supplierInventory: { supplierInventoryInputData = [], supplierInventoryInputPagination = {} },
      loadingList,
      tenantId,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { expandForm, formValue } = this.state;
    const organizationId = getUserOrganizationId();
    const listProps = {
      customizeTable,
      customizeFilterForm,
      dataSource: supplierInventoryInputData,
      pagination: supplierInventoryInputPagination,
      loading: loadingList,
      onSearch: this.handleSearchInventory,
      onRef: (node) => {
        this.form = node.props.form;
      },
    };
    const FormProps = {
      expandForm,
      customizeFilterForm,
      toggleForm: this.toggleForm,
      onRef: (node) => {
        this.form = node.props.form;
      },
      onSearch: this.handleSearchInventory,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${messagePrompt}.title.upplierInventoryInquiry`).d('供应商库存记录查询')}
        >
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'srm.logistics.supplier.inventory.record.query.ps.button.newexport',
                  type: 'c7n-pro',
                },
              ],
            }}
            icon="export"
            buttonText={intl.get(`hzero.common.button.newExport`).d('新版导出')}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage-records/purchaser/export/new`}
            templateCode="SPUC_SSTK_PURCHASER_RECORD_EXPORT"
            queryParams={{
              ...formValue,
              tenantId,
              customizeUnitCode:
                'SINV.SUPPLIER_INVENTORY_INQUIRY.SEARCH,SINV.SUPPLIER_INVENTORY_INQUIRY.LIST',
            }}
          />
          <ExcelExport
            otherButtonProps={{
              icon: 'export',
              permissionList: [
                {
                  code: 'srm.logistics.supplier.inventory.record.query.button.export',
                  type: 'c7n-pro',
                },
              ],
            }}
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage-records/purchaser/export`}
            queryParams={{
              ...formValue,
              tenantId,
              customizeUnitCode:
                'SINV.SUPPLIER_INVENTORY_INQUIRY.SEARCH,SINV.SUPPLIER_INVENTORY_INQUIRY.LIST',
            }}
          />
        </Header>
        <Content>
          <FilterForm {...FormProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
