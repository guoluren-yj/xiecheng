/**
 * index - 弹性域汇总查询页面-新建模型
 * @date: 2019-4-25
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Modal, Tabs } from 'hzero-ui';
import { isEmpty, isNumber, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
import {
  saveIndividuationFormDetails,
  saveUiTableConfig,
  deleteTableConfig,
  getCurrentTableConfig,
  getUiTablesBaseConfigByScope,
  stringToJSON,
  getUiTables,
  UI_TABLE_BASE_CONFIG,
  LOCAL_TABLE_CONFIG_KEY,
} from '../utils';
import './style.less';

const { TabPane } = Tabs;

const localTableConfigKey = 'hzeroLastModifiedIndiTableConf';

function assignDataSource(dataSource = [], defaultSchema) {
  let newDataSource = dataSource;
  try {
    newDataSource = !isEmpty(dataSource)
      ? newDataSource.map(n => ({ ...n, fieldProps: JSON.parse(n.fieldProps) }))
      : Object.keys(defaultSchema).map(n => {
          const {
            fieldDescription,
            row,
            index,
            itemProps = {},
            itemPropsOptions = {},
            fieldName,
            fieldType,
          } = defaultSchema[n];
          return {
            fieldName,
            fieldType,
            fieldProps: {
              ...itemProps,
              ...n.fieldProps,
              row,
              col: index,
              required: (itemPropsOptions.rules || []).some(o => o.required),
            },
            fieldDescription: n.fieldDescription || fieldDescription,
            disabledRequired: (itemPropsOptions.rules || []).some(o => o.required),
            fieldEnabledFlag: 1,
          };
        });
  } catch (e) {
    console.warn(e);
  }
  return newDataSource;
}

function debounce(fn) {
  // 4、创建一个标记用来存放定时器的返回值
  let timeout = null;
  return () => {
    // 5、每次当用户点击/输入的时候，把前一个定时器清除
    clearTimeout(timeout);
    // 6、然后创建一个新的 setTimeout，
    // 这样就能保证点击按钮后的 interval 间隔内
    // 如果用户还点击了的话，就不会执行 fn 函数
    timeout = setTimeout((...rest) => {
      fn.call(this, ...rest);
    }, 50);
  };
}

/**
 *
 *
 * @export
 * @class FlexFields
 * @extends {PureComponent}
 */
export default class Panel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formConfigDataSource: [],
      tableConfigDataSource: {},
      uiTablesBaseConfigDataSource: [],
      queryIndividuationFormListLoading: false,
      queryIndividuationTableListLoading: false,
      isDefault: false,
    };
  }

  /**
   *
   *
   * @param {*} prevProps
   * @returns
   * @memberof Editor
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { visible, individuationPanelDataType, individuationPanelKey } = this.props;
    return (
      visible &&
      !isEmpty(individuationPanelDataType) &&
      !isEmpty(individuationPanelKey) &&
      individuationPanelKey !== prevProps.individuationPanelKey
    );
  }

  /**
   *
   *
   * @param {*} rest
   * @memberof Editor
   */
  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    const { individuationPanelTriggerType } = this.props;
    if (snapshot) {
      if (individuationPanelTriggerType === 'form') {
        this.handleFetchIndividuationFormList();
      }
      if (individuationPanelTriggerType === 'table') {
        this.handleGetUiTablesConfig();
      }
    }
  }

  @Bind()
  handleFetchIndividuationFormList() {
    const {
      fetchIndividuationFormList,
      individuationPanelDataType,
      individuationPanelKey,
      componentObjectMap,
    } = this.props;
    const { defaultSchema = {} } = componentObjectMap.get(individuationPanelKey) || {};

    this.setState({
      queryIndividuationFormListLoading: true,
    });
    fetchIndividuationFormList(individuationPanelDataType, individuationPanelKey).then(res => {
      this.setState({
        formConfigDataSource: assignDataSource(res, defaultSchema),
        queryIndividuationFormListLoading: false,
      });
    });
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  @Bind()
  handleCancel() {
    const { cancel = () => {} } = this.props;
    this.setState(() => ({
      formConfigDataSource: [],
      tableConfigDataSource: [],
      uiTablesBaseConfigDataSource: {},
      queryIndividuationFormListLoading: false,
      queryIndividuationTableListLoading: false,
      saveIndividuationFormDetailsLoading: false,
      saveIndividuationTableDetailsLoading: false,
      isDefault: false,
    }));
    cancel();
  }

  @Bind()
  handleGetUiTablesConfig() {
    const { individuationPanelDataType, activeTableProps = {}, individuationPanelKey } = this.props;
    // const defaultColumns = activeDefaultTableProps.columns;
    getUiTablesBaseConfigByScope(individuationPanelDataType)
      .then((res = []) => {
        if (res && res.failed) {
          throw res;
        } else {
          this.setState(() => {
            return {
              uiTablesBaseConfigDataSource: res,
            };
          });
          const { tableConfId, lastUpdateTime } =
            (res || []).find(o => o.tableKey === individuationPanelKey) || {};
          const lastModifiedConfig =
            stringToJSON(window.localStorage.getItem(localTableConfigKey)) || {};
          const localTableConfig = lastModifiedConfig[individuationPanelKey] || {};

          if (
            isNumber(tableConfId) &&
            (tableConfId !== localTableConfig.tableConfId ||
              lastUpdateTime !== localTableConfig.lastUpdateTime)
          ) {
            getCurrentTableConfig(tableConfId)
              .then(tableConfigRes => {
                if (res && res.failed) {
                  throw res;
                } else {
                  lastModifiedConfig[individuationPanelKey] = tableConfigRes;
                  this.setState(() => ({
                    tableConfigDataSource: tableConfigRes,
                    isDefault: false,
                  }));
                }
              })
              .catch(e => {
                notification.error({ description: e.message });
              });
          } else {
            const newUiTableConfLineList = (activeTableProps.columns || []).map((o, i) => ({
              dataIndex: o.dataIndex,
              width: o.width,
              display: 1,
              fixedType: isEmpty(o.fixed) ? 'NONE' : o.fixed.toUpperCase(),
              orderSeq: i,
              description: o.title,
              ...((localTableConfig.uiTableConfLineList || []).find(
                n => n.dataIndex === o.dataIndex
              ) || {}),
            }));
            this.setState(() => ({
              isDefault: true,
              tableConfigDataSource: {
                ...localTableConfig,
                uiTableConfLineList: newUiTableConfLineList,
              },
            }));
          }
        }
      })
      .catch(e => {
        notification.error({ description: e.message });
      });
  }

  @Bind()
  enableTableColumn(dataIndex, enadled) {
    this.setState(({ tableConfigDataSource = {} }) => {
      const { uiTableConfLineList = [] } = tableConfigDataSource;
      return {
        tableConfigDataSource: {
          ...tableConfigDataSource,
          uiTableConfLineList: uiTableConfLineList.map(n =>
            n.dataIndex === dataIndex ? { ...n, display: enadled ? 1 : 0 } : n
          ),
        },
      };
    });
  }

  @Bind()
  setTableColumnTitle(dataIndex, description) {
    this.setState(({ tableConfigDataSource = {} }) => {
      const { uiTableConfLineList = [] } = tableConfigDataSource;
      return {
        tableConfigDataSource: {
          ...tableConfigDataSource,
          uiTableConfLineList: uiTableConfLineList.map(n =>
            n.dataIndex === dataIndex ? { ...n, description } : n
          ),
        },
      };
    });
  }

  @Bind()
  onTableRowDragger(dragIndex, hoverIndex) {
    this.setState(({ tableConfigDataSource = {} }) => {
      const { uiTableConfLineList = [] } = tableConfigDataSource;
      const sourceItemIndex = uiTableConfLineList.findIndex(o => o.orderSeq === dragIndex);
      const targetItemIndex = uiTableConfLineList.findIndex(o => o.orderSeq === hoverIndex);

      uiTableConfLineList[sourceItemIndex].orderSeq = hoverIndex;
      uiTableConfLineList[targetItemIndex].orderSeq = dragIndex;
      return {
        tableConfigDataSource: {
          ...tableConfigDataSource,
          uiTableConfLineList,
        },
      };
    });
  }

  @Bind()
  changeColumnWidth(dataIndex, value) {
    debounce(() => {
      this.setState(({ tableConfigDataSource = {} }) => {
        const { uiTableConfLineList = [] } = tableConfigDataSource;
        for (let i = 0; i < uiTableConfLineList.length; i += 1) {
          const item = uiTableConfLineList[i];
          if (item.dataIndex === dataIndex) {
            item.width = value;
            break;
          }
        }
        return {
          tableConfigDataSource: {
            ...tableConfigDataSource,
            uiTableConfLineList,
          },
        };
      });
    })();
  }

  @Bind()
  setAdaptedWidth(dataIndex) {
    this.setState(({ tableConfigDataSource = {} }) => {
      const { uiTableConfLineList = [], ...others } = tableConfigDataSource;
      const newTableConfigDataSource = {
        ...others,
        uiTableConfLineList: uiTableConfLineList.map(o =>
          o.dataIndex === dataIndex ? { ...o, width: isNumber(o.width) ? null : 80 } : o
        ),
      };
      return {
        tableConfigDataSource: newTableConfigDataSource,
      };
    });
  }

  @Bind()
  setColumnFixed(dataIndex, value = 'NONE') {
    this.setState(({ tableConfigDataSource = {} }) => {
      const { uiTableConfLineList = [] } = tableConfigDataSource;
      for (let i = 0; i < uiTableConfLineList.length; i += 1) {
        const item = uiTableConfLineList[i];
        if (item.dataIndex === dataIndex) {
          item.fixedType = value.toUpperCase();

          break;
        }
      }
      return {
        tableConfigDataSource: {
          ...tableConfigDataSource,
          uiTableConfLineList,
        },
      };
    });
  }

  @Bind()
  onChange(activeKey) {
    const { onTabsPanelChange = () => {}, tabPanes = [], individuationPanelDataType } = this.props;
    const { type } = tabPanes.find(o => o.key === activeKey) || {};
    onTabsPanelChange(activeKey, individuationPanelDataType, type);
  }

  @Bind()
  onDefaultFieldPropsChange(fieldName, props = {}) {
    this.setState(({ formConfigDataSource }) => ({
      formConfigDataSource: formConfigDataSource.map(o =>
        o.fieldName === fieldName ? { ...o, ...props } : o
      ),
    }));
  }

  @Bind()
  onFieldPropsChange(fieldName, props = {}) {
    this.setState(({ formConfigDataSource }) => {
      const newDataSource = formConfigDataSource.map(o =>
        o.fieldName === fieldName ? { ...o, fieldProps: { ...o.fieldProps, ...props } } : o
      );
      return {
        formConfigDataSource: newDataSource,
      };
    });
  }

  @Bind()
  onLayoutChange(fieldName, props = {}) {
    this.setState(({ formConfigDataSource }) => {
      const newDataSource = [...formConfigDataSource];
      const { row, col } = props;
      const sourceItemIndex = newDataSource.findIndex(o => o.fieldName === fieldName);
      const sourceItem = newDataSource[sourceItemIndex];
      const tempRow = sourceItem.fieldProps.row;
      const tempCol = sourceItem.fieldProps.col;
      const targetItemIndex = newDataSource.findIndex(
        o =>
          o.fieldProps.row === (isNumber(row) ? row : sourceItem.fieldProps.row) &&
          o.fieldProps.col === (isNumber(col) ? col : sourceItem.fieldProps.col)
      );
      const targetItem = newDataSource[targetItemIndex];
      if (targetItem) {
        sourceItem.fieldProps.row = targetItem.fieldProps.row;
        sourceItem.fieldProps.col = targetItem.fieldProps.col;
        targetItem.fieldProps.row = tempRow;
        targetItem.fieldProps.col = tempCol;
      }
      return {
        formConfigDataSource: newDataSource,
      };
    });
  }

  @Bind()
  footerRender() {
    const { savePersonalityDetailsLoading } = this.props;
    return (
      <Fragment>
        <Button onClick={this.clearIndividualizedConfigData}>
          {intl.get(`hpfm.individuation.view.title.default`).d('还原默认配置')}
        </Button>
        <Button onClick={this.handleCancel}>
          {intl.get(`hzero.common.button.cancel`).d('取消')}
        </Button>
        <Button type="primary" loading={savePersonalityDetailsLoading} onClick={this.onOk}>
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      </Fragment>
    );
  }

  @Bind()
  onOk() {
    const {
      individuationPanelDataType,
      individuationPanelTriggerType,
      individuationPanelKey,
      // setIndividuationTableRefresh,
      setIndividuationDataMap,
    } = this.props;
    const {
      formConfigDataSource = [],
      tableConfigDataSource,
      uiTablesBaseConfigDataSource,
    } = this.state;
    const actionMap = {
      form: () => {
        this.setState({
          saveIndividuationFormDetailsLoading: true,
        });
        saveIndividuationFormDetails(
          individuationPanelKey,
          individuationPanelDataType,
          formConfigDataSource.map(o => ({ ...o, fieldProps: JSON.stringify(o.fieldProps) }))
        )
          .then(res => {
            if (res && !res.failed) {
              notification.success();
              this.setState({
                saveIndividuationFormDetailsLoading: false,
              });
              this.handleFetchIndividuationFormList();
            }
          })
          .catch(e => {
            this.setState({
              saveIndividuationFormDetailsLoading: false,
            });
            console.warn(e);
            notification.error({ description: e.message });
          });
      },
      table: () => {
        this.setState({
          saveIndividuationTableDetailsLoading: true,
        });
        const newTableConfigDataSource = tableConfigDataSource;
        newTableConfigDataSource.fixedType = newTableConfigDataSource.uiTableConfLineList.some(
          o => o.fixedType !== 'NONE'
        )
          ? 'LEFT'
          : 'NONE';
        newTableConfigDataSource.remark = '';
        newTableConfigDataSource.scrollx = tableScrollWidth(
          newTableConfigDataSource.uiTableConfLineList
        );
        newTableConfigDataSource.scrolly = 0;
        newTableConfigDataSource.sourceType = individuationPanelDataType.toUpperCase();
        newTableConfigDataSource.tableKey = individuationPanelKey;
        saveUiTableConfig(
          {
            ...((uiTablesBaseConfigDataSource || []).find(
              o => o.tableKey === individuationPanelKey
            ) || {}),
            ...newTableConfigDataSource,
          },
          individuationPanelDataType
        )
          .then(res => {
            if (res && res.failed) {
              throw res;
            } else {
              notification.success();
              this.setState({
                saveIndividuationTableDetailsLoading: false,
              });
              getUiTables().then((tableConfigRes = []) => {
                if (tableConfigRes && tableConfigRes.failed) {
                  throw tableConfigRes;
                } else {
                  // const { lastUpdateTime } = tableConfigRes.find(o => o.tableKey === individuationPanelKey) || {};
                  // setIndividuationTableRefresh(lastUpdateTime);
                  setIndividuationDataMap(UI_TABLE_BASE_CONFIG, tableConfigRes);
                }
              });
              this.handleCancel();
            }
          })
          .catch(e => {
            this.setState({
              saveIndividuationTableDetailsLoading: false,
            });
            console.warn(e);
            notification.error({ description: e.message });
          });
      },
    };
    actionMap[individuationPanelTriggerType]();
  }

  @Bind()
  clearIndividualizedConfigData() {
    const {
      individuationPanelDataType,
      individuationPanelTriggerType,
      individuationPanelKey,
      // setIndividuationTableRefresh = () => {},
      // setIndividuationDataMap = () => {},
      // setRefreshTableBaseConfigLoading = () => {},
    } = this.props;
    const { tableConfigDataSource } = this.state;
    const actionMap = {
      form: () => {
        this.setState({
          saveIndividuationFormDetailsLoading: true,
        });
        saveIndividuationFormDetails(individuationPanelKey, individuationPanelDataType, [])
          .then(res => {
            if (res && res.failed) {
              throw res;
            } else {
              notification.success();
              this.setState({
                saveIndividuationFormDetailsLoading: false,
              });
              this.handleFetchIndividuationFormList();
            }
          })
          .catch(e => {
            this.setState({
              saveIndividuationFormDetailsLoading: false,
            });
            console.warn(e);
            notification.error({ description: e.message });
          });
      },
      table: () => {
        const newTableConfigDataSource = tableConfigDataSource;
        if (!isNumber(newTableConfigDataSource.tableConfId)) {
          // setIndividuationTableRefresh('default');
          this.handleCancel();
          return;
        }
        newTableConfigDataSource.fixedType = newTableConfigDataSource.uiTableConfLineList.some(
          o => o.fixedType !== 'NONE'
        )
          ? 'LEFT'
          : 'NONE';
        newTableConfigDataSource.remark = '';
        newTableConfigDataSource.scrollx = tableScrollWidth(
          newTableConfigDataSource.uiTableConfLineList
        );
        newTableConfigDataSource.scrolly = 0;
        newTableConfigDataSource.sourceType = individuationPanelDataType.toUpperCase();
        newTableConfigDataSource.tableKey = individuationPanelKey;
        this.setState({
          deleteIndividuationTableDetailsLoading: true,
        });
        deleteTableConfig(newTableConfigDataSource).then(res => {
          if (res && res.failed) {
            throw res;
          } else {
            notification.success();
            this.setState({
              deleteIndividuationTableDetailsLoading: false,
            });
            const localTableConfig = JSON.parse(localStorage.getItem(LOCAL_TABLE_CONFIG_KEY));
            localStorage.setItem(
              LOCAL_TABLE_CONFIG_KEY,
              JSON.stringify(omit(localTableConfig, [individuationPanelKey]))
            );
            // setIndividuationTableRefresh('default');
            // getUiTables().then((tableConfigRes = []) => {
            //   if (tableConfigRes && tableConfigRes.failed) {
            //     throw tableConfigRes;
            //   } else {
            //     // setIndividuationDataMap(UI_TABLE_BASE_CONFIG, tableConfigRes);
            //   }
            // });
            this.handleCancel();
          }
        });
      },
    };
    actionMap[individuationPanelTriggerType]();
  }

  render() {
    const { visible, tabPanes = [], individuationPanelKey, activeTableProps = {} } = this.props;

    const {
      formConfigDataSource = [],
      tableConfigDataSource = {},
      queryIndividuationFormListLoading,
      queryIndividuationTableListLoading,
      isDefault,
    } = this.state;

    const title = intl.get(`hpfm.individuation.view.title.individuation`).d('个性化');
    const modalProps = {
      title,
      visible,
      mask: true,
      destroyOnClose: true,
      onCancel: this.handleCancel,
      width: 1000,
      bodyStyle: {
        padding: 0,
      },
      footer: this.footerRender(),
    };

    return (
      <Modal {...modalProps}>
        <Tabs
          defaultActiveKey={individuationPanelKey}
          className="individuation-panel"
          tabPosition="left"
          tabBarGutter={0}
          tabBarStyle={{ whiteSpace: 'normal' }}
          size="small"
          onChange={this.onChange}
        >
          {tabPanes.map(o => {
            const Content = o.content;
            const contentProps = {
              dataSource: o.type === 'form' ? formConfigDataSource : tableConfigDataSource,
              loading:
                o.type === 'form'
                  ? queryIndividuationFormListLoading
                  : queryIndividuationTableListLoading,
              onDefaultFieldPropsChange: this.onDefaultFieldPropsChange,
              onFieldPropsChange: this.onFieldPropsChange,
              onLayoutChange: this.onLayoutChange,
            };
            if (o.type === 'table') {
              contentProps.tableProps = activeTableProps;
              contentProps.tableConfigDataSource = tableConfigDataSource;
              contentProps.enableTableColumn = this.enableTableColumn;
              contentProps.isDefault = isDefault;
              contentProps.setTableColumnTitle = this.setTableColumnTitle;
              contentProps.onTableRowDragger = this.onTableRowDragger;
              contentProps.changeColumnWidth = this.changeColumnWidth;
              contentProps.setColumnFixed = this.setColumnFixed;
              contentProps.setAdaptedWidth = this.setAdaptedWidth;
            }
            return (
              <TabPane style={{ minHeight: 700 }} disabled={o.disabled} tab={o.title} key={o.key}>
                <Content {...contentProps} />
              </TabPane>
            );
          })}
        </Tabs>
      </Modal>
    );
  }
}
