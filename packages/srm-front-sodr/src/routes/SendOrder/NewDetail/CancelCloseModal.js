import React, { useContext } from 'react';
import { withRouter } from 'dva/router';
import { Form, TextArea, useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { throttle } from 'lodash';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { cancelOrder, closeOrder } from '@/services/orderCancel';
import { Store } from './stores';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const CancelCloseModal = function CancelCloseModal(props) {
  const { customizeForm, headerDs } = useContext(Store);
  const { modal, buttonType, history, personalizedCoding = '' } = props;
  const dataSet = useDataSet(
    () => ({
      autoCreate: true,
      fields: [
        {
          name: 'closeCancelRemark',
          required: true,
          label:
            buttonType === 'cancel'
              ? intl.get(`sodr.common.model.common.cancelReason`).d('取消原因')
              : intl.get(`sodr.common.model.common.closeReason`).d('关闭原因'),
        },
      ],
    }),
    []
  );
  modal.handleOk(
    throttle(
      async () => {
        const valid = await dataSet.validate();
        if (!valid) {
          return false;
        }
        headerDs.dataToJSON = 'all-self';
        const data = [
          {
            ...headerDs.current.toData(),
            ...dataSet.current.toData(),
            customizeUnitCode: personalizedCoding,
          },
        ];
        headerDs.dataToJSON = 'all';
        return (buttonType === 'cancel' ? cancelOrder(data) : closeOrder(data)).then((result) => {
          const res = getResponse(result);
          if (res) {
            const { successNum } = res;
            if (successNum === 1) {
              notification.success();
              history.push('/sodr/order-cancel/list');
            }
          }
        });
      },
      THROTTLE_TIME,
      { trailing: false }
    )
  );
  return customizeForm(
    {
      code: buttonType === 'cancel' ? personalizedCoding : '',
    },
    <Form dataSet={dataSet}>
      <TextArea name="closeCancelRemark" />
    </Form>
  );
};

export default withRouter(CancelCloseModal);
