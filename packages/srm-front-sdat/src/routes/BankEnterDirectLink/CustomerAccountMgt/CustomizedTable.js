import React from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { fetchChangeStatus } from '@/services/bankEnterDirectLink/customerAccountService';
import { getResponse } from '@/utils/utils';

import EditModal from './EditModal';
import styles from './index.less';

export default function CustomizedTable({ listDS, customizeTable, detailDS }) {
  const handleChangeStatus = async (rcd) => {
    const obj = rcd?.toData() ?? {};
    await fetchChangeStatus([{ ...obj, enabledFlag: obj?.enabledFlag === '1' ? '0' : '1' }]);
    listDS.query();
  };

  const handleEdit = (record) => {
    let modal = null;

    const configId = record?.get('configId') ?? '';
    if (configId) {
      detailDS.setQueryParameter('configId', configId);
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

        detailDS.submit().then((res) => {
          if (getResponse(res)) {
            handleCloseModal();
            listDS.query();
          }
        });
      }
    };

    modal = Modal.open({
      title: intl
        .get('sdat.customerAccount.view.title.editTenantInterface')
        .d('编辑租户接口调用信息'),
      children: <EditModal detailDS={detailDS} localRecord={{ configId }} />,
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

  const classMap = {
    1: styles['tag-enabled'],
    0: styles['tag-disabled'],
  };

  const columns = () => {
    return [
      {
        name: 'tenantNum',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'host',
        width: 300,
      },
      {
        name: 'enabledFlag',
        renderer: ({ text, record }) => {
          const val = record?.get('enabledFlag') ?? '';
          const classes = classMap[val];
          return <span className={classes}>{text}</span>;
        },
      },
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
          const enabledFlag = record?.get('enabledFlag') ?? '';
          return (
            <span className="action-link">
              <a onClick={() => handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {[1, '1'].includes(enabledFlag) ? (
                <a onClick={() => handleChangeStatus(record)}>
                  {intl.get('sdat.customerAccount.view.button.disabled').d('禁用')}
                </a>
              ) : (
                <a onClick={() => handleChangeStatus(record)}>
                  {intl.get('sdat.customerAccount.view.button.enabled').d('启用')}
                </a>
              )}
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
          { code: 'SDAT.CUSTOMER_ACCOUNT_MGT' },
          <Table
            dataSet={listDS}
            columns={columns()}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            columnDraggable
            customizedCode="SDAT.CUSTOMER_ACCOUNT_MGT_CUSTOM"
          />
        )}
    </>
  );
}
