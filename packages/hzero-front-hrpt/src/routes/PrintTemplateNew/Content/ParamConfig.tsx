/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { DataSet, Table, Button, Select, TextField, Modal, Tooltip, Form, Lov } from 'choerodon-ui/pro';
import { Icon, Popconfirm, Tag } from 'choerodon-ui';
import type { Record } from 'choerodon-ui/dataset';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetStatus, RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'hzero-front/lib/utils/intl';

import { saveDocumentParam, deleteDocumentParam } from '@/services/printTemplateService';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { IStore } from '../store';
import Store, { getParamTableDsConfig, getFieldTableDsConfig } from '../store';
import SelectFieldModal from './SelectFieldModal';
import styles from '../index.less';

const ParamConfig = observer(() => {
  const { isTenant, tenantId, currentDocument: { docId } = {}, canEdit }: IStore = useContext<any>(Store).store;
  const modalRef = useRef();
  const tableDs = useMemo(() => {
    return new DataSet(getParamTableDsConfig());
  }, []);

  useEffect(() => {
    if (!isNil(docId)) {
      tableDs.setQueryParameter('docId', docId);
      tableDs.query();
    }
  }, [docId, tableDs]);

  const handleModalSubmit = useCallback((dataSet: DataSet, record: Record) => {
    const { selected } = dataSet;
    if (!selected || selected.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据'),
      });
      return false;
    }
    const { fieldCode, fieldName, modelCode } = selected[0].get(['fieldCode', 'fieldName', 'modelCode']);
    record.set('fieldCode', fieldCode);
    record.set('fieldName', fieldName);
    record.set('modelCode', modelCode);
    return true;
  }, [tenantId]);

  const handleOpenFieldModal = useCallback((dataSet: DataSet) => {
    const ds = new DataSet(getFieldTableDsConfig());
    modalRef.current = Modal.open({
      title: intl.get('hrpt.printTemplate.view.message.selectField').d('选择字段'),
      style: {
        width: '700px',
      },
      closable: true,
      children: (
        <SelectFieldModal handleModalSubmit={handleModalSubmit} lineRecord={dataSet.current!} dataSet={ds} docId={docId} modalRef={modalRef} />
      ),
      onOk: () => handleModalSubmit(ds, dataSet.current!),
    });
  }, [docId, handleModalSubmit]);

  const handleClearValue = useCallback((ds: DataSet, fieldName: string) => {
    if (ds && ds.current) {
      ds.current.set(fieldName, undefined);
    }
  }, []);

  const handleCancleEdit = useCallback((dataSet: DataSet, record: Record) => {
    if (record.status === 'add') {
      dataSet.remove(record);
    } else {
      record.reset();
    }
  }, []);

  const handleEdit = useCallback((record: Record) => {
    record.status = RecordStatus.update;
  }, []);

  const handleEnable = useCallback(async (record: Record) => {
    const param = {
      ...record.toData(),
      enabledFlag: record.get('enabledFlag') === 1 ? 0 : 1,
    };
    tableDs.status = DataSetStatus.loading;
    const res = await saveDocumentParam([param]);
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
    } else {
      tableDs.status = DataSetStatus.ready;
    }
  }, []);

  const handleDelete = useCallback(async (record: Record) => {
    const { docParamId, tenantId: recordTenantId } = record.get(['docParamId', 'tenantId']);
    tableDs.status = DataSetStatus.loading;
    const res = await deleteDocumentParam({ docParamId, tenantId: recordTenantId });
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
    } else {
      tableDs.status = DataSetStatus.ready;
    }
  }, [tableDs]);

  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value, record }) => {
          const commonProps = { border: false };
          if (record && record.get("deprecatedFlag")) {
            return (
              <Tag color='gray' {...commonProps}>
                {intl.get("hzero.common.status.deprecated").d("已弃用")}
                <Tooltip title={intl.get('hrpt.common.view.title.deprecatedField2').d('该字段已在业务对象中删除，无法在条件策略配置规则中使用，如有需要请联系对象所属功能团队。')}>
                  <Icon type="help" style={{color: "#868d9c", fontSize: "14px", lineHeight: "20px", height: "22px"}} />
                </Tooltip>
              </Tag>
            );
          }
          if (value) {
            return <Tag color='green' {...commonProps}>{intl.get("hzero.common.status.enabled").d("启用")}</Tag>;
          } else {
            return <Tag color='orange' {...commonProps}>{intl.get("hzero.common.status.disabled").d("禁用")}</Tag>;
          }
        },
      },
      {
        name: 'fieldCode',
      },
      {
        name: 'fieldName',
      },
      {
        name: 'fieldWidget',
      },
      {
        name: 'sourceCode',
      },
      isTenant && {
        key: 'type',
        header: intl.get('hrpt.printTemplate.view.title.type').d('类型'),
        renderer: ({ record }) => {
          const commonProps = { border: false };
          if (record && (String(record.get('tenantId')) === String(tenantId) || record.status === RecordStatus.add)) {
            return <Tag color="green" {...commonProps}>{intl.get('hzero.common.custom').d('自定义')}</Tag>;
          } else {
            return <Tag color="orange" {...commonProps}>{intl.get('hzero.common.predefined').d('预定义')}</Tag>;
          }
        },
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        lock: 'right',
        renderer: ({ dataSet, record }) => {
          if (!dataSet || !record) {
            return;
          }
          if ([RecordStatus.add, RecordStatus.update].includes(record.status)) {
            return (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => {
                  handleCancleEdit(dataSet, record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            );
          } else if (!isTenant || (record && String(record.get('tenantId')) === String(tenantId))) {
            const operators: any[] = [];
            operators.push(
              <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleEnable(record)}>
                {record && record.get('enabledFlag') === 1
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
              </Button>,
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.deleteChooseRecord').d('是否删除选择记录?')}
                onConfirm={() => handleDelete(record)}
              >
                <Button funcType={FuncType.link} color={ButtonColor.primary}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Popconfirm>,
            );
            return operators;
          }
        },
      },
    ].filter(Boolean) as ColumnProps[];
  }, [
    isTenant,
    tenantId,
    handleOpenFieldModal,
    handleClearValue,
    handleCancleEdit,
    handleEdit,
    handleEnable,
    handleDelete,
  ]);

  const handleSaveParam = useCallback(async (data) => {
    const flag = await tableDs.validate();
    if (!flag) {
      return;
    }

    tableDs.status = DataSetStatus.loading;
    const res = await saveDocumentParam([{ ...data, docId, tenantId }]);
    if (getResponse(res)) {
      notification.success({});
      tableDs.query();
    } else {
      tableDs.status = DataSetStatus.ready;
    }
  }, [tableDs, docId]);
  const openParamEdit = useCallback((createFlag, record) => {
    let data = {};
    const ds = new DataSet(getParamTableDsConfig());
    if (!createFlag && record) {
      data = record.toJSONData();
    }
    ds.loadData([data]);
    ds.forEach(r => r.status = RecordStatus.update);
    const FieldClear = observer<any>((props) => {
      return props.ds.current && props.ds.current.get("fieldCode") && (
        <Icon type='close' onClick={() => handleClearValue(props.ds, "fieldCode")} />
      );
    });
    Modal.open({
      drawer: true,
      title: createFlag
        ? intl.get("hrpt.printTemplate.view.title.createParam").d("新增参数")
        : intl.get("hrpt.printTemplate.view.title.editParam").d("编辑参数"),
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={ds} labelLayout={LabelLayout.float}>
          <TextField
            readOnly
            className={styles['select-field-input']}
            name='fieldCode'
            onClear={() => handleClearValue(ds, 'fieldCode')}
            suffix={
              <>
                <FieldClear ds={ds} />
                <Icon type='search' onClick={() => handleOpenFieldModal(ds)} />
              </>
            }
            clearButton
          />
          <TextField name="fieldName" disabled />
          <Select
            optionsFilter={(r) => !["SECTION", "GRID", "FORM", "EMPTY"].includes(r.get("value"))}
            name="fieldWidget"
          />
          <Lov name="sourceCode" />
        </Form>
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: () => {
        return handleSaveParam(ds.current!.toJSONData());
      },
    });
  }, [handleSaveParam, tableDs]);
  const tableButtons = useMemo(() => {
    if (!canEdit) {
      return [];
    }
    return [
      <Button color={ButtonColor.primary} funcType={FuncType.flat} icon="playlist_add" onClick={() => openParamEdit(true, undefined)}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
    ];
  }, [handleSaveParam, canEdit]);

  return (
    <div>
      <Table dataSet={tableDs} columns={columns} buttons={tableButtons} customizedCode='HRPT_PRINT_TEMPLATE_PARAM_CONFIG' />
    </div>
  );
});

export default memo(ParamConfig);