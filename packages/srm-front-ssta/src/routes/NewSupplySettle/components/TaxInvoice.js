/*
 * @Description: 采购方结算单-录入税务发票
 * @Date: 2022-02-04 14:58:13
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import { Table, Button, Icon, useModal, Modal, Tooltip, Attachment } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react';
import Viewer from 'react-viewer';
import { math } from 'choerodon-ui/dataset';

import querystring from 'querystring';
import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import NewCommonImport from 'components/Import';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import ExcelExportPro from 'components/ExcelExportPro';
import {
  getResponse,
  getAttachmentUrl,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
// import uuidv4 from 'uuid/v4';

import PicturesWall from '@/routes/PurchaseInvoicePool/OcrUpload';
import AiInvoiceUpload from '@/routes/Components/AiInvoiceUpload';
import { registerAiInvoiceRecognizeSocket } from '@/services/aiInvoiceRecognizeSocket';
import { openAiInvoiceRecognizeRecord } from '@/routes/Components/AiInvoiceRecognizeRecord';
import {
  OCRCheckSettle,
  OFDCheckSettle,
  getDirInvApplyDataByNum,
} from '@/services/invoicePurPoolService';
import {
  getSettleHeaderDataSup,
  invoiceInformation,
  getOcrConfig,
} from '@/services/settlePoolServices';
import { PermissionDropdown } from '@/routes/Components';
import {
  previewPdf,
  recordPickValues,
  handleParseErrorInfo,
  getAttachmentUrlWithToken,
  getSelectedNegActConfirmMsg,
  previewFile,
} from '@/utils/utils';
import commonStyles from '@/routes/common.less';
import { taxInvoiceCheckFlagger } from '@/utils/amountConfig';
import DynamicAlertList from '@/routes/Components/DynamicAlert/List';

import TaxLineRecordModal from './TaxLineRecordModal';
import TaxLineDetailModal from './TaxLineDetailModal';
import TaxInvoiceAddModal from './TaxInvoiceAddModal';
import ChoseInvPoolModal from './ChoseInvPoolModal';
import InvAttachBatchDownloadModal from '../../Components/InvAttachBatchDownloadModal';
import { Store } from '../Detail/StoreProvider';
import { useModalOpen } from '../hooks';
import Style from '../Detail/index.less';
import { statusTagRender } from '@/routes/Components/StatusTag';

const customizeUnitCodeMap = {
  list: 'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE',
  btn: 'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE_BTNS',
};
const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const prefix = `${SRM_SSTA}/v1/${tenantId}`;

export default observer(({ source }) => {
  const {
    notPub,
    history,
    updateFlag: ctxUpdateFlag,
    approveFlag,
    taxInvoiceDs,
    documentType,
    settleStatus,
    permissionMap,
    invoiceMethod,
    customizeTable,
    settleHeaderId,
    checkPointCode,
    enableCheckFlag,
    settleHeaderDs,
    invoiceMatchRuleCode,
    // enableChargeDebitFlag,
    advanceInvFlag, // 先发票后事务标志
    remoteProps,
    settleHeader,
    settleLineDs,
  } = useContext(Store);

  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const picturesWallRef = useRef({});

  const [viewVisible, setViewVisible] = React.useState(false);
  const [newOcrFileUrl, setNewOcrFileUrl] = React.useState('');
  const [sizeConfig, setSizeConfig] = React.useState({});
  const [alertHeight, setAlertHeight] = React.useState(0);

  const {
    settleNum,
    ecInvoiceInconsistencyFlag, // ecInvoiceInconsistencyFlag=1 表示头行不一致
    ecInvoiceInconsistencyMessage,
  } =
    settleHeader?.get([
      'settleNum',
      'ecInvoiceInconsistencyFlag',
      'ecInvoiceInconsistencyMessage',
    ]) || {};
  const { selected = [] } = taxInvoiceDs;
  const processUpdateFlag = remoteProps
    ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.TAXINVOICE_UPDATE_FLAG', ctxUpdateFlag, {
        approveFlag,
      })
    : ctxUpdateFlag;
  const updateFlag = source === 'view' ? false : processUpdateFlag;

  useEffect(() => {
    taxInvoiceDs.setState('enableCheckFlag', enableCheckFlag);
    taxInvoiceDs.query();
    taxInvoiceDs.addEventListener('update', handleUpdate);
    return () => {
      taxInvoiceDs.removeEventListener('update', handleUpdate);
    };
  }, [taxInvoiceDs, enableCheckFlag]);

  useEffect(() => {
    // 读取OCR大小配置
    getOcrSizeConfig();
  }, [getOcrSizeConfig]);

  const getOcrSizeConfig = useCallback(async () => {
    const res = getResponse(await getOcrConfig());
    if (res) {
      const { ocrFileSize, ocrTransSize, fileType } = res;
      setSizeConfig({
        ocrFileSize,
        ocrTransSize,
        fileType: isNil(fileType) ? undefined : Array.from(new Set(fileType.split(','))).join('/'),
      });
    }
  }, []);

  const handleUpdate = ({ record, name, dataSet, value }) => {
    const amountPrecision = record.get('amountPrecision');
    if (['taxIncludedAmount', 'taxAmount', 'netAmount'].includes(name)) {
      record.set(name, math.toFixed(value, Number(amountPrecision)));
    }
    if (name === 'invoiceSpecies') {
      const data = dataSet.getField('invoiceSpecies').getLookupData();
      record.set('deductFlag', Number(data.tag));
    }
    if (name === 'netAmount' || name === 'taxAmount') {
      record.set(
        'taxIncludedAmount',
        math.toFixed(
          math.plus(record.get('netAmount'), record.get('taxAmount')),
          Number(amountPrecision)
        )
      );
    }
  };

  const handleLoadHeader = useCallback(async () => {
    settleHeaderDs.status = 'loading';
    await taxInvoiceDs.query();
    // 如果是先发票后事务，因为是虚拟id不能调结算单头详情接口
    if (advanceInvFlag) {
      settleHeaderDs.status = 'ready';
      return;
    }
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceTaxIncludedAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'invoiceDifferenceAmount',
    ]);
    handleAfterTaxInvChangeCux(newHeaderData);
  }, [
    settleHeaderDs,
    taxInvoiceDs,
    documentType,
    settleHeaderId,
    advanceInvFlag,
    handleAfterTaxInvChangeCux,
  ]);

  const handleAfterTaxInvChangeCux = useCallback(
    (newHeaderData) => {
      if (remoteProps?.event) {
        // 增加埋点 更新税务发票后 可能需要更新结算明细信息里面的字段
        remoteProps.event.fireEvent('handleAfterTaxInvSaveCux', {
          settleLineDs,
          newHeaderData,
          settleHeaderDs,
        });
      }
    },
    [remoteProps, settleLineDs, settleHeaderDs]
  );

  useEffect(() => {
    const unregisterAiRecognizeSocket = registerAiInvoiceRecognizeSocket(
      settleNum,
      handleLoadHeader
    );
    return unregisterAiRecognizeSocket;
  }, [settleNum, handleLoadHeader]);

  const handleInvoiceCheck = useCallback(async () => {
    const res = await taxInvoiceDs.setState('submitType', 'check').submit();
    if (!res) return;
    const { errorMessageMap, validatedResultDTO } = res.content[0] || {};
    if (isEmpty(errorMessageMap)) {
      if (isNil(validatedResultDTO) || validatedResultDTO?.validatedCode === 'SUCCESS') {
        taxInvoiceDs.batchUnSelect(selected);
      } else {
        handleParseErrorInfo(validatedResultDTO);
      }
    } else {
      const errorMsg = Object.values(errorMessageMap)
        .map((item) => item?.desc)
        .join('');
      notification.error({ message: errorMsg });
    }
    handleLoadHeader();
  }, [selected, taxInvoiceDs, handleLoadHeader]);

  const handleAdd = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      resizable: true,
      style: { minWidth: 380 },
      title: intl.get('hzero.common.button.add').d('新增'),
      children: (
        <TaxInvoiceAddModal
          recordData={{}}
          okCallback={handleLoadHeader}
          handleViewOcrFile={handleViewOcrFile}
        />
      ),
    });
  }, [modalOpen, handleLoadHeader, handleViewOcrFile]);

  const handleDelete = useCallback(async () => {
    const res = await taxInvoiceDs.delete(
      taxInvoiceDs.selected,
      getSelectedNegActConfirmMsg('delete', taxInvoiceDs)
    );
    if (res) {
      handleLoadHeader();
    }
  }, [taxInvoiceDs, handleLoadHeader]);

  const handleEdit = useCallback(
    (record) => {
      modalOpen({
        size: 'large',
        editFlag: true,
        resizable: true,
        style: { minWidth: 300 },
        title: intl.get('hzero.common.button.edit').d('编辑'),
        children: (
          <TaxInvoiceAddModal
            recordData={record.toData()}
            okCallback={handleLoadHeader}
            handleViewOcrFile={handleViewOcrFile}
          />
        ),
      });
    },
    [modalOpen, handleLoadHeader, handleViewOcrFile]
  );

  const handleViewLineDetail = useCallback(
    (record) => {
      const taxInvoiceHeaderId = record.get('taxInvoiceHeaderId');
      modalOpen({
        size: 'large',
        editFlag: false,
        bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
        title: intl.get('ssta.supplySettle.view.message.detail').d('明细'),
        children: <TaxLineDetailModal taxInvoiceHeaderId={taxInvoiceHeaderId} />,
      });
    },
    [modalOpen]
  );

  const handleViewLineRecord = useCallback(
    (record) => {
      const taxInvoiceHeaderId = record.get('taxInvoiceHeaderId');
      modalOpen({
        size: 'medium',
        editFlag: false,
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        children: <TaxLineRecordModal taxInvoiceHeaderId={taxInvoiceHeaderId} />,
      });
    },
    [modalOpen]
  );

  const handleResolveOk = useCallback(
    async (okRequest) => {
      if (picturesWallRef.current?.uploadChild) {
        const { fileList } = picturesWallRef.current.uploadChild.state;
        if (isEmpty(fileList)) {
          notification.warning({
            message: intl.get(`ssta.invoiceSheet.verify.uploadPictureIsNull`).d('上传照片为空'),
          });
          return false;
        } else {
          const fileUrlList = [];
          const fileNameList = [];
          fileList.forEach((n) => {
            const { response, name } = n;
            fileUrlList.push(response);
            fileNameList.push(name);
          });
          const res = await okRequest(
            settleHeaderId,
            fileUrlList.filter((item) => item)
          );
          if (getResponse(res)) {
            handleLoadHeader();
            // errorMessageMap有值代表同一批OCR识别的附件存在识别失败的，弹窗中只留识别失败的附件
            const { errorMessageMap, validatedResultDTO } = res;
            if (isNil(errorMessageMap) || JSON.stringify(errorMessageMap) === '{}') {
              if (isNil(validatedResultDTO) || validatedResultDTO?.validatedCode === 'SUCCESS') {
                notification.success();
                taxInvoiceDs.query();
              } else {
                handleParseErrorInfo(validatedResultDTO);
              }
            } else {
              const errMsgList = [];
              const errFileNameList = [];
              Object.entries(errorMessageMap).forEach(([key, value]) => {
                errMsgList.push(`${key}:${value.desc}`);
                if (value.type !== 'warn') {
                  // 上传成功但识别失败的附件，不再保留避免误删除
                  errFileNameList.push(key);
                }
              });
              notification.error({
                message: errMsgList.join(','),
                duration: 10,
              });
              const successFileNameList = fileNameList.filter(
                (fileName) => !errFileNameList.includes(fileName)
              );
              const newFileList = fileList.filter((file) => errFileNameList.includes(file.name));
              picturesWallRef.current.uploadChild.setState({
                fileList: newFileList,
              });
              picturesWallRef.current.setState((prevState) => ({
                successFileNameList: prevState.successFileNameList.concat(successFileNameList),
                fileList: newFileList,
              }));
              return false;
            }
          }
        }
      }
    },
    [taxInvoiceDs, settleHeaderId, handleLoadHeader]
  );

  const handleAttachDownload = useCallback(async () => {
    const taxInvoiceHeaderIds = selected.map((item) => item.get('taxInvoiceHeaderId'));
    Modal.open({
      style: { width: 300 },
      className: Style['ssta-settle-attachments-download-modal'],
      title: (
        <div>
          {intl.get('ssta.common.view.button.attachmentDownload').d('附件下载')}
          <div>
            {intl
              .get('ssta.common.view.button.attachmentDownloadTitleAttention')
              .d('勾选附件组可进行分组的批量下载')}
          </div>
        </div>
      ),
      children: (
        <InvAttachBatchDownloadModal
          readTransport={{
            url: `${SRM_SSTA}/v1/${tenantId}/tax-invoice-headers/file/${settleHeaderId}`,
            data: taxInvoiceHeaderIds,
          }}
        />
      ),
      okText: intl.get('ssta.invoiceSheet.view.button.DownLoad').d('下载'),
    });
  }, [selected, settleHeaderId]);

  const handleOcr = useCallback(() => {
    const size = sizeConfig.ocrTransSize || 3;
    const fileType = sizeConfig.fileType || 'jpg/jpeg/png/bmp/pdf/ofd';
    const ocrChildrenProps = {
      help: intl
        .get(`ssta.common.model.verify.newMultipleUpload`, {
          size,
          fileType,
        })
        .d(`支持{fileType}格式，建议单个附件不超过{size}M,可批量上传`),
      onRef: (picRef) => {
        picturesWallRef.current = picRef;
      },
      fileSize: (sizeConfig.ocrFileSize || 10) * 1048576,
    };

    const ocrChildrenPropsNew = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.TAXINVOICE_OCR_CHILDREN', ocrChildrenProps, {
          size,
        })
      : ocrChildrenProps;
    const orcModalMergeProps = remoteProps
      ? remoteProps.process(
          'SSTA_SUPPLYSETTLE_DETAIL.TAX_INVOICE_OCR_MODAL_MERGE_PROPS',
          {},
          {
            handleResolveOk,
          }
        )
      : {};
    Modal.open({
      style: { width: 560 },
      className: commonStyles['ocr-upload'],
      title: (
        <Tooltip
          title={intl
            .get('ssta.invoiceSheet.view.message.identifiableTypes.newEtc')
            .d(
              '可识别的发票种类：增值税纸质专用发票、增值税电子专用发票、数电票（增值税专用发票）、数电纸质发票（增值税专用发票）、货运运输业增值税专用发票、机动车销售统一发票、增值税纸质普通发票、增值税电子普通发票、增值税普通发票（卷式）、数电票（普通发票）、数电纸质发票（普通发票）'
            )}
        >
          {intl.get('hzero.common.button.addocr').d('OCR识别')}
          <Icon type="help" />
        </Tooltip>
      ),
      children: <PicturesWall {...ocrChildrenPropsNew} />,
      okText: intl.get(`ssta.invoiceSheet.button.invoiceBill.ocrDistings`).d('OCR识别'),
      onOk: () => handleResolveOk(OCRCheckSettle),
      ...orcModalMergeProps,
    });
  }, [handleResolveOk, sizeConfig, remoteProps]);

  const handleAiRecognize = useCallback(() => {
    Modal.open({
      style: { width: 560 },
      className: commonStyles['ai-recognize-modal'],
      title: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
      children: <AiInvoiceUpload settleHeaderId={settleHeaderId} />,
      okText: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
    });
  }, [settleHeaderId]);

  const handleOfd = useCallback(() => {
    Modal.open({
      title: intl.get(`ssta.common.view.button.ofdAnalysis`).d('OFD解析'),
      children: (
        <PicturesWall
          onRef={(picRef) => {
            picturesWallRef.current = picRef;
          }}
        />
      ),
      okText: intl.get(`ssta.common.view.button.ofdAnalysis`).d('OFD解析'),
      onOk: () => handleResolveOk(OFDCheckSettle),
      footer: (okBtn, cancelBtn) => {
        const footerBtns = [cancelBtn, okBtn];
        // 星巴克二开埋点pur-17501
        return remoteProps
          ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_TAXINVOICE_OFD_BTN', footerBtns)
          : footerBtns;
      },
    });
  }, [handleResolveOk, remoteProps]);

  const handleGain = useCallback(async () => {
    const res = getResponse(await invoiceInformation(settleHeaderId));
    if (!res) return;
    notification.success();
    handleLoadHeader();
  }, [settleHeaderId, handleLoadHeader]);

  const handleChoseInvPool = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('ssta.invoiceSheet.view.button.choseThePool').d('选择发票池'),
      children: <ChoseInvPoolModal onSuccess={handleLoadHeader} />,
    });
  }, [modalOpen, handleLoadHeader]);

  const handleAfterCloseExcel = useCallback(async () => {
    taxInvoiceDs.query();
    if (advanceInvFlag) return;
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceTaxIncludedAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'invoiceDifferenceAmount',
    ]);
    handleAfterTaxInvChangeCux(newHeaderData);
  }, [
    settleHeaderDs,
    taxInvoiceDs,
    documentType,
    settleHeaderId,
    advanceInvFlag,
    handleAfterTaxInvChangeCux,
  ]);

  const handleExcelImport = useCallback(
    (type) => {
      const templateCode = ['HEAD'].includes(type) ? 'SSTA.TAX_INVOICE_HEADER' : 'SSTA.TAX_INVOICE';
      const title = ['HEAD'].includes(type)
        ? intl.get('ssta.invoiceSheet.view.button.excelIn').d('Excel导入')
        : intl.get('ssta.common.view.button.importLine').d('Excel行导入');
      const importProps = {
        code: templateCode,
        action: title,
        historyButton: false,
        args: JSON.stringify({
          templateCode,
          settleHeaderId,
        }),
      };
      modalOpen({
        size: 'large',
        editFlag: false,
        title,
        children: <CommonImport {...importProps} />,
        afterClose: handleAfterCloseExcel,
      });
    },
    [modalOpen, settleHeaderId, handleAfterCloseExcel]
  );

  const handleViewOcrFile = useCallback((ocrFileUrl) => {
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(ocrFileUrl);
    setNewOcrFileUrl(ocrFileUrl);
    setViewVisible(true);
  }, []);

  const handleDownloadOfdFile = useCallback((ofdFileUrl, record) => {
    const sourceCode = record?.get('sourceCode');
    if (ofdFileUrl && sourceCode == 'DIRECT_INVOICE') {
      const linkDom = document.createElement('a');
      linkDom.href = ofdFileUrl;
      linkDom.target = '_blank';
      linkDom.click();
      return;
    }
    return previewFile(ofdFileUrl);
  }, []);

  // 上传成功后，调用更新行附件的接口
  // const handleUploadSuccess = useCallback(
  //   async (response, attachment, record) => {
  //     if (!record.get('attachmentUuid')) {
  //       const { taxInvoiceHeaderId } = record.get(['taxInvoiceHeaderId']);
  //       const { attachmentUUID } = attachment;
  //       const res = getResponse(
  //         await updateAttachmentTax({ taxInvoiceHeaderId, attachmentUuid: attachmentUUID })
  //       );
  //       if (res) {
  //         notification.success();
  //         taxInvoiceDs.query();
  //       }
  //     }
  //   },
  //   [taxInvoiceDs, updateAttachmentTax]
  // );
  // const isEnableChargeDebitFlag = useMemo(() => {
  //   return enableChargeDebitFlag === '1';
  // }, [enableChargeDebitFlag]);

  const exportParams = useMemo(() => {
    const taxInvoiceHeaderIds = selected.map((item) => item.get('taxInvoiceHeaderId'));
    return filterNullValueObject({ settleHeaderId, taxInvoiceHeaderIds });
  }, [selected, settleHeaderId]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        width: 80,
        name: 'lineNum',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        name: 'detailed',
        width: 160,
        renderer: ({ record }) => {
          const dataSource = [
            {
              type: 'edit',
              title: intl.get('hzero.common.button.edit').d('编辑'),
              onClick: () => handleEdit(record),
              show:
                ['UNCHECK', 'FAILED', 'NO_NEED_CHECK'].includes(record.get('validateStatus')) &&
                ['OFFLINE_INVOICE', 'DIRECT_INVOICING'].includes(invoiceMatchRuleCode) &&
                record.get('sourceCode') !== 'EC' &&
                updateFlag,
              permissionCodeList: ['taxInvColumnsEdit'],
            },
            {
              type: 'view',
              title: intl.get('hzero.common.button.view').d('查看'),
              onClick: () => handleViewLineDetail(record),
              show: true,
            },
            {
              type: 'operation',
              title: intl.get('hzero.common.button.operation').d('操作记录'),
              onClick: () => handleViewLineRecord(record),
              show: documentType === 'INVOICE',
            },
          ];

          return (
            <PermissionDropdown
              permsMap={permissionMap}
              // 协鑫埋点 pur-21258
              dataSource={
                remoteProps
                  ? remoteProps.process(
                      'SSTA_SUPPLYSETTLE_DETAIL_TAXINVOICE_CUX.COLUMN_BTNS',
                      dataSource,
                      { record, settleHeaderDs }
                    )
                  : dataSource
              }
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
        name: 'invoiceNumber',
      },
      {
        width: 150,
        name: 'invoicingDate',
      },
      {
        width: 150,
        name: 'netAmount',
      },
      {
        width: 150,
        name: 'taxAmount',
      },
      {
        width: 150,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'invoiceSpeciesMeaning',
      },
      {
        width: 150,
        name: 'deductFlag',
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        width: 150,
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
        width: 150,
        name: 'validateStatusMeaning',
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'validateStatus' }),
      },
      {
        width: 150,
        name: 'validateMessage',
      },
      {
        width: 150,
        name: 'taxInvoiceStatusMeaning',
        renderer: (rendererProps) =>
          statusTagRender({ ...rendererProps, name: 'taxInvoiceStatus' }),
      },
      {
        name: 'purUnifiedSocialCode',
        width: 190,
      },
      {
        width: 180,
        name: 'invoiceUrl',
      },
      {
        name: 'attachmentUuid',
        width: 160,
        editor: (record) => {
          const attProps = {
            viewMode: 'popup',
            funcType: 'link',
            readOnly: true,
            value: record.get('attachmentUuid'),
            bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          };
          return <Attachment {...attProps} />;
        },
      },
      {
        name: 'seeocr',
        width: 150,
        renderer: ({ record }) => {
          const ocrFileUrl = record.get('ocrFileUrl');
          return ocrFileUrl ? (
            <Button funcType="link" color="primary" onClick={() => handleViewOcrFile(ocrFileUrl)}>
              <Icon type="find_in_page" />
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null;
        },
      },
      {
        name: 'aiAttachmentUrl',
        width: 120,
        align: 'left',
        command: ({ record }) => {
          const aiAttachmentUrl = record.get('aiAttachmentUrl');
          return [
            aiAttachmentUrl && (
              <Button
                funcType="link"
                color="primary"
                onClick={() => handleViewOcrFile(aiAttachmentUrl)}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            ),
          ];
        },
      },
      {
        name: 'ofdFileUrl',
        width: 150,
        align: 'left',
        command: ({ record }) => {
          const { jpgUrl, ofdFileUrl } = record.get(['jpgUrl', 'ofdFileUrl']);
          return [
            ofdFileUrl && (
              <Button
                funcType="link"
                color="primary"
                onClick={() => handleDownloadOfdFile(ofdFileUrl, record)}
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </Button>
            ),
            jpgUrl && (
              <Button funcType="link" color="primary" onClick={() => previewFile(jpgUrl)}>
                {intl.get('ssta.invoiceSheet.view.button.preView').d('预览')}
              </Button>
            ),
          ];
        },
      },
      {
        name: 'associatedApplyNum',
        width: 180,
        renderer: ({ value }) => {
          return (
            value && (
              <Button
                funcType="link"
                color="primary"
                style={{ userSelect: 'text' }}
                wait={1000}
                onClick={() => handleToDirInvApply(value)}
              >
                {value}
              </Button>
            )
          );
        },
      },
    ];

    // 处理columns埋点
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_TAXINVOICE_CUX.COLUMNS', baseColumns, {
          taxInvoiceDs,
          settleHeaderId,
        })
      : baseColumns;
  }, [
    updateFlag,
    handleEdit,
    remoteProps,
    documentType,
    permissionMap,
    handleViewOcrFile,
    invoiceMatchRuleCode,
    handleViewLineDetail,
    handleViewLineRecord,
    handleDownloadOfdFile,
    handleToDirInvApply,
    settleHeaderId,
    taxInvoiceDs,
    settleHeaderDs,
  ]);

  const handleToDirInvApply = useCallback(
    async (value) => {
      settleHeaderDs.status = 'loading';
      const res = getResponse(await getDirInvApplyDataByNum(value));
      settleHeaderDs.status = 'ready';
      if (!res) return;
      const { applyHeaderId, applyNum } = res || {};
      if (!applyHeaderId) return;
      const baseSearch = { type: 'view', source: 'invPool', apiType: 'transform', docFlag: true };
      openTab({
        key: `/ssta/invoicing-apply/${applyHeaderId}`,
        title: intl.get('ssta.common.view.title.invoicingApplyDoc').d('开票申请单') + applyNum,
        search: querystring.stringify(baseSearch),
      });
    },
    [settleHeaderDs]
  );

  const buttons = useMemo(() => {
    const CheckBtn =
      // 功能编辑、审批、工作流审批手动查验
      taxInvoiceCheckFlagger({
        notPub,
        updateFlag,
        approveFlag,
        headerInfo: {
          documentType,
          settleStatus,
          checkPointCode,
          enableCheckFlag,
        },
      })
        ? [
          <Button
            name="checkInvoice"
            onClick={handleInvoiceCheck}
            disabled={
                remoteProps
                  ? remoteProps.process(
                      'SSTA_SUPPLYSETTLE_DETAIL_TAXINVOICE_CUX.CHECK_INVOICE_DISABLE',
                      isEmpty(selected),
                      {
                        selected,
                        settleHeaderDs,
                      }
                    )
                  : isEmpty(selected)
              }
            icon="receipt"
          >
            <Tooltip
              placement="top"
              title={intl
                  .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
                  .d('当天开具的发票建议最早于次日进行查验')}
            >
              {intl.get('hzero.common.button.addCheck').d('发票查验')}
            </Tooltip>
          </Button>,
          ]
        : [];
    const EditBtns = updateFlag
      ? [
          (settleStatus === 'INVOICE_EXCEPTION' || invoiceMatchRuleCode === 'OFFLINE_INVOICE') &&
            permissionMap.get(`taxInvAddBtn`) && (
              <Button name="manualCreate" onClick={handleAdd} icon="playlist_add">
                {intl.get('hzero.common.button.handleadd').d('手工新建')}
              </Button>
            ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvOrcBtn`) && (
            <Button name="ocr" onClick={handleOcr} icon="add_a_photo-o">
              {intl.get('hzero.common.button.addocr').d('OCR识别')}
            </Button>
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvAiBtn`) && (
            <Button name="aiRecognize" onClick={handleAiRecognize} icon="add_a_photo-o">
              {intl.get('ssta.common.view.button.aiRecognize').d('AI识别')}
            </Button>
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvOfdBtn`) && (
            <Button name="ofd" onClick={handleOfd} icon="export_PDF">
              {intl.get('ssta.common.view.button.ofdAnalysis').d('OFD解析')}
            </Button>
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvExcelBtn`) && (
            <Button
              name="import"
              onClick={() => handleExcelImport('HEAD')}
              icon="format_list_bulleted"
            >
              {intl.get('hzero.common.button.addExcel').d('Excel导入')}
            </Button>
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvNewExcelBtn`) && (
            <NewCommonImport
              name="newImport"
              businessObjectTemplateCode="SSTA.TAX_INVOICE_HEADER"
              prefixPatch="/ssta"
              buttonText={intl.get('ssta.common.view.button.newExcelImport').d('(新)Excel导入')}
              successCallBack={handleAfterCloseExcel}
              buttonProps={{
                funcType: 'flat',
                color: 'primary',
                icon: 'archive',
              }}
              args={{
                templateCode: 'SSTA.TAX_INVOICE_HEADER',
                settleHeaderId,
              }}
            />
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvImportLineBtn`) && (
            <Button
              name="lineImport"
              onClick={() => handleExcelImport('LINE')}
              icon="format_list_bulleted"
            >
              {intl.get('ssta.common.view.button.importLine').d('Excel行导入')}
            </Button>
          ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' &&
            permissionMap.get(`taxInvNewImportLineBtn`) && (
              <NewCommonImport
                name="newLineImport"
                businessObjectTemplateCode="SSTA.TAX_INVOICE"
                prefixPatch="/ssta"
                buttonText={intl.get(`ssta.common.view.button.newImportLine`).d('(新)Excel行导入')}
                successCallBack={handleAfterCloseExcel}
                buttonProps={{
                  funcType: 'flat',
                  color: 'primary',
                  icon: 'archive',
                }}
                args={{
                  templateCode: 'SSTA.TAX_INVOICE',
                  settleHeaderId,
                }}
              />
            ),
          invoiceMatchRuleCode === 'OFFLINE_INVOICE' && permissionMap.get(`taxInvPoolBtn`) && (
            <Button name="choosePool" onClick={handleChoseInvPool} icon="developer_board">
              {intl.get('hzero.common.button.chosePool').d('选择发票池')}
            </Button>
          ),
          (settleStatus === 'INVOICE_EXCEPTION' || invoiceMatchRuleCode === 'OFFLINE_INVOICE') && [
            // </Button>, //   {/* {intl.get('ssta.common.view.button.ofdAnalysis').d('删除')} */} //   删除 // <Button onClick={handleDelete} disabled={isEmpty(selected)}>
            'delete',
            {
              name: 'delete',
              icon: 'delete_sweep',
              children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
              onClick: handleDelete,
              // afterClick: handleAfterDelete,
            },
          ],
          invoiceMethod === '2' && invoiceMatchRuleCode === 'OFFLINE_INVOICE' && (
            <Button name="fetchInvoiceInformation" icon="feed" onClick={handleGain}>
              {intl.get('hzero.common.button.invoiceInforImation').d('获取电商随货发票信息')}
            </Button>
          ),
        ]
          .concat(CheckBtn)
          .filter((item) => item)
      : CheckBtn;
    const btns = [
      ...EditBtns,
      permissionMap.get(`taxInvAiRecordBtn`) && (
        <Button
          name="aiRecognizeRecord"
          onClick={() => openAiInvoiceRecognizeRecord({ history, isSupplier: true })}
          icon="operation_service_request"
        >
          {intl.get('ssta.common.view.button.aiRecognizeRecord').d('AI识别记录')}
        </Button>
      ),
      permissionMap.get('taxInvNewExportLineBtn') && (
        <ExcelExportPro
          name="newLineExport"
          templateCode="SSTA_TAX_INVOICE_HEADER_SUPPLIER_EXPORT"
          method="POST"
          allBody
          requestUrl={`${prefix}/tax-invoice-headers/supplier/export/${settleHeaderId}?customizeUnitCode=${customizeUnitCodeMap.list}`}
          queryParams={exportParams}
          buttonText={
            isEmpty(selected)
              ? intl.get('ssta.common.button.LineExport1').d('(新)行导出')
              : intl.get('ssta.common.button.LineTickExport1').d('(新)行勾选导出')
          }
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          }}
        />
      ),
      permissionMap.get('taxInvAttachDownload') && (
        <Button name="attachDownload" onClick={handleAttachDownload} icon="attach_file">
          {intl.get('ssta.common.view.button.attachmentDownload').d('附件下载')}
        </Button>
      ),
    ].filter(Boolean);

    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_TAXINVOICE_CUX.BTNS', btns, {
          settleHeaderDs,
          taxInvoiceDs,
          handleOcr,
          updateFlag,
          selected,
          invoiceMatchRuleCode,
          permissionMap,
          handleLoadHeader,
        })
      : btns;
  }, [
    updateFlag,
    handleAdd,
    remoteProps,
    taxInvoiceDs,
    settleHeaderDs,
    handleChoseInvPool,
    handleExcelImport,
    handleGain,
    handleInvoiceCheck,
    handleOfd,
    handleOcr,
    handleAiRecognize,
    invoiceMatchRuleCode,
    invoiceMethod,
    permissionMap,
    selected,
    history,
    settleHeaderId,
    settleStatus,
    handleAfterCloseExcel,
    handleDelete,
    notPub,
    approveFlag,
    documentType,
    checkPointCode,
    enableCheckFlag,
    exportParams,
    handleLoadHeader,
    handleAttachDownload,
  ]);

  const onAlertDisplayChange = useCallback(
    ({ height }) => {
      if (source === 'step') setAlertHeight(height);
    },
    [source]
  );

  return (
    <Fragment>
      <DynamicAlertList
        dataSource={[
          {
            type: 'info',
            name: 'taxInvoiceAlert1',
            message: (
              <span>
                {intl
                  .get(`ssta.common.view.message.onlineDirectInvoicingNoNeedMaintain`)
                  .d('线上直连开票业务，无需手工维护发票')}
                {source === 'step' && '，'}
                {source === 'step' &&
                  intl.get('ssta.common.view.message.pleaseClickNextStep').d('请点击下一步')}
              </span>
            ),
            showFlag: updateFlag && invoiceMatchRuleCode !== 'OFFLINE_INVOICE',
          },
          {
            type: 'error',
            name: 'taxInvoiceAlert3',
            message: ecInvoiceInconsistencyMessage,
            showFlag:
              Number(ecInvoiceInconsistencyFlag) === 1 && settleStatus === 'INVOICE_EXCEPTION',
          },
          {
            type: 'info',
            name: 'taxInvoiceAlert2',
            requestUrl: `${SRM_SSTA}/v1/${tenantId}/settle-headers/invoice-check-announcement`,
          },
        ]}
        onDisplayChange={onAlertDisplayChange}
      />
      {/* 当结算策略是启用费用单帐扣同时单据状态是新建或退回时，税务发票不显示操作按钮 */}
      {customizeTable(
        {
          code: customizeUnitCodeMap.list,
          buttonCode: customizeUnitCodeMap.btn, // 按钮个性化
        },
        <Table
          style={{ maxHeight: source !== 'step' ? 490 : `calc(100vh - 340px - ${alertHeight}px)` }}
          columns={columns}
          dataSet={taxInvoiceDs}
          buttons={buttons}
        />
      )}
      {newOcrFileUrl && (
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={viewVisible}
          onClose={() => {
            setViewVisible(false);
            setNewOcrFileUrl('');
          }}
          downloadable
          images={[
            {
              src: getAttachmentUrl(newOcrFileUrl, bucketName, tenantId, bucketDirectory),
              alt: '',
              downloadUrl: getAttachmentUrl(newOcrFileUrl, bucketName, tenantId, bucketDirectory),
            },
          ]}
        />
      )}
    </Fragment>
  );
});
