import React, { Fragment } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
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
import Detail from './Detail';
import ReportDs from './ds';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

function SettleReconciliationReport(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'billStatusMeaning' },
      { name: 'ecStatementsCode', width: 130 },
      {
        name: 'autoBillNum',
        width: 170,
        renderer: ({ record, value }) => {
          if (isNil(value)) return '-';
          return (
            <div
              className={styles['table-link-btn']}
              onClick={() => {
                Modal.open({
                  key: Modal.key(),
                  drawer: true,
                  style: { width: '90%' },
                  title: intl.get('sdrp.common.modal.detailTitle').d('详情'),
                  children: <Detail record={record} />,
                });
              }}
            >
              {value}
            </div>
          );
        },
      },
      { name: 'statementsAmount', width: 170, align: 'right' },
      { name: 'taxIncludedAmount', width: 170, align: 'right' },
      { name: 'explain' },
      { name: 'currentProcessingService', width: 130 },
      { name: 'statementsStatusMeaning', width: 130 },
      { name: 'invoiceBillStatusMeaning', width: 130 },
      { name: 'cecFromCodeMeaning' },
      { name: 'statementsTime', width: 170 },
      { name: 'companyName' },
      { name: 'supplierName' },
    ];
  };
  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_EC_SETTLE_RECONCILIATION_EXPORT"
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
        requestUrl={`${SRM_DATA_SDRP}/v1/${organizationId}/e-commerce/report/settle-reconciliation/export`}
        allBody
        queryParams={() => {
          const selectList = ds.selected.map((m) => m.toData());
          const exportClassList = selectList.map((item) => ({
            statementsId: item.statementsId,
            ...(item.externalErrorId && { externalErrorId: item.externalErrorId }),
          }));
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
                exportClassList,
              }),
            };
          }
        }}
      />,
    ];
  });

  return (
    <Fragment>
      <Header title={intl.get('sdrp.settleReconciliation.title.report').d('电商对账全局查询')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SETTLE.RECONCILIATION_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SETTLE.RECONCILIATION_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode="SDRP.SETTLE.RECONCILIATION_REPORT.TABLE"
            searchBarConfig={{
              fieldProps: {
                billPushDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('billPushDate'))
                      ? [
                          moment().subtract(12, 'month').add(1, 'day'),
                          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        ]
                      : record.get('billPushDate'),
                },
              },
              editorProps: {
                billPushDate: {
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
    code: ['sdrp.settleReconciliation', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: [
      'SDRP.SETTLE.RECONCILIATION_REPORT.TABLE',
      'SDRP.SETTLE.RECONCILIATION_REPORT.SEARCH',
    ],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SETTLE.RECONCILIATION_REPORT.TABLE',
              'SDRP.SETTLE.RECONCILIATION_REPORT.SEARCH',
            ],
          })
        ),
      };
    },
    {
      cacheState: true,
    }
  )
)(SettleReconciliationReport);
