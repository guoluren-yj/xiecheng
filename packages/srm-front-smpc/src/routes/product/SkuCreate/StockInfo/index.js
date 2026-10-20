import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  DataSet,
  Button,
  Table,
  Modal,
  Form,
  Select,
  TextArea,
  NumberField,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { getSkuStock } from '@/routes/product/SkuWorkbench/tableColumns';
import openStockRecord, { openNewStockRecord } from '@/routes/product/SkuStock/openStockRecord';
import EmotionFill from '@/components/EmotionFill';
import confirm from '@/routes/product/SkuWorkbench/confirm';
import { getStockEditDs } from '../ds';
import { precisionRender } from '../../utilsApi/precision';
import {
  saveData,
  saveStockOperate,
  fetchReceiveStock,
  fetchSetWarning,
  fetchItemBatch,
} from '../api';

import styles from './index.less';

const BatchEdit = observer(({ dataSet }) => {
  const [maxLength, setMaxLength] = useState(0);

  function handleOnInput(e) {
    const { value } = e.target;
    setMaxLength(value.length);
  }
  const stockOpt = dataSet?.current?.get('stockOpt');
  return (
    <Form labelLayout="float" dataSet={dataSet} columns={1}>
      <Select name="stockOpt" />
      {['INC', 'DEC'].includes(stockOpt) && <NumberField name="replenishmentStock" />}
      {stockOpt === 'SETWARNING' && <NumberField name="warningStock" />}
      <div className={styles['remark-wrap']}>
        <TextArea name="remark" cols={4} onInput={handleOnInput} />
        <div className={styles['remark-waring-msg']}>{`${maxLength}/180`}</div>
      </div>
    </Form>
  );
});

export default memo(function StockInfo(props) {
  const { tableDs, skuRecord } = props;

  const handeleCreate = () => {
    tableDs.create({}, 0);
  };

  const handleDelete = () => {
    tableDs.remove(tableDs.selected);
  };

  const handleBatchEdit = () => {
    const hasNotSave = tableDs.some((s) => !s.get('skuStockId'));
    if (hasNotSave) {
      confirm({
        content: intl
          .get('smpc.product.model.confirm.batchEditStock')
          .d('该操作会导致现有未保存数据丢失，确认要继续执行吗'),
        onOk: () => {
          openStockEditModal();
        },
      });
    } else {
      openStockEditModal();
    }
  };

  const openStockEditModal = () => {
    const batchDs = new DataSet(getStockEditDs());
    Modal.open({
      drawer: true,
      title: intl.get('smpc.workbench.view.batchMatain').d('批量编辑'),
      style: { width: 380 },
      onOk: () => handleOk(batchDs),
      children: <BatchEdit dataSet={batchDs} />,
    });
  };

  const handleOk = async (ds) => {
    const flag = await ds.validate();
    if (!flag) return false;
    const data = ds.current.toJSONData();
    const method = data.stockOpt === 'SETWARNING' ? 'POST' : 'PUT';
    // 新建行
    const notSelected = tableDs.filter((f) => !f.isSelected).map((m) => m.toData());
    const params = tableDs.selected.map((record) => {
      return {
        ...record.toData(),
        ...data,
      };
    });
    const res = getResponse(await saveData(params, method));
    if (res) {
      const queryData = [...res, ...notSelected];
      notification.success();
      tableDs.status = 'loading';
      tableDs.loadData(queryData);
      // loadData 改变了数据状态，会导致删除，显示异常
      tableDs
        .filter((f) => !f.skuStockId)
        .forEach((r) => {
          Object.assign(r, { status: 'add' });
        });
      tableDs.status = 'ready';
      skuRecord.init('skuStockList', queryData);
      return true;
    }
    return false;
  };

  const columns = useMemo(
    () => [
      {
        name: 'inventoryLov',
        width: 150,
        editor: (record) => !record.get('skuStockId'),
      },
      {
        name: 'warningStock',
        width: 120,
        editor: (record) => !record.get('skuStockId'),
        renderer: precisionRender,
      },
      {
        name: 'consumedStock',
        width: 120,
        renderer: precisionRender,
      },
      {
        name: 'surplusStock',
        width: 120,
        renderer: ({ record, name }) => {
          return getSkuStock({
            showLine: false,
            record,
            skuStockName: name,
            isCreate: !record.get('skuStockId'),
          });
        },
      },
      {
        name: 'totalStock',
        width: 120,
        editor: (record) => !record.get('skuStockId'),
        renderer: ({ value, record }) =>
          record.status === 'add'
            ? value
            : value === -1 || isNaN(value)
            ? intl.get('smpc.product.model.noLimitStock').d('无限库存')
            : precisionRender({ name: 'totalStock', record }),
      },
      {
        name: 'option',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        lock: 'right',
        renderer: ({ record }) =>
          !record.get('skuStockId') ? (
            '-'
          ) : (
            <a onClick={() => openStockRecord(record, false, true)}>
              {intl.get('smpc.product.button.stockRecord').d('库存记录')}
            </a>
          ),
      },
    ],
    []
  );

  const ObseRverButton = observer(
    ({ dataSet, onClick, children, icon, getDisabled = () => false }) => {
      const disabled = getDisabled(dataSet);
      return (
        <Button icon={icon} funcType="flat" color="primary" onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      );
    }
  );

  const buttons = useMemo(
    () => [
      <Button icon="playlist_add" onClick={handeleCreate}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <ObseRverButton
        icon="mode_edit"
        onClick={handleBatchEdit}
        dataSet={tableDs}
        getDisabled={(ds) => {
          return ds.selected.length === 0 || ds.selected.some((s) => !s.get('skuStockId'));
        }}
      >
        {intl.get('smpc.workbench.view.batchMatain').d('批量编辑')}
      </ObseRverButton>,
      <ObseRverButton
        icon="delete_sweep"
        onClick={handleDelete}
        dataSet={tableDs}
        getDisabled={(ds) => {
          return ds.selected.length === 0 || ds.selected.some((s) => s.get('skuStockId'));
        }}
      >
        {intl.get('smpc.product.button.batchDelete').d('批量删除')}
      </ObseRverButton>,
    ],
    []
  );
  return (
    <Table
      buttons={buttons}
      dataSet={tableDs}
      columns={columns}
      customizedCode="old-stock-table"
      style={{ maxHeight: `calc(100vh - 200px)` }}
    />
  );
});

const NewStockInfo = observer((props) => {
  const { tableDs, skuRecord, nonProduceInvManageFlag, receiveToItem, read = false } = props;
  const itemId = skuRecord.get('itemId');
  const [itemBatchFlag, setItemBatchFlag] = useState(false);
  useEffect(() => {
    if (itemId && nonProduceInvManageFlag) {
      fetchItemBatch(itemId).then((flag) => {
        setItemBatchFlag(flag);
      });
    }
  }, [itemId]);
  // 物料开启了非生库存和按批次管理的新领用租户, 仅查看
  const readOnly =
    read || tableDs.status === 'loading' || (itemId && nonProduceInvManageFlag && itemBatchFlag);

  useEffect(() => {
    if (readOnly) {
      tableDs.selection = false;
    } else {
      tableDs.selection = 'multiple';
    }
  }, [readOnly]);

  const handeleCreate = () => {
    tableDs.create({}, 0);
  };

  const handleDelete = () => {
    tableDs.remove(tableDs.selected);
  };

  const openStockEditModal = (type) => {
    const batchDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'operateNum',
          label: intl.get('smpc.product.model.operateNum').d('数量'),
          type: 'number',
          required: true,
        },
        {
          name: 'remark',
          label: intl.get('smpc.product.model.remark').d('备注'),
          maxLength: 180,
        },
      ],
    });
    Modal.open({
      drawer: true,
      title: !type
        ? intl.get('smpc.workbench.view.setWaning').d('设置预警')
        : type === 'MANUAL_ADD'
        ? intl.get('smpc.workbench.view.batchAddStock').d('批量增加库存')
        : intl.get('smpc.workbench.view.batchLessStock').d('批量扣减库存'),
      style: { width: 380 },
      onOk: () => handleOk(batchDs, type),
      children: (
        <Form labelLayout="float" dataSet={batchDs} columns={1}>
          <NumberField name="operateNum" />
          <TextArea name="remark" cols={4} showLengthInfo />
        </Form>
      ),
    });
  };

  // eslint-disable-next-line no-unused-vars
  const setWarning = (type = '', record) => {
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'warningStock',
          label: intl.get('sstk.stockReportWorkbench.model.maxWaningStock').d('可用库存预警'),
          type: 'number',
          step: 1,
          required: true,
        },
      ],
    });
    Modal.open({
      drawer: true,
      title: intl.get('smpc.workbench.view.setWaning').d('设置预警'),
      style: { width: 380 },
      children: (
        <>
          <Alert
            className={styles['waning-help']}
            message={intl
              .get('sstk.stockReportWorkbench.view.stockWaning.helpInfo')
              .d('当前库存数低于预警值时触发库存预警')}
            type="info"
            showIcon
            closable
          />
          <Form dataSet={ds} columns={1} labelLayout="float">
            <NumberField name="warningStock" />
          </Form>
        </>
      ),
      onOk: async () => {
        const flag = await ds.validate();
        if (!flag) return false;
        const data = ds.current.toJSONData();
        // 新建行
        const notSave = tableDs.filter((f) => !f.get('stockId')).map((m) => m.toData());
        const params = [
          {
            ...data,
            stockId: record.get('stockId'),
          },
        ];
        const res = getResponse(await fetchSetWarning(params));
        if (res) {
          tableDs.status = 'loading';
          const res2 = await fetchReceiveStock({ itemId: skuRecord.get('itemId') });
          if (res2) {
            const queryData = [...notSave, ...res2];
            notification.success();
            tableDs.loadData(queryData);
            // loadData 改变了数据状态，会导致删除，显示异常
            tableDs
              .filter((f) => !f.stockId)
              .forEach((r) => {
                Object.assign(r, { status: 'add' });
              });
            tableDs.status = 'ready';
            skuRecord.init('receiveStockOperates', queryData);
            return true;
          }
          tableDs.status = 'ready';
        }
        return false;
      },
    });
  };

  const handleOk = async (ds, type) => {
    const flag = await ds.validate();
    if (!flag) return false;
    const data = ds.current.toJSONData();
    // 新建行
    const notSave = tableDs.filter((f) => !f.get('stockId')).map((m) => m.toData());
    const params = tableDs.selected.map((record) => {
      return {
        ...record.toData(),
        ...data,
        itemId: skuRecord.get('itemId'),
        sourceSystem: 'SMPC',
      };
    });
    const res = getResponse(await saveStockOperate(params, type));
    if (res) {
      tableDs.status = 'loading';
      const res2 = await fetchReceiveStock({ itemId: skuRecord.get('itemId') });
      if (res2) {
        const queryData = [...notSave, ...res2];
        notification.success();
        tableDs.loadData(queryData);
        // loadData 改变了数据状态，会导致删除，显示异常
        tableDs
          .filter((f) => !f.stockId)
          .forEach((r) => {
            Object.assign(r, { status: 'add' });
          });
        tableDs.status = 'ready';
        skuRecord.init('receiveStockOperates', queryData);
        return true;
      }
      tableDs.status = 'ready';
    }
    return false;
  };

  const columns = useMemo(
    () => [
      {
        name: 'companyLov',
        width: 150,
        editor: (record) => !readOnly && !record.get('stockId'),
      },
      {
        name: 'organizationLov',
        width: 150,
        editor: (record) => !readOnly && !record.get('stockId'),
      },
      {
        name: 'inventoryLov',
        width: 130,
        editor: (record) => !readOnly && !record.get('stockId'),
      },
      // {
      //   name: 'locationLov',
      //   width: 130,
      //   hidden: true,
      //   editor: (record) => !readOnly && !record.get('stockId'),
      // },
      {
        name: 'currentStock',
        width: 110,
        renderer: precisionRender,
      },
      {
        name: 'lockedStock',
        width: 110,
        renderer: precisionRender,
      },
      {
        name: 'totalStock',
        width: 110,
        editor: (record) => !record.get('stockId'),
        renderer: ({ value, record }) => {
          return record.status === 'add'
            ? value
            : value === -1 || isNaN(value)
            ? intl.get('smpc.product.model.noLimitStock').d('无限库存')
            : precisionRender({ name: 'totalStock', record });
        },
      },
      {
        name: 'option',
        header: intl.get('hzero.common.action').d('操作'),
        width: 150,
        lock: 'right',
        renderer: ({ record }) =>
          !record.get('stockId') ? (
            '-'
          ) : (
            <span className="action-link">
              <a
                onClick={() =>
                  openNewStockRecord({
                    itemId: skuRecord.get('itemId'),
                    inventoryId: record.get('inventoryId'),
                  })
                }
              >
                {intl.get('smpc.product.button.stockRecord').d('库存记录')}
              </a>
              {!readOnly && (
                <a onClick={() => setWarning('SET_WARNING', record)}>
                  {intl.get('smpc.product.button.setWarning').d('设置预警')}
                </a>
              )}
            </span>
          ),
      },
    ],
    [readOnly]
  );

  const ObseRverButton = observer(
    ({ dataSet, onClick, children, icon, getDisabled = () => false }) => {
      const disabled = getDisabled(dataSet);
      return (
        <Button icon={icon} funcType="flat" color="primary" onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      );
    }
  );

  const buttons = useMemo(() => {
    if (readOnly) return [];
    return [
      <Button icon="playlist_add" onClick={handeleCreate}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <ObseRverButton
        icon="mode_edit"
        onClick={() => openStockEditModal('MANUAL_ADD')}
        dataSet={tableDs}
        getDisabled={(ds) => {
          return ds.selected.length === 0 || ds.selected.some((s) => !s.get('stockId'));
        }}
      >
        {intl.get('smpc.workbench.view.batchAddStock').d('批量增加库存')}
      </ObseRverButton>,
      <ObseRverButton
        icon="mode_edit"
        onClick={() => openStockEditModal('MANUAL_DEDUCTION')}
        dataSet={tableDs}
        getDisabled={(ds) => {
          return ds.selected.length === 0 || ds.selected.some((s) => !s.get('stockId'));
        }}
      >
        {intl.get('smpc.workbench.view.batchLessStock').d('批量扣减库存')}
      </ObseRverButton>,
      <ObseRverButton
        icon="delete_sweep"
        onClick={handleDelete}
        dataSet={tableDs}
        getDisabled={(ds) => {
          return ds.selected.length === 0 || ds.selected.some((s) => s.get('stockId'));
        }}
      >
        {intl.get('smpc.product.button.batchDelete').d('批量删除')}
      </ObseRverButton>,
    ];
  }, [readOnly]);
  // console.log('nonProduceInvManageFlag', nonProduceInvManageFlag)
  // console.log('receiveToItem', receiveToItem)
  // 不自动生成物料且未开启非生库存 || 自动生成物料但未开启非生库存
  const nonProduceEmotion =
    !read && !nonProduceInvManageFlag && (!receiveToItem || (itemId && receiveToItem));
  const batchEmotion = !read && itemId && nonProduceInvManageFlag && itemBatchFlag;
  return (
    <div className={styles['sku-stock-info']}>
      <EmotionFill
        type="stock"
        ds={read ? null : batchEmotion ? tableDs : null}
        showEmotion={nonProduceEmotion}
        // 物料开启了非生库存和按批次管理的新领用租户,且查不到库存信息时，友好提示
        emptyCom={
          batchEmotion && (
            <div className={styles['stock-empty-info']}>
              <p className={styles['main-info']}>
                {intl.get('smpc.product.view.emptyNoStock').d('暂无库存')}
              </p>
              <p className={styles['sub-info']}>
                {intl
                  .get('smpc.product.view.batchItemEmptyInfo')
                  .d('当前物料已开启批次管理，仅支持在【出入库工作台】中维护库存')}
              </p>
            </div>
          )
        }
      >
        {
          <Table
            buttons={buttons}
            dataSet={tableDs}
            columns={columns}
            customizedCode="new-stock-table"
            style={{ maxHeight: `calc(100vh - ${readOnly ? 170 : 200}px)` }}
          />
        }
      </EmotionFill>
    </div>
  );
});

export { NewStockInfo };
