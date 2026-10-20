import React, { useMemo, useCallback } from 'react';
import { Button, Dropdown, Modal, Menu } from 'choerodon-ui/pro';
import { Upload, Icon, notification } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import h0Notification from 'utils/notification';

import { importUnitConfig } from '@/services/customizeConfigService';
import styles from './index.less';
import ImportModal from './ImportModal';

let modal;
const MenuItem = Menu.Item;
const importingNoticeKey = `importingNotice${Date.now()}`;

const ImportButton = () => {
  const openImportHistoryModal = () => {
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
    });
  };

  const showImportSucces = importResult => {
    closeNotice(importingNoticeKey);
    const count = Object.values(importResult || {}).reduce((a, b) => a + b);
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
            .get('hpfm.individual.view.message.importSuccessTip2')
            .d('个单元，已全部成功导入，可点击按钮查看明细')}
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
            color="primary"
            onClick={() => {
              notification.close(noticeKey);
              openImportHistoryModal();
            }}
          >
            {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
          </Button>
        </>
      ),
    });
  };
  const showImportError = importResult => {
    closeNotice(importingNoticeKey);
    const { pass, error, warn } = importResult || {};
    const count = Object.values(importResult || {}).reduce((a, b) => a + b);
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
          {intl.get('hpfm.individual.view.message.importFailTip2').d('个单元，其中')}
          <span className={styles['success-number']}>{pass || 0}</span>
          {intl.get('hpfm.individual.view.message.importFailTip3').d('个单元导入成功，')}
          <span className={styles['warn-number']}>{warn || 0}</span>
          {intl.get('hpfm.individual.view.message.importFailTip4').d('个单元导入异常，')}
          <span className={styles['error-number']}>{error || 0}</span>
          {intl
            .get('hpfm.individual.view.message.importFailTip5')
            .d('个单元导入失败；可点击按钮查看明细')}
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
            color="primary"
            onClick={() => {
              notification.close(noticeKey);
              openImportHistoryModal();
            }}
          >
            {intl.get('hpfm.individual.view.button.showDetail').d('查看明细')}
          </Button>
        </>
      ),
    });
  };

  const handleBeforeUpload = useCallback(file => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    showImporting();
    importUnitConfig(formData)
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
        h0Notification.error();
      });
    return false;
  }, []);

  const openImportModal = useCallback(() => {
    const modal = Modal.open({
      title: intl.get('hzero.common.import').d('导入'),
      drawer: true,
      children: (
        <>
          <div className="common-import-title">{intl.get("hpfm.customize.common.importJsonTip").d("导入个性化对应的JSON文件")}</div>
          <div className="common-import-upload">
            <Upload.Dragger
              className="common-import-upload"
              accept=".json"
              action
              beforeUpload={handleBeforeUpload}
              showUploadList={false}
              uploadShowFlag={false}
            >
              {getUplaodFileSvg()}
              <div className="common-import-upload-text">
                {intl.get('hzero.common.components.import.message.drag').d('拖拽或点击此处选择文件')}
              </div>
              <div className="common-import-upload-text" style={{ paddingBottom: "24px" }}>0/1</div>
            </Upload.Dragger>
          </div>
          <div>{intl.get("hpfm.customize.common.importTitle").d("导入说明")}</div>
          <div>{intl.get("hpfm.customize.common.importJsonTip2").d("1. 个性化导入支持新增、更新，覆盖当前环境配置。")}</div>
        </>
      ),
      style: {
        width: '470px',
      },
      footer: () => [
        <Button onClick={() => modal.close()} color="primary">
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>,
        <Button key="importHistory" onClick={openImportHistoryModal}>
          {intl.get('hzero.common.componenets.import.title.viewhistory').d('查看导入记录')}
        </Button>
      ],
    });
  }, []);
  return (
    <Button funcType="flat" icon="archive" style={{ height: '32px' }} onClick={openImportModal}>
      {intl.get('hzero.common.import').d('导入')}
    </Button>
  );
};

export default ImportButton;

function getUplaodFileSvg() {
  return (
    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1">
      <g id="导入" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="1-默认" transform="translate(-1174.000000, -157.000000)">
          <g id="编组-21" transform="translate(960.000000, 0.000000)">
            <g id="编组-7" transform="translate(20.000000, 77.000000)">
              <g id="Upload/Pic" transform="translate(0.000000, 40.000000)">
                <g id="编组-3" transform="translate(132.000000, 39.999814)">
                  <g id="编组-10" transform="translate(62.000000, 0.000000)">
                    <g id="EXCEL" fill-rule="nonzero">
                      <rect id="矩形" fill="#000000" opacity="0" x="0" y="0.000186467066" width="54" height="54"></rect>
                      <path d="M48.8710739,50.6488243 C48.8731913,51.3277601 48.6031058,51.9792905 48.1210094,52.4573459 C47.6408575,52.93671 46.9903293,53.206289 46.3118535,53.207083 L7.5591164,53.207083 C6.87991789,53.2099358 6.22804383,52.9397992 5.74996044,52.4573459 C5.27076315,51.9773492 5.00120087,51.3270809 4.999885,50.6488243 L4.999885,2.56506438 C4.99779491,1.88574581 5.26785079,1.23381305 5.74996044,0.755227561 C6.22925203,0.27393375 6.87988633,0.00241874705 7.5591164,0 L32.1500121,0 C32.8313398,-0.00462047921 33.4864911,0.262366583 33.9703478,0.742074671 C39.5159635,6.65320756 43.6751752,10.7884011 46.4479831,13.1476554 C46.8216666,13.4656054 47.3821918,13.9425305 48.1295587,14.5784306 C48.6085254,15.0627275 48.8751796,15.7176594 48.8710739,16.3987897 L48.8710739,50.6488243 Z" id="路径" fill="#EBECF0"></path>
                      <path d="M49.0113973,16.7588072 L34.8706818,16.7588072 C34.1763702,16.7588072 33.5104957,16.4888652 33.0195433,16.0083656 C32.5285908,15.5278659 32.2527766,14.8761685 32.2527766,14.1966393 L32.2527766,0.000186467066 C32.948135,-0.00485605123 33.6168709,0.261624838 34.1108181,0.740659535 L48.2743564,14.5757088 C48.7532485,15.066074 49.01686,15.7205047 49.0087123,16.3987897 L49.0113973,16.7588072 Z" id="路径" fill="#C1C7D0"></path>
                    </g>
                    <g id="path-10-link" transform="translate(15.000000, 20.999941)">
                      <circle id="path-10" stroke="#FFFFFF" stroke-width="2" cx="12" cy="12" r="12" className={styles['common-import-svg-circle']}></circle>
                      <polygon id="蒙版" fill="#FFFFFF" fill-rule="nonzero" points="6.66666667 12 7.60666667 13.54 11.2160398 10.0283951 11.2160398 17.3333333 12.8293421 17.3333333 12.8293421 10.0283951 16.3866667 13.55 17.3333333 12 12 6.66666667"></polygon>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}