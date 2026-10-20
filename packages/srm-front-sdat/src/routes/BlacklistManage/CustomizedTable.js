import React from 'react';
import moment from 'moment';
import intl from 'utils/intl';
import { Table, DateTimePicker } from 'choerodon-ui/pro';
// import { Popconfirm } from 'choerodon-ui';
import { Button as PermissionButton } from 'components/Permission';

export default function CustomizedTable(props) {
  const {
    removeOrgPmn,
    editOrgPmn,
    saveOrgPmn,
    viewMapPmn,
    handleRemove,
    handleEdit,
    handleSave,
    handleCancel,
    blackListDs,
    customizeTable,
    isSubscribe,
    isMapTab,
    history,
  } = props;

  /**
   * 查看企业图谱
   */
  const viewBusinessMap = (record) => {
    if (record.get('dataId')) {
      history.push(`/sdat/risk-blacklist-manage/map/${record.get('dataId')}`);
    }
  };
/**
   * 改变结束时间
   *
   */
  const handleChangeEndTime = (value, record) => {
    if (!value) {
      record.set('endTime', null);
    } else {
      record.set('endTime', moment(value).format('YYYY-MM-DD HH:mm:ss'));
    }
  };

  const enterpriseBlacklistColumns = [
    {
      name: 'enterpriseName',
      width: 150,
      lock: 'left',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'socialCode',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'orgNo',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'businessNo',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'dunsNumber',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'businessStatus',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'address',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'phone',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'email',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'website',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'link',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'remark',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'userName',
      width: 150,
    },
    {
      name: 'addTime',
      width: 150,
    },
    {
      name: 'endTime',
      width: 150,
      renderer: ({ record }) => {
        if (!record.getState('editing')) {
          if (record.get('endTime')) {
            return moment(record.get('endTime')).format('YYYY-MM-DD HH:mm:ss');
          } else {
            return intl.get('sdat.supplierBlacklistManage.view.message.longActive').d('长期有效');
          }
        } else {
          return (
            <DateTimePicker
              value={record.get('endTime')}
              onChange={(e) => handleChangeEndTime(e, record)}
            />
          );
        }
      },
    },
    {
      name: 'updateTime',
      width: 150,
      hidden: !isSubscribe,
    },
    {
      name: 'graphEndTime',
      width: 150,
      hidden: !isSubscribe,
    },
    {
      name: 'operate',
      width: 150,
      lock: 'right',
      renderer: ({ record }) => (
        <>
          {!record?.getState('editing') && (
            <PermissionButton
              permissionList={[{ code: removeOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
              onClick={() => handleRemove(record)}
            >
              {intl.get('hzero.common.button.remove').d('移除')}
            </PermissionButton>
          )}
          {!record?.getState('editing') ? (
            <PermissionButton
              onClick={() => {
                handleEdit(record);
              }}
              permissionList={[{ code: editOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.view.button.edit').d('编辑')}
            </PermissionButton>
          ) : (
            <PermissionButton
              onClick={() => {
                handleSave(record);
              }}
              permissionList={[{ code: saveOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.model.save').d('保存')}
            </PermissionButton>
          )}
          {record?.getState('editing') && (
            <a
              style={{ marginRight: '16px' }}
              onClick={() => {
                handleCancel(record);
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          )}
        </>
      ),
    },
  ];

  const blacklistMapColumns = [
    {
      name: 'enterpriseName',
      width: 150,
      lock: 'left',
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'socialCode',
      width: 150,
      // editor: (record) => record.getState('editing'),
    },
    {
      name: 'businessStatus',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'address',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'website',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'link',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'phone',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'email',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'remark',
      width: 150,
      editor: (record) => record.getState('editing'),
    },
    {
      name: 'userName',
      width: 150,
    },
    {
      name: 'addTime',
      width: 180,
    },
    {
      name: 'endTime',
      width: 150,
      renderer: ({ record }) => {
        if (!record.getState('editing')) {
          if (record.get('endTime')) {
            return moment(record.get('endTime')).format('YYYY-MM-DD HH:mm:ss');
          } else {
            return intl.get('sdat.supplierBlacklistManage.view.message.longActive').d('长期有效');
          }
        } else {
          return (
            <DateTimePicker
              value={record.get('endTime')}
              onChange={(e) => handleChangeEndTime(e, record)}
            />
          );
        }
      },
    },
    {
      name: 'operate',
      width: 220,
      lock: 'right',
      renderer: ({ record }) => (
        <>
          {!record?.getState('editing') && (
            <PermissionButton
              permissionList={[{ code: removeOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
              onClick={() => handleRemove(record)}
            >
              {intl.get('hzero.common.button.remove').d('移除')}
            </PermissionButton>
          )}
          {!record?.getState('editing') ? (
            <PermissionButton
              onClick={() => {
                handleEdit(record);
              }}
              permissionList={[{ code: editOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.view.button.edit').d('编辑')}
            </PermissionButton>
          ) : (
            <PermissionButton
              onClick={() => {
                handleSave(record);
              }}
              permissionList={[{ code: saveOrgPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.model.save').d('保存')}
            </PermissionButton>
          )}
          {record?.getState('editing') && (
            <a
              style={{ marginRight: '16px' }}
              onClick={() => {
                handleCancel(record);
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          )}
          {!record?.getState('editing') && (
            <PermissionButton
              onClick={() => viewBusinessMap(record)}
              permissionList={[{ code: viewMapPmn }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
            >
              {intl.get('sdat.supplierBlacklistManage.view.button.businessMap').d('企业图谱')}
            </PermissionButton>
          )}
        </>
      ),
    },
  ];

  const columns = isMapTab ? blacklistMapColumns : enterpriseBlacklistColumns;
  const customizeUnitCode = isMapTab
    ? 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_MAP_BXJD'
    : 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_BXJD';

  return (
    <React.Fragment>
      {customizeTable &&
        customizeTable(
          { code: customizeUnitCode },
          <Table
            dataSet={blackListDs}
            columns={columns}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 50 }}
            customizable
            columnDraggable
          />
        )}
    </React.Fragment>
  );
}
