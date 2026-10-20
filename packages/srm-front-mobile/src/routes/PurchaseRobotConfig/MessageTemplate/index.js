import React, { Fragment, Component } from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { enableRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { Tag, Popconfirm } from 'choerodon-ui';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import TextSearch from '@/components/TextSearch';
import messageListDS from './indexDS';
import './index.less';
import { coypMessageTemplate, deleteMessageTemplateApi } from '@/services/MessageTemplateService';
// eslint-disable-next-line import/order
import notification from 'utils/notification';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'smbl.common', 'hzero.common'] })
export default class MessageTemplate extends Component {
  messageListDataSet = new DataSet(messageListDS());

  lineColumns = [
    {
      name: 'prStatusCode',
      align: 'left',
      width: 100,
      renderer: ({ record }) => {
        const isCurrentTenant = Number(organizationId) === Number(record.get('tenantId'));
        if (!isCurrentTenant) {
          return [
            <Popconfirm
              placement="top"
              title={intl
                .get('smbl.purchaseRobotConfig.view.message.copyMessageTemplate')
                .d('是否确认复制该模板?')}
              onConfirm={() => this.coypMessageTemplate({ record })}
            >
              <a style={{ marginRight: '10px' }}>
                {intl.get('smbl.purchaseRobotConfig.view.button.copy').d('复制')}
              </a>
            </Popconfirm>,
            <a onClick={() => this.gotoDetail(record.get('templateId'), record.get('tenantId'))}>
              {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.view').d('查看')}
            </a>,
          ];
        }

        const buttons = [];
        buttons.push(
          <a
            style={{ marginRight: '10px' }}
            onClick={() => this.gotoDetail(record.get('templateId'), record.get('tenantId'))}
          >
            {intl.get('smbl.common.view.button.edit').d('编辑')}
          </a>
        );
        if (!record.get('enabledFlag') && record.get('tenantId') !== 0) {
          buttons.push(
            <Popconfirm
              placement="top"
              title={intl
                .get('smbl.purchaseRobotConfig.view.message.deleteTemplate')
                .d('是否确认删除该模板?')}
              onConfirm={() => this.deleteTemplate({ record })}
            >
              <a style={{ marginRight: '10px' }}>
                {intl.get('smbl.common.view.button.delete').d('删除')}
              </a>
            </Popconfirm>
          );
        }
        return buttons;
      },
    },
    {
      name: 'displayPrNum',
      align: 'left',
      group: true,
      aggregation: true,
      children: [
        { name: 'templateName' },
        {
          name: 'templateCode',
          renderer: ({ text, record }) => {
            return (
              <a
                onClick={() => {
                  this.gotoDetail(record.get('templateId'), record.get('tenantId'));
                }}
              >
                {text}
              </a>
            );
          },
        },
      ],
    },
    {
      name: 'remark', // 模板说明
    },
    {
      name: 'tenantId',
      renderer: ({ record }) => {
        // 是否是自定义
        const isUserDefined = getCurrentOrganizationId() > record.get('tenantId');
        return isUserDefined ? (
          <Tag className="skill-tag-frameless" color="orange">
            {intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义')}
          </Tag>
        ) : (
          <Tag className="skill-tag-frameless" color="green">
            {intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义')}
          </Tag>
        );
      },
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => {
        return enableRender(value);
      },
    },
    {
      name: 'lastUpdatedBy',
      align: 'left',
      group: true,
      aggregation: true,
      children: [
        { name: 'realName' },
        {
          name: 'lastUpdateDate',
        },
      ],
    },
  ];

  /**
   * 跳转详情页
   * @param {string} templateId
   */
  @Bind
  gotoDetail = (templateId, tenantId) => {
    this.props.history.push({
      pathname: '/smbl/purchase-robot/config/message-template-detail',
      state: {
        templateId,
        canEidt: Number(organizationId) === Number(tenantId),
      },
    });
  };

  deleteTemplate = async ({ record }) => {
    const res = await deleteMessageTemplateApi([record.toData()]);
    if (getResponse(res)) {
      notification.success();
    }
    this.messageListDataSet.query();
  };

  /**
   * 复制模板
   * @param {string} templateId
   */
  copyRecord = (record) => {
    Modal.confirm({
      title: intl
        .get('smbl.purchaseRobotConfig.view.message.copyMessageTemplate')
        .d('是否确认复制该模板?'),
      onOk: async () => {
        this.coypMessageTemplate(record);
      },
    });
  };

  coypMessageTemplate = async ({ record }) => {
    const copyData = {
      ...record.data,
    };
    const res = await coypMessageTemplate(copyData);
    if (getResponse(res)) {
      notification.success();
    }
    this.messageListDataSet.query();
  };

  handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = this.messageListDataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['templateNameAndCode'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    this.messageListDataSet.queryDataSet?.current
      ? this.messageListDataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : this.messageListDataSet.queryDataSet?.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      this.messageListDataSet.query(this.messageListDataSet.currentPage);
    } else {
      this.messageListDataSet.query();
    }
  };

  render() {
    return (
      <Fragment>
        <SearchBarTable
          className="message-template-list"
          searchCode="SMBL.PURCHASE_ROBOT.MESSAGE_TEMPLATE"
          dataSet={this.messageListDataSet}
          columns={this.lineColumns}
          style={{ height: 'calc(100% - 12px)' }}
          aggregation
          cacheState
          searchBarConfig={{
            left: {
              render: () => (
                <TextSearch
                  name="templateNameAndCode"
                  handleQuery={() => {}}
                  dataSet={this.messageListDataSet}
                  placeholder={intl
                    .get('smbl.purchaseRobotConfig.model.templateNameAndTemplateCode')
                    .d('请输入消息模版名称、编码查询')}
                />
              ),
            },
            onQuery: this.handleQuery,
          }}
        />
      </Fragment>
    );
  }
}
