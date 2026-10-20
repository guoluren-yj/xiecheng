import React, { Component, Fragment } from 'react';
import { Table, DataSet, Tooltip, DatePicker } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { tableDs } from './fieldsInitalValue';
import { thousandBitSeparator } from '@/routes/utils.js';
import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_FILTER',
    'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_LIST',
  ],
})
export default class TransferContract extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    const { doubleUintFlag } = props;
    const { SPRM, SPCM } = doubleUintFlag || {};
    this.tableDataDs = new DataSet({
      ...tableDs(),
      events: {
        load: ({ dataSet }) => {
          const { totalCount } = dataSet;
          const { updatePage } = this.props;
          updatePage(totalCount, 'contractDate');
        },
      },
    });
    this.tableDataDs.setState('uomControl', SPRM || SPCM || 0);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'contract';
  }

  render() {
    const { customizeTable, doubleUintFlag } = this.props;
    const columns = [
      {
        name: 'prNum',
        width: 160,
        fixed: 'left',
        renderer: ({ text, record }) => (
          <div className="row-agent-column">
            {text}
            {record.get('urgentFlag') === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        name: 'lineNum',
        width: 100,
        fixed: 'left',
      },
      {
        name: 'itemCode',
        fixed: 'left',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 120,
        renderer: ({ value, record }) =>
          thousandBitSeparator(value, record.get('financialPrecision')),
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 100,
        renderer: ({ value, record }) =>
          thousandBitSeparator(value, record.get('financialPrecision')),
      },
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
        renderer: ({ value, record }) => record.get('uomCodeAndName') || value,
      },
      {
        name: 'quantity',
        width: 100,
      },
      {
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
      },
      //   title: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
      {
        name: 'occupiedQuantity',
        width: 100,
        renderer: ({ record }) => record.get('availableQuantity'),
      },
      {
        name: 'executionStatusCodeMeaning',
        width: 150,
      },
      {
        name: 'reqTypeCode',
        width: 140,
      },
      {
        name: 'supplierCode',
        width: 120,
      },
      {
        name: 'supplierName',
        width: 160,
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'ouName',
        width: 140,
      },
      {
        name: 'purchaseOrgName',
        width: 160,
      },
      {
        name: 'agentName',
        width: 160,
      },
      {
        name: 'invOrganizationName',
        width: 160,
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
        width: 160,
      },
      {
        name: 'prRequestedName',
        width: 160,
      },
      // {
      //   name: 'contactTelNum',
      //   width: 160,
      // },
      {
        name: 'invoiceAddress',
        width: 160,
      },
      {
        name: 'neededDate',
        width: 120,
      },
      // {
      //   name: 'companyOrgName',
      //   width: 120,
      // },
      // {
      //   name: 'costAnchDepDesc',
      //   width: 160,
      // },
      // {
      //   name: 'expBearDep',
      //   width: 160,
      // },
      {
        name: 'locationMeaning',
        width: 160,
      },
      {
        name: 'projectNum',
        width: 160,
      },
      {
        name: 'projectName',
        width: 160,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 160,
      },
      {
        name: 'urgentFlag',
        width: 160,
      },
      {
        name: 'urgentDate',
      },
      {
        name: 'creationDate',
        width: 160,
      },
    ];

    const { SPRM, SPCM } = doubleUintFlag || {};
    const baseUomInfo =
      SPRM === 1 || SPCM === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    return (
      <Fragment>
        <div>
          {customizeTable(
            {
              code: 'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_LIST',
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.CONTRACT_FILTER',
              lovIgnore: false,
              queryLovIgnore: false,
            },
            <Table
              dataSet={this.tableDataDs}
              columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
              style={{ maxHeight: 400 }}
              queryFields={{
                createdDateEnd: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDataDs.queryDataSet}
                    defaultTime={moment('23:59:59', 'HH:mm:ss')}
                  />
                ),
                neededDateEnd: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDataDs.queryDataSet}
                    defaultTime={moment('23:59:59', 'HH:mm:ss')}
                  />
                ),
              }}
            />
          )}
        </div>
      </Fragment>
    );
  }
}
