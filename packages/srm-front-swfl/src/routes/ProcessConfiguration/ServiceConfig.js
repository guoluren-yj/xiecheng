/**
 * ProcessConfig
 * @date: 2022-07-12
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useContext, useRef } from 'react';
import { Modal, Table, Button } from 'choerodon-ui/pro';
import { Tag, Popconfirm } from 'choerodon-ui';
import { isFunction, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { deleteService } from './processConfigurationService';
import { Context } from './store';
import ServiceCreate from './ServiceCreate/index';
import styles from './index.less';

const currentTenantId = getCurrentOrganizationId();
const isSiteFlag = !isTenantRoleLevel();
const modalKey = Modal.key();
export default function ServiceConfig(props = {}) {
  const { currentNode = {} } = props;
  const { categoryId = '', categoryCode = '', documentId = '' } = currentNode;
  const { serviceConfigTableDs, serviceConfigFormDs } = useContext(Context);
  const saveRef = useRef();

  useEffect(() => {
    if (categoryId) {
      if (!isEmpty(currentNode) && currentNode.sourceParentId) {
        serviceConfigTableDs.setQueryParameter('parentDocumentId', currentNode.sourceParentId);
      } else {
        serviceConfigTableDs.setQueryParameter('parentDocumentId', null);
      }
      serviceConfigTableDs.setQueryParameter('categoryId', categoryId);
      serviceConfigTableDs.setQueryParameter('documentId', documentId);
      serviceConfigTableDs.query();
    }
  }, [categoryId, categoryCode, documentId, currentNode]);

  const editService = (record) => {
    let recordData = {};
    let isPredefined = false;
    if (record) {
      recordData = record.toData();
      isPredefined = currentTenantId.toString() !== record.get('tenantId').toString();
    }
    Modal.open({
      key: modalKey,
      title: intl.get('hwfp.serviceDefinition.view.title.serviceDefinition').d('服务定义'),
      className: styles['process-configuration-service-definition-modal'],
      children: (
        <ServiceCreate
          serviceConfigFormDs={serviceConfigFormDs}
          currentTenantId={currentTenantId}
          categoryId={categoryId}
          categoryCode={categoryCode}
          documentId={documentId}
          currentNode={currentNode}
          recordData={recordData}
          isSiteFlag={isSiteFlag}
          isPredefined={isPredefined}
          onRef={(ref) => {
            saveRef.current = ref;
          }}
        />
      ),
      style: { width: '80vw' },
      drawer: true,
      onOk: () => {
        if (!isPredefined) {
          if (saveRef.current.handleSave && isFunction(saveRef.current.handleSave)) {
            saveRef.current.handleSave();
          }
          return false;
        }
      },
      okText: intl.get('hzero.common.save').d('保存'),
      cancelText: isPredefined
        ? intl.get('hzero.common.button.close').d('关闭')
        : intl.get('hzero.common.button.cancel').d('取消'),
      okButton: !isPredefined,
      cancelProps: {
        color: isPredefined ? 'primary' : 'default',
      },
      onClose: () => {
        serviceConfigFormDs.reset();
        const { currentPage } = serviceConfigTableDs;
        serviceConfigTableDs.query(currentPage);
      },
    });
  };

  const deleteRecord = (record) => {
    deleteService(record).finally(() => {
      const { currentPage } = serviceConfigTableDs;
      serviceConfigTableDs.query(currentPage);
    });
  };

  const columns = [
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'serviceCode',
      width: 200,
      // renderer: ({ record, value }) => <a onClick={() => editService(record)}>{value}</a>,
    },
    {
      name: 'description',
      minWidth: 200,
    },
    {
      name: 'serviceType',
      width: 100,
    },
    {
      name: 'serviceMode',
      width: 100,
    },
    {
      name: 'serviceDefinitionSource',
      width: 100,
      renderer: ({ record }) =>
        currentTenantId.toString() === record.get('tenantId').toString() ? (
          <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
        ) : (
          <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
        ),
    },
    {
      name: 'option',
      lock: 'right',
      width: 100,
      renderer: ({ record }) => (
        <>
          <span className="action-link" style={{ marginRight: '8px' }}>
            <a onClick={() => editService(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </span>
          <span className="action-link">
            {currentTenantId.toString() === record.get('tenantId').toString() && (
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => deleteRecord(record.toData())}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            )}
          </span>
        </>
      ),
    },
  ];

  const buttons = [
    <Button icon="playlist_add" onClick={() => editService()}>
      {intl.get('hwfp.serviceDefinition.action.button.serviceDefinition').d('新建服务配置')}
    </Button>,
  ];

  return (
    <div style={{ height: '640px' }}>
      <Table
        autoHeight={{ type: 'maxHeight', diff: 20 }}
        dataSet={serviceConfigTableDs}
        columns={columns}
        buttons={buttons}
      />
    </div>
  );
}
