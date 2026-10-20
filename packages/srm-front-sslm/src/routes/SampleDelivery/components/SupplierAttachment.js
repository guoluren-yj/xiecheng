import { compose } from 'lodash';
import queryString from 'querystring';
import React, { Fragment, useMemo, useEffect, useCallback } from 'react';
import { DataSet, Table, Switch, notification } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';

import { supplierAttachmentDS } from '../stores/supplierAttachmentDS';

const organizationId = getCurrentOrganizationId();

const SupplierAttachment = ({ match, location = {} }) => {
  const tableDs = useMemo(() => new DataSet(supplierAttachmentDS()), []);
  const parsed = useMemo(() => queryString.parse(location.search.substr(1)), [location.search]);
  const sampleId = useMemo(() => match.params.sampleId, []);
  const isView = useMemo(() => JSON.parse(parsed.isView), [parsed.isView]);
  const { state: { backPath, title } = {} } = location;

  useEffect(() => {
    tableDs.setQueryParameter('sampleId', sampleId);
    tableDs.query();
  }, [sampleId]);

  const handleSave = useCallback(() => {
    tableDs.submit().then((res) => {
      if (res && res.failed === true) {
        notification.error({
          placement: 'bottomRight',
          message: res.message,
        });
      } else {
        notification.success({
          placement: 'bottomRight',
          message: intl.get('sslm.sample.view.message.optionSuccess').d('操作成功'),
        });
        tableDs.query();
      }
    });
  }, []);

  const columns = [
    {
      name: 'attachmentTypeMeaning',
      width: 200,
    },
    {
      name: 'requiredFlag',
      width: 200,
      editor: (record) => record.getState('editing') && <Switch />,
    },
    {
      name: 'attachmentDesc',
      width: 300,
    },
    {
      name: 'attachmentUuid',
      width: 180,
      renderer: ({ record }) => (
        <Upload
          viewOnly={isView}
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="sslm-deliver"
          attachmentUUID={record.get('attachmentUuid')}
          afterOpenUploadModal={(attUuid) => {
            record.set('attachmentUuid', attUuid);
          }}
          filePreview
          onCloseUploadModal={() => {
            if (!isView) {
              handleSave();
            }
          }}
        />
      ),
    },
  ];
  return (
    <Fragment>
      <Header title={title} backPath={backPath} />
      <Content>
        <Table dataSet={tableDs} columns={columns} queryFieldsLimit={3} data={[]} />
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample'],
  })
)(SupplierAttachment);
