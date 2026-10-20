import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';

import intl from 'utils/intl';

import { importLov } from '@/services/valueListService';
import HistoryDrawer from './HistoryDrawer';
import styles from '../styles.less';

export default function ImportModal({ modal }) {
  const handleImportNew = (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    importLov(formData);
    return false;
  };

  const handleClose = () => {
    if (modal && modal.close) {
      modal.close();
    }
  };

  const showImportLog = () => {
    Modal.open({
      title: intl.get('srm.common.view.button.viewImportRecord').d('查看导入记录'),
      drawer: true,
      style: { width: '1000px' },
      bodyStyle: { padding: 0 },
      children: <HistoryDrawer />,
      footer: (_, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    });
  };

  return (
    <div className={styles['modal-content']}>
      <div className={styles['modal-content-main']}>
        <div style={{ color: '#000', fontSize: '16px', fontWeight: 600 }}>
          {intl.get('hpfm.valueList.importJSON.title.selectField').d('导入值集配置对应的JSON文件')}
        </div>
        <div className={styles['upload-content']}>
          <Upload.Dragger
            name="excel"
            multiple={false}
            beforeUpload={handleImportNew}
            showUploadList={false}
            accept=".json"
          >
            <div>
              <div className={styles['file-icon']}>{getUplaodFileSvg()}</div>
              <div className={styles['upload-content-text']}>{intl.get('hzero.common.components.import.message.drag').d('拖拽或点击此处选择文件')}</div>
              <div className={styles['upload-content-text']} style={{ paddingBottom: '24px' }}>0/1</div>
            </div>
          </Upload.Dragger>
        </div>
        <div className={styles.tips}>
          <div>{intl.get('hpfm.valueList.importJSON.title.tip').d('导入说明')}</div>
          <div>{intl.get('hpfm.valueList.importJSON.title.tip1').d('1. 值集配置JSON文件导入一般用于同租户下跨环境数据迁移。')}</div>
          <div>{intl.get('hpfm.valueList.importJSON.title.tip2').d('2. 值集配置JSON文件导入的文件一般来源于值集配置导出的JSON文件。')}</div>
          <div>{intl.get('hpfm.valueList.importJSON.title.tip3').d('3. 值集配置JSON文件导入导出的内容仅限租户自定义的独立值集。')}</div>
        </div>
      </div>
      <div className={styles['modal-content-footer']}>
        <Button color='primary' onClick={handleClose}>{intl.get('hzero.common.button.close').d('关闭')}</Button>
        <Button onClick={showImportLog}>
          {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
        </Button>
      </div>
    </div>
  );
}

function getUplaodFileSvg() {
  return (
    <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1">
      <title>编组 10</title>
      <g id="导入" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="1-默认" transform="translate(-1174.000000, -157.000000)">
          <g id="编组-21" transform="translate(960.000000, 0.000000)">
            <g id="编组-7" transform="translate(20.000000, 77.000000)">
              <g id="Upload/Pic" transform="translate(0.000000, 40.000000)">
                <g id="编组-3" transform="translate(132.000000, 39.999814)">
                  <g id="编组-10" transform="translate(62.000000, 0.000000)">
                    <g id="EXCEL" fillRule="nonzero">
                      <rect id="矩形" fill="#000000" opacity="0" x="0" y="0.000186467066" width="54" height="54" />
                      <path d="M48.8710739,50.6488243 C48.8731913,51.3277601 48.6031058,51.9792905 48.1210094,52.4573459 C47.6408575,52.93671 46.9903293,53.206289 46.3118535,53.207083 L7.5591164,53.207083 C6.87991789,53.2099358 6.22804383,52.9397992 5.74996044,52.4573459 C5.27076315,51.9773492 5.00120087,51.3270809 4.999885,50.6488243 L4.999885,2.56506438 C4.99779491,1.88574581 5.26785079,1.23381305 5.74996044,0.755227561 C6.22925203,0.27393375 6.87988633,0.00241874705 7.5591164,0 L32.1500121,0 C32.8313398,-0.00462047921 33.4864911,0.262366583 33.9703478,0.742074671 C39.5159635,6.65320756 43.6751752,10.7884011 46.4479831,13.1476554 C46.8216666,13.4656054 47.3821918,13.9425305 48.1295587,14.5784306 C48.6085254,15.0627275 48.8751796,15.7176594 48.8710739,16.3987897 L48.8710739,50.6488243 Z" id="路径" fill="#EBECF0" />
                      <path d="M49.0113973,16.7588072 L34.8706818,16.7588072 C34.1763702,16.7588072 33.5104957,16.4888652 33.0195433,16.0083656 C32.5285908,15.5278659 32.2527766,14.8761685 32.2527766,14.1966393 L32.2527766,0.000186467066 C32.948135,-0.00485605123 33.6168709,0.261624838 34.1108181,0.740659535 L48.2743564,14.5757088 C48.7532485,15.066074 49.01686,15.7205047 49.0087123,16.3987897 L49.0113973,16.7588072 Z" id="路径" fill="#C1C7D0" />
                    </g>
                    <g id="path-10-link" transform="translate(15.000000, 20.999941)">
                      <circle id="path-10" stroke="#FFFFFF" strokeWidth="2" cx="12" cy="12" r="12" fill="currentColor" />
                      <polygon id="蒙版" fill="#FFFFFF" fillRule="nonzero" points="6.66666667 12 7.60666667 13.54 11.2160398 10.0283951 11.2160398 17.3333333 12.8293421 17.3333333 12.8293421 10.0283951 16.3866667 13.55 17.3333333 12 12 6.66666667" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
