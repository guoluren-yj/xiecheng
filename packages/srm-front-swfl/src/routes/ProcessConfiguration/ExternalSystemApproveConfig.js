/**
 * ExternalSystemApproveConfig - 外部审批配置
 * @date: 2022-12-05
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Form, DataSet, Select, Lov, TextField, Button, Modal, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getExternalSystemApproveConfigLineDs } from './store/storeDs';
import { Context } from './store';
import {
  saveExternalSystemApproveConfig,
  deleteExternalSystemApproveConfigLine,
} from './processConfigurationService';

// 可观测ds的表单
const SystemApproveConfigLine = observer((props) => {
  const { dataSet, deleteRecord } = props;
  return (
    dataSet.records &&
    dataSet.records.length > 0 &&
    dataSet.records.map((record) => {
      if (record.status !== 'delete') {
        return (
          <Form record={record} labelLayout="float" columns={24} style={{ marginBottom: '6px' }}>
            <Select name="approvedAction" colSpan={11} />
            <Lov name="service" colSpan={11} />
            <Button
              funcType="link"
              icon="delete"
              colSpan={1}
              onClick={() => deleteRecord(record)}
            />
          </Form>
        );
      } else {
        return null;
      }
    })
  );
});

export default function ExternalSystemApproveConfig(props = {}) {
  const { currentNode = {} } = props;
  const { externalSystemApproveConfigDs } = useContext(Context);
  const [externalSystemApproveConfigLineDs, setDataSet] = useState(new DataSet());
  const [spinFlag, setSpinFlag] = useState(false);

  useEffect(() => {
    querySystemApproveConfig();
  }, [currentNode]);

  /**
   * 查询ds
   */
  const querySystemApproveConfig = () => {
    const { documentId, categoryId, sourceParentId } = currentNode;
    externalSystemApproveConfigDs.setQueryParameter('documentId', documentId);
    externalSystemApproveConfigDs.setQueryParameter('categoryId', categoryId);
    externalSystemApproveConfigDs.query().then((res) => {
      if (res) {
        setDataSet(
          new DataSet(
            getExternalSystemApproveConfigLineDs({
              initData: res.exportWorkflowConfigList,
              lovPara: {
                tenantId: getCurrentOrganizationId(),
                parentDocumentId: sourceParentId,
                documentId,
                categoryId,
              },
            })
          )
        );
      }
    });
  };

  /**
   * 保存
   */
  const saveConfig = useCallback(async () => {
    const { documentId, categoryId, documentCode, categoryCode } = currentNode;
    const headerFormValidateFlag = await externalSystemApproveConfigDs.validate();
    const lineFormValidateFlag = await externalSystemApproveConfigLineDs.validate();
    if (headerFormValidateFlag && lineFormValidateFlag) {
      const headerParams =
        (externalSystemApproveConfigDs.current &&
          externalSystemApproveConfigDs.current.toJSONData()) ||
        {};
      const params = {
        documentId,
        categoryId,
        documentCode,
        categoryCode,
        ...headerParams,
        exportWorkflowConfigList: externalSystemApproveConfigLineDs.toJSONData(),
      };
      setSpinFlag(true);
      saveExternalSystemApproveConfig(params)
        .then((res) => {
          if (getResponse(res)) {
            querySystemApproveConfig();
            notification.success();
          }
        })
        .finally(() => {
          setSpinFlag(false);
        });
    }
  }, [externalSystemApproveConfigLineDs, externalSystemApproveConfigDs, currentNode]);

  /**
   * 添加新行数据
   */
  const addSystemApproveConfigLine = useCallback(() => {
    externalSystemApproveConfigLineDs.create();
  }, [externalSystemApproveConfigLineDs]);

  /**
   * 删除新行数据
   */
  const deleteRecord = useCallback(
    (record) => {
      Modal.confirm({
        title: intl.get('swfl.processConfiguration.view.action.delete').d('确认删除选中行？'),
        onOk: () => {
          if (record.status !== 'add') {
            const deleteParam = record.toJSONData();
            deleteExternalSystemApproveConfigLine(deleteParam).then((res) => {
              if (getResponse(res)) {
                externalSystemApproveConfigLineDs.delete(record, false);
                notification.success();
              }
            });
          } else {
            externalSystemApproveConfigLineDs.delete(record, false);
            notification.success();
          }
        },
      });
    },
    [externalSystemApproveConfigLineDs]
  );

  return (
    <Spin spinning={spinFlag}>
      <div className="external-system-approve-config">
        <div>
          <div className="title header-title">
            <span>
              {intl
                .get('swfl.processConfiguration.view.externalSystemApproveConfig.header')
                .d('外部审批表单')}
            </span>
            <Button color="primary" onClick={saveConfig}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <Form labelLayout="float" dataSet={externalSystemApproveConfigDs} columns={24}>
            <TextField
              name="linkCode"
              colSpan={11}
              placeholder={intl
                .get('swfl.processConfiguration.model.processConfiguration.linkCode.placeholder')
                .d('请输入配置表中短链接模板编码')}
            />
          </Form>
        </div>
        <div>
          <div className="title line-title">
            <span>
              {intl
                .get('swfl.processConfiguration.view.externalSystemApproveConfig.line')
                .d('审批结束服务')}
            </span>
            <Button funcType="link" icon="add" onClick={addSystemApproveConfigLine} />
          </div>
          <SystemApproveConfigLine
            dataSet={externalSystemApproveConfigLineDs}
            deleteRecord={deleteRecord}
          />
        </div>
      </div>
    </Spin>
  );
}
