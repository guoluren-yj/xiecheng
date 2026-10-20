import React, { useState, Fragment, useRef, createRef } from 'react';
import intl from 'utils/intl';
import { Collapse, Icon } from 'hzero-ui';
import { isArray, isEmpty, omit, isNumber, isBoolean, groupBy, isString } from 'lodash';
import { Button } from 'components/Permission';
// import notification from 'utils/notification';
import IndividuationPanel from './Panel';
import ControllerPanel from './IndividuationFormConfig/ControllerPanel';
import PreviewForm from './IndividuationFormConfig/PreviewForm';
import IndividuationTableConfig from './IndividuationTable/Panel';
import WrapIndividuationTable from './IndividuationTable/WrapIndividuationTable';
import {
  queryIndividuationFormDetailsByScope,
  getFormItemNode,
  // queryIndividuationFormDetails,
  // getUiTables,
  // stringToJSON,
  UI_TABLE_BASE_CONFIG,
  defineProperty,
} from './utils';

const { Panel } = Collapse;

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

function Header({ title, type }) {
  const typeMap = {
    form: intl.get(`hpfm.individuation.view.title.form`).d('表单'),
    table: intl.get(`hpfm.individuation.view.title.table`).d('表格'),
  };
  return (
    <div>
      <h4 style={{ margin: 0, display: 'inline-block' }}>
        <Icon type={type} /> {typeMap[type]}: {title}
      </h4>
      <div style={{ float: 'right', marginRight: 12 }}>
        <Icon type="right" />
      </div>
    </div>
  );
}

function composeFormItems(collections) {
  const formItemsGroup = {};
  if (Array.isArray(collections)) {
    collections
      .filter((o) => !isEmpty(o))
      .forEach((n, i) => {
        if (!Array.isArray(formItemsGroup[i])) {
          formItemsGroup[i] = {
            props: omit(n.props, ['children']),
          };
        }
        formItemsGroup[i].children = [];
        formItemsGroup[i].children = formItemsGroup[i].children
          .concat((n.props || {}).children || [])
          .map((m, j) => {
            const { fieldName, index, schema = {}, node = {} } = getFormItemNode(m, j);
            const formItemProps = ((node.props || {}).children || {}).props || {};
            const defaultItemProps = (formItemProps.children || {}).props || {};

            const colProps = omit(node.props, ['children']);
            const itemProps = {};

            if (!isEmpty(schema.propsKeys)) {
              schema.propsKeys.forEach((o) => {
                itemProps[o] = defaultItemProps[o];
              });
            }
            const itemPropsOptions = {
              rules: (defaultItemProps['data-__meta'] || {}).rules,
              initialValue: (defaultItemProps['data-__meta'] || {}).initialValue,
            };

            const result = {
              fieldName,
              index,
              fieldType: schema.fieldType,
              colProps,
              fieldDescription: formItemProps.label,
              formItemProps: omit(formItemProps, ['children']),
              itemProps,
              itemPropsOptions,
            };

            if ((itemPropsOptions.rules || []).some((o) => o.required)) {
              result.disabledRequired = true;
            }

            if (schema.fieldType === 'Select') {
              result.dataSource = node.props.children.props.children.props.children.map((o) => ({
                value: o.props.value,
                description: o.props.children,
              }));
            }

            return result;
          });
      });
  }
  return formItemsGroup;
}
function flatDefaultSchema(defaultSchema = []) {
  let flatDefaultSchemaArr = [];

  Object.keys(defaultSchema).forEach((n) => {
    const item = defaultSchema[n];
    flatDefaultSchemaArr = flatDefaultSchemaArr.concat(
      ...item.children.map((o) => ({ ...o, row: Number(n) }))
    );
  });
  const result = {};
  flatDefaultSchemaArr.forEach((n) => {
    result[n.fieldName] = n;
  });
  return result;
}

function mergeDataSource(dataSource = [], defaultSchema = {}) {
  let result = dataSource;
  try {
    if (!isEmpty(dataSource)) {
      result = dataSource.map((n) => {
        const {
          fieldDescription,
          row,
          index,
          itemProps = {},
          itemPropsOptions = {},
          disabledRequired,
        } = defaultSchema[n.fieldName] || {};
        return {
          ...n,
          fieldProps: {
            ...itemProps,
            ...n.fieldProps,
            row: isNumber(n.fieldProps.row) ? n.fieldProps.row : row,
            col: isNumber(n.fieldProps.col) ? n.fieldProps.col : index,
            required: isBoolean(n.fieldProps.required)
              ? n.fieldProps.required
              : (itemPropsOptions.rules || []).some((o) => o.required),
          },
          fieldDescription: n.fieldDescription || fieldDescription,
          disabledRequired,
        };
      });
    } else {
      result = Object.keys(defaultSchema).map((n) => {
        const {
          fieldDescription,
          row,
          index,
          itemProps = {},
          itemPropsOptions = {},
          fieldName,
          fieldType,
          disabledRequired,
        } = defaultSchema[n] || {};
        return {
          fieldName,
          fieldType,
          fieldProps: {
            ...itemProps,
            ...n.fieldProps,
            row,
            col: index,
            required: (itemPropsOptions.rules || []).some((o) => o.required),
          },
          fieldDescription: n.fieldDescription || fieldDescription,
          disabledRequired,
          fieldEnabledFlag: 1,
        };
      });
    }
  } catch (e) {
    console.warn(e);
  }

  return result.sort((a, b) => {
    const prevRow = (a.fieldProps || {}).row + 1;
    const prevCol = (a.fieldProps || {}).col;
    const nextRow = (b.fieldProps || {}).row + 1;
    const nextCol = (b.fieldProps || {}).col;
    return (
      Number(
        (isNumber(prevRow) && !isNaN(prevRow) ? prevRow : 0).toString() +
          (isNumber(prevCol) && !isNaN(prevCol) ? prevCol : 0).toString()
      ) -
      Number(
        (isNumber(nextRow) && !isNaN(nextRow) ? nextRow : 0).toString() +
          (isNumber(nextCol) && !isNaN(nextCol) ? nextCol : 0).toString()
      )
    );
  });
}

function getViewFormComponentObject(formComponentObject, flatIndividualizedFormConfig = {}) {
  const newDefaultFormComponentObject = formComponentObject;
  const formLayout = [];
  // const { defaultMaxRow } = this.state;
  const setPropsConfig = (node = {}, index) => {
    const formItemNode = getFormItemNode(node, index);
    if (!isEmpty(formItemNode)) {
      const { schema } = formItemNode;
      const item = formItemNode.node.props.children.props.children;
      const itemProps = flatIndividualizedFormConfig[item.props['data-__field'].name] || {};

      const { fieldProps = {}, fieldDescription, fieldEnabledFlag, fieldName } = itemProps || {};
      const { row, col } = fieldProps;
      ((schema || {}).propsKeys || []).forEach((n) => {
        if (!isEmpty(fieldProps, ['row', 'col'])) {
          // eslint-disable-next-line no-param-reassign
          item.props[n] = fieldProps[n];
          // eslint-disable-next-line no-param-reassign
          if (fieldProps['data-__meta']) {
            item.props['data-__meta'].rules = fieldProps['data-__meta'].rules;
          }
          if (
            fieldProps.required &&
            isArray(item.props['data-__meta'].rules) &&
            item.props['data-__meta'].rules.every((o) => !o.required)
          ) {
            item.props['data-__meta'].rules.push({
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: fieldDescription || formItemNode.node.props.children.props.label,
              }),
            });
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

  const assignFormInputsPropsConfig = (collections) => {
    if (isArray(collections)) {
      (collections || []).forEach((n, i) => {
        setPropsConfig(n, i);
      });
    }
  };
  if (!isEmpty((newDefaultFormComponentObject.props || {}).children)) {
    assignFormInputsPropsConfig((newDefaultFormComponentObject.props || {}).children || []);
    if (!isEmpty(flatIndividualizedFormConfig) && !isEmpty(formLayout)) {
      const formLayoutGroup = groupBy(formLayout, 'row');
      const keys = Object.keys(formLayoutGroup);

      for (let i = 0; i < keys.length; i++) {
        const rowItems = formLayoutGroup[keys[i]];
        for (let j = 0; j < rowItems.length; j += 1) {
          const item = rowItems[j];
          if (
            isArray((newDefaultFormComponentObject.props || {}).children[i]) &&
            (newDefaultFormComponentObject.props || {}).children[i].props &&
            (newDefaultFormComponentObject.props || {}).children[i].props.children
          ) {
            (newDefaultFormComponentObject.props || {}).children[i].props.children[item.col] = {};
            (newDefaultFormComponentObject.props || {}).children[i].props.children[item.col] =
              item.node;
          }
        }
      }
    }
  }

  return formComponentObject;
}

// function WrapIndividuationTable({
//   TableComponent,
//   baseConfig = [],
//   individualizedTabelCode,
//   tableProps = {},
// }) {
//   const { tableConfId, lastUpdateTime } =
//     baseConfig.find(o => o.tableKey === individualizedTabelCode) || {};
//   const [tableConfig, setTableConfig] = useState({});
//   const [loading, setLoading] = useState(false);
//   if (isNumber(tableConfId)) {
//     debugger;
//     const lastModifiedConfig =
//       stringToJSON(window.localStorage.getItem(LOCAL_TABLE_CONFIG_KEY)) || {};
//     const localTableConfig = lastModifiedConfig[individualizedTabelCode] || {};
//     useEffect(() => {
//       debugger;
//       if (lastUpdateTime !== localTableConfig.lastUpdateTime) {
//         setLoading(true);
//         debugger;
//         getCurrentTableConfig(tableConfId)
//           .then(res => {
//             if (res && res.failed) {
//               throw res;
//             } else {
//               debugger;
//               lastModifiedConfig[individualizedTabelCode] = res;
//               window.localStorage.setItem(
//                 LOCAL_TABLE_CONFIG_KEY,
//                 JSON.stringify(lastModifiedConfig)
//               );
//               setTableConfig(res);
//               setLoading(false);
//             }
//           })
//           .catch(e => {
//             notification.error({ description: e.message });
//           });
//       } else {
//         setTableConfig(localTableConfig);
//       }
//     }, [tableConfId]);
//   }
//   const warpTableProps = assignTableConfig(tableProps, tableConfig);
//   debugger;
//   return (
//     <Spin spinning={loading}>
//       <TableComponent {...warpTableProps} />
//     </Spin>
//   );
// }

function assignTableConfig(tableProps = {}, tableConfig = {}) {
  const warpTableProps = tableProps;
  if (!isEmpty(tableConfig)) {
    const tableConfigColumns = tableConfig.uiTableConfLineList;
    const flatTableConfig = {};
    if (!isEmpty(tableConfigColumns)) {
      tableConfigColumns.forEach((n) => {
        flatTableConfig[n.dataIndex] = n;
      });
    }

    if (!isEmpty(warpTableProps.columns)) {
      warpTableProps.columns.forEach((n) => {
        const item = n;
        const newItemProps = flatTableConfig[n.dataIndex] || {};
        if (!isEmpty(newItemProps)) {
          item.fixed =
            newItemProps.fixedType !== 'NONE' ? newItemProps.fixedType.toLowerCase() : null;
          if (newItemProps.description) {
            item.title = newItemProps.description;
          }
        }

        item.width = isNumber(newItemProps.width)
          ? newItemProps.width
          : newItemProps.width === null
          ? null
          : item.width;

        defineProperty(item, 'orderSeq', newItemProps.orderSeq);
      });
      warpTableProps.columns = warpTableProps.columns
        .filter((o) => (flatTableConfig[o.dataIndex] || {}).display === 1)
        .sort((a, b) => a.orderSeq - b.orderSeq);
      warpTableProps.scroll = { x: tableConfig.scrollx, y: tableConfig.scrolly };
    }
  }
  return warpTableProps;
}

export default function withIndividuation(options = {}) {
  const { form = [], table = [] } = options;
  const componentObjectMap = new Map();
  const individuationDataMap = new Map();
  const activeIndividuationObjectMap = new Map();
  let useActive = false;
  return ({ setToolboxDrawerVisible }) => {
    const [individuationPanelVisible, setIndividuationPanelVisible] = useState(false);
    const [individuationPanelTabKey, setIndividuationPanelTabKey] = useState(null);
    const [individuationPanelDataType, setIndividuationPanelDataType] = useState(null);
    const [individuationPanelTriggerType, setIndividuationPanelTriggerType] = useState(null);
    const [enabledIndividuationPanelTabKeys, setEnabledIndividuationPanelTabKeys] = useState([]);
    const [activeIndividuationPanelTabKey, setActiveIndividuationPanelTabKey] = useState([]);
    const formBtnRefMap = {};
    const tableBtnRefMap = {};
    form.forEach((n) => {
      formBtnRefMap[n.individuationCode] = {
        tenant: createRef(),
        role: createRef(),
        user: createRef(),
      };
    });

    table.forEach((n) => {
      tableBtnRefMap[n.individuationCode] = {
        tenant: createRef(),
        role: createRef(),
        user: createRef(),
      };
    });

    const formBtnRef = useRef(formBtnRefMap);
    const tabelBtnRef = useRef(tableBtnRefMap);
    // const [individuationTableRefresh, setIndividuationTableRefresh] = useState(null);
    const openIndividuationPanelByFormBtns = (type, code) => {
      let newEnabledIndividuationPanelTabKeys = enabledIndividuationPanelTabKeys;
      Object.keys(formBtnRef.current).forEach((n) => {
        if (n !== code) {
          const refCur = formBtnRef.current;
          if (
            refCur[n][type].current &&
            !refCur[n][type].current.props.disabled &&
            refCur[n][type].current.state.status !== 2
          ) {
            newEnabledIndividuationPanelTabKeys.push(n);
          } else {
            newEnabledIndividuationPanelTabKeys = newEnabledIndividuationPanelTabKeys.filter(
              (o) => o !== n
            );
          }
        }
      });
      Object.keys(tabelBtnRef.current).forEach((n) => {
        const refCur = tabelBtnRef.current;
        if (
          refCur[n][type].current &&
          !refCur[n][type].current.props.disabled &&
          refCur[n][type].current.state.status !== 2
        ) {
          newEnabledIndividuationPanelTabKeys.push(n);
        } else {
          newEnabledIndividuationPanelTabKeys = newEnabledIndividuationPanelTabKeys.filter(
            (o) => o !== n
          );
        }
      });
      // tabelBtnRef;
      setEnabledIndividuationPanelTabKeys(newEnabledIndividuationPanelTabKeys);
      setIndividuationPanelTabKey(code);
      setIndividuationPanelVisible(true);
      setToolboxDrawerVisible(false);
      setIndividuationPanelDataType(type);
      setIndividuationPanelTriggerType('form');
    };
    const openIndividuationPanelByTableBtns = (type, code) => {
      let newEnabledIndividuationPanelTabKeys = enabledIndividuationPanelTabKeys;

      Object.keys(tabelBtnRef.current).forEach((n) => {
        if (n !== code) {
          const refCur = tabelBtnRef.current;
          if (
            refCur[n][type].current &&
            !refCur[n][type].current.props.disabled &&
            refCur[n][type].current.state.status !== 2
          ) {
            newEnabledIndividuationPanelTabKeys.push(n);
          } else {
            newEnabledIndividuationPanelTabKeys = newEnabledIndividuationPanelTabKeys.filter(
              (o) => o !== n
            );
          }
        } else {
          newEnabledIndividuationPanelTabKeys.push(code);
        }
      });
      Object.keys(formBtnRef.current).forEach((n) => {
        const refCur = formBtnRef.current;
        if (
          refCur[n][type].current &&
          !refCur[n][type].current.props.disabled &&
          refCur[n][type].current.state.status !== 2
        ) {
          newEnabledIndividuationPanelTabKeys.push(n);
        } else {
          newEnabledIndividuationPanelTabKeys = newEnabledIndividuationPanelTabKeys.filter(
            (o) => o !== n
          );
        }
      });
      setEnabledIndividuationPanelTabKeys(newEnabledIndividuationPanelTabKeys);
      setIndividuationPanelVisible(true);
      setToolboxDrawerVisible(false);
      if (newEnabledIndividuationPanelTabKeys.some((o) => o === code)) {
        setIndividuationPanelTabKey(code);
        setIndividuationPanelDataType(type);
        setIndividuationPanelTriggerType('table');
      }
    };

    const formTabPanes = form.map((n) => ({
      title: (
        <Fragment>
          <Icon type="form" />
          {n.title
            ? isString(n.title)
              ? n.title
              : intl.get((n.title || {}).code).d((n.title || {}).default)
            : n.individuationCode}
        </Fragment>
      ),
      key: n.individuationCode,
      content: ({
        dataSource = [],
        loading = false,
        individuationSchema,
        onDefaultFieldPropsChange = () => {},
        onFieldPropsChange,
        onLayoutChange = () => {},
      }) => {
        const { component, defaultSchema = {} } = componentObjectMap.get(n.individuationCode) || {};
        const WrapPreviewForm = component;
        const newDataSource = mergeDataSource(dataSource, defaultSchema);
        return (
          <ControllerPanel
            dataSource={newDataSource}
            loading={loading}
            onDefaultFieldPropsChange={onDefaultFieldPropsChange}
            onFieldPropsChange={onFieldPropsChange}
            onLayoutChange={onLayoutChange}
          >
            <WrapPreviewForm dataSource={newDataSource} individuationSchema={individuationSchema} />
          </ControllerPanel>
        );
      },
      type: 'form',
    }));

    const tableTabPanes = table.map((n) => ({
      title: (
        <Fragment>
          <Icon type="table" />
          {n.title
            ? isString(n.title)
              ? n.title
              : intl.get((n.title || {}).code).d((n.title || {}).default)
            : n.individuationCode}
        </Fragment>
      ),
      key: n.individuationCode,
      content: ({ tableProps = {}, tableConfigDataSource = {}, ...rest }) => {
        const { TableComponent } = componentObjectMap.get(n.individuationCode) || {};
        const individuationTableProps = {
          permissionLevelKey: individuationPanelDataType,
          tableKey: n.individuationCode,
          TableComponent,
          tableProps,
          assignTableConfig,
          tableConfigDataSource,
          ...rest,
        };
        return (
          <div style={{ marginRight: 12 }}>
            <IndividuationTableConfig {...individuationTableProps} />
          </div>
        );
      },
      type: 'table',
      disabled:
        isEmpty(enabledIndividuationPanelTabKeys) ||
        enabledIndividuationPanelTabKeys.indexOf(n.individuationCode) === -1,
    }));

    const onTabsPanelChange = (activeKey, dataType, type) => {
      setIndividuationPanelTabKey(activeKey);
      setIndividuationPanelDataType(dataType);
      setIndividuationPanelTriggerType(type);
    };

    const toolsConfig = {
      panel: (
        <IndividuationPanel
          visible={individuationPanelVisible}
          individuationPanelDataType={individuationPanelDataType}
          individuationPanelKey={individuationPanelTabKey}
          cancel={() => {
            setIndividuationPanelVisible(false);
            setIndividuationPanelTabKey(null);
            setIndividuationPanelDataType(null);
            setIndividuationPanelTriggerType(null);
          }}
          tabPanes={formTabPanes.concat(tableTabPanes)}
          fetchIndividuationFormList={queryIndividuationFormDetailsByScope}
          individuationPanelTriggerType={individuationPanelTriggerType}
          componentObjectMap={componentObjectMap}
          onTabsPanelChange={onTabsPanelChange}
          activeTableProps={(componentObjectMap.get(individuationPanelTabKey) || {}).tableProps}
          setIndividuationDataMap={(key, value) => individuationDataMap.set(key, value)}
          activeIndividuationPanelTabKey={activeIndividuationPanelTabKey}
          // setIndividuationTableRefresh={setIndividuationTableRefresh}
        />
      ),
      controller: (
        <Collapse bordered={false}>
          {form.map(
            (n) =>
              ((useActive && activeIndividuationObjectMap.get('form') === n.individuationCode) ||
                (Array.isArray(activeIndividuationObjectMap.get('form')) &&
                  (activeIndividuationObjectMap.get('form') || []).some(
                    (o) => o === n.individuationCode
                  ))) && (
                <Panel
                  key={n.individuationCode}
                  showArrow={false}
                  forceRender
                  header={
                    <Header
                      type="form"
                      title={
                        n.title
                          ? isString(n.title)
                            ? n.title
                            : intl.get((n.title || {}).code).d((n.title || {}).default)
                          : n.individuationCode
                      }
                    />
                  }
                  style={customPanelStyle}
                >
                  {isArray((n.permissionCode || {}).tenant) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        onClick={() =>
                          openIndividuationPanelByFormBtns('tenant', n.individuationCode)
                        }
                        type="text"
                        ref={(node) => {
                          formBtnRef.current[n.individuationCode].tenant.current = node;
                        }}
                        permissionList={
                          (n.permissionCode || {}).tenant
                          //   [
                          //   {
                          //     code: `${path}.button.revoke`,
                          //     type: 'button',
                          //     meaning: '公告管理-撤销',
                          //   },
                          // ]
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl
                          .get(`hpfm.individuation.view.title.individuationFormTenant`)
                          .d('租户')}
                      </Button>
                    </span>
                  )}
                  {isArray((n.permissionCode || {}).role) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        type="text"
                        ref={(node) => {
                          formBtnRef.current[n.individuationCode].role.current = node;
                        }}
                        permissionList={n.permissionCode.role}
                        onClick={() =>
                          openIndividuationPanelByFormBtns('role', n.individuationCode)
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl.get(`hpfm.individuation.view.title.individuationFormRole`).d('角色')}
                      </Button>
                    </span>
                  )}
                  {isArray((n.permissionCode || {}).user) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        type="text"
                        ref={(node) => {
                          formBtnRef.current[n.individuationCode].user.current = node;
                        }}
                        permissionList={(n.permissionCode || {}).user}
                        onClick={() =>
                          openIndividuationPanelByFormBtns('user', n.individuationCode)
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl.get(`hpfm.individuation.view.title.individuationFormUser`).d('用户')}
                      </Button>
                    </span>
                  )}
                </Panel>
              )
          )}
          {table.map(
            (n) =>
              ((useActive && activeIndividuationObjectMap.get('table') === n.individuationCode) ||
                (Array.isArray(activeIndividuationObjectMap.get('table')) &&
                  (activeIndividuationObjectMap.get('table') || []).some(
                    (o) => o === n.individuationCode
                  ))) && (
                <Panel
                  key={n.individuationCode}
                  showArrow={false}
                  forceRender
                  header={
                    <Header
                      type="table"
                      title={
                        n.title
                          ? isString(n.title)
                            ? n.title
                            : intl.get((n.title || {}).code).d((n.title || {}).default)
                          : n.individuationCode
                      }
                    />
                  }
                  style={customPanelStyle}
                >
                  {isArray((n.permissionCode || {}).tenant) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        onClick={() =>
                          openIndividuationPanelByTableBtns('tenant', n.individuationCode)
                        }
                        type="text"
                        ref={(node) => {
                          tabelBtnRef.current[n.individuationCode].tenant.current = node;
                        }}
                        permissionList={
                          (n.permissionCode || {}).tenant
                          //   [
                          //   {
                          //     code: `${path}.button.revoke`,
                          //     type: 'button',
                          //     meaning: '公告管理-撤销',
                          //   },
                          // ]
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl
                          .get(`hpfm.individuation.view.title.individuationTableTenant`)
                          .d('租户')}
                      </Button>
                    </span>
                  )}
                  {isArray((n.permissionCode || {}).role) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        type="text"
                        ref={(node) => {
                          tabelBtnRef.current[n.individuationCode].role.current = node;
                        }}
                        permissionList={n.permissionCode.role}
                        onClick={() =>
                          openIndividuationPanelByTableBtns('role', n.individuationCode)
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl.get(`hpfm.individuation.view.title.individuationTableRole`).d('角色')}
                      </Button>
                    </span>
                  )}
                  {isArray((n.permissionCode || {}).user) && (
                    <span style={{ height: 20, margin: '0 6px' }}>
                      <Button
                        type="text"
                        ref={(node) => {
                          tabelBtnRef.current[n.individuationCode].user.current = node;
                        }}
                        permissionList={(n.permissionCode || {}).user}
                        onClick={() =>
                          openIndividuationPanelByTableBtns('user', n.individuationCode)
                        }
                      >
                        <Icon type="edit" />{' '}
                        {intl.get(`hpfm.individuation.view.title.individuationTableUser`).d('用户')}
                      </Button>
                    </span>
                  )}
                </Panel>
              )
          )}
        </Collapse>
      ),
      title: intl.get(`hpfm.individuation.view.title.individuation`).d('个性化'),
      key: 'individuation',
    };

    if (!isEmpty(form)) {
      toolsConfig.assignWrapComponentProps = (wrapComponentProps) => {
        const activedWrapComponentProps = wrapComponentProps;
        activedWrapComponentProps.withIndividuationForm = ({ formComponentObject = {}, code }) => {
          // if (!componentObjectMap.has(code)) {
          const defaultObject = formComponentObject;
          const defaultSchema = composeFormItems((defaultObject.props || {}).children);
          const activeFormArr = activeIndividuationObjectMap.get('form') || [];
          activeIndividuationObjectMap.set(
            'form',
            useActive
              ? code
              : activeFormArr.some((o) => o === code)
              ? activeFormArr
              : activeFormArr.concat(code)
          );
          componentObjectMap.set(code, {
            component: ({ individuationSchema, ...rest }) => (
              <PreviewForm
                {...defaultObject.props}
                individuationSchema={{ ...defaultSchema, ...individuationSchema }}
                {...rest}
              />
            ),
            defaultSchema: flatDefaultSchema(defaultSchema),
          });
          // }
          const flatIndividualizedFormConfig = {};
          const individuationFormData = [...(individuationDataMap.get(code) || [])];
          individuationFormData.forEach((n) => {
            flatIndividualizedFormConfig[n.fieldName] = n;
          });

          getViewFormComponentObject(formComponentObject, flatIndividualizedFormConfig);
          return formComponentObject;
        };
        activedWrapComponentProps.withIndividuationTable = (
          individualizedTabelCode,
          tableProps = {}
        ) => {
          const baseConfig = individuationDataMap.get(UI_TABLE_BASE_CONFIG) || [];
          const activeTableArr = activeIndividuationObjectMap.get('table') || [];
          activeIndividuationObjectMap.set(
            'table',
            useActive
              ? individualizedTabelCode
              : activeTableArr.some((o) => o === individualizedTabelCode)
              ? activeTableArr
              : activeTableArr.concat(individualizedTabelCode)
          );
          return (TableComponent) => {
            componentObjectMap.set(individualizedTabelCode, { tableProps, TableComponent });

            return (
              <WrapIndividuationTable
                baseConfig={baseConfig}
                TableComponent={TableComponent}
                tableProps={tableProps}
                assignTableConfig={assignTableConfig}
                // individuationTableRefresh={individuationTableRefresh}
                individualizedTabelCode={individualizedTabelCode}
                // setIndividuationTableRefresh={setIndividuationTableRefresh}
              />
            );
          };
        };
        activedWrapComponentProps.withIndividuationObjectByActionController = (type, activeKey) => {
          if (!useActive) {
            useActive = true;
          }
          setActiveIndividuationPanelTabKey(activeKey);
          activeIndividuationObjectMap.set(type, activeKey);
        };
      };
    }

    toolsConfig.asyncEvent = () => {
      // if (!isEmpty(form)) {
      //   Promise.all(
      //     form.map(n =>
      //       queryIndividuationFormDetails(n.individuationCode)
      //         .then(res => {
      //           if (res && res.failed) {
      //             notification.error({ description: res.message });
      //             throw res;
      //           } else {
      //             // setIndividuationFormData(res);
      //             individuationDataMap.set(
      //               n.individuationCode,
      //               res.map(o => ({ ...o, fieldProps: stringToJSON(o.fieldProps) }))
      //             );
      //           }
      //         })
      //         .catch(e => {
      //           console.warn(e);
      //         })
      //     )
      //   );
      // }
      // if (!isEmpty(table)) {
      //   getUiTables()
      //     .then(res => {
      //       if (res && res.failed) {
      //         notification.error({ description: res.message });
      //         throw res;
      //       } else {
      //         individuationDataMap.set(UI_TABLE_BASE_CONFIG, res);
      //       }
      //     })
      //     .catch(e => {
      //       console.warn(e);
      //     });
      // }
    };

    return toolsConfig;
  };
}
