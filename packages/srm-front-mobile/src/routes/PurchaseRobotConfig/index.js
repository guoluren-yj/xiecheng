/* eslint-disable no-unused-expressions */
import React, { Fragment, Component } from 'react';
import { Header, Content } from 'components/Page';
import { Tabs } from 'choerodon-ui/pro';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import SkillTreeList from './SkillTreeList';
import MessageTemplate from './MessageTemplate';
import styles from './index.less';

const { TabPane } = Tabs;

let tabKey = 'skill';

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common'] })
export default class PurchaseRobotConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  aliChatbotConfigRef = null;

  gotoSkillDetail = (editor = true) => {
    const pathname =
      tabKey === 'skill'
        ? '/smbl/purchase-robot/config/skill/detail/new'
        : '/smbl/purchase-robot/config/message-template-detail';
    this.props.history.push({
      pathname,
      state: {
        editor,
        type: 'add',
        canEidt: true,
      },
    });
  };

  render() {
    // 头部的lov引用平台选择器
    const headerLov = () => {
      if (['skill', 'messageMould'].includes(tabKey)) {
        return (
          <PermissionButton
            color="primary"
            type="c7n-pro"
            funcType="raised"
            onClick={() => this.gotoSkillDetail()}
          >
            {intl.get('smbl.purchaseRobotConfig.button.create').d('新建')}
          </PermissionButton>
        );
      }
      return null;
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get('smbl.purchaseRobotConfig.view.title.purchaseRobotFuncConfig')
            .d('采购助手功能配置')}
        >
          {headerLov()}
        </Header>
        <Content className={styles['page-content']} wrapperClassName={styles['page-content-wrap']}>
          <Tabs
            defaultActiveKey={tabKey}
            onChange={(key) => {
              tabKey = key;
              // 如果是阿里云配置页
              if (key === 'aliChatbotConfig') {
                // 刷新
                this.aliChatbotConfigRef?.refresh();
              } else {
                // 销毁
                this.aliChatbotConfigRef?.destory();
              }
            }}
          >
            <TabPane
              title={intl.get('smbl.purchaseRobotConfig.view.tab.robotSkillTree').d('机器人技能树')}
              key="skill"
            >
              <SkillTreeList history={this.props.history} />
            </TabPane>
            <TabPane
              title={intl.get('smbl.purchaseRobotConfig.view.tab.messageTemplate').d('消息模板')}
              key="messageMould"
            >
              <MessageTemplate history={this.props.history} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
