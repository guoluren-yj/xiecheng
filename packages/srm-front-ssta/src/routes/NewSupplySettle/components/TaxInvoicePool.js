// 先发票后事务,弹出发票池内容
import React, {
  Fragment,
  useContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';
import { Table, Icon, useModal, Modal, Tooltip, Button, useDataSet } from 'choerodon-ui/pro';
import { Badge } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react';
import Viewer from 'react-viewer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import intl from 'utils/intl';
import NewCommonImport from 'components/Import';
import notification from 'utils/notification';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { getResponse, getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { queryIdpValue } from 'services/api';

import PicturesWall from '@/routes/PurchaseInvoicePool/OcrUpload';
import AiInvoiceUpload from '@/routes/Components/AiInvoiceUpload';
import { openAiInvoiceRecognizeRecord } from '@/routes/Components/AiInvoiceRecognizeRecord';
import { checkList, OCRCheck, OFDCheck } from '@/services/invoicePurPoolService';
import { getOcrConfig } from '@/services/settlePoolServices';
import { taxInvoicePooloperationDS } from '@/stores/NewSupplySettleDS';
import { PermissionDropdown } from '@/routes/Components';
import {
  previewPdf,
  dateRangeTransform,
  getSelectedNegActConfirmMsg,
  previewFile,
} from '@/utils/utils';
import commonStyles from '@/routes/common.less';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import { statusTagRender } from '@/utils/renderer';
import InvoiceRecord from '@/routes/Components/InvoiceRecord';

import { Store } from '../Detail/StoreProvider';
import { useModalOpen } from '../hooks';
import TaxInvoicePoolAddModal from './TaxInvoicePoolAddModal';
import DynamicAlertList from '@/routes/Components/DynamicAlert/List';

const taxInvPoolGirdCode = 'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE';
const taxInvPoolSearchCode = 'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_SEARCH_BAR';
const tenantId = getCurrentOrganizationId();
const bucketDirectory = 'finance-invoice';
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const defaultTag = {
  SUCCESS: '#7DCCA5',
  UNCHECK: '#f8941f',
  FAILED: '#f5745e',
  INVALID: '#000000',
  NORMAL: '#47b883',
  NEGATIVE: ' #f56649',
};

export default observer(({ source }) => {
  const {
    updateFlag: ctxUpdateFlag,
    taxInvoicePoolDs,
    permissionMap,
    customizeTable,
    invoiceMatchRuleCode,
    // enableChargeDebitFlag,
    remoteProps,
    history,
  } = useContext(Store);
  const updateFlag = source === 'view' ? false : ctxUpdateFlag;
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const picturesWallRef = useRef({});
  const taxInvoicePooloperationDs = useDataSet(() => taxInvoicePooloperationDS(), []);

  const [viewVisible, setViewVisible] = useState(false);
  const [newOcrFileUrl, setNewOcrFileUrl] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState({});
  const [statusData, setStatusData] = useState({});
  const [sizeConfig, setSizeConfig] = React.useState({});
  const [alertHeight, setAlertHeight] = React.useState(0);

  const { selected = [] } = taxInvoicePoolDs;

  useEffect(() => {
    if (updateFlag) {
      // taxInvoicePoolDs.query();
      taxInvoicePoolDs.addEventListener('update', handleUpdate);
      return () => {
        taxInvoicePoolDs.removeEventListener('update', handleUpdate);
      };
    } else {
      taxInvoicePoolDs.loadData(taxInvoicePoolDs.selected, taxInvoicePoolDs.selected.length);
    }
  }, [updateFlag, taxInvoicePoolDs]);

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

  useEffect(() => {
    fetchLovStatus();
    taxInvoicePoolDs.pageSize = updateFlag ? 10 : 20;
  }, [fetchLovStatus, updateFlag, taxInvoicePoolDs]);

  // 页面加载埋点 - 供二开扩展白名单校验
  useEffect(() => {
    if (remoteProps?.event) {
      remoteProps.event.fireEvent('onTaxInvoicePoolLoad', {
        taxInvoicePoolDs,
      });
    }
  }, [remoteProps, taxInvoicePoolDs]);

  // 查询值集
  const fetchLovStatus = useCallback(() => {
    Promise.all([
      queryIdpValue('SSTA.INVOICE_CHECK_STATUS'),
      queryIdpValue('SSTA.INVOICE_STATUS'),
    ]).then((res) => {
      if (res) {
        setInvoiceStatus(handleTransObject(res[0] || []));
        setStatusData(handleTransObject(res[1] || []));
      }
    });
  }, [handleTransObject]);

  const handleTransObject = useCallback((list) => {
    const obj = {};
    list.forEach(({ value, tag }) => {
      obj[value] = tag;
    });
    return obj;
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
    taxInvoicePoolDs.query();
  }, [taxInvoicePoolDs]);

  // const handleInvoiceCheck = useCallback(async () => {
  //   const res = await taxInvoicePoolDs.setState('submitType', 'check').submit();
  //   if (!res) return;
  //   const result = res.content[0] || {};
  //   if (!isEmpty(result)) {
  //     const errorMsg = Object.values(result)
  //       .map((item) => item?.desc)
  //       .join('');
  //     notification.error({ message: errorMsg });
  //   }
  //   handleLoadHeader();
  // }, [selected, taxInvoicePoolDs, handleLoadHeader]);

  const handleAdd = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('hzero.common.button.add').d('新增'),
      children: (
        <TaxInvoicePoolAddModal
          recordData={{}}
          showModal={handleViewOcrFile}
          okCallback={handleLoadHeader}
        />
      ),
    });
  }, [modalOpen, handleLoadHeader, handleViewOcrFile]);

  // const handleAfterDelete = useCallback(() => {
  //   handleLoadHeader();
  // }, [handleLoadHeader]);

  const handleDelete = useCallback(async () => {
    const res = await taxInvoicePoolDs.delete(
      taxInvoicePoolDs.selected,
      getSelectedNegActConfirmMsg('cancel')
    );
    if (res) {
      notification.success();
      handleLoadHeader();
    }
  }, [taxInvoicePoolDs, handleLoadHeader]);

  const updateDetail = useCallback(
    (record) => {
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get('hzero.common.button.edit').d('编辑'),
        children: (
          <TaxInvoicePoolAddModal
            recordData={record.toData()}
            showModal={handleViewOcrFile}
            okCallback={handleLoadHeader}
          />
        ),
      });
    },
    [modalOpen, handleLoadHeader, handleViewOcrFile]
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
          const res = await okRequest(fileUrlList.filter((item) => item));
          if (getResponse(res)) {
            // res有值代表同一批OCR识别的附件存在识别失败的，弹窗中只留识别失败的附件
            if (isNil(res) || JSON.stringify(res) === '{}') {
              notification.success();
              taxInvoicePoolDs.query();
            } else {
              const errMsgList = [];
              const errFileNameList = [];
              Object.entries(res).forEach(([key, value]) => {
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
    [taxInvoicePoolDs]
  );

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
      ? remoteProps.process(
          'SSTA_SUPPLYSETTLE_DETAIL.TAXINVOICEPOOL_OCR_CHILDREN',
          ocrChildrenProps,
          { size }
        )
      : ocrChildrenProps;
    const orcModalMergeProps = remoteProps
      ? remoteProps.process(
          'SSTA_SUPPLYSETTLE_DETAIL.TAX_INVOICE_POOL_OCR_MODAL_MERGE_PROPS',
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
      onOk: () => handleResolveOk(OCRCheck),
      ...orcModalMergeProps,
    });
  }, [handleResolveOk, sizeConfig, remoteProps]);

  const handleAiRecognize = useCallback(() => {
    Modal.open({
      style: { width: 560 },
      className: commonStyles['ai-recognize-modal'],
      title: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
      children: <AiInvoiceUpload />,
      okText: intl.get('ssta.common.view.title.aiRecognize').d('AI识别'),
    });
  }, []);

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
      onOk: () => handleResolveOk(OFDCheck),
    });
  }, [handleResolveOk]);

  const handleAfterCloseExcel = useCallback(async () => {
    taxInvoicePoolDs.query();
  }, [taxInvoicePoolDs]);

  const handleExcelImport = useCallback(
    (type) => {
      const templateCode =
        type === 'IMPORT_LINE' ? 'SSTA.INVOICE_POOL_SUPPLIER' : 'SSTA.INVOICE_HEADER_SUPPLIER';
      const title =
        type === 'IMPORT_LINE'
          ? intl.get('ssta.common.view.button.importLine').d('Excel行导入')
          : intl.get('ssta.invoiceSheet.view.button.excelIn').d('Excel导入');
      const importProps = {
        code: templateCode,
        action: title,
        historyButton: false,
        args: JSON.stringify({
          templateCode,
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
    [modalOpen, handleAfterCloseExcel]
  );

  const handleViewOcrFile = useCallback((ocrFileUrl) => {
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    setNewOcrFileUrl(ocrFileUrl);
    setViewVisible(true);
  }, []);

  const handleDownloadOfdFile = useCallback((ofdFileUrl, record) => {
    const associatedApplyNum = record?.get('associatedApplyNum');
    if (ofdFileUrl && associatedApplyNum) {
      const linkDom = document.createElement('a');
      linkDom.href = ofdFileUrl;
      linkDom.target = '_blank';
      linkDom.click();
      return;
    }
    return previewFile(ofdFileUrl);
  }, []);

  // const isEnableChargeDebitFlag = useMemo(() => {
  //   return enableChargeDebitFlag === '1';
  // }, [enableChargeDebitFlag]);

  // 查验补全
  const checkSave = useCallback(
    async (record) => {
      const res = getResponse(await checkList({ ...record.toData() }));
      if (res) notification.success();
      taxInvoicePoolDs.query();
    },
    [taxInvoicePoolDs]
  );

  // 打开操作记录
  const openOprationModal = useCallback(
    (record) => {
      const invoiceHeaderId = record.get('invoiceHeaderId');
      taxInvoicePooloperationDs.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
      modalOpen({
        size: 'medium',
        editFlag: false,
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        children: (
          <InvoiceRecord
            record={record}
            operationDs={taxInvoicePooloperationDs}
            invoiceHeaderId={invoiceHeaderId}
          />
        ),
      });
    },
    [modalOpen, taxInvoicePooloperationDs]
  );

  const columns = useMemo(
    () => [
      {
        name: 'invoiceStatusMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          const tag =
            invoiceStatus[record.get('invoiceStatus')] || defaultTag[record.get('invoiceStatus')];
          return statusTagRender(value, tag);
        },
      },
      {
        name: 'checkStatusMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          const tag =
            statusData[record.get('checkStatus')] || defaultTag[record.get('checkStatus')];
          return statusTagRender(value, tag);
        },
      },
      {
        name: 'validateMessage',
        width: 150,
      },
      {
        name: 'operation',
        width: 180,
        renderer: ({ record }) => {
          const { lineCheckStatus, enableCheckFlag, documentStatus } = record.get([
            'checkStatus',
            'enableCheckFlag',
            'documentStatus',
          ]);
          const defaultButtons = [
            {
              type: 'update',
              title: (
                <Tooltip
                  placement="top"
                  title={intl
                    .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
                    .d('当天开具的发票建议最早于次日进行查验')}
                >
                  {intl.get('ssta.invoiceSheet.view.button.checkoutInfo').d('查验补全')}
                </Tooltip>
              ),
              onClick: () => checkSave(record),
              main: true,
              show: enableCheckFlag === 1 && updateFlag,
            },
            {
              type: 'record',
              title: intl.get('ssta.invoiceSheet.view.button.operationRecord').d('操作记录'),
              onClick: () => openOprationModal(record),
              main: false,
              show: true,
            },
            {
              type: 'approve',
              title: intl.get('hzero.common.button.edit').d('编辑'),
              onClick: () => updateDetail(record),
              main: false,
              show:
                documentStatus !== 'ASSOCIATED' &&
                !['SUCCESS'].includes(lineCheckStatus) &&
                updateFlag,
            },
          ];
          // 操作列埋点 - 供二开扩展白名单校验
          const processedButtons = remoteProps
            ? remoteProps.process(
                'SSTA_SUPPLYSETTLE_DETAIL.TAXINVOICEPOOL_OPERATION',
                defaultButtons,
                {
                  record,
                  taxInvoicePoolDs,
                }
              )
            : defaultButtons;
          return <PermissionDropdown dataSource={processedButtons} />;
        },
      },
      {
        name: 'belongCompanyName',
        width: 250,
      },
      {
        name: 'belongSupplierCompanyName',
        width: 250,
      },
      {
        name: 'invoiceNum',
        width: 150,
      },
      {
        name: 'invoiceCode',
        width: 150,
      },
      {
        name: 'invoiceTypeMeaning',
        width: 150,
      },
      {
        name: 'invoicingDate',
        width: 150,
      },
      {
        name: 'netAmount',
        width: 150,
      },
      {
        name: 'taxAmount',
        width: 150,
      },
      {
        name: 'taxIncludedAmount',
        width: 150,
      },
      {
        name: 'checkCode',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'memo',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'supUnifiedSocialCode',
        width: 200,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'purUnifiedSocialCode',
        width: 200,
      },
      {
        name: 'invoiceSourceMeaning',
        width: 150,
      },
      {
        name: 'checkDate',
        width: 250,
      },
      {
        name: 'fileUrl',
        width: 150,
        renderer: ({ record }) =>
          record.get('fileUrl') && (
            <a href={record.get('fileUrl')}>
              {intl.get('ssta.invoiceSheet.view.button.DownLoad').d('下载')}
            </a>
          ),
      },
      {
        name: 'attachmentUuid',
        width: 120,
      },
      {
        name: 'uniSee',
        width: 120,
        align: 'left',
        command: ({ record }) => {
          const ocrFileUrl = record.get('ocrFileUrl');
          return [
            ocrFileUrl && (
              <Button onClick={() => handleViewOcrFile(ocrFileUrl)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </Button>
            ),
          ];
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
              <Button onClick={() => handleViewOcrFile(aiAttachmentUrl)}>
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
        name: 'documentStatusMeaning',
        width: 150,
      },
      {
        name: 'associatedDocumentNum',
        width: 150,
      },
      {
        name: 'cancelledFlag',
        width: 150,
        renderer: ({ record }) => {
          return (
            <Badge
              status={record.get('cancelledFlag') === '0' ? 'default' : 'error'}
              text={
                record.get('cancelledFlag') === '0'
                  ? intl.get(`ssta.invoiceSheet.view.button.notCancelled`).d('未取消')
                  : intl.get(`ssta.invoiceSheet.view.button.cancelled`).d('已取消')
              }
            />
          );
        },
      },
      {
        name: 'exceptionStatusMeaning',
        width: 150,
      },
      {
        name: 'sumCheckTimes',
        width: 150,
      },
      {
        name: 'checkTimes',
        width: 150,
      },
    ],
    [
      updateFlag,
      checkSave,
      openOprationModal,
      updateDetail,
      invoiceStatus,
      statusData,
      handleViewOcrFile,
      handleDownloadOfdFile,
      remoteProps,
      taxInvoicePoolDs,
    ]
  );

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  const buttons = useMemo(() => {
    // const CheckBtn = [
    //   <Button onClick={handleInvoiceCheck} disabled={isEmpty(selected)} icon="receipt">
    //     <Tooltip
    //       placement="top"
    //       title={intl
    //           .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
    //           .d('当天开具的发票建议最早于次日进行查验')}
    //     >
    //       {intl.get('hzero.common.button.addCheck').d('发票查验')}
    //     </Tooltip>
    //   </Button>,
    // ];
    return (updateFlag
      ? [
          <Button name="handleCreate" key="handleCreate" icon="playlist_add" onClick={handleAdd}>
            {intl.get('hzero.common.button.handleadd').d('手工新建')}
          </Button>,
          <Button name="ocr" key="ocr" icon="add_a_photo-o" onClick={handleOcr}>
            {intl.get('hzero.common.button.addocr').d('OCR识别')}
          </Button>,
          permissionMap.get('taxInvPoolAiBtn') && (
            <Button
              name="aiRecognize"
              key="aiRecognize"
              icon="add_a_photo-o"
              onClick={handleAiRecognize}
            >
              {intl.get('ssta.common.view.button.aiRecognize').d('AI识别')}
            </Button>
          ),
          <Button name="ofd" key="ofd" icon="export_PDF" onClick={handleOfd}>
            {intl.get('ssta.common.view.button.ofdAnalysis').d('OFD解析')}
          </Button>,
          <Button
            name="importIn"
            key="importIn"
            icon="format_list_bulleted"
            onClick={handleExcelImport}
          >
            {intl.get('hzero.common.button.addExcel').d('Excel导入')}
          </Button>,
          <NewCommonImport
            name="newExportIn"
            key="newExportIn"
            businessObjectTemplateCode="SSTA.INVOICE_HEADER_SUPPLIER"
            prefixPatch="/ssta"
            buttonText={intl.get('ssta.common.view.button.newExcelImport').d('(新)Excel导入')}
            successCallBack={handleAfterCloseExcel}
            buttonProps={{ funcType: 'flat' }}
            args={{ templateCode: 'SSTA.INVOICE_HEADER_SUPPLIER' }}
          />,
          permissionMap.get(`invoicePoolImportLine`) && (
            <Button
              name="importLine"
              key="importLine"
              icon="format_list_bulleted"
              onClick={() => handleExcelImport('IMPORT_LINE')}
            >
              {intl.get('hzero.common.button.importLine').d('Excel行导入')}
            </Button>
          ),
          permissionMap.get(`invoicePoolImportLineNew`) && (
            <NewCommonImport
              name="newImportLine"
              key="newImportLine"
              businessObjectTemplateCode="SSTA.INVOICE_POOL_SUPPLIER"
              prefixPatch="/ssta"
              buttonText={intl.get(`ssta.common.view.button.newImportLine`).d('(新)Excel行导入')}
              successCallBack={handleAfterCloseExcel}
              buttonProps={{ funcType: 'flat' }}
              args={{ templateCode: 'SSTA.INVOICE_POOL_SUPPLIER' }}
            />
          ),
          <Button
            name="delete"
            key="delete"
            icon="delete_sweep"
            disabled={isEmpty(selected)}
            onClick={handleDelete}
          >
            {intl.get('hzero.common.button.batchCancel').d('批量取消')}
          </Button>,
        ]
      : []
    ).concat([
      permissionMap.get('taxInvPoolAiRecordBtn') && (
        <Button
          name="aiRecognizeRecord"
          key="aiRecognizeRecord"
          icon="operation_service_request"
          onClick={() => openAiInvoiceRecognizeRecord({ history, isSupplier: true })}
        >
          {intl.get('ssta.common.view.button.aiRecognizeRecord').d('AI识别记录')}
        </Button>
      ),
    ]);
  }, [
    updateFlag,
    handleAdd,
    handleExcelImport,
    // handleInvoiceCheck,
    handleOfd,
    handleOcr,
    handleAiRecognize,
    permissionMap,
    selected,
    history,
    handleAfterCloseExcel,
    handleDelete,
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
            name: 'taxInvoicePoolAlert1',
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
            name: 'taxInvoicePoolAlert2',
            message: intl
              .get(`ssta.common.view.message.checkData`)
              .d('请先勾选税务发票行, 再点击下一步'),
            showFlag: updateFlag,
          },
        ]}
        onDisplayChange={onAlertDisplayChange}
      />
      {updateFlag
        ? customizeTable(
            {
              code: taxInvPoolGirdCode,
              buttonCode: 'SSTA.SUPPLY_SETTLE_DETAIL.ADVANCE_TAXINVOICE_BTNS',
            },
            <SearchBarTable
              cacheState
              searchCode={taxInvPoolSearchCode}
              columns={columns}
              buttons={buttons}
              dataSet={taxInvoicePoolDs}
              style={{ maxHeight: `calc(100vh - 230px - ${alertHeight}px)` }}
              searchBarConfig={{
                onFieldChange: handleFieldChange,
                closeFilterSelector: true,
                fieldProps: {
                  belongSupplierCompanyId: { lovPara: { tenantId } },
                  creationDate: {
                    defaultValue: ({ record }) =>
                      dateRangeTransform(record.get('creationDate'), true),
                    dynamicProps: {
                      disabled: ({ record }) =>
                        record.get('creationDateRange') &&
                        record.get('creationDateRange') !== 'ALL TIME',
                    },
                  },
                },
                left: {
                  render: (_, customizeDs) => (
                    <MultiTextFilter
                      name="invoiceNums"
                      dataSet={customizeDs}
                      placeholder={intl
                        .get('ssta.costSheet.modal.invoiceNum')
                        .d('请输入发票号码查询')}
                    />
                  ),
                },
              }}
            />
          )
        : customizeTable(
            { code: taxInvPoolGirdCode },
            <Table
              style={{ maxHeight: 'calc(100vh - 220px)' }}
              columns={columns}
              dataSet={taxInvoicePoolDs}
              queryBar="none"
              selectionMode="none"
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
          images={[
            {
              src: getAttachmentUrl(newOcrFileUrl, bucketName, tenantId, bucketDirectory),
              alt: '',
            },
          ]}
        />
      )}
    </Fragment>
  );
});
