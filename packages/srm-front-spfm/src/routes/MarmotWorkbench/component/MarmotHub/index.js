/**
 * MarmotPlatform/index.js
 * 土拨鼠开发平台
 * @date: 2021-11-1
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React, { Fragment } from 'react';
import { Menu } from 'choerodon-ui';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import ActionImg from '@/assets/action.png';
import RelTable from '@/components/RelTable';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
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
        showCreatedByFlag
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
        showCreatedByFlag
        linkScriptLibraryArray={['blockCode']}
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
        showCreatedByFlag
        linkScriptLibraryArray={['codeBlockCode']}
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
        showCreatedByFlag
        linkScriptLibraryArray={['scriptCode']}
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
        showCreatedByFlag
        linkScriptLibraryArray={['validScriptCode', 'doImportScriptCode']}
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
        showCreatedByFlag
        linkScriptLibraryArray={['beforeScriptCode', 'scriptCode']}
      />
    ),
  },
  {
    key: 'marmotScheduler',
    // 调度
    thisComponent: (
      <RelTable
        tableCode="marmot_scheduler"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
        batchDeleteFlag={false}
        showCreatedByFlag
        linkScriptLibraryArray={['scriptCode']}
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
      showMenu: true,
    };
  }

  switchMenu = (e) => {
    this.setState({ currentPageKey: e.key });
  };

  handleFoldTree = (value) => {
    this.setState({ showMenu: value });
  };

  render() {
    const findObj = ConsoleComponents.find((res) => res.key === this.state.currentPageKey);
    const rightContent = findObj && findObj.thisComponent ? findObj.thisComponent : '';
    return (
      <Fragment>
        <div className={styles['content-container']}>
          {this.state.showMenu ? (
            <div className="content-container-left">
              <div className="content-container-left-fold">
                <div>
                  <img src={ActionImg} alt="" onClick={() => this.handleFoldTree(false)} />
                </div>
              </div>
              <Menu
                onClick={this.switchMenu}
                className={styles['left-menu']}
                defaultSelectedKeys={['marmotScriptLibrary']}
                defaultOpenKeys={['configurationItem']}
                forceSubMenuRender
                mode="inline"
              >
                <Menu.Item key="marmotScriptLibrary">
                  {intl.get('spfm.marmotToolbox.view.title.marmotScriptLibrary').d('独立脚本')}
                </Menu.Item>
                <Menu.Item key="marmotTemplateManagement">
                  {intl.get('spfm.marmotToolbox.view.title.marmotTemplateManagement').d('RTF填充')}
                </Menu.Item>
                <Menu.Item key="marmotQueueConsumer">
                  {intl.get('spfm.marmotToolbox.view.title.marmotQueueConsumer').d('Topic消费端')}
                </Menu.Item>
                <Menu.Item key="marmotApiPublish">
                  {intl.get('spfm.marmotToolbox.view.title.marmotApiAppend').d('API')}
                </Menu.Item>
                <Menu.Item key="marmotAPIRewrite">
                  {intl.get('spfm.marmotToolbox.view.title.marmotAPIRewrite').d('功能API挂载')}
                </Menu.Item>
                <Menu.Item key="marmotDataImport">
                  {intl.get('spfm.marmotToolbox.view.title.marmotDataImport').d('功能数据导入')}
                </Menu.Item>
                <Menu.Item key="marmotScheduler">
                  {intl.get('spfm.marmotToolbox.view.title.marmotScheduler').d('调度')}
                </Menu.Item>
              </Menu>
            </div>
          ) : null}
          <di className="content-container-right">
            {!this.state.showMenu ? (
              <div className="content-container-right-unfold">
                <div>
                  <img
                    src={ActionImg}
                    alt=""
                    style={{ transform: 'rotateY(180deg)' }}
                    onClick={() => this.handleFoldTree(true)}
                  />
                </div>
              </div>
            ) : null}
            <div style={{ width: '100%' }}>{rightContent}</div>
          </di>
        </div>
      </Fragment>
    );
  }
}
