import React from 'react';
import {
  Form,
  TextField,
  TextArea,
  Output,
  Modal,
  Switch,
  Button,
  Table,
  Tooltip,
  IntlField,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content } from 'components/Page';
import styles from './index.less';

@formatterCollections({
  code: ['sdps.newNode'],
})
export default class NewNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onlyShow: this.props.onlyShow,
    };
    this.nodeDs = this.props.nodeDs;
    this.nodeTableRelListDs = this.props.nodeTableRelListDs;
  }

  reUploadRef = React.createRef();

  componentDidMount() {
    const { nodeId } = this.props.record ? this.props.record.toData() : { nodeId: 'new' };
    if (nodeId === 'new') {
      this.nodeDs.create({}, 0);
    } else {
      this.nodeDs.setQueryParameter('nodeId', nodeId);
      this.nodeDs.setQueryParameter('tenantId', this.props.tenantId);
      this.nodeDs.query().then((res) => {
        if (res) {
          const nodeTableRelList = this.nodeDs.current.get('nodeTableRelList');
          this.nodeTableRelListDs.loadData(nodeTableRelList);
        }
      });
    }
  }

  addTrueTableRecord = () => {
    if (this.nodeTableRelListDs.records.length < 4) {
      const record = this.nodeTableRelListDs.create({}, 0);
      record.setState('editing', true);
    } else {
      notification.warning({
        message: intl.get('sdps.newNode.modal.submit.toFew').d('业务实体表中表数量小于5'),
      });
    }
  };

  deleteTrueTableRecord = (record) => {
    if (!isEmpty(record.get('NodeTable'))) {
      Modal.confirm({
        style: { width: 500 },
        title: intl.get('sdps.newNode.view.message.delete').d('确认删除？'),
        onOk: () => {
          // eslint-disable-next-line
          record.status = 'add';
          this.nodeTableRelListDs.remove(record);
        },
      });
    } else {
      this.nodeTableRelListDs.remove(record);
    }
  };

  render() {
    const columns = [
      {
        name: 'NodeTable',
        editor: !this.state.onlyShow,
      },
      {
        name: 'mainTableFlag',
        width: 180,
        editor: !this.state.onlyShow,
      },
      {
        name: 'action',
        width: 100,
        renderer: ({ record }) => (
          <>
            <span className="action-link">
              <a onClick={() => this.deleteTrueTableRecord(record)} disabled={this.state.onlyShow}>
                {intl.get('hzero.common.button.toDelete').d('删除')}
              </a>
            </span>
          </>
        ),
      },
    ];
    const buttons = this.state.onlyShow
      ? []
      : [
        <Button icon="playlist_add" onClick={() => this.addTrueTableRecord()} key="add">
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
        ];
    const helpText = (
      <span>{intl.get('sdps.newNode.model.message.help').d('当前节点是否根节点的条件')}</span>
    );

    return (
      <Content>
        <Form dataSet={this.nodeDs} labelWidth="auto" columns={2}>
          <TextField name="code" disabled={this.state.onlyShow} />
          <IntlField name="name" />
          <Switch name="rootNodeFlag" disabled={this.state.onlyShow} />
          <Switch name="linkCheckFlag" />
          <Output
            style={{ marginBottom: 30 }}
            label={
              <span className={styles['addRedStar-fromSql']}>
                {intl.get('sdps.newNode.model.newNode.nodeTableRelList').d('业务实体表')}
              </span>
            }
            colSpan={3}
            renderer={() => (
              <Table
                border="true"
                dataSet={this.nodeTableRelListDs}
                columns={columns}
                buttons={buttons}
                colSpan={3}
                pagination={{
                  hideOnSinglePage: true,
                }}
              />
            )}
          />
          <Output
            label={
              <span className={styles['addRedStar-fromSql']}>
                {intl.get('sdps.newNode.model.newNode.fromSql').d('寻找上游节点SQL')}
              </span>
            }
            colSpan={3}
            renderer={() => (
              <div style={{ position: 'relative' }} className={styles['fromSql-textArea']}>
                <TextArea
                  name="fromSql"
                  colSpan={3}
                  resize="vertical"
                  style={{ height: 200 }}
                  disabled={this.state.onlyShow}
                />
              </div>
            )}
          />
          <TextArea
            name="belongNodeSql"
            colSpan={3}
            resize="vertical"
            style={{ height: 120 }}
            disabled={this.state.onlyShow}
          />
          <Output
            label={
              <>
                <span>{intl.get('sdps.newNode.model.newNode.rootNodeSql').d('判断根节点SQL')}</span>
                <Tooltip placement="top" title={helpText} trigger="click">
                  <Icon type="help" />
                </Tooltip>
              </>
            }
            colSpan={3}
            renderer={() => (
              <div style={{ position: 'relative' }} className={styles['fromSql-textArea']}>
                <TextArea
                  name="rootNodeSql"
                  colSpan={3}
                  resize="vertical"
                  style={{ height: 120 }}
                  disabled={this.state.onlyShow}
                />
              </div>
            )}
          />
        </Form>
      </Content>
    );
  }
}
