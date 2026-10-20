// 交付物清单列表
import React, { Fragment, useMemo, useContext, useCallback, useEffect } from 'react';
import { Table, Button, useModal, Attachment, IntlField, DataSet, Select, Lov } from 'choerodon-ui/pro';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { isEmpty } from 'lodash';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { yesOrNoRender } from 'utils/renderer';
import uuidv4 from 'uuid/v4';

import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectDocListCode, campCode, DetailProjectDocListBatchEditCode } from '../../utils/type';
import DocumentInfo from './DocumentInfo';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { useModalOpen } from '../../../../utils/hooks';
import QuoteDeliveryTempModal from '../../../PPAPTemplate/Detail/component/QuoteDeliveryTempModal';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';
import { getAttachmentUploadFlag } from '../../utils/utils';
import Approval from './Approval';
import styles from '../index.less';
import BatchEditModal from '../../../components/BatchEditModal';
import { batchEditDocumentLineDS } from '../stores/indexDS';
// import { filterDsDestroyed } from '../../utils/utils';


const DocumentList = () => {
  const { documentLineDs, documentInfoDs, customizeForm, customizeTable, itemChangeFlag, headerDs, permissionMap, typeFlag, remoteProps } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const { companyName, supplierCompanyName, projectStatus, projectNum, projectName } = headerDs.current?.get(['companyName', 'supplierCompanyName', 'projectStatus', 'projectNum', 'projectName']) || {};
  const { selected } = documentLineDs;

  const handleUpdate = useCallback(({ record, name, value }) => {
    if (name === 'camp') {
      const { _sourceFlag, documentAttachmentUuid, purchaseAttachmentUuid } = record?.get(['_sourceFlag', 'documentAttachmentUuid', 'purchaseAttachmentUuid']) || {};
      if (value === 'SUPPLIER') {
        record.set({supplierVisibleFlag: 0, documentSupplierFlag: 1});
        if (_sourceFlag === 'quote') record.set({documentAttachmentUuid: purchaseAttachmentUuid, purchaseAttachmentUuid: null});
      } else {
        record.set({supplierVisibleFlag: 1, documentSupplierFlag: 1});
        if (_sourceFlag === 'quote') record.set({purchaseAttachmentUuid: documentAttachmentUuid, documentAttachmentUuid: null});
      }
    }
    if (name === 'documentSupplierFlag' && Number(value) === 0) {
      record.set({ supplierVisibleFlag: 0 });
    }
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveType: null, roleNumLov: null });
    }
    if (name === 'approveType') {
      record.set({ roleNumLov: null });
    }
  }, []);

  useEffect(() => {
    documentLineDs.setQueryParameter('view', 'PROJECT');
    documentLineDs.addEventListener('update', handleUpdate);
    return () => {
      documentLineDs.removeEventListener('update', handleUpdate);
    };
  }, [documentLineDs, handleUpdate]);

  const editFlag = useMemo(() => {
    return (['NEW', 'PUBLISH_REJECTED'].includes(projectStatus) && !typeFlag);
  }, [projectStatus, typeFlag]);

  // 点击交付物单号侧弹框
  const handleGetDetail = useCallback((record) => {
    documentInfoDs.loadData([record]);
    modalOpen({
      drawer: true,
      closable: true,
      title: intl.get('sqam.ppap.model.document.detail').d('交付物详情'),
      className: styles['sqam-document-modal'],
      style: { width: 742 },
      children: <DocumentInfo readOnly columnsNum={2} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [documentInfoDs, modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    const columnsArr: ColumnProps[] = [
      {
        name: 'documentStatus',
        renderer: ({ value, text, record }) => {
          const statusTag = <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_DETAIL_CUX_DOCUMENT_LIST_STATUS_RENDERER', statusTag, { text, value, record, TagColor, StatusTag }) : statusTag;
        },
      },
      {
        name: 'documentNum',
        width: 120,
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        renderer: ({ value, record }) => record?.get('_status') !== 'create' && !editFlag ? (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleGetDetail(record)}
          >
            {value}
          </Button>
        ) : <span>{value}</span>,
      },
      {
        name: 'documentName',
        editor: (record) => (record?.get('_status') === 'create' || editFlag) ? <IntlField /> : false,
        width: 120,
      },
      {
        name: 'companyName',
        width: 240,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
      },
      {
        name: 'purchaseAttachmentUuid',
        editor: (record) => (record?.get('_status') === 'create' || editFlag) && getAttachmentUploadFlag({projectStatus, documentUploadPoint: record?.get('documentUploadPoint'), documentStatus: record?.get('documentStatus'), stageStatus: record?.get('stageStatus')}),
        width: 140,
      },
      {
        name: 'documentAttachmentUuid',
        width: 140,
        renderer: ({ record }) => record?.get('camp') === campCode ? null : (
          <Attachment
            readOnly
            viewMode='popup'
            funcType={FuncType.link}
            value={record?.get('documentAttachmentUuid')}
            bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
          />
        ),
      },
      {
        name: 'templateAttachmentUuid',
        width: 140,
        editor: (record) => record?.get('_status') === 'create' && !record?.get('_sourceFlag'),
      },
      {
        name: 'autoReferAttachmentFlag',
        editor: (record) => record?.get('_status') === 'create' && !record?.get('_sourceFlag'),
        renderer: ({ value, record }) => (record?.get('_status') !== 'create' || !!record?.get('_sourceFlag')) && yesOrNoRender(Number(value)),
        width: 140,
      },
      {
        name: 'camp',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 120,
      },
      {
        name: 'approveMethod',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
      {
        name: 'approveType',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
      {
        name: 'roleNumLov',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
      {
        name: 'stageLov',
        editor: (record) => record?.get('_status') === 'create',
        width: 100,
      },
      {
        name: 'stageName',
        width: 130,
      },
      {
        name: 'projectNum',
        width: 160,
      },
      {
        name: 'projectName',
      },
      // {
      //   name: 'approvedBy',
      // },
      {
        name: 'approvedOpinion',
      },
      {
        name: 'documentSupplierFlag',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        // renderer: ({ value, record }) => record?.get('_status') !== 'create' ? yesOrNoRender(Number(value)) : value,
      },
      {
        name: 'supplierVisibleFlag',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        // renderer: ({ value, record }) => record?.get('_status') !== 'create' ? yesOrNoRender(Number(value)) : value,
      },
      {
        name: 'documentUploadPoint',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
      },
      {
        name: 'appointorLov',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
      {
        name: 'roleVisibleLov',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
      {
        name: 'visibleEmployeeLov',
        editor: (record) => record?.get('_status') === 'create' || editFlag,
        width: 140,
      },
    ];
    return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_DETAIL_CUX_DOCUMENTLIST', columnsArr, {
      headerDs, documentLineDs, editFlag,
    }) : columnsArr;
  }, [handleGetDetail, editFlag, headerDs, documentLineDs, remoteProps, projectStatus]);

  const handleAddLine = useCallback(() => {
    // 手工新建，给模版附件生成一个uuid，并赋值到manualAttachmentUuid字段上
    const uuid = uuidv4();
    documentLineDs.create({ companyName, supplierCompanyName, projectNum, projectName, '_status': 'create', documentStatus: 'UNUPLOADED', stageNum: undefined, stageId: undefined, supplierVisibleFlag: '1', manualAttachmentUuid: uuid, templateAttachmentUuid: uuid }, 0);
  }, [documentLineDs, companyName, supplierCompanyName, projectNum, projectName]);

  const handleDeleteLineSubmit = useCallback(async (_?: any, data?: any) => {
    if (data) {
      // 如果有data值 是调接口删除已有数据 已经有弹框了 不需要删除提示框
      const res = await documentLineDs.setState('data', data).delete(selected, false);
      if (!res) return;
    } else {
      const res = await documentLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', documentLineDs));
      if (!res) return;
    }
    documentLineDs.query(undefined, undefined, true);
  }, [documentLineDs, selected]);
  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const flag = selected?.some((record) => record?.get('_status') !== 'create');
    // 如果有不是新建的 弹框维护原因
    if (flag) {
       modalOpen({
        drawer: true,
        title: intl.get(`sqam.ppap.model.template.cancelReason`).d('取消原因'),
        closable: true,
        editFlag: true,
        className: styles['sqam-small-modal'],
        children: <Approval isDocumentCancel handleBtnMethods={handleDeleteLineSubmit} />,
      });
    } else handleDeleteLineSubmit();
  }, [selected, handleDeleteLineSubmit, modalOpen]);


  const handleAddTempLine = useCallback(async (selects) => {
    selects.forEach((record) => {
      // const camp = record?.camp;
      // const autoReferAttachmentFlag = record?.autoReferAttachmentFlag;
      documentLineDs.create({
        ...record,
        '_status': 'create',
        '_sourceFlag': 'quote', // 标识来源为引用,切换阵营时要修改附件
        documentStatus: 'UNUPLOADED',
        companyName,
        supplierCompanyName,
        projectNum,
        projectName,
        templateAttachmentUuid: record?.documentAttachmentUuid,
        documentAttachmentUuid: null,
        purchaseAttachmentUuid: null,
      }, 0);
    });
    // documentLineDs.appendData(selects);
  }, [companyName, supplierCompanyName, documentLineDs, projectNum, projectName]);

  const handleQuoteDeliveryTemp = useCallback(() => {
    modalOpen({
      editFlag: true,
      title: intl.get('sqam.ppap.view.title.quoteDeliveryTemp').d('引用交付物模板'),
      drawer: true,
      size: 'large',
      style: { width: '1090px' },
      children: <QuoteDeliveryTempModal onOk={handleAddTempLine} />,
    });
  }, [handleAddTempLine, modalOpen]);

  const handleBatchEdit = useCallback(() => {
    const headerData: Record<string, any> = headerDs.current?.toJSONData() || {};
    if (!isEmpty(documentLineDs.selected)) {
      headerData.documentIdList = documentLineDs.selected.map((item) => item.get('documentId')).filter(Boolean);
    }
    const editorFormDs = new DataSet({
      ...batchEditDocumentLineDS(headerData),
      events: { update: handleUpdate },
    });
    const editorColumns = [
      { name: 'camp', editor: Select },
      { name: 'documentSupplierFlag', editor: Select },
      { name: 'approveMethod', editor: Select },
      { name: 'approveType', editor: Select },
      { name: 'roleNumLov', editor: Lov },
      { name: 'appointorLov', editor: Lov },
      { name: 'visibleEmployeeLov', editor: Lov },
    ];
    modalOpen({
      editFlag: true,
      title: intl.get('hzero.common.button.batchEdit').d('批量编辑'),
      size: 'small',
      children: (
        <BatchEditModal
          editorFormDs={editorFormDs}
          editorColumns={editorColumns}
          selectedListDs={documentLineDs}
          customizeForm={customizeForm}
          customizeOptions={{ code: DetailProjectDocListBatchEditCode }}
        />
      ),
      onOk: async () => {
        const res = await editorFormDs.submit();
        if (!res) return false;
        await documentLineDs.query(documentLineDs.currentPage, undefined, true);
        runInAction(() => {
          documentLineDs.all.forEach((record) => {
            record.reset();
            if (record.status === RecordStatus.add) {
              record.set(editorFormDs.current?.toJSONData() || {});
            }
          });
        });
      },
    });
  }, [
    headerDs,
    modalOpen,
    handleUpdate,
    customizeForm,
    documentLineDs,
  ]);

  const buttons = useMemo(() => {
    if (!itemChangeFlag && !editFlag) return [];
    // 选中的有非待提交状态的不能删除
    const statusFlag = selected.some((v) => v?.get('documentStatus') !== 'UNUPLOADED');
    return [
      [TableButtonType.add, { onClick: handleAddLine }] as [TableButtonType, TableButtonProps],
      [TableButtonType.delete, { onClick: handleDeleteLine, disabled: isEmpty(selected) || statusFlag, children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
      <Button
        onClick={handleQuoteDeliveryTemp}
        color={ButtonColor.primary}
        icon='usb'
      >
        {intl.get('sqam.ppap.view.title.quoteDeliveryTemp').d('引用交付物模板')}
      </Button>,
      permissionMap?.get('documentBatchEdit') && (
        <Button icon="mode_edit" onClick={handleBatchEdit} disabled={!documentLineDs.length}>
          {isEmpty(selected)
            ? intl.get('sqam.common.view.button.batchEdit').d('批量编辑')
            : intl.get('sqam.common.view.button.selectedBatchEdit').d('勾选批量编辑')}
        </Button>
      ),
    ];
  }, [itemChangeFlag, handleAddLine, handleDeleteLine, selected, handleQuoteDeliveryTemp, editFlag, documentLineDs, permissionMap, handleBatchEdit]);


  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectDocListCode },
        <Table
          buttons={buttons}
          columns={columns}
          dataSet={documentLineDs}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(DocumentList);
