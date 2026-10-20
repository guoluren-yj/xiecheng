/**
 * @author biao.zhu@going-link.com
 * @since 2021-07-12 22:28:47
 * @lastTime 2021-07-12 22:39:09
 * @description 收货工作台-可退货
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Select } from 'hzero-ui';
import ImageList from '@/routes/components/ImageList';

import intl from 'utils/intl';
import { isNil } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender, yesOrNoRender } from 'utils/renderer';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { dateRangeTransform } from '@/utils/utils';
import { showBigNumber, showSearchParams } from '@/routes/components/utils';
import { CustModal } from '@/routes/components/C7nCustomModal';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import style from '../index.less';

const { Option } = Select;

// function getCustomize() {
//   const customizeList = [];
//   for (let i = 0; i < 11; i++) {
//     const index = String.fromCharCode(65 + i);
//     customizeList.push(
//       `SINV.RECEIPT_WORKBENCH_THING.RETURN.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH`
//     );
//   }
//   return customizeList;
// }
// @WithCustomize({
//   unitCode: getCustomize(),
//   queryMethod: 'POST',
// })
@formatterCollections({
  code: [
    'sinv.receiptWorkbench',
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.purchaserDelivery',
    'entity.company',
  ],
})
export default class ReturnableReceipts extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleFieldChange = ({ value, name, record }) => {
    if (name === 'trxDataRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  };

  /*
   * 事务-待收货
   */
  getColumns = () => {
    const { nodeFlag, doubleUnitEnabled } = this.props;
    const columns = {
      collect: [
        {
          name: 'nodeConfigName',
          width: 100,
        },
      ],
      node: [
        {
          name: 'itemCode',
          width: 170,
        },
        {
          name: 'itemName',
          width: 170,
        },
        doubleUnitEnabled && {
          name: 'secondaryUomId',
          width: 170,
          renderer: ({ record }) => record.get('secondaryUomName'),
        },
        {
          name: 'uomName',
          width: 100,
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
            : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
        },
        {
          name: 'supplierName',
          width: 180,
          renderer: ({ record }) =>
            record.get('supplierId')
              ? record.get('supplierName')
              : record.get('supplierCompanyName'),
        },
        doubleUnitEnabled && {
          name: 'secondaryLeftQuantity',
          width: 120,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'leftQuantity',
          width: 140,
          renderer: ({ value }) => showBigNumber(value),
          header: doubleUnitEnabled
            ? intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
        },
        // {
        //   name: 'executeReverseQuantity',
        //   width: 120,
        //   editor: (record) => record.get('subjectType') === 'QUANTITY',
        //   renderer: ({ value }) => showBigNumber(value),
        // },
        // {
        //   name: 'reverseNodeLov',
        //   width: 120,
        //   editor: (record) => record.get('subjectType') === 'QUANTITY',
        // },
        {
          name: 'leftTaxAmount',
          width: 120,
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : showBigNumber(value, record.get('financialPrecision')),
        },
        {
          name: 'displayTrxNum',
          width: 180,
          renderer: ({ value, record }) => {
            const { commonToDetail = (e) => e } = this.props;
            if (value) {
              return (
                <a
                  onClick={() =>
                    commonToDetail('TRX', record, {
                      detailType: 'RETURN',
                      from: 'four',
                      viewType: 'flat',
                    })
                  }
                >
                  {`${value}-${record.get('displayTrxLineNum')}`}
                </a>
              );
            }
          },
        },
        {
          name: 'trxDate',
          width: 160,
          renderer: ({ value }) => dateRender(value),
        },
        {
          name: 'invOrganizationName',
          width: 150,
        },
        {
          name: 'inventoryName',
          width: 110,
        },
        {
          name: 'locationName',
          width: 110,
        },
        {
          name: 'productNum',
          width: 150,
        },
        {
          name: 'productName',
          width: 120,
        },
        {
          name: 'fromDisplayPoNum',
          width: 150,
          renderer: ({ value, record }) => {
            if (value) {
              return `${value}-${record.get('fromDisplayPoLineNum')}`;
            }
          },
        },
        {
          name: 'fromDisplayAsnNum',
          width: 150,
          renderer: ({ value, record }) => {
            if (value) {
              return `${value}-${record.get('fromDisplayAsnLineNum')}`;
            }
          },
        },
        {
          name: 'fromPcNum',
          width: 150,
          renderer: ({ value, record }) => {
            if (value) {
              return `${value}-${record.get('fromPcSubjectNum')}`;
            }
          },
        },
        {
          name: 'companyName',
          width: 140,
        },
        {
          name: 'agentName',
          width: 120,
        },
        {
          name: 'creationName',
          width: 120,
        },
        {
          name: 'strategyCode',
          width: 150,
        },
        {
          name: 'customSpecsJson',
          width: 120,
          renderer: ({ value }) => {
            return <CustModal dataSource={value ? JSON.parse(value) : []} />;
          },
        },
        {
          name: 'orderReturnedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'attachmentUrlList',
          width: 80,
          renderer: ({ record, value }) => {
            return value?.length ? (
              <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />
            ) : (
              <span>-</span>
            );
          },
        },
        {
          name: 'projectTaskId',
          width: 110,
          renderer: ({ record }) => {
            return record.get('projectTaskName');
          },
        },
      ],
    };
    if (nodeFlag) {
      return columns.node;
    } else {
      return columns.collect.concat(columns.node);
    }
  };

  /** ************************************************ 渲染 *********************************************************** */

  render() {
    const {
      selectName,
      returnTableDs,
      customizeTable,
      batchMaintains,
      nodeConfigIndexAbc,
      selectedChange = (e) => e,
      multipleSearch = (e) => e,
      isFromSupplierParams,
    } = this.props;
    const handleQuery = ({ params = {} }) => {
      multipleSearch(params);
    };
    const resetQueryDs = (ds, flag) => {
      // eslint-disable-next-line no-unused-expressions
      ds.queryDataSet?.current.reset();
      // setResetFlag(true);
      if (flag) {
        ds.query();
      }
    };

    return customizeTable(
      { code: `SINV.RECEIPT_WORKBENCH_THING.RETURN.${nodeConfigIndexAbc}` },
      <SearchBarTable
        virtual
        autoQuery={false}
        virtualCell
        className={style.searchTable_css}
        // showAllPageSelectionButton
        searchCode="SINV.RECEIPT_WORKBENCH_THING.RETURN_SEARCH"
        dataSet={returnTableDs}
        columns={this.getColumns()}
        pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
        boxSizing="wrapper"
        style={{ maxHeight: `calc(100vh - 250px)` }}
        cacheState
        queryFieldsLimit={3}
        searchBarConfig={{
          left: {
            render: () => (
              <Fragment>
                <Select
                  allowClear
                  onChange={(record) => {
                    selectedChange(record);
                  }}
                  defaultValue={selectName}
                  className={style['node-select']}
                  placeholder={intl
                    .get('sinv.receiptWorkbench.view.receipt.nodeText')
                    .d('选择节点')}
                >
                  {batchMaintains.map((n) => (
                    <Option
                      key={n.nodeConfigName}
                      value={`${n.nodeConfigIndexAbc}${n.nodeConfigId}`}
                      className={style.option}
                    >
                      {n.nodeConfigName}
                    </Option>
                  ))}
                </Select>
                <div className={style.divider} />
                {/* 多数据查询框 */}
                <MutlTextFieldSearch
                  name="allSource"
                  dataSet={returnTableDs}
                  placeholder={intl
                    .get('sinv.receiptWorkbench.view.receipt.searchPreciseReturn')
                    .d('请输入来源订单、送货单、协议、收货单查询')}
                />
              </Fragment>
            ),
          },
          onQuery: handleQuery,
          onReset: () => resetQueryDs(returnTableDs),
          onClear: () => resetQueryDs(returnTableDs, true),
          onFieldChange: this.handleFieldChange,
          fieldProps: {
            companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            locatorId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
            rcvTrxTypeId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            purOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
            itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
            trxDate: {
              defaultValue: ({ record }) =>
                dateRangeTransform(
                  isNil(record.get('trxDataRange')) ? 'IN_THREE_MONTH' : record.get('trxDataRange')
                ),
              dynamicProps: {
                disabled: ({ record }) => record.get('trxDataRange'),
              },
            },
            ...showSearchParams(isFromSupplierParams),
          },
        }}
      />
    );
  }
}
