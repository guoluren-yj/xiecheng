/*
 * index - 接口监控页面
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import queryString from 'query-string';
import { Content, Header } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import withProps from 'hzero-front/lib/utils/withProps';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import {
  ASYNC_FLAG_TAGS,
  RESPONSE_STATUS_TAGS,
  INVOKE_TYPE_TAGS,
  SOURCE_TYPE_TAG,
} from '@/constants/constants';
import { retryFormDS, tableDS as TableDS } from '@/stores/InterfaceLog/InterfaceLogDS';
import getLang from '@/langs/interfaceLogLang';
import ClearLogsModal from './ClearLogsModal';

@formatterCollections({ code: ['hzero.common', 'hitf.interfaceLogs'] })
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true }
)
export default class InterfaceLogs extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingMap: {},
    };
  }

  /**
   *  打开清除日志模态框
   */
  @Bind()
  openClearLogsModal() {
    const modalProps = {
      onRefresh: () => this.props.tableDS.query(),
    };
    Modal.open({
      title: getLang('CLEAR_LOG'),
      children: <ClearLogsModal {...modalProps} />,
    });
  }

  /**
   * 重试
   */
  @Bind()
  async handleRetry(record) {
    const confirm = await Modal.confirm({
      children: (
        <p>
          {`${getLang('LASTEST')}${record.get('formatInterfaceVersion')},${getLang(
            'RETRY_CONFIRM'
          )}?`}
        </p>
      ),
    });
    if (confirm === 'ok') {
      const tempRetryFormDS = new DataSet(retryFormDS());
      const {
        interfaceLogId,
        invokeType,
        clearType,
        interfaceCode,
        interfaceName,
        serverName,
        requestTimeStart,
        requestTimeEnd,
        tenantId,
        clientId,
        applicationCode,
        invokeKey,
        serverCode,
        responseStatus,
        interfaceRequestTimeStart,
        interfaceRequestTimeEnd,
      } = record.toData();
      tempRetryFormDS.create({
        interfaceLogId,
        invokeType,
        clearType,
        interfaceCode,
        interfaceName,
        serverName,
        requestTimeStart,
        requestTimeEnd,
        tenantId,
        clientId,
        applicationCode,
        invokeKey,
        serverCode,
        responseStatus,
        interfaceRequestTimeStart,
        interfaceRequestTimeEnd,
        organizationId: tenantId,
      });
      this.setState({
        loadingMap: {
          [interfaceLogId]: true,
        },
      });
      await tempRetryFormDS
        .submit()
        .then((res) => {
          if (res && !res.failed) {
            this.setState({
              loadingMap: {
                [interfaceLogId]: false,
              },
            });
            this.props.tableDS.query();
          }
        })
        .catch(() => {
          this.setState({
            loadingMap: {
              [interfaceLogId]: false,
            },
          });
        });
    }
  }

  /**
   * 跳转到明细页
   */
  handleGotoDetail(interfaceLogId) {
    const {
      history,
      location: { search, pathname },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    history.push(
      pathname.indexOf('/private') === 0
        ? `/private/hitf/interface-logs/detail/${interfaceLogId}?access_token=${accessToken}`
        : `/hitf/interface-logs/detail/${interfaceLogId}`
    );
  }

  get interfaceLogColumns() {
    const { loadingMap } = this.state;
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'serverCode',
        width: 180,
      },
      {
        name: 'serverName',
        width: 180,
      },
      {
        name: 'formatInterfaceServerVersion',
        width: 100,
      },
      {
        name: 'interfaceCode',
        width: 180,
      },
      {
        name: 'interfaceName',
        width: 180,
      },
      {
        name: 'formatInterfaceVersion',
        width: 100,
      },
      {
        name: 'clientId',
        width: 150,
      },
      {
        name: 'interfaceUrl',
        width: 350,
      },
      {
        name: 'invokeType',
        width: 120,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, INVOKE_TYPE_TAGS, record.get('invokeTypeMeaning')),
      },
      {
        name: 'invokeKey',
        width: 280,
      },
      {
        name: 'requestTime',
        width: 160,
      },
      {
        name: 'asyncFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => TagRender(value, ASYNC_FLAG_TAGS),
      },
      {
        name: 'responseStatus',
        width: 130,
        align: 'center',
        renderer: ({ value }) => TagRender(value, RESPONSE_STATUS_TAGS),
      },
      !isTenantRoleLevel() && {
        name: 'sourceTenantName',
        width: 180,
      },
      isTenantRoleLevel() && {
        name: 'interfaceSource',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, SOURCE_TYPE_TAG, record.get('interfaceSourceMeaning')),
      },
      {
        header: getLang('OPERATOR'),
        width: 100,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.handleGotoDetail(record.get('interfaceLogId'))}
                >
                  {getLang('VIEW_DETAIL')}
                </ButtonPermission>
              ),
              key: 'detail',
              len: 2,
              title: getLang('VIEW_DETAIL'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  disabled={loadingMap[record.get('interfaceLogId')] || false}
                  onClick={() => this.handleRetry(record)}
                >
                  <Spin spinning={loadingMap[record.get('interfaceLogId')] || false} size="small">
                    {getLang('RETRY')}
                  </Spin>
                </ButtonPermission>
              ),
              key: 'retry',
              len: 2,
              title: getLang('RETRY'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            icon="delete"
            type="c7n-pro"
            color="primary"
            onClick={this.openClearLogsModal}
            permissionList={[
              {
                code: `${path}.button.clearLogs`,
                type: 'button',
                meaning: '接口监控-日志清理',
              },
            ]}
          >
            {getLang('CLEAR_LOG')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table
            dataSet={this.props.tableDS}
            columns={this.interfaceLogColumns}
            queryBarProps={{
              formProps: {
                labelWidth: 140,
              },
            }}
          />
        </Content>
      </>
    );
  }
}
