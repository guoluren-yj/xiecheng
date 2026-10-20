import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withProps from 'utils/withProps';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import moment from 'moment';

import intl from 'utils/intl';
import { SRM_DATA_SDRP } from '@/utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import ReportDs from './ds';

function ReportTest(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'orderTypeName', width: 130 },
      { name: 'rcvStatusCodeMeaning', width: 130 },
      { name: 'nodeConfigName', width: 130 },
      { name: 'returnedFlagMeaning', width: 130 },
      { name: 'rcvTypeName' },
      { name: 'billMatchedFlag', width: 130 },
      { name: 'invoiceMatchedStatus' },
      { name: 'paymentStatus' },
      { name: 'remark', width: 130 },
      { name: 'fromPcHeaderAndLineNum', width: 130, align: 'right' },
      { name: 'fromDisplayPoHeaderAndLineNum', width: 180 },
      { name: 'companyName' },
      { name: 'supplierCompanyName' },
      { name: 'displayTrxHeaderAndLineNum', width: 200 },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'uomName' },
      { name: 'quantity', width: 130, align: 'right' },
      { name: 'needByDate', width: 180 },
      { name: 'trxDate', width: 180 },
      { name: 'differenceDeliveryDays', width: 130, align: 'right' },
      { name: 'netPrice', width: 130, align: 'right' },
      { name: 'taxRate', width: 130, align: 'right' },
      { name: 'taxIncludedPrice', width: 130, align: 'right' },
      { name: 'taxIncludedAmount', width: 130, align: 'right' },
      { name: 'sumOssrtlQuantity', width: 180, align: 'right' },
      { name: 'unSumOssrtlQuantity', width: 180, align: 'right' },
      { name: 'sumSsslQuantity', width: 180, align: 'right' },
      { name: 'unSumSsslQuantity', width: 180, align: 'right' },
      { name: 'sumSsslTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'unSumSsslTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'ssslPaymentAmount', width: 180, align: 'right' },
      { name: 'unSsslPaymentAmount', width: 180, align: 'right' },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_SDRP_SPUC_SINV_GOODS_ARRIVE_EXPORT"
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
        }}
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.arrivalWork.button.export').d('导出')
            : intl.get('sdrp.arrivalWork.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/spuc/report/sinv-goods-arrive/export`}
        allBody
        queryParams={() => {
          const rcvTrxLineIds = ds.selected?.map((m) => m.get('rcvTrxLineId'));
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
                rcvTrxLineIds,
                peSuppliers: queryParam?.peSuppliers?.split(','),
              }),
            };
          }
        }}
      />,
    ];
  });

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'trxDate') {
      record.set('trxDate', value);
    }
  };

  const onQueryValidate = (value) => {
    const Arr = value.params.trxDate_range?.split(',');

    // 选择了范围 配合冻结 必输
    if (Arr) {
      const startDate = moment(Arr[0]);
      const endDate = moment(Arr[1]); // 增加1s

      if (endDate.diff(startDate, 'years') >= 1) {
        notification.error({
          message: intl
            .get('sdrp.common.searchBar.tips')
            .d('请修改查询时间条件，最大查询时间范围不能超过1年'),
        });
      } else if (ds.queryDataSet) {
        ds.queryDataSet.loadData([value.params]);
        // 缓存
        ds.query();
      }
    }
  };
  return (
    <Fragment>
      <Header title={intl.get('sdrp.arrivalWork.title.arrivalWork').d('收货执行跟踪报表')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: onQueryValidate,
              onFieldChange: handleFieldChange,
              fieldProps: {
                trxDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('trxDate'))
                      ? [
                          moment().subtract(12, 'month').add(1, 'day'),
                          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        ]
                      : record.get('trxDate'),
                },
              },
              editorProps: { calcDate: { clearButton: false } },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.arrivalWork', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: [
      'SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.TABLE',
      'SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.SEARCH',
    ],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.TABLE',
              'SDRP.SPUC.SINV_GOODS_ARRIVE_REPORT.SEARCH',
            ],
          })
        ),
      };
    },
    {
      cacheState: true,
      // keepOriginDataSet: true,
    }
  )
)(ReportTest);
