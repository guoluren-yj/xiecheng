import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withProps from 'utils/withProps';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
import { SRM_DATA_SDRP } from '@/utils/config';
import notification from 'utils/notification';
import moment from 'moment';

import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import ReportDs from './ds';

function ReportTest(props) {
  const { ds, customizeTable } = props;
  const getColumns = () => {
    return [
      { name: 'rfxNum', width: 180 },
      { name: 'rfxLineItemNum', width: 180 },
      { name: 'rfxTitle', width: 180 },
      { name: 'rfxStatusMeaning', width: 180 },
      { name: 'creationDate' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'supplierCompanyNum', width: 180 },
      { name: 'supplierCompanyName', width: 180 },
      { name: 'companyName', width: 180 },
      { name: 'organizationName', width: 120 },
      { name: 'invOrganizationName' },
      { name: 'purchaseAgentName', width: 180 },
      { name: 'realName', width: 180 },
      { name: 'quotationStartDate', width: 180 },
      { name: 'quotationEndDate', width: 180 },
      { name: 'rfxQuantity', width: 180, align: 'right' },
      { name: 'validQuotationPrice', width: 180, align: 'right' },
      { name: 'minTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'minTaxIncludedPriceAndPoNumLineNum', width: 180 },
      { name: 'maxTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'maxTaxIncludedPriceAndPoNumLineNum', width: 180 },
      { name: 'avgTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'domesticTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'poNumLineNum', width: 180 },
      { name: 'poDiffPrice', width: 180, align: 'right' },
      { name: 'poDiffAmount', width: 180, align: 'right' },
      { name: 'plMinTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'plMinPoNumLineNum', width: 180 },
      { name: 'plMaxTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'plMaxPoNumLineNum', width: 180 },
      { name: 'plAvgTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'taxIncludedPrice', width: 180, align: 'right' },
      { name: 'plPoNumLineNum', width: 180 },
      { name: 'plDiffPrice', width: 180, align: 'right' },
      { name: 'plDiffAmount', width: 180, align: 'right' },
    ];
  };

  const ObserverBtns = observer(() => {
    return [
      <ExcelExportPro
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        }}
        templateCode="SRM_C_PRICE_INQUIRY_QUOTATION_QUERY_EXPORT"
        exportAsync
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.common.button.export').d('导出')
            : intl.get('sdrp.common.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/price/report/inquiryQuotationPrice/export`}
        allBody
        queryParams={() => {
          const quotationLineIdList = ds.selected?.map((m) => m.get('quotationLineId'));
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
                quotationLineIdList,
              }),
            };
          }
        }}
      />,
    ];
  });

  const onQueryValidate = (value) => {
    const Arr = value.params.creationDate_range?.split(',');

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

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDate') {
      record.set('creationDate', value);
    }
    if (name === 'priceDate') {
      record.set('priceDate', value);
    }
  };
  return (
    <Fragment>
      <Header title={intl.get('sdrp.inquiry.title.track.export').d('询报价与历史价格高级查询')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.SEARCHBAR"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchBarConfig={{
              onQuery: onQueryValidate,
              onFieldChange: handleFieldChange,
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
                priceDate: {
                  required: true,
                  defaultValue: ({ record }) =>
                    isNil(record.get('priceDate'))
                      ? [moment().startOf('year'), moment(new Date()).format('YYYY-MM-DD HH:mm:ss')]
                      : record.get('priceDate'),
                },
              },
              editorProps: {
                creationDate: { clearButton: false },
                priceDate: { clearButton: false },
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
    code: ['sdrp.inquiry', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: [
      'SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.TABLE',
      'SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.SEARCHBAR',
    ],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: [
              'SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.TABLE',
              'SDRP.SMBL.INQUIRY_AND_HISTORICAL_PRICES.SEARCHBAR',
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
