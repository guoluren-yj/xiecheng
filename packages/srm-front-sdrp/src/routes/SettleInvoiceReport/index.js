import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';
import intl from 'utils/intl';
import { SRM_DATA_SDRP } from '@/utils/config';
import moment from 'moment';
import ReportDs from './ds';

const organizationId = getCurrentOrganizationId();

function SettleInvoiceReport(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'invoiceStatusMeaning' },
      { name: 'settleNum', width: 170 },
      { name: 'thirdEcInvoiceNum', width: 170 },
      { name: 'taxIncludedAmount', width: 170 },
      { name: 'invoiceTaxIncludedAmount', width: 170 },
      { name: 'explain' },
      { name: 'processingService', width: 130 },
      { name: 'settleStatusMeaning', width: 130 },
      { name: 'requestStatusMeaning', width: 130 },
      { name: 'ecPlatformMeaning' },
      { name: 'creationDate', width: 170 },
      { name: 'companyName' },
      { name: 'supplierName' },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_EC_SETTLE_INVOICE_EXPORT"
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
        requestUrl={`${SRM_DATA_SDRP}/v1/${organizationId}/e-commerce/report/settle-invoice/export`}
        allBody
        queryParams={() => {
          const selectList = ds.selected.map((m) => m.toData());
          const settleHeaderIdList = selectList.map((item) => item.settleHeaderId);
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
                settleHeaderIdList,
              }),
            };
          }
        }}
      />,
    ];
  });

  return (
    <Fragment>
      <Header title={intl.get('sdrp.settleInvoice.title.report').d('发票业务全流程查阅')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SETTLE.INVOICE_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SETTLE.INVOICE_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode="SDRP.SETTLE.INVOICE_REPORT.TABLE"
            searchBarConfig={{
              fieldProps: {
                creationDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('creationDate'))
                      ? [
                          moment().subtract(12, 'month').add(1, 'day'),
                          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        ]
                      : record.get('creationDate'),
                },
              },
              editorProps: {
                creationDate: {
                  clearButton: false,
                },
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.settleInvoice', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: ['SDRP.SETTLE.INVOICE_REPORT.TABLE', 'SDRP.SETTLE.INVOICE_REPORT.SEARCH'],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SETTLE.INVOICE_REPORT.TABLE',
              'SDRP.SETTLE.INVOICE_REPORT.SEARCH',
            ],
          })
        ),
      };
    },
    {
      cacheState: true,
    }
  )
)(SettleInvoiceReport);
