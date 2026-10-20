import { Header, Content } from 'components/Page';
import {
  Form,
  Button,
  Table,
  DataSet,
  Modal,
  TextField,
  SelectBox,
  Lov,
  DateTimePicker,
  Select,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { getEditorByField } from 'choerodon-ui/pro/lib/table/utils';
import React from 'react';
import Component from '@htd/helper/lib/components/base-component';
import { isFunction, isObject } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import ComponentEnhanceWrapperHoc from '@htd/helper/lib/decorators/props-extension-hoc';
import { observer } from 'mobx-react';
import moment from 'moment';
import { closeAndPush } from '@/utils/utils';
import notification from 'utils/notification';
import request from 'utils/request';
import { setSession } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { initComponent, componentDidMount } from './pageLogic.js';
import { configRule, distributeDSConfig, deployDSConfig } from './extensionRule.js';
import getDistributeDSProps from './distributeDS.js';
import getDeployDSProps from './deployDS.js';
import style from './style.module.less';
import GroupIdPage from './groupIdPage.js';
import ObjectCodePage from './objectCodePage.js';
import DeployInfosPage from './deployInfosPage.js';

export const DETAIL_SESSION_KEY = 'data-distribute-detail';

const { Option } = Select;

@formatterCollections({ code: ['hpdm.data-distribute', 'srdm.data-distribute'] })
@observer
@ComponentEnhanceWrapperHoc(configRule)
class Page extends Component {
  constructor(props) {
    super(props);
    this.setDs(
      'distributeDS',
      new DataSet(distributeDSConfig.bind(this)(getDistributeDSProps.bind(this)({})))
    );
    this.setDs('deployDS', new DataSet(deployDSConfig.bind(this)(getDeployDSProps.bind(this)({}))));
    initComponent.bind(this)();
  }

  componentDidMount() {
    componentDidMount.bind(this)();
  }

  getScanDs() {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          type: 'object',
          name: 'scanObject',
          lovCode: 'SRDM.CONFIG_OBJECT',
          valueField: 'objectId',
          label: intl.get('hpdm.data-distribute.model.objectCode').d('配置对象'),
          required: true,
          ignore: 'always',
        },
        {
          type: 'number',
          name: 'objectId',
          bind: 'scanObject.objectId',
        },
        {
          type: 'string',
          name: 'cloudType',
          label: intl.get('srdm.data-distribute.model.cloudType').d('扫描条件'),
          defaultValue: 'MULTI_CLOUD',
        },
        {
          type: 'string',
          name: 'tenantNum',
          lookupCode: 'SRDM.MULTI_CLOUD_TENANT',
          label: intl.get('srdm.data-distribute.model.tenantNum').d('租户编码'),
        },
        {
          type: 'date',
          name: 'from',
          label: intl.get('hzero.common.date.release.startTime').d('开始时间'),
          defaultValue: moment().startOf('date'),
        },
        {
          type: 'date',
          name: 'to',
          label: intl.get('hzero.common.date.release.endTime').d('结束时间'),
          defaultValue: moment().endOf('date'),
        },
      ],
      transport: {
        create: ({ data = [] }) => {
          return {
            url: '/srdm/v1/data-migrate-recs/test/scan',
            method: 'post',
            data: data[0],
          };
        },
      },
      feedback: {
        submitSuccess: ({ content }) => {
          notification.success({
            message: content && content[0] && content[0].message,
          });
        },
      },
    });
  }

  @Bind()
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
        name: 'recType',
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
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'cacheFlag',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'processStatus',
        renderer: ({ record }) => {
          if (record.get('recType') === 'COLLECT') {
            return null;
          } else {
            return (
              <div>
                {
                  record.getField('processStatus').getLookupData(record.get('processStatus'))
                    .meaning
                }
              </div>
            );
          }
        },
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'processMessage',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'creationDate',
      },
      {
        hideable: true,
        titleEditable: true,
        tooltip: 'always',
        name: 'processDate',
      },
      {
        header: '操作',
        lock: 'right',
        command: ({ record }) => {
          const btns = [];
          btns.push(
            <a onClick={() => this.detailHandle(record)} style={{ marginRight: '0.1rem' }}>
              {intl.get('hpdm.data-distribute.operation.detail').d('明细')}
            </a>
          );
          return btns;
        },
      },
    ];
  }

  detailHandle(record) {
    const recId = record.get('recId');
    setSession(`${DETAIL_SESSION_KEY}-${recId}`, record.toData().dataMigrateFieldList);
    closeAndPush('/srdm/data/distribute/detail/', {
      title: `配置数据迁移测试-明细-${recId}`,
      key: `/srdm/data/distribute/detail/${recId}`,
      path: `/srdm/data/distribute/detail/${recId}`,
      icon: 'detail',
      closable: true,
    });
  }

  deleteOperation() {
    if (this.getDs('distributeDS').selected.length > 0) {
      this.getDs('distributeDS')
        .delete(this.getDs('distributeDS').selected)
        .then(() => {
          this.getDs('distributeDS').query();
        });
    } else {
      notification.info({
        message: intl.get(`hpdm.data-distribute.delete.selected`).d('请至少选择一条记录进行删除'),
      });
    }
  }

  distributeScan = () => {
    const dataSet = this.getScanDs();
    Modal.open({
      title: intl.get('hpdm.data-distribute.button.scan').d('扫描数据测试'),
      children: (
        <Form dataSet={dataSet}>
          <Lov name="scanObject" />
          <SelectBox name="cloudType">
            <Option value="MULTI_CLOUD">
              {intl.get('srdm.data-distribute.model.multi.cloud').d('多云')}
            </Option>
            <Option value="PUBLIC_CLOUD">
              {intl.get('srdm.data-distribute.model.public.cloud').d('公有云')}
            </Option>
          </SelectBox>
          <Select name="tenantNum" />
          <DateTimePicker name="from" />
          <DateTimePicker name="to" />
        </Form>
      ),
      onOk: async () => {
        const res = (await dataSet.submit()) || {};
        return !res.failed;
      },
    });
  };

  distributeMove = () => {
    Modal.open({
      title: intl.get('hpdm.data-distribute.button.move').d('迁移测试'),
      children: (
        <div>
          <p>
            {intl.get('srdm.data-distribute.modal.move.to').d('迁移到')}:{' '}
            {intl
              .get('srdm.data-distribute.modal.move.ip')
              .d(
                '10.2.120.217:3306/srm 数据库, 请申请 uvpn后访问, 注意: 扫描后将清除该配置对象的历史扫描记录'
              )}
          </p>
          <p>
            {intl.get('srdm.data-distribute.model.common.username').d('用户名')}:{' '}
            {intl.get('srdm.data-distribute.model.state.username').d('seed')}
          </p>
          <p>
            {intl.get('srdm.data-distribute.model.common.password').d('')}:{' '}
            {intl.get('srdm.data-distribute.model.state.password').d('seed2022')}
          </p>
        </div>
      ),
      onOk: () => {
        const { selected } = this.getDs('distributeDS');
        if (selected.length) {
          request(`/srdm/v1/data-migrate-recs/test/import`, {
            method: 'POST',
            body: { recIds: selected.map((item) => item.get('recId')) },
          }).then((res) => {
            if (res.failed) {
              notification.error({
                message: <div style={{ maxHeight: 300, overflowY: 'auto' }}>{res.message}</div>,
              });
            } else {
              notification.success({ message: res.message });
              this.getDs('distributeDS').unSelectAll();
            }
          });
        }
      },
    });
  };

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
          this.queryDataSet.current.set(
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
          this.queryDataSet.current.set(
            'objectName',
            this.objectCodePageRef.objectCodeDS.selected[0].get('objectName')
          );
          this.queryDataSet.current.set(
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

  @Bind()
  handleDeployInfos() {
    Modal.open({
      key: 'deploy_Infos_1',
      destroyOnClose: true,
      closable: true,
      style: {
        width: 800,
        top: 10,
      },
      children: (
        <DeployInfosPage
          onRef={(ref) => {
            this.deployInfosPageRef = ref;
          }}
        />
      ),
      onOk: () => {
        if (this.deployInfosPageRef.deployInfosDS.selected.length > 0) {
          this.queryDataSet.current.set(
            'deployInfos',
            this.deployInfosPageRef.deployInfosDS.selected[0].get('deployNum')
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

  @Bind
  renderBar(props) {
    const QueryBar = (arg) => {
      const { dataSet, queryFieldsLimit = 3 } = arg;
      this.queryDataSet = dataSet?.queryDataSet;
      const queryDataSet = dataSet?.queryDataSet;
      const queryFields = React.useMemo(() => {
        const result = [];
        if (queryDataSet) {
          const { fields } = queryDataSet;
          return [...fields.entries()].reduce((list, [name, field]) => {
            if (!field.get('bind') && !name.includes('__tls')) {
              const fieldProps = {
                key: name,
                name,
                dataSet: queryDataSet,
              };
              const element = arg.queryFields?.[name];
              list.push(
                React.isValidElement(element)
                  ? React.cloneElement(element, fieldProps)
                  : React.cloneElement(getEditorByField(field, false, false), {
                      ...fieldProps,
                      ...(isObject(element) ? element : {}),
                    })
              );
            }
            return list;
          }, result);
        }
        return result;
      }, [queryDataSet]);

      const [moreFields, setMoreFields] = React.useState([]);

      const createFields = (elements) => {
        return elements.map((element) => {
          if (element.key === 'groupId') {
            return (
              <TextField
                readOnly
                name="groupId"
                suffix={
                  <Icon
                    type="close"
                    onClick={() => {
                      this.queryDataSet.current.set('groupId', null);
                    }}
                  />
                }
                addonAfter={<Icon type="search" onClick={() => this.handleGroupId()} />}
                addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
              />
            );
          } else if (element.key === 'objectName') {
            return (
              <TextField
                readOnly
                name="objectName"
                suffix={
                  <Icon
                    type="close"
                    onClick={() => {
                      this.queryDataSet.current.set('objectName', null);
                      this.queryDataSet.current.set('objectCode', null);
                    }}
                  />
                }
                addonAfter={<Icon type="search" onClick={() => this.handleObjectCode()} />}
                addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
              />
            );
          } else if (element.key === 'deployInfos') {
            return (
              <TextField
                readOnly
                name="deployInfos"
                suffix={
                  <Icon
                    type="close"
                    onClick={() => {
                      this.queryDataSet.current.set('deployInfos', null);
                    }}
                  />
                }
                addonAfter={<Icon type="search" onClick={() => this.handleDeployInfos()} />}
                addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
              />
            );
          }
          const { onEnterDown } = element.props;
          if (onEnterDown && isFunction(onEnterDown)) {
            return element;
          }
          const eleProps = {
            onEnterDown: handleQuery,
          };
          return React.cloneElement(element, eleProps);
        });
      };

      const handleQuery = async () => {
        if (await queryDataSet?.validate()) {
          dataSet.query();
        }
      };

      const handleQueryReset = () => {
        if (queryDataSet) {
          const { current } = queryDataSet;
          if (current) {
            current.reset();
          }
          handleQuery();
        }
      };

      const openMore = (fields) => {
        if (moreFields && moreFields.length) {
          setMoreFields([]);
        } else {
          setMoreFields(fields);
        }
        return moreFields;
      };

      const getMoreFieldsButton = (fields) => {
        if (fields.length) {
          return (
            <Button funcType="raised" onClick={() => openMore(fields)}>
              {intl.get('hzero.common.button.more').d('更多')}
              {moreFields && moreFields.length ? (
                <Icon type="expand_less" />
              ) : (
                <Icon type="expand_more" />
              )}
            </Button>
          );
        }
      };

      return (
        <>
          <div key="query_bar" className={style['query-bar']}>
            <Form dataSet={queryDataSet} columns={queryFieldsLimit} labelLayout="horizontal">
              {createFields(queryFields.slice(0, queryFieldsLimit))}
              {createFields(queryFields.slice(queryFieldsLimit, queryFieldsLimit * 2))}
              {createFields(moreFields)}
            </Form>
            <span className={style['query-bar-btn']}>
              {getMoreFieldsButton(createFields(queryFields.slice(queryFieldsLimit * 2)))}
              <Button key="lov_reset_btn" funcType="raised" onClick={handleQueryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button color="primary" wait={500} onClick={() => handleQuery()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </span>
          </div>
        </>
      );
    };
    return <QueryBar {...props} />;
  }

  render() {
    return (
      <>
        <Header data-hcg_flag="Header_381df" title="配置数据迁移测试">
          <Button onClick={this.distributeScan} color="primary">
            {intl.get('hpdm.data-distribute.button.scan').d('扫描数据测试')}
          </Button>
          <Button
            onClick={this.distributeMove}
            color="primary"
            disabled={!this.getDs('distributeDS').selected.length}
          >
            {intl.get('hpdm.data-distribute.button.move').d('迁移测试')}
          </Button>
        </Header>
        <Content data-hcg_flag="Content_fc097">
          <Table
            data-hcg_flag="Table_13b89"
            rowNumber={false}
            queryFieldsLimit={3}
            queryBar={(props) => this.renderBar(props)}
            columnResizable
            columnHideable
            columnTitleEditable
            columnDraggable
            editMode="cell"
            customizable={false}
            customizedCode="Table_13b89"
            border
            columns={this.getColumns()}
            buttons={[]}
            dataSet={this.getDs('distributeDS')}
            showAllPageSelectionButton
            pagination={{
              pageSizeOptions: ['10', '20', '50', '200'],
            }}
          />
        </Content>
      </>
    );
  }
}

export default Page;
