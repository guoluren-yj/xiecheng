import React, { Fragment } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import DocFlow from '_components/DocFlow';
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
      { name: 'poNum', width: 180 },
      { name: 'displayPoNum', width: 180 },
      { name: 'orderTypeName', width: 180 },
      { name: 'termName', width: 180 },
      { name: 'sourceBillTypeCodeMeaning' },
      { name: 'poSourcePlatformMeaning' },
      { name: 'headerRemark' },
      { name: 'createdByName' },
      { name: 'unitCode', width: 180 },
      { name: 'unitName', width: 180 },
      { name: 'creationDate', width: 180 },
      { name: 'statusCodeMeaning', width: 120 },
      { name: 'syncStatusMeaning' },
      { name: 'companyName', width: 180 },
      { name: 'organizationName' },
      { name: 'supplierCompanyName' },
      { name: 'settleSupplierId', width: 180 },
      { name: 'agentName' },
      { name: 'displayLineNum', width: 180 },
      { name: 'displayStatusMeaning', width: 180 },
      { name: 'freeFlagMeaning', width: 180 },
      { name: 'projectCategory' },
      { name: 'returnedFlagMeaning' },
      { name: 'promiseDeliveryDate', width: 180 },
      { name: 'accountAssignTypeName' },
      { name: 'costIdForExport', width: 180 },
      { name: 'wbsCodeName', width: 180 },
      { name: 'itemName' },
      { name: 'specifications' },
      { name: 'model' },
      { name: 'eanCode' },
      { name: 'l1CategoryName' },
      { name: 'l2CategoryName' },
      { name: 'l3CategoryName' },
      { name: 'quantity', align: 'right' },
      { name: 'uomName' },
      { name: 'rate', align: 'right' },
      { name: 'unitPriceBatch', align: 'right' },
      { name: 'currencyCode' },
      { name: 'unitPrice', width: 180, align: 'right' },
      { name: 'enteredTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'lineAmount', width: 180, align: 'right' },
      { name: 'taxIncludedLineAmount', width: 180, align: 'right' },
      { name: 'domesticCurrencyCode', width: 180 },
      { name: 'baseCurrencyCode', width: 180 },
      { name: 'domesticUnitPrice', width: 180, align: 'right' },
      { name: 'domesticTaxIncludedPrice', width: 180, align: 'right' },
      { name: 'domesticLineAmount', width: 180, align: 'right' },
      { name: 'domesticTaxIncludedLineAmount', width: 180, align: 'right' },
      { name: 'receiveToleranceQuantity', width: 180, align: 'right' },
      { name: 'sumOssrtlQuantity', width: 180, align: 'right' },
      { name: 'unSumOssrtlQuantity', width: 180, align: 'right' },
      { name: 'sumSsslQuantity', width: 180, align: 'right' },
      { name: 'unSumSsslQuantity', width: 180, align: 'right' },
      { name: 'sumSsslTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'unSumSsslTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'submitSumSplPrepaymentAmount', width: 180, align: 'right' },
      { name: 'sumSplPrepaymentAmount', width: 180, align: 'right' },
      { name: 'sumSplPrepaymentApplyAmount', width: 180, align: 'right' },
      { name: 'ssslPaymentAmount', width: 180, align: 'right' },
      { name: 'unSsslPaymentAmount', width: 180, align: 'right' },
      { name: 'billTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'unBillTaxIncludedAmount', width: 180, align: 'right' },
      { name: 'sourceNumAndLine', width: 180 },
      { name: 'contractNum', width: 180 },
      { name: 'displayPrNum', width: 180 },
      { name: 'displayPrLineNum', width: 180 },
      { name: 'requestName' },
      { name: 'shipToThirdPartyAddress' },
      { name: 'shipToThirdPartyContact' },
      { name: 'priceSource' },
      { name: 'priceSourceNumAndLine', width: 180 },
      { name: 'lineRemark' },
      { name: 'needByDate' },
      { name: 'startDateActive', width: 180 },
      { name: 'endDateActive', width: 180 },
      { name: 'assigneeName' },
      { name: 'ahtEndTime' },
      { name: 'latestTrxDate', width: 180 },
      {
        name: 'docFlow',
        renderer: ({ record }) => {
          return (
            <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
          );
        },
      },
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
        templateCode="SRM_C_SPUC_PO_LINE_TRACK_EXPORT"
        exportAsync
        buttonText={
          ds?.selected.length === 0
            ? intl.get('sdrp.common.button.export').d('导出')
            : intl.get('sdrp.common.button.selectExport').d('勾选导出')
        }
        method="POST"
        requestUrl={`${SRM_DATA_SDRP}/v1/${getCurrentOrganizationId()}/spuc/report/po-line-track/export`}
        allBody
        queryParams={() => {
          const poLineLocationIds = ds.selected?.map((m) => m.get('poLineLocationId'));
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
                poLineLocationIds,
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
  };
  return (
    <Fragment>
      <Header title={intl.get('sdrp.poLine.title.track.export').d('采购订单明细追踪报表')}>
        <ObserverBtns />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SPUC.PO_LINE_TRACK.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={getColumns()}
            searchCode="SDRP.SPUC.PO_LINE_TRACK.SERACH"
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
              },
              editorProps: { creationDate: { clearButton: false } },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.poLine', 'sdrp.common', 'hzero.common'],
  }),
  c7nCustomize({
    unitCode: ['SDRP.SPUC.PO_LINE_TRACK.TABLE', 'SDRP.SPUC.PO_LINE_TRACK.SERACH'],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            customizeUnitCodes: ['SDRP.SPUC.PO_LINE_TRACK.TABLE', 'SDRP.SPUC.PO_LINE_TRACK.SERACH'],
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
