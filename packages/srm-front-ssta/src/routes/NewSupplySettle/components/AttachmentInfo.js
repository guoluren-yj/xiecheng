/*
 * @Description: file content
 * @Date: 2022-02-09 11:21:02
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useContext } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import commonStyles from '@/routes/common.less';
import { Store } from '../Detail/StoreProvider';

export default () => {
  const { updateFlag, documentType, customizeForm, settleHeaderDs, remoteProps } = useContext(
    Store
  );

  return customizeForm(
    {
      code:
        documentType === 'INVOICE'
          ? 'SSTA.SUPPLY_SETTLE_DETAIL.ENCLOSURE'
          : 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE',
    },
    <Form
      columns={2}
      useColon={false}
      dataSet={settleHeaderDs}
      labelLayout={updateFlag ? 'float' : 'vertical'}
    >
      <Attachment
        name="attachmentUuid"
        showHistory={!updateFlag}
        labelLayout="float"
        readOnly={!updateFlag}
        bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
        bucketDirectory="ssta-settle-header"
        fieldClassName={commonStyles['attachment-float-wrapper']}
      />
      {remoteProps &&
        remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_CUX_ATTACHMENT_INFO', '', {
          formDs: settleHeaderDs,
          updateFlag,
          documentType,
        })}
    </Form>
  );
};
