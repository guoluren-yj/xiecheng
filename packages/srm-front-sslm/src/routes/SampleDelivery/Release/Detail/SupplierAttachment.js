/*
 * @Date: 2021-10-26 15:24:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import { DataSet, Table, Switch } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useCallback, useEffect } from 'react';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { listLineDS } from '../stores/supplierAttachmentDS';

const AttachUpload = ({ match }) => {
  const reqId = useMemo(() => match.params.reqId, []);
  const reqStatus = useMemo(() => match.params.reqStatus, []);
  const sampleId = useMemo(() => match.params.sampleId, []);
  const tableDs = useMemo(() => new DataSet(listLineDS()), []);
  const isPub = useMemo(() => match.path.includes('/pub/'), []);

  const isDisable = reqStatus === 'RELEASE_APPROVING';

  const columns = [
    {
      name: 'attachmentType',
      width: 200,
      editor: !isDisable,
    },
    {
      name: 'requiredFlag',
      width: 180,
      editor: () => !isDisable && <Switch />,
    },
    {
      name: 'attachmentDesc',
      width: 120,
      editor: !isDisable,
    },
  ];

  useEffect(() => {
    tableDs.setQueryParameter('sampleId', sampleId);
    tableDs.query();
  }, []);

  const handleAdd = useCallback(() => {
    const currentRow = tableDs.current;
    currentRow.set('sampleId', sampleId);
  }, []);

  const buttons = isDisable ? [] : [['add', { afterClick: handleAdd }], 'save', 'delete'];

  return (
    <Fragment>
      <Header
        title={intl.get(`sslm.sample.model.sample.supplierUpload`).d('指定供应商附件')}
        backPath={
          isPub
            ? `/pub/sslm/buyer-apply-release/detail/${reqId}/${reqStatus}`
            : `/sslm/buyer-apply-release/detail/${reqId}/${reqStatus}`
        }
      />
      <Content>
        <Table
          dataSet={tableDs}
          columns={columns}
          queryFieldsLimit={3}
          data={[]}
          buttons={buttons}
        />
      </Content>
    </Fragment>
  );
};

export default compose(formatterCollections({ code: ['sslm.sample'] }))(AttachUpload);
