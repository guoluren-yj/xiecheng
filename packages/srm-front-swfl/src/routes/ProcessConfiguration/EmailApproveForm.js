/**
 * EmailApproveForm
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useContext, useEffect } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';

import { operatorRender, enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { Context } from './store';
import {
  saveEmailApproveForm,
  updateEmailApproveForm,
  deleteEmailApproveForm,
} from './processConfigurationService';
import EmailApproveFormModal from './EmailApproveFormModal';

const key = Modal.key();
const isSiteFlag = !isTenantRoleLevel();
export default function ProcessForm(props = {}) {
  const { documentId, disabled } = props;
  const { emailApproveFormDs } = useContext(Context);

  useEffect(() => {
    emailApproveFormDs.setQueryParameter('documentId', documentId);
    emailApproveFormDs.query();
  }, [documentId]);

  const addEmailApproveForm = async () => {
    const record = await emailApproveFormDs.create();
    openModal(record, intl.get('hzero.common.button.create').d('新建'));
  };

  const editEmailApproveForm = (record) => {
    openModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const onHandleSave = (resolve, reject) => {
    emailApproveFormDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = emailApproveFormDs.current.get('formId')
            ? updateEmailApproveForm
            : saveEmailApproveForm;
          actionName({
            documentId,
            ...emailApproveFormDs.current.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              emailApproveFormDs.query();
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

  const onDeleteEmailApproveForm = (record) => {
    deleteEmailApproveForm(record.toData())
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          emailApproveFormDs.query();
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
      key,
      style: {
        width: 380,
      },
      children: <EmailApproveFormModal record={record} />,
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        emailApproveFormDs.reset();
      },
    });
  };

  const columns = [
    {
      name: 'templateCode',
      width: 200,
    },
    {
      name: 'templateName',
    },
    {
      name: 'interface',
      width: 250,
    },
    {
      title: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    isSiteFlag && {
      title: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
      fixed: 'right',
      lock: 'right',
      width: 120,
      renderer: ({ record }) => {
        const operators = [
          {
            key: 'edit',
            ele: (
              <a onClick={() => editEmailApproveForm(record)}>
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
                onConfirm={() => onDeleteEmailApproveForm(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            ),
            len: 2,
            title: intl.get('hzero.common.button.delete').d('删除'),
          },
        ];
        if (!disabled && !record.get('copyFlag')) {
          return operatorRender(operators, record);
        }
      },
    },
  ].filter(Boolean);

  const buttons = isSiteFlag
    ? [
      <Button
        color="primary"
        icon="playlist_add"
        disabled={disabled}
        size="small"
        onClick={() => addEmailApproveForm()}
      >
        {intl.get('hwfp.common.view.button.addEmail').d('新增邮件审批表单')}
      </Button>,
      ]
    : [];

  return (
    <div className="email-approve-form">
      <div className="basic-info-title">
        <span>{intl.get('hwfp.common.view.message.title.email').d('邮件审批表单')}</span>
      </div>
      <Table dataSet={emailApproveFormDs} columns={columns} buttons={buttons} aggregation />
    </div>
  );
}
