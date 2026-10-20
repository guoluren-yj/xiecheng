/**
 * 分发租户
 */
import React, { useEffect } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import { fetchRemoveTenant } from '@/services/cardManageService';

export default function DistribModal(props) {
  const { distribTableDS, localRecord } = props;

  useEffect(() => {
    if (localRecord) {
      distribTableDS.setQueryParameter('id', localRecord?.get('id') ?? '');
      distribTableDS.query();
    }
  }, [localRecord]);

  /**
   * 删除操作
   * @param {*} record
   */
  const handleRemove = (record) => {
    // const obj = record.toData();
    // fetchRemoveTenant(obj).then(res => {
    //   if(getResponse(res)){
    //     distribTableDS.query();
    //   }
    // });
    distribTableDS.delete([record]).then((res) => {
      if (getResponse(res)) {
        distribTableDS.query();
      }
    });
  };

  /**
   * 新增行
   */
  const handleAddRow = () => {
    distribTableDS.create({});
  };

  const columns = () => {
    return [
      {
        header: intl.get('sdat.cardsManage.view.title.serialNumber').d('序号'),
        name: 'serialNumber',
        renderer: ({ record }) => {
          const { currentPage, pageSize } = distribTableDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'tenantObj',
        editor: true,
      },
      { name: 'tenantObj' },
      {
        header: intl.get('hzero.common.title.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              {
                <a onClick={() => handleRemove(record)}>
                  {intl.get('hzero.common.button.enter').d('删除')}
                </a>
              }
            </span>
          );
        },
      },
    ];
  };

  const buttons = () => {
    return [
      <Button funcType="link" icon="add" onClick={handleAddRow}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
    ];
  };

  return (
    <>
      <Table
        dataSet={distribTableDS}
        columns={columns()}
        buttons={buttons()}
        queryFieldsLimit={2}
      />
    </>
  );
}
