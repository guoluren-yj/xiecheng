import React, { Fragment, useMemo, useEffect } from 'react';
import { Table, Form, DataSet, Output } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { formatAumont } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

export default compose(formatterCollections({ code: ['ssrc.inquiryHall'] }))((props) => {
  const { modal, record } = props;
  const { sourceLineItemId } = record.get(['sourceLineItemId']);
  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        selection: false,
        paging: false,
        fields: [
          {
            label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
            name: 'rfxLadderLineNum',
          },
          {
            label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
            name: 'ladderFrom',
          },
          {
            label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}(<)`,
            name: 'ladderTo',
          },
          {
            label: intl.get('hzero.common.remark').d('备注'),
            name: 'remark',
          },
        ],
        transport: {
          read() {
            return {
              url: `/ssrc/v1/${tenantId}/rfx/${sourceLineItemId}/ladder-inquiry`,
              method: 'get',
            };
          },
        },
      }),
    [sourceLineItemId]
  );
  const columns = useMemo(
    () => [
      {
        name: 'rfxLadderLineNum',
      },
      {
        name: 'ladderFrom',
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'ladderTo',
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'remark',
      },
    ],
    []
  );
  useEffect(() => {
    modal.update({
      title: intl.get(`ssrc.inquiryHall.view.message.title.ladderLevel`).d('阶梯等级'),
    });
  }, []);
  return (
    <Fragment>
      <Form record={record} columns={2}>
        <Output name="itemCode" />
        <Output name="itemName" />
      </Form>
      <Table dataSet={tableDs} columns={columns} />
    </Fragment>
  );
});
