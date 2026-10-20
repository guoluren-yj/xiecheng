import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { Table, DataSet, Modal, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, setSession } from 'utils/utils';
import notification from 'utils/notification';
import { closeAndPush } from '@/utils/utils';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import { getConfigDataDSProps } from './deployInfoDS.js';
import { dataConfigEnable } from '../../services/deployInfoService';
import GroupIdPage from './groupIdPage.js';
import ObjectCodePage from './objectCodePage.js';
export const DETAIL_SESSION_KEY = 'deploy-dist-detail';

@formatterCollections({
  code: ['hpdm.deploy-info'],
})
@observer
class ConfigData extends Component {
  constructor(props) {
    super(props);
    const { deployInfoId } = props.match.params;
    this.configDataDS = new DataSet(getConfigDataDSProps({ deployInfoId }));
  }

  deleteOperation() {
    if (this.configDataDS.selected.length > 0) {
      this.configDataDS.delete(this.configDataDS.selected).then(() => {
        this.configDataDS.query();
      });
    } else {
      notification.info({
        message: intl.get(`hpdm.deploy-info.delete.selected`).d('请至少选择一条记录进行删除'),
      });
    }
  }

  async enableHandler(record) {
    const res = getResponse(await dataConfigEnable(record.toData()));
    if (res && !res.failed) {
      this.configDataDS.query();
      notification.success();
    }
  }

  @Bind()
  handleGroupId() {
    Modal.open({
      key: 'group_id_1',
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
        top: 10,
      },
      children: (
        <GroupIdPage
          onRef={(ref) => {
            this.groupIdPageRef = ref;
          }}
        />
      ),
      onOk: () => {
        if (this.groupIdPageRef.groupIdDS.selected.length > 0) {
          this.configDataDS.queryDataSet.current.set(
            'groupId',
            this.groupIdPageRef.groupIdDS.selected[0].get('groupId')
          );
        } else {
          notification.info({
            message: intl.get(`hpdm.data-distribute.select.one`).d('请选择一条记录'),
          });
          return false;
        }
      },
    });
  }

  @Bind()
  handleObjectCode() {
    Modal.open({
      key: 'object_code_1',
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
        top: 10,
      },
      children: (
        <ObjectCodePage
          onRef={(ref) => {
            this.objectCodePageRef = ref;
          }}
        />
      ),
      onOk: () => {
        if (this.objectCodePageRef.objectCodeDS.selected.length > 0) {
          this.configDataDS.queryDataSet.current.set(
            'objectName',
            this.objectCodePageRef.objectCodeDS.selected[0].get('objectName')
          );
          this.configDataDS.queryDataSet.current.set(
            'objectCode',
            this.objectCodePageRef.objectCodeDS.selected[0].get('objectCode')
          );
        } else {
          notification.info({
            message: intl.get(`hpdm.data-distribute.select.one`).d('请选择一条记录'),
          });
          return false;
        }
      },
    });
  }

  openDetail(record) {
    const { deployInfoId } = this.props.match.params;
    const deployDistId = record.get('deployDistId');
    setSession(`${DETAIL_SESSION_KEY}-${deployDistId}`, record.toData().dataMigrateFieldList);
    closeAndPush('/srdm/data/distribute/detail/', {
      title: `配置数据迁移发版-明细-${deployDistId}`,
      key: `/srdm/deploy-dist/${deployInfoId}/${deployDistId}`,
      path: `/srdm/deploy-dist/${deployInfoId}/${deployDistId}`,
      icon: 'detail',
      closable: true,
    });
  }

  getColumns() {
    return [
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'objectName',
        lock: 'left',
        type: 'string',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 200,
        name: 'tableName',
        lock: 'left',
        type: 'string',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 300,
        name: 'displayFieldValue',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 200,
        name: 'displayFieldDesc',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 200,
        name: 'updateDateValue',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'idValue',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 200,
        name: 'uniqueValue',
      },
      {
        hideable: true,
        titleEditable: true,
        width: 300,
        tooltip: 'always',
        name: 'groupId',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'field1',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[0]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[0]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'field2',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[1]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[1]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'field3',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[2]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[2]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'field4',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[3]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[3]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        width: 150,
        name: 'field5',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[4]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[4]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'field6',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[5]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[5]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'field7',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[6]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[6]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'field8',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[7]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[7]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'field9',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[8]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[8]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'field10',
        renderer: ({ record }) => {
          return [
            <div>
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[9]?.fieldName
                : null}
              :
              {record.get('dataMigrateFieldList')
                ? record.get('dataMigrateFieldList')[9]?.fieldValue
                : null}
            </div>,
          ];
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'deployInfos',
      },

      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'environmentCode',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'sourceTenantNum',
      },
      {
        tooltip: 'always',
        name: 'migrateType',
      },
      {
        tooltip: 'always',
        name: 'testMigrateBehaviour',
      },
      {
        tooltip: 'always',
        name: 'prodMigrateBehaviour',
      },
      {
        header: '操作',
        lock: 'right',
        command: ({ record }) => {
          return [<a onClick={() => this.openDetail(record)}>明细</a>];
        },
      },
      // {
      //   header: intl.get('hpdm.deploy-info.title.operation').d('操作'),
      //   width: 120,
      //   lock: 'right',
      //   command: ({ record }) => {
      //     const btns = [];
      //     btns.push(
      //       Number(record.get('distEnabledFlag')) === 0 ? (
      //         <a onClick={() => this.enableHandler(record)} style={{ marginRight: '0.1rem' }}>
      //           {intl.get('hpdm.deploy-info.operation.enable').d('启用')}
      //         </a>
      //       ) : (
      //         <a onClick={() => this.enableHandler(record)} style={{ marginRight: '0.1rem' }}>
      //           {intl.get('hpdm.deploy-info.operation.disable').d('禁用')}
      //         </a>
      //       )
      //     );
      //     return btns;
      //   },
      // },
    ];
  }

  render() {
    return (
      <>
        <Header
          data-hcg_flag="Header_ae0e0"
          title={intl.get('hpdm.deploy-info.operation.data-config').d('配置数据')}
          backPath="/srdm/deploy-info"
        />
        <Content>
          <Table
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar="professionalBar"
            columnResizable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_85954"
            border
            columns={this.getColumns()}
            // buttons={[
            //   <Button
            //     onClick={() => this.deleteOperation()}
            //     newLine={false}
            //     color="default"
            //     funcType="raised"
            //     disabled={false}
            //   >
            //     {intl.get('hpdm.deploy-info.button.delete').d('删除')}
            //   </Button>,
            // ]}
            queryFields={{
              groupId: (
                <TextField
                  readOnly
                  name="groupId"
                  suffix={
                    <Icon
                      type="close"
                      onClick={() => {
                        this.configDataDS.queryDataSet.current.set('groupId', null);
                      }}
                    />
                  }
                  addonAfter={<Icon type="search" onClick={() => this.handleGroupId()} />}
                  addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
                />
              ),
              objectName: (
                <TextField
                  readOnly
                  name="objectName"
                  suffix={
                    <Icon
                      type="close"
                      onClick={() => {
                        this.configDataDS.queryDataSet.current.set('objectName', null);
                        this.configDataDS.queryDataSet.current.set('objectCode', null);
                      }}
                    />
                  }
                  addonAfter={<Icon type="search" onClick={() => this.handleObjectCode()} />}
                  addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
                />
              ),
            }}
            dataSet={this.configDataDS}
          />
        </Content>
      </>
    );
  }
}

export default ConfigData;
