/*
 * ContractReviewInfo: 合同审查附件文本展示
 * @Date: 2025-01-21 19:19:44
 * @Author: CDJ
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useEffect } from 'react';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import EditorOnline from '@/routes/components/EditorOnline';

import styles from '../styles.less';

const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

const ContractWpsInfo = (props) => {
  const {
    headerInfo = {},
    onlyEditReplaceWildcardBefore,
    enableEditShare,
    isView = false,
    isPub = false,
    enableTemplateEdit,
    coordinatedFlag = null,
    attachmentContractEditFlag = false,
    showWpsFlag = false,
  } = props;
  const {
    pcStatusCode,
    pcHeaderId,
    pcHeaderWorkbenchPreTextFlag,
    pcNum = '',
    pcName = '',
    taxIncludeAmount = 0,
    templateName = '',
    pcKindCodeMeaning = '',
    pcTypeName = '',
  } = headerInfo || {};

  useEffect(() => {}, []);

  const isOtherPageEdit =
    ['REJECTED', 'SUPPLIER_REJECTED', 'PENDING'].includes(pcStatusCode) ||
    attachmentContractEditFlag;

  return (
    <>
      <Card bordered={false}>
        <div className={styles['contract-review-wps-title']}>
          <div className={styles['contract-review-wps-title-left']}>
            <div className={styles['contract-review-wps-title-left-num']}>
              {`${pcNum}-${pcName}`}
            </div>
            <div className={styles['contract-review-wps-title-left-code']}>{pcKindCodeMeaning}</div>
            <div className={styles['contract-review-wps-title-left-name']}>{pcTypeName}</div>
          </div>
          <div className={styles['contract-review-wps-title-right']}>
            <div className={styles['contract-review-wps-title-right-tag']}>
              {intl.get(`spcm.common.model.amount`).d('协议总额')}: &nbsp;
              <span className={styles['contract-review-wps-title-right-amount']}>
                {taxIncludeAmount}
              </span>
            </div>
            <div className={styles['contract-review-wps-title-right-tag']}>
              {intl.get('spcm.common.model.pcTemplateId').d('协议模板')}: &nbsp;
              <span className={styles['contract-review-wps-title-right-template']}>
                {templateName}
              </span>
            </div>
          </div>
        </div>
        {/* 确保数据都加载完成，避免多次渲染wps组件 */}
        {showWpsFlag && (
          <EditorOnline
            menuCode={CONTRACT_WORKSPACE_MAINTAIN}
            onRef={(node) => {
              props.onRef(node);
            }}
            // 是否是工作台标识,默认只有工作台使用这个组件
            isContratWorkspace
            // 审查时wps文件只读
            permissionCode={
              enableEditShare === '1' &&
              !isPub &&
              !isView &&
              ((enableTemplateEdit === '1' && pcHeaderWorkbenchPreTextFlag !== '1') ||
                (pcHeaderWorkbenchPreTextFlag === '1' && onlyEditReplaceWildcardBefore !== '1')) &&
              coordinatedFlag !== '1'
                ? 'VIEW'
                : 'VIEW'
            }
            isOtherPageEdit={isOtherPageEdit}
            pcHeaderWorkbenchPreTextFlag={pcHeaderWorkbenchPreTextFlag}
            isNewAPIUrlFlag={
              isPub &&
              onlyEditReplaceWildcardBefore === '1' &&
              enableEditShare === '1' &&
              ['SUBMITTED', 'APPROVAL_PENDING'].includes(pcStatusCode)
            }
            pcHeaderId={pcHeaderId}
            headerInfo={headerInfo}
            iframeStyle={{
              width: '100%',
              height: 'calc(100vh - 230px)',
            }}
          />
        )}
      </Card>
    </>
  );
};

export default ContractWpsInfo;
