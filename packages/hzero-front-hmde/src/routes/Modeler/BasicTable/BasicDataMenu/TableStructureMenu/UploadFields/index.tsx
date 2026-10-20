/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Upload, Icon, message } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import ImgIcon from '@/utils/ImgIcon';
import { uploadService } from '@/services/modelBaseService';
import { lowcodeOrganizationURL } from '@/utils/common';
import Modal from '@/components/LowcodeModal';
import notification from 'utils/notification';

import globalStyles from '@/lowcodeGlobalStyles/global.less';
import useErrorTable from './ErrorTable';

import styles from './index.less';

const modalKey = Modal.key();
const { Dragger } = Upload;

type IUpdate = (props: object) => any;
type IClose = () => any;
interface IPositiveModal {
  update: IUpdate;
  close: IClose;
}
let positiveModal: IPositiveModal = {
  update: () => {},
  close: () => {},
};
let lastEnter = null;
interface IParam {
  name?: string;
  page?: number;
  size?: number;
}
interface IUploadModal {
  setDataStore: (arg: string, value: any) => any;
  refreshNum: number;
  leftMenuDsQuery: (params: IParam) => any; // fixme
  serviceCode: string;
}
export default forwardRef(function UploadModal(
  { setDataStore, refreshNum, leftMenuDsQuery = () => {}, serviceCode = '' }: IUploadModal,
  ref
) {
  const useTableInfo = useErrorTable();

  const fileList: any = useRef([]);
  const isSubmitOkRef: any = useRef(null);
  const hasSendAjax: any = useRef(false); // 是否掉过上传接口 (暂不管失败成功)
  const [dragTip, setDragTip] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    handleOpenUploadModal,
  }));

  useEffect(() => {
    positiveModal.update({
      children: ModalContent,
    });
  }, [dragTip]);

  /* 当可拖动的元素进入可放置的目标 */
  const dragenter = (e) => {
    lastEnter = e.target; // 记录最后进入的元素
    setDragTip(true);
  };

  /* 当可拖动的元素离开可放置的目标 */
  const dragleave = (e) => {
    if (e.target === lastEnter) {
      setDragTip(false);
    }
  };

  // 开始上传
  const handleUpload = async () => {
    const formData = new FormData();
    fileList.current.forEach((file) => {
      formData.append('files', file);
    });
    if (isEmpty(fileList.current)) {
      notification.warning({
        message: '错误',
        description: '上传文件不能为空',
      });
      return;
    }
    const res: model.ErrorTableVO[] = await uploadService({
      body: formData,
      query: { serviceCode },
    });
    hasSendAjax.current = true;
    if (res && Array.isArray(res) && isEmpty(res)) {
      message.success('上传成功', undefined, undefined, 'top');
      fileList.current = []; // 上传后清空
      leftMenuDsQuery({}); // 刷新左侧树
      positiveModal.close();
    } else if (res && Array.isArray(res)) {
      useTableInfo.handelOpenErrList(res);
    } else {
      notification.error({
        message: '错误',
        description: (res as common.Message)?.message,
      });
    }
  };

  const props = {
    name: 'file',
    multiple: true,
    beforeUpload(file) {
      setDragTip(false);
      fileList.current = [...fileList.current, file];
      return false;
    },
    accept: '.groovy, .sql',
    action: `/${lowcodeOrganizationURL()}/tables/ddl/batch-upload`,
    onChange(info) {
      fileList.current = info && info.fileList;
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  const ModalContent = (
    <div className={dragTip ? styles['light-wrapper'] : styles['default-wrapper']}>
      <Dragger {...props} style={{ height: '170px' }}>
        <div id="dropArea">
          <p className="c7n-upload-drag-icon">
            <Icon type="" className={styles['upload-icon']} />
          </p>
          <p className="c7n-upload-text">
            {dragTip ? '松开手开始上传文件' : '点击或将文件拖拽到这里上传'}
          </p>
          <p className="c7n-upload-hint">仅支持扩展名：.groovy.sql</p>
        </div>
      </Dragger>
    </div>
  );

  const handleClose = () => {
    isSubmitOkRef.current = null;
    fileList.current = []; // 清空
    if (hasSendAjax.current) {
      leftMenuDsQuery({}); // 刷新左侧树
      setDataStore('refreshNum', refreshNum + 1); // 控制refreshNum变化 每次关闭弹窗刷新中间表
      hasSendAjax.current = false;
    }
  };
  const handleOpenUploadModal = async () => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    positiveModal = await Modal.open({
      lowcodeSize: 'small',
      contentfont: false,
      title: <div style={{ fontSize: '16px', color: '#333435' }}>导入脚本文件</div>,
      key: modalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      children: ModalContent,
      afterClose: handleClose,
      footer: (_, cancelBtn) => (
        <div className={globalStyles['model-footer']}>
          {cancelBtn}
          <Button color={ButtonColor.primary} onClick={async () => handleUpload()}>
            确定
          </Button>
        </div>
      ),
      onOk: () => {
        positiveModal.close();
      },
    });

    const dom = document.getElementById('dropArea');
    (dom as HTMLElement).addEventListener('dragenter', dragenter);
    (dom as HTMLElement).addEventListener('dragleave', dragleave);
  };

  return (
    <React.Fragment>
      <ImgIcon name="import@2x.png" size={14} style={{ width: 18, marginRight: '0.1rem' }} />
      <div>导入脚本文件</div>
    </React.Fragment>
  );
});
