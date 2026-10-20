import React, { Component } from 'react';
import { DataSet, Form, Spin, Table, Tabs, TextField } from 'choerodon-ui/pro';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import { getCurrentUser, getResponse } from 'hzero-front/lib/utils/utils';
import { Tag, Icon } from 'choerodon-ui';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { openFieldDetail } from './modalUtils';
import { unitFieldsDs, unitInfoDs } from '../dataSets';
import SearchBarConfig from './SearchBarConfig';
import {
  unit,
  getSpecialConfig,
} from '../../../../utils/constConfig.js';
import styles from './index.less';

const { TabPane } = Tabs;

@formatterCollections({ code: ['hpfm.individual', 'hpfm.customize', 'hpfm.individual'] })
export default class UnitConfig extends Component<{
  stageId?: string;
  docId?: string;
  unitId?: any;
  headerCollapse?: string[];
}, any> {

  tableColumns: ColumnProps[] = [];

  formDS = new DataSet(unitInfoDs(intl));

  tableDS = new DataSet(unitFieldsDs(intl, { unitInfoFun: () => this.formDS.current ? this.formDS.current.toData() : {} }));
  uConfig: any;
  specialConfig: any;
  uiFeatureTranslateMap: any = {};
  themeConfigFlag?: boolean;

  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      unit: {},
      loading: true,
    };
    const { themeConfigVO } = getCurrentUser();
    if (themeConfigVO && themeConfigVO.enableThemeConfig) this.themeConfigFlag = true;
  }

  componentDidMount() {
    this.queryUnit();
  }

  componentDidUpdate(prevProps) {
    if (this.props.unitId !== prevProps.unitId) this.queryUnit();
  }

  queryUnit = () => {
    if (!this.props.unitId) {
      this.formDS.loadData([]);
      this.setState({ loading: false, unit: {} });
      return;
    }
    this.setState({ loading: true });
    request(`${HZERO_PLATFORM}/v1/customize/unit/detail`, {
      method: "GET",
      query: { unitId: this.props.unitId },
    }).then(res => {
      if (getResponse(res)) {
        this.formDS.loadData(res.unit ? [res.unit] : []);
        this.tableDS.loadData(res.fields || []);

        const { unitTag, unitType } = res.unit || {};
        const unitTags = (unitTag || '').split(",");
        const uTag = unitTags.find((t: string) => t.startsWith("AF-")) || "__no_config__";
        this.uConfig = unit[uTag] || {};
        this.specialConfig = getSpecialConfig(uTag);
        this.uiFeatureTranslateMap = {};
        if (this.specialConfig) {
          this.specialConfig.list.forEach(l => {
            this.uiFeatureTranslateMap[l.value] = l.meaning;
          });
        }
        this.setState({ fields: res.fields || [], unit: res.unit || {}, loading: false });
        this.setTableColumns(unitType, unitTags);
      }
    });
  }

  checkedIconRenderer = checked => <Icon type={checked ? 'check' : 'close'} />;

  setTableColumns(unitType, unitTags) {
    const isFormType = ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitType);
    const isGridType = unitType === "GRID";
    const hasSeq = ["FILTER", "GRID", "COMMON"].includes(unitType);
    const pureVirtual = ['BTNGROUP', 'TABPANE', 'COLLAPSE', "SECTION"].includes(unitType);
    const isCommon = unitType === "COMMON";
    const isSearchBarType = unitType === 'SEARCHBAR';
    const hasBindField = unitTags.includes("C7N-UI") && unitType === "GRID" || this.uConfig.bindField;
    const hasFieldCategory = !['COLLAPSE', "SECTION"].includes(unitType) || unitType === "TABPANE" && unitTags.includes("DOUBLETABS");
    const hasRenderOptions = isCommon && this.uConfig.renderOptions || ['FORM', 'GRID', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType)
    this.tableColumns = [
      {
        name: 'fieldCode',
        width: 200,
        renderer: ({ text, record }) => {
          return (
            <a onClick={() => openFieldDetail(record, isSearchBarType)}>
              {text}
            </a>
          );
        },
      },
      {
        name: 'fieldName',
        width: 150,
      },
      ['TABPANE', 'COLLAPSE'].includes(unitType) && {
        name: 'defaultActive',
        width: 100,
      },
      !hasFieldCategory && {
        name: 'field.fieldCategoryMeaning',
        width: 170,
        renderer: ({ value, record }) => {
          let text = `${value || ''}`;
          if (record.get("aggregationFlag")) {
            text += `(${intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')})`;
          }
          return text;
        },
      },
      !pureVirtual && {
        name: 'field.modelName',
        width: 200,
      },
      hasBindField && {
        name: 'bindField',
        width: 150,
      },
      !pureVirtual && {
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
        renderer: ({value}) => (value || ',').split(",").map(i => <Tag>{this.uiFeatureTranslateMap[i] || i}</Tag>),
      },
      isFormType && {
        name: 'formRow',
        width: 60,
      },
      isFormType && {
        name: 'formCol',
        width: 60,
      },
      hasSeq && {
        name: 'gridSeq',
        width: 60,
      },
      isGridType && {
        name: 'gridFixed',
        width: 80,
      },
      isSearchBarType && {
        name: 'sortedFlag',
        width: 100,
        hidden: !this.formDS.current || this.formDS.current.get('sortedEnabled') !== 1,
        renderer: ({ value }) => {
          return this.checkedIconRenderer(value)
        },
      },
      isSearchBarType && {
        name: 'widget.multipleFlag',
        width: 100,
        renderer: ({ value }) => this.checkedIconRenderer(value),
      },
      isSearchBarType && {
        name: 'mergeFlag',
        width: 100,
        renderer: ({ value }) => this.checkedIconRenderer(value),
      },
      isSearchBarType && {
        name: 'fieldVisible',
        width: 60,
        renderer: ({ value }) => this.checkedIconRenderer(value),
      },
    ].filter(Boolean) as unknown[] as ColumnProps[];
    this.forceUpdate();
  }

  showFieldSetRender = () => {
    return this.state.fields.map(l =>
      l.showFieldFlag ? (
        <Tag color="blue" style={{ cursor: 'default', borderRadius: '10px' }}>
          {l.fieldName}({l.fieldCodeAlias})
        </Tag>
      ) : null
    );
  }

  render() {
    const {
      unit,
      loading,
      fields,
    } = this.state;
    const {
      unitType,
      unitTag = "",
      id,
      sortedEnabled,
    } = unit;
    const { unitId } = this.props;
    const formMaxColEnable = ['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType);
    const unitTags = unitTag.split(",");
    const isFormType = ['FORM', 'QUERYFORM', 'WORKFLOW'].includes(unitType);
    const showCardMaxCount = unitType === "COMMON" && unitTags.includes("AF-EXTRA")
    const isSearchBarType = unitType === 'SEARCHBAR';
    return (
      <Spin spinning={loading}>
        {id === undefined ? (
          <div className="no-data-block">
            {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
          </div>
        ) : (
          <Tabs
            defaultActiveKey="unit"
            animated={false}
            flex
            className={styles['unit-config-tabs']}
          >
            <TabPane tab={intl.get('hpfm.individual.view.message.title.unitConfig').d('单元配置')} key="unit" style={{ paddingTop: '16px' }}>
              <Form dataSet={this.formDS} columns={3} labelLayout={LabelLayout.float} useColon={false}>
                <TextField name="unitCode" />
                <TextField name="unitName" />
                <TextField name="unitType" />
                <TextField name="menuName" />
                <TextField name="combineName" />
                <TextField name="unitGroupName" />
                {formMaxColEnable && <TextField name="formMaxCol" />}
                {isFormType && <TextField name="labelWrapperCol" />}
                <TextField name="enableFlag" />
                {showCardMaxCount && <TextField name="cardMaxCount" renderer={({value, text}) => !value ? 4 : text}/>}
                {isSearchBarType && <TextField name='sortedEnabled' />}
                <TextField name="unitTag" colSpan={3} newLine />
                <TextField name="sqlIds" colSpan={3} newLine />
                {isFormType && unitTags.includes("C7N") && <TextField name="showFieldSet" disabled label={intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段')} newLine renderer={this.showFieldSetRender} />}
              </Form>
            </TabPane>
            <TabPane tab={intl.get('hpfm.customize.common.fieldConfig').d('字段配置')} key="fields" style={{ paddingTop: '16px' }}>
              <Table
                selectionMode={SelectionMode.none}
                dataSet={this.tableDS}
                columns={this.tableColumns}
                style={{
                  maxHeight: `calc(100vh - ${(this.themeConfigFlag ? 387 : 382) + (this.props.headerCollapse && this.props.headerCollapse.includes("basic") ? 54 : 0)}px)`,
                }}
              />
            </TabPane>
            {isSearchBarType && (
              <TabPane tab={intl.get('hpfm.customize.common.filterConfig').d('筛选器配置')} key='filter'>
                <SearchBarConfig
                  unitId={unitId}
                  originFields={fields}
                  unitInfo={unit}
                />
              </TabPane>
            )}
          </Tabs>
        )}
      </Spin>
    );
  }
}
