// @ts-nocheck
import * as React from 'react';
import { Modal, Progress, Button, Icon } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';
import type { UploadFile } from 'choerodon-ui/lib/upload/interface';
import axios from 'axios';
import classNames from 'classnames';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import { numberRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getAccessToken, getRequestId, getResponse } from 'utils/utils';

import { downloadFileByAxios } from 'services/api';

import iconExcel from '@/assets/icon_excel.svg';

import './index.less';
import _store, { EState, EImportStatus, EImportType } from './stores';
import EditDrawer from './EditDrawer';
// FIXME: 一个字都没改为啥要复制过来
import webUploader from './webUploader';
import HistoryDrawer from './HistoryDrawer';
import { getUplaodFileSvg } from './utils/util';

const { BKT_PUBLIC, HZERO_IMP, HZERO_PLATFORM } = getEnvConfig();

interface ImportProps {
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({ myRef }) => {
  const {
    draggerData: {
      state,
      isAuto,
      autoRefreshInterval,
      importProgress = 0,
      checkProgress = 0,
      status,
      count,
      ready,
      queryTimer,
      progress = 0,
      uploaded = false,
    },
    setState,
    setDraggerData,
    dataSource: {
      prefixPatch,
      servicePath,
      tenantId,
      code: templateCode,
      bindTemplateCode,
      templateCategory,
      batch,
      args = {},
      fragmentFlag = 0,
      importType,
      fileName = '',
      refreshButton,
      auto,
      restoreShowAllButton = true,
      actualTemplateCode,
      successCallBack,
      errorCallBack,
      autoExecute,
    },
    dataSource,
    setDataSource,
  } = React.useContext<any>(_store as any).store;

  // FIXME: 半路加的mobx-react-lite阿巴阿巴，后面改
  // const [progress, setProgress] = React.useState<number>(0);
  const [fileList, setFileList] = React.useState<Array<UploadFile>>([]);
  const [self] = React.useState<any>({});
  const confirmModalRef = React.useRef();

  const { configureParams } = getEnvConfig();

  React.useImperativeHandle(myRef, () => ({
    handleOpenHistory,
    handleRefresh,
  }));

  const handleOpenHistory = () => {
    Modal.open({
      closable: true,
      movable: false,
      drawer: true,
      style: { width: 1090 },
      key: 'import_history',
      destroyOnClose: true,
      title: intl.get('hzero.common.components.import.title.importHistory').d('导入历史'),
      children: (
        // @ts-ignore
        <HistoryDrawer
          dataSource={dataSource}
          onRestore={handleRestore}
          onDownloadSource={handleDownloadSourceFile}
          onDownloadFailure={handleDownloadFailureFile}
        />
      ),
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (_, cancelBtn) => {
        return <>{cancelBtn}</>;
      },
    });
  };

  React.useEffect(() => {
    if (fragmentFlag) {
      const options = {
        prefixPatch,
        uploadMode: 'default',
        bucketName: BKT_PUBLIC,
        chunkSize: configureParams?.chunkUploadSize || 5 * 1024 * 1024,
      };
      webUploader.setParams({
        organizationId: tenantId,
        templateCode,
        templateCategory,
      });
      if (prefixPatch) {
        webUploader.init(options);
      }
    }
  }, [fragmentFlag, prefixPatch]);

  React.useEffect(() => {
    if (isAuto && !queryTimer) {
      handleRefresh();
      // TODO: 想要真的定期准时触发用settimeout去
      setDraggerData(
        'queryTimer',
        setInterval(() => {
          handleRefresh();
        }, Number(autoRefreshInterval))
      );
    } else if (!isAuto) {
      clearInterval(queryTimer);
      setDraggerData('queryTimer', undefined);
    }
  }, [isAuto, autoRefreshInterval, prefixPatch, queryTimer]);

  const handleRestore = React.useCallback(
    obj => {
      setDataSource(obj);
      setState(EState.checking);
      setDraggerData('status', EImportStatus.UPLOADING);
      setDraggerData('isAuto', false);
      handleRefresh(obj);
      // validateData();
    },
    [prefixPatch, actualTemplateCode]
  );

  const handleReImport = React.useCallback(() => {
    setState(EState.checking);
    setDraggerData('status', EImportStatus.UPLOADING);
    validateData(false);
  }, [prefixPatch]);

  const handleChange = React.useCallback(({ fileList: newFileList }) => {
    const arr = newFileList.slice(-1);
    setFileList(arr);
  }, []);

  const handleSuccess = React.useCallback(
    response => {
      if (importType !== EImportType.businessObjectTemplateCategory) {
        setDataSource({ batch: response });
      } else {
        setDataSource({
          batch: response.batch,
          actualTemplateCode: response.templateCode,
          prefixPatch: `/${response.prefixPatch}`,
        });
      }
      setDraggerData('uploaded', true);
      setDraggerData('isAuto', true);
    },
    [importType]
  );

  const handleError = React.useCallback(() => {
    setState(EState.init);
    setFileList([]);
    setDataSource({ fileName: '' });
  }, []);

  const handleProgress = React.useCallback(({ percent }) => {
    // setProgress(Math.floor(percent));
    setDraggerData('progress', Math.min(Math.floor(percent), 99));
  }, []);

  const handleBeforeUpload = file => {
    const isLimit = file.size < 1000 * 1024 * 1024;
    if (!isLimit && fragmentFlag) {
      notification.error({
        message: intl
          .get('hzero.common.components.import.title.fileSize')
          .d(`只支持小于${1000}MB的文件！`),
      });
    } else {
      setDataSource({ fileName: file.name });
    }
    return isLimit || !fragmentFlag;
  };

  const handleCancel = React.useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!fragmentFlag && typeof self.onCancel === 'function') {
        self.onCancel();
      } else {
        const files = webUploader._uploader?.getFiles();
        if (files && files[file]) {
          webUploader._uploader.cancelFile(files[file]);
        }
      }
      setState(EState.init);
      setFileList([]);
    },
    [self]
  );

  const handleEdit = e => {
    e.preventDefault();
    e.stopPropagation();
    const modal = Modal.open({
      closable: true,
      movable: false,
      drawer: true,
      className: 'srm-common-import-edit-drawer',
      style: { width: 1090 },
      key: 'online_edit',
      destroyOnClose: true,
      title: intl.get('hzero.common.components.import.title.edit').d('在线编辑报错字段'),
      children: <EditDrawer dataSource={dataSource} onReimport={handleReImport} />,
      footer: () => {
        return (
          <div style={{ textAlign: 'left' }}>
            <Button
              onClick={() => {
                modal.close();
                handleReImport();
              }}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.components.import.reImport').d('重新导入')}
            </Button>
            <Button
              onClick={() => {
                // modal.close();
              }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
        );
      },
    });
  };

  const handleImport = React.useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      validateData();
      notification.success({
        message: intl.get('hzero.common.components.import.importing').d('导入中'),
      });
    },
    [self, refreshButton, prefixPatch, auto]
  );

  const validateData = React.useCallback((firstImport = true) => {
    setDraggerData('status', EImportStatus.CHECKING);
    setState(EState.checking);
    setDraggerData('checkProgress', 0);
    setDraggerData('importProgress', 0);
    const extraParam = {};
    if (firstImport) {
      extraParam.firstImport = firstImport;
    }
    const params = {
      templateCode: actualTemplateCode || templateCode,
      batch,
      autoExecute,
      ...extraParam,
    };
    if (bindTemplateCode) {
      params.bindTemplateCode = bindTemplateCode;
    }
    axios({
      url: `${prefixPatch}/v1/${tenantId}/import/data${importType === EImportType.templateCode ? '' : '/model'
        }/data-validate`,
      method: 'POST',
      params,
    })
      .then(res => {
        if (getResponse(res)) {
          if (auto) {
            setDraggerData('isAuto', true);
          }
        } else {
          setDraggerData('isAuto', false);
          setState(EState.done);
        }
      })
      .catch(e => {
        setDraggerData('isAuto', false);
        setState(EState.done);
        notification.error({
          message: e?.message,
        });
      });
  }, [
    prefixPatch,
    tenantId,
    templateCode,
    templateCategory,
    batch,
    importType,
    refreshButton,
    auto,
    actualTemplateCode,
    bindTemplateCode,
  ]);

  // const importData = React.useCallback(() => {
  //   axios({
  //     url: `${prefixPatch}/v1/${tenantId}/import/data${
  //       importType === EImportType.templateCode ? '' : '/model'
  //     }/data-import`,
  //     method: 'POST',
  //     params: {
  //       templateCategory,
  //       templateCode,
  //       batch,
  //     },
  //   })
  //     .then((res) => {
  //       if (getResponse(res)) {
  //         if (!refreshButton) {
  //           setDraggerData('isAuto', true);
  //         }
  //       } else {
  //         setDraggerData('isAuto', false);
  //       }
  //     })
  //     .catch(() => {
  //       setDraggerData('isAuto', false);
  //     });
  // }, [prefixPatch, tenantId, templateCode, templateCategory, importType, batch, refreshButton]);

  const handleRefresh = React.useCallback(
    ({ batch: newBatch, flag } = {}) => {
      axios({
        url: `${prefixPatch}/v1/${tenantId}/import/data${importType === EImportType.templateCode ? '' : '/model'
          }/status`,
        method: 'GET',
        params: {
          batch: newBatch || batch,
        },
      })
        .then((res: any) => {
          if (getResponse(res)) {
            setDraggerData('status', res.status);
            switch (res.status) {
              case EImportStatus.UPLOADING:
                break;
              case EImportStatus.UPLOADED:
                /**
                 * 阻止状态转换 EImportStatus.CHECKING => EImportStatus.UPLOADED
                 * 此时的后端状态不一定准确
                 */
                if (status === EImportStatus.CHECKING) break;
                const handle = () => {
                  setDraggerData('progress', 100);
                  setDraggerData('checkProgress', 0);
                  setDraggerData('importProgress', 0);
                  if (flag) {
                    setState(EState.uploaded);
                  } else {
                    setDraggerData('isAuto', false);
                    setState(EState.done);
                  }
                };
                if (!res.tipMessage) {
                  handle();
                } else if (!confirmModalRef.current) {
                  confirmModalRef.current = Modal.confirm({
                    title: intl.get('hzero.common.components.import.confirm.continueImport').d('确定要继续导入吗'),
                    children: <div>{res.tipMessage}</div>,
                    okText: intl.get('hzero.common.components.import.button.continueImport').d('继续导入'),
                    cancelText: intl.get('hzero.common.components.import.button.canclelImport').d('取消导入'),
                  }).then(buttonType => {
                    confirmModalRef.current = null;
                    if (buttonType === 'ok') {
                      handle();
                    } else {
                      setDraggerData('isAuto', false);
                      handleError();
                    }
                  });
                }
                break;
              case EImportStatus.CHECKING:
                setDraggerData(
                  'checkProgress',
                  Number(numberRender((res.ready * 100) / res.count, 0))
                );
                setDraggerData('importProgress', 0);
                break;
              case EImportStatus.CHECKED:
                setDraggerData('checkProgress', 100);
                setDraggerData('importProgress', 0);
                break;
              case EImportStatus.CHECK_FAILED:
                setDraggerData('checkProgress', 100);
                setDraggerData('importProgress', 0);
                setDraggerData('count', res.dataCount);
                setDraggerData('ready', res.ready);
                setState(EState.checkFailed);
                setDraggerData('isAuto', false);
                break;
              case EImportStatus.IMPORTING:
                setDraggerData(
                  'importProgress',
                  Number(numberRender((res.ready * 100) / res.count, 0))
                );
                setDraggerData('checkProgress', 100);

                break;
              case EImportStatus.IMPORTED:
                setDraggerData('checkProgress', 100);
                setDraggerData('importProgress', 100);
                setDraggerData('isAuto', false);
                // if (!newBatch || !flag) {
                //   handleOpenHistory();
                // }
                notification.success({
                  message: res?.statusMeaning,
                });
                if (successCallBack && typeof successCallBack === 'function') {
                  successCallBack(res);
                }
                break;
              case EImportStatus.IMPORT_FAILED:
                setDraggerData('checkProgress', 100);
                setDraggerData('importProgress', 100);
                setDraggerData('count', res.dataCount);
                setDraggerData('ready', res.ready);
                setState(EState.checkFailed);
                setDraggerData('isAuto', false);
                // if (!newBatch || !flag) {
                //   handleOpenHistory();
                // }
                notification.error({
                  message: res?.statusMeaning,
                });
                if (errorCallBack && typeof errorCallBack === 'function') {
                  errorCallBack();
                }
                break;
              case EImportStatus.IMPORT_PART_SUCCESS:
                setDraggerData('checkProgress', 100);
                setDraggerData('importProgress', 100);
                setDraggerData('count', res.dataCount);
                setDraggerData('ready', res.ready);
                setState(EState.checkFailed);
                setDraggerData('isAuto', false);
                // if (!newBatch || !flag) {
                //   handleOpenHistory();
                // }
                notification.error({
                  message: res?.statusMeaning,
                });
                if (errorCallBack && typeof errorCallBack === 'function') {
                  errorCallBack();
                }
                break;  
              default:
            }

            //
          } else {
            setDraggerData('count', 0);
            setDraggerData('ready', 0);
            setDraggerData('checkProgress', 0);
            setDraggerData('importProgress', 0);
            setState(EState.done);
            setDraggerData('isAuto', false);
          }
        })
        .catch(e => {
          setDraggerData('count', 0);
          setDraggerData('ready', 0);
          setDraggerData('checkProgress', 0);
          setDraggerData('importProgress', 0);
          setState(EState.done);
          setDraggerData('isAuto', false);
          notification.error({
            message: e?.message,
          });
        });
    },
    [prefixPatch, tenantId, batch, importType, handleError, status]
  );

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
      setDraggerData('progress', 0);
      setDraggerData('uploaded', false);
      // setProgress(0);
      setState(EState.uploading);
      if (fragmentFlag) {
        handleChunkAUpload({
          file,
          onError,
          onProgress,
          onSuccess,
        });
      } else {
        handleUpload({
          action,
          data,
          file,
          filename,
          headers,
          onError,
          onProgress,
          onSuccess,
          withCredentials,
        });
      }
      return {
        // FIXME: 返回了也没用啊，为啥要返回
        abort() {
          console.log('upload progress is aborted.');
        },
      };
    },
    []
  );

  const handleUpload = React.useCallback(
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
      const { CancelToken } = axios;
      const formData = new FormData();
      if (data) {
        Object.keys(data).forEach(key => {
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
          cancelToken: new CancelToken(e => {
            // 触发渲染不会调用接口，所以更改对象属性
            self.onCancel = e;
          }),
          responseType: 'text',
        })
        .then((res: any) => {
          try {
            const response = JSON.parse(res);
            getResponse(response);
          } catch {
            onSuccess(res, file);
          }
        })
        .catch(e => {
          onError(e);
          handleError();
          notification.error({
            message: e?.message,
          });
        });
    },
    []
  );

  const handleChunkAUpload = React.useCallback(async ({ file, onError, onProgress, onSuccess }) => {
    const { success, data: webData, msg } = await webUploader.upload(file, percentage => {
      onProgress({ percent: percentage * 100 });
    });
    if (success) {
      onSuccess(webData);
    } else {
      onError(new Error(msg));
      handleError();
    }
  }, []);

  const handleDownloadSourceFile = React.useCallback(
    record => {
      const api = `${HZERO_PLATFORM}/v1/${tenantId}/import-tasks/download/${record.importTaskId}`;
      const queryParams = [];
      downloadFileByAxios({ requestUrl: api, queryParams, method: 'GET' });
      // .catch((e) => {
      //   notification.error({ message: e.message });
      // });
    },
    [tenantId]
  );

  const handleDownloadFailureFile = React.useCallback(
    record => {
      const api =
        importType === 'templateCode'
          ? `${prefixPatch}/v1/${tenantId}/import/manager/export/excel`
          : `${prefixPatch}/v1/${tenantId}/import/data/model/export/excel`;
      const queryParams = [{ name: 'batch', value: record.batchNum || batch }];
      if (importType === 'templateCode') {
        queryParams.push({ name: 'templateCode', value: record.templateCode });
      }
      downloadFileByAxios({ requestUrl: api, queryParams, method: 'GET' });
      // .catch((e) => {
      //   notification.error({ message: e.message });
      // });
    },
    [tenantId, importType, prefixPatch, batch]
  );

  const handleReUpload = React.useCallback(() => {
    setDraggerData('count', 0);
    setDraggerData('ready', 0);
    setDraggerData('checkProgress', 0);
    setDraggerData('importProgress', 0);
  }, []);

  const renderImportProgress = () => {
    switch (status) {
      case EImportStatus.IMPORTING:
        return (
          <span className="common-import-upload-import-progress-item-title-text">
            {intl.get('hzero.common.components.import.dataImporting').d('数据导入中')}
          </span>
        );
      case EImportStatus.IMPORTED:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.dataImportSuccess').d('数据导入完成')}
            </span>
            <Icon className="common-import-upload-import-progress-item-title-icon" type="check" />
          </>
        );
      case EImportStatus.IMPORT_FAILED:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.dataImportFail').d('数据导入失败')}
            </span>
            <Icon className="common-import-upload-import-progress-item-title-icon" type="close" />
          </>
        );
      case EImportStatus.IMPORT_PART_SUCCESS:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text" style={{ color: 'rgba(252,164,0)' }}>
              {intl.get('hzero.common.components.import.dataImportPartSuccess').d('部分导入成功')}
            </span>
            <Icon className="common-import-upload-import-progress-item-title-icon" type="close" style={{ color: 'rgba(252,164,0)' }} />
          </>
        );  
      default:
        return (
          <span
            className="common-import-upload-import-progress-item-title-text"
            style={{ color: 'rgba(0, 0, 0, 0.45)' }}
          >
            {intl.get('hzero.common.components.import.dataImport').d('数据导入')}
          </span>
        );
    }
  };

  const renderCheckProgress = () => {
    switch (status) {
      case EImportStatus.CHECKING:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.message.checking').d('数据校验中')}
            </span>
          </>
        );
      case EImportStatus.CHECK_FAILED:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.message.checkFailure').d('校验失败')}
            </span>
            <Icon className="common-import-upload-import-progress-item-title-icon" type="close" />
          </>
        );
      case EImportStatus.UPLOADING:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.message.check').d('数据校验')}
            </span>
          </>
        );
      case EImportStatus.UPLOADED:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.message.check').d('数据校验')}
            </span>
          </>
        );
      default:
        return (
          <>
            <span className="common-import-upload-import-progress-item-title-text">
              {intl.get('hzero.common.components.import.message.checkSuccess').d('校验成功')}
            </span>
            <Icon className="common-import-upload-import-progress-item-title-icon" type="check" />
          </>
        );
    }
  };

  const renderCheckResult = () => {
    return (
      <div className="common-import-upload-import-tooltip-failed">
        <div className="common-import-upload-import-tooltip-failed-title">
          {intl.get('hzero.common.components.import.failed.tooltip').d('你可以选择以下任意方案：')}
        </div>
        <div className="common-import-upload-import-tooltip-failed-content">
          <div
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <span className="common-import-upload-import-tooltip-failed-content-text" style={{ display: 'block' }}>
              1.
              {![EImportStatus.IMPORT_FAILED, EImportStatus.CHECK_FAILED].includes(status)
                ? intl
                  .get('hzero.common.components.import.failed.tooltip.success.first')
                  .d('在线编辑文件，修改后重新导入')
                : intl
                  .get('hzero.common.components.import.failed.tooltip.first')
                  .d('在线编辑文件，修改校验失败项后重新导入')}
              <Button
                onClick={handleEdit}
                className="common-import-template-button"
                icon="mode_edit"
                funcType={FuncType.flat}
                color={ButtonColor.primary}
              >
                {intl.get('hzero.common.components.import.onlineEdit').d('在线编辑')}
              </Button>
            </span>
          </div>

          <div>
            <span className="common-import-upload-import-tooltip-failed-content-text">
              2.
              {importType !== EImportType.templateCode ||
                ![EImportStatus.IMPORT_FAILED, EImportStatus.CHECK_FAILED].includes(status)
                ? intl.get('hzero.common.components.import.failed.tooltip.oldSecond').d('重新上传')
                : intl
                  .get('hzero.common.components.import.failed.tooltip.second')
                  .d('下载失败文件，修改后重新上传')}
            </span>
            {importType !== EImportType.templateCode &&
              [EImportStatus.IMPORT_FAILED, EImportStatus.CHECK_FAILED].includes(status) && (
                <div
                  style={{ display: 'inline-block' }}
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <Button
                    onClick={e => {
                      handleDownloadFailureFile({});
                    }}
                    className={classNames(
                      'common-import-template-button',
                      'common-import-upload-button'
                    )}
                    icon="get_app"
                    funcType={FuncType.flat}
                    color={ButtonColor.primary}
                  >
                    {intl.get('hzero.common.components.import.downloadFailFile').d('下载失败文件')}
                  </Button>
                </div>
              )}
            <Button
              className={classNames('common-import-template-button', 'common-import-upload-button')}
              icon="replay"
              funcType={FuncType.flat}
              color={ButtonColor.primary}
            // onClick={handleReUpload}
            >
              {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const uploadContent = React.useMemo(() => {
    switch (state) {
      case EState.init:
        return (
          <>
            {getUplaodFileSvg()}
            <div className="common-import-upload-text">
              {intl.get('hzero.common.components.import.message.drag').d('拖拽或点击此处选择文件')}
            </div>
            <div className="common-import-upload-text" style={{ paddingBottom: '24px' }}>
              0/1
            </div>
          </>
        );
      case EState.uploading:
        return (
          <>
            <img className="common-import-upload-icon-excel" src={iconExcel} alt="upload" />
            <div className="common-import-upload-text">{fileName}</div>
            <Progress
              showInfo={false}
              strokeWidth={2}
              className="common-import-upload-progress"
              value={progress}
            />
            {!uploaded && (
              <div className="common-import-upload-button">
                <Button className="common-import-template-button-item" onClick={handleCancel}>
                  {intl.get('hzero.common.components.import.cancelUpload').d('取消上传')}
                </Button>
              </div>
            )}
          </>
        );
      case EState.done:
        return (
          <>
            <img className="common-import-upload-icon" src={iconExcel} alt="upload" />
            <div className="common-import-upload-text">{fileName}</div>
            <div
              style={{ display: 'inline-block', marginRight: '8px', marginTop: '12px' }}
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <Button
                className={classNames(
                  'common-import-template-button-item',
                  'common-import-template-button-item-hover'
                )}
                onClick={handleImport}
                color={ButtonColor.primary}
                style={{ border: 'none' }}
              >
                {intl.get('hzero.common.components.import.dataImport').d('数据导入')}
              </Button>
            </div>
            <Button className="common-import-template-button-item" onClick={handleReUpload}>
              {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
            </Button>
          </>
        );
      case EState.checking:
        return (
          <>
            <div className="common-import-upload-extra">
              <img className="common-import-upload-extra-icon" src={iconExcel} alt="upload" />
              <span className="common-import-upload-extra-text">{fileName}</span>
            </div>
            <div className="common-import-upload-import-progress">
              <div className="common-import-upload-import-progress-item">
                <div
                  className={classNames('common-import-upload-import-progress-item-title', {
                    'common-import-upload-import-progress-item-title-success': [
                      EImportStatus.CHECKED,
                      EImportStatus.IMPORTING,
                      EImportStatus.IMPORTED,
                      EImportStatus.IMPORT_FAILED,
                    ].includes(status),
                    'common-import-upload-import-progress-item-title-error': [
                      EImportStatus.CHECK_FAILED,
                    ].includes(status),
                  })}
                >
                  {renderCheckProgress()}
                </div>
                <div className="common-import-upload-import-progress-item-content">
                  <Progress
                    showInfo={false}
                    strokeWidth={2}
                    value={checkProgress}
                    status={
                      // eslint-disable-next-line no-nested-ternary
                      status === EImportStatus.CHECK_FAILED
                        ? ProgressStatus.exception
                        : [
                          EImportStatus.CHECKED,
                          EImportStatus.IMPORTED,
                          EImportStatus.IMPORTING,
                          EImportStatus.IMPORT_FAILED,
                        ].includes(status)
                          ? ProgressStatus.success
                          : ProgressStatus.active
                    }
                  />
                </div>
              </div>
              <div className="common-import-upload-import-progress-item">
                <div
                  className={classNames('common-import-upload-import-progress-item-title', {
                    'common-import-upload-import-progress-item-title-success':
                      status === EImportStatus.IMPORTED,
                    'common-import-upload-import-progress-item-title-error':
                      status === EImportStatus.IMPORT_FAILED,
                  })}
                >
                  {renderImportProgress()}
                </div>
                <div className="common-import-upload-import-progress-item-content">
                  <Progress
                    showInfo={false}
                    strokeWidth={2}
                    value={importProgress}
                    status={
                      // eslint-disable-next-line no-nested-ternary
                      status === EImportStatus.IMPORT_FAILED
                        ? ProgressStatus.exception
                        : status === EImportStatus.IMPORTED
                          ? ProgressStatus.success
                          : ProgressStatus.active
                    }
                  />
                </div>
              </div>
            </div>
            {status === EImportStatus.IMPORTED && restoreShowAllButton && renderCheckResult()}
          </>
        );

      case EState.uploaded:
        return (
          <>
            <div className="common-import-upload-extra">
              <img className="common-import-upload-extra-icon" src={iconExcel} alt="upload" />
              <span className="common-import-upload-extra-text">{fileName}</span>
            </div>
            {renderCheckResult()}
          </>
        );
      case EState.checkFailed:
        return (
          <>
            <div className="common-import-upload-extra">
              <img className="common-import-upload-extra-icon" src={iconExcel} alt="upload" />
              <span className="common-import-upload-extra-text">{fileName}</span>
            </div>
            <div className="common-import-upload-import-progress">
              <div className="common-import-upload-import-progress-item">
                <div
                  className={classNames('common-import-upload-import-progress-item-title', {
                    'common-import-upload-import-progress-item-title-success': [
                      EImportStatus.CHECKED,
                      EImportStatus.IMPORTING,
                      EImportStatus.IMPORTED,
                      EImportStatus.IMPORT_FAILED,
                    ].includes(status),
                    'common-import-upload-import-progress-item-title-error': [
                      EImportStatus.CHECK_FAILED,
                    ].includes(status),
                  })}
                >
                  {renderCheckProgress()}
                </div>
                <div className="common-import-upload-import-progress-item-content">
                  <Progress
                    showInfo={false}
                    strokeWidth={2}
                    value={100}
                    // strokeColor=''
                    status={
                      [EImportStatus.CHECK_FAILED].includes(status)
                        ? ProgressStatus.exception
                        : ProgressStatus.success
                    }
                  />
                </div>
              </div>
              <div className="common-import-upload-import-progress-item">
                <div
                  className={classNames('common-import-upload-import-progress-item-title', {
                    'common-import-upload-import-progress-item-title-success':
                      status === EImportStatus.IMPORTED,
                    'common-import-upload-import-progress-item-title-error':
                      status === EImportStatus.IMPORT_FAILED,
                  })}
                >
                  {renderImportProgress()}
                </div>
                <div className="common-import-upload-import-progress-item-content">
                  <Progress
                    showInfo={false}
                    strokeWidth={2}
                    value={importProgress}
                    status={
                      // eslint-disable-next-line no-nested-ternary
                      status === EImportStatus.IMPORT_FAILED
                        ? ProgressStatus.exception
                        : status === EImportStatus.IMPORTED
                          ? ProgressStatus.success
                          : ProgressStatus.active
                    }
                    strokeColor={status === EImportStatus.IMPORT_PART_SUCCESS ? 'rgba(252,164,0)' : ''}
                  />
                </div>
              </div>
            </div>
            <div className="common-import-upload-import-tooltip">
              {intl
                .get('hzero.common.components.import.pending.tooltip1', {
                  count,
                })
                .d(`导入${count}条数据`)}
              ，{intl.get('hzero.common.components.import.pending.tooltip4', { count: ready }).d(`成功${ready}条`)}，{intl.get('hzero.common.components.import.pending.tooltip2').d('失败')}
              <span style={{ color: '#f56349', margin: '0 4px' }}>{count - ready}</span>
              {intl.get('hzero.common.components.import.pending.tooltip3').d('条')}
            </div>
            {renderCheckResult()}
          </>
        );
      default:
        return null;
    }

    // FIXME: 写这么多，干脆别useMemo了吧
  }, [
    progress,
    fileName,
    state,
    importProgress,
    checkProgress,
    status,
    count,
    ready,
    fragmentFlag,
    importType,
    refreshButton,
    restoreShowAllButton,
    auto,
    uploaded,
    prefixPatch,
  ]);

  return (
    <div
      className={classNames('common-import-upload', {
        'common-import-upload-cursor': state !== EState.init,
      })}
    >
      <Upload.Dragger
        name="excel"
        multiple={false}
        className="common-import-upload"
        onChange={handleChange}
        onSuccess={handleSuccess}
        // FIXME: 为啥onError不行
        onError={handleError}
        beforeUpload={handleBeforeUpload}
        onProgress={handleProgress}
        showUploadList={false}
        accept=".xls,.xlsx"
        action={`${importType !== EImportType.businessObjectTemplateCategory ? prefixPatch : HZERO_IMP
          }/v1/${tenantId}${importType === EImportType.templateCode ||
            importType === EImportType.businessObjectTemplateCode
            ? `/import/data${importType === EImportType.businessObjectTemplateCode ? '/model' : ''
            }/data-upload`
            : '/file-imports/import'
          }?${importType === EImportType.businessObjectTemplateCategory
            ? 'templateCategory'
            : 'templateCode'
          }=${templateCode}${servicePath ? `&servicePath=${servicePath}` : ''}${bindTemplateCode ? `&bindTemplateCode=${bindTemplateCode}` : ''}`}
        fileList={fileList}
        data={{ param: JSON.stringify(args) }}
        headers={{
          Authorization: `bearer ${getAccessToken()}`,
          'H-Request-Id': getRequestId(),
        }}
        customRequest={handleAction}
      >
        {uploadContent}
      </Upload.Dragger>
    </div>
  );
};

export default observer(Drawer);
