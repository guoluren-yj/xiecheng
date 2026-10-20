import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { Table, IconPicker, Lov, DataSet, Button, Switch, Icon } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { fetchSetDefault } from '@/services/aiAgent/AiOrgConfigService';

export default function EditServiceList({ listDS, tenantId }) {
  const ds = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'serviceObj',
            type: 'object',
            lovCode: 'SDAT.AI_AGENT_SERVICE_LIST',
            noCache: true,
            required: true,
            multiple: true,
            lovQueryAxiosConfig: () => {
              return {
                url: `/smbl/v1/ai-service-configs/addable-services?tenantId=${tenantId}`,
                method: 'GET',
              };
            },
          },
        ],
      }),
    [tenantId]
  );

  useEffect(() => {
    if (tenantId) {
      listDS.setQueryParameter('tenantId', tenantId);
      listDS.query();
    }
  }, [tenantId]);

  const handleEdit = (record) => {
    record.setState('editing', true);
  };

  const handleDelete = (rcd) => {
    listDS.delete(rcd);
  };

  const handleChange = (rcd, value) => {
    if (rcd && rcd.set) {
      rcd.set('icon', value);
    }
  };

  const handleChangeDefault = (record) => {
    const obj = record?.toData() ?? null;
    if (obj) {
      fetchSetDefault({ ...obj }).then((res) => {
        if (getResponse(res)) {
          listDS.query();
        }
      });
    }
  };

  const columns = () => {
    return [
      { name: 'serviceName' },
      { name: 'serviceAliasName', editor: (record) => record.getState('editing') },
      {
        name: 'serviceIcon',
        renderer: ({ record, text }) => {
          return record.getState('editing') ? (
            <IconPicker defaultValue={text} onChange={(e) => handleChange(record, e)} />
          ) : (
            <Icon type={text} />
          );
        },
      },
      { name: 'serviceDesc' },
      {
        name: 'isDefault',
        renderer: ({ record, text }) => {
          return record.getState('editing') && record?.get('tenantServiceConfigId') ? (
            <Switch onChange={() => handleChangeDefault(record)} />
          ) : text === '1' ? (
            intl.get('hzero.common.status.yes').d('是')
          ) : (
            intl.get('hzero.common.status.no').d('否')
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('sdat.aiAppManage.model.operation').d('操作'),
        renderer: ({ record }) => {
          return (
            <span>
              {record.getState('editing') ? null : ( // </a> //   {intl.get('hzero.common.button.save').d('保存')} // <a onClick={() => handleSave(record)}>
                <a onClick={() => handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <a style={{ marginLeft: '10px' }} onClick={() => handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  const handleAddItem = (rcd) => {
    if (rcd.length) {
      rcd
        .map((item) => item.toData())
        .forEach((item) => {
          const rowItem = listDS.create(
            {
              ...item,
              tenantId,
            },
            0
          );
          rowItem.setState('editing', true);
        });
      return true;
    } else {
      return false;
    }
  };

  const handleBatchSave = async () => {
    const isValid = await listDS.validate();
    if (isValid) {
      listDS.submit().then(() => {
        listDS.query();
      });
    }
  };

  const buttons = () => {
    return [
      <Lov
        id="add"
        dataSet={ds}
        name="serviceObj"
        mode="button"
        viewMode="drawer"
        clearButton={false}
        icon="playlist_add"
        onBeforeSelect={handleAddItem}
        modalProps={{
          title: intl.get('sdat.aiAppManage.view.title.selectService').d('选择服务'),
          bodyStyle: {
            borderTop: '0.01rem solid #e0e0e0',
            borderBottom: '0.01rem solid #e0e0e0',
          },
        }}
      >
        {intl.get('hzero.common.button.add').d('添加')}
      </Lov>,
      <Button id="save" icon="save" onClick={handleBatchSave}>
        {intl.get('sdat.aiAppManage.view.title.selectService').d('全部保存')}
      </Button>,
    ];
  };

  return (
    <Table
      dataSet={listDS}
      columns={columns()}
      buttons={buttons()}
      customizable
      customizedCode="SDAT.AI_AGENT_ORG_CONFIG_SERVICE_LIST"
    />
  );
}
