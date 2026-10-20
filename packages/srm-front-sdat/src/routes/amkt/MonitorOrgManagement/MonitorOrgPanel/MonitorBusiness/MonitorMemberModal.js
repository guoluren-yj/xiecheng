/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Table, Button, Lov, DataSet, Modal } from 'choerodon-ui/pro';

import { getResponse } from '@/utils/utils';
import { fetchSaveMonitor, fetchRemoveList } from '@/services/monitorOrgManagementService';

export default function MonitorMemberModal(props) {
  const { dataSet, socialCode, enterpriseName } = props;

  const ds = React.useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'memberObj',
            type: 'object',
            lovCode: 'SDAT.WORK_PLACE_USER_LIST',
            noCache: true,
            required: true,
            multiple: true,
            lovQueryAxiosConfig: () => {
              return {
                url: `/iam/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging?asyncCountFlag=DEFAULT`,
                method: 'POST',
              };
            },
          },
        ],
      }),
    []
  );

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    dataSet.addEventListener('select', selectEvent);
    dataSet.addEventListener('unSelect', selectEvent);
    dataSet.addEventListener('selectAll', selectEvent);
    dataSet.addEventListener('unSelectAll', selectEvent);
    return () => {
      dataSet.removeEventListener('select', selectEvent);
      dataSet.removeEventListener('unSelect', selectEvent);
      dataSet.removeEventListener('selectAll', selectEvent);
      dataSet.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const columns = () => {
    return [{ name: 'loginName' }, { name: 'userName' }];
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (dataSet.selected.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('sdat.monitorOrgManagement.view.message.deleteListConfirm')
              .d('是否确认删除已选择的列表')}
          </div>
        ),
      }).then((button) => {
        if (button === 'cancel') return;
        const list = dataSet.selected.map((rcd) => rcd.toData());
        // 把其他行重置
        fetchRemoveList({
          socialCode,
          enterpriseName,
          userList: list,
        }).then((res) => {
          if (getResponse(res)) {
            dataSet.query();
          }
        });
      });
    }
  };

  const handleSelectMember = async (list = []) => {
    if (list.length) {
      const arr = list.map((item) => {
        return {
          userId: item?.get('id') ?? '',
          userName: item?.get('loginName') ?? '',
          loginName: item?.get('loginName') ?? '',
          realName: item?.get('realName') ?? '',
        };
      });

      const res = await fetchSaveMonitor({
        socialCode,
        enterpriseName,
        userList: arr,
      });
      if (getResponse(res)) {
        dataSet.query();
      } else {
        return false;
      }
    }
  };

  const buttons = () => {
    return [
      <Lov
        dataSet={ds}
        name="memberObj"
        mode="button"
        viewMode="drawer"
        clearButton={false}
        icon="playlist_add"
        onBeforeSelect={handleSelectMember}
        // onChange={handleSelectMember}
        modalProps={{
          title: intl.get('sdat.monitorOrgManagement.view.title.selectMonitor').d('选择监控员'),
          bodyStyle: {
            borderTop: '0.01rem solid #e0e0e0',
            borderBottom: '0.01rem solid #e0e0e0',
          },
        }}
      >
        {intl.get('hzero.common.button.add').d('添加')}
      </Lov>,
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        disabled={!dataSet.selected.length}
        onClick={handleBatchDelete}
      >
        {intl.get('hzero.common.button.batchDelete').d('删除')}
      </Button>,
    ];
  };

  return (
    <div style={{ height: 'calc(100vh - 186px)' }}>
      <Table
        dataSet={dataSet}
        columns={columns()}
        queryBar="none"
        buttons={buttons()}
        autoHeight={{ type: 'maxHeight', diff: 40 }}
      />
    </div>
  );
}
