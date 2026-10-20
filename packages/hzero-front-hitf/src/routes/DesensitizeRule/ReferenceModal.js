import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { referenceTableDS } from '@/stores/DesensitizeRule/DesensitizeRuleDS';
import { DATA_MAPPING_TAG_STATUS } from '@/constants/constants';

export default class ReferenceModal extends React.Component {
  constructor(props) {
    super(props);

    this.referenceTableDS = new DataSet(referenceTableDS());
  }

  componentDidMount() {
    const { desensitizeRuleId } = this.props;
    this.referenceTableDS.setQueryParameter('desensitizeRuleId', desensitizeRuleId);
    this.referenceTableDS.query();
  }

  get referenceColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'castCode',
        width: 150,
      },
      {
        name: 'castName',
      },
      {
        name: 'castRoot',
        width: 150,
      },
      {
        name: 'castField',
        width: 120,
      },
      {
        name: 'statusCode',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, DATA_MAPPING_TAG_STATUS, record.get('statusCodeMeaning')),
      },
    ];
  }

  render() {
    return <Table dataSet={this.referenceTableDS} columns={this.referenceColumns} />;
  }
}
