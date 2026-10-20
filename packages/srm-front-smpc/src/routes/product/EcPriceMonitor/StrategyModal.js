import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Form,
  TextField,
  Select,
  NumberField,
  TextArea,
  Lov,
  CheckBox,
  Button,
  SelectBox,
  Tooltip,
  Modal,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Card from '@/components/Card';
import FilterBarTable from '_components/FilterBarTable';

import { isEmpty } from 'lodash';
import EcPriceMonitorDs from './EcPriceMonitorDs';
import ReminderDs from './ReminderDs';
import DimensionDs from './DimensionDs';
import { saveTreeDimensions } from './api';

const DeleteButton = observer(({ dataSet, onClick = (e) => e, children }) => (
  <Button
    funcType="flat"
    icon="delete_sweep"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {children || intl.get('hzero.common.button.batchDelete').d('批量删除')}
  </Button>
));

const StrategyModal = ({ record, handleOpenDimension, modal, ds }) => {
  const { monitorStrategyId: oldMonitorStrategyId, monitorType } =
    record?.get(['monitorStrategyId', 'monitorType']) || {};
  const [monitorStrategyId, setMonitorStrategyId] = useState(oldMonitorStrategyId);
  const formDs = useMemo(() => new DataSet(EcPriceMonitorDs(true)), []);
  const tableDs = useMemo(() => new DataSet(ReminderDs(monitorStrategyId)), []);
  // 监控维度ds
  const dimensionDs = useMemo(
    () => new DataSet(DimensionDs({ monitorType, monitorStrategyId })),
    []
  );

  const validateData = async () => {
    const formFlag = await formDs.validate();
    const tableFlag = await tableDs.validate();
    if (!formFlag || !tableFlag) return false;
    return true;
  };

  const handleSave = async (closeFlag = false) => {
    if ((await validateData()) === false) return false;
    const res = await formDs.submit();
    if (monitorStrategyId) {
      await saveTreeDimensions(formDs.current.get('monitorDimensionValues'), monitorStrategyId);
    }
    if (!monitorStrategyId && res?.success) {
      const newMonitorStrategyId = res.content?.[0]?.monitorStrategyId;
      setMonitorStrategyId(newMonitorStrategyId);
      tableDs.forEach((r) => {
        r.set('monitorStrategyId', res.content?.[0]?.monitorStrategyId);
      });
    }
    await tableDs.submit();
    ds.query(ds.currentPage);
    if (closeFlag) {
      modal.close();
      return true;
    }
    return false;
  };

  const handleSaveClose = async () => {
    if ((await validateData()) === false) return false;
    const validateOperates = async () => {
      if (
        formDs?.current?.get('ecPriceMonitorOperates')?.includes('MSG_REMIND') &&
        !tableDs.length
      ) {
        commonModal(
          intl
            .get('smpc.ecPriceMonitor.view.ecPriceMonitorOperatesValidateTip')
            .d('未维护消息提醒配置，是否继续？'),
          async () => {
            await handleSave(true);
          }
        );
        return false;
      }
      await handleSave(true);
      return true;
    };
    const commonModal = (children, onOk) =>
      Modal.confirm({
        title: intl.get('smpc.product.view.delModal.title').d('提示'),
        children,
        onOk,
      });
    if (isEmpty(formDs?.current?.get('monitorDimensionValues'))) {
      commonModal(
        intl
          .get('smpc.ecPriceMonitor.view.monitorDimensionValuesValidateTip')
          .d('未维护监控维度值，是否继续？'),
        () => {
          validateOperates();
        }
      );
      return false;
    } else {
      const res = await validateOperates();
      return res;
    }
  };

  useEffect(() => {
    modal.update({
      onOk: handleSave,
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => {
        return [
          okBtn,
          <Button onClick={() => handleSaveClose()}>
            {intl.get('smpc.product.button.saveAndClose').d('保存并关闭')}
          </Button>,
          cancelBtn,
        ];
      },
    });
  }, []);

  useEffect(() => {
    if (record) {
      const data = record.toData();
      formDs.loadData([data]);
      dimensionDs.query().then((res) => {
        if (res) {
          const { content = [] } = res || {};
          formDs.current.set({
            monitorDimensionValues: content,
          });
        }
      });
    } else {
      formDs.create({ enabledFlag: 0, calculateRule: 'GT' });
    }
  }, [formDs, record]);

  const columns = [
    { name: 'remindType', minWidth: 140, editor: true },
    {
      name: 'accountLov',
      minWidth: 200,
      editor: (r) => !!r.get('remindType'),
    },
    {
      name: 'dataIdName',
      minWidth: 200,
    },
  ];
  const saveCallback = (res) => {
    formDs.current.set({
      monitorDimensionValues: res,
    });
  };

  const handleBatchDelete = () => {
    const flag = tableDs.selected.every((r) => r.status === 'add');
    if (flag) {
      tableDs.remove(tableDs.selected);
    } else {
      tableDs.delete(tableDs.selected);
    }
  };
  return (
    <>
      <Card title={intl.get('smpc.ecPriceMonitor.view.baseInfo').d('基础信息')}>
        <Form labelLayout="float" dataSet={formDs} columns={2} useWidthPercent>
          <TextField name="strategyCode" disabled />
          <TextField name="strategyName" />
          <TextArea name="remark" colSpan={2} rows={2} style={{ height: 60 }} resize="both" />
        </Form>
      </Card>
      <Card title={intl.get('smpc.ecPriceMonitor.view.compareRule').d('监控规则')}>
        <Form labelLayout="float" dataSet={formDs} columns={2} useWidthPercent>
          <Select name="calculateRule" />
          <CheckBox name="manualShelfCheck" showHelp="tooltip" />
          <Select
            name="amplitudeType"
            showHelp="tooltip"
            help={
              <>
                <p style={{ margin: 0 }}>
                  {intl
                    .get('smpc.ecPriceMonitor.view.percentDefine')
                    .d('百分比：最新价格相较于上架价格的涨幅')}
                </p>
                <p style={{ margin: 0 }}>
                  {intl
                    .get('smpc.ecPriceMonitor.view.scaleDefine')
                    .d('数值：最新价格与阈值直接比较')}
                </p>
              </>
            }
          />
          <NumberField name="variation" />
        </Form>
      </Card>
      <Card title={intl.get('smpc.ecPriceMonitor.view.monitoringScope').d('监控范围')}>
        <Form labelLayout="float" dataSet={formDs} columns={2} useWidthPercent>
          <Select
            name="monitorType"
            onChange={() => formDs.current.set('monitorDimensionValues', [])}
          />
          <Tooltip
            title={
              monitorStrategyId
                ? ''
                : intl
                    .get('smpc.ecPriceMonitor.view.monitorDimensionValuesTip')
                    .d('请先保存策略再编辑监控维度值')
            }
          >
            <Lov
              style={{ width: '100%' }}
              name="monitorDimensionValues"
              onClick={() => handleOpenDimension(formDs.current, saveCallback)}
            />
          </Tooltip>
        </Form>
      </Card>
      <Card title={intl.get('smpc.ecPriceMonitor.view.triggerActions').d('触发动作')}>
        <Form labelLayout="float" dataSet={formDs} columns={2} useWidthPercent>
          <SelectBox name="ecPriceMonitorOperates" colSpan={2} />
        </Form>
      </Card>
      <Card title={intl.get('smpc.ecPriceMonitor.view.button.reminderConfig').d('提醒人配置')}>
        <FilterBarTable
          customizedCode="SMPC.EC_PRICE_MONITOR.REMINDER.TABLE"
          dataSet={tableDs}
          columns={columns}
          style={{ maxHeight: '543px' }}
          buttons={[
            <Button
              color="primary"
              funcType="flat"
              onClick={() => tableDs.create({}, 0)}
              icon="playlist_add"
            >
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>,
            <DeleteButton dataSet={tableDs} onClick={() => handleBatchDelete()} />,
          ]}
          filterBarConfig={{
            defaultCollpase: true,
            collpaseble: true,
            defaultSortedField: 'monitorRemindId',
          }}
        />
      </Card>
    </>
  );
};

export default observer(StrategyModal);
