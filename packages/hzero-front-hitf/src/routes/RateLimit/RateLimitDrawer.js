import React, { PureComponent } from 'react';
import {
  DataSet,
  Table,
  Modal,
  Button,
  Lov,
  Form,
  TextField,
  Switch,
  NumberField,
  Spin,
  Select,
} from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { keys, isUndefined, isBoolean } from 'lodash';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { operatorRender, enableRender } from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import getLang from '@/langs/rateLimitLang';
import { interfaceFormDS, ruleTableDS } from '@/stores/RateLimit/RateLimitDS';
import { RATE_LIMIT_TYPE_CONSTANTS } from '@/constants/constants';
import RateLimitFormDrawer from './RateLimitFormDrawer';
import styles from './index.less';

export default class RateLimitDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.interfaceFormDS = new DataSet(interfaceFormDS());
    this.ruleTableDS = new DataSet(ruleTableDS());

    this.state = {
      collapseKeys: ['selectedInterface', 'limitRule'],
    };
  }

  componentDidMount() {
    const { itfRateLimitId, interfaceData } = this.props;
    if (!isUndefined(itfRateLimitId)) {
      this.fetchDetail(itfRateLimitId, interfaceData?.interfaceId);
    } else if (!isUndefined(interfaceData)) {
      this.interfaceFormDS.create(interfaceData);
    } else {
      this.interfaceFormDS.create();
    }
    this.updateModalProps();
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  async fetchDetail(itfRateLimitId, interfaceId) {
    this.interfaceFormDS.setQueryParameter('interfaceId', interfaceId);
    this.ruleTableDS.setQueryParameter('itfRateLimitId', itfRateLimitId);
    await Promise.all([this.interfaceFormDS.query(), this.ruleTableDS.query()]);
  }

  @Bind()
  async handleSave() {
    const { itfRateLimitId: itfRateLimitIdFromProps, onRefresh } = this.props;
    const { itfRateLimitId: itfRateLimitIdFromState } = this.state;
    const itfRateLimitId = itfRateLimitIdFromState ?? itfRateLimitIdFromProps;
    const validate = await this.interfaceFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { interfaceId, enabledFlag, rateLimitType } = this.interfaceFormDS.current.toData();
    const rateLimitLineList = this.ruleTableDS.toData();
    let submitData = [];
    if (isUndefined(itfRateLimitId)) {
      submitData = [
        {
          interfaceId,
          enabledFlag,
          rateLimitType,
          rateLimitLineList,
        },
      ];
    } else {
      submitData = rateLimitLineList.map((item) => ({ ...item, itfRateLimitId }));
    }
    this.interfaceFormDS.current.set('submitData', submitData);
    return this.interfaceFormDS.submit().then((res) => {
      if (res && res.success) {
        onRefresh();
        this.setState({ itfRateLimitId: res?.content[0]?.itfRateLimitId });
        this.fetchDetail(res?.content[0]?.itfRateLimitId, res?.content[0]?.interfaceId);
      }
      return false;
    });
  }

  openRateLimitFormDrawer(ruleData) {
    const { replenishRateMax, rateLimitType } = this.interfaceFormDS.current.toData();
    const drawerProps = {
      ruleData,
      replenishRateMax,
      rateLimitType,
      onAddRule: this.handleAddRule,
    };
    Modal.open({
      drawer: true,
      title: getLang('LIMIT_RULE'),
      style: {
        width: 600,
      },
      children: <RateLimitFormDrawer {...drawerProps} />,
    });
  }

  @Bind()
  handleAddRule(data, createFlag) {
    if (createFlag) {
      this.ruleTableDS.create(data);
    } else {
      keys(data).forEach((key) => {
        const value = data[key];
        this.ruleTableDS.current.set(key, value);
      });
    }
  }

  @Bind()
  handleCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  @Bind()
  handleOptionsFilter(record) {
    const { SIGNAL, FIXED_RATE } = RATE_LIMIT_TYPE_CONSTANTS;
    return [SIGNAL, FIXED_RATE].includes(record.get('value'));
  }

  get ruleColumns() {
    return [
      {
        name: 'replenishRate',
        width: 130,
      },
      isTenantRoleLevel() && {
        name: 'original',
      },
      isTenantRoleLevel() && {
        name: 'userName',
      },
      !isTenantRoleLevel() && {
        name: 'tenantName',
      },
      isTenantRoleLevel() && {
        name: 'roleName',
      },
      isTenantRoleLevel() && {
        name: 'header',
        width: 150,
      },
      isTenantRoleLevel() && {
        name: 'body',
        width: 150,
      },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => (isBoolean(value) ? enableRender(value ? 1 : 0) : value),
      },
      {
        header: getLang('OPERATOR'),
        width: 100,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => this.openRateLimitFormDrawer(record.toData())}
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
                <ButtonPermission
                  type="text"
                  onClick={() => this.ruleTableDS.delete(record, false)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  render() {
    const { itfRateLimitId: itfRateLimitIdFromProps } = this.props;
    const { collapseKeys, itfRateLimitId: itfRateLimitIdFromState } = this.state;
    const itfRateLimitId = itfRateLimitIdFromState ?? itfRateLimitIdFromProps;
    const isNew = isUndefined(itfRateLimitId);
    return (
      <Spin dataSet={this.interfaceFormDS}>
        <div className={styles['hitf-collapse']}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={this.handleCollapseChange}
          >
            <Collapse.Panel
              key="selectedInterface"
              showArrow={false}
              header={
                <>
                  <h3>{getLang('INTERFACE_INFO')}</h3>
                  <a>
                    {collapseKeys.includes('selectedInterface') ? getLang('UP') : getLang('EXPAND')}
                  </a>
                  <Icon
                    type={
                      collapseKeys.includes('selectedInterface') ? 'expand_less' : 'expand_more'
                    }
                  />
                </>
              }
            >
              <Form dataSet={this.interfaceFormDS} labelWidth={140} columns={2} disabled={!isNew}>
                <Lov name="interfaceLov" />
                <TextField name="interfaceName" />
                <TextField name="serverCode" />
                <TextField name="serverName" />
                <TextField name="namespace" />
                <Select name="rateLimitType" optionsFilter={this.handleOptionsFilter} />
                <Switch name="enabledFlag" />
                {isTenantRoleLevel() && <NumberField name="replenishRateMax" />}
              </Form>
            </Collapse.Panel>
            <Collapse.Panel
              key="limitRule"
              showArrow={false}
              header={
                <>
                  <h3>{getLang('LIMIT_RULE')}</h3>
                  <a>{collapseKeys.includes('limitRule') ? getLang('UP') : getLang('EXPAND')}</a>
                  <Icon type={collapseKeys.includes('limitRule') ? 'expand_less' : 'expand_more'} />
                </>
              }
            >
              <Table
                dataSet={this.ruleTableDS}
                columns={this.ruleColumns}
                buttons={[
                  'delete',
                  <Button icon="add" onClick={() => this.openRateLimitFormDrawer()}>
                    {getLang('CREATE')}
                  </Button>,
                ]}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      </Spin>
    );
  }
}
