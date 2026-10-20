/* eslint-disable camelcase */
import React from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { compose, isEmpty } from 'lodash';
// import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getResponse } from 'utils/utils';
import { pcPending } from '@/services/settlePoolServices';
// import DetailDrawer from './DetailDrawer';
import { tableDs2, tableDs3, tableDs4, tableDs5 } from './addDS';

const AddModal = (props) => {
  const { addLine, headerDs, customizeTable, modal } = props;
  const headerData = headerDs.current?.toData();

  /**
   * @paymentCondition  头付款条件
   * @paymentTermId    新增查询时传入
   */
  const { prepaymentType = 'ORDER', paymentCondition } = headerData;
  const { termId } = paymentCondition || {};

  const tbds = {
    ORDER: tableDs2,
    CONTRACT: tableDs3,
    PO_LINE: tableDs2,
    CONTRACT_STAGE: tableDs4,
    CONTRACT_SUBJECT: tableDs5,
  };

  const barCodes = {
    ORDER: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_ORDER',
    CONTRACT: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONTRACT',
    PO_LINE: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_POLINE',
    CONTRACT_STAGE: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONSTAGE',
    CONTRACT_SUBJECT: 'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONSUBJECT',
  };

  const listCodes = {
    PO_LINE: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_ORDER_LINE',
    ORDER: 'SSTA.PURCHASE_SETTLE_DETAIL.ORDER',
    CONTRACT: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT',
    CONTRACT_STAGE: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT_STAGE',
    CONTRACT_SUBJECT: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT_SUBJECT',
  };

  const tableDS = React.useMemo(() => new DataSet(tbds[prepaymentType]()), []);
  // 暂挂查询条件
  const pendingFlag = tableDS?.queryDataSet?.current?.get('pendingFlag');
  const showPcBtnFlag = React.useMemo(() => {
    return ['CONTRACT', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType);
  }, [prepaymentType]);

  React.useEffect(() => {
    const customizeUnitCode = [barCodes[prepaymentType], listCodes[prepaymentType]]
      .filter((item) => item)
      .join();
    tableDS.setQueryParameter('ouId', headerData.ouId);
    tableDS.setQueryParameter('paymentTermId', termId);
    if (['ORDER', 'PO_LINE'].includes(headerData.prepaymentType)) {
      tableDS.setQueryParameter('queryCompanyId', headerData.companyId);
    } else {
      tableDS.setQueryParameter('companyId', headerData.companyId);
    }
    tableDS.setQueryParameter('currencyCode', headerData.currencyCode);
    tableDS.setQueryParameter('settleHeaderId', headerData.settleHeaderId);
    tableDS.setQueryParameter('supplierCompanyId', headerData.supplierCompanyId);
    tableDS.setQueryParameter('customizeUnitCode', customizeUnitCode);
    if (headerData.supplierSiteEnableFlag === 1) {
      tableDS.setQueryParameter('supplierSiteId', headerData.supplierSiteId);
    }
  }, []);

  const handleQuery = ({ params }) => {
    const { creationDate_range = '', publishDate_range = '', ...otherParams } = params;
    const [creationDateStart, creationDateEnd] = creationDate_range.split(',');
    const [publishDateStart, publishDateEnd] = publishDate_range.split(',');
    tableDS.queryDataSet.loadData([
      {
        ...otherParams,
        creationDateStart,
        creationDateEnd,
        publishDateStart,
        publishDateEnd,
      },
    ]);
    tableDS.query();
  };

  // 处理暂挂
  const handleHodle = React.useCallback(async() => {
    const { selected } = tableDS;
    const data = {
      pendingFlag,
      paymentAdvanceLines: selected.map((item) => ({
        ...item.toData(),
      })),
      prepaymentType,
      customizeUnitCode: [barCodes[prepaymentType], listCodes[prepaymentType]].join(),
    };
    const res = await pcPending(data);
    if (getResponse(res)) {
      notification.success();
      tableDS.query();
      tableDS.unSelectAll();
    }
  }, [pendingFlag, prepaymentType, tableDS]);

  const handleAdd = () => {
    if (tableDS.selected) {
      return addLine(
        tableDS.selected.map((item) => ({
          ...item.toData(),
          referenceDataCode: prepaymentType,
        })),
        handleCancel
      );
    } else {
      notification.warning({
        message: intl
          .get('ssta.purchaseSettle.view.message.title.selectOne')
          .d('请至少选择一条数据'),
      });
    }
  };

  const handleCancel = () => {
    modal.close();
  };
  const columnsObj = {
    ORDER: [
      {
        name: 'displayNum',
        width: 200,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      {
        name: 'taxIncludedAmount',
        width: 200,
      },
      {
        name: 'amount',
        width: 200,
      },
      // {
      //   name: 'paymentAmount',
      //   width: 200,
      //   align: 'right',
      //   tooltip: 'overflow',
      // },
      {
        name: 'orderTypeName',
        width: 200,
      },
      {
        name: 'organizationName',
        width: 200,
      },
      {
        name: 'purchaseAgentName',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'releasedDate',
        width: 200,
      },
    ],
    PO_LINE: [
      {
        name: 'displayNum',
        width: 200,
        title: intl.get('ssta.prePayment.model.prePayment.displayAndLineNum').d('采购订单号|行号'),
        renderer: ({ record }) => `${record.get('displayNum')}-${record.get('displayLineNum')}`,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      {
        name: 'orderTypeName',
        width: 200,
      },
      {
        name: 'organizationName',
        width: 200,
      },
      {
        name: 'purchaseAgentName',
        width: 200,
      },
      {
        name: 'itemName',
        width: 200,
      },
      {
        name: 'quantity',
        width: 200,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 200,
      },
      {
        name: 'lineAmount',
        width: 200,
      },
      {
        name: 'taxIncludedAmount',
        width: 200,
      },
      {
        name: 'amount',
        width: 200,
      },
      {
        name: 'categoryName',
        width: 200,
      },
      {
        name: 'poCreateName',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'releasedDate',
        width: 200,
      },
    ],
    CONTRACT: [
      {
        name: 'displayNum',
        width: 200,
      },
      {
        name: 'pcName',
        width: 200,
      },
      {
        name: 'originalAmount',
        width: 200,
      },
      {
        name: 'originalTaxIncludeAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      {
        name: 'currencyCode',
        width: 200,
      },
      {
        name: 'pcTypeName',
        width: 200,
      },
      {
        name: 'startDateActive',
        width: 200,
      },
      {
        name: 'endDateActive',
        width: 200,
      },
      {
        name: 'realName',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'confirmedDate',
        width: 200,
      },
      {
        name: 'pendingFlag',
        width: 120,
      },
    ],
    CONTRACT_STAGE: [
      {
        name: 'associateNum',
        width: 200,
        renderer: ({ record }) => `${record.get('displayNum')}-${record.get('displayLineNum')}`,
      },
      {
        name: 'pcName',
        width: 200,
      },
      {
        name: 'associateLineNum',
        width: 120,
      },
      {
        name: 'stageName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'taxIncludedAmount',
        width: 180,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      {
        name: 'pcTypeName',
        width: 200,
      },
      {
        name: 'pcStatusCode',
        width: 180,
      },
      {
        name: 'realName',
        width: 180,
      },
      {
        name: 'creationDate',
        width: 120,
      },
      {
        name: 'pendingFlag',
        width: 120,
      },
    ],

    CONTRACT_SUBJECT: [
      {
        name: 'associateNum',
        width: 200,
      },
      {
        name: 'pcName',
        width: 200,
      },
      {
        name: 'associateLineNum',
        width: 200,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 180,
      },
      {
        name: 'lineAmount',
        width: 120,
      },
      {
        name: 'taxAmount',
        width: 180,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 180,
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      {
        name: 'pcTypeName',
        width: 180,
      },
      {
        name: 'pcStatusCodeMeaning',
        width: 180,
      },
      {
        name: 'createByRealName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 120,
      },
      {
        name: 'pendingFlag',
        width: 120,
      },
    ],
  };

  const columns = columnsObj[prepaymentType];
  return (
    <>
      <div style={{ height: 'calc(100vh - 160px)' }}>
        {customizeTable(
          {
            code: listCodes[prepaymentType],
          },
          <SearchBarTable
            searchCode={barCodes[prepaymentType]}
            columns={columns}
            dataSet={tableDS}
            searchBarConfig={{
              expandable: false,
              closeFilterSelector: true,
              onQuery: handleQuery,
            }}
            style={{ maxHeight: `calc(100% - 20px)` }}
          />
        )}
      </div>
      <div className="ssta-body-footer">
        <Button onClick={handleAdd} color="primary" wait={500} disabled={isEmpty(tableDS.selected)}>
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
        {
          showPcBtnFlag && ['0', '1'].includes(pendingFlag) && (
            <Button disabled={isEmpty(tableDS.selected)} onClick={handleHodle}>
              {pendingFlag === '1' ? intl.get('ssta.prePayment.view.button.unsuspend').d('撤销暂挂') : intl.get('ssta.prePayment.view.button.suspend').d('暂挂')}
            </Button>
          )
        }
        <Button onClick={handleCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_ORDER_LINE',
      'SSTA.PURCHASE_SETTLE_DETAIL.ORDER',
      'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_ORDER',
      'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONTRACT',
      'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_POLINE',
      'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONSTAGE',
      'SSTA.PURCHASE_SETTLE_DETAIL.SEARCH_ADD_PRE_CONSUBJECT',
      'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT',
      'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT_STAGE',
      'SSTA.PURCHASE_SETTLE_DETAIL.PRE_ADD_CONTRACT_SUBJECT',
    ],
  }),
  observer
)(AddModal);
