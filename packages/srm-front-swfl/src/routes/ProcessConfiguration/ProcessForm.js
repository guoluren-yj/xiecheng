/**
 * ProcessForm
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useContext, useEffect, useCallback } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Tooltip, Row, Popconfirm } from 'choerodon-ui';

import { yesOrNoRender, operatorRender, enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { Context } from './store';
import {
  saveProcessForm,
  updateProcessForm,
  deleteProcessForm,
} from './processConfigurationService';
import ProcessFormModal from './ProcessFormModal';
import styles from './index.less';

const key = Modal.key();
const isSiteFlag = !isTenantRoleLevel();
export default function ProcessForm(props = {}) {
  const { documentId, disabled, documentCode, cuszDocCode } = props;
  const { processFormDs } = useContext(Context);

  useEffect(() => {
    processFormDs.setQueryParameter('documentId', documentId);
    processFormDs.query();
  }, [documentId]);

  const addProcessForm = useCallback(async () => {
    const record = await processFormDs.create({ formCodePrefix: documentCode, cuszDocCode });
    openModal(record, intl.get('hzero.common.button.create').d('新建'));
  }, [cuszDocCode]);

  const editProcessForm = useCallback(
    (record) => {
      record.set('cuszDocCode', cuszDocCode);
      openModal(record, intl.get('hzero.common.button.edit').d('编辑'));
    },
    [cuszDocCode]
  );

  const onHandleSave = (resolve, reject) => {
    processFormDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = processFormDs.current.get('formId')
            ? updateProcessForm
            : saveProcessForm;
          actionName({
            documentId,
            ...processFormDs.current.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              processFormDs.query();
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

  const onDeleteProcessForm = (record) => {
    deleteProcessForm(record.toData())
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          processFormDs.query();
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
      className: styles['process-configuration-process-from-edit-modal'],
      children: <ProcessFormModal record={record} />,
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        processFormDs.reset();
      },
    });
  };

  const columns = [
    {
      name: 'description',
      width: 200,
      aggregation: true,
      renderer: ({ record, value }) => {
        const { formCodePrefix, formCode } = record.get(['formCode', 'formCodePrefix']) || {};
        return (
          <>
            <Row>{value}</Row>
            <Row>{formCodePrefix ? `${formCodePrefix}:${formCode || ''}` : formCode}</Row>
          </>
        );
      },
    },
    {
      name: 'formUrl',
      renderer: ({ record, value }) => (
        <span>{`${record.get('formUrlProtocol')}${value || ''}`}</span>
      ),
    },
    {
      name: 'mobileFormUrl',
      width: 250,
    },
    {
      title: (
        <Tooltip
          title={intl
            .get('hzero.common.batchFlag.toolTip')
            .d('表单若有存在前端编辑校验，建议不启用批量审批，批量审批无法校验表单必输等')}
        >
          {intl.get('hzero.common.batchFlag').d('启用批量审批')}
        </Tooltip>
      ),
      name: 'batchFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'cuszStage',
      width: 200,
    },
    {
      title: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      title: intl.get('hwfp.common.model.common.usageStatus').d('统一重构表单'),
      dataIndex: 'usageStatusMeaning',
      width: 120,
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
              <a onClick={() => editProcessForm(record)}>
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
                onConfirm={() => onDeleteProcessForm(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            ),
            len: 2,
            title: intl.get('hzero.common.button.delete').d('删除'),
          },
        ];
        if (!disabled && !record.get('copyFlag')) {
          // 租户级不能编辑单据样式配置
          if (record.get('cuszStageCode')) {
            return;
          }
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
          onClick={addProcessForm}
        >
          {intl.get('hwfp.common.view.button.addForm').d('新增流程表单')}
        </Button>,
      ]
    : [];

  return (
    <div className="process-form">
      <div className="basic-info-title">
        <span>{intl.get('hwfp.common.view.message.title.form').d('流程表单')}</span>
      </div>
      <Table dataSet={processFormDs} columns={columns} buttons={buttons} aggregation />
    </div>
  );
}
