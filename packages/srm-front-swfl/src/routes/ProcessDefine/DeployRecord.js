/*
 * DeployRecord - 发布记录
 * @date: 2019-05-08
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Timeline, Spin, Row, Col } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import { getAccessToken, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { API_HOST } from 'utils/config';
import styles from './index.less';

/**
 * 发布记录
 * @extends {Component} - React.Component
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onHandleOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
export default class DeployRecord extends Component {
  constructor(props) {
    super(props);
    const language = getCurrentLanguage();
    this.state = {
      dataSource: [],
      currentLanguage: ['zh_CN', 'en_US', 'ja_JP'].includes(language) ? language : 'en_US',
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible: preVisible } = preProps;
    const { visible } = this.props;
    if (!preVisible && visible) {
      return visible;
    }
    return null;
  }

  componentDidUpdate(preProps, preState, snapshot) {
    if (snapshot) {
      const { onFetchRecord, record } = this.props;
      if (record.key) {
        onFetchRecord(record.key).then((res) => {
          if (res) {
            this.setState({
              dataSource: res,
            });
          }
        });
      }
    }
  }

  @Bind()
  handleClick() {
    const { onCancel } = this.props;
    this.setState({ dataSource: [] });
    onCancel();
  }

  @Bind()
  checkHistoryEditor(row = {}) {
    const { record } = this.props;
    const accessToken = getAccessToken();
    const currentTenantId = getCurrentOrganizationId();
    const urlParam = {
      modelId: record.id,
      tenant_id: currentTenantId,
      language: this.state.currentLanguage,
      access_token: accessToken,
      historyFlag: row.historyFlag,
      deploymentId: row.deploymentId,
      version: row.version,
    };
    const url = `${API_HOST}/hwfp/index.html?${stringify(urlParam)}`;
    window.open(url);
  }

  render() {
    const { dataSource = [] } = this.state;
    const { anchor = 'right', visible, title = 'test', loading = false } = this.props;
    return (
      <Modal
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.handleClick}
        onCancel={this.handleClick}
        destroyOnClose
      >
        <Spin spinning={loading}>
          {dataSource.length > 0 ? (
            <Timeline>
              {dataSource.map((n) => (
                <Timeline.Item className={styles['deploy-record']}>
                  <Row gutter={8}>
                    <Col span={4}>
                      <Text>{intl.get(`hwfp.common.view.message.version`).d('版本')}</Text>:
                    </Col>
                    <Col span={20}>
                      {n.version}
                      <a
                        rel="noopener noreferrer"
                        onClick={() => this.checkHistoryEditor(n)}
                        style={{ marginLeft: '8px' }}
                      >
                        {intl.get('hzero.common.button.view').d('查看')}
                      </a>
                    </Col>
                  </Row>
                  <Row gutter={8}>
                    <Col span={4}>
                      <Text>{intl.get(`hzero.common.date.releaseTime`).d('发布时间')}</Text>:
                    </Col>
                    <Col span={20}>{n.deploymentTime}</Col>
                  </Row>
                  {n.publisher && (
                    <Row gutter={8}>
                      <Col span={4}>
                        <Text>{intl.get(`hwfp.common.view.message.publisher`).d('发布人')}</Text>:
                      </Col>
                      <Col span={20}>{n.publisher}</Col>
                    </Row>
                  )}
                  {n.deployRemark && (
                    <Row gutter={8}>
                      <Col span={4}>
                        <Text>
                          {intl.get('hwfp.processDefine.view.release.deployRemark').d('部署说明')}
                        </Text>
                        :
                      </Col>
                      <Col span={20}>{n.deployRemark}</Col>
                    </Row>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            intl.get('hwfp.common.view.message.deployRecord.noContent').d('暂无记录')
          )}
        </Spin>
      </Modal>
    );
  }
}
