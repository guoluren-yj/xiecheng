import React, { Component, Fragment } from 'react';
import { Table, DataSet, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId } from 'utils/utils';

import { tableDs } from './fieldsInitalValue';
import urgentImg from '@/assets/icon-expedited.svg';

const commonPrompt = 'sprm.common.model.common';
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

    const { doubleUintFlag } = props;
    const { SPRM, RFX } = doubleUintFlag || {};
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
    this.tableDataDs.setState('uomControl', SPRM || RFX || 0);
  }

  // 渲染状态列
  @Bind()
  isEnabledRender({ value }) {
    const btns = [];
    btns.push(yesOrNoRender(Number(value)));
    return btns;
  }

  render() {
    const { customizeTable, doubleUintFlag } = this.props;
    const columns = [
      {
        name: 'displayPrNum',
        width: 150,
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
        name: 'secondaryUomName',
        width: 100,
        renderer: ({ value, record }) => record.get('secondaryUomCodeAndName') || value,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
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
      },
      {
        name: 'uomCodeAndName',
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
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-applyToInquiry"
            attachmentUUID={value || undefined}
            tenantId={organizationId}
            viewOnly
            filePreview
          />
        ),
      },
    ];
    const { SPRM, RFX } = doubleUintFlag || {};
    const baseUomInfo =
      SPRM === 1 || RFX === 1
        ? []
        : ['secondaryUomName', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];

    return (
      <Fragment>
        <div>
          {customizeTable(
            {
              code: 'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_LIST',
              filterCode: 'SPRM.PURCHASE_REQUISITION_POLL.QUOTEAPPROVAL_FILTER',
              lovIgnore: false,
              queryLovIgnore: false,
            },
            <Table
              dataSet={this.tableDataDs}
              columns={columns.filter((ele) => !baseUomInfo.includes(ele.name))}
            />
          )}
        </div>
      </Fragment>
    );
  }
}
