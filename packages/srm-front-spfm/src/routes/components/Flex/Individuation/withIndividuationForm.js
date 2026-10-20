/* eslint-disable react/no-multi-comp */
import React, { Fragment, PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, groupBy, omit } from 'lodash';
import { Card, Menu, Dropdown } from 'hzero-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import {
  getFormItemNode,
  queryIndividuationFormDetails,
  saveIndividuationFormDetails,
  stringToJSON,
} from './utils';
import IndividuationFormConfig from './IndividuationFormConfig';

// 设置sinv国际化前缀 - view.title

// const viewTitlePrompt = 'hpfm.flexFields.view.title';
// 设置sinv国际化前缀 - view.button
const viewButtonPrompt = 'hpfm.individuationForm.view.button';
// 设置通用国际化前缀
// const commonPrompt = 'hzero.common';

export default function withIndividuationForm(options = {}) {
  const { formIndividuationCode = '', permissionCode = {} } = options;
  return Component => {
    class WithIndividuationFormComponent extends PureComponent {
      constructor(props) {
        super(props);
        this.state = {
          queryIndividualizedFormConfigLoading: false, // 查询form个性化数据接口Loading
          individualizedFormConfig: [], // form个性化数据
          isRenderForm: false, // 是否渲染原始form对象
          individuationFormVisible: false, // 个性化配置页面是否隐藏
        };
        this.Component = Component;
      }

      componentDidMount() {
        this.fetchIndividualizedFormConfig();
      }

      @Bind()
      fetchIndividualizedFormConfig() {
        this.setState({
          isRenderForm: false,
          queryIndividualizedFormConfigLoading: true,
        });
        queryIndividuationFormDetails(formIndividuationCode).then((res = []) => {
          // const { formDataCache } = this.state;
          if (res && res.failed) {
            this.setState({
              isRenderForm: true,
              queryIndividualizedFormConfigLoading: false,
              individualizedFormConfig: [],
            });
          } else {
            const layoutArr = [];
            const individualizedFormConfig = res.map(o => {
              const fieldProps = stringToJSON(o.fieldProps) || {};
              layoutArr.push({ fieldName: o.fieldName, row: fieldProps.row, col: fieldProps.col });
              return {
                ...o,
                fieldProps,
              };
            });

            this.setState(
              {
                queryIndividualizedFormConfigLoading: false,
                individualizedFormConfig,
                defaultMaxRow: Object.keys(groupBy(layoutArr, 'row')).length,
              },
              () => {
                this.setState({
                  isRenderForm: true,
                });
              }
            );
          }
        });
      }

      @Bind()
      withIndividuationFormObject(formComponentObject) {
        const {
          permissionLevelKey,
          individuationFormVisible,
          isRenderForm,
          individualizedFormConfig = [],
          queryIndividualizedFormConfigLoading,
          savePersonalityDetailsLoading,
        } = this.state;
        let newformComponentObject = {};
        const flatIndividualizedFormConfig = {};
        (individualizedFormConfig || []).forEach(n => {
          flatIndividualizedFormConfig[n.fieldName] = n;
        });

        newformComponentObject = this.getViewFormComponentObject(
          formComponentObject,
          flatIndividualizedFormConfig
        );
        const save = (scope, data, cb = () => {}) => {
          this.setState({
            savePersonalityDetailsLoading: true,
          });
          saveIndividuationFormDetails(formIndividuationCode, scope, data).then(res => {
            if (res && res.failed) {
              notification.error({ description: res.message });
            } else {
              this.fetchIndividualizedFormConfig();
              cb();
              this.setState({
                savePersonalityDetailsLoading: false,
              });
              notification.success();
            }
          });
        };
        const individuationFormProps = {
          formIndividuationCode,
          defaultFormComponentObject: formComponentObject,
          formComponentObject: queryIndividualizedFormConfigLoading ? (
            <Card loading={queryIndividualizedFormConfigLoading} />
          ) : (
            newformComponentObject
          ),
          permissionLevelKey,
          visible: individuationFormVisible,
          cancel: this.closeIndividuationFormConfig,
          isRenderForm,
          save,
          savePersonalityDetailsLoading,
          individualizedFormConfig,
          getViewFormComponentObject: this.getViewFormComponentObject,
        };
        return <IndividuationFormConfig {...individuationFormProps} />;
      }

      @Bind()
      individuationFormTriggerButtonRender(props = {}) {
        const { roleButtonText, userButtonText, tenantButtonText } = props;
        const { queryIndividualizedFormConfigLoading } = this.state;
        const menuItems = [
          isArray(permissionCode.tenant) && {
            type: 'T',
            component: (
              <Button
                onClick={() => this.openIndividuationFormConfig('T')}
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
                  intl.get(`${viewButtonPrompt}.individuationFormTenant`).d('个性化表单配置(租户)')}
              </Button>
            ),
          },
          isArray(permissionCode.role) && {
            type: 'R',
            component: (
              <Button
                type="text"
                permissionList={permissionCode.role}
                onClick={() => this.openIndividuationFormConfig('R')}
              >
                {userButtonText ||
                  intl.get(`${viewButtonPrompt}.individuationFormRole`).d('个性化表单配置(角色)')}
              </Button>
            ),
          },
          isArray(permissionCode.user) && {
            type: 'U',
            component: (
              <Button
                type="text"
                permissionList={permissionCode.user}
                onClick={() => this.openIndividuationFormConfig('U')}
              >
                {tenantButtonText ||
                  intl.get(`${viewButtonPrompt}.individuationFormUser`).d('个性化表单配置(用户)')}
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
                  ? { onClick: () => this.openIndividuationFormConfig(menuItems[0].type) }
                  : {})}
              >
                {menuItems.length === 1
                  ? menuItems[0].content
                  : intl.get(`${viewButtonPrompt}.individuationForm`).d('个性化表单配置')}
              </Button>
            </Dropdown>
            {/* {isArray(permissionCode.tenant) && (
              <Button code={permissionCode.tenant} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationFormConfig('T')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationFormTenant`).d('个性化表单配置(租户)')}
              </Button>
            )}
            {isArray(permissionCode.role) && (
              <Button code={permissionCode.role} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationFormConfig('R')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationFormRole`).d('个性化表单配置(角色)')}
              </Button>
            )}
            {isArray(permissionCode.user) && (
              <Button code={permissionCode.user} disabled={queryIndividualizedFormConfigLoading} icon="setting" onClick={() => this.openIndividuationFormConfig('U')} style={{ float: 'right' }}>
                {intl.get(`${viewButtonPrompt}.individuationForm`).d('个性化表单配置')}
              </Button>
            )} */}
          </Fragment>
        );
      }

      @Bind()
      openIndividuationFormConfig(permissionLevelKey) {
        this.setState({
          permissionLevelKey,
          individuationFormVisible: true,
        });
      }

      @Bind()
      closeIndividuationFormConfig() {
        this.setState({
          permissionLevelKey: null,
          individuationFormVisible: false,
        });
      }

      @Bind()
      getViewFormComponentObject(formComponentObject, flatIndividualizedFormConfig = {}, maxRow) {
        const newDefaultFormComponentObject =
          formComponentObject.props.componentObject || formComponentObject;
        const formLayout = [];
        const { defaultMaxRow } = this.state;
        const setPropsConfig = (node = {}, index) => {
          const formItemNode = getFormItemNode(node, index);
          if (!isEmpty(formItemNode)) {
            const { schema } = formItemNode;
            const item = formItemNode.node.props.children.props.children;
            const itemProps = flatIndividualizedFormConfig[item.props['data-__field'].name] || {};

            const { fieldProps = {}, fieldDescription, fieldEnabledFlag, fieldName } = itemProps;
            const { row, col } = fieldProps;
            ((schema || {}).propsKeys || []).forEach(n => {
              if (!isEmpty(omit(fieldProps, ['row', 'col']))) {
                // eslint-disable-next-line no-param-reassign
                item.props[n] = fieldProps[n];
                // eslint-disable-next-line no-param-reassign
                if (fieldProps['data-__meta']) {
                  item.props['data-__meta'].rules = fieldProps['data-__meta'].rules;
                }

                if (isArray(item.props['data-__meta'].validate)) {
                  if (!item.props['data-__meta'].validate[0]) {
                    // eslint-disable-next-line no-param-reassign
                    item.props['data-__meta'].validate[0] = {};
                  }
                  // eslint-disable-next-line no-param-reassign
                  item.props['data-__meta'].validate[0].rules = (
                    fieldProps['data-__meta'] || item.props['data-__meta']
                  ).rules;
                }
              }
            });
            formLayout.push({ row, col, fieldName, node });
            formItemNode.node.props.style = {
              ...formItemNode.node.props.style,
              display: fieldEnabledFlag === 0 ? 'none' : '',
            };
            // eslint-disable-next-line no-param-reassign
            formItemNode.node.props.children.props.label =
              fieldDescription || formItemNode.node.props.children.props.label;
          } else {
            assignFormInputsPropsConfig(((node || {}).props || {}).children, node || {});
          }
        };

        const assignFormInputsPropsConfig = collections => {
          if (isArray(collections)) {
            (collections || []).forEach((n, i) => {
              setPropsConfig(n, i);
            });
          }
        };
        if (!isEmpty((newDefaultFormComponentObject.props || {}).children)) {
          assignFormInputsPropsConfig((newDefaultFormComponentObject.props || {}).children || []);

          // const formConfigArr = Object.keys(flatIndividualizedFormConfig).map(o => flatIndividualizedFormConfig[o]);
          //   let newLayout = layout;
          //   if (!isEmpty(newFormItemsLayout.layout)) {
          //     debugger;
          //     newLayout = layout.map((o) => {
          //       const { row, col } = newFormItemsLayout.layout.find(m => m.fieldName === o.fieldName);
          //       return {
          //         ...o,
          //         row,
          //         col,
          //       };
          //     });
          //   }

          for (let i = 0; i < (maxRow || defaultMaxRow); i += 1) {
            const rowItems = formLayout.filter(o => o.row === i);
            for (let j = 0; j < rowItems.length; j += 1) {
              const item = rowItems[j];
              (newDefaultFormComponentObject.props || {}).children[i].props.children[item.col] = {};
              (newDefaultFormComponentObject.props || {}).children[i].props.children[item.col] =
                item.node;
            }
          }
        }

        return formComponentObject;
      }

      // @Bind()
      // getNewFormComponentObject(formComponentObject, flatIndividualizedFormConfig) {
      //   const newDefaultFormComponentObject = formComponentObject;

      //   const assignPropsConfig = (collections = []) => {
      //     collections.forEach((n) => {
      //       if (isArray(n.props.children) && n.props.children.some((o, i) => !isEmpty(getFormItemNode(o, i)))) {

      //       }
      //     });
      //   };

      //   return newDefaultFormComponentObject;
      // }

      render() {
        const componentProps = {
          ...this.props,
          individuationFormTriggerButton: this.individuationFormTriggerButtonRender(),
          withIndividuationFormObject: this.withIndividuationFormObject,
        };

        return <Component {...componentProps} />;
      }
    }

    return React.forwardRef((props, ref) => {
      return <WithIndividuationFormComponent {...props} ref={ref} />;
    });
  };
}
