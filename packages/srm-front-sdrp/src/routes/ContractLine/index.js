import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { SRM_DATA_SDRP } from '@/utils/config';

import moment from 'moment';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';

import intl from 'utils/intl';
import ReportDs from './ds';

function ReportTest(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'organizationName' },
      { name: 'organizationCode', width: 130 },
      { name: 'companyNum', width: 130 },
      { name: 'companyName', width: 180 },
      { name: 'pcNum' },
      { name: 'pcName', width: 130 },
      { name: 'supplierName', width: 250 },
      { name: 'supplierNum', width: 130 },
      { name: 'realName' },
      { name: 'creationDate', width: 180 },
      { name: 'approvedDate', width: 180 },
      { name: 'confirmedDate', width: 180 },
      { name: 'signDate', width: 180 },
      { name: 'releaseDate', width: 180 },
      { name: 'submitDate', width: 180 },
      { name: 'archiveDate', width: 180 },
      { name: 'pcTypeName' },
      { name: 'currencyCode' },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'taxIncludeAmount', align: 'right' },
      { name: 'changeNumber', align: 'right' },
      { name: 'pcStatusCodeMeaning' },
      { name: 'pcKindCodeMeaning' },
      { name: 'startDateActive', width: 180 },
      { name: 'endDateActive', width: 180 },
      { name: 'pcSourceCodeMeaning' },
      { name: 'taxIncludedLineAmount', align: 'right' },
      { name: 'orderAmount', align: 'right' },
      { name: 'orderLineNums', align: 'right' },
      { name: 'acceptanceAmount', align: 'right' },
      { name: 'acceptanceLineNums', align: 'right', width: 130 },
      { name: 'acceptanceRate', align: 'right' },
      { name: 'invoiceAmount', align: 'right' },
      { name: 'invoiceLineNums', align: 'right', width: 130 },
      { name: 'paymentAmount', align: 'right' },
      { name: 'paymentLineNums', align: 'right', width: 130 },
      { name: 'contractStageNumber', align: 'right', width: 130 },
      { name: 'itemCode', align: 'right', width: 130 },
      { name: 'itemName', align: 'right', width: 130 },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_SDRP_PC_DETAILS_TRACKING_EXPORT"
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
        }}
        exportAsync
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.common.button.export').d('导出')
            : intl.get('sdrp.common.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/contract/report/contract-line/export`}
        allBody
        queryParams={() => {
          const pcSubjectIds = ds.selected.map((m) => m.get('pcSubjectId'));
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
                pcSubjectIds,
                peSuppliers: queryParam?.peSuppliers?.split(','),
              }),
            };
          }
        }}
      />,
    ];
  });
  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'signDate') {
      record.set('signDate', value);
    }
  };

  const onQueryValidate = (value) => {
    const Arr = value.params.signDate_range?.split(',');

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
      <Header title={intl.get('sdrp.contractLine.title.contractReport').d('合同明细履约跟踪报表')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: onQueryValidate,
              onFieldChange: handleFieldChange,
              fieldProps: {
                signDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('signDate'))
                      ? [
                          moment().subtract(12, 'month').add(1, 'day'),
                          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        ]
                      : record.get('signDate'),
                },
              },
              editorProps: { signDate: { clearButton: false } },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.contractLine', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: [
      'SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.TABLE',
      'SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.SEARCH',
    ],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.TABLE',
              'SDRP.SPCM.CONTRACT.LINE.TRACKING.REPORT.SEARCH',
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
