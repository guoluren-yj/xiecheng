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
import request from 'utils/request';
import { API_HOST } from 'utils/config';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';
import { getAccessToken, getRequestId, getResponse, getCurrentTenant } from 'utils/utils';

import { downloadFileByAxios, initiateAsyncExport } from 'services/api';

import iconExcel from '@/assets/icon_excel.svg';

import './index.less';
import _store, { EState, EImportStatus } from './stores';
import EditDrawer from './EditDrawer';
// FIXME: 一个字都没改为啥要复制过来
import webUploader from './webUploader';
import HistoryDrawer from './HistoryDrawer';
import { getUplaodFileSvg } from './utils/util';

const { BKT_PUBLIC } = getEnvConfig();
const currentTenant = getCurrentTenant();
interface ImportProps {
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({ myRef }) => {
  const {
    draggerData: {
      state,
      isAuto,
      autoRefreshInterval,
      status,
      ready,
      queryTimer,
      progress = 0,
      importProgress = 0,
      uploaded = false,
    },
    setState,
    setDraggerData,
    dataSource: {
      prefixPatch,
      tenantId,
      batch,
      args = {},
      fragmentFlag = 0,
      importType,
      fileName = '',
      refreshButton,
      auto,
      restoreShowAllButton = true,
      actualTemplateCode,
    },
    dataSource,
    setDataSource,
  } = React.useContext<any>(_store as any).store;

  // FIXME: 半路加的mobx-react-lite阿巴阿巴，后面改
  // const [progress, setProgress] = React.useState<number>(0);
  const [fileList, setFileList] = React.useState<Array<UploadFile>>([]);
  const [self] = React.useState<any>({});

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
  }, [isAuto, batch, autoRefreshInterval, prefixPatch, queryTimer, handleRefresh]);

  const handleRestore = React.useCallback(
    (obj) => {
      setDataSource(obj);
      setDraggerData('status', obj.status);
      setDraggerData('isAuto', false);
      handleRefresh(obj);
      const modal = Modal.open({
        closable: true,
        movable: false,
        drawer: true,
        className: 'srm-common-import-edit-drawer',
        style: { width: 1090 },
        key: 'online_edit',
        destroyOnClose: true,
        title: intl.get('spfm.rulesDefinition.view.title.headerImport').d('业务规则导入'),
        children: (
          <EditDrawer
            dataSource={{ ...obj }}
            status={obj.status}
            modal={modal}
            handleRefresh={handleRefresh}
          />
        ),
        footer: () => {
          return (
            <div style={{ textAlign: 'left' }}>
              <Button
                onClick={() => {
                  // modal.close();
                }}
                color={ButtonColor.primary}
              >
                {intl.get('hzero.common.button.next').d('下一步')}
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
    },
    [prefixPatch, actualTemplateCode, handleRefresh]
  );

  const handleChange = React.useCallback(({ fileList: newFileList }) => {
    const arr = newFileList.slice(-1);
    setFileList(arr);
  }, []);

  const handleSuccess = React.useCallback(
    (response) => {
      setDataSource({ batch: response?.data || response });
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

  const handleBeforeUpload = (file) => {
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
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!fragmentFlag && typeof self.onCancel === 'function') {
        self.onCancel();
      } else {
        console.log(e);
        // const files = webUploader._uploader?.getFiles();
        // if (files && files[file]) {
        //   webUploader._uploader.cancelFile(files[file]);
        // }
      }
      setState(EState.init);
      setFileList([]);
    },
    [self]
  );

  const handleImport = React.useCallback(
    (e) => {
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
        title: intl.get('spfm.rulesDefinition.view.title.headerImport').d('业务规则导入'),
        children: (
          <EditDrawer
            dataSource={dataSource}
            status={status}
            modal={modal}
            handleRefresh={handleRefresh}
          />
        ),
        footer: () => {
          return (
            <div style={{ textAlign: 'left' }}>
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
    },
    [self, status, refreshButton, prefixPatch, auto, dataSource, handleRefresh]
  );

  const handleRefresh = React.useCallback(
    ({ batch: newBatch } = {}) => {
      return axios({
        url: `${API_HOST}/spfm/v1/${tenantId}/cnf-import/status`,
        method: 'GET',
        params: {
          batch: newBatch || batch,
        },
        headers: {
          Authorization: `bearer ${getAccessToken()}`,
          'H-Request-Id': getRequestId(),
        },
      })
        .then((res: any) => {
          const resData = res.data || res;
          if (getResponse(resData)) {
            setDraggerData('status', resData.status);
            // setDraggerData('ready', 0);
            if (resData.status === 'UPLOADING') {
              setState(EState.checking);
              setDraggerData('ready', 0);
              setDraggerData('importProgress', 99);
              setDraggerData('isAuto', true);
            } else if (resData.status === 'UPLOAD_FAILED') {
              setDraggerData('ready', 0);
              setState(EState.checkFailed);
              setDraggerData('importProgress', 100);
              setDraggerData('isAuto', false);
            } else {
              setDraggerData('ready', 0);
              setState(EState.done);
              setDraggerData('isAuto', false);
            }
            return resData.status;
          } else {
            setDraggerData('ready', 0);
            setState(EState.done);
            setDraggerData('isAuto', false);
            return undefined;
          }
        })
        .catch((e) => {
          console.log(e, 'error');
          setDraggerData('ready', 0);
          setState(EState.done);
          setDraggerData('isAuto', false);
          notification.error({
            message: e?.message,
          });
        });
    },
    [batch]
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
        .then((res: any) => {
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
          notification.error({
            message: e?.message,
          });
        });
    },
    []
  );

  const handleChunkAUpload = React.useCallback(async ({ file, onError, onProgress, onSuccess }) => {
    const { success, data: webData, msg } = await webUploader.upload(file, (percentage) => {
      onProgress({ percent: percentage * 100 });
    });
    if (success) {
      onSuccess(webData);
    } else {
      onError(new Error(msg));
      handleError();
    }
  }, []);

  const handleDownloadFailureFile = React.useCallback(
    (record) => {
      const api = `/spfm/v1/${tenantId}/cnf-import/export/excel`;
      const { tenantNum } = currentTenant;
      request(api, {
        query: { exportType: 'COLUMN', tenantNum, batch: record.batch || batch },
        method: 'GET',
      }).then((res) => {
        if (getResponse(res)) {
          const data = res.children || [];
          const params = [];
          data.forEach((item) => {
            params.push({ name: 'ids', value: item.id });
            if (item.children) {
              params.push(...item.children.map((ele) => ({ name: 'ids', value: ele.id })));
            }
          });

          initiateAsyncExport({
            requestUrl: api,
            queryParams: [
              { name: 'batch', value: record.batch || batch },
              { name: 'tenantNum', value: tenantNum },
              { name: 'fillerType', value: 'single-sheet' },
              { name: 'maxDataCount', value: '250000' },
              { name: 'singleExcelMaxSheetNum', value: '5' },
              { name: 'fileType', value: 'EXCEL2007' },
              { name: 'async', value: 'true' },
              { name: 'exportType', value: 'DATA' },
              ...params,
            ],
            method: 'GET',
          });
        }
      });
    },
    [tenantId, importType, prefixPatch, batch]
  );

  const handleDownloadSourceFile = React.useCallback(
    (record) => {
      const api = `/spfm/v1/${tenantId}/cnf-import/download/${record.importId}`;
      downloadFileByAxios({ requestUrl: api, method: 'GET' });
    },
    [tenantId, importType, prefixPatch, batch]
  );

  const handleReUpload = React.useCallback(() => {
    setDraggerData('ready', 0);
  }, []);

  const renderImportProgress = () => {
    switch (status) {
      case EImportStatus.UPLOADING:
        return (
          <span className="common-import-upload-import-progress-item-title-text">
            {intl.get('hzero.common.components.import.dataImporting').d('数据导入中')}
          </span>
        );
      case EImportStatus.UPLOADED:
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
                    'common-import-upload-import-progress-item-title-success':
                      status === EImportStatus.UPLOADED,
                    'common-import-upload-import-progress-item-title-error':
                      status === EImportStatus.UPLOAD_FAILED,
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
                      status === EImportStatus.UPLOAD_FAILED
                        ? ProgressStatus.exception
                        : status === EImportStatus.UPLOADED
                        ? ProgressStatus.success
                        : ProgressStatus.active
                    }
                  />
                </div>
              </div>
            </div>
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
                    'common-import-upload-import-progress-item-title-success':
                      status === EImportStatus.UPLOADED,
                    'common-import-upload-import-progress-item-title-error':
                      status === EImportStatus.UPLOAD_FAILED,
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
                      status === EImportStatus.UPLOAD_FAILED
                        ? ProgressStatus.exception
                        : status === EImportStatus.UPLOADED
                        ? ProgressStatus.success
                        : ProgressStatus.active
                    }
                  />
                </div>
              </div>
            </div>
            <div className="common-import-upload-import-tooltip-failed">
              <div className="common-import-upload-import-tooltip-failed-content">
                <span className="common-import-upload-import-tooltip-failed-content-text">
                  {intl.get('hzero.common.components.import.faildAndReUpload').d('数据导入失败，请修改后重新上传')}
                </span>
                <Button
                  className={classNames(
                    'common-import-template-button',
                    'common-import-upload-button'
                  )}
                  icon="replay"
                  funcType={FuncType.flat}
                  color={ButtonColor.primary}
                >
                  {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
                </Button>
              </div>
            </div>
          </>
        );
      case EState.done:
        return (
          <>
            <img className="common-import-upload-icon" src={iconExcel} alt="upload" />
            <div className="common-import-upload-text">{fileName}</div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
              <div
                style={{ marginRight: '8px' }}
                onClick={(e) => {
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

              <div>
                <Button className="common-import-template-button-item" onClick={handleReUpload}>
                  {intl.get('hzero.common.components.import.reUpload').d('重新上传')}
                </Button>
              </div>
            </div>
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
    status,
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
        action={`${API_HOST}/spfm/v1/${tenantId}/cnf-import/data-upload`}
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
