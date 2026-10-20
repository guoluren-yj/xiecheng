// 交付物清单列表
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table, Button, useModal } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailProjectDocListCode } from '../../utils/type';
import DocumentInfo from './DocumentInfo';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { useModalOpen } from '../../../../utils/hooks';
import styles from '../../../PPAPWorkbench/Detail/index.less';
// import { filterDsDestroyed } from '../../utils/utils';


const DocumentList = () => {
  const { documentLineDs, customizeTable, documentInfoDs } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
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
        renderer: ({ text, value, record }) => (
          <StatusTag value={text} flag color={record?.get('stageStatus') === 'NOT_STARTED' ? 'gray' : TagColor[value] || 'success'} />
        ),
      },
      {
        name: 'documentNum',
        width: 120,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleGetDetail(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'documentName',
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
      },
      {
        name: 'campMeaning',
      },
      {
        name: 'stageNum',
        width: 130,
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
      {
        name: 'approvedBy',
        renderer: ({ record }) => {
          const { approveType, employeeName, roleName } = record?.get(['approveType', 'employeeName', 'roleName']) || {};
          return approveType === 'EMPLOYEE' ? employeeName : roleName;
        },
      },
      {
        name: 'approvedOpinion',
      },
    ];
  }, [handleGetDetail]);


  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectDocListCode },
        <Table
          columns={columns}
          dataSet={documentLineDs}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(DocumentList);
