/**
 * indexDS.js - 供应商分类变更申请查询
 * @date: 2018-10-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Table, DataSet, Select } from 'choerodon-ui/pro';
import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { indexDS } from './stores/indexDS';

@connect(({ supplierCategoryAlterList, loading, user }) => ({
  supplierCategoryAlterList,
  user,
  loading: loading.effects['supplierCategoryAlterList/querySupplierCategoryAlter'],
  organizationId: getCurrentOrganizationId(),
  list: supplierCategoryAlterList.supplierCategoryAlterList,
}))
@formatterCollections({
  code: ['sslm.supplierCategoryAlter', 'sslm.common'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.LIST',
    'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.SEARCH_FORM',
    'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.BTN_GROUP',
  ],
})
@withProps(
  () => {
    const tableDs = new DataSet(indexDS());
    return { tableDs };
  },
  { cacheState: true }
)
export default class SupplierCategoryAlter extends Component {
  /**
   * 导出参数
   */
  @Bind()
  handleParams() {
    const { tableDs } = this.props;
    const queryData = (tableDs.queryDataSet.current && tableDs.queryDataSet.current.toData()) || {};
    const queryParams = filterNullValueObject(queryData);
    const { __dirty, ...others } = queryParams;
    return {
      ...others,
    };
  }

  render() {
    const {
      history,
      match,
      tableDs,
      organizationId,
      customizeTable,
      custLoading,
      customizeBtnGroup,
    } = this.props;

    const basePath = match.path.substring(0, match.path.indexOf('/list'));

    const columns = [
      {
        width: 160,
        name: 'categoryAlterNumber',
        renderer: ({ value, record }) => {
          return (
            <a
              onClick={() => {
                history.push(`${basePath}/detail/${record.data.categoryAlterId}`);
              }}
            >
              {value}
            </a>
          );
        },
      },
      {
        width: 140,
        name: 'supplierCompanyNum',
      },
      {
        name: 'supplierZhOrEnCompanyNum',
      },
      {
        width: 100,
        name: 'processStatusMeaning',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.supply.applyReason').d('申请理由'),
        name: 'alterReason',
        width: 150,
      },
      {
        width: 150,
        name: 'realName',
        render: (_, record) => record.realName || record.loginName,
      },
      {
        width: 160,
        name: 'creationDate',
        render: dateRender,
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 150)));

    const tableProps = {
      rowKey: 'categoryAlterId',
      columns,
      scroll: {
        x: scrollX,
      },
    };

    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/export`,
          queryParams: () => this.handleParams(),
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          otherButtonProps: {
            permissionList: [
              {
                code: 'srm.partner.suplier-classify.requisition-query.ps.list.export.new',
                type: 'button',
                meaning: '供应商分类变更申请查询-导出',
              },
            ],
          },
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_CTG_ALTER_EXPORT',
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/export`,
          queryParams: () => this.handleParams(),
          otherButtonProps: {
            type: 'c7n-pro',
            icon: 'unarchive',
            permissionList: [
              {
                code: 'srm.partner.suplier-classify.requisition-query.ps.list.export.old',
                type: 'button',
                meaning: '供应商分类变更申请查询-导出',
              },
            ],
          },
        },
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.supplierCategoryAlter.view.title.supplierCategoryList')
            .d('供应商分类变更申请查询')}
        >
          {customizeBtnGroup(
            {
              // code: 'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.BTN_GROUP',
              code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.LIST',
              filterCode: 'SSLM.SUPPLIER_CATEGORY_ALTER_QUERY_LIST.SEARCH_FORM',
            },
            <Table
              bordered
              {...tableProps}
              dataSet={tableDs}
              queryFieldsLimit={3}
              data={[]}
              custLoading={custLoading}
              queryFields={{
                processStatus: (
                  <Select
                    name="processStatus"
                    optionsFilter={(record) => record.get('value') !== 'CANCEL_SUBMIT'}
                  />
                ),
              }}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
