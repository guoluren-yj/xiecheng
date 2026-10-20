/**
 * ProcessVariable
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useEffect, useContext, useState } from 'react';
import { Button, Table, Modal } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';

import { getResponse } from 'hzero-front/lib/utils/utils';
import ProcessVariableModal from './ProcessVariableModal';
import {
  fetchCustomizeField,
  saveProcessVariable,
  updateProcessVariable,
  deleteProcessVariable,
} from './processConfigurationService';
import { Context } from './store';

const key = Modal.key();
export default function ProcessVariable(props = {}) {
  const { documentId, disabled, modelCode, documentCode } = props;
  const [customizeField, setCustomizeField] = useState({});

  const { processVariableDs } = useContext(Context);

  useEffect(() => {
    processVariableDs.setQueryParameter('documentId', documentId);
    processVariableDs.query();
    if (modelCode) {
      fetchCustomizeField({
        modelCode,
      }).then((res) => {
        if (getResponse(res)) {
          setCustomizeField(res);
        }
      });
    }
  }, [documentId, modelCode]);

  const addProcessVariable = async () => {
    const record = await processVariableDs.create();
    openModal(record, intl.get('hzero.common.button.create').d('新建'));
  };

  const editProcessVariable = (record) => {
    openModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const onHandleSave = (resolve, reject) => {
    processVariableDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = processVariableDs.current.get('variableId')
            ? updateProcessVariable
            : saveProcessVariable;
          actionName({
            sourceId: documentId,
            sourceType: 'DOCUMENT',
            documentCode,
            ...processVariableDs.current.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              processVariableDs.query();
              resolve();
            } else {
              reject();
            }
          });
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        return reject(err);
      });
  };

  const onDeleteProcessVariable = (record) => {
    deleteProcessVariable({
      ...record.toData(),
      sourceId: documentId,
      sourceType: 'DOCUMENT',
      documentCode,
    })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          processVariableDs.query();
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
      children: (
        <ProcessVariableModal
          record={record}
          customizeField={customizeField}
          modelCode={modelCode}
        />
      ),
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        processVariableDs.reset();
      },
    });
  };

  const columns = [
    {
      name: 'variableName',
      width: 160,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'variableType',
      width: 150,
    },
    {
      name: 'componentType',
      width: 150,
    },
    {
      name: 'lovCode',
      width: 300,
    },
    {
      name: 'requiredFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'modelName',
    },
    {
      name: 'option',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => {
        if (!disabled && !record.get('copyFlag')) {
          return (
            <>
              <a onClick={() => editProcessVariable(record)} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => onDeleteProcessVariable(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </>
          );
        } else {
          return ' ';
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
      onClick={() => addProcessVariable()}
    >
      {intl.get('hwfp.common.view.button.addVariable').d('添加流程变量')}
    </Button>,
  ];

  return (
    <div className="process-variable">
      <div className="basic-info-title">
        <span>{intl.get(`hwfp.common.view.message.title.variable`).d('流程变量')}</span>
      </div>
      <Table dataSet={processVariableDs} columns={columns} buttons={buttons} />
    </div>
  );
}
