/*
 * @Description: 智能合同提取-新建方式选择
 * @Date: 2025-01-20 17:28:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useState } from 'react';
import intl from 'utils/intl';
import { Modal, Form, DataSet, Select, CheckBox, Button, Progress } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { routerRedux } from 'dva/router';
import axios from 'axios';
import { Upload } from 'choerodon-ui';
import { isString, isFunction, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { HZERO_FILE } from 'utils/config';
import { SRM_SPCM } from '_utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { removeUploadFile } from 'services/api';
import {
  getCurrentOrganizationId,
  getResponse,
  getAccessToken,
  getRequestId,
  isTenantRoleLevel,
} from 'utils/utils';
import { extractPollResult, extractCompareHeader, smartContractTaskCancel } from '@/services/workspaceService';
import { ReactComponent as UploadFileSvg } from '@/assets/upload_file.svg';
import { ReactComponent as FilePdfSvg } from '@/assets/file_pdf.svg';
import { ReactComponent as FileWordSvg } from '@/assets/file_word.svg';

import ExtractWait from '../../ExtractWait';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const { Dragger } = Upload;
// const accept = '.doc,.docx,.pdf';
const fileTypes =
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf';
const accessToken = getAccessToken();
const headers = {};
if (accessToken) {
  headers.Authorization = `bearer ${accessToken}`;
}

const ManuallyDS = () => {
  return {
    // autoCreate: true,
    fields: [
      {
        label: intl.get(`spcm.workspace.model.createMethod`).d('新建方式'),
        name: 'createMethod',
        required: true,
        lookupCode: 'SPCM_PC_EXTRACT_PENDING_METHOD',
        defaultValue: '1',
      },
      {
        label: intl.get(`spcm.workspace.model.contractKindCode`).d('合同性质'),
        name: 'contractKindCode',
        lookupCode: 'SPCM.CONTRACT.NUTURE',
        dynamicProps: {
          required: ({ record }) => record.get('createMethod') === '2',
        },
      },
      {
        name: 'file',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('createMethod') === '2',
        },
        label: intl.get(`spcm.workspace.model.extractFile`).d('合同附件'),
      },
      {
        name: 'extraFlag',
        type: 'boolean',
        trueValue: 1, // 兼容个性化默认值是1/0，不是true/false
        falseValue: 0,
        label: intl.get(`spcm.common.model.common.intelExtract`).d('智能提取'),
      },
      {
        // 虚拟字段，用于作为条件个性化配置配置其他字段
        name: 'sourceCode',
        type: 'string',
        label: intl.get('spcm.common.model.pcSourceCode').d('协议来源'),
        lookupCode: 'SPCM.CONTRACT.SOURCE',
        computedProps: {
          disabled: () => true,
        },
        defaultValue: 'MANUALLY',
        ignore: 'always',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/smart-contract-task/fetch`,
          method: 'POST',
          data: data[0],
        };
      },
    },
    events: {
      update: ({ value, name, record }) => {
        if (name === 'createMethod' && value) {
          if (value === '1') {
            record.set({
              contractKindCode: null,
              file: null,
              extraFlag: null,
            });
          }
        }
      },
    },
  };
};

const uploadData = {
  bucketName: PRIVATE_BUCKET,
  directory: 'purchase-contract',
};

const ManuallyModal = observer((props) => {
  const {
    remote,
    dataSet,
    _linkFlag,
    referenceKey,
    payload,
    clearReExtractTimer,
    enableSmartContract,
    customizeForm = () => {},
    handleGotoDatail = () => {},
  } = props;

  // 协议创建来源
  const sourceCode = React.useMemo(
    () =>
      referenceKey === 'sourcingResults'
        ? 'SEARCH_SOURCE_RESULT'
        : referenceKey === 'purchaseNeed'
        ? 'PURCHASE_NEED'
        : referenceKey === 'purchaseOrder'
        ? 'PURCHASE_ORDER'
        : 'MANUALLY',
    [referenceKey]
  );

  const [self] = React.useState({});
  const [fileList, setFileList] = useState([]);
  const [fileName, setFileName] = useState('');
  const [iconType, setIconType] = useState('FileWordSvg');
  const [progress, setProgress] = useState(0);
  const [statusCode, setStatusCode] = useState('init');
  const { createMethod } = dataSet?.current?.get(['createMethod']) || {};
  const MAX_PROGRESS = 99;

  /**
   * 上传前的校验
   * @param {Object} file - 上传的文件
   */
  const handleBeforeUpload = (file) => {
    const { fileSize = 50 * 1024 * 1024, remote } = props;
    const { handleCheckFileType } = remote.props?.process || {};
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line

      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (isFunction(handleCheckFileType)) {
      const res = handleCheckFileType({ file });
      if (!res) {
        return false;
      }
    }
    const notSmartExtractFile = fileTypes.indexOf(file.type) === -1;
    const fileIconType = notSmartExtractFile
      ? 'FilePdfSvg'
      : file.type === 'application/pdf'
      ? 'FilePdfSvg'
      : 'FileWordSvg';
    setIconType(fileIconType);
    setFileName(file.name);
    return true;
  };

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
   */
  const onDraggerUploadChange = React.useCallback(({ file, fileList: newFileList }) => {
    const { status, response, type } = file || {};
    const arr = newFileList.slice(-1);
    setFileList(arr);
    if (status === 'done') {
      notification.success();
      setStatusCode('done');
      dataSet.setState('fileType', type);
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set('file', response?.data || response);
      // const arr = newFileList.slice(-1);
      // setFileList(arr);
    } else if (status === 'error' && response) {
      notification.error(response);
    }
  }, []);

  /**
   * 删除文件回调函数
   * @param {*} file
   */
  const onDraggerUploadRemove = (file) => {
    if (isString(file.response)) {
      const payload = {
        organizationId,
        bucketName: PRIVATE_BUCKET,
        directory: uploadData?.directory,
        urls: [file.response],
      };
      removeUploadFile(payload).then((response) => {
        const res = getResponse(response);
        if (res) {
          const newList = fileList.filter((o) => o.uid !== file.uid);
          setFileList(newList);
          notification.success();
        }
      });
    }
  };

  const handleProgress = React.useCallback(({ percent }) => {
    setProgress(Math.min(Math.floor(percent), MAX_PROGRESS));
  }, []);

  const handleCancel = React.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof self.onCancel === 'function') {
        self.onCancel();
        // eslint-disable-next-line no-unused-expressions
        dataSet?.current?.set('file', '');
      }
      setStatusCode('init');
      setFileList([]);
    },
    [self]
  );

  const handleReUpload = React.useCallback(() => {}, []);

  const uploadContent = React.useMemo(() => {
    switch (statusCode) {
      case 'init':
        return (
          <>
            <div className={styles['import-upload-pic']}>{<UploadFileSvg />}</div>
            <div className="common-import-upload-text">
              {intl.get('hzero.common.components.import.message.drag').d('拖拽或点击此处选择文件')}
            </div>
            <div className="common-import-upload-text" style={{ paddingBottom: '24px' }}>
              0/1
            </div>
          </>
        );
      case 'uploading':
        return (
          <>
            {iconType === 'FileWordSvg' ? <FileWordSvg /> : <FilePdfSvg />}
            <div className="common-import-upload-text">{fileName}</div>
            <Progress
              showInfo={false}
              strokeWidth={2}
              className="common-import-upload-progress"
              value={progress}
            />
            <Button className="common-import-template-button-item" onClick={handleCancel}>
              {intl.get('hzero.common.components.import.cancelUpload').d('取消上传')}
            </Button>
          </>
        );
      case 'done':
        return (
          <>
            {iconType === 'FileWordSvg' ? <FileWordSvg /> : <FilePdfSvg />}
            <div className="common-import-upload-text">{fileName}</div>
            <Button className="common-import-template-button-item" onClick={handleReUpload}>
              {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
            </Button>
          </>
        );
      default:
        return null;
    }
  }, [progress, statusCode]);

  const handleAction = React.useCallback(
    ({
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials,
    }) => {
      setProgress(0);
      setStatusCode('uploading');
      const { CancelToken } = axios;
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
      }
      formData.append(filename, file);
      axios
        .post(action, formData, {
          withCredentials,
          headers,
          onUploadProgress: ({ total, loaded }) => {
            onProgress({ percent: (loaded / total) * 100 }, file);
          },
          cancelToken: new CancelToken((e) => {
            // 触发渲染不会调用接口，所以更改对象属性
            self.onCancel = e;
          }),
          responseType: 'text',
        })
        .then((res) => {
          try {
            const response = JSON.parse(res);
            getResponse(response);
          } catch {
            onSuccess(res, file);
          }
        })
        .catch((e) => {
          onError(e);
          handleError();
          if (e.message) {
            notification.error({
              message: e?.message,
            });
          }
        });
    },
    []
  );

  const handleError = React.useCallback(() => {
    setStatusCode('init');
    setFileList([]);
    setFileName('');
    // eslint-disable-next-line no-unused-expressions
    dataSet?.current?.set('file', '');
  }, []);

  React.useEffect(() => {
    const currentFile = dataSet?.current?.get('file');
    if (!currentFile) {
      dataSet.setState('fileType', null);
    }
  }, [dataSet?.current?.get('file')]);

  React.useEffect(() => {
    handleContractNatureSet();
  }, []);

  React.useEffect(() => {
    if (createMethod !== '2' && fileList.length) {
      setStatusCode('init');
      setFileList([]);
    }
  }, [createMethod]);

  const handleContractNatureSet = React.useCallback(() => {
    if (_linkFlag) {
      if (referenceKey === 'sourcingResults') {
        const { executionStrategyCode } = payload?.sourceResultDTOs?.[0] || {};
        if (executionStrategyCode === 'SOURCE') {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.set('contractKindCode', '1');
        }
      } else if (referenceKey === 'purchaseNeed') {
        const { transferredDocumentTypeVOList = [] } = payload;
        const typeList = transferredDocumentTypeVOList.map((typeVo) => {
          if (typeVo.typeCode === 'TRANSFERABLE_CONTRACT_SIMPLE') {
            // 可转普通协议
            return '2';
          } else if (typeVo.typeCode === 'TRANSFERABLE_CONTRACT_FRAMEWORK') {
            // 可转框架协议
            return '1';
          }
        });
        if (typeList.length === 1) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.set('contractKindCode', typeList[0]);
        }
      } else if (referenceKey === 'purchaseOrder') {
        // eslint-disable-next-line no-unused-expressions
        dataSet?.current?.set('contractKindCode', '2');
      }
    }
  }, [_linkFlag, referenceKey]);

  const handleContractNature = React.useCallback(
    (record) => {
      const optionResult = (record) => {
        if (_linkFlag) {
          if (referenceKey === 'sourcingResults') {
            const { executionStrategyCode } = payload?.sourceResultDTOs?.[0] || {};
            if (executionStrategyCode === 'ORDER') {
              return false;
            } else if (executionStrategyCode === 'SOURCE') {
              // dataSet.current.set('contractKindCode', '1');
              return record.get('value') === '1';
            } else {
              return true;
            }
          } else if (referenceKey === 'purchaseNeed') {
            const { transferredDocumentTypeVOList = [] } = payload;
            const typeList = transferredDocumentTypeVOList.map((typeVo) => {
              if (typeVo.typeCode === 'TRANSFERABLE_CONTRACT_SIMPLE') {
                // 可转普通协议
                return '2';
              } else if (typeVo.typeCode === 'TRANSFERABLE_CONTRACT_FRAMEWORK') {
                // 可转框架协议
                return '1';
              }
            });
            if (typeList.length === 1) {
              // dataSet.current.set('contractKindCode', typeList[0]);
            }
            return typeList.includes(record.get('value'));
          } else if (referenceKey === 'purchaseOrder') {
            // dataSet.current.set('contractKindCode', '2');
            return record.get('value') === '2';
          }
        } else {
          return true;
        }
      };
      if (remote) {
        return remote.process(
          'SPCM_WORKSPACE_LIST_FILTER_CONTRACT_KIND_CODE',
          optionResult(record),
          { record, eventProps: props }
        );
      } else {
        return optionResult(record);
      }
    },
    [_linkFlag, referenceKey]
  );

  const handleCancelExtract = async () => {
    const taskId = dataSet.getState('taskId');
    const res = await smartContractTaskCancel({ taskId });
    if (res?.failed) {
      if (res?.code === 'error.spcm_smart_element_fill_data_ing') {
        notification.warning({
          message: intl
            .get(`spcm.workspace.msg.cannotCancel`)
            .d('数据处理中无法中断。为确保数据完整性，请在页面耐心等待，请勿刷新或离开。'),
          description: intl
            .get('spcm.workspace.msg.dataComplete')
            .d('提示：当系统自动返回编辑页面时，即表示数据提取已完成。'),
        });
      } else {
        getResponse(res);
      }
    } else {
      dataSet.setState('manualCancelFlag', true);
      dataSet.status = 'ready';
      clearReExtractTimer();
      // 单击取消也进入详情页
      handleGotoDatail();
    }
  };

  return (
    <>
      {customizeForm(
        {
          code: 'SPCM.WORKSPACE_COMMON.CREATE_MODAL',
          // 此处让个性化默认值覆盖标准字段默认值
          afterCustomizeDs: () => {
            dataSet.create({
              sourceCode,
            });
          },
        },
        <Form dataSet={dataSet} columns={1} labelAlign="left" labelLayout="float">
          <Select name="sourceCode" />
          <Select name="createMethod" />
          <Select
            name="contractKindCode"
            optionsFilter={handleContractNature}
            hidden={createMethod !== '2'}
          />
          <div
            name="file"
            hidden={createMethod !== '2'}
            className={classNames('common-import-upload', {
              'common-import-upload-cursor': statusCode !== 'init',
            })}
          >
            <Dragger
              name="file"
              dataSet={dataSet}
              className="common-import-upload"
              // accept={accept}
              showUploadList={false}
              multiple={false}
              data={(file) => ({ ...uploadData, fileName: file.name })}
              headers={{
                Authorization: `bearer ${getAccessToken()}`,
                'H-Request-Id': getRequestId(),
              }}
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onChange={onDraggerUploadChange}
              onRemove={onDraggerUploadRemove}
              onProgress={handleProgress}
              customRequest={handleAction}
              onError={handleError}
              action={
                isTenantRoleLevel()
                  ? `${HZERO_FILE}/v1/${organizationId}/files/multipart`
                  : `${HZERO_FILE}/v1/files/multipart`
              }
            >
              {uploadContent}
            </Dragger>
            {enableSmartContract && (
              <div className={styles['upload-dragger-tips']}>
                {intl
                  .get('spcm.workspace.view.message.smartExtractTips')
                  .d('提示：使用智能合同相关功能请上传.doc/.docx/.pdf格式文件')}
              </div>
            )}
          </div>
          <CheckBox name="extraFlag" hidden={!(enableSmartContract && createMethod === '2')} />
        </Form>
      )}
      { dataSet?.status === 'ready' ? null : (
        <ExtractWait dataSet={dataSet} handleCancelExtract={handleCancelExtract} />
      )}
    </>
  );
});

export default function showManuallyModal({
  remote,
  history,
  dispatch,
  referenceFlag,
  customizeForm,
  ...props
}) {
  const { payload, referenceKey, enableSmartContract, docSource, searchParam = '' } = props;
  const dsProps = ManuallyDS({ props });
  const remoteDsProps = remote
    ? remote.process('SPCM_WORKSPACE_LIST_MANUALLY_DS_PROPS', dsProps, {})
    : dsProps;
  const manuallyDs = new DataSet(remoteDsProps);
  let reExtractTimer = null;

  const getPcKindCodes = ({ createMethod, contractKindCode }) => {
    if (createMethod === '1') {
      return referenceFlag // 来源上游单据，协议头上【协议性质】不可选非系统供应商
        ? ['NORMAL', 'FRAMEWORK_AGREEMENT']
        : ['NORMAL', 'FRAMEWORK_AGREEMENT', 'NOT_SYS_SUPPLIER'];
    } else if (contractKindCode === '1') {
      return ['ATTACHMENT_FRAMEWORK'];
    } else if (contractKindCode === '2') {
      return ['ATTACHMENT'];
    }
  };

  const clearReExtractTimer = () => {
    if (reExtractTimer) {
      clearInterval(reExtractTimer);
    }
  };

  const handlePageChange = async (response, smartTaskId) => {
    const { createMethod, contractKindCode, file } = manuallyDs.current.toData() || {};
    const showAttachmentFlag = manuallyDs.getState('showAttachmentFlag');
    const pcKindCodes = getPcKindCodes({ createMethod, contractKindCode });
    clearReExtractTimer();
    let res = {};
    if (payload) {
      let data = {};
      if (referenceKey === 'sourcingResults') {
        data = {
          pcSourceCode: 'SEARCH_SOURCE_RESULT',
          ...(payload?.sourceResultDTOs?.[0] || {}),
        };
      } else if (referenceKey === 'purchaseNeed') {
        data = {
          pcSourceCode: 'PURCHASE_NEED',
          ...(payload || {}),
        };
      } else if (referenceKey === 'purchaseOrder') {
        const { createPurchaseOrderList = [] } = payload;
        data = {
          pcSourceCode: 'PURCHASE_ORDER',
          companyId: createPurchaseOrderList[0]?.companyId,
          companyName: createPurchaseOrderList[0]?.companyName,
          ouId: createPurchaseOrderList[0]?.ouId,
          ouName: createPurchaseOrderList[0]?.ouName,
          purchaseOrgId: createPurchaseOrderList[0]?.purchaseOrgId,
          purchaseOrgName: createPurchaseOrderList[0]?.purOrganizationName,
          purchaseAgentId: createPurchaseOrderList[0]?.purchaseAgentId || res[0]?.purchaseAgentId,
          purchaseAgentName:
            createPurchaseOrderList[0]?.purchaseAgentName || res[0]?.purchaseAgentName,
          supplierCompanyId: createPurchaseOrderList[0]?.supplierCompanyId,
          supplierId: createPurchaseOrderList[0]?.supplierId,
          supplierTenantId: createPurchaseOrderList[0]?.supplierTenantId,
          supplierCompanyName: createPurchaseOrderList[0]?.supplierCompanyName,
          supplierName: createPurchaseOrderList[0]?.supplierName,
          termsId: createPurchaseOrderList[0]?.termsId,
          termsName: createPurchaseOrderList[0]?.termsName,
        };
      }
      res = getResponse(
        await extractCompareHeader({
          smartTaskId,
          ...data,
        })
      );
    }
    if (res) {
      const initContractInfo = {
        thirdPartyInfo: isEmpty(res)
          ? response || {}
          : {
              ...(response || {}),
              supplierCompanyId: res?.supplierCompanyId,
              supplierCompanyIdDiffFlag: res?.supplierCompanyIdDiffFlag,
              supplierCompanyIdDiffValue: res?.supplierCompanyIdDiffValue,
              supplierCompanyName: res?.supplierCompanyName,
              supplierCompanyNameDiffFlag: res?.supplierCompanyNameDiffFlag,
              supplierCompanyNameDiffValue: res?.supplierCompanyNameDiffValue,
              supplierCompanyNum: res?.supplierCompanyNum,
              companyId: res?.companyId,
              companyIdDiffFlag: res?.companyIdDiffFlag,
              companyIdDiffValue: res?.companyIdDiffValue,
              companyName: res?.companyName,
              companyNameDiffFlag: res?.companyNameDiffFlag,
              companyNameDiffValue: res?.companyNameDiffValue,
              companyNum: res?.companyNum,
            },
        enableSmartContract,
        contractAttachmentUrl: file,
        pcKindCode: pcKindCodes?.length === 1 ? pcKindCodes[0] : '',
        pcKindCodes,
        showAttachmentFlag,
      };
      const remoteInitContractInfo = remote
        ? remote.process('SPCM_WORKSPACE_LIST_INIT_CONTRACT_INFO', initContractInfo, {
            createMethod,
            contractKindCode,
          })
        : initContractInfo;
      dispatch({
        type: 'workSpace/updateState',
        payload: {
          initContractInfo: remoteInitContractInfo,
        },
      });
      const searchObj =
        docSource === 'purchaseNeed'
          ? {
              search: searchParam || '',
            }
          : {};
      dispatch(
        routerRedux.push({
          pathname: `/spcm/contract-workspace/create`,
          ...searchObj,
        })
      );
    } else {
      manuallyDs.status = 'ready';
    }
  };

  const checkFileType = () => {
    const fileType = manuallyDs.getState('fileType');
    if (fileType && fileTypes.indexOf(fileType) === -1) {
      // 非智能提取文件格式，弹窗确认
      Modal.confirm({
        title: intl.get('spcm.workspace.view.message.checkFileFormat').d('检测其他文件格式'),
        children: intl
          .get('spcm.workspace.view.message.fileFormatTips')
          .d(
            '非.doc/.docx/.pdf文件格式系统仅支持显示单据模式，您的文件将只能在单据模式中进行预览,您可以继续创建合同或退出重新上传文件。'
          ),
        onOk: () => {
          manuallyDs.setState('showAttachmentFlag', 1);
          handlePageChange();
          // 关闭全部弹窗
          Modal.destroyAll();
        },
      });
      return false;
    }
    return true;
  };

  const getExtractResult = async (res) => {
    if (manuallyDs.getState('manualCancelFlag')) {
      return;
    }
    const { taskId } = res.content[0] || {};
    const response = await extractPollResult({ taskId });
    const cuxRes = remote
      ? await remote.process(
          'handleCuxGetExtractResult',
          {
            response,
          },
          {
            res,
            taskId,
            response,
            manuallyDs,
            clearReExtractTimer,
            handlePageChange,
            handleSubmitAfter,
          }
        )
      : getResponse(response);
    if (cuxRes) {
      if (Number(response?.smartTaskFetchFlag) === 1) {
        handlePageChange(response, taskId);
      }
    } else {
      clearReExtractTimer();
      manuallyDs.status = 'ready';
    }
  };

  const handleSubmitAfter = async (res) => {
    manuallyDs.status = 'done';
    const { taskId } = res.content[0] || {};
    manuallyDs.setState('taskId', taskId);
    await getExtractResult(res); // 此处为了立即执行而不是等5s后才执行轮询
    reExtractTimer = setInterval(async () => {
      await getExtractResult(res);
    }, 5000);
  };

  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.common.button.manuallyCreate').d('新建'),
    children: (
      <ManuallyModal
        {...props}
        remote={remote}
        dataSet={manuallyDs}
        clearReExtractTimer={clearReExtractTimer}
        customizeForm={customizeForm}
        handleGotoDatail={handlePageChange}
      />
    ),
    closable: true,
    destroyOnClose: true,
    style: {
      width: '380px',
    },
    afterClose: () => {
      manuallyDs.reset();
      clearReExtractTimer();
    },
    onOk: async () => {
      const flag = await manuallyDs.validate();
      const { extraFlag, file, createMethod, __id } = manuallyDs.current.toData() || {};
      if (flag) {
        // 重置手工取消状态
        manuallyDs.setState('manualCancelFlag', null);
        manuallyDs.current.set('fileUrl', file);
        manuallyDs.setState('taskId', null);
        // 校验文件格式
        const checkResult = checkFileType();
        if (!checkResult) {
          return false;
        }
        if (createMethod === '1' || !extraFlag) {
          handlePageChange();
          return true;
        } else {
          manuallyDs.current.set('__id', __id + 1);
          const res = await manuallyDs.submit();
          if (res?.content) {
            handleSubmitAfter(res);
          } else {
            clearReExtractTimer();
            manuallyDs.status = 'ready';
          }
          return false;
        }
      } else {
        if (!file) {
          notification.error({
            message: intl.get('hzero.common.validation.notNull', {
              name: intl.get(`spcm.workspace.model.extractFile`).d('合同附件'),
            }),
          });
        }
        return false;
      }
    },
  });
}
