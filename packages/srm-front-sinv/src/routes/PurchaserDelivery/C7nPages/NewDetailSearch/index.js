import React, { Fragment } from 'react';
// import { Tag } from 'choerodon-ui';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { showBigNumber } from '@/routes/components/utils';
import moment from 'moment';
import { showUomText, handleBomRecord, colorRender, handleRelation } from '../../utils';

const DetailSearch = (props) => {
  const { ds, customizeTable, handleToDetail, history } = props;

  const columns = [
    {
      name: 'asnNum',
      width: 180,
      fixed: 'left',
      renderer: ({ value, record }) => <a onClick={() => handleToDetail(record)}>{value}</a>,
    },
    {
      name: 'displayAsnLineNum',
      width: 100,
      fixed: 'left',
      sortable: true,
    },
    {
      name: 'asnTypeCodeMeaning',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 110,
      sortable: true,
    },
    {
      name: 'itemName',
      width: 180,
    },
    {
      name: 'cancelledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'closedFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'displayPoNum',
      width: 180,
    },
    {
      name: 'displayReleaseNum',
      width: 120,
    },
    {
      name: 'displaylineNum',
      width: 120,
    },
    {
      name: 'displayLineLocationNum',
      width: 120,
    },
    {
      name: 'versionNum',
      width: 120,
    },
    {
      name: 'asnStatusMeaning',
      width: 130,
      renderer: ({ record }) => colorRender(record, 'asnStatus'),
    },
    {
      name: 'shipQuantity',
      width: 110,
      align: 'right',
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'grossWeightStandard',
      width: 120,
      align: 'right',
    },
    {
      name: 'netWeightStandard',
      width: 120,
      align: 'right',
    },
    {
      name: 'weightUomName',
      width: 120,
    },
    {
      name: 'receiveStatusMeaning',
      width: 110,
    },
    {
      name: 'receiveQuantity',
      width: 80,
      align: 'right',
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'uomName',
      width: 80,
      renderer: ({ record }) => showUomText(record, 'uomCode', 'uomName'),
    },
    {
      name: 'creationDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'shipDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'expectedArriveDate',
      width: 180,
      renderer: ({ value }) => dateTimeRender(value),
    },
    {
      name: 'neededDate',
      width: 150,
    },
    {
      name: 'promisedDate',
      width: 150,
    },
    {
      name: 'inventoryName',
      width: 100,
    },
    {
      name: 'locationName',
      width: 100,
    },
    {
      name: 'supplierSiteName',
      width: 150,
    },
    {
      name: 'purOrganizationName',
      width: 150,
    },
    {
      name: 'organizationName',
      width: 150,
    },
    {
      name: 'shipToLocationAddress',
      width: 150,
    },
    {
      name: 'purchaseAgentName',
      width: 80,
    },
    {
      name: 'contactInfo',
      width: 80,
    },
    {
      name: 'lotNum',
      width: 80,
    },
    {
      name: 'productionDate',
      width: 150,
    },
    {
      name: 'shelfLife',
      width: 80,
    },
    {
      name: 'lotExpirationDate',
      width: 140,
    },
    {
      name: 'unitPackageQuantity',
      width: 110,
      align: 'right',
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'packageQuantity',
      width: 80,
      align: 'right',

      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'remainderQuantity',
      width: 80,
      align: 'right',
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'serialNum',
      width: 80,
    },
    {
      name: 'invoiceNum',
      width: 80,
    },
    {
      name: 'supplierCompanyName',
      width: 120,
    },
    {
      name: 'companyName',
      width: 120,
    },
    {
      name: 'productNum',
      width: 120,
    },
    {
      name: 'productName',
      width: 120,
    },
    {
      name: 'catalogName',
      width: 120,
    },
    {
      name: 'oldItemCode',
      width: 110,
    },
    {
      name: 'purchaseRemark',
      width: 150,
    },
    {
      name: 'approveAttachmentUuid',
      width: 130,
    },
    {
      name: 'supplierRemark',
      width: 150,
    },
    {
      name: 'attachmentUuid',
      width: 130,
    },
    {
      name: 'bom',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => handleBomRecord(record)}>
          {intl.get(`hzero.common.button.view`).d('查看')}
        </a>
      ),
    },
    {
      name: 'customSpecsJson',
      width: 120,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
    {
      name: 'relation',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => handleRelation({ asnLineId: record.get('asnLineId'), history })}>
          {intl.get(`sinv.common.model.common.relationDanju`).d('关联单据')}
        </a>
      ),
    },
  ];

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: 'SINV.PURCHASER_DELIVERY_LIST.GRID_BY_DETAIL',
          },
          <SearchBarTable
            searchCode="SINV.PURCHASER_DELIVERY.SEARCH.DETAIL_SEARCH"
            cacheState
            dataSet={ds}
            columns={columns}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchBarConfig={{
              fieldDefaultValueType: 'custom',
              fieldProps: {
                creationDateFrom: {
                  defaultValue: () => moment().subtract(1, 'quarters'),
                },
                creationDateTo: {
                  defaultValue: () => moment(),
                },
              },
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default DetailSearch;
