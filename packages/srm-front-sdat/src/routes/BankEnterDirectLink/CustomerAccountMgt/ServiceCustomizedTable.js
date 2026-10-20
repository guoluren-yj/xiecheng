import React from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
// import { fetchChangeStatus } from '@/services/bankEnterDirectLink/customerAccountService';
import { getResponse } from '@/utils/utils';

import ServiceEditModal from './ServiceEditModal';
// import styles from './index.less';

export default function ServiceCustomizedTable({ listDS, customizeTable, detailDS }) {
  // const handleChangeStatus = async (rcd) => {
  //   const obj = rcd?.toData() ?? {};
  //   await fetchChangeStatus({ ...obj, enabledFlag: ['1', 1].includes(obj?.enabledFlag) ? '0' : '1' });
  //   listDS.query();
  // };

  const handleEdit = (record) => {
    let modal = null;

    const sceneConfigId = record?.get('sceneConfigId') ?? '';

    if (sceneConfigId) {
      detailDS.setQueryParameter('sceneConfigId', sceneConfigId);
      detailDS.query();
    }

    const handleCloseModal = () => {
      detailDS.reset();
      detailDS.loadData([]);
      modal.close();
    };

    const handleCreate = async () => {
      const isValid = await detailDS.validate();

      const rcd = detailDS?.current ?? {};

      if (isValid) {
        if (rcd.dirty === false) {
          // 数据未发生修改
          handleCloseModal();
          return;
        }

        const res = await detailDS.submit();
        if (getResponse(res)) {
          handleCloseModal();
          listDS.query();
        }
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.customerAccount.view.title.editServiceConfig').d('编辑服务信息配置'),
      children: <ServiceEditModal detailDS={detailDS} localRecord={{ sceneConfigId }} />,
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const columns = () => {
    return [
      // {
      //   name: 'tenantNum',
      // },
      // {
      //   name: 'tenantName',
      // },
      {
        name: 'sceneCode',
      },
      {
        name: 'description',
      },
      // {
      //   name: 'salt',
      // },
      {
        name: 'lastUpdateDate',
      },
      {
        name: 'updateUser',
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        width: 280,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  return (
    <>
      {customizeTable &&
        customizeTable(
          { code: 'SDAT.SERVICE_CONFIG_MGT' },
          <Table
            dataSet={listDS}
            columns={columns()}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            columnDraggable
            customizedCode="SDAT.SERVICE_CONFIG_MGT_CUSTOM"
          />
        )}
    </>
  );
}
