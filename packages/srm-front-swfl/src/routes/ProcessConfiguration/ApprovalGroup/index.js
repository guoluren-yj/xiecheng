/**
 * ApprovalGroup
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useContext, useEffect } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import { Context } from '../store';
import {
  saveApprovalGroup,
  updateApprovalGroup,
  deleteApprovalGroup,
} from '../processConfigurationService';
import ApprovalGroupModal from './ApprovalGroupModal';
import ColumnDefModal from './ColumnDefModal';
import DataMaintenance from './DataMaintenance';
import style from './index.less';

const approvalGroupModalKey = Modal.key();
const columnDefModalKey = Modal.key();
const dataMaintenanceKey = Modal.key();
export default function ApprovalGroup(props = {}) {
  const { documentId, disabled } = props;
  const { approvalGroupDs, conditionFieldDs, approvalGroupFieldDs } = useContext(Context);

  const currentOrganizationId = getCurrentOrganizationId();
  const isTenant = isTenantRoleLevel();

  useEffect(() => {
    approvalGroupDs.setQueryParameter('sourceId', documentId);
    approvalGroupDs.setQueryParameter('sourceType', 'DOCUMENT');
    approvalGroupDs.query();
  }, [documentId]);

  const addApprovalGroup = async () => {
    const record = await approvalGroupDs.create();
    openModal(record, intl.get('hzero.common.button.create').d('新建'));
  };

  const editApprovalGroup = (record) => {
    openModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const onHandleSave = (resolve, reject) => {
    approvalGroupDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = approvalGroupDs.current.get('formId')
            ? updateApprovalGroup
            : saveApprovalGroup;
          actionName({
            sourceId: documentId,
            sourceType: 'DOCUMENT',
            tenantId: currentOrganizationId,
            ...approvalGroupDs.current.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              approvalGroupDs.query();
              resolve();
            } else {
              reject(false);
            }
          });
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  const onDeleteApprovalGroup = (record) => {
    deleteApprovalGroup(record.toData())
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          approvalGroupDs.query();
        }
      })
      .catch((err) => {
        notification.error({
          message: err,
        });
      });
  };

  const openModal = (record, title) => {
    Modal.open({
      title,
      drawer: true,
      key: approvalGroupModalKey,
      children: <ApprovalGroupModal record={record} />,
      style: {
        width: 380,
      },
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        approvalGroupDs.reset();
      },
    });
  };

  const openColumnDefModal = (record) => {
    const defId = record.get('id');
    Modal.open({
      title: intl.get('hwfp.documents.view.message.title.columnDefinition').d('列定义'),
      drawer: true,
      key: columnDefModalKey,
      className: style['column-def-modal'],
      style: { width: '60vw' },
      children: (
        <ColumnDefModal
          defId={defId}
          documentId={documentId}
          conditionFieldDs={conditionFieldDs}
          approvalGroupFieldDs={approvalGroupFieldDs}
        />
      ),
    });
  };

  const openDataMaintenance = (record) => {
    Modal.open({
      title: intl.get('hwfp.documents.view.message.title.dataMaintenance').d('数据维护'),
      drawer: true,
      key: dataMaintenanceKey,
      style: { width: '60vw' },
      foot: null,
      children: (
        <DataMaintenance
          record={record.toData() || {}}
          isSiteFlag={false}
          dataMaintenanceDs={conditionFieldDs}
        />
      ),
    });
  };

  const columns = [
    {
      name: 'defCode',
      width: 300,
    },
    {
      width: 300,
      name: 'defName',
    },
    {
      name: 'description',
    },
    {
      name: 'option',
      width: 250,
      renderer: ({ record }) => {
        if (!disabled && !record.get('copyFlag')) {
          return (
            <>
              {
                isTenant && (
                  <>
                    <a onClick={() => editApprovalGroup(record)} style={{marginRight: 8}}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                    <Popconfirm
                      placement="topRight"
                      title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                      onConfirm={() => onDeleteApprovalGroup(record)}
                    >
                      <a style={{marginRight: 8}}>{intl.get('hzero.common.button.delete').d('删除')}</a>
                    </Popconfirm>
                  </>
                )
              }
              <a onClick={() => openColumnDefModal(record)} style={{marginRight: 8}}>
                {intl.get('hwfp.documents.view.message.title.columnDefinition').d('列定义')}
              </a>
              <a onClick={() => openDataMaintenance(record)}>
                {intl.get('hwfp.documents.view.message.title.dataMaintenance').d('数据维护')}
              </a>
            </>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const buttons = [
    <Button
      color="primary"
      icon="playlist_add"
      disabled={disabled}
      size="small"
      onClick={() => addApprovalGroup()}
    >
      {intl.get('hwfp.serviceDefinition.view.title.approvalGroup.definition').d('审批组定义')}
    </Button>,
  ];

  return (
    <div className="process-form">
      {/* <div className="basic-info-title">
        <span>{intl.get('hwfp.documents.table.title.approvalGroup').d('审批组')}</span>
      </div> */}
      <Table dataSet={approvalGroupDs} columns={columns} buttons={buttons} aggregation />
    </div>
  );
}
