import React, { Fragment } from 'react';
import { Attachment, } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import CollapseForm from '_components/CollapseForm';

export default function Attachments(props = {}) {
  const {
    customizeCollapseForm = noop,
    basicFormDS,
    viewOnly = true,
    getCustomizeUnitCode = noop,
    custLoading,
  } = props;

  return (
    <Fragment>
      <div>
        {customizeCollapseForm(
          {
            code: getCustomizeUnitCode('attachment'),
            dataSet: basicFormDS,
          },
          <CollapseForm
            dataSet={basicFormDS}
            labelLayout="float"
            // layout="none"
            showLines={1}
            columns={2}
            custLoading={custLoading}
            firstShowFields={['checkAttachmentUuid']}
            useWidthPercent
            // wrapperClassName={Styles['ssrc-attachment-only-collapse-form-wrap']}
          >
            <Attachment name="checkAttachmentUuid" readOnly={viewOnly} />
          </CollapseForm>
        )}
      </div>
    </Fragment>
  );
}
