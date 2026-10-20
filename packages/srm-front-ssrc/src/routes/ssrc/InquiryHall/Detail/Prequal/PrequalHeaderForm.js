import React, { Component } from 'react';
import { Attachment, Output, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

@observer
export default class PrequalHeaderForm extends Component {
  @Bind()
  renderLovMultiText(value = null) {
    return <Tooltip title={value}>{value}</Tooltip>;
  }

  @Bind()
  preQualificationFields(ds) {
    const record = ds?.current || {};

    const Fields = [
      <Output name="prequalEndDate" title="aaaa" />,
      <Output name="reviewMethodMeaning" />,
      record?.get('reviewMethod') === 'LIMITED_QUANTITY' ? <Output name="qualifiedLimit" /> : null,
      <Output name="preGroupLeaderLov" />,
      <Output name="preGroupMemberLov" renderer={({ value }) => this.renderLovMultiText(value)} />,
      <Output name="enableScoreFlag" renderer={({ value }) => yesOrNoRender(value)} />,
      <Output name="prequalRemark" />,
      <Output name="prequalAttachmentUuid" />,
      <Attachment
        name="prequalAttachmentUuid"
        readOnly
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="ssrc-rfx-prequal"
        viewMode="popup"
      />,
    ].filter(Boolean);

    return Fields;
  }

  render() {
    const { customizeCollapseForm, preQualificationFormRef, rfx = {}, ds = {} } = this.props;
    const { unitCodeSymbol } = rfx || {};

    return (
      <div>
        {customizeCollapseForm(
          {
            code: `SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_PREQUAL`,
            dataSet: ds,
          },
          <CollapseForm
            formRef={preQualificationFormRef}
            dataSet={ds}
            labelLayout="vertical"
            showLines={2}
            columns={3}
            className="c7n-pro-vertical-form-display"
          >
            {this.preQualificationFields(ds)}
          </CollapseForm>
        )}
      </div>
    );
  }
}
