import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Icon, Form, Lov, TextField } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

const BatchEdit = (props) => {
  const { dataSet, tableDs, initData = {} } = props || {};

  useEffect(() => {
    dataSet.loadData([initData]);
  }, [initData, dataSet]);

  return (
    <div>
      <div
        style={{
          margin: '-20px -20px 20px',
          background: 'rgb(230, 242, 253)',
          padding: '10px 24px',
          fontSize: '13px',
          color: 'rgb(48, 145, 242)',
        }}
      >
        <Icon type="icon icon-help" />
        &nbsp;&nbsp;
        {isEmpty(tableDs?.selected)
          ? intl
              .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
              .d('针对全部数据进行批量编辑')
          : intl
              .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                length: tableDs?.selected?.length,
              })
              .d(`已勾选${tableDs?.selected?.length}条数据进行批量编辑`)}
      </div>
      <Form columns={1} labelLayout="float" dataSet={dataSet}>
        <Lov name="companyId" />
        <Lov name="ouId" />
        <Lov name="purOrganizationId" />
        <Lov name="purchaserId" />
        <Lov name="invOrganizationId" />
        <Lov name="inventoryId" />
        <Lov name="locationId" />
        <TextField name="receivingContactName" />
        <TextField name="receivingMobile" />
        <TextField name="address" />
        <Lov name="expandCompany" />
        <Lov name="expandInvOrganization" />
      </Form>
    </div>
  );
};

export default observer(BatchEdit);
