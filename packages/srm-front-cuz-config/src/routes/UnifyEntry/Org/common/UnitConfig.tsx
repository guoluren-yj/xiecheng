/* eslint-disable camelcase */
import React, { Component, CSSProperties, ReactNode, RefObject, useCallback, useMemo } from 'react';
import { Button, DataSet, Form, TextField, Table, Select, Tabs, Spin, Output, NumberField, Tooltip, IntlField, Modal } from 'choerodon-ui/pro';
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { getCurrentOrganizationId, getCurrentUser, getResponse } from 'hzero-front/lib/utils/utils';
import request from 'hzero-front/lib/utils/request';
import { Badge, Popconfirm, Tag, Icon } from 'choerodon-ui';
import { SelectionMode, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { unitFieldsDs, unitInfoDs } from './dataSets';
import {
  getFieldConfigAlias,
  getSpecialConfig,
  unit,
  FilterComponentList,
} from '../../../../utils/constConfig.js';
import SearchBarConfig from './SearchBarConfig';

const { TabPane } = Tabs;
const checkStatusRenderer = status => {
  switch(Number(status)) {
    case 0: return <Icon type="close" />;
    case 1: return <Icon type="check" />;
    case -1:
    default: return null;
  }
};

const BatchButton = observer<any>(({ onClick, flag, selectedSize }) => {
  const ObserverFlag = useMemo(() => flag, []);
  const resetData = useCallback(() => {
    onClick(true);
  }, [onClick]);
  return (
    <>
      {
        ObserverFlag.flag && (
          <Button icon="cancel" color={ButtonColor.primary} onClick={resetData} funcType={FuncType.flat}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        )
      }
      <Button icon={ObserverFlag.flag ? "save" : "mode_edit"} color={ButtonColor.primary} disabled={ObserverFlag.flag && !selectedSize()} onClick={() => onClick()} funcType={FuncType.flat}>
        {
          // eslint-disable-next-line no-nested-ternary
          !ObserverFlag.flag
            ? intl.get('hpfm.individual.model.config.batchUpdate').d('批量编辑')
            : intl.get('hpfm.individual.model.config.batchSave').d('批量保存')
        }
      </Button>
    </>
  );
});
export default class UnitConfig<T> extends Component<T & {
  unitType: string;
  unitCode?: any;
  unitId: any;
  editable?: boolean;
  onRef?: RefObject<UnitConfig<T>>;
  tabsClassName?: string;
  unitTypeObj: { [k: string]: string };
  unitName?: string;
  onQueryUnitConfigLoading?: (loading: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  openFieldDetailImpl: (record, options) => void;
  templateId?: string;
  menuCode?: string;
  pageId?: string;
  uuid?: string;
}, any> {
  mode: string = 'tpl';

  tableColumns: ColumnProps[] = [];

  formDS = new DataSet();

  tableDS = new DataSet();

  firstLoadUnit: boolean = false;

  searchBarRef: any = null;

  implTableButtons: Buttons[] = [];

  selectionMode: SelectionMode = SelectionMode.none;

  scrollTop?: number;

  customizedCode?: string;

  searchBarStyle: CSSProperties = {};

  themeConfigFlag?: boolean;

  uConfig: any;

  specialConfig: any;

  uniqueUiFeatureMap: any;

  uiFeatureTranslateMap: any = {};

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      filterFields: [],
      unit: {},
      loading: true,
      activeTabKey: 'fields',
    };
    if (props.onRef) {
      // eslint-disable-next-line no-param-reassign
      props.onRef.current = this;
    }
    const { themeConfigVO } = getCurrentUser();
    if (themeConfigVO && themeConfigVO.enableThemeConfig) this.themeConfigFlag = true;
  }

  batchFlag = observable({ flag: false });

  tableStyle: () => CSSProperties = () => ({});

  componentDidMount() {
    this.queryUnit();
  }

  componentDidUpdate(prevProps, prevState) {
    const { unitCode, editable, unitId } = this.props;
    if (
      !this.firstLoadUnit && (this.props.unitCode || this.props.unitId) ||
      unitCode !== prevProps.unitCode ||
      unitId !== prevProps.unitId ||
      editable !== prevProps.editable ||
      this.didUpdateReQuery(prevProps, prevState)
    ) {
      this.queryUnit();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({activeTabKey: "fields"});
    }
  }

  // eslint-disable-next-line no-unused-vars
  didUpdateReQuery(prevProps, prevState) {
    return false;
  }

  getTableBodyContainer() {
    return this.mode === "tpl" ? '#unit-wrap-container .c7n-pro-table-body' : '#unit-wrap-container-cusz .c7n-pro-table-body';
  }

  cacheTableScroll() {
    const container = document.querySelector(this.getTableBodyContainer());
    if (container) {
      this.scrollTop = container.scrollTop;
    }
  }

  queryUnit = () => {
    if (!this.props.unitCode && !this.props.unitId) {
      this.formDS.loadData([]);
      this.setState({ loading: false, unit: {}, fields: [], filterFields: [] });
      return;
    }

    this.formDS = new DataSet(unitInfoDs(intl, { dsStatus: this.props.editable ? 1 : 0 }));
    this.tableDS = new DataSet(unitFieldsDs(intl, {
      mode: this.mode, unitInfoFun: () => this.formDS.current ? this.formDS.current.toData() : {},
      initUnitType: this.props.unitType,
    }, {
      batchFlag: this.batchFlag,
    }));
    this.firstLoadUnit = true;
    this.setState({ loading: true, unit: {}, fields: [], filterFields: [] });
    if (this.props.onQueryUnitConfigLoading) {
      this.props.onQueryUnitConfigLoading(true);
    }
    this.queryUnitApi().then(res => {
      if (getResponse(res)) {
        const currentUnit = (res || {}).unit || {};
        // 筛选器 sortedEnabled 字段初始值设置
        const sortedEnabled = currentUnit.sortedEnabled || 0;
        const config = currentUnit.config || {};
        if (config.gridSummary === undefined) config.girdSummary = -1;
        this.formDS.loadData([{ ...currentUnit, sortedEnabled, config, _tls: config ._tls, _token: config._token, unitTitle: config.unitTitle }]);
        this.tableDS.loadData(res.configFields || []);
        this.setState({ fields: res.configFields || [], unit: currentUnit, loading: false }, () => {
          if (this.props.onQueryUnitConfigLoading) {
            this.props.onQueryUnitConfigLoading(false);
          }
          setTimeout(() => {
            const container = document.querySelector(this.getTableBodyContainer());
            if (container) {
              container.scrollTop = this.scrollTop || 0;
              this.scrollTop = 0;
            }
          }, 100);
        });

        const unitTags = (currentUnit.unitTag || '').split(",");
        const uTag = unitTags.find((t: string) => t.startsWith("AF-")) || "__no_config__";
        this.uConfig = unit[uTag] || {};
        this.specialConfig = getSpecialConfig(uTag);

        let uniqueUiFeatureList: string[] = [];
        this.uiFeatureTranslateMap = {};
        if (this.specialConfig) {
          this.specialConfig.list.forEach(l => {
            this.uiFeatureTranslateMap[l.value] = l.meaning;
            if (l.unique) uniqueUiFeatureList.push(l.value);
          });
        }
        this.uniqueUiFeatureMap = {};
        if (uniqueUiFeatureList.length) {
          (res.configFields || []).forEach(field => {
            const uiFeatures = (field.uiFeature || "").split(",");
            if (uiFeatures.length) {
              uiFeatures.forEach((value) => {
                if (uniqueUiFeatureList.includes(value)) {
                  this.uniqueUiFeatureMap[value] = field.fieldCodeAlias;
                }
              })
            }
          })
        }
        
        this.setTableColumnsAndButtons(currentUnit, unitTags);
      }
    }).finally(() => {
      this.batchFlag.flag = false;
    });
  }

  queryUnitApi(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  setTableColumnsAndButtons(unit, tags) {
    const { unitType } = unit;

    const isFormType = ['FORM', 'QUERYFORM', "WORKFLOW"].includes(unitType);
    const isGrid = unitType === "GRID";
    const isSection = unitType === "SECTION";
    const isSearchBarType = unitType === 'SEARCHBAR';
    const isInputUnit = ['FORM', 'FILTER', 'QUERYFORM', 'GRID', 'WORKFLOW'].includes(unitType);
    const hasColConfig = tags.includes("GROUP-GRID") && isGrid || isFormType;
    const pureVirtual = ['BTNGROUP', 'TABPANE', 'COLLAPSE', "SECTION"].includes(unitType);
    const showAggregationCode = (
      unitType === "BTNGROUP"
      || unitType === "GRID" && tags.includes("C7N-UI")
      || unitType === "TABPANE" && tags.includes("DOUBLETABS")
      || this.uConfig.aggregationCode
    );
    const canAddField = !tags.includes("DISABLE_EXT_FIELD");
    // 筛选器 sortedEditorFlag 和 sortedEnabled 优先取 config下面的
    const sortedEditorFlag = unit.sortedEditorFlag || 0;
    const sortedEnabled = unit.sortedEnabled || 0;
    const isCommon = unitType === "COMMON";
    const hasSeq = ["FILTER", "GRID", "COMMON", 'COLLAPSE', "SECTION"].includes(unitType);
    const hasRenderOptions = isCommon && this.uConfig.renderOptions || ['FORM', 'GRID', 'QUERYFORM', 'FILTER'].includes(unitType)

    this.tableColumns = [
      {
        name: 'fieldCode',
        minWidth: 200,
        header: intl.get("hpfm.customize.common.fieldInfo").d("字段信息"),
        renderer: ({ record }) => {
          const {
            fieldAlias,
            fieldCodeAlias,
            configFieldId,
            fieldName,
            warnMessage,
          } = record.get(["fieldAlias", "fieldCodeAlias", "configFieldId", "fieldName", 'warnMessage']);
          return (
            <div className="unit-column-field-code">
              <div className="field-name">
                {fieldName}
                {warnMessage && Object.keys(warnMessage).length && (
                  <Tooltip
                    placement="rightTop"
                    title={
                      <>
                        {Object.keys(warnMessage).map((k) => (
                          <p>{warnMessage[k]}</p>
                        ))}
                      </>
                    }
                  >
                    <Tag
                      style={{ border: 'none', padding: '0 2px', marginLeft: '8px' }}
                      color="orange"
                    >
                      <Icon type="delete" style={{ fontSize: '12px' }} />
                    </Tag>
                  </Tooltip>
                )}
                <Badge style={{ marginLeft: '8px', zIndex: 1 }} dot={configFieldId !== undefined} />
              </div>
              <span className="field-code">
                {unitType === 'SECTION' ? fieldAlias : fieldCodeAlias}
              </span>
            </div>
          );
        },
      },
      {
        name: 'custType',
        width: 90,
        renderer: ({ text: _, record, value }) => {
          let text = `${_ || ''}`;
          if (record.get("aggregationFlag")) {
            text += `(${intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')})`;
          }
          return <Tag color={value === "STD" ? "gray" : "yellow"} className="cust-type-tag">{text}</Tag>;
        },
      },
      showAggregationCode && {
        name: 'aggregationCode',
        width: 90,
      },
      ['TABPANE', 'COLLAPSE'].includes(unitType) && {
        name: 'defaultActive',
        width: 100,
        renderer: ({ text, record }) => {
          if (record.get("aggregationFlag")) return "-";
          return text;
        },
      },
      !pureVirtual && {
        name: 'field.modelName',
        width: 150,
        minWidth: 80,
      },
      (!pureVirtual || isSection) && {
        name: 'widget.fieldWidget',
        width: 100,
      },
      hasRenderOptions && {
        name: 'renderOptions',
        width: 100,
      },
      this.specialConfig && {
        name: "uiFeature",
        width: 120,
        renderer: ({value}) => (value || '').split(",").map(i => this.uiFeatureTranslateMap[i] || i).join(","),
      },
      {
        name: 'visible',
        width: 50,
        lock: "right",
        editor: () => this.batchFlag.flag,
        renderer: ({ text, value, record }) => {
          if (record.get("fxFlag") && !record.getField("visible")!.isDirty() && record.get("fxFlag").visible) return "fx";
          return this.batchFlag.flag ? text : checkStatusRenderer(value);
        },
      },
      isInputUnit && {
        name: 'fieldEditable',
        width: 50,
        lock: "right",
        editor: (record) => this.batchFlag.flag ? <Select optionsFilter={(r) => fx3OptionsFilter(r, record)} />: false,
        renderer: ({ text, value, record }) => {
          if (record.get("fxFlag") && !record.getField("fieldEditable")!.isDirty() && record.get("fxFlag").editable) return "fx";
          return this.batchFlag.flag ? text : checkStatusRenderer(value);
        },
      },
      isInputUnit && {
        name: 'fieldRequired',
        width: 50,
        lock: "right",
        editor: (record) => this.batchFlag.flag ? <Select optionsFilter={(r) => fx3OptionsFilter(r, record)} />: false,
        renderer: ({ text, value, record }) => {
          if (record.get("fxFlag") && !record.getField("fieldRequired")!.isDirty() && record.get("fxFlag").required) return "fx";
          return this.batchFlag.flag ? text : checkStatusRenderer(value);
        },
      },
      isFormType && {
        name: 'formRow',
        width: 50,
        editor: () => this.batchFlag.flag,
        lock: "right",
      },
      hasColConfig && {
        name: 'formCol',
        width: 50,
        editor: () => this.batchFlag.flag,
        lock: "right",
      },
      hasSeq && {
        name: 'gridSeq',
        width: 50,
        editor: () => this.batchFlag.flag,
        lock: "right",
      },
      isGrid && {
        name: 'gridFixed',
        width: 80,
      },
      isSection && {
        name: "relatedUnitName",
        width: 150,
      },
      isSearchBarType &&
      sortedEditorFlag === 1 &&
      sortedEnabled !== 0 && {
        name: 'sortedFlag',
        width: 100,
        renderer: ({ value }) => checkStatusRenderer(value),
      },
      isSearchBarType && {
        name: 'widget.multipleFlag',
        width: 100,
        header: intl.get('hpfm.individual.model.config.multiple').d('多选'),
        renderer: ({ value }) => checkStatusRenderer(value),
      },
      isSearchBarType && {
        name: 'mergeFlag',
        width: 100,
        renderer: ({ value }) => checkStatusRenderer(value),
      },
      {
        name: '_op',
        header: intl.get('hzero.common.button.action').d("操作"),
        lock: "right",
        width: 90,
        renderer: ({ record }) => {
          const isStd = record.get("custType") === "STD";
          const operator = [
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => {
                this.cacheTableScroll();
                this.props.openFieldDetailImpl(
                  record,
                  this.openFieldDetailOptions({
                    tableDs: this.tableDS,
                    dsStatus: this.props.editable ? 1 : 0,
                    unitInfoFun: () => this.formDS.current ? this.formDS.current.toJSONData() : {},
                    callback: this.queryUnit,
                    initUnitType: this.props.unitType,
                    uniqueUiFeatureMap: this.uniqueUiFeatureMap || {},
                    menuCode: this.props.menuCode,
                  })
                );
              }}
            >
              {this.props.editable ? intl.get("hzero.common.button.edit").d("编辑") : intl.get("hzero.common.button.view").d("查看")}
            </Button>,
            this.props.editable && record.get("configFieldId") && (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                loading={record.getState("__onDelete")}
                onClick={async () => {
                  if (await Modal.confirm({
                    title: intl.get('hzero.common.message.confirm').d("提示"),
                    children: isStd
                    ? intl.get("hzero.common.message.confirm.resetData").d("确定重置数据")
                    : intl.get("hzero.common.message.confirm.delete").d("是否删除此条记录"),
                  }) !== "ok") {
                    return;
                  }
                  this.deleteField(record);
                }}
              >
                {isStd ? intl.get("hzero.common.button.reset").d("重置") : intl.get('hzero.common.button.delete').d("删除")}
              </Button>
            ),
          ];
          if (operator.filter(Boolean).length > 0) return <div className="operator-wrap">{operator}</div>;
          else return "-";
        },
      },
    ].filter(Boolean) as ColumnProps[];
    this.forceUpdate();
  }

  openFieldDetailOptions(baseOptions) {
    return baseOptions;
  }

  deleteField = (record) => {
    record.setState({ __onDelete: true });

    this.deleteFieldApi(record).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.queryUnit();
        return true;
      }
      return false;
    }).finally(() => {
      record.setState({ "__onDelete": false });
    });
  }

  // eslint-disable-next-line no-unused-vars
  deleteFieldApi(record): Promise<any> {
    throw new Error('Method not implemented.');
  }

  createField = () => {
    this.cacheTableScroll();
    this.props.openFieldDetailImpl(
      null,
      this.openFieldDetailOptions({
        dsStatus: 3,
        tableDs: this.tableDS,
        unitInfoFun: () => this.formDS.current ? this.formDS.current.toJSONData() : {},
        callback: this.queryUnit,
        initUnitType: this.props.unitType,
        uniqueUiFeatureMap: this.uniqueUiFeatureMap || {},
        menuCode: this.props.menuCode,
      })
    );
  }

  batchUpdate = async (cancelFlag) => {
    const updateTable = ({ flag, width }) => {
      this.tableColumns.forEach(column => {
        if (["visible", "fieldEditable", "fieldRequired"].includes(column.name!)) {
          // eslint-disable-next-line no-param-reassign, prefer-destructuring
          column.width = width[0];
        }
        if (["gridSeq", "formRow", "formCol"].includes(column.name!)) {
          // eslint-disable-next-line no-param-reassign, prefer-destructuring
          column.width = width[1];
        }
      });
      this.batchFlag.flag = flag;
      this.tableDS.batchUnSelect(this.tableDS.selected);
      this.forceUpdate();
    };
    // 保存
    if (this.batchFlag.flag) {
      if (!cancelFlag) {
        if (!this.tableDS.selected.length) return;
        const validate = await Promise.all((this.tableDS.selected).map(r => r.validate(true)));
        if (validate.some(valid => !valid)) return;
        const configId = (this.formDS.current!.get("config") || {}).id;
        const selectedData = (this.tableDS.selected).map(r => {
          const originData = r.toJSONData();
          return { ...originData, configId };
        });
        const { templateId } = this.props;
        return request(this.mode === "tpl"
          ? `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/save/batch?templateId=${templateId}`
          : `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/save/batch`, {
            body: selectedData,
            method: 'POST',
          }, { encryptBody: true }
        ).then(res => {
          if (!res || getResponse(res)) {
            notification.success({});
            updateTable({ flag: false, width: [50, 50] });
            this.queryUnit();
          }
        }).catch((e) => {
          notification.error(e);
        });
      } else {
        this.tableDS.reset();
      }
      updateTable({ flag: false, width: [50, 50] });
    } else {
      // 进入批量编辑前先取消选择
      this.tableDS.batchUnSelect(this.tableDS.selected);
      // 进入批量编辑
      updateTable({ flag: true, width: [150, 80] });
    }

  }

  showFieldSetRender = () => {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", border: "1px dashed #c9cdd4", borderRadius: "2px", backgroundColor: "#f7f8fa", padding: "4px 8px 0" }}>
        {this.state.fields.map((l) =>
          l.showFieldFlag ? (
            <Tag color="blue" style={{ cursor: 'default', borderRadius: '10px', marginBottom: "4px" }}>
              {l.fieldName}({l.fieldCodeAlias})
            </Tag>
          ) : null
        )}
      </div>
    );
  };

  resetHeader = () => {
    this.saveHeader(undefined, "delete");
  }

  saveHeader = async (_, _status) => {
    if (!await this.formDS.validate()) return;
    this.setState({ loading: true });

    this.saveHeaderApi(_status).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.queryUnit();
        return true;
      } else {
        // 放finally会导致在queryUnit查询结束前loading就消失
        this.setState({ loading: false });
      }
      return false;
    });
  }


  // eslint-disable-next-line no-unused-vars
  saveHeaderApi(status): Promise<any> {
    throw new Error('Method not implemented.');
  }

  handleSearchBarRef = ref => {
    this.searchBarRef = ref;
  };

  handleChangeTab = activeTabKey => {
    this.setState({ activeTabKey });
  };

  renderViewOnlyUnit() {
    const {
      state: {
        unit: {
          unitType,
          unitTag = "",
        },
      },
    } = this;
    const unitTags = unitTag.split(",");
    const formMaxColEnable = ['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType);
    const isFormType = ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitType);
    const isC7N = unitTags.indexOf("C7N") > -1;
    const isGrid = unitType === "GRID";
    const showCardMaxCount = unitType === "COMMON" && unitTags.includes("AF-EXTRA")
    return (
      <Form dataSet={this.formDS} columns={3} labelLayout={LabelLayout.vertical} useColon={false} className="c7n-pro-vertical-form-display">
        <Output name="unitCode" />
        <Output name="unitName" />
        <Output name="unitType" />
        {unitType === "SECTION" && <Output name="unitTitle" />}
        <Output name="combineName" />
        {formMaxColEnable && <Output name="formMaxCol" />}
        {isFormType && <Output name="labelWrapperCol" />}
        {isGrid && isC7N && <Output name="pageSize" />}
        {isGrid && <Output name="config.pageAsyncFlag" />}
        {isGrid && isC7N && <Output name="config.autoNewlineFlag" />}
        {showCardMaxCount && <Output name="cardMaxCount" renderer={({value, text}) => !value ? 4 : text}/>}
        <Output name="unitTag" colSpan={3} newLine />
        <Output name="sqlIds" colSpan={3} newLine />
        <Output name='sortedEnabled' newLine />
        {isC7N && isGrid && <Output name="config.gridSummary" />}
        {isFormType && isC7N && <Output disabled name="showFieldSet" label={intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段')} newLine renderer={this.showFieldSetRender} />}
      </Form>
    );
  }

  // 默认返回子单据根据单元类型是否允许编辑头信息的标识
  get allowEditHeader() {
    const {
      state: {
        unit,
      },
    } = this;
    const {
      unitType,
      unitTag
    } = unit;
    const unitTags = (unitTag || "").split(",");
    if (unitType === "COMMON" && unitTags.includes("AF-EXTRA")) return true;
    
    return ['FORM', 'FILTER', 'QUERYFORM', 'SECTION', 'GRID', 'SEARCHBAR', 'WORKFLOW'].includes(unitType);
  }

  renderTabBarExtraContent = (): ReactNode => {
    return null;
  }
  handleFilterField = ({ params }) => {
    const { fields, currentUnit = {} } = this.state;
    if (Object.keys(params).length === 0) {
      this.setState({ filterFields: fields });
      this.tableDS.loadData(fields);
    } else {
      const { fieldCode, fieldName, custType, widget } = params;
      const filterFields = fields.filter(field => {
        let flag = true;
        if (fieldCode && fieldName) {
          const fieldAlias = currentUnit.unitType === 'SECTION' ? field.fieldAlias : field.fieldCodeAlias;
          flag = (fieldAlias && fieldAlias.toLowerCase().includes(fieldCode.toLowerCase())) || (field.fieldName && field.fieldName.toLowerCase().includes(fieldName.toLowerCase()));
        }
        if (flag && custType) {
          flag = field.custType === custType;
        }
        if (flag && widget) {
          if (widget === 'NULL') {
            flag = !field.widget || !field.widget.fieldWidget;
          } else {
            flag = field.widget && field.widget.fieldWidget === widget;
          }
        }
        return flag;
      });
      this.setState({ filterFields });
      this.tableDS.loadData(filterFields);
    }
  };

  renderTitle = (): ReactNode => null;

  render() {
    const {
      state: {
        unit,
        loading,
        activeTabKey,
      },
      props: {
        editable,
        tabsClassName,
        pageId,
        uuid,
        templateId,
      },
    } = this;
    const {
      unitType,
      unitTag = "",
      id,
      unitCode,
    } = unit;
    const unitTags = unitTag.split(",");
    const formMaxColEnable = ['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType);
    const isFormType = ['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType);
    const isSearchBarType = unitType === 'SEARCHBAR';
    const isC7N = unitTags.indexOf("C7N") > -1;
    const isGrid = unitType === "GRID";
    const sortedEditorFlag = unit.sortedEditorFlag || 0;
    const showCardMaxCount = unitType === "COMMON" && unitTags.includes("AF-EXTRA")
    const tplParams = this.mode === 'tpl' ? { configId: ((unit || {}).config || {}).id } : {};
    const tplFxParams = this.mode === 'tpl' ? { pageId, templateId, version: uuid } : {};
    const canAddField = !unitTags.includes("DISABLE_EXT_FIELD");
    const batchMode = this.batchFlag && this.batchFlag.flag;
    return (
      <Spin spinning={loading}>
        {this.renderTitle()}
        {id === undefined ? (
          <div className="no-data-block">
            {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
          </div>
        ) : (
          <Tabs
            activeKey={activeTabKey}
            animated={false}
            onChange={this.handleChangeTab}
            className={tabsClassName}
            tabBarExtraContent={this.renderTabBarExtraContent()}
            flex
          >
            <TabPane tab={intl.get('hpfm.individual.view.message.title.unitConfig').d('单元配置')} key="unit" style={{ paddingTop: editable ? '4px' : '' }}>
              {
                editable ? (
                  <>
                    <Form dataSet={this.formDS} columns={3} labelLayout={LabelLayout.float} useColon={false}>
                      <TextField name="unitCode" />
                      <TextField name="unitName" />
                      <TextField name="unitType" />
                      {unitType === "SECTION" && <IntlField name="unitTitle" />}
                      <TextField name="combineName" />
                      {formMaxColEnable && <NumberField name="formMaxCol" />}
                      {isFormType && <TextField name="labelWrapperCol" />}
                      {isGrid && isC7N && <NumberField name="pageSize" />}
                      {isGrid && (
                        <Select name="config.pageAsyncFlag">
                          <Select.Option value={1}>{intl.get("hzero.common.status.yes").d("是")}</Select.Option>
                          <Select.Option value={0}>{intl.get("hzero.common.status.no").d("否")}</Select.Option>
                          <Select.Option value={-1}>{intl.get("hzero.common.status.default").d("默认")}</Select.Option>
                        </Select>
                      )}
                      {isGrid && isC7N && (
                        <Select name="config.autoNewlineFlag">
                          <Select.Option value={1}>{intl.get("hzero.common.status.yes").d("是")}</Select.Option>
                          <Select.Option value={0}>{intl.get("hzero.common.status.no").d("否")}</Select.Option>
                        </Select>
                      )}
                      {showCardMaxCount && (
                        <Select name="cardMaxCount" renderer={({value, text}) => !value ? 4 : text}>
                          {[4, 5, 6].map((i) => (
                            <Select.Option value={i}>{i}</Select.Option>
                          ))}
                        </Select>
                      )}
                      <TextField name="unitTag" colSpan={3} newLine />
                      <TextField name="sqlIds" colSpan={3} newLine />
                      {isSearchBarType && (sortedEditorFlag === 1 ? (
                        <Select name='sortedEnabled' newLine clearButton={false} />
                      ) : (
                        <TextField
                          disabled
                          label={intl.get('hpfm.individual.model.config.sortedEnabled').d('启用排序')}
                          value={intl.get('hzero.common.no').d('否')}
                        />
                      ))}
                      {isC7N && isGrid && <Select name="config.gridSummary" />}
                      {isFormType && isC7N && (
                        <Output
                          disabled
                          name="showFieldSet"
                          colSpan={3}
                          label={intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段')}
                          newLine
                          renderer={this.showFieldSetRender}
                        />
                      )}
                    </Form>
                    {
                      this.allowEditHeader && (
                        <div className='row-button'>
                          <Button funcType={FuncType.raised} color={ButtonColor.primary} onClick={this.saveHeader as any}>{intl.get("hzero.common.button.save").d("保存")}</Button>
                          <Button funcType={FuncType.raised} onClick={this.resetHeader}>{intl.get("hzero.common.button.reset").d("重置")}</Button>
                        </div>
                      )
                    }
                  </>
                ) : this.renderViewOnlyUnit()
              }
            </TabPane>
            <TabPane tab={getFieldConfigAlias(unitType)} key="fields">
              <FilterBarTable
                key={`${unitCode}`}
                buttons={(
                  this.props.editable && canAddField ? [
                    batchMode ? null : (
                      <Button icon="playlist_add" color={ButtonColor.primary} onClick={this.createField}>
                        {intl.get('hpfm.individual.model.config.addExtraField').d('添加扩展字段')}
                      </Button>
                    ),
                    <BatchButton onClick={this.batchUpdate} flag={this.batchFlag} selectedSize={() => this.tableDS.selected.length} />
                  ].concat((batchMode ? null : this.implTableButtons || []) as any) : []
                ) as any}
                selectionMode={this.batchFlag.flag ? SelectionMode.none : this.selectionMode}
                queryBar={TableQueryBarType.none}
                dataSet={this.tableDS}
                columns={this.tableColumns}
                customizedCode={this.customizedCode && `${this.customizedCode}_${unitType}`}
                rowHeight="auto"
                virtual={false}
                virtualCell={false}
                style={{
                  ...this.tableStyle(),
                }}
                filterBarConfig={{
                  autoQuery: false,
                  onQuery: this.handleFilterField,
                  collpaseble: true,
                  collpase: false,
                  editorProps: {
                    widget: {
                      optionsFilter: (r) => {
                        if (r.get("value") === 'NULL') {
                          return true;
                        }
                        switch (unitType) {
                          case 'SECTION': return ["SECTION", "FORM", "GRID"].includes(r.get("value"));
                          case 'SEARCHBAR': return FilterComponentList.includes(r.get("value"));
                          default: return !["SECTION", "FORM", "GRID"].includes(r.get("value"));
                        }
                      }
                    }
                  }
                }}
              />
            </TabPane>
            {isSearchBarType && (
              <TabPane
                tab={intl.get('hpfm.customize.common.filterConfig').d('筛选器配置')}
                key="filter"
                className='unit-config-searchbar-config'
              >
                {activeTabKey === 'filter' && (
                  <SearchBarConfig
                    unitInfo={unit}
                    originFields={this.tableDS.data}
                    onRef={this.handleSearchBarRef}
                    style={this.searchBarStyle}
                    className="search-bar-fix-style"
                    tplParams={tplParams}
                    mode={this.mode}
                    readonly={!editable}
                    tplFxParams={tplFxParams}
                  />
                )}
              </TabPane>
            )}
          </Tabs>
        )}
      </Spin>
    );
  }
}

const fx3OptionsFilter = (record, lineRecord) => {
  if (!lineRecord || lineRecord.get("custType") === "STD") return true;
  // eslint-disable-next-line eqeqeq
  return record.get("value") != -1;
};
