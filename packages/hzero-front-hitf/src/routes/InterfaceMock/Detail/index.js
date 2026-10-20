/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/10
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import {
  DataSet,
  Form,
  TextField,
  Select,
  Spin,
  Lov,
  Table,
  Modal,
  TextArea,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { operatorRender, TagRender, yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { routerRedux } from 'dva/router';
import { basicFormDS, mockTableDS } from '@/stores/InterfaceMock/InterfaceMockDS';
import { MOCK_TEMPLATE_TYPE_TAG, EXECUTIVE_STRATEGY_CONSTANT } from '@/constants/constants';
import getLang from '@/langs/interfaceMockLang';
import MockDrawer from './MockDrawer';
import styles from './index.less';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.basicFormDS = new DataSet(
      basicFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.mockTableDS = new DataSet(mockTableDS());

    this.state = {
      mockStrategy: '',
    };
  }

  componentDidMount() {
    if (!isUndefined(this.mockGroupId)) {
      this.handleFetchDetail(this.mockGroupId);
    } else {
      this.basicFormDS.create();
    }
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'mockStrategy') {
      this.setState({ mockStrategy: value });
    }
  }

  get mockGroupId() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    return id;
  }

  /**
   * 查询
   */
  async handleFetchDetail(id) {
    this.basicFormDS.setQueryParameter('mockGroupId', id);
    this.mockTableDS.setQueryParameter('mockGroupId', id);
    await Promise.all([this.basicFormDS.query(), this.mockTableDS.query()]);
    const { mockStrategy } = this.basicFormDS.current.toData();
    this.setState({ mockStrategy });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.basicFormDS.submit().then((res) => {
      if (res && res.success) {
        if (isUndefined(this.mockGroupId)) {
          this.handleGotoDetail(res.content[0].mockGroupId);
        } else {
          this.handleFetchDetail(this.mockGroupId);
        }
      }
    });
  }

  /**
   * 跳转到明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id) {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/interface-mock/detail/${id}`,
      })
    );
  }

  openMockDrawer(id) {
    const {
      match: { path },
    } = this.props;
    const { mockStrategy } = this.state;
    const mockDrawerProps = {
      path,
      mockStrategy,
      mockId: id,
      newMockCode: `MOCK_${this.mockTableDS.length + 1}`,
      mockGroupId: this.mockGroupId,
      firstRecordFlag: this.mockTableDS.length === 0,
      tenantId: this.basicFormDS.current.get('tenantId'),
      onRefresh: () => this.mockTableDS.query(),
    };
    Modal.open({
      title: getLang('MOCK_INFO'),
      drawer: true,
      okText: getLang('SAVE'),
      style: { width: 1100 },
      children: <MockDrawer {...mockDrawerProps} />,
    });
  }

  /**
   * mock测试
   */
  handleTest(record) {
    this.mockTableDS.records[0].set('testData', record.toData());
    this.mockTableDS
      .submit()
      .then((res) => {
        if (res && !res.failed) {
          Modal.open({
            title: getLang('TEST_RESULT'),
            children: (
              <div className={styles['result-mocked']}>
                <pre className={styles.body}>{JSON.stringify(res.content[0], null, 2)}</pre>
              </div>
            ),
          });
        }
      })
      .finally(() => {
        this.mockTableDS.records[0].init('testData', undefined);
      });
  }

  get mockColumns() {
    const {
      match: { path },
    } = this.props;
    const { mockStrategy } = this.state;
    return [
      {
        name: 'mockName',
        width: 250,
      },
      {
        name: 'httpStatusCode',
        width: 100,
      },
      {
        name: 'mockWeight',
        width: 100,
      },
      {
        name: 'templateType',
        width: 120,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, MOCK_TEMPLATE_TYPE_TAG, record.get('templateTypeMeaning')),
      },
      {
        name: 'defaultExecuteFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'remark',
      },
      {
        header: getLang('OPERATOR'),
        width: 140,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openMockDrawer(record.get('mockId'))}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: (
                <ButtonPermission type="text" onClick={() => this.handleTest(record)}>
                  {getLang('TEST')}
                </ButtonPermission>
              ),
              key: 'test',
              len: 2,
              title: getLang('TEST'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.detail.delete`,
                      type: 'button',
                      meaning: '接口MOCK-删除',
                    },
                  ]}
                  onClick={() => this.mockTableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record, { limit: 3 });
        },
      },
    ].filter((item) => {
      const { ROUND_ROBIN, WEIGHT, SPECIFIED_INSTANCE } = EXECUTIVE_STRATEGY_CONSTANT;
      if (mockStrategy === ROUND_ROBIN) {
        return item.name !== 'mockWeight' && item.name !== 'defaultExecuteFlag';
      }
      if (mockStrategy === SPECIFIED_INSTANCE) {
        return item.name !== 'mockWeight';
      }
      if (mockStrategy === WEIGHT) {
        return item.name !== 'defaultExecuteFlag';
      }
      return true;
    });
  }

  render() {
    const { match } = this.props;
    const { path } = match;
    const isNew = isUndefined(this.mockGroupId);

    return (
      <>
        <Header title={getLang('DETAIL')} backPath="/hitf/interface-mock/list">
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.detail.save`,
                type: 'button',
                meaning: '接口MOCK-保存',
              },
            ]}
            icon="save"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleSave()}
          >
            {getLang('SAVE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Spin dataSet={this.basicFormDS}>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('BASIC_INFO')}</h3>}
            >
              <Form labelLayout="horizontal" dataSet={this.basicFormDS} columns={3}>
                {!isTenantRoleLevel() && <Lov name="tenantLov" disabled={!isNew} />}
                <TextField name="mockGroupCode" restrict="a-zA-Z0-9-_./" disabled={!isNew} />
                <TextField name="mockGroupName" />
                <Select name="mockStrategy" disabled={!isNew} />
                <TextArea name="remark" colSpan={2} />
              </Form>
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('MOCK_LIST')}</h3>}
            >
              <Table
                queryBar={isNew ? 'none' : 'professionalBar'}
                dataSet={this.mockTableDS}
                columns={this.mockColumns}
                buttons={[
                  <ButtonPermission
                    permissionList={[
                      {
                        code: `${path}.button.detail.create`,
                        type: 'button',
                        meaning: '接口MOCK-MOCK列表-新建',
                      },
                    ]}
                    icon="add"
                    type="c7n-pro"
                    disabled={isNew}
                    onClick={() => this.openMockDrawer()}
                  >
                    {getLang('CREATE')}
                  </ButtonPermission>,
                ]}
              />
            </Card>
          </Spin>
        </Content>
      </>
    );
  }
}
