import React, { useMemo, useCallback, useState } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { TableButtonType, DragColumnAlign } from 'choerodon-ui/pro/lib/table/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { saveDataConversionDetail } from '@/services/interfaceDefinitionService';
import tagRender from '@/utils/TagRender';

import DataConversionModal from './DataConversionModal';

import styles from './index.less';

const tenantId = getCurrentOrganizationId();
interface DataConversionProps {
  tableDs: DataSet,
  dataFormDs: DataSet,
  dataConversionDs: DataSet,
  dataScriptDs: DataSet,
  dataInputDs: DataSet,
  dataOutputDs: DataSet,
  id: string | Object,
  childRef: any,
}

const DataConversion: React.FC<DataConversionProps> = ({
  tableDs,
  dataFormDs,
  dataConversionDs,
  dataScriptDs,
  dataInputDs,
  dataOutputDs,
  id,
  childRef,
}) => {
  const [orderFlag, setOrderFlag] = useState(false);
  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'convertTypeMeaning',
      },
      {
        name: 'convertCode',
      },
      {
        name: 'convertName',
      },
      {
        name: 'enableFlag',
        renderer: ({ value }) => {
          const meaning = parseInt(value, 10) ? intl.get('hzero.common.enable').d('启用') : intl.get('hzero.common.disable').d('禁用');
          return <span>{tagRender(value, meaning)}</span>;
        },
      },
      {
        name: 'remark',
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => {
          const orderSeq = record ? record.get('orderSeq') : 0;
          return (
            <a onClick={() => openModal('edit', orderSeq, record ? record.toData() : {})}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ],
    []
  );

  const dataConversionModalProps = useMemo(() => {
    return {
      dataFormDs,
      dataConversionDs,
      dataScriptDs,
      dataInputDs,
      dataOutputDs,
    };
  }, [dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs]);

  const handleOk = useCallback(async (orderSeq) => {
    const validate = await dataFormDs.validate();
    if (!validate) {
      return false;
    } else if (dataFormDs.current) {
      const type = dataFormDs.current.get('convertType');
      if (type === 'MODULE') {
        // 组件
        const inputValidate = await dataInputDs.validate();
        const outputValidate = await dataOutputDs.validate();
        if (!inputValidate || !outputValidate) {
          return false;
        } else {
          const formValue = dataFormDs.current.toJSONData();
          const tableValue = [...dataInputDs.toJSONData(), ...dataOutputDs.toJSONData()];
          saveDataConversionDetail({ ...formValue, moduleConvertList: tableValue, interfaceId: id, tenantId, targetFieldId: 0, orderSeq }).then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({});
              tableDs.query();
            }
          });
        }
      } else if (type === 'SOURCE') {
        // 源数据
        const conversionValidate = await dataConversionDs.validate();
        if (!conversionValidate) {
          return false;
        } else {
          const formValue = dataFormDs.current.toJSONData();
          const tableValue = dataConversionDs.toJSONData()[0];
          saveDataConversionDetail({ ...formValue, ...tableValue, interfaceId: id, tenantId, orderSeq }).then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({});
              tableDs.query();
            }
          });
        }
      } else if (type === 'CONDITION') {
        // 条件
        const scriptValidate = await dataScriptDs.validate();
        if (!scriptValidate) {
          return false;
        } else {
          const formValue = dataFormDs.current.toJSONData();
          const tableValue = dataScriptDs.toJSONData();
          const newTableValue = tableValue.filter((item: any) => item._status !== 'delete');
          saveDataConversionDetail({ ...formValue, conditionConvertList: newTableValue, interfaceId: id, tenantId, orderSeq }).then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({});
              tableDs.query();
            }
          });
        }
      }
    }
  }, [tableDs, dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs]);

  // 数据转换弹窗
  const openModal = useCallback((type: String, orderSeq: number, data?: any) => {
    dataFormDs.reset();
    dataConversionDs.forEach(record => {
      dataConversionDs.remove(record, true);
    });
    dataScriptDs.forEach(record => {
      dataScriptDs.remove(record, true);
    });
    dataInputDs.forEach(record => {
      dataInputDs.remove(record, true);
    });
    dataOutputDs.forEach(record => {
      dataOutputDs.remove(record, true);
    });

    Modal.open({
      title: type === 'create' ?
        intl.get('hitf.common.create.data.conversion').d('新建数据转换') :
        intl.get('hitf.common.edit.data.conversion').d('编辑数据转换'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <DataConversionModal editFlag={type === 'edit'} data={data || {}} {...dataConversionModalProps} />,
      className: styles['data-conversion-modal'],
      onOk: () => handleOk(orderSeq),
    });
  }, [dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs]);

  const handleOrder = useCallback(() => {
    setOrderFlag(!orderFlag);
  }, [orderFlag]);

  if (childRef) {
    // eslint-disable-next-line no-param-reassign
    childRef.current = {
      setOrderFlag,
    };
  }

  const handleDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [tableDs]);

  return (
    <SearchBarTable
      searchCode="HITF.INTERFACE_CONFIGURATION_WORKBENCH.API.DATACONVERSION"
      dataSet={tableDs}
      columns={columns}
      rowNumber
      rowDraggable={orderFlag}
      dragColumnAlign={DragColumnAlign.left}
      style={{ maxHeight: '4.2rem' }}
      buttons={[
        [TableButtonType.add, { onClick: () => openModal('create', tableDs.toData().length + 1), disabled: !id }],
        [TableButtonType.delete, { onClick: handleDelete }],
        <Button
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          onClick={handleOrder}
        >
          {
            orderFlag ? intl.get('hitf.common.close.order').d('关闭排序') : intl.get('hitf.common.open.order').d('开启排序')
          }
          <Tooltip title={intl.get('hitf.common.dataConversion.order').d('请使用拖拽方式调整组件执行顺序，修改后点击保存按钮生效')}>
            <Icon className={styles['data-conversion-info']} type="help_outline" />
          </Tooltip>
        </Button>,
      ]}
      searchBarConfig={{
        closeFilterSelector: true,
        autoQuery: Boolean(id),
      }}
    />
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(DataConversion));
