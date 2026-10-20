import React, { Component, Fragment } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId } from 'utils/utils';

import { tableDs } from './fieldsInitalValue';

const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['sprm.common', 'smdm.common'],
})
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_LIST',
    'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_FILTER',
  ],
})
export default class PartsRecDemandPool extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.tableDataDs = new DataSet({
      ...tableDs(),
      events: {
        load: ({ dataSet }) => {
          const { totalCount } = dataSet;
          const { updatePage } = this.props;
          updatePage(totalCount, 'quoteApproval');
        },
      },
    });
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.activeKey === 'order';
  }

  render() {
    const { customizeTable } = this.props;
    const columns = [
      {
        name: 'displayPrNum',
        width: 150,
      },
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'commonName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 130,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'occupiedQuantity',
        width: 140,
        renderer: ({ value, record }) => {
          const {
            data: { quantity = 0 },
          } = record;
          return <span>{quantity - value}</span>;
        },
      },
      {
        name: 'uomName',
        width: 80,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'neededDate',
        width: 170,
      },
      {
        name: 'prRequestedName',
        width: 130,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'unitName',
        width: 120,
      },
      {
        name: 'requestDate',
        width: 170,
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 130,
      },
      {
        name: 'assignedDate',
        width: 170,
      },
      // {
      //   name: 'drawingNum',
      //   width: 130,
      // },
      // {
      //   name: 'drawingVersion',
      //   width: 120,
      // },
      {
        name: 'surfaceTreatFlag',
        width: 100,
        renderer: this.isEnabledRender,
      },
      {
        name: 'supplierItemCode',
        width: 120,
      },
      {
        name: 'supplierItemNumDesc',
        width: 120,
      },
      {
        name: 'projectCategoryMeaning',
        width: 150,
      },
      {
        name: 'prTypeName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 140,
        renderer: ({ value }) => (
          <Upload
            bucketName="private-bucket"
            bucketDirectory="ssrc-rfx-applyToInquiry"
            attachmentUUID={value || undefined}
            tenantId={organizationId}
            viewOnly
            filePreview
          />
        ),
      },
    ];

    return (
      <Fragment>
        <div style={{ height: 500 }}>
          {customizeTable(
            {
              code: 'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_LIST',
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_FILTER',
            },
            <Table dataSet={this.tableDataDs} columns={columns} autoHeight />
          )}
        </div>
      </Fragment>
    );
  }
}
