/*
 * @Description: 未启用结构化的行页面
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-22 16:58:12
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useCallback, useContext } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Result } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import styles from '../index.less';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import TermNoLineSvg from './TermNoLineSvg';

const NoLineContent = () => {

  const { viewFlag, termHeaderDs } = useContext<StoreValueType>(Store);

  const handleEnableStruct = useCallback(() => {
    const termHeader = termHeaderDs.current;
    if(!termHeader) return;
    termHeader.init('enableTermFlag', '1');
  }, [termHeaderDs]);

  return (
    <div className={styles['smdm-no-line-content-payTermsCtrl']}>
      <Result
        status="warning"
        icon={<TermNoLineSvg />}
        title={(
          <div className="content-payTermsCtrl-warpper">
            <div>
              <div className="content-payTermsCtrl-title">
                {intl.get('smdm.payTermsCtrl.view.message.payTermCtrlNotEnabled').d('条款暂未启用付款管控')}
              </div>
              <div className="content-payTermsCtrl-desc">
                {intl.get('smdm.payTermsCtrl.view.message.enabledPayTermCtrlHelpDesc').d('条款启用付款管控后支持定义结构化付款条款及相关管控规则，点击【立即启用】，查询当前版本数据库存储信息重新展示结构化&管控规则区域')}
              </div>
            </div>
            <div>
              <Button className="content-payTermsCtrl-button" color={ButtonColor.primary} onClick={handleEnableStruct} disabled={viewFlag}>
                {intl.get('smdm.payTermsCtrl.view.button.enableNow').d('立即启用')}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default NoLineContent;