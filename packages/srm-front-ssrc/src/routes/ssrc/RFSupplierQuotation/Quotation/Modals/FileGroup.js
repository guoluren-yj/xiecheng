import { isNil } from 'lodash';
import React, { useMemo } from 'react';
import { Attachment, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const { Group } = Attachment;

const FileGroup = (props = {}) => {
  const {
    basicFormDS,
    // name,
    label = null,
    readOnly = true,
    text = intl
      .get(`ssrc.supplierQuotation.model.supQuo.companyNameAttachmentBusTec`)
      .d('客户商务/技术附件'),
    fileGroupProps = {},
  } = props || {};

  const { tenderFeeFlag, bidFileExpense } = basicFormDS.current
    ? basicFormDS.current.get(['tenderFeeFlag', 'bidFileExpense'])
    : {};

  const Common = useMemo(
    () => ({
      labelLayout: 'float',
      showHistory: true,
      readOnly,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
      ...(fileGroupProps || {}),
    }),
    [PRIVATE_BUCKET, fileGroupProps]
  );

  return tenderFeeFlag === 1 && !isNil(bidFileExpense) ? (
    <Output
      name="companyNameUuid"
      renderer={() => (
        <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
          {intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件')}
        </span>
      )}
    />
  ) : (
    <Group label={label} text={text}>
      <Attachment
        name="rfxBusinessAttachmentUuid"
        {...Common}
        dataSet={basicFormDS}
        label={intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件')}
      />
      <Attachment
        name="rfxTechAttachmentUuid"
        {...Common}
        dataSet={basicFormDS}
        label={intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件')}
      />
    </Group>
  );
};

export default observer(FileGroup);
