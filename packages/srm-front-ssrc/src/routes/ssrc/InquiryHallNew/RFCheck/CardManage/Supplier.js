import React, { useMemo, useContext } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { Store } from '../store/index';

const organizationId = getCurrentOrganizationId();
const { Group } = Attachment;

export default observer(function SupplierCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { supplierDs, basicFormDs },
    customizeTable,
    remote,
  } = useContext(Store);

  const columns = useMemo(() => {
    const column = [
      basicFormDs?.current?.get('expertScoreType') === 'ONLINE' && {
        name: 'scoreRank',
        width: 100,
      },
      basicFormDs?.current?.get('expertScoreType') === 'ONLINE' && {
        name: 'score',
        width: 100,
        renderer: ({ value, record }) => record.get('sumPassStatus') || value,
      },
      basicFormDs?.current?.get('expertScoreType') === 'ONLINE' && {
        name: 'candidateFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
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
        header: intl.get(`ssrc.rfCheck.model.rfCheck.supplierAttach`).d('供应商附件'),
        width: 120,
        renderer: ({ record }) =>
          sourceCategory === 'RFP' ? (
            <Group>
              <Attachment
                readOnly
                labelLayout="float"
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
          ) : (
            <Group>
              <Attachment
                readOnly
                viewMode="popup"
                record={record}
                fileSize={FIlESIZE}
                label={intl.get('hzero.common.upload.view').d('查看附件')}
                name="rfiAttachmentUuid"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfi-rfiheader"
                data={{
                tenantId: organizationId,
              }}
              />
            </Group>
          ),
      },
      {
        name: 'suggestedFlag',
        editor: true,
        width: 120,
      },
      {
        name: 'suggestedRemark',
        editor: true,
        width: 220,
      },
      {
        name: 'suggestedAttachmentUuid',
        header: intl.get(`ssrc.rfCheck.model.rfCheck.attachmentUuid`).d('附件'),
        editor: true,
        // width: 120,
        // editor: (record) => (
        //   <Attachment
        //     viewMode="popup"
        //     record={record}
        //     fileSize={FIlESIZE}
        //     label={intl.get('hzero.common.upload.view').d('查看附件')}
        //     name="suggestedAttachmentUuid"
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="ssrc-rf-rfitem"
        //     data={{
        //       tenantId: organizationId,
        //     }}
        //   />
        // ),
      },
    ].filter(Boolean);
    if (!remote) return column;
    return remote.process('SSRC_RF_CHECK_PROCESS_SUPPLIER_TABLE', column);
  }, [sourceCategory, basicFormDs?.current?.get('expertScoreType'), remote]);

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL.RF_CHECK.SUPPLIER_QUO_${sourceCategory}`,
    },
    <Table dataSet={supplierDs} columns={columns} />
  );
});
