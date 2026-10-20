/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/7/2
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import {
  DataSet,
  Form,
  Switch,
  Spin,
  Lov,
  Table,
  TextField,
  TextArea,
  NumberField,
  Modal,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { routerRedux } from 'dva/router';
import { basicFormDS, userTenantTableDS } from '@/stores/InterfaceForward/InterfaceForwardDS';
import { FORWARD_MATCH_TYPE_CONSTANT, USER_TENANT_TAG } from '@/constants/constants';
import getLang from '@/langs/interfaceForwardLang';
import UserTenantModal from './UserTenantModal';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.basicFormDS = new DataSet(basicFormDS());
    this.userTenantTableDS = new DataSet(userTenantTableDS());
  }

  componentDidMount() {
    if (!isUndefined(this.forwardId)) {
      this.handleFetchDetail();
    }
    this.userTenantTableDS.queryDataSet.addEventListener('update', this.handleQueryFieldChange);
  }

  componentWillUnmount() {
    this.userTenantTableDS.queryDataSet.removeEventListener('update', this.handleQueryFieldChange);
  }

  @Bind()
  handleQueryFieldChange({ name, value, record }) {
    if (name === 'type') {
      if (value === FORWARD_MATCH_TYPE_CONSTANT.TENANT) {
        record.set('userLov', undefined);
      } else if (value === FORWARD_MATCH_TYPE_CONSTANT.USER) {
        record.set('tenantLov', undefined);
      }
    }
  }

  get forwardId() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    return id;
  }

  /**
   * 查询
   */
  @Bind()
  handleFetchDetail() {
    this.basicFormDS.setQueryParameter('forwardId', this.forwardId);
    this.basicFormDS.query().then((res) => {
      let originData = {};
      try {
        originData = JSON.parse(res);
      } catch (error) {
        originData = res;
      }
      this.userTenantTableDS.setQueryParameter('urlRuleId', originData.urlRuleId);
      this.userTenantTableDS.query();
    });
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
        if (isUndefined(this.forwardId)) {
          this.handleGotoDetail(res.content[0].forwardId);
        } else {
          this.handleFetchDetail();
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
        pathname: `/hitf/interface-forward/detail/${id}`,
      })
    );
  }

  @Bind()
  openUserTenantModal() {
    const modalProps = {
      urlRuleId: this.basicFormDS.current.get('urlRuleId'),
      onRefresh: () => this.userTenantTableDS.query(),
    };
    Modal.open({
      title: getLang('USER_TENANT_INFO'),
      okText: getLang('SAVE'),
      children: <UserTenantModal {...modalProps} />,
    });
  }

  get mappingTargetColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      {
        name: 'type',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, USER_TENANT_TAG, record.getField('type').getText(value)),
      },
      {
        name: 'userTenantName',
        renderer: ({ record }) => {
          if (record.get('type') === FORWARD_MATCH_TYPE_CONSTANT.USER) {
            return record.get('sourceUserName');
          } else {
            return record.get('sourceTenantName');
          }
        },
      },
      {
        header: getLang('OPERATOR'),
        width: 60,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.detail.delete`,
                      type: 'button',
                      meaning: '接口转发配置-明细-删除',
                    },
                  ]}
                  onClick={() => this.userTenantTableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions);
        },
      },
    ];
  }

  render() {
    const { match } = this.props;
    const { path } = match;
    const isNew = isUndefined(this.forwardId);

    return (
      <>
        <Header title={getLang('DETAIL')} backPath="/hitf/interface-forward/list">
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.detail.save`,
                type: 'button',
                meaning: '接口转发配置-明细-保存',
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
                <TextField name="urlRuleCode" disabled={!isNew} restrict="a-zA-Z0-9-_./" />
                <Lov name="interfaceLov" />
                <TextField name="interfaceName" />
                <TextField name="serverCode" />
                <TextField name="serverName" />
                <TextField name="namespace" />
                <Lov name="targetServiceLov" />
                <TextField name="targetUrl" />
                <NumberField name="orderSeq" />
                <Switch name="enabledFlag" />
                <TextArea name="description" colSpan={2} />
              </Form>
            </Card>
            {!isNew && (
              <Card
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={<h3>{getLang('USER_TENANT_LIST')}</h3>}
              >
                <Table
                  dataSet={this.userTenantTableDS}
                  columns={this.mappingTargetColumns}
                  buttons={[
                    'delete',
                    <ButtonPermission
                      permissionList={[
                        {
                          code: `${path}.button.detail.create`,
                          type: 'button',
                          meaning: '接口转发配置-明细-新建',
                        },
                      ]}
                      icon="add"
                      type="c7n-pro"
                      disabled={isNew}
                      onClick={() => this.openUserTenantModal()}
                    >
                      {getLang('CREATE')}
                    </ButtonPermission>,
                  ]}
                />
              </Card>
            )}
          </Spin>
        </Content>
      </>
    );
  }
}
