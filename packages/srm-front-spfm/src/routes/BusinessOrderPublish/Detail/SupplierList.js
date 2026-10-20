import React, { Component } from 'react';
import { Table, Spin } from 'choerodon-ui/pro';

import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { isFunction } from 'lodash';

@withCustomize({
  unitCode: ['SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE'],
})
export default class categoryCodeModal extends Component {
  render() {
    const {
      loading,
      disabledFlg,
      readOnlyFlag,
      supplierDs,
      customizeTable,
      editorCuxFlagFc,
      notificationStatus,
    } = this.props;
    const columns = [
      {
        name: 'supplierCompanyCode',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'contactId',
        width: 150,
        editor: (record) => isFunction(editorCuxFlagFc) ? editorCuxFlagFc(record, notificationStatus) : !disabledFlg && !readOnlyFlag,
        renderer: disabledFlg || readOnlyFlag ? ({ record }) => record.get('contactName') : undefined,
      },
      {
        name: 'contactPhone',
        width: 150,
      },
      {
        name: 'contactEmail',
        width: 200,
      },
      {
        name: 'receiveFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'receiveDate',
        width: 150,
        render: (val) => dateTimeRender(val)
      },
      {
        name: 'requireAttachmentFlag',
        width: 150,
        editor: (record) => isFunction(editorCuxFlagFc) ? editorCuxFlagFc(record, notificationStatus) : !disabledFlg && !readOnlyFlag,
        // renderer: disabledFlg ?  ({ value }) => yesOrNoRender(Number(value)) : undefined,
      },
      {
        name: 'receivesAttachmentUuid',
        width: 150,
      },
    ];

    return (
      <React.Fragment>
        <Spin spinning={loading || false}>
          {customizeTable(
            {
              code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.DETAIL.TABLE',
              dataSet: supplierDs,
              readOnly: readOnlyFlag,
            },
            <Table
              style={{ maxHeight: '550px' }}
              dataSet={supplierDs}
              columns={columns}
              buttons={[]}
              virtual
              virtualCell
              virtualSpin={loading}
              loading={loading}
            />
          )}
        </Spin>
      </React.Fragment>
    );
  }
}
