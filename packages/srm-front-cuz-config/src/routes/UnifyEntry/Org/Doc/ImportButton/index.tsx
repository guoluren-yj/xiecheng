import React, { useMemo, useCallback, useRef } from 'react';
import { Button, Dropdown, Modal, Menu } from 'choerodon-ui/pro';
import { Upload, Icon, notification } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import h0Notification from 'hzero-front/lib/utils/notification';

import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { importTplConfig } from '../../../../../services/customizeConfigService';
import ImportModal from './ImportModal';
import styles from './index.less';

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
          <Button onClick={handleCloseModal} color={ButtonColor.primary}>
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

  const closeNotice = noticeKey => {
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
    } as any);
  };

  const showImportSucces = importResult => {
    closeNotice(importingNoticeKey);
    const count = Object.values<number>(importResult || {}).reduce((a, b) => a + b);
    const noticeKey = `importSuccessNotice${Date.now()}`;
    notification.success({
      closable: false,
      key: noticeKey,
      icon: <Icon type="mood" />,
      duration: null,
      className: styles['import-success-notice'],
      placement: 'bottomRight',
      message: intl.get('hpfm.individual.view.title.importSuccess').d('导入成功!'),
      description: (
        <span>
          {intl.get('hpfm.individual.view.message.importSuccessTip1').d('本次导入共计')}
          <span className={styles['total-number']}>{count || 0}</span>
          {intl
            .get('hpfm.individual.view.message.importSuccessTplTip2')
            .d('个模板，已全部成功导入，可点击按钮查看明细')}
        </span>
      ),
      btn: (
        <>
          <Button
            onClick={() => {
              notification.close(noticeKey);
            }}
          >
            {intl.get('hzero.common.view.message.close').d('关闭')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              notification.close(noticeKey);
              openImportModal();
            }}
          >
            {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
          </Button>
        </>
      ),
    } as any);
  };
  const showImportError = importResult => {
    closeNotice(importingNoticeKey);
    const { pass, error, warn } = importResult || {};
    const count = Object.values<number>(importResult || {}).reduce((a, b) => a + b);
    const noticeKey = `importFailNotice${Date.now()}`;
    notification.error({
      closable: false,
      key: noticeKey,
      icon: <Icon type="mood_bad" />,
      duration: null,
      className: styles['import-error-notice'],
      placement: 'bottomRight',
      message: intl.get('hpfm.individual.view.title.importException').d('导入异常!'),
      description: (
        <span>
          {intl.get('hpfm.individual.view.message.importFailTip1').d('本次导入共计')}
          <span className={styles['total-number']}>{count}</span>
          {intl.get('hpfm.individual.view.message.importFailTplTip2').d('个模板，其中')}
          <span className={styles['success-number']}>{pass || 0}</span>
          {intl.get('hpfm.individual.view.message.importFailTplTip3').d('个模板导入成功，')}
          <span className={styles['warn-number']}>{warn || 0}</span>
          {intl.get('hpfm.individual.view.message.importFailTplTip4').d('个模板导入异常，')}
          <span className={styles['error-number']}>{error || 0}</span>
          {intl
            .get('hpfm.individual.view.message.importFailTplTip5')
            .d('个模板导入失败；可点击按钮查看明细')}
        </span>
      ),
      btn: (
        <>
          <Button
            onClick={() => {
              notification.close(noticeKey);
            }}
          >
            {intl.get('hzero.common.view.message.close').d('关闭')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              notification.close(noticeKey);
              openImportModal();
            }}
          >
            {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
          </Button>
        </>
      ),
    } as any);
  };

  const handleBeforeUpload = useCallback(file => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    showImporting();
    importTplConfig(formData)
      .then(res => {
        closeNotice(importingNoticeKey);
        const result = getResponse(res);
        if (result) {
          const { statusCount } = result;
          if (isNil(statusCount)) {
            showImportError(statusCount);
          } else if (
            !isNil(statusCount.pass) &&
            isNil(statusCount.error) &&
            isNil(statusCount.warn)
          ) {
            showImportSucces(statusCount);
          } else {
            showImportError(statusCount);
          }
        }
      })
      .catch(() => {
        h0Notification.error({});
      });
    return false;
  }, []);

  const ref = useRef<Button>(null);
  const menu = useMemo(
    () => {
      const inteceptorClick = () => {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl.get('hpfm.customize.common.beforeImpTplTip').d('导入模板最新的未发布版本将会丢失，请确认是否进行导入'),
          onOk: () => {
            if(ref.current && ref.current.element) {
              ref.current.element.click();
            }
          },
        });
      };
      return (
        <Menu>
          <MenuItem key="import" className={styles['import-menu-item']}>
            <Button funcType={FuncType.link} style={{ padding: 0, fontWeight: 400, width: "100%", textAlign: 'left' }} onClick={inteceptorClick}>
              {intl.get('hzero.common.import').d('导入')}
            </Button>
          </MenuItem>
          <MenuItem key="importHistory" onClick={openImportModal}>
            {intl.get('hzero.common.componenets.import.title.viewhistory').d('查看导入记录')}
          </MenuItem>
          <div style={{ display: 'none' }}>
            <Upload
              accept=".json"
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
            >
              <Button ref={ref} />
            </Upload>
          </div>
        </Menu>
      );
    },
    []
  );

  return (
    <Dropdown overlay={menu} trigger={[Action.hover]}>
      <Button funcType={FuncType.flat} icon="archive" style={{ height: '32px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {intl.get('hzero.common.import').d('导入')}
          <Icon type="expand_more" style={{ marginLeft: '4px' }} />
        </span>
      </Button>
    </Dropdown>
  );
};

export default ImportButton;
