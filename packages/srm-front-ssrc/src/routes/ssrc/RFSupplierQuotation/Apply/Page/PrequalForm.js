import React, { memo } from 'react';
import { Attachment, Output } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
// import classnames from 'classnames';
import { noop } from 'lodash';

import CollapseForm from '_components/CollapseForm';

// import PageStyles from '../index.less';

const PrequalForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = () => {},
    // isBidSectionData,
  } = props;

  // render long text
  const renderLongText = (value = '') => {
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
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          showLines={1}
          columns={3}
          custLoading={custLoading}
          firstShowFields={['prequalEndDate', 'prequalAttachmentUuid', 'prequalRemark']}
          useWidthPercent
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
                  funcType="link"
                />
              );
            }}
          />
          <Output name="prequalRemark" renderer={({ value }) => renderLongText(value)} />
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(PrequalForm);
