import React, {PureComponent} from 'react';

import {Content, Header} from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import './index.less';


@formatterCollections({code: ['smbl.customizeManage', 'hzero.c7nUI']})
export default class MessageChannelManageList extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }
  render() {
    return (
      <>
        <Header
          title={intl.get('smbl.customizeManage.view.customizeManage.title').d('移动个性化管理')}
        />
        <Content className="customize-manage-page-content">
          <h1>{intl.get('smbl.customizeManage.message.to.customize.config').d('请前往`页面个性化`菜单配置')}</h1>
        </Content>
      </>
    );
  }
}
