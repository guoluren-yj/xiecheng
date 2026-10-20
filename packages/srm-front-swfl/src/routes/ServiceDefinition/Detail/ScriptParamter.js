import React from 'react';
import { Card, Button, Popconfirm, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';
import { operatorRender } from 'utils/renderer';

import ScriptDrawer from './ScriptDrawer';

export default class ExpressionParamter extends React.Component {
  state = {
    visible: false,
    currentRecord: {},
  };

  @Bind()
  handleDelete(record) {
    const { dispatch, parameterList = [] } = this.props;
    const filterList = parameterList.filter((item) => item.parameterId !== record.parameterId);
    dispatch({
      type: 'serviceDefinition/updateState',
      payload: { parameterList: filterList },
    });
    notification.success();
  }

  @Bind()
  showEditModal(flag, record = {}) {
    this.setState({ visible: flag, currentRecord: record });
  }

  @Bind
  handleParamterSave(data = {}) {
    const { dispatch, parameterList = [] } = this.props;
    const { currentRecord } = this.state;
    if (currentRecord.parameterId !== undefined) {
      const filterList = parameterList.map((item) => {
        if (item.parameterId === currentRecord.parameterId) {
          return { ...item, ...data };
        } else {
          return { ...item };
        }
      });
      dispatch({
        type: 'serviceDefinition/updateState',
        payload: { parameterList: filterList },
      });
    } else if (currentRecord.parameterCreateId !== undefined) {
      const filterList = parameterList.map((item) => {
        if (item.parameterCreateId === currentRecord.parameterCreateId) {
          return { ...item, ...data };
        } else {
          return { ...item };
        }
      });
      dispatch({
        type: 'serviceDefinition/updateState',
        payload: { parameterList: filterList },
      });
    } else {
      dispatch({
        type: 'serviceDefinition/updateState',
        payload: { parameterList: [data, ...parameterList] },
      });
    }
    this.showEditModal(false);
  }

  @Bind()
  getColumns() {
    return [
      {
        dataIndex: 'parameterName',
        width: 150,
        title: intl.get('hwfp.serviceDefinition.model.scriptParam.name').d('参数编码'),
      },
      {
        dataIndex: 'parameterDescription',
        width: 150,
        title: intl.get('hwfp.serviceDefinition.model.scriptParam.description').d('参数名称'),
      },
      {
        dataIndex: 'scriptParameterType',
        width: 150,
        title: intl
          .get('hwfp.serviceDefinition.model.scriptParam.scriptParameterType')
          .d('参数类型'),
        render: (val) => {
          return val === 'DYNAMIC'
            ? intl.get('hwfp.serviceDefinition.model.scriptParam.dynamic').d('动态参数')
            : intl.get('hwfp.serviceDefinition.model.scriptParam.constant').d('固定值');
        },
      },
      {
        dataIndex: 'parameterValue',
        width: 150,
        title: intl.get('hwfp.serviceDefinition.model.scriptParam.value').d('参数值'),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 120,
        render: (val, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() => {
                    this.showEditModal(true, record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'delete',
              ele: (
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                  onConfirm={() => this.handleDelete(record)}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  @Bind()
  handleChangeSource(value) {
    const { onChangeSource = (e) => e } = this.props;
    onChangeSource(value);
  }

  render() {
    const {
      paramsLoading = false,
      parameterList = [],
      paramterSourceList = [],
      variableList = [],
      serviceOperatorList = [],
      serviceType,
      serviceMode,
    } = this.props;
    const { visible, currentRecord } = this.state;
    const paramsProps = {
      modalVisible: visible,
      paramterSourceList,
      variableList,
      serviceOperatorList,
      parameterList,
      onChangeSource: this.handleChangeSource,
      initData: currentRecord,
      onOk: this.handleParamterSave,
      onCancel: () => this.showEditModal(false, {}),
      serviceType,
      serviceMode,
    };
    // const parameterLists = parameterList.filter(res=>res.parameterName !== "requestConstants");
    return (
      <>
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={
            <h3>{intl.get('hwfp.serviceDefinition.view.title.scriptParams').d('常量定义')}</h3>
          }
        >
          <div className="table-list-operator">
            <Button
              type="primary"
              // disabled={!isSiteFlag ? isPredefined : false}
              onClick={() => this.showEditModal(true)}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <Table
            bordered
            loading={paramsLoading}
            rowKey="parameterId"
            dataSource={parameterList}
            columns={this.getColumns()}
            pagination={false}
          />
          {visible && <ScriptDrawer {...paramsProps} />}
        </Card>
      </>
    );
  }
}
