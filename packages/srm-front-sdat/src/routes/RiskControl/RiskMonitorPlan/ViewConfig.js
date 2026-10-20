/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button, Modal, Form, DataSet, Select } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { getResponse } from '@/utils/utils';

import styles from './index.less';

export default function ViewConfig({ configListDS, defineId, groupCode }) {
  const [isEdit, setIsEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const formDS = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            label: intl.get(`sdat.riskScanConfig.model.configItem`).d('配置项'),
            name: 'processConfig',
            lookupCode: 'SDAT.PROCESS_ACTION',
            multiple: true,
            required: true,
          },
        ],
      }),
    []
  );

  useEffect(() => {
    configListDS.addEventListener('load', loadDataEvent);
    configListDS.addEventListener('update', updateRecord);
    configListDS.addEventListener('select', selectEvent);
    configListDS.addEventListener('unSelect', selectEvent);
    configListDS.addEventListener('selectAll', selectEvent);
    configListDS.addEventListener('unSelectAll', selectEvent);
    return () => {
      configListDS.removeEventListener('load', loadDataEvent);
      configListDS.removeEventListener('update', updateRecord);
      configListDS.removeEventListener('select', selectEvent);
      configListDS.removeEventListener('unSelect', selectEvent);
      configListDS.removeEventListener('selectAll', selectEvent);
      configListDS.removeEventListener('unSelectAll', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (defineId) {
      configListDS.setQueryParameter('defineId', defineId);
      configListDS.setQueryParameter('groupCode', groupCode);
      configListDS.query();
    }
  }, [defineId]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const updateRecord = ({ record, name, value, oldValue }) => {
    if (name === 'processConfig' && value.join(',') !== oldValue.join(',')) {
      record.status = 'update';
    }
  };

  const loadDataEvent = ({ dataSet }) => {
    dataSet.forEach((rcd) => {
      const obj = rcd?.toData() ?? {};
      const { processAction = '', ruleId = '' } = obj;

      const list =
        processAction && typeof processAction === 'string'
          ? processAction.split(',')
          : processAction || [];
      rcd.set('processConfig', list);

      if (!ruleId) {
        rcd.status = 'update';
      } else {
        rcd.status = 'sync';
      }
    });
  };

  const columns = () => {
    return [
      { name: 'oneCategory' },
      { name: 'twoCategory' },
      { name: 'threeCategory' },
      { name: 'fourCategory' },
      {
        name: 'executeExpression',
        width: 100,
        renderer: ({ record }) => {
          const value = record?.get('executeExpression') ?? '';
          const classNames = [3, '3'].includes(value)
            ? styles['status-high-tag']
            : [2, '2'].includes(value)
            ? styles['status-middle-tag']
            : styles['status-low-tag'];

          const text = value
            ? [3, '3'].includes(value)
              ? intl.get('hzero.common.priority.high').d('高')
              : [2, '2'].includes(value)
              ? intl.get('hzero.common.priority.medium').d('中')
              : intl.get('hzero.common.priority.low').d('低')
            : '';

          return text ? <Tag className={classNames}>{text}</Tag> : '';
        },
      },
      {
        name: 'processConfig',
        editor: (record) => record.getState('editable'),
      },
    ];
  };

  const handleEdit = () => {
    configListDS.forEach((rcd) => {
      rcd.setState('editable', true);
    });
    setIsEdit(true);
  };

  const handleCancel = () => {
    configListDS.query();
    setIsEdit(false);
  };

  /**
   * 保存
   */
  const handleSave = async () => {
    const isValid = await configListDS.validate();
    if (isValid) {
      const res = await configListDS.submit();
      if (getResponse(res)) {
        setIsEdit(false);
        configListDS.query();
      }
    }
  };

  /**
   * 批量编辑
   */
  const handleBatchEdit = () => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) modal.close();
    };

    const handleOk = async () => {
      const isValid = await formDS.validate();
      if (isValid) {
        const arrs = formDS.current.get('processConfig');
        configListDS.selected.forEach((rcd) => {
          rcd.set('processConfig', arrs);
        });
        handleCloseModal();
      }
    };

    if (configListDS.selected.length) {
      modal = Modal.open({
        title: intl.get(`sdat.riskScanConfig.model.selectedConfigItem`).d('选择配置项'),
        children: (
          <div style={{ height: 'calc(100vh - 120px)' }}>
            <Form dataSet={formDS} labelLayout="float" columns={1}>
              <Select name="processConfig" />
            </Form>
          </div>
        ),
        closable: false,
        drawer: true,
        mask: true,
        style: { width: '372px' },
        bodyStyle: { padding: '20px' },
        footer: (
          <div>
            <Button color="primary" onClick={handleOk}>
              {intl.get(`hzero.common.button.ok`).d('关闭')}
            </Button>
            <Button onClick={handleCloseModal}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </div>
        ),
      });
    }
  };

  const buttons = () => {
    return [
      <Button funcType="flat" icon="mode_edit" onClick={handleEdit}>
        {intl.get('hzero.common.button.edit').d('编辑')}
      </Button>,
      <Button
        funcType="flat"
        icon="edit_note"
        disabled={!configListDS.selected.length}
        onClick={handleBatchEdit}
      >
        {intl.get('hzero.common.button.batchEdit').d('批量编辑')}
      </Button>,
      <Button funcType="flat" icon="save" onClick={handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      isEdit && (
        <Button funcType="flat" icon="close" onClick={handleCancel}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      ),
    ];
  };

  return (
    <div
      style={{ height: 'calc(100vh - 158px)' }}
      className={styles['risk-define-view-config-basic']}
    >
      <Table
        dataSet={configListDS}
        columns={columns()}
        buttons={buttons()}
        queryBar="none"
        autoHeight={{ type: 'maxHeight', diff: 40 }}
      />
    </div>
  );
}
