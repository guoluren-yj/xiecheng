/*
 * @Description: 结算策略详情-基本信息
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, Fragment, useMemo, useCallback } from 'react';
import { Attachment, IntlField, Output, CheckBox } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import { Store } from '../StoreProvider';
import ErrorsAlert from '../components/ErrorsAlert';
import { statusTagRender } from '@/routes/Components/StatusTag';
import HorizontalForm from '../components/HorizontalForm';

/**
 * @description: 基本信息
 * @param {Object} props
 * @return {ReactNode}
 */
const BasicInfo = () => {
  const { isPlat, headerDs, editFlag, platModalFlag } = useContext(Store);
  const configStatus = headerDs.current?.get('configStatus');

  /**
   * @description: 策略流程图上传成功回调
   * @param {Object} 接口返回file
   * @return {*}
   */
  const handleUploadSuccess = useCallback(
    (res) => {
      if (res?.fileUrl) {
        headerDs.current.set({ settleConfigProcessUrl: res.fileUrl });
      }
    },
    [headerDs]
  );

  /**
   * @description: 附件列表更改回调，拦截删除
   * @param {Array} 附件列表
   * @return {*}
   */
  const handleAttachmentsChange = useCallback(
    (fileList) => {
      if (isEmpty(fileList)) {
        headerDs.current.set({ settleConfigProcessUrl: undefined });
      }
    },
    [headerDs]
  );

  const editorColumns = useMemo(() => {
    return [
      { name: 'settleConfigNum', disabled: true },
      { name: 'settleConfigName', editor: IntlField },
      { name: 'displayStatus', editor: Output, renderer: statusTagRender },
      {
        name: 'versionNumber',
        disabled: true,
        help: intl
          .get('ssta.settleStrategy.view.help.versionNumber')
          .d(
            '策略中的配置项会区分不同生效时点，生效时点的操作会获取最新发布版本的配置，且仅随生效时点的操作更新配置，不随后续操作更新。如「提交生效」，即该配置点在提交时，获取最新版本策略配置生效，后续的审批同意、取消等操作均不影响单据中获取的配置，详见配置项标题侧生效时点说明'
          ),
      },
      { name: 'publishedByName', disabled: true, visible: configStatus === 'PUBLISHED' },
      { name: 'publishedDate', disabled: true, visible: configStatus === 'PUBLISHED' },
      ...(isPlat || platModalFlag
        ? [
            {
              name: 'settleConfigProcessUuid',
              editor: Attachment,
              editorFlag: true,
              max: 1,
              downloadAll: false,
              readOnly: !editFlag,
              accept: ['image/*'],
              bucketDirectory: 'settle-strategy',
              bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
              onUploadSuccess: handleUploadSuccess,
              onAttachmentsChange: handleAttachmentsChange,
            },
            {
              name: 'tenantInitFlag',
              editor: CheckBox,
              renderer: ({ value }) => !editFlag && yesOrNoRender(value),
            },
            { name: 'remark', editor: IntlField, type: 'multipleLine' },
          ]
        : []),
    ];
  }, [isPlat, editFlag, configStatus, platModalFlag, handleUploadSuccess, handleAttachmentsChange]);

  return (
    <Fragment>
      <div className="strategy-panel-wrapper">
        <ErrorsAlert />
        <HorizontalForm dataSet={headerDs} editorFlag={editFlag} editorColumns={editorColumns} />
      </div>
    </Fragment>
  );
};

export default observer(BasicInfo);
