/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/17
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { operatorRender, enableRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import withProps from 'hzero-front/lib/utils/withProps';
import getLang from '@/langs/desensitizeRuleLang';
import { DESENSITIZE_WAY_TAG, SOURCE_TYPE_TAG, SOURCE_TYPE_CONSTANTS } from '@/constants/constants';
import { referenceTableDS, tableDS as TableDS } from '@/stores/DesensitizeRule/DesensitizeRuleDS';
import ReferenceModal from './ReferenceModal';
import RuleDrawer from './RuleDrawer';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true, keepOriginDataSet: false }
)
export default class DesensitizeRule extends React.Component {
  constructor(props) {
    super(props);
    this.referenceTableDS = new DataSet(referenceTableDS());
    this.state = {
      toggleLoading: {},
      deleteLoading: {},
    };
  }

  @Bind()
  async toggleStatus(record, type) {
    const { desensitizeRuleId } = record.toData();
    await this.setState({ toggleLoading: { [desensitizeRuleId]: true } });
    if (type === 'disable') {
      this.referenceTableDS.setQueryParameter('desensitizeRuleId', desensitizeRuleId);
      const result = await this.referenceTableDS.query().catch(() => {
        this.setState({ toggleLoading: {} });
        return false;
      });
      if (result && !result.empty) {
        const confirmResult = await Modal.confirm({
          children: getLang('DISABLE_CONFIRM'),
        });
        if (confirmResult === 'cancel') {
          this.setState({ toggleLoading: {} });
          return false;
        }
      }
    }
    record.set('_requestType', 'enable');
    await this.props.tableDS
      .submit()
      .then((res) => {
        if (res && res.success) {
          this.props.tableDS.query();
        }
      })
      .finally(() => {
        this.setState({ toggleLoading: {} });
      });
  }

  async handleDelete(record) {
    const { desensitizeRuleId } = record.toData();
    await this.setState({ deleteLoading: { [desensitizeRuleId]: true } });
    this.referenceTableDS.setQueryParameter('desensitizeRuleId', desensitizeRuleId);
    const result = await this.referenceTableDS.query().catch(() => {
      this.setState({ deleteLoading: {} });
      return false;
    });
    if (result && !result.empty) {
      this.setState({ deleteLoading: {} });
      notification.warning({
        message: getLang('DELETE_CONFIRM'),
      });
      return false;
    }
    await this.props.tableDS.delete(record).finally(() => {
      this.setState({ deleteLoading: {} });
    });
  }

  openReferenceModal(desensitizeRuleId) {
    const modalProps = {
      desensitizeRuleId,
    };
    Modal.open({
      title: getLang('REFERENCE'),
      style: { width: 850 },
      cancelText: getLang('CLOSE'),
      cancelProps: { color: 'primary' },
      footer: (_okBtn, cancelBtn) => cancelBtn,
      children: <ReferenceModal {...modalProps} />,
    });
  }

  /**
   * 打开规则滑窗，新建/修改
   */
  openRuleDrawer(desensitizeRuleId, isCurrentTenantCreate) {
    const ruleDrawerProps = {
      desensitizeRuleId,
      isCurrentTenantCreate,
      onRefresh: () => this.props.tableDS.query(),
    };
    Modal.open({
      title: getLang('RULE_MAINTAIN'),
      drawer: true,
      okText: getLang('SAVE'),
      style: { width: 900 },
      children: <RuleDrawer {...ruleDrawerProps} />,
    });
  }

  get desensitizeRuleColumns() {
    const {
      match: { path },
    } = this.props;
    const { toggleLoading, deleteLoading } = this.state;
    return [
      {
        name: 'ruleCode',
        width: 300,
      },
      {
        name: 'ruleName',
        width: 300,
      },
      {
        name: 'desensitizeWay',
        width: 120,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, DESENSITIZE_WAY_TAG, record.get('desensitizeWayMeaning')),
      },
      {
        name: 'sourceType',
        width: 100,
        align: 'center',
        hidden: !isTenantRoleLevel(),
        renderer: ({ value }) =>
          TagRender(
            value,
            SOURCE_TYPE_TAG,
            value === SOURCE_TYPE_CONSTANTS.SELF_DEFINE ? getLang('CUSTOM') : getLang('PRE_DEFINED')
          ),
      },
      {
        name: 'description',
      },
      {
        name: 'enabledFlag',
        width: 80,
        align: 'center',
        renderer: ({ value }) => enableRender(value ? 1 : 0),
      },
      {
        header: getLang('OPERATOR'),
        width: 220,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const { enabledFlag, sourceType, desensitizeRuleId } = record.toData();
          const isCurrentTenantCreate = isTenantRoleLevel()
            ? sourceType === SOURCE_TYPE_CONSTANTS.SELF_DEFINE
            : true;
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openRuleDrawer(desensitizeRuleId, isCurrentTenantCreate)}
                >
                  {isCurrentTenantCreate && !enabledFlag ? getLang('EDIT') : getLang('VIEW')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            !enabledFlag &&
              isCurrentTenantCreate && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.enable`,
                        type: 'button',
                        meaning: '脱敏规则列表-启用',
                      },
                    ]}
                    disabled={toggleLoading[desensitizeRuleId]}
                    onClick={() => this.toggleStatus(record, 'enable')}
                  >
                    <Spin spinning={toggleLoading[desensitizeRuleId] || false} size="small">
                      {getLang('ENABLE')}
                    </Spin>
                  </ButtonPermission>
                ),
                key: 'enable',
                len: 2,
                title: getLang('ENABLE'),
              },
            enabledFlag &&
              isCurrentTenantCreate && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.disable`,
                        type: 'button',
                        meaning: '脱敏规则列表-禁用',
                      },
                    ]}
                    disabled={toggleLoading[desensitizeRuleId]}
                    onClick={() => this.toggleStatus(record, 'disable')}
                  >
                    <Spin spinning={toggleLoading[desensitizeRuleId] || false} size="small">
                      {getLang('DISABLE')}
                    </Spin>
                  </ButtonPermission>
                ),
                key: 'disable',
                len: 2,
                title: getLang('DISABLE'),
              },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.reference`,
                      type: 'button',
                      meaning: '脱敏规则列表-规则应用查询',
                    },
                  ]}
                  onClick={() => this.openReferenceModal(desensitizeRuleId)}
                >
                  {getLang('REFERENCE')}
                </ButtonPermission>
              ),
              key: 'reference',
              len: 4,
              title: getLang('REFERENCE'),
            },
            !enabledFlag &&
              isCurrentTenantCreate && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.delete`,
                        type: 'button',
                        meaning: '脱敏规则列表-删除规则',
                      },
                    ]}
                    disabled={deleteLoading[desensitizeRuleId]}
                    onClick={() => this.handleDelete(record)}
                  >
                    <Spin spinning={deleteLoading[desensitizeRuleId] || false} size="small">
                      {getLang('DELETE')}
                    </Spin>
                  </ButtonPermission>
                ),
                key: 'delete',
                len: 2,
                title: getLang('DELETE'),
              },
          ];
          return operatorRender(actions, record, { limit: 4 });
        },
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.create`,
                type: 'button',
                meaning: '脱敏规则-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.openRuleDrawer(undefined, true)}
          >
            {getLang('CREATE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.props.tableDS} columns={this.desensitizeRuleColumns} />
        </Content>
      </>
    );
  }
}
