/**
 * MarmotPlatform/index.js
 * 土拨鼠开发平台
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Menu } from 'choerodon-ui';
import { Content } from 'components/Page';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import RelTable from '@/components/RelTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import marmotImg from '../../assets/marmot3.png';
import styles from './index.less';

const ConsoleComponents = [
  {
    key: 'marmotScriptLibrary',
    // 土拨鼠脚本库
    thisComponent: (
      <RelTable
        tableCode="marmot_script_library"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotTemplateManagement',
    // 土拨鼠模板填充
    thisComponent: (
      <RelTable
        tableCode="marmot_template_management"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotQueueConsumer',
    // 土拨鼠消息队列
    thisComponent: (
      <RelTable
        tableCode="marmot_queue_consumer"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotApiPublish',
    // 土拨鼠API发布
    thisComponent: (
      <RelTable
        tableCode="marmot_api_publish"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotDataImport',
    // 土拨鼠数据导入
    thisComponent: (
      <RelTable
        tableCode="marmot_data_import"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
  {
    key: 'marmotAPIRewrite',
    // 土拨鼠API改写
    thisComponent: (
      <RelTable
        tableCode="marmot_api_rewrite"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
      />
    ),
  },
];
@formatterCollections({
  code: ['spfm.marmotToolbox'],
})
export default class MarmotToolbox extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPageKey: 'marmotScriptLibrary',
    };
  }

  switchMenu = (e) => {
    this.setState({ currentPageKey: e.key });
  };

  render() {
    const rightContent = ConsoleComponents.find((res) => res.key === this.state.currentPageKey)
      ?.thisComponent;
    return (
      <Content>
        <div className={styles['left-right']}>
          <div>
            <Menu
              onClick={this.switchMenu}
              className={styles['left-menu']}
              defaultSelectedKeys={['marmotScriptLibrary']}
              defaultOpenKeys={['configurationItem']}
              mode="inline"
            >
              <Menu.Item key="marmotScriptLibrary">
                {intl.get('spfm.marmotToolbox.view.title.marmotScriptLibrary').d('脚本库')}
              </Menu.Item>
              <Menu.Item key="marmotTemplateManagement">
                {intl.get('spfm.marmotToolbox.view.title.marmotTemplateManagement').d('模板填充')}
              </Menu.Item>
              <Menu.Item key="marmotQueueConsumer">
                {intl.get('spfm.marmotToolbox.view.title.marmotQueueConsumer').d('消息队列')}
              </Menu.Item>
              <Menu.Item key="marmotApiPublish">
                {intl.get('spfm.marmotToolbox.view.title.marmotApiAppend').d('API发布')}
              </Menu.Item>
              <Menu.Item key="marmotAPIRewrite">
                {intl.get('spfm.marmotToolbox.view.title.marmotAPIRewrite').d('API改写')}
              </Menu.Item>
              <Menu.Item key="marmotDataImport">
                {intl.get('spfm.marmotToolbox.view.title.marmotDataImport').d('Excel导入')}
              </Menu.Item>
            </Menu>
          </div>
          <div style={{ width: 'calc(100% - 150px)' }}>{rightContent}</div>
          <div className={styles['pic-right']}>
            <img
              draggable="false"
              src={marmotImg}
              className="pic-right-item"
              alt="marmot"
              style={{ opacity: 0.1 }}
            />
          </div>
        </div>
      </Content>
    );
  }
}
