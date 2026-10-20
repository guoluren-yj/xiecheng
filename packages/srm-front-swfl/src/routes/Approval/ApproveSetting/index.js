/*
 * @Descripttion:
 * @Date: 2021-05-14 16:55:43
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import classnames from 'classnames';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
// import { WithCustomizeC7N as withCustomize } from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import styles from './index.less';
import AutomaticProcess from './AutomaticProcess';
import Delegate from './Delegate/Delegate';
import Preference from './Preference';

const { TabPane } = Tabs;
@withCustomize({
  unitCode: ['HWFP.APPROVAL_WORKBENCH_SETTING.ALL_TAB'],
})
export default class ApproveSetting extends React.Component {
  render() {
    const { status, onChange, handleCancel, customizeTabPane } = this.props;
    return (
      <>
        <div className={classnames(styles.top, 'swfl-approval-workbench-setting')}>
          {customizeTabPane(
            {
              code: 'HWFP.APPROVAL_WORKBENCH_SETTING.ALL_TAB',
            },
            <Tabs defaultActiveKey="automaticProcess" flex>
              <TabPane
                tab={intl
                  .get('hwfp.automaticProcess.view.message.title.automaticProcess')
                  .d('自动处理规则')}
                key="automaticProcess"
              >
                <AutomaticProcess handleCancel={handleCancel} />
              </TabPane>
              <TabPane
                tab={intl.get('hwfp.delegate.view.message.title.delegate').d('自动转交设置')}
                key="delegate"
              >
                <Delegate handleCancel={handleCancel} />
              </TabPane>
              <TabPane tab={intl.get('hwfp.common.favor.setting').d('审批偏好设置')} key="favor">
                <Preference initStatus={status} handleCancel={handleCancel} onChange={onChange} />
              </TabPane>
            </Tabs>
          )}
        </div>
      </>
    );
  }
}
