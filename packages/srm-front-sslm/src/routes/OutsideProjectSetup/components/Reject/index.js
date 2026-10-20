import React from 'react';
import { omit } from 'lodash';
import { Alert } from 'choerodon-ui';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import GeneralForm from '@/routes/components/GeneralForm';
import { rejectApplication } from '@/services/outsideProjectSetupService';
import styles from '../../Detail/index.less';

const Reject = ({ data }) => {
  const openModal = () => {
    const fields = [
      {
        name: 'rejectRemark',
        required: true,
        componentType: 'TEXTAREA',
        label: intl.get('sslm.outsideProjectSetup.modal.reason').d('拒绝原因'),
      },
    ];
    const formDs = new DataSet({ autoCreate: true, fields });

    const formProps = {
      columns: 1,
      isEdit: true,
      dataSet: formDs,
      fields: fields.map(field => omit(field, ['label'])),
    };
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: '380px' },
      title: intl.get('sslm.outsideProjectSetup.modal.reason').d('拒绝原因'),
      children: (
        <>
          <Alert
            banner
            type="info"
            iconType="help"
            message={intl
              .get('sslm.outsideProjectSetup.modal.reject.Tip')
              .d('拒绝后供应商不可再次报价，如需还价可联系供应商协商后再次报价')}
            className={styles['form-alert']}
          />
          <GeneralForm {...formProps} />
        </>
      ),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      onOk: async () => {
        return new Promise(async resolve => {
          const validateFlag = await formDs.validate();
          if (validateFlag) {
            rejectApplication({ ...data, ...formDs.current?.toJSONData() })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  resolve();
                }
              })
              .finally(() => {
                resolve(false);
              });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  return (
    <Button funcType="link" icon="cancel" onClick={openModal}>
      {intl.get('hzero.common.button.reject').d('拒绝')}
    </Button>
  );
};

export default Reject;
