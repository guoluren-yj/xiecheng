import React, { memo } from 'react';
import { Attachment, Output } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';

// import intl from 'utils/intl';

import CollapseForm from '_components/CollapseForm';

const PrequalForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = () => {},
  } = props;

  // render long text
  const tooltipRender = (value = '') => {
    return <Tooltip title={value || '-'}>{value || '-'}</Tooltip>;
  };

  return (
    <div>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('prequalForm'),
          dataSet: basicFormDS,
          labelLayout: 'vertical',
        },
        <CollapseForm
          dataSet={basicFormDS}
          showLines={1}
          columns={3}
          custLoading={custLoading}
          firstShowFields={['prequalEndDate', 'prequalAttachmentUuid', 'prequalRemark']}
          useWidthPercent
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="prequalEndDate" />
          <Output
            name="prequalAttachmentUuid"
            renderer={({ record }) => {
              return (
                <Attachment
                  name="prequalAttachmentUuid"
                  readOnly
                  record={record}
                  viewMode="popup"
                />
              );
            }}
          />
          <Output name="prequalRemark" renderer={({ value }) => tooltipRender(value)} />
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(PrequalForm);
