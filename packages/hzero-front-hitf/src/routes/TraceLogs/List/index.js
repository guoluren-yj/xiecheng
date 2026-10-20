/**
 * TraceLogs - 日志记录
 * @date: 2020-07-09
 * @author: he.chen@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Bind } from 'lodash-decorators';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { Header, Content } from 'hzero-front/lib/components/Page';
import withProps from 'hzero-front/lib/utils/withProps';
import { openTab } from 'hzero-front/lib/utils/menuTab';
import getLang from '@/langs/traceLogsLang';
import { getStoreDbType, queryCode } from '@/services/traceLogsService';
import { SOURCE_TYPE_TAG } from '@/constants/constants';
import {
  traceLogDS,
  traceLogListDS as TraceLogListDS,
  traceLogQueryFields,
} from '@/stores/TraceLogs/TraceLogDS';
import ClearLogModal from './ClearLogModal';
import RetryModal from './RetryModal';

const { TabPane } = Tabs;

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
@withProps(
  () => {
    const traceLogTreeDS = new DataSet(traceLogDS());
    const traceLogListDS = new DataSet(TraceLogListDS());
    return { traceLogTreeDS, traceLogListDS };
  },
  { cacheState: true }
)
export default class TraceLog extends Component {
  state = {
    expandIconColumnIndex: 0,
    border: true,
    mode: 'tree',
    tabKey: 'tree',
    supportDbTypes: [],
  };

  /**
   * 跳转到明细页面
   * @param {Object} record
   */
  @Bind()
  handleGotoDetail(record) {
    openTab({
      title: `${getLang('TRACE_LOG_DETAIL')}-${record.get('batchNum')}`,
      key: `/hitf/trace-logs/detail/${record.get('traceLogId')}`,
      closable: true,
    });
  }

  componentDidMount() {
    this.fetchLogTextQueryDbTypeCode();
    this.fetchLogSourceType();
    getStoreDbType().then((res) => {
      if (res !== null && res !== '') {
        if (
          this.state.supportDbTypes.some((item) => {
            return item.value === res;
          })
        ) {
          const queryDataSet = new DataSet({
            autoCreate: true,
            fields: traceLogQueryFields(true),
          });
          this.props.traceLogTreeDS.queryDataSet = queryDataSet;
          this.props.traceLogListDS.queryDataSet = queryDataSet;
        }
      }
    });
  }

  @Bind()
  fetchLogTextQueryDbTypeCode() {
    queryCode({ lovCode: 'HITF.TRACE_LOG.TEXT_QUERY.DB_TYPE' }).then((res) => {
      this.setState({
        supportDbTypes: res,
      });
    });
  }

  @Bind()
  fetchLogSourceType() {
    queryCode({ lovCode: 'HITF.SOURCE_TYPE' }).then((res) => {
      const canRetryTypes = res
        .filter((item) => {
          return item.tag === 'can-retry';
        })
        .map((item) => {
          return item.value;
        });
      this.setState({
        canRetryTypes,
      });
    });
  }

  @Bind
  async onOkClick() {
    const validate = await this.clearLogDS.validate();
    if (!validate) {
      return Promise.resolve(false);
    }
    await this.clearLogDS.submit();
  }

  /**
   * 日志清理
   */
  @Bind()
  handleClearLog() {
    const modalProps = {
      onRef: (ref) => {
        this.clearLogDS = ref.clearLogDS;
      },
    };
    Modal.open({
      title: getLang('CLEAR_LOG'),
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: { width: 400 },
      children: <ClearLogModal {...modalProps} />,
      onOk: this.onOkClick,
    });
  }

  /**
   * 接口重试
   */
  @Bind()
  handleRetry(record) {
    const { tabKey } = this.state;
    const traceLogId = record.get('traceLogId');
    const { traceLogTreeDS, traceLogListDS } = this.props;
    Modal.open({
      title: getLang('RETRY'),
      closable: true,
      destroyOnClose: true,
      style: { width: 1000 },
      okText: getLang('RETRY_BUTTON'),
      children: (
        <RetryModal
          traceLogId={traceLogId}
          traceLogTreeDS={traceLogTreeDS}
          traceLogListDS={traceLogListDS}
          tabKey={tabKey}
        />
      ),
    });
  }

  get columns() {
    return [
      !isTenantRoleLevel() && { name: 'tenantName', width: 180 },
      { name: 'sourceName', width: 250 },
      { name: 'sourceCode', width: 180 },
      { name: 'batchNum', width: 180 },
      { name: 'requestUrl', width: 280 },
      { name: 'requestTime', width: 160 },
      { name: 'sourceType', align: 'center' },
      { name: 'sourceSystem' },
      { name: 'sourceDocumentNum', width: 150 },
      { name: 'sourceDocumentIdStr', width: 150 },
      { name: 'invokeKey', width: 280 },
      { name: 'responseStatus', width: 100, align: 'center' },
      { name: 'businessStateMeaning', width: 100, align: 'center' },
      { name: 'asyncFlagMeaning', width: 100, align: 'center' },
      { name: 'reqParamModifyFlagMeaning', width: 120, align: 'center' },
      { name: 'clientName' },
      !isTenantRoleLevel() && { name: 'sourceTenantName', width: 180 },
      isTenantRoleLevel() && {
        name: 'interfaceSource',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, SOURCE_TYPE_TAG, record.get('interfaceSourceMeaning')),
      },
      {
        header: getLang('ACTION'),
        width: 100,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'detail',
              ele: <a onClick={() => this.handleGotoDetail(record)}>{getLang('DETAIL')}</a>,
              len: 2,
              title: getLang('DETAIL'),
            },
            this.state.canRetryTypes.includes(record.get('sourceType')) && {
              key: 'retry',
              len: 2,
              title: getLang('RETRY'),
              ele: <a onClick={() => this.handleRetry(record)}>{getLang('RETRY_BUTTON')}</a>,
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ].filter(Boolean);
  }

  render() {
    const { mode, expandIconColumnIndex, border } = this.state;
    return (
      <>
        <Header title={getLang('TRACE_LOG')}>
          <ButtonPermission
            permissionList={[
              {
                code: `hitf-trace-logs.button.clear.button`,
                type: 'button',
                meaning: '日志清理',
              },
            ]}
            icon="delete"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleClearLog()}
          >
            {getLang('CLEAR_LOG')}
          </ButtonPermission>
        </Header>
        <Content>
          <Tabs
            defaultActiveKey="tree"
            className="page-tabs"
            onChange={(val) => this.setState({ tabKey: val })}
          >
            <TabPane tab={getLang('TREE_STRUCTURE')} key="tree">
              <Table
                dataSet={this.props.traceLogTreeDS}
                columns={this.columns}
                expandIconColumnIndex={expandIconColumnIndex}
                border={border}
                mode={mode}
                queryBarProps={{
                  formProps: {
                    labelWidth: 130,
                  },
                }}
              />
            </TabPane>
            <TabPane tab={getLang('GROUPING_STRUCTURE')} key="group">
              <Table
                dataSet={this.props.traceLogListDS}
                columns={this.columns}
                expandIconColumnIndex={expandIconColumnIndex}
                border={border}
                mode={mode}
                queryBarProps={{
                  formProps: {
                    labelWidth: 130,
                  },
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
