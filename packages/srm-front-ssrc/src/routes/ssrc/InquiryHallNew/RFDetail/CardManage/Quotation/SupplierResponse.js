/*
 * @Descripttion: 信息征询中--供应商响应情况
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-14 13:54:30
 * @LastEditors: yiping.liu
 */
import React, { useContext, useEffect, useMemo } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE } from '@/utils/SsrcRegx';
import Store from '../../store/index';

const organizationId = getCurrentOrganizationId();

const { Group } = Attachment;

const SupplierResponse = observer(() => {
  const {
    commonDs: { consultBasicFormDs, supplierResponseDs },
    routerParams: { sourceCategory },
    customizeTable,
  } = useContext(Store);

  useEffect(() => {
    supplierResponseDs.query();
  }, []);

  const openUploadModal = (record) => {
    return (
      <Group text={intl.get('hzero.common.upload.view').d('查看附件')}>
        <Attachment
          readOnly
          record={record}
          name="techAttachmentUuid"
          fileSize={FIlESIZE}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-prequal"
          data={{
            tenantId: organizationId,
          }}
        />
        <Attachment
          readOnly
          record={record}
          name="businessAttachmentUuid"
          fileSize={FIlESIZE}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-rfpheader"
          data={{
            tenantId: organizationId,
          }}
        />
      </Group>
    );
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'supplierCompanyNum',
          width: 150,
        },
        {
          name: 'supplierCompanyName',
          width: 200,
        },
        {
          name: 'feedbackStatusMeaning',
          width: 150,
        },
        {
          name: 'quotationStatusMeaning',
          renderer: ({ value, record }) =>
            record.get('feedbackStatus') === 'ABANDONED' ? <span>-</span> : value,
        },
        consultBasicFormDs?.current?.get('sealedQuotationFlag') === 0
          ? {
              name: 'supplierAttach',
              renderer: ({ record }) =>
                sourceCategory === 'RFP' ? (
                  openUploadModal(record)
                ) : (
                  <Attachment
                    readOnly
                    record={record}
                    viewMode="popup"
                    name="rfiAttachmentUuid"
                    fileSize={FIlESIZE}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfi-rfiheader"
                    data={{
                      tenantId: organizationId,
                    }}
                  />
                ),
            }
          : null,
        {
          name: 'contactName',
        },
        {
          name: 'contactPhone',
        },
        {
          name: 'contactMail',
        },
      ].filter(Boolean),
    [consultBasicFormDs?.current]
  );

  return customizeTable(
    {
      code: `SSRC.INQUIRY_HALL_RF_DETAIL.QUOTATION_SUPPLIER_${sourceCategory}`,
    },
    <Table dataSet={supplierResponseDs} columns={columns} />
  );
});

export default SupplierResponse;
