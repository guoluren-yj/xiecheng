import React, { Fragment } from 'react';
import { Attachment, } from 'choerodon-ui/pro';
import { noop } from 'lodash';
// import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';

// import PageStyles from '../index.less';

export default function Attachments(props) {
  const {
    customizeCollapseForm = noop,
    basicFormDS,
    viewOnly = false,
    getCustomizeUnitCode = noop,
    // isBidSectionData,
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
            useWidthPercent
          >
            <Attachment name="businessAttachmentUuid" readOnly={viewOnly} />
            <Attachment name="techAttachmentUuid" readOnly={viewOnly} />
          </CollapseForm>
        )}
      </div>
    </Fragment>
  );
}
