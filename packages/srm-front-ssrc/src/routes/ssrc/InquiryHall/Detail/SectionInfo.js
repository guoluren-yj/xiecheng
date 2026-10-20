import React, { Component } from 'react';
import { Table, Modal, CheckBox } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import SectionItemDetail from './SectionItemDetail';

export default class SectionInfo extends Component {
  @Bind()
  viewItemDetail(record) {
    const {
      header,
      rfxId,
      rfxInfoDS,
      custLoading,
      customizeTable,
      organizationId,
      linktoPrNumDetail,
      showQuotationDetail,
      viewLadderLevelPrepare,
      rfx = {},
      doubleUnitFlag = false,
      disabledAllLinkFlag,
      biddingUnitPrice,
      judgeNewBiddingFlag,
    } = this.props;
    const sectionItemDetailProps = {
      rfxId,
      record,
      header,
      rfxInfoDS,
      custLoading,
      doubleUnitFlag,
      customizeTable,
      organizationId,
      linktoPrNumDetail,
      showQuotationDetail,
      viewLadderLevelPrepare,
      rfx,
      disabledAllLinkFlag,
      biddingUnitPrice,
      judgeNewBiddingFlag,
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.viewItemDetail').d('查看物料'),
      children: <SectionItemDetail {...sectionItemDetailProps} />,
      closable: true,
      drawer: true,
      style: { width: '70%' },
      footer: (okBtn) => <div>{okBtn}</div>,
      okText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
    });
  }

  render() {
    const { customizeTable, sectionInfoDS, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    const columns = [
      {
        name: 'createSourceFlag',
        width: 100,
        align: 'left',
        renderer: ({ value }) => {
          return <CheckBox defaultChecked={value} disabled />;
        },
      },
      {
        name: 'sectionCode',
        width: 200,
      },
      {
        name: 'sectionName',
        width: 200,
      },
      {
        name: 'viewItemDetail',
        width: 200,
        renderer: ({ record }) => (
          <a onClick={() => this.viewItemDetail(record.toData())}>
            {`${intl
              .get('ssrc.inquiryHall.model.inquiryHall.viewItemDetail')
              .d('查看物料')}(${record.get('projectItemCount')})`}
          </a>
        ),
      },
      {
        name: 'sectionRemark',
        width: 200,
      },
      {
        name: 'sectionEstimatedAmount',
        width: 200,
      },
      {
        name: 'sectionAttachmentUuid',
        width: 150,
        renderer: ({ value }) => (
          <Upload
            filePreview
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={value}
            // tenantId={organizationId}
          />
        ),
      },
    ];
    return customizeTable(
      { code: `SSRC.${unitCodeSymbol}_DETAIL.SECTION_ITEM` },
      <Table dataSet={sectionInfoDS} columns={columns} pagination={false} />
    );
  }
}
