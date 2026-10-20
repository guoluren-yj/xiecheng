/**
 * index.js
 * 单据流节点定义列表
 * @date: 2021-08-23
 * @author: yukbiu <yubiao.qiu@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Header, Content } from 'components/Page';
import {
  Form,
  TextField,
  DataSet,
  Button,
  Modal,
  IntlField,
  Lov,
  Switch,
} from 'choerodon-ui/pro';
// import { isEmpty } from 'lodash';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { importNewNodeSer, delDocFlowDefinition } from '@/services/docFlowDefinitionService';
import getTableDs from './store/docFlowDefinitionDs';
import { getNodeDs, getNodeTableRelListDs } from './store/newNodeDs';
import NewNode from './component/NewNode';

const tenantFlag = isTenantRoleLevel();

@formatterCollections({
  code: ['sdps.docFlowDefinition', 'sdps.newNode', 'spfm.statusPhaseMapping'],
})
export default class DocFlowDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTenantId: '0',
      currentTenantNum: 'SRM',
    };
    this.docFlowDefinitionDs = new DataSet(getTableDs());
    this.nodeDs = new DataSet(getNodeDs());
    this.nodeTableRelListDs = new DataSet(getNodeTableRelListDs());
  }

  componentDidMount() {
    this.docFlowDefinitionDs.setQueryParameter('tenantId', this.state.currentTenantId);
    this.docFlowDefinitionDs.query();
  }

  /**
   * 编辑单据流节点定义
   */
  @Bind()
  handleTenantEdit = (record) => {
    Modal.open({
      closable: true,
      drawer: true,
      style: {
        width: 650,
      },
      key: Modal.key(),
      title: intl.get('sdps.docFlowDefinition.view.header.edit').d('编辑单据流节点定义'),
      children: (
        <div>
          <Form record={record}>
            <TextField name="code" disabled />
            <IntlField name="name" />
            <Switch name="linkCheckFlag" />
          </Form>
        </div>
      ),
      onOk: () => this.docFlowDefinitionDs.submit(),
      onCancel: () => {
        if (record.dirty) {
          this.docFlowDefinitionDs.reset(record);
        }
      },
    });
  };

  @Bind()
  handleNodeDetails = (record, editor) => {
    const { currentTenantNum, currentTenantId } = this.state;
    const goToDetails = tenantFlag ? 'node-definition-org' : 'node-definition';
    const { nodeId } = record.toData();
    this.props.history.push(`/spfm/setting/${goToDetails}/edit/${nodeId}?editor=${editor}&currentTenantNum=${currentTenantNum}&currentTenantId=${currentTenantId}`);
  };

  @Bind()
  handleDelete = (record) => {
    const data = record.toData();
    Modal.open({
      border: false,
      children: (
        <span>
          {intl.get('sdps.docFlowDefinition.view.message.deleteConfirm').d('确认删除选择行？')}
        </span>
      ),
      onOk: () => {
        delDocFlowDefinition(data).then((res) => {
          if (getResponse(res)) {
            notification.success();
            this.docFlowDefinitionDs.query();
          }
        });
      },
    });
  };

  @Bind()
  handleNew = () => {
    const { currentTenantNum, currentTenantId } = this.state;
    const goToDetails = tenantFlag ? 'node-definition-org' : 'node-definition';
    this.props.history.push(`/spfm/setting/${goToDetails}/edit/create_node?editor=1&currentTenantId=${currentTenantId}`);
    // Modal.open({
    //   drawer: true,
    //   style: { width: 900 },
    //   title: intl.get('sdps.newNode.model.view.createNode').d('新建节点'),
    //   border: false,
    //   children: (
    //     <NewNode
    //       tenantId={this.state.currentTenantId}
    //       nodeTableRelListDs={this.nodeTableRelListDs}
    //       nodeDs={this.nodeDs}
    //     />
    //   ),
    //   onOk: () => this.submitNode(),
    //   onClose: () => {
    //     this.nodeTableRelListDs.loadData([]);
    //     this.nodeDs.reset();
    //     this.docFlowDefinitionDs.query();
    //   },
    // });
  };

  @Bind()
  handleEdit = (record) => {
    const onlyShow = this.state.currentTenantNum === 'SRM';
    Modal.open({
      drawer: true,
      style: { width: 900 },
      title: intl.get('sdps.newNode.model.view.editNode').d('编辑节点'),
      border: false,
      children: (
        <NewNode
          onlyShow={onlyShow}
          record={record}
          tenantId={this.state.currentTenantId}
          nodeTableRelListDs={this.nodeTableRelListDs}
          nodeDs={this.nodeDs}
        />
      ),
      onOk: () => this.submitNode(),
      onClose: () => {
        this.nodeTableRelListDs.loadData([]);
        this.nodeDs.reset();
        this.docFlowDefinitionDs.query();
      },
    });
  };

  submitNode = () => {
    if (this.nodeTableRelListDs.records.length > 0) {
      this.nodeTableRelListDs.validate().then((res) => {
        if (res) {
          const tableData = this.nodeTableRelListDs.toData();
          this.nodeDs.current.set('nodeTableRelList', tableData);
          this.nodeDs.validate().then(async (nodeDsRes) => {
            if (nodeDsRes) {
              this.nodeDs.current.set('tenantId', this.state.currentTenantId);
              const resp = await this.nodeDs.submit();
              if (getResponse(resp)) {
                const nodeTableRelList = this.nodeDs.current.get('nodeTableRelList');
                this.nodeTableRelListDs.loadData(nodeTableRelList);
              }
            }
          });
        }
      });
    } else {
      notification.warning({
        message: intl.get('sdps.newNode.modal.submit.toMore').d('业务实体表中表数量大于0'),
      });
    }
    return false;
  };

  @Bind()
  handleImportCode = () => {
    importNewNodeSer({ tenantId: this.state.currentTenantId }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.docFlowDefinitionDs.query();
      }
    });
  };

  handleTenantId = () => {
    const currentObj = this.ds.current.toData();
    if (currentObj.tenantObj) {
      this.setState({ currentTenantId: currentObj.tenantId });
      this.setState({ currentTenantNum: currentObj.tenantNum });
      this.docFlowDefinitionDs.setQueryParameter('tenantId', currentObj.tenantId);
      this.docFlowDefinitionDs.query();
    } else {
      this.setState({ currentTenantId: '0' });
      this.setState({ currentTenantNum: 'SRM' });
      this.docFlowDefinitionDs.setQueryParameter('tenantId', '0');
      this.docFlowDefinitionDs.query();
    }
  };

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'tenantObj',
        type: 'object',
        TextField: 'tableName',
        valueField: 'tenantId',
        label: intl.get('sdps.docFlowDefinition.model.head.tenantObj').d('选择租户'),
        lovCode: 'HPFM.TENANT',
        ignore: 'always',
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantObj.tenantName',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantObj.tenantId',
      },
      {
        name: 'tenantNum',
        type: 'string',
        bind: 'tenantObj.tenantNum',
      },
    ],
  });

  get Columns() {
    if (tenantFlag) {
      return [
        {
          name: 'code',
          width: 500,
          renderer: ({value, record }) => (
            <span className="code-link">
              <a onClick={() => this.handleNodeDetails(record, '0')}>{value}</a>
            </span>
          ),
        },
        { name: 'name' },
        {
          header: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          renderer: ({ record }) => (
            <span className="action-link">
              <Button
                color='primary'
                funcType='link'
                // onClick={() => this.handleTenantEdit(record)}
                onClick={() =>  this.handleNodeDetails(record, '1')}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            </span>
          ),
        },
      ];
    } else {
      return [
        {
          name: 'code',
          width: 500,
          renderer: ({value, record }) =>
            this.state.currentTenantNum === 'SRM' ? (
              <span className="code-link">
                <a onClick={() => this.handleNodeDetails(record, '0')}>{value || ''}</a>
              </span>
            ) : (
              <span>{record.get('code')}</span>
            ),
        },
        { name: 'name' },
        {
          header: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          renderer: ({ record }) => (
            <span className="action-link">
              <Button
                color='primary'
                funcType='link'
                // onClick={() => this.handleTenantEdit(record)}
                onClick={() =>  this.handleNodeDetails(record, '1')}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            </span>
          ),
          // renderer: ({ record }) => (
          //   <span className="action-link">
          //     <Button
          //       color='primary'
          //       funcType='link'
          //       onClick={() => this.handleEdit(record)}
          //     >
          //       {intl.get('hzero.common.button.edit').d('编辑')}
          //     </Button>
          //     {this.state.currentTenantNum === 'SRM' ? (
          //       ''
          //     ) : (
          //       <Button
          //       color='primary'
          //       funcType='link'
          //       onClick={() => this.handleDelete(record)}
          //     >
          //       {intl.get('hzero.common.button.delete').d('删除')}
          //     </Button>
          //     )}
          //   </span>
          // ),
        },
      ];
    }
  }

  btnsCmp = () => {
    if (tenantFlag || this.state.currentTenantNum !== 'SRM') {
      if (tenantFlag) {
        return (
          <Button
                key="reference"
                type="c7n-pro"
                icon="filter_none"
                color= "primary"
                onClick={() => this.handleImportCode()}
                >
                  {intl.get('sdps.docFlowDefinition.view.import.newCode').d('引入平台级定义节点')}
          </Button>
        );
      } else {
        return (
          <Button
                key="reference"
                type="c7n-pro"
                icon="filter_none"
                funcType="flat"
                onClick={() => this.handleImportCode()}
                >
                  {intl.get('sdps.docFlowDefinition.view.import.newCode').d('引入平台级定义节点')}
          </Button>
        );
      }
    }
  }


  render() {
    return (
      <React.Fragment>
        <Header title={intl.get('sdps.docFlowDefinition.view.header.title').d('单据流节点定义')}>
          {tenantFlag ? (
            this.btnsCmp()
          ) : (
            <>
              <Button icon="add" color="primary" onClick={() => this.handleNew()}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              {this.btnsCmp()}
              <Lov
                dataSet={this.ds}
                name="tenantObj"
                placeholder={intl.get('hzero.common.view.tenantSelect.title').d('选择租户')}
                onChange={() => this.handleTenantId()}
              />
            </>
          )}
        </Header>
        <Content>
          <div style={{ height: 'calc(100vh - 185px)' }}>
              <FilterBarTable
                boxSizing='wrapper'
                // buttons={buttons}
                columns={this.Columns}
                key="docFlowDefinitionTable"
                dataSet={this.docFlowDefinitionDs}
                style={{ maxHeight: `calc(100% - 22px)` }}
                customizable
                customizedCode="new-workbench"
                filterBarConfig={{
                  expandable: true,
                  collpaseble: false,
                  defaultCollpase: true,
                  expand: true,
                  fields: [
                    {
                      name: 'code',
                      type: 'string',
                      label: intl.get('sdps.docFlowDefinition.model.view.nodeId').d('节点编码'),
                      display: true,
                      merge: true,
                    },
                    {
                      name: 'name',
                      type: 'string',
                      display: true,
                      label: intl.get('sdps.docFlowDefinition.model.view.name').d('节点描述'),
                    },
                  ],
                }}
              />
            </div>
        </Content>
      </React.Fragment>
    );
  }
}
