import React from 'react';
import intl from 'utils/intl';
import moment from 'moment';
import { Table, DateTimePicker } from 'choerodon-ui/pro';
// import { Popconfirm } from 'choerodon-ui';
import { Button as PermissionButton } from 'components/Permission';

export default function CustomizedTable(props) {
  const {
    // removeOrgPmn,
    // editOrgPmn,
    // saveOrgPmn,
    handleRemove,
    handleEdit,
    handleSave,
    handleCancel,
    blackListDs,
    customizeTable,
    isSubscribe,
    history,
  } = props;

  /**
   * 查看企业图谱
   */
  const viewBusinessMap = (record) => {
    if (record.get('dataId')) {
      history.push(
        `/sdat/risk-control-workbench/supplier-blacklist-manage/detail/${record.get('dataId')}`
      );
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

  const columns = [
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
      name: 'endTime',
      width: 150,
      // editor: (record) => record.getState('editing'),
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
      name: 'addTime',
      width: 150,
    },
    {
      name: 'updateTime',
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
              permissionList={[{ code: 'risk-control-workbench.api.blackList-remove' }]}
              type="text"
              color="primary"
              style={{ marginRight: '16px' }}
              onClick={() => handleRemove(record)}
            >
              {intl.get('hzero.common.button.remove').d('移除')}
            </PermissionButton>
            // <Popconfirm
            //   title={intl
            //     .get('sdat.supplierBlacklistManage.message.confirm.removeOrganization')
            //     .d('确定移除该企业吗?')}
            //   onConfirm={() => {

            //   }}
            //   okText={intl.get('hzero.common.model.yes').d('是')}
            //   cancelText={intl.get('hzero.common.model.no').d('否')}
            // >

            // </Popconfirm>
          )}
          {!record?.getState('editing') ? (
            <PermissionButton
              onClick={() => {
                handleEdit(record);
              }}
              permissionList={[{ code: 'risk-control-workbench.api.blackList-edit' }]}
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
              permissionList={[{ code: 'risk-control-workbench.api.blackList-save' }]}
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

          {!record?.getState('editing') ? (
            <PermissionButton
              onClick={() => viewBusinessMap(record)}
              permissionList={[{ code: 'risk-control-workbench.api.viewMap' }]}
              type="text"
              style={{ marginRight: '16px' }}
            >
              {intl.get('sdat.supplierBlacklistManage.view.button.businessMap').d('企业图谱')}
            </PermissionButton>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <React.Fragment>
      {customizeTable &&
        customizeTable(
          { code: 'SDAT.SUPPLIER_BLACKLIST_MANAGEMENT.BLACK_LIST_BXJD' },
          <Table
            dataSet={blackListDs}
            columns={columns}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            columnDraggable
            customizedCode="SDAT_SUPPLIER_BLACKLIST"
          />
        )}
    </React.Fragment>
  );
}
