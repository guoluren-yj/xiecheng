import React from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl/index.js';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import GeneralForm from '@/routes/components/GeneralForm';
import { buildPartner } from '@/services/outsideProjectSetupService';
import { dsProps, formFields } from './utils';

const Cooper = ({ tableDs, curFormDs, basicDs, currentTab, handleTabsQuery }) => {
  const openModal = () => {
    if (currentTab.partnerFlag) {
      notification.warning({
        message: intl
          .get('sslm.outsideProjectSetup.model.cooperation.cooperationMsg')
          .d('该供应商与当前公司已存在合作关系，无需再次建立合作伙伴关系'),
      });
      return;
    }
    const { companyId, companyName } = basicDs?.current?.toData();
    const {
      realName,
      companyContactId,
      supplierCompanyId,
      supplierCompanyName,
    } = curFormDs?.current?.toData();
    const formDs = new DataSet(dsProps());

    formDs.create({
      supplierCompanyId: {
        supplierCompanyId,
        supplierCompanyName,
      },
      salesPersonIdsLov: {
        id: companyContactId,
        realName,
      },
      companyIdLov: {
        companyId,
        companyName,
      },
    });

    const formProps = {
      columns: 2,
      dataSet: formDs,
      fields: formFields,
      isEdit: true,
    };
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: '742px' },
      title: intl.get('sslm.outsideProjectSetup.modal.cooperation').d('建立合作'),
      children: <GeneralForm {...formProps} />,
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const validateFlag = await formDs.validate();
        let closeFlag = validateFlag;
        if (validateFlag) {
          // 合作弹框数据
          const cooperatFormData = formDs.current?.toJSONData();
          // 外层表单数据
          const curFormData = curFormDs.current?.toData();
          // 外层表格数据
          const tableData = tableDs.toData();
          const params = {
            ...curFormData,
            ...cooperatFormData,
            itemQuatoInfos: tableData,
          };
          await buildPartner(params).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              handleTabsQuery();
              closeFlag = true;
            }
          });
        }
        return closeFlag;
      },
    });
  };

  return (
    <Button funcType="flat" icon="add_task-o" onClick={openModal}>
      {intl.get('sslm.outsideProjectSetup.modal.cooperation').d('建立合作')}
    </Button>
  );
};

export default Cooper;
