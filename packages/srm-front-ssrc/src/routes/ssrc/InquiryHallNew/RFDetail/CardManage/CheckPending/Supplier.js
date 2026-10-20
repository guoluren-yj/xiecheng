import React, { useMemo, useContext, useEffect } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import Store from '../../store/index';
// import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const { Group } = Attachment;

export default function RfItemLineCard() {
  const {
    routerParams: { sourceCategory, setPath = '' },
    commonDs: { supplierDs },
    customizeTable,
    remote,
  } = useContext(Store);

  useEffect(() => {
    supplierDs.query();
  }, []);

  const openUploadModal = (record) => {
    return (
      <Group text={intl.get('hzero.common.upload.view').d('查看附件')}>
        <Attachment
          readOnly
          labelLayout="float"
          sortable={false}
          record={record}
          fileSize={FIlESIZE}
          label={intl.get('ssrc.rf.view.card.subtitle.techAttach').d('技术组附件')}
          name="techAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-prequal"
          data={{
            tenantId: organizationId,
          }}
        />
        <Attachment
          readOnly
          labelLayout="float"
          sortable={false}
          record={record}
          fileSize={FIlESIZE}
          label={intl.get('ssrc.rf.view.card.subtitle.businessAttach').d('商务组附件')}
          name="businessAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-rfpheader"
          data={{
            tenantId: organizationId,
          }}
        />
      </Group>
    );
  };

  const columns = useMemo(() => {
    const column = [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'quotationContent',
      },
      {
        name: 'supplierAttach',
        header: intl.get(`ssrc.rfDetail.model.rfDetail.supplierAttach`).d('供应商附件'),
        width: 120,
        // editor: sourceCategory !== 'RFP',
        renderer: ({ record }) =>
          sourceCategory === 'RFP' ? (
            openUploadModal(record)
          ) : (
            // <div className={styles['check-attachment']}>
            <Attachment
              readOnly
              viewMode="popup"
              sortable={false}
              record={record}
              fileSize={FIlESIZE}
              label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
              name="rfiAttachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfi-rfiheader"
              funcType="link"
              data={{
                tenantId: getCurrentOrganizationId(),
              }}
            />
            // </div>
          ),
      },
      {
        name: 'suggestedFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'suggestedRemark',
        width: 220,
      },
      {
        name: 'suggestedAttachmentUuid',
        header: intl.get(`ssrc.rfDetail.model.rfDetail.attachmentUuid`).d('附件'),
        width: 120,
        editor: true,
        renderer: ({ record }) => (
          // <div className={styles['suggest-attachment']}>
          <Attachment
            readOnly
            viewMode="popup"
            sortable={false}
            record={record}
            fileSize={FIlESIZE}
            label={intl.get(`ssrc.rf.view.message.readAttachment`).d('查看附件')}
            name="suggestedAttachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-rfitem"
            data={{
              tenantId: getCurrentOrganizationId(),
            }}
          />
          // </div>
        ),
      },
    ];
    if (!remote) return column;
    return remote.process('SSRC_INQUIRY_DETAIL_RF_PROCESS_CHECK_PENDING_SUPPLIER_TABLE', column, {
      sourceCategory,
      pubFlag: setPath.indexOf('/pub/') > -1,
    });
  }, [sourceCategory, remote, setPath]);

  const cuzProps = {
    code: `SSRC.INQUIRY_HALL_RF_DETAIL.CHECK_SUPPLIER_QUO_${sourceCategory}`,
    readOnly: true,
  };

  const cuzTableProps = remote
    ? remote.process(
        'SSRC_INQUIRY_DETAIL_RF_PROCESS_CHECK_PENDING_SUPPLIER_CUZ_TABLE_PROPS',
        cuzProps,
        { sourceCategory }
      )
    : cuzProps;

  return customizeTable(cuzTableProps, <Table dataSet={supplierDs} columns={columns} />);
}
