import React, { Component } from 'react';
import { Row, Lov, Modal, DataSet } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import MessageCardEdit from './MessageCardEdit/index';
import { editFormDS } from './indexDS';
import ExecutableCodeAreaModal from '@/components/ExecutableCodeArea/ExecutableCodeAreaModal';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common'] })
export default class TaskLine extends Component {
  buttons = ['add', 'save', ['delete', { color: 'red' }]];

  lineColumns = [
    {
      name: 'thirdParty',
      editor: !this.props.disabled,
    },
    Number(organizationId) === 0
      ? {
          name: 'msgTmpLineUuid',
          renderer: ({ record }) => {
            return Number(record.get('tenantId')) === 0 ? (
              <a onClick={() => this.maintainMessageCondition(record)}>
                {this.props.disabled
                  ? intl.get('hzero.common.view.title.view').d('查看')
                  : intl.get('hzero.common.button.editor').d('编辑')}
              </a>
            ) : null;
          },
        }
      : {
          name: 'msgMarmotCode',
        },
    {
      name: 'remark',
      editor: !this.props.disabled,
    },
    {
      name: 'operation',
      renderer: ({ record }) => {
        return record.status === 'add' ? null : (
          <a onClick={() => this.maintainMessageCard(record.get('templateLineId'))}>
            {this.props.disabled
              ? intl.get('hzero.common.view.title.view').d('查看')
              : intl.get('hzero.common.button.editor').d('编辑')}
          </a>
        );
      },
    },
  ];

  queryDataSet = new DataSet({
    autoQuery: false,
    fields: [
      {
        name: 'thirdParty',
        type: 'object',
        lovCode: 'SMBL.THIRD_PARTY.VIEW',
        label: intl.get('smbl.purchaseRobotConfig.model.thirdParty').d('适用三方平台'),
        textField: 'thirdPartyDesc',
        valueField: 'thirdPartyCode',
        transformRequest: (value) => {
          return value?.thirdPartyCode;
        },
      },
    ],
  });

  // 维护卡片条件
  @Bind
  maintainMessageCondition(record) {
    const autoSaveId = `message_condition_${record.get('templateLineId')}`;
    ExecutableCodeAreaModal.open(
      {
        drawer: true,
        title: intl.get('smbl.purchaseRobotConfig.model.condition').d('卡片条件'),
        okText: this.props.disabled
          ? intl.get('hzero.common.model.button.close').d('关闭')
          : intl.get('hzero.common.button.save').d('保存'),
        cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
        cancelButton: !this.props.disabled,
        style: { width: '100%' },
        drawerOffset: 0,
        fullScreen: true,
        autoSaveId,
        onOk: () => this.handCodeAreaOk(this.props.disabled),
      },
      {
        readOnly: this.props.disabled,
        record,
        name: 'msgTmpLineUuid',
        // style: { height: 500 },
      }
    );
  }

  @Bind
  handCodeAreaOk = (readOnly) => {
    if (readOnly) {
      return true;
    }
    return this.props.lineDataSet.submit();
  };

  /**
   * 维护消息卡片
   */
  @Bind
  maintainMessageCard(templateLineId) {
    const { disabled } = this.props;
    const editFormDataSet = new DataSet(editFormDS(templateLineId));
    Modal.open({
      drawer: true,
      title: intl.get('smbl.purchaseRobotConfig.view.filterCardForm').d('筛选卡片构成'),
      okText: !disabled
        ? intl.get('hzero.common.button.save').d('确定')
        : intl.get('hzero.common.model.button.close').d('关闭'),
      cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
      cancelButton: !disabled,
      children: <MessageCardEdit editFormDataSet={editFormDataSet} readOnly={disabled} />,
      style: { width: '100%' },
      bodyStyle: { padding: 0 },
    });
  }

  /**
   * 维护消息卡片
   */
  @Bind
  thirdPartyQuery(val) {
    const thirdPartyCode = val ? val?.thirdPartyCode : '';
    this.props.lineDataSet.setQueryParameter('thirdPartyCode', thirdPartyCode);
    this.props.lineDataSet.query();
  }

  handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = this.props.lineDataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['thirdPartyCode'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    this.props.lineDataSet.queryDataSet?.current
      ? this.props.lineDataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : this.props.lineDataSet.queryDataSet?.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      this.props.lineDataSet.query(this.props.lineDataSet.currentPage);
    } else {
      this.props.lineDataSet.query();
    }
  };

  render() {
    return (
      <Row code="taskLine">
        <SearchBarTable
          className="message-template-detail"
          searchCode="SMBL.PURCHASE_ROBOT.MESSAGE_TEMPLATE_DETAIL.FILTER"
          dataSet={this.props.lineDataSet}
          columns={this.lineColumns}
          aggregation
          cacheState
          buttons={this.props.disabled ? null : this.buttons}
          searchBarConfig={{
            closeFilterSelector: true,
            left: {
              render: () => (
                <Lov
                  name="thirdParty"
                  onChange={this.thirdPartyQuery}
                  dataSet={this.queryDataSet}
                  placeholder={intl
                    .get('smbl.purchaseRobotConfig.model.placeholder.thirdParty')
                    .d('请选择三方平台查询')}
                />
              ),
            },
            onQuery: this.handleQuery,
          }}
        />
      </Row>
    );
  }
}
