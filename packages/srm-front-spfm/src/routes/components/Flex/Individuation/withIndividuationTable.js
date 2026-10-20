/* eslint-disable react/no-multi-comp */
import React, { PureComponent, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray } from 'lodash';
import { Menu, Dropdown } from 'hzero-ui';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import IndividuationTable from './IndividuationTable';

const viewButtonPrompt = 'hpfm.flexFields.view.button';

export default function withIndividuationTable(options = {}) {
  const { tableKey, permissionCode = {} } = options;
  return Component => {
    class WithWrapIndividuationTableComponent extends PureComponent {
      constructor(props) {
        super(props);
        this.state = {
          individuationTableVisible: false, // 个性化配置页面是否隐藏
        };
      }

      componentDidMount() {
        // this.fetchIndividualizedTableConfig();
      }

      @Bind()
      fetchIndividualizedFormConfig() {}

      @Bind()
      withIndividuationTableComponent(props) {
        const { individuationTableVisible, permissionLevelKey } = this.state;
        const individuationTableProps = {
          visible: individuationTableVisible,
          permissionLevelKey,
          tableKey,
          cancel: this.closeIndividuationTableConfig,
          ...props,
        };
        return TableComponent => (
          <IndividuationTable TableComponent={TableComponent} {...individuationTableProps} />
        );
      }

      @Bind()
      individuationTableTriggerButtonRender(props = {}) {
        const { roleButtonText, userButtonText, tenantButtonText } = props;
        const { queryIndividualizedFormConfigLoading } = this.state;
        const menuItems = [
          isArray(permissionCode.tenant) && {
            type: 'T',
            component: (
              <Button
                onClick={() => this.openIndividuationTableConfig('T')}
                type="text"
                permissionList={
                  permissionCode.tenant
                  //   [
                  //   {
                  //     code: `${path}.button.revoke`,
                  //     type: 'button',
                  //     meaning: '公告管理-撤销',
                  //   },
                  // ]
                }
              >
                {roleButtonText ||
                  intl
                    .get(`${viewButtonPrompt}.individuationTableTenant`)
                    .d('个性化表格配置(租户)')}
              </Button>
            ),
          },
          isArray(permissionCode.role) && {
            type: 'R',
            component: (
              <Button
                type="text"
                permissionList={permissionCode.role}
                onClick={() => this.openIndividuationTableConfig('R')}
              >
                {userButtonText ||
                  intl.get(`${viewButtonPrompt}.individuationTableRole`).d('个性化表格配置(角色)')}
              </Button>
            ),
          },
          isArray(permissionCode.user) && {
            type: 'U',
            component: (
              <Button
                type="text"
                permissionList={permissionCode.user}
                onClick={() => this.openIndividuationTableConfig('U')}
              >
                {tenantButtonText ||
                  intl.get(`${viewButtonPrompt}.individuationTableUser`).d('个性化表格配置(用户)')}
              </Button>
            ),
          },
        ].filter(Boolean);

        const menu = (
          <Menu>
            {menuItems.map(o => (
              <Menu.Item key={o.type}>{o.component}</Menu.Item>
            ))}
          </Menu>
        );
        return (
          <Fragment>
            <Dropdown
              overlay={menu}
              trigger={['click']}
              placement="bottomCenter"
              {...(menuItems.length === 1 ? { visible: false } : {})}
            >
              <Button
                icon="setting"
                disabled={queryIndividualizedFormConfigLoading}
                {...(menuItems.length === 1
                  ? { onClick: () => this.openIndividuationTableConfig(menuItems[0].type) }
                  : {})}
              >
                {menuItems.length === 1
                  ? menuItems[0].content
                  : intl.get(`${viewButtonPrompt}.individuationTable`).d('个性化表格配置')}
              </Button>
            </Dropdown>
            {/* {isArray(permissionCode.tenant) && (
              <Button code={permissionCode.tenant} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationTableConfig('T')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationTableTenant`).d('个性化表格配置(租户)')}
              </Button>
            )}
            {isArray(permissionCode.role) && (
              <Button code={permissionCode.role} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationTableConfig('R')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationTableRole`).d('个性化表格配置(角色)')}
              </Button>
            )}
            {isArray(permissionCode.user) && (
              <Button code={permissionCode.user} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationTableConfig('U')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationTable`).d('个性化表格配置')}
              </Button>
            )} */}
          </Fragment>
        );
      }

      @Bind()
      openIndividuationTableConfig(permissionLevelKey) {
        this.setState({
          permissionLevelKey,
          individuationTableVisible: true,
        });
      }

      @Bind()
      closeIndividuationTableConfig() {
        this.setState({
          permissionLevelKey: null,
          individuationTableVisible: false,
        });
      }

      render() {
        const componentProps = {
          ...this.props,
          individuationTableTriggerButtonRender: this.individuationTableTriggerButtonRender(),
          withIndividuationTableComponent: this.withIndividuationTableComponent,
        };

        return <Component {...componentProps} />;
      }
    }
    // const individuationTableProps = {
    //   tableKey,
    //   TableComponent: Component,
    //   ...props,
    // };
    // return <IndividuationTable {...individuationTableProps} />;
    return React.forwardRef((props, ref) => {
      return <WithWrapIndividuationTableComponent {...props} ref={ref} />;
    });
  };
}
