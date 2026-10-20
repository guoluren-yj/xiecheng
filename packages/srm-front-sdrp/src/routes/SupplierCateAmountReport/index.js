import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import ExcelExportPro from 'components/ExcelExportPro';
import moment from 'moment';
import intl from 'utils/intl';
import { SRM_DATA_SDRP } from '@/utils/config';

import ReportDs from './ds';

function ReportTest(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'companyName' },
      { name: 'supplierNum', width: 130 },
      { name: 'supplierCompanyNum', width: 130 },
      { name: 'supplierCompanyName', width: 130 },
      { name: 'supplierComapanyCategory' },
      { name: 'stageDescription', width: 130 },
      { name: 'registeredAddress', width: 250 },
      { name: 'addressDetail', width: 150 },
      { name: 'name' },
      { name: 'mobilephone', width: 130 },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'sumPoTaxAmount', align: 'right' },
      { name: 'sumPoQuantity', align: 'right' },
      { name: 'sumSinvTaxAmount', align: 'right' },
      { name: 'sumSinvQuantity', align: 'right' },
      { name: 'sumSinvReQuantity', align: 'right' },
      { name: 'sumSinvReTaxAmount', align: 'right' },
      { name: 'sumPoQuantityLast', width: 150, align: 'right' },
      { name: 'sumPoTaxAmountLast', width: 150, align: 'right' },
      { name: 'sumSinvQuantityLast', width: 150, align: 'right' },
      { name: 'sumSinvTaxAmountLast', width: 150, align: 'right' },
      { name: 'sumPoTaxAmountSub', width: 150, align: 'right' },
      { name: 'sumPoTaxAmountSubRatio', width: 150, align: 'right' },
      { name: 'sumSinvTaxAmountSub', width: 150, align: 'right' },
      { name: 'sumSinvTaxAmountSubRatio', width: 150, align: 'right' },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        templateCode="SRM_C_SDRP_SSLM_CATE_AMOUNT_EXPORT"
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
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/supplier/report/category-amount-export`}
        allBody
        queryParams={() => {
          const partnerIds = ds.selected.map((m) => m.get('partnerId'));
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
                partnerIds,
                peSuppliers: queryParam?.peSuppliers?.split(','),
              }),
            };
          }
        }}
      />,
    ];
  });

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'calcDate') {
      record.set('calcDate', value);
    }
  };

  const onQueryValidate = (value) => {
    const Arr = value.params.calcDate_range?.split(',');

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
      <Header title={intl.get('sdrp.reportTest.title.reportTest').d('报表测试')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SUPPLIER.CATE_AMOUNT_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SUPPLIER.CATE_AMOUNT_REPORT.SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: onQueryValidate,
              onFieldChange: handleFieldChange,
              fieldProps: {
                calcDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('calcDate'))
                      ? [
                          moment().subtract(12, 'month').add(1, 'day'),
                          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        ]
                      : record.get('calcDate'),
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
    code: ['sdrp.suppierCate', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: ['SDRP.SUPPLIER.CATE_AMOUNT_REPORT.TABLE', 'SDRP.SUPPLIER.CATE_AMOUNT_REPORT.SEARCH'],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SUPPLIER.CATE_AMOUNT_REPORT.TABLE',
              'SDRP.SUPPLIER.CATE_AMOUNT_REPORT.SEARCH',
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
