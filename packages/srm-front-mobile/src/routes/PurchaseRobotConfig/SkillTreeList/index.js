import React, { Fragment, Component } from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Col, Row, DataSet } from 'choerodon-ui/pro';
import { Tag, Popconfirm } from 'choerodon-ui';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import TextSearch from '@/components/TextSearch';
import listDS from './indexDS';
import './index.less';
import { onlineSkill, offlineSkill, copySkill, deleteSkillApi } from '@/services/SkillTreeService';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common'] })
export default class SkillTreeList extends Component {
  gotoDetail = ({ record }) => {
    this.props.history.push({
      pathname: `/smbl/purchase-robot/config/skill/detail/${record.get('skillId')}`,
    });
  };

  skillListDataSet = new DataSet(listDS());

  lineColumns = [
    {
      name: 'skillStatus',
      width: 100,
      renderer: ({ value, record }) => {
        // eslint-disable-next-line prefer-destructuring
        const skillStatusMeaning = record.data.skillStatusMeaning;
        let color = 'red';
        switch (value) {
          case 'ONLINE':
            color = 'green';
            break;
          case 'OFFLINE':
            color = 'red';
            break;
          case 'NEW':
            color = 'orange';
            break;
          default:
            color = 'red';
            break;
        }
        return (
          <Tag className="skill-tag-frameless" color={color}>
            {skillStatusMeaning}
          </Tag>
        );
      },
    },
    {
      name: 'skillAction',
      // width: 150,
      align: 'left',
      width: 160,
      renderer: ({ record }) => {
        // “操作”字段可执行动作控制，当前状态为下线，且“数据来源”是自定义，支持编辑、上线操作；当前状态为上线，只存在下线操作；当前“数据来源”为预定义，值存在复制操作
        // 是否是自定义
        const isUserDefined = Number(organizationId) === Number(record.data.tenantId);
        // 是否正在上线
        const isOnLine = record.data.skillStatus === 'ONLINE';
        // 0租户禁止删除
        const showDelete = isUserDefined && !isOnLine && record.get('tenantId') !== 0;
        return (
          <div>
            {!isUserDefined ? (
              <Popconfirm
                placement="top"
                title={intl
                  .get('smbl.purchaseRobotConfig.view.message.copySkillNotice')
                  .d('是否确认复制该技能?')}
                onConfirm={() => this.copySkillAction({ record })}
              >
                <a key="copy-action" style={{ marginRight: '10px' }} funcType="flat">
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.copy').d('复制')}
                </a>
              </Popconfirm>
            ) : null}
            {isUserDefined && !isOnLine ? (
              <a
                key="edit-action"
                style={{ marginRight: '10px' }}
                funcType="flat"
                onClick={() => this.gotoDetail({ record })}
              >
                {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.edit').d('编辑')}
              </a>
            ) : null}
            {isOnLine || !isUserDefined ? (
              <a
                key="copy-action"
                style={{ marginRight: '10px' }}
                funcType="flat"
                onClick={() => this.gotoDetail({ record })}
              >
                {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.view').d('查看')}
              </a>
            ) : null}
            {isUserDefined && !isOnLine ? (
              <Popconfirm
                placement="top"
                title={intl
                  .get('smbl.purchaseRobotConfig.view.message.onlineSkillNotice')
                  .d('是否确认上线该技能?')}
                onConfirm={() => this.onLineSkillAction({ record })}
              >
                <a key="on-line-action" funcType="flat" style={{ marginRight: '10px' }}>
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.online').d('上线')}
                </a>
              </Popconfirm>
            ) : null}
            {isUserDefined && isOnLine ? (
              <Popconfirm
                placement="top"
                title={intl
                  .get('smbl.purchaseRobotConfig.view.message.offlineSkillNotice')
                  .d('是否确认下线该技能?')}
                onConfirm={() => this.offlineSkillAction({ record })}
              >
                <a key="off-line-action" funcType="flat" style={{ marginRight: '10px' }}>
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.offline').d('下线')}
                </a>
              </Popconfirm>
            ) : null}
            {showDelete ? (
              <Popconfirm
                placement="top"
                title={intl
                  .get('smbl.purchaseRobotConfig.view.message.deleteSkillNotice')
                  .d('是否确认删除该技能?')}
                onConfirm={() => this.deleteSkillAction({ record })}
              >
                <a key="delete-line-action" funcType="flat" style={{ marginRight: '10px' }}>
                  {intl.get('smbl.purchaseRobotConfig.skillTree.view.button.delete').d('删除')}
                </a>
              </Popconfirm>
            ) : null}
          </div>
        );
      },
    },
    {
      name: 'skill',
      width: 200,
      group: true,
      aggregation: true,
      align: 'left',
      children: [
        { name: 'skillName' },
        {
          name: 'skillCode',
          renderer: ({ text, record }) => {
            return (
              <Row>
                <Col>{record.get('email')}</Col>
                <a
                  className="cyan-color"
                  onClick={() => {
                    this.gotoDetail({ record });
                  }}
                >
                  {text}
                </a>
              </Row>
            );
          },
        },
      ],
    },
    {
      name: 'skillObjectMeaning',
      width: 110,
      tooltip: 'overflow',
    },
    {
      name: 'skillTypeMeaning',
      width: 110,
    },
    {
      name: 'remark',
    },
    {
      name: 'tenantId',
      width: 100,
      renderer: ({ value }) => {
        // 是否是自定义
        const isUserDefined = Number(organizationId) === Number(value);
        return isUserDefined ? (
          <Tag className="skill-tag-frameless" color="green">
            {intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义')}
          </Tag>
        ) : (
          <Tag className="skill-tag-frameless" color="orange">
            {intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义')}
          </Tag>
        );
      },
    },
    {
      name: 'lastUpdate',
      width: 240,
      group: true,
      aggregation: true,
      align: 'left',
      children: [{ name: 'lastUpdatedName' }, { name: 'lastUpdateDate' }],
    },
  ];

  // 复制
  copySkillAction = async ({ record }) => {
    const copyData = {
      ...record.data,
    };
    try {
      const res = await copySkill(copyData);
      if (getResponse(res)) {
        notification.success();
      }
      this.skillListDataSet.query();
    } catch (error) {
      console.warn(error);
    }
  };

  // 下线
  offlineSkillAction = async ({ record }) => {
    try {
      const res = await offlineSkill(record.data);
      if (getResponse(res)) {
        notification.success();
      }
      this.skillListDataSet.query();
    } catch (error) {
      console.warn(error);
    }
  };

  // 上线
  onLineSkillAction = async ({ record }) => {
    try {
      const res = await onlineSkill(record.data);
      if (getResponse(res)) {
        notification.success();
      }
      this.skillListDataSet.query();
    } catch (error) {
      console.warn(error);
    }
  };

  deleteSkillAction = async ({ record }) => {
    try {
      const res = await deleteSkillApi([record.toData()]);
      if (getResponse(res)) {
        notification.success();
      }
      this.skillListDataSet.query();
    } catch (error) {
      console.warn(error);
    }
  };

  handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = this.skillListDataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['commonQuery'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    this.skillListDataSet.queryDataSet?.current
      ? this.skillListDataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : this.skillListDataSet.queryDataSet?.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      this.skillListDataSet.query(this.skillListDataSet.currentPage);
    } else {
      this.skillListDataSet.query();
    }
  };

  render() {
    return (
      <Fragment>
        <SearchBarTable
          searchCode="SMBL.PURCHASE_ROBOT.SKILL_TREE.LIST.FILTER"
          dataSet={this.skillListDataSet}
          columns={this.lineColumns}
          data={[]}
          style={{ height: 'calc(100% - 12px)' }}
          aggregation
          cacheState
          searchBarConfig={{
            editorProps: {},
            fieldProps: {},
            left: {
              render: () => (
                <TextSearch
                  name="commonQuery"
                  handleQuery={() => {}}
                  dataSet={this.skillListDataSet}
                  placeholder={intl
                    .get('smbl.purchaseRobotConfig.view.query.skillCommonQuery')
                    .d('请输入技能名称、编码查询')}
                />
              ),
            },
            onClear: () => {},
            onReset: () => {},
            onQuery: this.handleQuery,
          }}
        />
      </Fragment>
    );
  }
}
