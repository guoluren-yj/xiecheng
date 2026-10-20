import React, { useContext } from 'react';
import { Form, Attachment, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { INQUIRY } from '@/utils/globalVariable';
import intl from 'utils/intl';
import { StoreContext } from './../store/StoreProvider';
import styles from './index.less';

const AttachmentForm = observer((props = {}) => {
  const { contentLoading = false, headerInfo = {} } = useContext(StoreContext);
  const { tableAttachmentDs, sourceKey = INQUIRY, customizeForm } = props || {};

  const formProps = {
    dataSet: tableAttachmentDs,
    labelLayout: 'float',
    columns: 2,
  };
  return (
    <Spin spinning={contentLoading}>
      <div className={styles['content-table-title-second']}>
        <div className={styles['content-table-title-line']} />
        {intl.get('ssrc.common.model.common.attachment').d('附件')}
      </div>
      {customizeForm(
        {
          code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.TABLE_ATTACHMENT`,
          dataSet: tableAttachmentDs,
        },
        <Form {...formProps}>
          <Attachment name="businessAttachmentUuid" />
          <Attachment name="techAttachmentUuid" />
          <Attachment
            name="roundBusinessAttachmentUuid"
            hidden={
              headerInfo?.newQuotationFlag ||
              !tableAttachmentDs?.current?.get('roundBusinessAttachmentUuid')
            }
          />
          <Attachment
            name="roundTechAttachmentUuid"
            hidden={
              headerInfo?.newQuotationFlag ||
              !tableAttachmentDs?.current?.get('roundTechAttachmentUuid')
            }
          />
          <Attachment
            name="bargainBusinessAttachmentUuid"
            hidden={
              headerInfo?.newQuotationFlag ||
              !tableAttachmentDs?.current?.get('bargainBusinessAttachmentUuid')
            }
          />
          <Attachment
            name="bargainTechAttachmentUuid"
            hidden={
              headerInfo?.newQuotationFlag ||
              !tableAttachmentDs?.current?.get('bargainTechAttachmentUuid')
            }
          />
        </Form>
      )}
    </Spin>
  );
});

export default AttachmentForm;
