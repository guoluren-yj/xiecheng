/**
 * 附件组件
 */
import React, { memo, useContext } from 'react';
import { Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import CollapseForm from '_components/CollapseForm';

import { StoreContext } from '../store/StoreProvider';

const organizationId = getCurrentOrganizationId();

function AttachmentGroup() {
  const {
    bidFlag,
    detailFlag,
    commonDs: { headerDs },
    customizeCollapseForm = noop,
  } = useContext(StoreContext);
  return customizeCollapseForm(
    {
      code: bidFlag
        ? 'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT'
        : 'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT',
      dataSet: headerDs,
      showLines: 2,
      readOnly: detailFlag,
      labelLayout: detailFlag ? 'vertical' : 'float',
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      labelLayout={detailFlag ? 'vertical' : 'float'}
      showLines={2}
    >
      <Attachment
        readOnly={detailFlag}
        name="checkAttachmentUuid"
        // labelLayout="float"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="ssrc-rfx-quotationline"
        fileSize={FIlESIZE}
        data={{
          tenantId: organizationId,
        }}
        dataSet={headerDs}
        {...ChunkUploadProps}
      />
    </CollapseForm>
  );
}

export default memo(observer(AttachmentGroup));
