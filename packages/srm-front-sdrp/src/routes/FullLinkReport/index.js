import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';
import { SRM_DATA_SDRP } from '@/utils/config';
import ReportDs from './ds';

function FullLinkReport(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'purchaseAgentName' },
      { name: 'requestedName' },
      { name: 'prStatusMeaning' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'projectNum' },
      { name: 'uomName' },
      { name: 'quantity', align: 'right' },
      { name: 'currencyCode' },
      { name: 'unitPrice', align: 'right' },
      { name: 'taxIncludedUnitPrice', align: 'right' },
      { name: 'lineAmount', align: 'right' },
      { name: 'taxIncludedLineAmount', align: 'right' },
      { name: 'neededDate', width: 170 },
      { name: 'executedName' },
      { name: 'creationDate', width: 170 },
      { name: 'urgentFlagMeaning' },
      { name: 'costName' },
      { name: 'itemSpecs' },
      { name: 'wbsCode' },
      { name: 'wbsName' },
      { name: 'executionStrategyCode' },
      { name: 'executionStrategyCodeMeaning' },
      { name: 'localCurrencyTaxUnit', align: 'right' },
      { name: 'localCurrencyNoTaxUnit', align: 'right' },
      { name: 'localCurrencyTaxSum', align: 'right' },
      { name: 'localCurrencyNoTaxSum', align: 'right' },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'prNumAndLineNum' },
      { name: 'displayPrNumAndDisplayLineNum' },
      { name: 'title' },
      { name: 'requestDate', width: 170 },
      { name: 'unitCode' },
      { name: 'unitName' },
      { name: 'ouCode' },
      { name: 'ouName' },
      { name: 'purchaseOrgCode' },
      { name: 'purchaseOrgName' },
      { name: 'sourcePlatformMeaning' },
      { name: 'createdName' },
      { name: 'headerUrgentFlagMeaning' },
      { name: 'prTypeName' },
      { name: 'lastApprovedProcessDate', width: 170 },
      { name: 'approvedDate', width: 170 },
      { name: 'quotedDate', width: 170 },
      { name: 'validExpiryDateFrom', width: 170 },
      { name: 'validExpiryDateTo', width: 170 },
      { name: 'validQuotationPrice', align: 'right' },
      { name: 'suggestedFlagMeaning' },
      { name: 'allottedQuantity', align: 'right' },
      { name: 'rfxTaxRate', align: 'right' },
      { name: 'paymentTypeName' },
      { name: 'rfxItemCode' },
      { name: 'rfxItemName' },
      { name: 'itemCategoryCode' },
      { name: 'itemCategoryName' },
      { name: 'sourceTypeMeaning' },
      { name: 'sourceFromMeaning' },
      { name: 'rfxSupplierCompanyNum' },
      { name: 'rfxSupplierCompanyName' },
      { name: 'rfxNum' },
      { name: 'rfxStatusMeaning' },
      { name: 'rfxTitle' },
      { name: 'rfxTemplateName' },
      { name: 'sourceCategoryMeaning' },
      { name: 'sourceMethodMeaning' },
      { name: 'rfxPurchaseOrgCode' },
      { name: 'rfxPurchaseOrgName' },
      { name: 'srhSourceTypeMeaning' },
      { name: 'paymentTermName' },
      { name: 'rfxReleaseDate', width: 170 },
      { name: 'srhSourceFromMeaning' },
      { name: 'rfxCreationDate', width: 170 },
      { name: 'rfxCreatedName' },
      { name: 'quotationTypeMeaning' },
      { name: 'checkFinishedDate', width: 170 },
      { name: 'quotationLineAmount', align: 'right' },
      { name: 'rfxPurchaseAgentName' },
      { name: 'pcItemCode' },
      { name: 'rfxLastSubmitProcessDate', width: 170 },
      { name: 'rfxByUserName' },
      { name: 'pcItemName' },
      { name: 'pcQuantity', align: 'right' },
      { name: 'taxRate', align: 'right' },
      { name: 'pcUnitPrice', align: 'right' },
      { name: 'pcTaxIncludedUnitPrice', align: 'right' },
      { name: 'pcLineAmount', align: 'right' },
      { name: 'pcTaxIncludedLineAmount', align: 'right' },
      { name: 'deliverDate', width: 170 },
      { name: 'enteredTaxIncludedPrice', align: 'right' },
      { name: 'pcName' },
      { name: 'pcNum' },
      { name: 'pcStatusCodeMeaning' },
      { name: 'pcCompanyNum' },
      { name: 'pcCompanyName' },
      { name: 'pcKindCode' },
      { name: 'supplierCompanyNum' },
      { name: 'supplierCompanyName' },
      { name: 'confirmedDate', width: 170 },
      { name: 'pcCreationDate', width: 170 },
      { name: 'pcCreatedName' },
      { name: 'pcOuName' },
      { name: 'pcPurchaseOrgCode' },
      { name: 'pcPurchaseOrgName' },
      { name: 'pcPurchaseAgentName' },
      { name: 'pcSourceCodeMeaning' },
      { name: 'signDate', width: 170 },
      { name: 'approvalMethodMeaning' },
      { name: 'supplementFlagMeaning' },
      { name: 'releaseDate', width: 170 },
      { name: 'archiveDate', width: 170 },
      { name: 'lastConfirmedProcessDate', width: 170 },
      { name: 'lastPublishedProcessDate', width: 170 },
      { name: 'lastSubmittedProcessDate', width: 170 },
      { name: 'lastConfirmedReleaseDateDiff', width: 170, align: 'right' },
      { name: 'poStatusMeaning' },
      { name: 'promiseDeliveryDate', width: 170 },
      { name: 'poItemCode' },
      { name: 'poItemName' },
      { name: 'poUomName' },
      { name: 'poQuantity', align: 'right' },
      { name: 'poUnitPrice', align: 'right' },
      { name: 'poEnteredTaxIncludedPrice', align: 'right' },
      { name: 'poLineAmount', align: 'right' },
      { name: 'poTaxIncludedLineAmount', align: 'right' },
      { name: 'poTaxRate', align: 'right' },
      { name: 'poCurrencyCode' },
      { name: 'poCostName' },
      { name: 'domesticTaxIncludedPrice', align: 'right' },
      { name: 'domesticUnitPrice', align: 'right' },
      { name: 'domesticTaxIncludedLineAmount', align: 'right' },
      { name: 'domesticLineAmount', align: 'right' },
      { name: 'poNumAndLineNum' },
      { name: 'orderTypeName' },
      { name: 'displayPoNumAndDisplayLineNum' },
      { name: 'supplierCode' },
      { name: 'supplierName' },
      { name: 'termName' },
      { name: 'releasedDate', width: 170 },
      { name: 'poConfirmedDate', width: 170 },
      { name: 'poCreationDate', width: 170 },
      { name: 'poCreatedName' },
      { name: 'approvedReleasedDate', width: 170 },
      { name: 'taxAmount', align: 'right' },
      { name: 'poPurchaseAgentName' },
      { name: 'trxDate', width: 170 },
      { name: 'taxIncludedAmount', align: 'right' },
      { name: 'trxUomName' },
      { name: 'trxCreatedName' },
      { name: 'netAmount', align: 'right' },
      { name: 'trxQuantity', align: 'right' },
      { name: 'trxNum' },
      { name: 'displayTrxNum' },
      // { name: 'settleNum' },
      // { name: 'billQuantity', align: 'right' },
      // { name: 'netPrice', align: 'right' },
      // { name: 'taxIncludedPrice', align: 'right' },
      // { name: 'billNetAmount', align: 'right' },
      // { name: 'billTaxIncludedAmount', align: 'right' },
      // { name: 'billNum' },
      // { name: 'billStatusMeaning' },
      // { name: 'billCreationDate', width: 170 },
      // { name: 'lastSubmitProcessDate', width: 170 },
      // { name: 'lastConfirmProcessDate', width: 170 },
      { name: 'invoiceQuantity', align: 'right' },
      { name: 'invoiceNetPrice', align: 'right' },
      { name: 'invoiceTaxIncludedPrice', align: 'right' },
      { name: 'invoiceNetAmount', align: 'right' },
      { name: 'invoiceTaxIncludedAmount', align: 'right' },
      { name: 'invoiceTaxRate', align: 'right' },
      { name: 'invoiceTaxAmount', align: 'right' },
      { name: 'invoiceCurrencyCode' },
      { name: 'invoiceSettleNum' },
      { name: 'settleStatusMeaning' },
      { name: 'invoiceCreationDate', width: 170 },
      { name: 'invoiceCreatedName' },
      { name: 'submittedDate', width: 170 },
      { name: 'invoiceLastSubmitProcessDate', width: 170 },
      { name: 'invoiceLastConfirmProcessDate', width: 170 },
      { name: 'paymentNetAmount', align: 'right' },
      { name: 'paymentTaxIncludedAmount', align: 'right' },
      { name: 'paymentAmount', align: 'right' },
      { name: 'paidAmount', align: 'right' },
      { name: 'remainingPaymentAmount', align: 'right' },
      { name: 'paymentSettleNum' },
      { name: 'paymentSettleStatusMeaning' },
      { name: 'paymentCurrencyCode' },
      { name: 'paymentCreationDate', width: 170 },
      { name: 'lastApproveProcessDate', width: 170 },
      { name: 'lastExternalConfirmProcessDate', width: 170 },
    ];
  };

  const onQueryValidate = ({ params = {}, fields = [], filter = {} }) => {
    const { allFields = [] } = filter;
    const _params = {};
    Object.keys(params).forEach((key) => {
      const config = fields.find((item) => item.name === key);
      const field = allFields.find((item) => item.fieldAlias === key);
      if (config && field?.custType === 'STD' && ['SELECT', 'LOV'].includes(config.fieldWidget)) {
        _params[key] = params[key]?.split(',') || [];
      } else {
        _params[key] = params[key];
      }
    });
    if (ds.queryDataSet) {
      ds.queryDataSet.loadData([_params]);
      ds.query();
    }
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        allBody
        templateCode="SRM_C_FULL_LINK_QUERY_EXPORT"
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
        }}
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.common.button.export').d('导出')
            : intl.get('sdrp.common.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/full-link/report/full-link/export`}
        queryParams={() => {
          const body = ds.selected.map((m) => m.toData());
          // 筛选器参数
          const queryRecord = ds?.queryDataSet?.current;
          if (queryRecord) {
            const queryParam = queryRecord.toJSONData();
            delete queryParam.__id;
            delete queryParam._status;
            delete queryParam.__dirty;
            return {
              ...filterNullValueObject({
                ...queryParam,
                body,
              }),
            };
          }
        }}
      />,
    ];
  });

  return (
    <Fragment>
      <Header title={intl.get('sdrp.fullLink.title.report').d('采购全流程跟踪')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.LINK_FULL_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.LINK_FULL_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode="SDRP.LINK_FULL_REPORT.TABLE"
            searchBarConfig={{
              onQuery: onQueryValidate,
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.fullLink', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: ['SDRP.LINK_FULL_REPORT.TABLE', 'SDRP.LINK_FULL_REPORT.SEARCH'],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: ['SDRP.LINK_FULL_REPORT.TABLE', 'SDRP.LINK_FULL_REPORT.SEARCH'],
          })
        ),
      };
    },
    { cacheState: true }
  )
)(FullLinkReport);
