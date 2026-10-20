import React from 'react';
import { Form, Output, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

const BasicInfo = observer((props) => {
  const { basicFormDs, customizeForm, getCustomizeUnitCode, viewType } = props;

  return (
    <React.Fragment>
      {customizeForm(
        {
          code: getCustomizeUnitCode('base', viewType),
          dataSet: basicFormDs,
        },
        <Form dataSet={basicFormDs} columns={3} labelLayout="float" useWidthPercent>
          <Output name="rfTitle" />
          {/* <Output name="rfNum1" hidden /> */}
          {/* <Output name="rfName" hidden /> */}
          <Output name="adjustRemark" />
          <Attachment
            readOnly
            viewMode="popup"
            label={intl.get(`ssrc.rfDetail.view.message.attachment`).d('附件')}
            name="adjustAttachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-adjust"
            data={{
              tenantId: getCurrentOrganizationId(),
            }}
          />
        </Form>
      )}
    </React.Fragment>
  );
});

export default BasicInfo;
