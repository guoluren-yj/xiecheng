import React, { useMemo, useCallback } from 'react';
import { Button, Dropdown, Modal, Menu } from 'choerodon-ui/pro';
import { Upload, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { importPrice } from '@/services/priceLibDimensionService';
import styles from './index.less';
import ImportModal from './ImportModal';

let modal;
const MenuItem = Menu.Item;
const importingNoticeKey = `importingNotice${Date.now()}`;

const ImportButton = () => {
  const openImportModal = () => {
    if (modal) {
      return;
    }
    modal = Modal.open({
      title: intl.get('hpfm.individual.view.title.viewHistory').d('查看导入历史'),
      style: { width: '1000px' },
      drawer: true,
      className: styles['import-modal'],
      bodyStyle: { padding: 0 },
      children: <ImportModal />,
      footer: (
        <>
          {/* <Button>
            {intl.get('hpfm.individual.view.button.importDetailRecord').d('导出明细记录')}
          </Button> */}
          <Button onClick={handleCloseModal} color="primary">
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  };

  const handleCloseModal = () => {
    if (modal && modal.close) {
      modal.close();
      modal = null;
    }
  };

  const closeNotice = (noticeKey) => {
    notification.close(noticeKey);
  };

  const showImporting = () => {
    notification.info({
      closable: false,
      key: importingNoticeKey,
      icon: <Icon type="download_for_offline" />,
      duration: null,
      className: styles['importing-notice'],
      placement: 'bottomRight',
      message: intl.get('hpfm.individual.view.title.importing').d('正在后台执行导入'),
      description: intl
        .get('hpfm.individual.view.message.importingNotice')
        .d('时间可能需要几秒到几分钟，导入完成后会自动弹出结果提示'),
      btn: (
        <Button onClick={() => closeNotice(importingNoticeKey)}>
          {intl.get('hpfm.individual.view.button.know').d('知道了')}
        </Button>
      ),
    });
  };

  // const showImportSucces = importResult => {
  //   closeNotice(importingNoticeKey);
  //   const count = Object.values(importResult || {}).reduce((a, b) => a + b);
  //   const noticeKey = `importSuccessNotice${Date.now()}`;
  //   notification.success({
  //     closable: false,
  //     key: noticeKey,
  //     icon: <Icon type="mood" />,
  //     duration: null,
  //     className: styles['import-success-notice'],
  //     placement: 'bottomRight',
  //     message: intl.get('hpfm.individual.view.title.importSuccess').d('导入成功!'),
  //     description: (
  //       <span>
  //         {intl.get('hpfm.individual.view.message.importSuccessTip1').d('本次导入共计')}
  //         <span className={styles['total-number']}>{count || 0}</span>
  //         {intl
  //           .get('hpfm.individual.view.message.importSuccessTip2')
  //           .d('个单元，已全部成功导入，可点击按钮查看明细')}
  //       </span>
  //     ),
  //     btn: (
  //       <>
  //         <Button
  //           onClick={() => {
  //             notification.close(noticeKey);
  //           }}
  //         >
  //           {intl.get('hzero.common.view.message.close').d('关闭')}
  //         </Button>
  //         <Button
  //           color="primary"
  //           onClick={() => {
  //             notification.close(noticeKey);
  //             openImportModal();
  //           }}
  //         >
  //           {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
  //         </Button>
  //       </>
  //     ),
  //   });
  // };
  // const showImportError = importResult => {
  //   closeNotice(importingNoticeKey);
  //   const { pass, error, warn } = importResult || {};
  //   const count = Object.values(importResult || {}).reduce((a, b) => a + b);
  //   const noticeKey = `importFailNotice${Date.now()}`;
  //   notification.error({
  //     closable: false,
  //     key: noticeKey,
  //     icon: <Icon type="mood_bad" />,
  //     duration: null,
  //     className: styles['import-error-notice'],
  //     placement: 'bottomRight',
  //     message: intl.get('hpfm.individual.view.title.importException').d('导入异常!'),
  //     description: (
  //       <span>
  //         {intl.get('hpfm.individual.view.message.importFailTip1').d('本次导入共计')}
  //         <span className={styles['total-number']}>{count}</span>
  //         {intl.get('hpfm.individual.view.message.importFailTip2').d('个单元，其中')}
  //         <span className={styles['success-number']}>{pass || 0}</span>
  //         {intl.get('hpfm.individual.view.message.importFailTip3').d('个单元导入成功，')}
  //         <span className={styles['warn-number']}>{warn || 0}</span>
  //         {intl.get('hpfm.individual.view.message.importFailTip4').d('个单元导入异常，')}
  //         <span className={styles['error-number']}>{error || 0}</span>
  //         {intl
  //           .get('hpfm.individual.view.message.importFailTip5')
  //           .d('个单元导入失败；可点击按钮查看明细')}
  //       </span>
  //     ),
  //     btn: (
  //       <>
  //         <Button
  //           onClick={() => {
  //             notification.close(noticeKey);
  //           }}
  //         >
  //           {intl.get('hzero.common.view.message.close').d('关闭')}
  //         </Button>
  //         <Button
  //           color="primary"
  //           onClick={() => {
  //             notification.close(noticeKey);
  //             openImportModal();
  //           }}
  //         >
  //           {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
  //         </Button>
  //       </>
  //     ),
  //   });
  // };

  const handleBeforeUpload = useCallback((file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    showImporting();
    importPrice(formData)
      .then((res) => {
        closeNotice(importingNoticeKey);
        const result = getResponse(res);
        if (result) {
          notification.success();
        }
        // if (result) {
        //   const { statusCount } = result;
        //   if (isNil(statusCount)) {
        //     showImportError(statusCount);
        //   } else if (
        //     !isNil(statusCount.pass) &&
        //     isNil(statusCount.error) &&
        //     isNil(statusCount.warn)
        //   ) {
        //     showImportSucces(statusCount);
        //   } else {
        //     showImportError(statusCount);
        //   }
        // }
      })
      .catch(() => {
        notification.error();
      });
    return false;
  }, []);

  const menu = useMemo(
    () => (
      <Menu>
        <MenuItem key="import" className={styles['import-menu-item']}>
          <Upload
            accept=".json"
            action
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            uploadShowFlag={false}
          >
            <Button funcType="link" style={{ padding: 0, fontWeight: 400 }}>
              {intl.get('hpfm.customize.common.importJsonFile').d('导入JSON文件')}
            </Button>
          </Upload>
        </MenuItem>
        <MenuItem key="importHistory" onClick={openImportModal}>
          {intl.get('hzero.common.componenets.import.title.viewhistory').d('查看导入记录')}
        </MenuItem>
      </Menu>
    ),
    []
  );

  return (
    <Dropdown overlay={menu} trigger={['click', 'hover']}>
      <Button funcType="flat" icon="archive" style={{ height: '32px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.import').d('导入')}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </Button>
    </Dropdown>
  );
};

export default ImportButton;
