/**
 * MyCard/index.js
 * 适配器脚本历史版本查找功能MyCard页面
 * @date: 2021-08-11
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { DataSet, CodeArea, Select, Modal, Button } from 'choerodon-ui/pro';
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_ADAPTOR } from '_utils/config';
import VersionSpan from '../../VersionSpan';
import CodeCompare from '../CodeCompare';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;

const modalKey = Modal.key();
@formatterCollections({
  code: ['spfm.adaptorTaskDetail', 'hitf.dataMapping', 'spfm.scriptSearch'],
})
export default class MyCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsOptions: this.props.jsOptions,
      scriptVersion: this.props.scriptVersion,
      unShow: true, // 判读返回的历史版本是否为空 空时将select框置为不可点击
    };
  }

  componentDidMount() {
    this.optionPageDs.setQueryParameter('lineId', this.props.lineId); // this.props.lineId
    this.optionPageDs.query().then((res) => {
      this.optionPageDs.loadData(res); // 异步
      this.setState({ unShow: !res.length });
    });
  }

  optionPageDs = new DataSet({
    selection: 'single',
    paging: false,
    transport: {
      read: {
        url: `${requestUrlPre}/adaptor-task-line-versions/version`, // 获取历史版本数据接口名
        method: 'GET',
      },
    },
  });

  selectionDs = new DataSet({
    autoQuery: true,
    data: [{ showVersion: '', scriptContent: this.props.realScript }], // 无历史版本数据时以及刚进入时 使用props中的内容显示
    fields: [
      {
        name: 'historyDs',
        type: 'object',
        textField: 'showVersion',
        valueField: 'showVersion',
        label: intl.get('hitf.dataMapping.view.title.versionHistory').d('历史版本'),
        options: this.optionPageDs, // 下拉框选项数据源需要绑定一个Dataset
        ignore: 'always',
      },
      {
        name: 'showVersion',
        bind: 'historyDs.showVersion',
      },
      {
        name: 'scriptContent',
        bind: 'historyDs.scriptContent',
      },
    ],
  });

  /**
   * 显示代码比对框
   */
  showCodeCompare = () => {
    // 先判断当前是否选中其他版本或者选中后取消了
    if (
      this.selectionDs.current.get('showVersion') === '' ||
      this.selectionDs.current.get('showVersion') === null
    ) {
      Modal.info({
        title: intl.get('spfm.scriptSearch.modal.info.noSelection').d('未选择版本'),
        children: intl.get('spfm.scriptSearch.modal.info.please').d('请选择版本'),
      });
      return;
    }
    // 已选中版本
    Modal.open({
      key: modalKey,
      title: intl.get('spfm.scriptSearch.modal.code.compare').d('代码比对'),
      closable: true,
      movable: false, // 禁止移动
      fullScreen: true,
      destroyOnClose: true,
      footer: (okBtn) => okBtn,
      children: (
        <CodeCompare
          oriCode={this.props.realScript}
          currentCode={this.selectionDs.current.get('scriptContent')}
          oriTitle={intl.get('spfm.scriptSearch.modal.code.latestVersion').d('现版本代码')}
          currentTitle={this.selectionDs.current.toJSONData().showVersion}
        />
      ),
    });
  };

  render() {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <h1 style={{ margin: 0 }}>
            {intl.get('spfm.adaptorTaskDetail.view.title.scriptContent').d('脚本代码')}
          </h1>
          {this.props.value === 'select' ? (
            this.state.unShow ? (
              <Select
                placeholder={intl
                  .get('spfm.scriptSearch.view.title.historicalVersion.none')
                  .d('暂无历史版本')}
                style={{ width: 230, height: 33, margin: '0 26px 0 0' }}
                disabled="false"
              />
            ) : (
              <div className="action-link">
                <Button
                  color="primary"
                  onClick={this.showCodeCompare}
                  style={{ height: 31, margin: '0 26px 0 0' }}
                >
                  {intl.get('spfm.scriptSearch.modal.code.buttonText').d('与现版本代码比对')}
                </Button>
                <Select
                  placeholder={intl
                    .get('spfm.scriptSearch.view.option.selectMoreVersion')
                    .d('更多版本')}
                  style={{ width: 230, height: 33, margin: '0 26px 0 0' }}
                  dataSet={this.selectionDs}
                  name="historyDs"
                />
              </div>
            )
          ) : null}
        </div>
        <Card>
          {this.state.scriptVersion && (
            <VersionSpan
              description="MarmotScript"
              value={this.state.scriptVersion}
              bgColor="#f28040"
            />
          )}
          <CodeArea
            readOnly="true"
            dataSet={this.selectionDs}
            name="scriptContent"
            options={this.state.jsOptions}
            format={JSFormatter}
            style={{ height: 500, width: 600 }}
          />
        </Card>
      </>
    );
  }
}
