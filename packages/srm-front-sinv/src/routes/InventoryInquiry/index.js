import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import withCustomize from 'srm-front-cuz';
import remote from 'hzero-front/lib/utils/remote';
import List from './List';
import FilterForm from './Search';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SINV.INVENTORY_INQUIRY.LIST', 'SINV.INVENTORY_INQUIRY.FILTER_BY_SEARCH'],
})
@remote({
  code: 'SINV_INVENTORY_INQUIRY',
  name: 'cuxRemote',
})
@connect(({ loading, inventoryInquiry }) => ({
  inventoryInquiry,
  loadingList: loading.effects['inventoryInquiry/queryInventoryInquiryList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'hzero.common',
    'sinv.common',
    'entity.item',
    'entity.roles',
    'entity.supplier',
    'spfm.configServer',
    'entity.business',
    'sinv.acceptanceSheetCreate',
    'sinv.inventoryInquiry',
  ],
})
export default class InventoryInquiry extends PureComponent {
  componentDidMount() {
    this.initLovCodes(); // 初始化值集
    this.handleSearchInventory();
  }

  /**
   * 初始化值集
   */
  @Bind()
  initLovCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'inventoryInquiry/init',
    });
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
    dispatch({
      type: 'inventoryInquiry/queryInventoryInquiryList',
      payload: {
        page: isEmpty(page) ? {} : page,
        customizeUnitCode: 'SINV.INVENTORY_INQUIRY.LIST,SINV.INVENTORY_INQUIRY.FILTER_BY_SEARCH',
        ...filterValues,
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleParams() {
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    return filterValues;
  }

  @Bind()
  getButtons() {
    const { cuxRemote } = this.props;
    const organizationId = getCurrentOrganizationId();
    const buttons = [
      <ExcelExportPro
        icon="unarchive"
        type="c7n-pro"
        // funcType="flat"
        buttonText={intl.get(`hzero.common.button.newExport`).d('新版导出')}
        requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk/item-outsource-storage/purchaser/page/export`}
        queryParams={this.handleParams()}
        templateCode="SPUC_SSTK_ITEM_OUTSOURCE_STORAGE_PR_EXPORT"
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          // funcType: 'flat',
          permissionList: [
            {
              code:
                'srm.logistics.supplier.inventory.outsource-consign-inventory-inquiry.ps.newexport',
              type: 'c7n-pro',
              // funcType: 'flat',
            },
          ],
        }}
      />,
      <ExcelExport
        otherButtonProps={{
          icon: 'export',
          permissionList: [
            {
              code:
                'srm.logistics.supplier.inventory.outsource-consign-inventory-inquiry.button.export',
              type: 'c7n-pro',
            },
          ],
        }}
        buttonText={intl.get(`hzero.common.button.export`).d('导出')}
        requestUrl={`${SRM_SPUC}/v1/${organizationId}/sstk/item-outsource-storage/purchaser/page/export`}
        queryParams={this.handleParams()}
      />,
    ];
    return cuxRemote
      ? cuxRemote.process('SINV_INVENTORY_INQUIRY_PROCESS_HEADER_BUTTON', buttons, { that: this })
      : buttons;
  }

  render() {
    const {
      inventoryInquiry: {
        inventoryInquiryData = [],
        inventoryInquiryPagination = {},
        enumMap: { specialInventory = [], supplierAddress = [] } = {},
      },
      tenantId,
      loadingList,
      customizeTable = () => {},
      customizeFilterForm = () => {},
    } = this.props;
    const listProps = {
      dataSource: inventoryInquiryData,
      pagination: inventoryInquiryPagination,
      loading: loadingList,
      onSearch: this.handleSearchInventory,
      onRef: (node) => {
        this.form = node.props.form;
      },
      customizeTable,
    };
    const FormProps = {
      tenantId,
      specialInventory,
      supplierAddress,
      onRef: (node) => {
        this.form = node.props.form;
      },
      onSearch: this.handleSearchInventory,
      customizeFilterForm,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sinv.inventoryInquiry.view.message.title.inventoryInquiry`)
            .d('外协&寄售库存查询')}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <FilterForm {...FormProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
