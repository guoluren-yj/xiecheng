import React from 'react';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';
import { Form, TextArea, Modal, DataSet } from 'choerodon-ui/pro';

export default (bidId, afterClose) => {
  const ds = () => ({
    selection: false,
    autoCreate: true,
    fields: [
      {
        name: 'closeReason',
        type: 'string',
        required: true,
      },
    ],
    transport: {
      submit: ({ data }) => {
        const datas = {
          processRemark: data[0].closeReason,
        };
        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/bid/${bidId}/close-bid`,
          method: 'POST',
          data: datas,
        };
      },
    },
  });

  const formDs = new DataSet(ds());

  Modal.open({
    title: intl.get('ssrc.bidHall.view.title.closeBid').d('招标关闭'),
    destroyOnClose: true,
    closable: true,
    drawer: true,
    key: Modal.key(),
    children: (
      <React.Fragment>
        <Form dataSet={formDs}>
          <TextArea
            name="closeReason"
            placeholder={intl.get('ssrc.bidHall.modal.closeReason').d('关闭理由')}
            resize
          />
        </Form>
      </React.Fragment>
    ),
    onOk: async () => {
      const validate = await formDs.validate();
      if (!validate) {
        return false;
      }
      formDs
        .submit()
        .then(() => {
          afterClose();
        })
        .catch(() => {});
    },
  });
};
