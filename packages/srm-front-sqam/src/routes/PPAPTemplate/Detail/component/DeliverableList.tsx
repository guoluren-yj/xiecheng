// 交付物配置
import React, { Fragment, useMemo, useContext, useCallback, useEffect } from 'react';
import { Table, Button, useModal } from 'choerodon-ui/pro';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { Store } from '../stores/StoreProvider';
import type { StoreValueType } from '../stores/StoreProvider';
import QuoteDeliveryTempModal from './QuoteDeliveryTempModal';
import { useModalOpen } from '../../../../utils/hooks';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';


const DeliverableList = () => {
  const { viewFlag, deliverableLineDs, headerDs, customizeTable } = useContext<StoreValueType>(Store);


  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const templateId = headerDs.current?.get('templateId');

  const handleUpdate = useCallback(({ value, record, name }) => {
    if (name === 'camp') {
      if (value === 'PURCHASER') {
        record.set({supplierVisibleFlag: 1, documentSupplierFlag: 1});
      } else record.set({supplierVisibleFlag: 0, appointorLov: null, documentSupplierFlag: 1});
    }
    if (name === 'documentSupplierFlag' && value === 0) {
      record.set({ supplierVisibleFlag: 0 });
    }
  }, []);

  useEffect(() => {
    deliverableLineDs.addEventListener('update', handleUpdate);
    return () => {
      deliverableLineDs.removeEventListener('update', handleUpdate);
    };
  }, [deliverableLineDs, handleUpdate]);

  useEffect(() => {
    deliverableLineDs.query();
  }, [deliverableLineDs]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'documentNum',
        editor: !viewFlag,
      },
      {
        name: 'documentName',
        editor: !viewFlag,
      },
      {
        name: 'documentAttachmentUuid',
        editor: !viewFlag,
      },
      {
        name: 'autoReferAttachmentFlag',
        editor: !viewFlag,
        renderer: ({ value }) => viewFlag && yesOrNoRender(Number(value)),
        width: 150,
      },
      {
        name: 'camp',
        editor: !viewFlag,
      },
      {
        name: 'documentSupplierFlag',
        editor: !viewFlag,
        renderer: ({ value, record }) => record?.get('camp') === 'PURCHASER' && viewFlag && yesOrNoRender(Number(value)),
        width: 150,
      },
      {
        name: 'supplierVisibleFlag',
        editor: !viewFlag,
        renderer: ({ value, record }) => record?.get('camp') === 'PURCHASER' && viewFlag && yesOrNoRender(Number(value)),
        width: 150,
      },
      {
        name: 'documentUploadPoint',
        editor: !viewFlag,
      },
      {
        name: 'approveMethod',
        editor: !viewFlag,
      },
      {
        name: 'approveType',
        editor: !viewFlag,
      },
      {
        name: 'roleNumLov',
        editor: !viewFlag,
      },
      {
        name: 'appointorLov',
        editor: !viewFlag,
        width: 150,
      },
      {
        name: 'roleVisibleLov',
        editor: !viewFlag,
        width: 150,
      },
      {
        name: 'visibleEmployeeLov',
        editor: !viewFlag,
        width: 150,
      },
    ];
  }, [viewFlag]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    deliverableLineDs.create({ templateId }, 0);
  }, [deliverableLineDs, templateId]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = deliverableLineDs;
    const res = await deliverableLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', deliverableLineDs));
    if (!res) return;
    deliverableLineDs.query(undefined, undefined, true);
  }, [deliverableLineDs]);

  // 保存
  // const handleSave = useCallback(async () => {
  //   deliverableLineDs.dataToJSON = DataToJSON.all;
  //   const res = await deliverableLineDs.forceSubmit();
  //   deliverableLineDs.dataToJSON = DataToJSON.selected;
  //   if (!res) return;
  //   deliverableLineDs.query(undefined, undefined, true);
  // }, [deliverableLineDs]);

  const handleAddTempLine = useCallback((tempSelected) => {
    // 从上新增
    tempSelected.forEach((record) => {
      deliverableLineDs.create({
        ...record,
        sourceTemplateDocumentId: record?.templateDocumentId,
        documentAttachmentUuid: record?.tempUUID,
        templateId, templateDocumentId: null,
      }, 0);
    });
  }, [deliverableLineDs, templateId]);

  // 引用交付物模板
  const quoteDeliveryTemp = useCallback(() => {
    modalOpen({
      editFlag: true,
      title: intl.get('sqam.ppap.view.title.quoteDeliveryTemp').d('引用交付物模板'),
      drawer: true,
      size: 'large',
      style: { width: '1090px' },
      children: <QuoteDeliveryTempModal onOk={handleAddTempLine} />,
    });
  }, [handleAddTempLine, modalOpen]);

  const buttons = useMemo(() => {
    return viewFlag ?
      [] :
      [
        [TableButtonType.add, { onClick: handleAddLine }] as [TableButtonType, TableButtonProps],
        [TableButtonType.delete, { onClick: handleDeleteLine, icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
        <Button wait={1500} icon='usb' onClick={quoteDeliveryTemp}>{intl.get('sqam.ppap.view.title.quoteDeliveryTemp').d('引用交付物模板')}</Button>,
      ];
  }, [viewFlag, handleAddLine, handleDeleteLine, quoteDeliveryTemp]);

  return (
    <Fragment>
      {customizeTable(
        { code: 'SQAM.PPAP_DELIVERY_TEMP_DEFINITION_DETAIL.DELIERABLE_LIST' },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={deliverableLineDs}
          selectionMode={viewFlag ? SelectionMode.none : SelectionMode.rowbox}
          style={{ maxHeight: `calc(100vh - 280px)` }}
        />
      )}
    </Fragment>

  );
};

export default observer(DeliverableList);
