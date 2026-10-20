import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useState, Fragment, useEffect } from 'react';
import { DataSet, Table, Modal, Button, Attachment, Icon, Spin } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { flow, isNil } from 'lodash';
import Viewer from 'react-viewer';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAttachmentUrl, getCurrentOrganizationId, getResponse } from 'utils/utils';

import InvoiceStep from './InvoiceStep';
import type { DocType } from './storeDS';
import InvoiceDetail from '../InvoiceDetail';
// import OperationRecord from './OperationRecord';
import ColumnBtnGroup from '../../../Components/ColumnBtnGroup';
import { queryTenderHeaderData, queryServiceHeaderData } from '../../utils/api';
import { previewPdf, getAttachmentUrlWithToken, getSelectedNegActConfirmMsg } from '../../../../utils/utils';
import { invEntryListDS, feeIdNameMap, primaryKeyMap, feeInvStatusNameMap } from './storeDS';
import { validateTenderInvList, validateServiceInvList, submitTenderInvList, submitServiceInvList } from './api';
import commonStyles from '../../../common.less';

const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';

interface InvoiceEntryProps {
  modal?: any,
  docType: DocType,
  feeRecord: DSRecord | null | undefined, // 列表页传入record
  okCallback: Function,
}

const queryFeeDetailFuncMap: Record<DocType, Function> = {
  tender: queryTenderHeaderData,
  service: queryServiceHeaderData,
};

const validateInvoiceList: Record<DocType, Function> = {
  tender: validateTenderInvList,
  service: validateServiceInvList,
};

const submitInvoiceList: Record<DocType, Function> = {
  tender: submitTenderInvList,
  service: submitServiceInvList,
};

const InvoiceEntry = flow(
  observer,
  formatterCollections({ code: ['ssta.invoice', 'ssta.common'] }),
)((props: (InvoiceEntryProps)) => {

  const { modal, docType, feeRecord, okCallback } = props;
  const primaryKey = primaryKeyMap[docType]; // 发票表主键名
  const feeInvStatusName = feeInvStatusNameMap[docType]; // 招标文件费或服务费头表取消状态名
  const feeInvStatus = feeRecord?.get([feeInvStatusName]) || {};
  const viewFlag = feeInvStatus === 'INVOICED';

  const [viewFileUrl, setViewFileUrl] = useState<string>('');
  const invEntryListDs = useMemo<DataSet>(() => new DataSet(invEntryListDS(docType, feeRecord)), [docType, feeRecord]);

  const handleSubmit = useCallback(async () => {
    const feeData = invEntryListDs.getState('feeData') || feeRecord?.toData();
    const validateOk = async () => {
      invEntryListDs.status = DataSetStatus.loading;
      const submitRes = getResponse(await submitInvoiceList[docType](feeData));
      invEntryListDs.status = DataSetStatus.ready;
      if (!submitRes) return false;
      notification.success({});
      if (okCallback) okCallback();
    };
    invEntryListDs.status = DataSetStatus.loading;
    const validateRes = getResponse(await validateInvoiceList[docType](feeData));
    invEntryListDs.status = DataSetStatus.ready;
    if (!validateRes) return false;
    const { responseStatus, responseMessage } = validateRes || {};
    if (responseStatus === 'WARNING') {
      const actionName = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: responseMessage,
      });
      if (actionName === 'ok') {
        return validateOk();
      } else {
        return false;
      }
    } else {
      return validateOk();
    }
  }, [okCallback, docType, invEntryListDs, feeRecord]);

  useEffect(() => {
    if (modal) {
      invEntryListDs.pageSize = 20;
      modal.handleOk(handleSubmit);
    }
    if (viewFlag) invEntryListDs.selection = false;
  }, [modal, viewFlag, invEntryListDs, handleSubmit]);

  // 新增删除行都会更新头版本，因此重新查询
  const handleRefreshAll = useCallback(async () => {
    okCallback();
    invEntryListDs.query();
    const feeIdName = feeIdNameMap[docType]; // 来源单据主键名称
    invEntryListDs.status = DataSetStatus.loading;
    const res = getResponse(await queryFeeDetailFuncMap[docType](feeRecord?.get([feeIdName])));
    invEntryListDs.status = DataSetStatus.ready;
    if (!res) return;
    invEntryListDs.setState('feeData', res);
    return res;
  }, [docType, invEntryListDs, feeRecord, okCallback]);

  const handleOpenInvoiceStep = useCallback((invoiceHeaderId?: string) => {
    const title = invoiceHeaderId
      ? intl.get('ssta.common.view.title.modifyInfo').d('修改信息')
      : intl.get('ssta.common.view.title.manuallyNew').d('手工新建');
    const feeData = invEntryListDs.getState('feeData') || feeRecord?.toData();
    Modal.open({
      title,
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-medium-modal'],
      children: (
        <InvoiceStep
          docType={docType}
          feeData={feeData}
          invoiceHeaderId={invoiceHeaderId}
          onRefreshAll={handleRefreshAll}
        />
      ),
      footer: null,
    });
  }, [handleRefreshAll, feeRecord, docType, invEntryListDs]);

  const handleViewInvoiceDetail = useCallback((invoiceHeaderId: string | number) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
      className: commonStyles['ssta-medium-modal'],
      title: intl.get('ssta.common.view.title.invoiceDetail').d('发票详情'),
      children: <InvoiceDetail docType={docType} invoiceHeaderId={invoiceHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [docType]);

  // const handleViewOperationRecord = useCallback((invoiceHeaderId: string | number) => {
  //   Modal.open({
  //     drawer: true,
  //     closable: true,
  //     key: Modal.key(),
  //     title: intl.get('hzero.common.button.operation').d('操作记录'),
  //     className: commonStyles['ssta-medium-modal'],
  //     children: <OperationRecord invoiceHeaderId={invoiceHeaderId} />,
  //     okCancel: false,
  //     okText: intl.get('hzero.common.button.close').d('关闭'),
  //   });
  // }, []);

  const handleViewFile = useCallback((fileUrl) => {
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    else window.open(fileUrl);
  }, []);

  const handleViewInvoiceFile = useCallback((fileUrl) => {
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(fileUrl);
    setViewFileUrl(fileUrl);
  }, []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        name: 'operation',
        width: 120,
        renderer: ({ record }) => {
          const invoiceHeaderId = record?.get(primaryKey);
          return (
            <ColumnBtnGroup
              buttons={[
                {
                  name: 'edit',
                  text: intl.get('hzero.common.button.edit').d('编辑'),
                  onClick: () => handleOpenInvoiceStep(invoiceHeaderId),
                  // 开票状态不等于已开票可以编辑
                  showFlag: !viewFlag,
                },
                {
                  name: 'view',
                  text: intl.get('hzero.common.button.view').d('查看'),
                  onClick: () => handleViewInvoiceDetail(invoiceHeaderId),
                },
                // {
                //   name: 'operation',
                //   text: intl.get('hzero.common.button.operation').d('操作记录'),
                //   onClick: () => handleViewOperationRecord(invoiceHeaderId),
                // },
              ]}
            />
          );
        },
      },
      {
        width: 150,
        name: 'invoiceCode',
      },
      {
        width: 150,
        name: 'invoiceNum',
      },
      {
        width: 120,
        name: 'invoicingDate',
      },
      {
        width: 120,
        name: 'netAmount',
      },
      {
        width: 120,
        name: 'taxAmount',
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'invoiceTypeMeaning',
      },
      {
        width: 120,
        name: 'deductFlag',
        renderer: ({ value }) => isNil(value) ? value : yesOrNoRender(Number(value)),
      },
      {
        width: 120,
        name: 'checkCode',
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supUnifiedSocialCode',
        width: 180,
      },
      {
        name: 'purUnifiedSocialCode',
        width: 190,
      },
      {
        width: 120,
        name: 'invoiceUrl',
      },
      {
        name: 'attachmentUuid',
        width: 120,
        editor: (record) => {
          return (
            <Attachment
              readOnly
              viewMode='popup'
              funcType={FuncType.link}
              value={record.get('attachmentUuid')}
              bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
            />
          );
        },
      },
      {
        name: 'fileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewFile(value)}>
              <Icon type="find_in_page" />
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      },
      (false && {
        name: 'ocrFileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewInvoiceFile(value)}>
              <Icon type="find_in_page" />
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      }) as ColumnProps,
      (false && {
        name: 'ofdFileUrl',
        width: 120,
        renderer: ({ value }) => {
          return value ? (
            <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => handleViewInvoiceFile(value)}>
              {intl.get('hzero.common.button.download').d('下载')}
            </Button>
          ) : null;
        },
      }) as ColumnProps,
    ];
  }, [handleOpenInvoiceStep, handleViewInvoiceDetail, handleViewFile, handleViewInvoiceFile, primaryKey, viewFlag]);

  const handleCreateManually = useCallback(() => {
    handleOpenInvoiceStep();
  }, [handleOpenInvoiceStep]);

  const handleDeleteLine = useCallback(async () => {
    const res = await invEntryListDs.delete(invEntryListDs.selected, getSelectedNegActConfirmMsg('delete'));
    if (!res) return;
    handleRefreshAll();
  }, [invEntryListDs, handleRefreshAll]);

  const buttons = useMemo<Buttons[]>(() => {
    if (viewFlag) return [];
    return [
      [TableButtonType.add, { onClick: handleCreateManually }],
      [TableButtonType.delete, {
        icon: 'delete_sweep',
        children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
        onClick: handleDeleteLine,
      }],
    ];
  }, [handleCreateManually, handleDeleteLine, viewFlag]);

  const tableStyle = useMemo(() => ({ maxHeight: modal ? 'calc(100% - 80px)' : 430 }), [modal]);

  const viewImages = useMemo(() => {
    const downloadUrl = (getAttachmentUrl as any)(viewFileUrl, bucketName, tenantId, bucketDirectory);
    return [
      {
        alt: '',
        downloadUrl,
        src: downloadUrl,
      },
    ];
  }, [viewFileUrl]);

  if (!feeRecord) return <Spin />;

  return (
    <Fragment>
      <Table
        buttons={buttons}
        columns={columns}
        style={tableStyle}
        dataSet={invEntryListDs}
        customizedCode="SSTA.SOURCING_COST_PUR.INV_ENTRY"
      />
      <Viewer
        noNavbar
        downloadable
        noImgDetails
        scalable={false}
        changeable={false}
        images={viewImages}
        visible={Boolean(viewFileUrl)}
        onClose={() => setViewFileUrl('')}
      />
    </Fragment>
  );
}) as (props: InvoiceEntryProps) => ReactElement;

export default InvoiceEntry;

