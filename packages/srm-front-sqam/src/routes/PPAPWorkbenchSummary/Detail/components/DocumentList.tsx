// 交付物清单列表
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table, Button, useModal, IntlField } from 'choerodon-ui/pro';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { isEmpty } from 'lodash';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectDocListCode } from '../../utils/type';
import DocumentInfo from './DocumentInfo';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { useModalOpen } from '../../../../utils/hooks';
import QuoteDeliveryTempModal from '../../../PPAPTemplate/Detail/component/QuoteDeliveryTempModal';
import styles from '../../../PPAPWorkbench/Detail/index.less';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';
// import { filterDsDestroyed } from '../../utils/utils';


const DocumentList = () => {
  const { documentLineDs, customizeTable, documentInfoDs, headerDs, viewFlag } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const { companyName, supplierCompanyName, projectStatus, projectNum, projectName } = headerDs.current?.get(['companyName', 'supplierCompanyName', 'projectStatus', 'projectNum', 'projectName']) || {};
  const { selected } = documentLineDs;

  const editFlag = useMemo(() => {
    return ['NEW'].includes(projectStatus) && !viewFlag;
  }, [projectStatus, viewFlag]);

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
    return [
      {
        name: 'documentStatus',
        renderer: ({ text, value, record }) => <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />,
      },
      {
        name: 'documentNum',
        editor: editFlag,
        renderer: ({ value, record }) => !editFlag ? (
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
        editor: editFlag ? <IntlField />: false,
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
        name: 'documentAttachmentUuid',
        editor: editFlag,
        width: 140,
      },
      {
        name: 'templateAttachmentUuid',
        width: 140,
      },
      {
        name: 'camp',
        editor: editFlag,
        width: 120,
      },
      {
        name: 'approveMethod',
        editor: editFlag,
        width: 140,
      },
      {
        name: 'approveType',
        editor: editFlag,
        width: 140,
      },
      {
        name: 'roleNumLov',
        editor: editFlag,
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
    ];
  }, [handleGetDetail, editFlag]);

  const handleAddLine = useCallback(() => {
    documentLineDs.create({ companyName, supplierCompanyName, projectNum, projectName, '_status': 'create', documentStatus: 'UNUPLOADED', stageNum: undefined, stageId: undefined }, 0);
  }, [documentLineDs, companyName, supplierCompanyName, projectNum, projectName]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const res = await documentLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', documentLineDs));
    if (!res) return;
    documentLineDs.query(undefined, undefined, true);
  }, [documentLineDs, selected]);

  const handleAddTempLine = useCallback((selects) => {
    selects.forEach((record) => {
      documentLineDs.create({
        ...record,
        '_status': 'create',
        documentStatus: 'UNUPLOADED',
        companyName,
        supplierCompanyName,
        projectNum,
        projectName,
        templateAttachmentUuid: record?.documentAttachmentUuid,
        documentAttachmentUuid: record?.tempUUID,
      }, 0);
    });
    // documentLineDs.appendData(selects);
  }, [documentLineDs, companyName, supplierCompanyName, projectNum, projectName]);

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

  const buttons = useMemo(() => {
    if (!editFlag) return [];
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
    ];
  }, [handleAddLine, handleDeleteLine, selected, handleQuoteDeliveryTemp, editFlag]);


  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectDocListCode },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={documentLineDs}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(DocumentList);
