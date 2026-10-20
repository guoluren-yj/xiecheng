/**
 * ApprovalGroupModal
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useEffect } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';

import { operatorRender } from 'utils/renderer';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import {
  saveApprovalGroupField,
  updateApprovalGroupField,
  deleteApprovalGroupField,
} from '../processConfigurationService';
import ConditionFieldModal from './ConditionFieldModal';
import ApprovalGroupFieldModal from './ApprovalGroupFieldModal';

const conditionFieldKey = Modal.key();
const approvalGroupFieldKey = Modal.key();
let uid = Date.now();
export default function ColumnDefModal(props = {}) {
  const { defId, conditionFieldDs, approvalGroupFieldDs, documentId } = props;
  const currentOrganizationId = getCurrentOrganizationId();

  useEffect(() => {
    conditionFieldDs.setQueryParameter('queryParams', {
      defId,
      columnType: 'INPUT',
    });
    conditionFieldDs.query();
    approvalGroupFieldDs.setQueryParameter('queryParams', {
      defId,
      columnType: 'OUTPUT',
    });
    approvalGroupFieldDs.query();
  }, [defId]);

  const addApprovalGroupField = async () => {
    const record = await approvalGroupFieldDs.create({
      fieldCode: approvalGroupFieldDs.records.length + 1,
    });
    openApprovalGroupFieldModal(record, intl.get('hzero.common.button.create').d('新建'));
  };

  const editApprovalGroupField = (record) => {
    record.set('fieldCode', `#${record.index + 1}`);
    openApprovalGroupFieldModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const addConditionField = async () => {
    const record = await conditionFieldDs.create();
    record.getField('field').setLovPara('documentId', documentId);
    openConditionFieldModal(record, intl.get('hzero.common.button.create').d('新建'));
  };

  const editConditionField = (record) => {
    openConditionFieldModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const openConditionFieldModal = (record, title) => {
    Modal.open({
      title,
      drawer: true,
      key: conditionFieldKey,
      style: {
        width: 380,
      },
      children: <ConditionFieldModal record={record} />,
      onOk: () => new Promise((resolve, reject) => onHandleConditionFieldSave(resolve, reject)),
      onClose: () => {
        conditionFieldDs.reset();
      },
    });
  };

  const openApprovalGroupFieldModal = (record, title) => {
    Modal.open({
      title,
      drawer: true,
      key: approvalGroupFieldKey,
      style: {
        width: 380,
      },
      children: <ApprovalGroupFieldModal record={record} />,
      onOk: () => new Promise((resolve, reject) => onHandleApprovalGroupFieldSave(resolve, reject)),
      onClose: () => {
        approvalGroupFieldDs.reset();
      },
    });
  };

  const onHandleConditionFieldSave = (resolve, reject) => {
    conditionFieldDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = conditionFieldDs.current.get('formId')
            ? updateApprovalGroupField
            : saveApprovalGroupField;
          actionName({
            defId,
            columnType: 'INPUT',
            tenantId: currentOrganizationId,
            ...conditionFieldDs.current.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              conditionFieldDs.query();
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

  const createUid = () => {
    return (uid++).toString(36);
  };

  const onHandleApprovalGroupFieldSave = (resolve, reject) => {
    approvalGroupFieldDs
      .validate()
      .then((flag) => {
        if (flag) {
          const formId = approvalGroupFieldDs.current.get('formId');
          const codeObj = formId ? {} : { fieldCode: createUid() };
          const actionName = formId ? updateApprovalGroupField : saveApprovalGroupField;
          actionName({
            defId,
            tenantId: currentOrganizationId,
            columnType: 'OUTPUT',
            ...approvalGroupFieldDs.current.toJSONData(),
            ...codeObj,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              approvalGroupFieldDs.query();
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

  const onDeleteApprovalGroupField = (record, dataSet) => {
    deleteApprovalGroupField(record.toData())
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          dataSet.query();
        }
      })
      .catch((err) => {
        notification.error({
          message: err,
        });
      });
  };

  const conditionFieldColumns = [
    {
      name: 'fieldCode',
      width: 300,
    },
    {
      width: 300,
      name: 'fieldName',
    },
    {
      minWidth: 300,
      name: 'fieldComponentType',
    },
    {
      width: 300,
      name: 'lovCode',
    },
    {
      name: 'option',
      width: 140,
      lock: 'right',
      renderer: ({ record }) => {
        const operators = [
          {
            key: 'edit',
            ele: (
              <a
                onClick={() => {
                  editConditionField(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            ),
            len: 2,
            title: intl.get('hzero.common.button.edit').d('编辑'),
          },
          {
            key: 'delete',
            ele: (
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => onDeleteApprovalGroupField(record, conditionFieldDs)}
              >
                <a disabled={record.get('editFlag') === 0}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              </Popconfirm>
            ),
            len: 2,
            title: intl.get('hzero.common.button.delete').d('删除'),
          },
        ];
        return operatorRender(operators, record);
      },
    },
  ];

  const approvalGroupFieldColumns = [
    {
      name: 'fieldCode',
      width: 300,
      renderer: ({ record }) => <span>#{record.index + 1}</span>,
    },
    {
      width: 300,
      name: 'fieldName',
    },
    {
      minWidth: 300,
      name: 'fieldComponentType',
    },
    {
      minWidth: 100,
      name: 'outputType',
    },
    {
      width: 300,
      name: 'lovCode',
    },
    {
      name: 'option',
      width: 140,
      lock: 'right',
      renderer: ({ record }) => {
        const operators = [
          {
            key: 'edit',
            ele: (
              <a
                onClick={() => {
                  editApprovalGroupField(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            ),
            len: 2,
            title: intl.get('hzero.common.button.edit').d('编辑'),
          },
          {
            key: 'delete',
            ele: (
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => onDeleteApprovalGroupField(record, approvalGroupFieldDs)}
              >
                <a disabled={record.get('editFlag') === 0}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              </Popconfirm>
            ),
            len: 2,
            title: intl.get('hzero.common.button.delete').d('删除'),
          },
        ];
        return operatorRender(operators, record);
      },
    },
  ];

  const conditionFieldButtons = [
    <Button color="primary" icon="playlist_add" size="small" onClick={() => addConditionField()}>
      {intl.get('hwfp.documents.action.button.conditionField').d('新增条件字段定义')}
    </Button>,
  ];

  const approvalGroupFieldButtons = [
    <Button
      color="primary"
      icon="playlist_add"
      size="small"
      onClick={() => addApprovalGroupField()}
    >
      {intl.get('hwfp.documents.action.button.approvalGroupField').d('新增审批组字段定义')}
    </Button>,
  ];

  return (
    <div>
      <div className="column-def-conditionField">
        <div className="basic-info-title">
          <span>{intl.get('hwfp.documents.card.title.conditionField').d('条件字段定义')}</span>
        </div>
        <Table
          columns={conditionFieldColumns}
          dataSet={conditionFieldDs}
          buttons={conditionFieldButtons}
        />
      </div>
      <div className="column-def-approvalGroupField">
        <div className="basic-info-title">
          <span>
            {intl.get('hwfp.documents.card.title.approvalGroupField').d('审批组字段定义')}
          </span>
        </div>
        <Table
          columns={approvalGroupFieldColumns}
          dataSet={approvalGroupFieldDs}
          buttons={approvalGroupFieldButtons}
        />
      </div>
    </div>
  );
}
