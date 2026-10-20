import React, { useCallback } from 'react';
import { isNil } from 'lodash';
import { Tooltip, Modal, Spin, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import { stringify } from 'querystring';
import intl from 'utils/intl';
import InventoryModal from './components/InventoryModal';
import './index.less';

function useAsnNumRender(history, activeKey, sureSupplier, isHasLineNum) {
  return useCallback(({ record, value }) => {
    const { invHeaderId, processFactory, strategyName, invLineNum } = record.get([
      'invHeaderId',
      'processFactory',
      'strategyName',
      'invLineNum',
    ]);
    const handleToDetail = () => {
      if (isNil(invHeaderId)) return false;
      history.push({
        pathname: sureSupplier
          ? `/sinv/supplier-collaborative-workbench/${invHeaderId}`
          : `/sinv/purchaser-collaborative-workbench/${invHeaderId}`,
        search: activeKey ? stringify({ activeKey, processFactory, strategyName }) : stringify({}),
      });
    };
    return <a onClick={handleToDetail}>{isHasLineNum ? `${`${value }-${ invLineNum}`}` : value}</a>;
  }, []);
}

function useYesOrNoRender() {
  return useCallback(({ value }) => {
    return yesOrNoRender(+value);
  }, []);
}

function useRenderMeaning(name) {
  return useCallback(({ value, record }) => {
    return <span>{value && record.get(`${name}Meaning`)}</span>;
  }, []);
}

function useTooltip(props) {
  return useCallback(({ value }) => {
    return (
      <Tooltip title={value} {...props}>
        {value}
      </Tooltip>
    );
  }, []);
}

function useTable(dataSet, columns, props) {
  return props.customizeTable && props?.code ? (
    props.customizeTable(
      {
        code: props?.code,
        readOnly: props.editFlag,
        __force_record_to_update__: true,
      },
      <Table
        virtual
        pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
        virtualCell
        dataSet={dataSet}
        columns={columns}
        style={{ maxHeight: 420 }}
        {...props}
      />
    )
  ) : (
    <Spin spinning={props?.loading ?? false}>
      <Table
        virtual
        pagination={{ pageSizeOptions: ['10', '20', '50', '100'] }}
        virtualCell
        dataSet={dataSet}
        columns={columns}
        style={{ maxHeight: 420 }}
        {...props}
      />
    </Spin>
  );
}

function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

function useInventoryModal(HeaderDs) {
  return useCallback(({ record }) => {
    const showRecordModal = () => {
      return c7nModal({
        title: intl.get(`sinv.inventoryBench.view.title.consumeDetail`).d('发料消耗明细'),
        style: { width: 742 },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: <InventoryModal HeaderDs={HeaderDs} lineData={record.toJSONData()} />,
      });
    };
    return record.get('invLineNum') ? (
      <a onClick={showRecordModal}> {intl.get(`hzero.common.button.view`).d('查看')}</a>
    ) : (
      '-'
    );
  }, []);
}

function useColorRender() {
  return useCallback(({ record }) => {
    const value = record.get('invStatusMeaning');
    const invStatus = record.get('invStatus');
    let color = '';
    if (['FINISHED'].includes(invStatus)) {
      // 完成
      color = 'success';
    } else if (
      [
        'IN_SUPPLIER_REJECTED',
        'IN_SUPPLIER_SHIPPED_REJECTED',
        'PURCHASE_REVIEW_REJECTED',
        'SUPPLIER_REJECTED',
        'PURCHASE_REJECTED',
        'SUPPLIER_SHIPPED_REJECTED',
        'OUT_SUPPLIER_REJECTED',
        'IN_SUPPLIER_REJECTED',
        'PURCHASE_REVIEW_REJECTED',
      ].includes(invStatus)
    ) {
      // 拒绝
      color = 'error';
    } else if (
      [
        'NEW',
        'PURCHASE_BE_CONFIRM',
        'SUPPLIER_BE_CONFIRM',
        'SUPPLIER_SHIPPED_BE_CONFIRM',
        'OUT_SUPPLIER_BE_CONFIRM',
        'N_SUPPLIER_BE_CONFIRM',
        'IN_SUPPLIER_SHIPPED_BE_CONFIRM',
        'IN_SUPPLIER_REJECTED',
        'PURCHASE_BE_REVIEW',
        'IN_SUPPLIER_BE_CONFIRM',
      ].includes(invStatus)
    ) {
      color = 'info';
    } else if (['CANCELLED', 'DELETE'].includes(invStatus)) {
      color = 'warn';
    }

    const tagColors = {
      success: 'green',
      warn: 'gray',
      error: 'red',
      info: 'yellow',
    };

    return (
      <Tag color={tagColors[color]} style={{ border: 'none' }}>
        <span> {value}</span>
      </Tag>
    );
  }, []);
}

export {
  useAsnNumRender,
  useYesOrNoRender,
  useRenderMeaning,
  useTooltip,
  useTable,
  c7nModal,
  useInventoryModal,
  useColorRender,
};
