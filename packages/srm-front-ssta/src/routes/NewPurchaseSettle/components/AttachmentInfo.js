/*
 * @Description: file content
 * @Date: 2022-02-09 11:21:02
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useContext, useMemo } from 'react';
import { Form, Attachment } from 'choerodon-ui/pro';

import commonStyles from '@/routes/common.less';
import { Store } from '../Detail/StoreProvider';

export default () => {
  const {
    updateFlag,
    documentType,
    customizeForm,
    settleHeaderDs,
    readOnlyFlag,
    editableFlowFlag,
    remoteProps,
    notPub,
    isReadOnly,
  } = useContext(Store);

  const cuszReadonlyFlag = useMemo(() => {
    const flag = readOnlyFlag && !editableFlowFlag;
    return remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_CUX_ATTACHMENT_READONLY', flag, {
          notPub,
          isReadOnly,
          settleHeaderDs,
          readOnlyFlag,
          editableFlowFlag,
        })
      : flag;
  }, [readOnlyFlag, editableFlowFlag, notPub, isReadOnly, remoteProps]);

  return customizeForm(
    {
      code:
        documentType === 'INVOICE'
          ? 'SSTA.PURCHASE_SETTLE_DETAIL.ENCLOSURE'
          : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE',
      readOnly: cuszReadonlyFlag,
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
        remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_CUX_ATTACHMENT_INFO', '', {
          formDs: settleHeaderDs,
          updateFlag,
          documentType,
        })}
    </Form>
  );
};
