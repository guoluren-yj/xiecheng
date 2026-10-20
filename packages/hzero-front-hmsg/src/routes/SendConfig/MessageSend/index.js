import React, { Component } from 'react';
import { DataSet, Form, Lov, Select, Button, Modal, Table, Output } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from "mobx-react";
import { isNil } from 'lodash';
import queryString from 'querystring';

import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import { HZERO_MSG } from 'utils/config';
import { sendCustomMessage } from '@/services/messageQueryService';
import styles from './index.less';

const messageKey = 'HMSG.MESSAGE_SEND.CUSTOM_SEND_AFTER_IMPORT';

@formatterCollections({ code: ['hmsg.messageQuery'] })
@observer
export default class MessageSend extends Component {
  constructor(props) {
    super(props);
    this.formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'template',
          label: intl.get('hmsg.messageQuery.common.tempServerId').d('消息发送模板'),
          lovCode: 'HMSG.MESSAGE.SEND.CONFIG',
          type: 'object',
          required: true,
        },
        {
          name: 'tempServerId',
          bind: 'template.tempServerId',
          label: intl.get('hmsg.messageQuery.common.tempServerId').d('消息发送模板'),
          required: true,
        },
        {
          name: 'messageType',
          label: intl.get('hmsg.messageQuery.common.messageType').d('消息发送方式'),
          required: true,
          lookupCode: 'HMSG.MESSAGE_TYPE',
          dynamicProps: {
            disabled: ({ record}) => {
              return !record || !record.get('tempServerId');
            },
          },
        },
        {
          name: 'messageLang',
          label: intl.get('hmsg.messageQuery.common.messageLang').d('语言'),
          required: true,
          lookupCode: 'HMSG.MESSAGE_TEMPLATE.LANG',
          dynamicProps: {
            disabled: ({ record}) => {
              return !record || !record.get('messageType');
            },
            lovPara: ({ record}) => {
              const tempServerId = record ? record.get("tempServerId") : undefined;
              const typeCode = record ? record.get("messageType") : undefined;
              if (!isNil(tempServerId) && !isNil(typeCode)) {
                return {
                  tempServerId,
                  typeCode,
                };
              }
              return undefined;
            },
          }
        },
        {
          name: 'messageContent',
          label: intl.get('hmsg.messageQuery.common.messageContent').d('消息内容'),
        },
        {
          name: 'batch',
        }
      ],
      events: {
        update: ({ record, name, value }) => {
          switch(name) {
            case 'template':
              record.set('messageType', undefined);
            case 'messageType':
              record.set('messageLang', undefined);
              record.set('messageContent', undefined);
            case 'messageLang':  
              record.set('batch', undefined);
              if (!value) {
                record.set('messageContent', undefined);
              } else {
                const lookupData = record.getField(name).getLookupData(value) || {};
                record.set('messageContent', lookupData.templateContent);
              }
            default:
              break;
          }
        },
      }
    });
  }

  viewHistoryRecord = () => {
    const tableDs = new DataSet({
      autoQuery: true,
      queryFields: [
        {
          name: 'messageCode',
          type: 'object',
          lovCode: 'HMSG.MESSAGE.SEND.CONFIG',
          label: intl.get('hmsg.messageQuery.common.tempServerId').d('消息发送模板'),
          transformRequest: (value) => value && value.messageCode,
        },
        {
          name: 'messageType',
          label: intl.get('hmsg.messageQuery.common.messageType').d('消息发送方式'),
          lookupCode: 'HMSG.MESSAGE_TYPE',
        },
        {
          name: 'creationDate',
          type: 'dateTime',
          label: intl.get('hmsg.messageQuery.common.title.creationDate').d('发送时间'),
          range: ['sendAfter', 'sendBefore'],
          ignore: 'always',
        },
        {
          name: 'sendBefore',
          bind: 'creationDate.sendBefore',
        },
        {
          name: 'sendAfter',
          bind: 'creationDate.sendAfter',
        },
      ],
      transport: {
        read: {
          url:  `${HZERO_MSG}/v1/${getCurrentOrganizationId()}/messages/custom-send/record`,
          method: 'POST',
        }
      }
    });
    const columns = [
      {
        header: intl.get('hmsg.messageQuery.common.tempServerId').d('消息发送模板'),
        name: 'messageName',
      },
      {
        header: intl.get('hmsg.messageQuery.common.title.messageType').d('消息类型'),
        name: 'messageTypeMeaning',
      },
      {
        header: intl.get('hmsg.messageQuery.common.title.messageLang').d('语言'),
        name: 'messageLangMeaning',
      },
      {
        header: intl.get('hmsg.messageQuery.common.title.userName').d('操作人'),
        name: 'userName',
      },
      {
        header: intl.get('hmsg.messageQuery.common.title.msgCount').d('收件人数量'),
        name: 'msgCount',
        align: 'right',
      },
      {
        header: intl.get('hmsg.messageQuery.common.title.creationDate').d('发送时间'),
        name: 'creationDate',
      },
    ];
    Modal.open({
      title: intl.get('hmsg.messageQuery.common.title.sendHistoryRecord').d('发送记录查询'),
      drawer: true,
      style: { width: '1000px' },
      footer: (ok) => ok,
      children: (
        <Table
          dataSet={tableDs}
          columns={columns}
        />
      )
    });

  };

  afterImport = ({ batch }) => {
    if (batch && this.formDs.current && this.formDs.current.get('messageLang')) {
      this.formDs.current.set('batch', batch);
    }
  }

  send = async () => {
    const dataSet = this.formDs;
    if (!dataSet.current) return;
    const flag = await dataSet.current.validate();
    
    if (!flag) return;
    if (!dataSet.current.get('batch')) {
      notification.warning({
        message: intl.get('hmsg.messageQuery.common.shouldImportReciver').d('请先导入接收人'),
      }); 
      return;
    }
    const { batch, messageLang, messageType, tempServerId } = dataSet.current.get(['batch', 'messageLang', 'messageType', 'tempServerId']);
    const res = await sendCustomMessage({
      batch, messageLang, messageType, tempServerId
    });
    if (getResponse(res)) {
      notification.success();
      this.formDs.loadData([{}]);
    }
  };

  render() {
    const { tempServerId, messageType, messageLang } = this.formDs.current ? this.formDs.current.get(['tempServerId', 'messageType', 'messageLang']) : {};
    const disabled = isNil(tempServerId) || !messageType || !messageLang;
    return (
      <>
        <Header
          title={intl.get('hmsg.messageQuery.common.customizeMessageSend').d('自定义消息发送')}
          backPath="/hmsg/send-config/list"
        >
          <Button color='primary' waitType='debounce' wait='300' onClick={this.send}>
            {intl.get('hmsg.messageQuery.common.send').d('发送')}
          </Button>
          <Button onClick={this.viewHistoryRecord}>
            {intl.get('hmsg.messageQuery.common.sendHistoryRecord').d('发送记录查询')}
          </Button>
        </Header>
        <Content>
          <Alert
            showIcon
            style={{ marginBottom: '16px', color: "#276EF1" }}
            message={intl
              .get('hmsg.messageQuery.common.customSend.alert')
              .d('自定义发送消息，消息发送后不支持撤回，请谨慎使用')}
            type="info"
          />
          <div className={styles.card}>
            <div className={styles.title}>
              {intl.get('hmsg.messageQuery.common.messageSendConfig').d('消息发送配置')}
            </div>
            <Form dataSet={this.formDs} columns={3} labelLayout='float'>
              <Lov name='template' />
              <Select
                name='messageType'
                optionsFilter={(record) => {
                  const template = this.formDs.current && this.formDs.current.get('template');
                  if (record && template && template.typeCode && template.typeCode.split(',').includes(record.get('value'))) {
                    return true;
                  }
                  return false;
                }}
              />
              <Select name='messageLang' />
              <Output
                name='messageContent'
                colSpan={2}
                renderer={({ value }) => {
                  return <div dangerouslySetInnerHTML={{ __html: value }} />
                }}  
              />
            </Form>
          </div>
          {!disabled && (
            <div className={styles.card}>
              <div className={styles.title}>
                {intl.get('hmsg.messageQuery.common.importReciver').d('导入接收人')}
              </div>
              <CommonImport
                sync={false}
                auto={false}
                prefixPatch={HZERO_MSG}
                args='null'
                autoRefreshInterval={5000}
                tenantId={getCurrentOrganizationId()}
                code='HMSG.MONITOR.CUSTOM.SEND'
                action='hmsg.messageQuery.common.customizeMessageSend.batchImport'
                pathKey='/hmsg/send-config/message-send/data-import/HMSG.MONITOR.CUSTOM.SEND'
                historyButton='true'
                refreshButton='true'
                dataImportButton='true'
                requestParams={{ tempServerId, messageType, messageLang }}
                afterImport={this.afterImport}
                disabled={disabled}
              />
            </div>
          )}
        </Content>
      </>
    );
  }
}