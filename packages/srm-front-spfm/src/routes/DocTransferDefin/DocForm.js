/**
 * DocForm.js
 * 单据转交定义-新建和编辑页面
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Popconfirm, Icon, Tooltip, Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Table,
  Form,
  TextField,
  Select,
  Switch,
  Dropdown,
  Menu,
  Modal,
  Button,
  IntlField,
  NumberField,
} from 'choerodon-ui/pro';
import { Card } from 'hzero-ui';
import { isEmpty, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  deleteTransferSurface,
  deleteTransferTenant,
  deleteTransferRelation,
  deleteTransferCondition,
} from '@/services/docTransferDefinService';
import { getConditonDs, getRelationDs, getTransferConditionDsDs } from './store/configDS';

const { Item } = Menu;
const ModalKey = Modal.key();
const { TabPane } = Tabs;

export default class DocForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTenant: false,
    };
  }

  componentWillMount() {
    const { dataRecord, surfaceDS, surfacePurchaserDS, tenantDS, deliverType } = this.props;
    const data = dataRecord.toData();
    if (data.docLevel === 'TENANT') {
      this.setState({
        showTenant: true,
      });
    } else {
      this.setState({
        showTenant: false,
      });
    }
    surfaceDS.loadData([]);
    surfacePurchaserDS.loadData([]);
    tenantDS.loadData([]);
    if (!isEmpty(data.deliverLines)) {
      data.deliverLines.forEach(element => {
        if (element.deliverType === deliverType.USER) {
          surfaceDS.create({ ...element, noEditor: true });
        } else if (element.deliverType === deliverType.AGENT) {
          surfacePurchaserDS.create({ ...element, noEditor: true });
        }
      });
    }
    if (!isEmpty(data.deliverTenants)) {
      data.deliverTenants.forEach(element => {
        tenantDS.create(element);
      });
    }
  }

  @Bind()
  openRelationModal(record) {
    const { dataRecord } = this.props;
    const relationDs = new DataSet(getRelationDs(record));
    const transferConditionDs = new DataSet(getTransferConditionDsDs(record));

    const transferConditionColumns = [
      {
        name: 'relationTableNameObj',
        editor: true,
      },
      {
        name: 'conditionTableColumnObj',
        editor: true,
      },
      {
        name: 'conditionOperator',
        renderer: () => <span>{intl.get(`spfm.docTransferDefin.model.view.equal`).d('等于')}</span>,
      },
      {
        name: 'conditionValue',
        editor: true,
      },
    ];

    const columns = [
      {
        name: 'tableColumnObj',
        editor: true,
      },
      {
        name: 'relationTableNameObj',
        editor: true,
      },
      {
        name: 'relationTableColumnObj',
        editor: true,
      },
    ];

    const initCreateObj = {
      docLineId: record.get('docLineId'),
      docHeaderId: record.get('docHeaderId'),
      dataRecord: dataRecord.get('docHeaderId'),
    };

    const { docDeliverTableRelationList } = record.toData();
    if (isArray(docDeliverTableRelationList)) {
      docDeliverTableRelationList.forEach(ele => {
        // relationDs.create(ele);
        if (ele.relationType === 'RELATED') {
          relationDs.create(ele);
        } else if (ele.relationType === 'CONDITION') {
          transferConditionDs.create(ele);
        }
      });
    }

    const DeleteBtn = observer(propsParam => {
      const { tabeDs } = propsParam;
      return (
        <Button
          color="primary"
          key="delete"
          funcType="flat"
          icon="delete"
          onClick={() => {
            this.hanldeTableDelete(tabeDs, 'conditionId', 'relation', record);
          }}
          disabled={tabeDs.selected?.length === 0}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });

    Modal.open({
      closable: true,
      keyboardClosable: true,
      style: {
        width: 650,
      },
      drawer: true,
      key: ModalKey,
      title: intl.get(`spfm.docTransferDefin.model.view.associatedTable`).d('关联子表'),
      children: (
        <div>
          <Card
            key="surfaceTable"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl
                  .get(`spfm.docTransferDefin.model.view.transferConditionRuleTable`)
                  .d('转交条件规则')}
                <Tooltip
                  title={intl
                    .get(`spfm.docTransferDefin.model.view.transferConditionRuleTable.help`)
                    .d('满足以下条件规则的数据可被转交')}
                >
                  <Icon style={{ position: 'relative', top: -3, left: 5 }} type="help_outline" />
                </Tooltip>
              </h3>
            }
          >
            <Table
              buttons={[
                <Button
                  key="create"
                  funcType="flat"
                  icon="add"
                  onClick={() => {
                    transferConditionDs.create(initCreateObj);
                  }}
                >
                  {intl.get('hzero.common.btn.add').d('新增')}
                </Button>,
                [<DeleteBtn tabeDs={transferConditionDs} />],
              ]}
              dataSet={transferConditionDs}
              columns={transferConditionColumns}
              pagination={false}
            />
          </Card>
          <Card
            key="surfaceTable"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>{intl.get(`spfm.docTransferDefin.model.view.relationTable`).d('子表维护')}</h3>
            }
          >
            <Table
              buttons={[
                <Button
                  key="create"
                  funcType="flat"
                  icon="add"
                  onClick={() => {
                    relationDs.create(initCreateObj);
                  }}
                >
                  {intl.get('hzero.common.btn.add').d('新增')}
                </Button>,
                [<DeleteBtn tabeDs={relationDs} />],
              ]}
              dataSet={relationDs}
              columns={columns}
              pagination={false}
            />
          </Card>
        </div>
      ),
      onOk: async () => {
        if ((await relationDs.validate()) && transferConditionDs.validate()) {
          let relationList = relationDs.toData();
          let transferConditionList = [];
          transferConditionDs.forEach(ele => {
            const data = ele.toData();
            const arr = relationList.filter(e => e.relationTableName === data.relationTableName);
            if (arr.length > 0) {
              data.tableColumn = arr[0].tableColumn;
              data.relationTableColumn = arr[0].relationTableColumn;
            } else {
              data.tableColumn = data.conditionTableColumn;
              data.relationTableColumn = data.conditionTableColumn;
            }
            transferConditionList.push(data);
          });
          transferConditionList = transferConditionList.map(e => {
            return {
              ...e,
              ...initCreateObj,
              relationType: 'CONDITION',
            };
          });
          relationList = relationList.map(e => {
            return {
              ...e,
              relationType: 'RELATED',
            };
          });
          record.set({
            docDeliverTableRelationList: [...transferConditionList, ...relationList],
          });
          // record.set({
          //   docDeliverTableRelationList: relationDs.toData(),
          // });
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  openConditionModal(record) {
    const { dataRecord } = this.props;
    const conditonDs = new DataSet(getConditonDs(record));

    const columns = [
      {
        name: 'deliverDimension',
        editor: true,
      },
      {
        name: 'tableColumnObj',
        editor: true,
      },
      {
        name: 'lovViewCodeObj',
        editor: true,
      },
    ];

    const initCreateObj = {
      docLineId: record.get('docLineId'),
      dataRecord: dataRecord.get('docHeaderId'),
    };

    const { docDeliverLineConditionList } = record.toData();
    if (isArray(docDeliverLineConditionList)) {
      docDeliverLineConditionList.forEach(ele => {
        conditonDs.create(ele);
      });
    }

    const DeleteBtn = observer(() => {
      return (
        <Button
          color="primary"
          key="delete"
          funcType="flat"
          icon="delete"
          onClick={() => {
            this.hanldeTableDelete(conditonDs, 'conditionId', 'condition', record);
          }}
          disabled={conditonDs.selected?.length === 0}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });

    Modal.open({
      closable: true,
      keyboardClosable: true,
      style: {
        width: 650,
      },
      key: ModalKey,
      children: (
        <Table
          buttons={[
            <Button
              key="create"
              funcType="flat"
              icon="add"
              onClick={() => {
                conditonDs.create(initCreateObj);
              }}
            >
              {intl.get('hzero.common.btn.add').d('新增')}
            </Button>,
            [<DeleteBtn />],
          ]}
          dataSet={conditonDs}
          columns={columns}
          pagination={false}
        />
      ),
      onOk: async () => {
        if (await conditonDs.validate()) {
          record.set({
            docDeliverLineConditionList: conditonDs.toData(),
          });
        } else {
          return false;
        }
      },
    });
  }

  @Bind()
  hanldeSurfaceDelete(record, dataSet) {
    // const { surfaceDS } = this.props;
    if (record.get('docLineId')) {
      deleteTransferSurface([record.toData()]).then(res => {
        if (getResponse(res)) {
          dataSet.remove(record);
          notification.success();
        }
      });
    } else {
      dataSet.remove(record);
    }
  }

  // 列表的删除
  @Bind()
  hanldeTableDelete(dataSet, primaryKey, type, surFaceLineRecord) {
    const records = dataSet.selected.filter(record => record.get(primaryKey));
    let deleteFunc = () => {};
    switch (type) {
      case 'tenant':
        deleteFunc = deleteTransferTenant;
        break;
      case 'relation':
        deleteFunc = deleteTransferRelation;
        break;
      case 'condition':
        deleteFunc = deleteTransferCondition;
        break;
      default:
        break;
    }

    dataSet.delete(dataSet.selected, {
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
      onOk: async () => {
        if (records.length) {
          const res = await deleteFunc(records.map(record => record.toData()));
          if (getResponse(res)) {
            notification.success();
            if (type === 'relation') {
              setTimeout(() => {
                surFaceLineRecord.init({
                  docDeliverTableRelationList: dataSet.toData(),
                });
              }, 500);
            }
            if (type === 'condition') {
              setTimeout(() => {
                surFaceLineRecord.init({
                  docDeliverLineConditionList: dataSet.toData(),
                });
              }, 500);
            }
          } else {
            return false;
          }
        }
      },
    });
  }

  @Bind()
  getColumns(ds) {
    const { dataRecord } = this.props;
    return [
      {
        name: 'tableSchema',
        width: 150,
        editor: record => {
          return !record.get('noEditor');
        },
      },
      {
        name: 'tableNameObj',
        width: 150,
        editor: record => {
          return !record.get('noEditor');
        },
      },
      {
        name: 'tableColumnObj',
        width: 150,
        editor: record => {
          return !record.get('noEditor');
        },
      },
      {
        name: 'tableColumnDesc',
        width: 120,
        editor: record => {
          return !record.get('noEditor');
        },
      },
      {
        name: 'tableMasterFlag',
        editor: record => {
          return !record.get('noEditor');
        },
        renderer: ({ record }) => {
          if (!record.get('noEditor')) {
            return null;
          } else {
            return yesOrNoRender(record.get('tableMasterFlag'));
          }
        },
      },
      {
        name: 'tableColumnDisplay',
        width: 150,
        editor: record => {
          return !record.get('noEditor') && !!record.get('tableMasterFlag');
        },
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => (
          <div className="action-link">
            {record.get('noEditor') === false ? (
              <a onClick={() => record.reset()}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : null}
            {!record.get('noEditor') ? (
              <>
                {!(
                  dataRecord.get('conditionalRuleFlag') === 1 &&
                  record.get('tableMasterFlag') === 1 &&
                  record.get('noEditor') === false
                ) && (
                  <Popconfirm
                    title={intl
                      .get(`spfm.docTransferDefin.model.view.confirmModal`)
                      .d('是否确认删除？')}
                    onConfirm={() => {
                      this.hanldeSurfaceDelete(record, ds);
                    }}
                  >
                    <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                  </Popconfirm>
                )}
                {dataRecord.get('conditionalRuleFlag') === 1 &&
                  record.get('tableMasterFlag') === 1 && (
                    <Dropdown
                      overlay={
                        <Menu>
                          {record.get('noEditor') === false && (
                            <Item>
                              <Popconfirm
                                title={intl
                                  .get(`spfm.docTransferDefin.model.view.confirmModal`)
                                  .d('是否确认删除？')}
                                onConfirm={() => {
                                  this.hanldeSurfaceDelete(record, ds);
                                }}
                              >
                                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                              </Popconfirm>
                            </Item>
                          )}
                          <Item>
                            <a
                              onClick={() => {
                                this.openRelationModal(record);
                              }}
                            >
                              {intl
                                .get(`spfm.docTransferDefin.model.view.associatedTable`)
                                .d('关联子表')}
                            </a>
                          </Item>
                          <Item>
                            <a
                              onClick={() => {
                                this.openConditionModal(record);
                              }}
                            >
                              {intl
                                .get(`spfm.docTransferDefin.model.view.conditionSetting`)
                                .d('条件设置')}
                            </a>
                          </Item>
                        </Menu>
                      }
                    >
                      <a>{intl.get('hzero.common.button.more').d('更多')}</a>
                    </Dropdown>
                  )}
              </>
            ) : (
              <>
                <a onClick={() => record.set('noEditor', false)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </>
            )}
          </div>
        ),
      },
    ];
  }

  render() {
    const { dataRecord, create, surfaceDS, surfacePurchaserDS, tenantDS, postWhereDS } = this.props;
    const { showTenant } = this.state;
    const surfaceColumns = this.getColumns(surfaceDS);
    const surfacePurchaserColumns = this.getColumns(surfacePurchaserDS);
    const tenantColumns = [
      {
        name: 'tenantObj',
        editor: record => {
          return record.status === 'add';
        },
      },
      {
        name: 'tenantName',
      },
    ];
    const postWhereColumns = [
      {
        name: 'tableNameObj',
        width: 240,
        editor: record => record.getState('editing') || record.status === 'add',
      },
      {
        name: 'condition',
        editor: record => record.getState('editing') || record.status === 'add',
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        lock: 'right',
        width: 150,
        renderer: ({ dataSet, record }) => {
          if (record.getState('editing')) {
            return (
              <Button
                funcType="link"
                onClick={() => {
                  record.setState('editing', false);
                  record.reset();
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            );
          }
          const actions = [];
          if (record.status !== 'add') {
            actions.push(
              <Button
                funcType="link"
                onClick={() => {
                  record.setState('editing', true);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            );
          }
          actions.push(
            <Button
              funcType="link"
              onClick={() => {
                dataSet.delete(record);
              }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          );
          return actions;
        },
      },
    ];

    const DeleteBtn = observer(() => {
      return (
        <Button
          color="primary"
          key="delete"
          funcType="flat"
          icon="delete"
          onClick={() => {
            this.hanldeTableDelete(tenantDS, 'docTenantId', 'tenant');
          }}
          disabled={tenantDS.selected?.length === 0}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });

    return (
      <React.Fragment>
        <Form record={dataRecord} labelWidth={120}>
          <TextField name="docCode" disabled={!create} />
          <IntlField name="docName" />
          <Select
            name="docLevel"
            onChange={val => {
              this.setState({ showTenant: val === 'TENANT' });
            }}
          />
          <TextField name="orderSeq" />
          <IntlField name="description" />
          <Switch name="conditionalRuleFlag" />
          <Switch name="enabledFlag" />
          <NumberField name="deliverMaxCount" />
        </Form>
        <Card
          key="surfaceTable"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={
            <h3>{intl.get(`spfm.docTransferDefin.model.view.surfaceTable`).d('相关表维护')}</h3>
          }
        >
          <Tabs>
            <TabPane
              key="subAccount"
              tab={intl.get('spfm.docTransferDefin.view.title.subAccount').d('子账户')}
            >
              <Table
                buttons={['add']}
                dataSet={surfaceDS}
                columns={surfaceColumns}
                pagination={false}
              />
            </TabPane>
            <TabPane
              key="purchaser"
              tab={intl.get('spfm.docTransferDefin.view.title.purchaser').d('采购员')}
            >
              <Table
                buttons={['add']}
                dataSet={surfacePurchaserDS}
                columns={surfacePurchaserColumns}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        </Card>
        <Card
          key="postWhere"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={
            <h3>
              {intl.get(`spfm.docTransferDefin.model.view.postWhere`).d('转交逻辑配置')}
              <Tooltip
                title={intl
                  .get(`spfm.docTransferDefin.model.view.postWhere.help`)
                  .d('转交操作增加埋点')}
              >
                <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
              </Tooltip>
            </h3>
          }
        >
          <Table
            buttons={['add']}
            dataSet={postWhereDS}
            columns={postWhereColumns}
            pagination={false}
          />
        </Card>
        {showTenant ? (
          <Card
            key="tenantTable"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>{intl.get(`spfm.docTransferDefin.model.view.tenantTable`).d('租户维护')}</h3>
            }
          >
            <Table
              buttons={['add', [<DeleteBtn />]]}
              dataSet={tenantDS}
              columns={tenantColumns}
              pagination={false}
            />
          </Card>
        ) : null}
      </React.Fragment>
    );
  }
}
