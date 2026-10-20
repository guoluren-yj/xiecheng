/**
 * Report - 供应商配额管理报表
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Table, Form, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { SRM_SSLM } from '_utils/config';
import Checkbox from 'components/Checkbox';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['sslm.supplierQuotaManage'],
})
@connect(({ supplierQuota, loading }) => ({
  supplierQuota,
  queryLoading: loading.effects['supplierQuota/fetchQuotaReportList'],
}))
@remotes({
  code: 'SSLM_SUPPLIER_QUOTA_REPORT',
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_QUOTA_REPORT.LIST',
    'SSLM.SUPPLIER_QUOTA_REPORT.QUERY_LIST',
    'SSLM.SUPPLIER_QUOTA_REPORT.LIST.BTN_GROUP',
  ],
})
export default class Report extends Component {
  componentDidMount() {
    this.init();
    this.handleList();
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const payload = {
      statusList: 'SSLM.SUPPLIER_QUOTA_STATUS',
    };
    dispatch({
      type: 'supplierQuota/init',
      payload,
    });
  }

  /**
   * 列表数据查询
   */
  @Bind()
  handleList(page = {}) {
    const {
      dispatch,
      form: { getFieldsValue },
    } = this.props;
    const filterValue = getFieldsValue();
    const { createDateFrom: newStartDate, createDateTo: newEndDate } = filterValue;
    const createDateFrom = newStartDate && moment(newStartDate).format(DATETIME_MIN);
    const createDateTo = newEndDate && moment(newEndDate).format(DATETIME_MAX);
    dispatch({
      type: 'supplierQuota/fetchQuotaReportList',
      payload: {
        page,
        ...filterValue,
        createDateFrom,
        createDateTo,
        customizeUnitCode: 'SSLM.SUPPLIER_QUOTA_REPORT.LIST,SSLM.SUPPLIER_QUOTA_REPORT.QUERY_LIST',
      },
    });
  }

  /**
   * 导出参数
   */
  @Bind()
  handleParams() {
    const formValue = this.props.form.getFieldsValue();
    const { createDateFrom: newStartDate, createDateTo: newEndDate } = formValue;
    const createDateFrom = newStartDate && moment(newStartDate).format(DATETIME_MIN);
    const createDateTo = newEndDate && moment(newEndDate).format(DATETIME_MAX);
    const filterValues = {
      ...formValue,
      createDateFrom,
      createDateTo,
    };
    return filterNullValueObject(filterValues);
  }

  /**
   * 隐藏历史版本的回调
   */
  @Bind()
  handleHistoryVersion(e) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ enableHistory: e.target.checked });
    this.handleList();
  }

  render() {
    const {
      form,
      remote,
      supplierQuota: {
        code: { statusList = [] },
        quotaReportList,
        quotaReportPagination,
      },
      queryLoading,
      customizeTable,
      custLoading,
      customizeFilterForm,
      customizeBtnGroup,
    } = this.props;
    const enableHistoryInit = remote.process('SSLM_SUPPLIER_QUOTA_REPORT_ENABLE_HISTORY_INIT', 0);
    const columns = [
      {
        dataIndex: 'quotaAgreementNum',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号'),
      },
      {
        dataIndex: 'quotaAgreementDescription',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.agreementDesc').d('配额协议描述'),
      },
      {
        dataIndex: 'evalStatusMeaning',
        width: 100,
        title: intl.get('hzero.common.status').d('状态'),
      },
      {
        dataIndex: 'versionNum',
        width: 100,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.version').d('版本'),
      },
      {
        dataIndex: 'categoryCode',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码'),
      },
      {
        dataIndex: 'itemCategoryName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称'),
      },
      {
        dataIndex: 'itemCode',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
      },
      {
        dataIndex: 'itemName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称'),
      },
      {
        dataIndex: 'companyName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司'),
      },
      {
        dataIndex: 'ouName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体'),
      },
      {
        dataIndex: 'effectiveDateFrom',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从'),
        render: dateRender,
      },
      {
        dataIndex: 'effectiveDateTo',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至'),
        render: dateRender,
      },
      {
        dataIndex: 'supplierNum',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.suppilerCode').d('供应商编码'),
      },
      {
        dataIndex: 'supplierName',
        width: 200,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.supplierName').d('供应商名称'),
      },
      {
        dataIndex: 'erpSupplierNum',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.erpSuppilerCode').d('ERP供应商编码'),
      },
      {
        dataIndex: 'quotaRatio',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.ratio').d('配额比（%）'),
      },
      {
        dataIndex: 'actualAmountPercentage',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.actualAmount').d('实际交易金额（%）'),
      },
      {
        dataIndex: 'orderNumber',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.orderNumber').d('订单个数'),
      },
      {
        dataIndex: 'itemNumber',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.itemNumber').d('物料个数'),
      },
      {
        dataIndex: 'purchaseTotalAmount',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.purchaseNumber').d('采购总数量'),
      },
      {
        dataIndex: 'orderIncludedTotalAmount',
        width: 150,
        title: intl
          .get('sslm.supplierQuotaManage.modal.quota.totalOrderAmount')
          .d('订单总金额（含税）'),
      },
      {
        dataIndex: 'orderDomesticCurrencyCode',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.localCurrency').d('本币币种'),
      },
      {
        dataIndex: 'createName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
      },
      {
        dataIndex: 'buyerName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员'),
      },
      {
        dataIndex: 'sourceDocType',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.sourceDocType').d('来源单据类型'),
        render: (val, record) => record.sourceDocTypeMeaning,
      },
      {
        dataIndex: 'sourceNumber',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.sourceNumber').d('来源单据编号'),
      },
    ];
    const filterFormProps = {
      form,
      statusList,
      onSearch: this.handleList,
      customizeFilterForm,
      code: 'SSLM.SUPPLIER_QUOTA_REPORT.QUERY_LIST',
    };
    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            permissionList: [
              {
                code: 'srm.partner.supplier-quota-manage.report.ps.list.export.new',
                type: 'button',
                meaning: '供应商配额管理报表-导出',
              },
            ],
          },
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_STATEMENT_EXPORT',
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.supplier-quota-manage.report.ps.list.export.old',
                type: 'button',
                meaning: '供应商配额管理报表-导出',
              },
            ],
          },
        },
      },
    ];

    return (
      <Spin spinning={queryLoading}>
        <Header
          title={intl
            .get('sslm.supplierQuotaManage.view.title.supplierQuotaReport')
            .d('供应商配额管理报表')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.SUPPLIER_QUOTA_REPORT.LIST.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {form.getFieldDecorator('enableHistory', {
            initialValue: enableHistoryInit,
          })(
            <Checkbox style={{ marginBottom: 8 }} onChange={this.handleHistoryVersion}>
              {intl
                .get('sslm.supplierQuotaManage.view.quota.hiddenHistoryVersion')
                .d('隐藏历史版本')}
            </Checkbox>
          )}
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_QUOTA_REPORT.LIST',
            },
            <Table
              bordered
              columns={columns}
              custLoading={custLoading}
              onChange={this.handleList}
              dataSource={quotaReportList}
              pagination={quotaReportPagination}
            />
          )}
        </Content>
      </Spin>
    );
  }
}
