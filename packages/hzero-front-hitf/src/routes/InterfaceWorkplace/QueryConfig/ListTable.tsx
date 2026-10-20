import React, { useMemo, useCallback, useState } from 'react';
import { Icon } from 'choerodon-ui';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { TableButtonType, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'hzero-front/lib/utils/intl';
import { DataSet, Button, TextField, Modal } from 'choerodon-ui/pro';
import { formDs } from '@/stores/InterfaceWorkplace/QueryConfigDs';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { createInterfaceQuery } from '@/services/InterfaceWorkplaceService';
import { Tag } from 'hzero-ui';
import Create from './Create';
// @ts-ignore
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

interface ListTableProps {
  tenantInterfaceId: Number,
  tableDs: DataSet,
}

const ListTable: React.FC<ListTableProps> = ({ tableDs, tenantInterfaceId }) => {
  const [createDs] = useState(new DataSet(formDs()));

  // 弹窗点确定后，保存数据
  const handleSave = async () => {
    const validateFlag = await createDs.validate();
    if (!validateFlag) return false;
    const params = createDs.current && createDs.current.toData();
    const obj = isTenant ? { tenantInterfaceId } : { interfaceId: tenantInterfaceId };
    createInterfaceQuery({
      ...params,
      ...obj,
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        if (isTenant) {
          tableDs.setQueryParameter('tenantInterfaceId', tenantInterfaceId);
        } else {
          tableDs.setQueryParameter('interfaceId', tenantInterfaceId);
        }
        tableDs.query();
      }
    });
    return true;
  };

  // 新建弹窗
  const openModal = useCallback(
    ({ type, record }) => {
      if (type === 'edit' && isTenant && record && record.get('source') === 'PREDEFINED') {
        // 租户级不可编辑预定义字段
        return;
      }
      if (type === 'add') {
        createDs.create({});
        // @ts-ignore
        createDs.getField('params').setLovPara(isTenant ? 'tenantInterfaceId' : 'interfaceId', tenantInterfaceId);
        // @ts-ignore
        createDs.getField('targetParam').setLovPara(isTenant ? 'tenantInterfaceId' : 'interfaceId', tenantInterfaceId);
      } else {
        createDs.create({
          ...record.toData(),
        });
        if (createDs && createDs.current) {
          createDs.current.status = RecordStatus.update;
        }
        // @ts-ignore
        createDs.getField('params').setLovPara(isTenant ? 'tenantInterfaceId' : 'interfaceId', tenantInterfaceId);
        // @ts-ignore
        createDs.getField('targetParam').setLovPara(isTenant ? 'tenantInterfaceId' : 'interfaceId', tenantInterfaceId);
      }
      Modal.open({
        drawer: true,
        closable: true,
        destroyOnClose: true,
        style: { width: 380 },
        title:
          type === 'add' ?
            intl.get('hitf.interfaceWorkplace.modal.title.add').d('新增字段') :
            intl.get('hitf.interfaceWorkplace.modal.title.edit').d('编辑字段'),
        children: <Create createDs={createDs} />,
        onOk: () => handleSave(),
        afterClose: () => createDs.reset(),
        className: styles['query-config-field'],
      });
    },
    [Modal, tenantInterfaceId],
  );

  const TagRender = ({ value, type }) => {
    let tagStyle = '';
    let text = '';
    if (type === 'source') {
      if (value === 'PREDEFINED') {
        tagStyle = 'tag-green';
        text = intl.get('hzero.common.predefined').d('预定义');
      } else {
        tagStyle = 'tag-yellow';
        text = intl.get('hzero.common.custom').d('自定义');
      }
    } else if (type === 'status') {
      if (value === 0) {
        tagStyle = 'tag-red';
        text = intl.get('hzero.common.disable').d('禁用');
      } else if (value === 1) {
        tagStyle = 'tag-green';
        text = intl.get('hzero.common.enable').d('启用');
      }
    }
    return (<Tag className={styles[tagStyle]}>{text}</Tag>);
  };

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'source',
        width: 80,
        renderer: ({ value }) => {
          return <TagRender value={value} type='source' />;
        },
      },
      {
        name: 'operate',
        width: 100,
        renderer: ({ record }) => {
          return (
            <span
              className={isTenant && record && record.get('source') === 'PREDEFINED' ? null : styles['edit-span']}
              onClick={() => openModal({ type: 'edit', record })}
            >
              {isTenant && record && record.get('source') === 'PREDEFINED' ? '-' : intl.get('hzero.common.view.button.edit').d('编辑')}
            </span>
          );
        },
      },
      {
        name: 'paramCode',
        width: 140,
      },
      {
        name: 'paramName',
        width: 100,
      },
      {
        name: 'targetParamCode',
        width: 120,
      },
      {
        name: 'isQueryCondition',
        width: 130,
      },
      {
        name: 'priority',
        width: 80,
      },
      {
        name: 'width',
        width: 80,
      },
      {
        name: 'moduleType',
        width: 100,
      },
      {
        name: 'status',
        width: 80,
        renderer: ({ value }) => {
          return <TagRender value={value} type='status' />;
        },
      },
    ],
    [tenantInterfaceId],
  );

  const handleDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [tableDs]);


  return (
    <div style={{ height: 'calc(100vh - 242px)' }}>
      <SearchBarTable
        searchCode='HITF.INTERFACE_CONFIGURATION_WORKBENCH.QUERY.FILTER'
        columns={columns}
        dataSet={tableDs}
        border={false}
        cacheState
        searchBarConfig={{
          autoQuery: false,
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name='paramCode'
                  placeholder={
                    intl
                      .get('hitf.interfaceWorkplace.filter.code')
                      .d('请输入字段编码、字段描述、映射字段名称查询')
                  }
                  prefix={<Icon type='search' />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          closeFilterSelector: true,
        }}
        buttons={[
          <Button
            icon='playlist_add'
            onClick={() => openModal({ type: 'add' })}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>,
          [TableButtonType.delete, { onClick: handleDelete }],
        ]}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -70 }}
      />
    </div>
  );
};


export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.InterfaceWorkplace', 'hitf.interfaceWorkplace'],
})(ListTable));
