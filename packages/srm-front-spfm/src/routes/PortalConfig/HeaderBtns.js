/*
 * @Date: 2024-03-25 16:17:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Upload } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { API_HOST } from 'utils/config';
import DynamicButtons from '_components/DynamicButtons';
import { downloadFile } from 'hzero-front/lib/services/api';
import { getAccessToken, getPlatformVersionApi } from 'utils/utils';

import styles from './index.less';

const token = getAccessToken();

const HeaderBtns = ({
  onSave,
  onCopy,
  loading,
  loadCard,
  layoutId,
  onPreview,
  settingrRules,
  getGlobalLayout,
  onLayoutSetting,
}) => {
  const importapi = getPlatformVersionApi(`portal-layouts/import-layout/${layoutId}`);
  const exportapi = getPlatformVersionApi(`portal-layouts/export-layout/${layoutId}`);
  const buttons = [
    {
      name: 'save',
      hidden: !settingrRules,
      child: intl.get('hzero.common.btn.save').d('保存'),
      btnProps: {
        icon: 'save',
        color: 'primary',
        onClick: () => onSave(),
      },
    },
    {
      name: 'preview',
      child: intl.get('hzero.common.button.see').d('预览'),
      btnProps: {
        icon: 'find_in_page',
        funcType: 'flat',
        onClick: () => onPreview(),
      },
    },
    {
      name: 'templateSetting',
      hidden: !settingrRules,
      child: intl.get('hptl.portalAssign.action.button.template.setting').d('模板设置'),
      btnProps: {
        icon: 'settings',
        funcType: 'flat',
        onClick: () => onLayoutSetting(),
      },
    },
    {
      name: 'templateCopy',
      hidden: !settingrRules,
      child: intl.get('hptl.portalAssign.model.filed.referTemp').d('引用模板'),
      btnProps: {
        icon: 'baseline-file_copy',
        funcType: 'flat',
        onClick: () => onCopy(),
      },
    },
    {
      name: 'export',
      child: intl.get('hzero.common.export').d('导出'),
      btnProps: {
        icon: 'unarchive',
        funcType: 'flat',
        onClick: () => {
          downloadFile({ requestUrl: `/spfm/v1/${exportapi}?access_token=${token}` });
        },
      },
    },
    {
      name: 'import',
      hidden: !settingrRules,
      child: (
        <div className={styles['portal-config-btn']}>
          <Upload
            headers={{ Authorization: `bearer ${token}` }}
            action={`${API_HOST}/spfm/v1/${importapi}`}
            accept={['.json']}
            showPreviewImage={false}
            showUploadBtn={false}
            showUploadList={false}
            onUploadSuccess={(file) => {
              if (file) {
                getGlobalLayout();
                loadCard([]);
              }
            }}
          />
          {intl.get('hzero.common.import').d('导入')}
        </div>
      ),
    },
  ].map((btn) => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
  }));
  return <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
