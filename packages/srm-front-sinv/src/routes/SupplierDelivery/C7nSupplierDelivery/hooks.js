import React, { useCallback } from 'react';
import { isNil, isEmpty, countBy } from 'lodash';
import { Badge } from 'choerodon-ui';
import { Table, Tooltip, Modal } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { stringify } from 'querystring';
import intl from 'utils/intl';
import getColumnsAndDataSet from './operationRecord';
import { showBigNumber } from '@/routes/components/utils/index';
import BomModal from './BomModal';
import './index.less';

function useBomModal() {
  return useCallback(({ record }) => {
    const { itemCode, asnHeaderId, asnLineId, itemName } = record.get([
      'asnHeaderId',
      'asnLineId',
      'itemCode',
      'itemName',
    ]);
    const params = {
      asnHeaderId,
      asnLineId,
      itemCode,
      itemName,
    };
    const showRecordModal = () => {
      return c7nModal({
        title: intl.get(`sinv.common.view.title.titleBom`).d('外协BOM'),
        style: { width: 700 },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: <BomModal {...params} />,
      });
    };
    return <a onClick={showRecordModal}> {intl.get(`hzero.common.button.view`).d('查看')}</a>;
  }, []);
}

function useAsnNumRender(history, type) {
  return useCallback(
    ({ record, value }) => {
      const { asnHeaderId, printStatusFlag, unReadCount = '' } = record.get([
        'asnHeaderId',
        'printStatusFlag',
        'unReadCount',
      ]);
      const handleToDetail = () => {
        if (isNil(asnHeaderId)) return false;
        history.push({
          pathname: `/sinv/supplier-delivery/c7nDetail/${asnHeaderId}`,
          search: printStatusFlag ? stringify({ printStatusFlag }) : stringify({}),
        });
      };
      if (type === 'list') {
        const rendererCount =
          unReadCount > 99 ? (
            <span className="tip">(99+)</span>
          ) : (
            <span className="tip">({unReadCount})</span>
          );
        return (
          <>
            <a onClick={handleToDetail}>{value}</a>
            {unReadCount > 0 ? (
              <Tooltip
                title={
                  intl.get(`sinv.common.model.common.unReadCount`).d(`未读消息:`) + unReadCount
                }
              >
                {rendererCount}
              </Tooltip>
            ) : null}
          </>
        );
      }

      return <a onClick={handleToDetail}>{value}</a>;
    },
    [history, type]
  );
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

function useLanguageRender() {
  return useCallback(({ value }) => {
    return showBigNumber(value);
  }, []);
}

function useUomRender(type) {
  return useCallback(
    ({ record }) => {
      const {
        unitCodeIsShow,
        weightUomCode = '',
        weightUomName = '',
        uomCode = '',
        uomName = '',
      } = record.get(['unitCodeIsShow', 'weightUomCode', 'weightUomName', 'uomCode', 'uomName']);
      if (type === 'weightUom') {
        return unitCodeIsShow === '1' ? `${weightUomCode}/${weightUomName}` : `${weightUomName}`;
      }
      return unitCodeIsShow === '1' ? `${uomCode}/${uomName}` : `${uomName}`;
    },
    [type]
  );
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

function useBadgeRender() {
  return useCallback(({ value, record }) => {
    const printFlag = record.get('printFlag');
    return (
      <Badge
        status={Number(value) === 0 ? 'error' : 'success'}
        text={
          Number(value) === 0
            ? intl.get('hzero.common.status.no').d('否')
            : Number(value) === 1 && printFlag === 1
            ? intl.get(`sinv.supplierDelivery.model.supplierDelivery.printed`).d('已打印')
            : intl.get('hzero.common.status.yes').d('是')
        }
      />
    );
  }, []);
}

function useMergeRows() {
  return useCallback(({ value, record }) => {
    const obj = {
      children: value,
      props: {},
    };
    const dataSource = record.toJSONData();
    const mergeRowsIds = countBy(dataSource, 'poProcessActionId');
    for (const poProcessActionId in mergeRowsIds) {
      // 当不存在poProcessActionId
      if (mergeRowsIds[poProcessActionId] <= 1 || poProcessActionId === 'undefined') {
        delete mergeRowsIds[poProcessActionId];
      }
    }
    const mergeIds = Object.keys(mergeRowsIds);
    if (!isEmpty(mergeIds) && mergeIds.indexOf(`${record.poProcessActionId}`) >= 0) {
      if (record.mergeRows) {
        obj.props.rowSpan = record.mergeRows;
      } else {
        obj.props.rowSpan = 0;
      }
    }
    return obj;
  }, []);
}

function useOperationRecord(customDs, customColumns) {
  return useCallback(({ record }) => {
    const { OperationDs, columns } = getColumnsAndDataSet({
      asnHeaderId: record.get('asnHeaderId'),
      changeRecordFlag: 1,
    });
    const showRecordModal = () => {
      OperationDs.query();
      return c7nModal({
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        style: { width: 820 },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: useTable(OperationDs || customDs, columns || customColumns),
      });
    };
    return (
      <a onClick={showRecordModal}>{intl.get(`hzero.common.button.operating`).d('操作记录')}</a>
    );
  }, []);
}

function useTable(dataSet, columns, customizeTable, props) {
  return customizeTable && props.code ? (
    customizeTable(
      {
        code: props?.code,
        readOnly: props.editFlag,
        __force_record_to_update__: true,
      },
      <Table
        dataSet={dataSet}
        columns={columns}
        selectionMode="none"
        style={{ maxHeight: 300 }}
        {...props}
      />
    )
  ) : (
    <Table
      dataSet={dataSet}
      columns={columns}
      selectionMode="none"
      style={{ maxHeight: 300 }}
      {...props}
    />
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

export {
  useBomModal,
  useAsnNumRender,
  useYesOrNoRender,
  useRenderMeaning,
  useLanguageRender,
  useUomRender,
  useTooltip,
  useBadgeRender,
  useMergeRows,
  useOperationRecord,
  useTable,
  c7nModal,
};
