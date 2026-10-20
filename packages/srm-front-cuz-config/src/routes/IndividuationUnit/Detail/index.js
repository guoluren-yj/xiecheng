/* eslint-disable react/state-in-constructor */
/* eslint-disable react/jsx-props-no-spreading */
import React, { Component, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Table,
  Icon,
  Spin,
  Select,
  Tooltip,
  Menu,
  Dropdown,
  Switch,
  Popconfirm,
  Tabs,
  Tag,
  TreeSelect,
  InputNumber,
  Modal as H0Mdal,
} from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind, memoize } from 'lodash-decorators';
import { Modal as ProModal } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import { connect } from 'dva';

import { queryMapIdpValue } from 'services/api';
import TLEditor from "hzero-front/lib/components/TLEditor"
import { HZERO_HMDE, HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from 'hzero-front/lib/utils/request';
import { LovMulti } from 'srm-front-cuz/components';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import {
  colOptions,
  getFieldNameAlias,
  getFieldConfigAlias,
  getAddFieldAlias,
  getDefaultActiveAlias,
  commonTypeUnitTags,
  unit,
  getSpecialConfig,
} from '@/utils/constConfig.js';
import { transfromTreeSelectKey } from '@/utils/util';
import { queryBusinessObjectRelationsTree } from '@/services/individuationUnitService';
import SelectFieldLov from '@/components/SelectFieldLov';
import Modal from './Modal';
import styles from '../style/index.less';
import { formsLayouts, formsLayoutsLong, getIntlMapping, UEDDisplayFormItem } from '../utils';
import SearchBarConfig from '../SearchBarConfig';

const rowKey = 'id';
const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@connect(({ loading = {} }) => ({
  saveLoading: loading.effects['individuationUnitCuz/modifyUnit'],
  fetchLoading: loading.effects['individuationUnitCuz/fetchUnitDetail'],
  deleteFieldLoading: loading.effects['individuationUnitCuz/deleteField'],
}))
export default class IndividuationUnitDetail extends Component {
  searchBarRef;

  scrollX = 0;

  state = {
    idpFlag: false,
    unitInfo: {},
    fields: [],
    modelVisible: false,
    modalData: {},
    relationModals: [],
    gridFixedOptions: [],
    unitTagOptions: [],
    renderOptions: [],
    groupUnits: [],
    widgetType: [],
    dateFormat: [],
    whereOptions: [],
    widgetTypeObj: {},
    unitList: [],
    fieldList: {},
    tabActiveKey: 'field',
    uniqueUiFeatureMap: {},
  };

  componentDidMount() {
    const { unitId, detailGroupId, dispatch, unitType } = this.props;
    this.fetchUnitDetail({ unitId });
    this.fetchLovData(unitType);
    dispatch({
      type: 'individuationUnitCuz/queryGroupUnits',
      params: { unitGroupId: detailGroupId },
    }).then((res) => {
      if (res) {
        this.setState({ groupUnits: res.length > 0 ? res : [] });
      }
    });
    this.queryRelatedUnits(unitId);
  }

  @Bind()
  queryRelatedUnits(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'individuationUnitCuz/queryRelatedUnits',
      payload: { unitId: id },
    }).then((res) => {
      if (!isEmpty(res)) {
        const unitList = res || [];
        const fieldList = {};
        unitList.forEach((i) => {
          fieldList[i.unitId] = i.unitFields || [];
        });
        this.setState({ unitList, fieldList });
      } else {
        this.setState({ unitList: [], fieldList: {} });
      }
    });
  }

  @Bind()
  fetchUnitDetail(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'individuationUnitCuz/fetchUnitDetail',
      params,
    }).then((res) => {
      if (res) {
        const { unit = {}, fields = [] } = res || {};
        const { combineCode, unitType, unitTag } = unit;
        const unitTags = (unitTag || '').split(",");
        const uTag = unitTags.find(t => t.startsWith("AF-")) || "__no_config__";
        const specialConfig = getSpecialConfig(uTag);
        let uniqueUiFeatureList = [];
        const aggregationGroup = fields.filter((i) => i.aggregationFlag);
        if (specialConfig) {
          specialConfig.list.forEach(l => {
            if (l.unique) uniqueUiFeatureList.push(l.value);
          });
        }

        const uniqueUiFeatureMap = {};
        if (uniqueUiFeatureList.length) {
          fields.forEach(field => {
            const uiFeatures = (field.uiFeature || "").split(",");
            if (uiFeatures.length) {
              uiFeatures.forEach((value) => {
                if (uniqueUiFeatureList.includes(value)) {
                  uniqueUiFeatureMap[value] = field.fieldCodeAlias;
                }
              })
            }
          })
        }
        this.setState({
          fields,
          aggregationGroup,
          uniqueUiFeatureMap,
          unitInfo: unit,
        });
        // this.fetchRelationModal({ modelId, unitId });
        const pureVirtual = ['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
        if (!pureVirtual) {
          this.fetchRelationModal({
            tenantId: getCurrentOrganizationId(),
            businessObjectCode: combineCode,
          });
        }
      }
    });
  }

  @Bind()
  fetchRelationModal(params) {
    queryBusinessObjectRelationsTree(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        const boRangeStr = (this.props.form.getFieldValue("businessObjectRange") || (this.state.unitInfo || {}).businessObjectRange || "")
        const modelList = transfromTreeSelectKey(
          [result],
          'businessObjectRelationList',
          'relBusinessObjectName',
          'businessObjectRelationId',
          boRangeStr ? boRangeStr.split(',') : []
        );
        this.setState({ relationModals: modelList || [] });
      } else {
        this.setState({ relationModals: [] });
      }
    });
  }

  @Bind
  fetchLovData(unitType) {
    queryMapIdpValue({
      gridFixedOptions: 'HPFM.CUST.GIRD.FIXED',
      renderOptions: 'HPFM.CUST.RENDER_OPTIONS',
      condOptions: 'HPFM.CUST.UNIT_COND_OPTIONS',
      widgetType:
        unitType === 'BTNGROUP' ? 'HPFM.CUST.TABLE_BTN_TYPE' : 'HPFM.CUST.FIELD_COMPONENT',
      dateFormat: 'HPFM.CUST.DATE_FORMAT',
      whereOptions: 'HPFM.CUST.FIELD_QUERY_REALTION',
      unitTagOptions: 'HPFM.CUST.UNIT_LABEL',
      relationShip: 'HPFM.CUST.FIELD_COND_REALTION',
    }).then((res) => {
      const { unitType } = this.props;
      if (res) {
        const widgetTypeObj = {};
        (res.widgetType || []).forEach((i) => {
          widgetTypeObj[i.value] = i.meaning;
        });
        const codes = {
          gridFixedOptions: res.gridFixedOptions || [],
          renderOptions: res.renderOptions || [],
          condOptions: res.condOptions || [],
          widgetType: res.widgetType || [],
          dateFormat: res.dateFormat || [],
          whereOptions: res.whereOptions || [],
          unitTagOptions: res.unitTagOptions || [],
          relationShip: res.relationShip || [],
        };
        if (unitType !== "COMMON") {
          codes.unitTagOptions = codes.unitTagOptions.filter(t => !commonTypeUnitTags.includes(t.value));
        } else {
          codes.unitTagOptions = codes.unitTagOptions.filter(t => commonTypeUnitTags.includes(t.value));
        }
        this.setState({
          idpFlag: true,
          widgetTypeObj,
          codes,
          ...codes,
        });
      }
    });
  }

  @Bind()
  save(extraParam = {}) {
    const { form, dispatch, unitId } = this.props;
    const { unitInfo = {}, tabActiveKey } = this.state;
    const { unitType } = unitInfo;
    const isSeachBarType = unitType === 'SEARCHBAR';
    form.validateFields((err, values) => {
      if (!err) {
        const params = values;
        if (!isSeachBarType) {
          params.sqlIds = values.sqlIds.join(',');
        } else if (params.sortedEnabled !== 1) {
          params.stdFieldSortedFlag = 0;
        }
        if (!params.sqlIds || (params.sqlIds && params.sqlIds.length === 0)) params.sqlIds = null;
        params.unitTag = values.unitTag.join(',');
        if (!params.gridMaxPageCount) params.gridMaxPageCount = 100;
        dispatch({
          type: 'individuationUnitCuz/modifyUnit',
          params: {
            ...unitInfo,
            ...params,
            ...extraParam,
          },
        }).then((res) => {
          if (res && !res.failed) {
            notification.success();
            this.queryRelatedUnits(unitId);
            this.setState({
              unitInfo: {
                ...unitInfo,
                ...params,
              },
            });
            if (!['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType)) {
              this.fetchRelationModal({
                tenantId: getCurrentOrganizationId(),
                businessObjectCode: unitInfo.combineCode,
              });
            }
            // 保存头时刷新筛选器配置，主要是为了同步多字段排序
            if (
              tabActiveKey === 'filter' &&
              this.searchBarRef &&
              this.searchBarRef.querySearchBarDetail
            ) {
              this.searchBarRef.querySearchBarDetail();
            }
          } else if (
            res &&
            res.failed === true &&
            res.type === 'warn' &&
            params.extFieldSortedFlag === 0
          ) {
            // 筛选器关闭租户扩展字段可排序标识时 需二次确认
            H0Mdal.confirm({
              content: res.message,
              title: intl
                .get('hpfm.individuationUnit.view.confirm.disabledExtFieldSortdFlag')
                .d('确认禁用扩展字段排序吗？'),
              onOk: () => this.save({ secondConform: 1 }),
            });
          } else {
            getResponse(res);
          }
        });
      }
    });
  }

  @Bind()
  handleEdit(fieldInfo = {}) {
    // C7NModal.open({
    //   title: "字段配置",
    //   key: C7NModal.key(),
    //   drawer: true,
    //   style: {
    //     width: 720,
    //   },
    //   children: (
    //     <NewModal fieldInfo={fieldInfo} />
    //   ),
    // });
    this.setState({ modelVisible: true, modalData: fieldInfo });
  }

  @Bind()
  handleDelete(fieldId = '') {
    this.props
      .dispatch({
        type: 'individuationUnitCuz/deleteField',
        params: {
          unitFieldId: fieldId,
        },
      })
      .then((res) => {
        if (res) {
          notification.success();
          const { unitId } = this.props;
          this.fetchUnitDetail({ unitId });
        }
      });
  }

  /**
   * @deprecated
   */
  @Bind()
  openTransformFieldModal(record) {
    const { combineCode } = this.state.unitInfo;

    const ref = {};
    const ModalChildren = Form.create({ fieldNameProp: null })(function _(props) {
      const { form, formRef } = props;
      const [treeData, setTreeData] = useState([]);
      useMemo(() => {
        formRef.current = form;
      }, []);
      useEffect(() => {
        request(`${HZERO_HMDE}/v1/business-object-relations/tree`, {
          method: 'GET',
          query: {
            businessObjectCode: combineCode,
          },
        })
          .then((res) => {
            if (getResponse(res)) {
              setTreeData(
                transfromTreeSelectKey(
                  [res],
                  'businessObjectRelationList',
                  'relBusinessObjectName',
                  'businessObjectRelationId'
                )
              );
            }
            return [];
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e);
            return [];
          });
      }, []);
      const fieldChange = useCallback((_1, r) => {
        form.setFieldsValue({
          fieldCode: r.fieldCode,
          modelFieldCode: r.modelCode,
          fieldAlias: r.fieldCodeCamel,
          fieldId: r.fieldId,
        });
      }, []);
      const { modelSelect } = form.getFieldsValue();
      return (
        <Form className={styles['unit-editor-form2']}>
          <Form.Item label={intl.get('hpfm.customize.common.modelSelect').d('模型选择')}>
            {form.getFieldDecorator('modelSelect')(
              <TreeSelect
                allowClear
                style={{ width: '100%' }}
                treeDefaultExpandAll
                treeData={treeData}
              />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.customize.common.fieldSelect').d('字段选择')}>
            <SelectFieldLov
              displayWithName
              disabled={!modelSelect}
              queryParams={{
                unitId: props.unitId,
                modelCode: modelSelect,
              }}
              onChangeField={fieldChange}
            />
          </Form.Item>
          <Form.Item label={intl.get('hpfm.customize.common.fieldCode').d('字段编码')}>
            {form.getFieldDecorator('fieldCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.customize.common.fieldCode').d('字段编码'),
                    })
                    .d(`${intl.get('hpfm.customize.common.fieldCode').d('字段编码')}不能为空`),
                },
              ],
            })(<Input disabled />)}
            {form.getFieldDecorator('modelFieldCode')}
            {form.getFieldDecorator('fieldId')}
          </Form.Item>
          <Form.Item
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.fieldAlias')
              .d('字段别名')}
          >
            {form.getFieldDecorator('fieldAlias')(
              <Input trim inputChinese={false} name="fieldAlias" />
            )}
          </Form.Item>
        </Form>
      );
    });
    ProModal.open({
      title: intl.get('hpfm.customize.common.toEntityField').d('转换为实体字段'),
      drawer: true,
      style: {
        width: '380px',
      },
      children: <ModalChildren unitId={this.props.unitId} formRef={ref} />,
      onOk: async () => {
        const validateRes = await new Promise((resolve, reject) => {
          ref.current.validateFields((err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        }).catch(() => {
          return null;
        });
        if (!validateRes) return false;
        const { modelFieldCode, fieldCode, fieldAlias, fieldId = -1 } = validateRes;
        const success = await request(`${HZERO_PLATFORM}/v1/customize/unit/transform-entity`, {
          method: 'POST',
          body: {
            id: record.id,
            unitId: this.props.unitId,
            modelCode: modelFieldCode,
            fieldCode,
            fieldAlias,
            fieldId,
          },
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            this.fetchUnitDetail({ unitId: this.props.unitId });
            return true;
          }
          return false;
        });
        return success;
      },
      onCancel: () => { },
    });
  }

  @Bind()
  renderFieldName(fieldName, record) {
    const { unitInfo = {} } = this.state;
    const { fieldCodeAlias, cuszFieldName, fieldNameType, fieldAlias } = record;
    const menu = (
      <Menu>
        <Menu.Item key="edit" onClick={() => this.handleEdit(record)}>
          <Icon type="edit" />
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Menu.Item>
        <Menu.Item key="delete">
          <Popconfirm
            title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
            onConfirm={() => this.handleDelete(record[rowKey])}
          >
            <Icon type="delete" style={{ marginRight: 8 }} />
            {intl.get('hzero.common.button.delete').d('刪除')}
          </Popconfirm>
        </Menu.Item>
        {/* {['FORM', 'GRID', 'QUERYFORM', 'FILTERFORM', 'SEARCHBAR'].includes(unitInfo.unitType) &&
          !field.modelCode && (
            <Menu.Item key="toEntityField" onClick={() => this.openTransformFieldModal(record)}>
              {intl.get('hpfm.customize.common.toEntityField').d('转换为实体字段')}
            </Menu.Item>
          )} */}
      </Menu>
    );

    return (
      <div>
        <div className={styles['unit-operator']}>
          <Dropdown overlay={menu} trigger={['click']}>
            <a>.&nbsp;.&nbsp;.</a>
          </Dropdown>
        </div>
        <div style={{ fontWeight: 600, color: '#666' }}>
          {fieldNameType === 'CUSTOMIZE' ? cuszFieldName : fieldName}
        </div>
        <div style={{ color: '#a5a5a5' }}>
          {unitInfo.unitType === 'SECTION' ? fieldAlias : fieldCodeAlias}
        </div>
      </div>
    );
  }

  @Bind()
  // eslint-disable-next-line func-names
  @memoize(function () {
    const {
      unitInfo: { unitType, unitTag },
      idpFlag,
    } = this.state;
    return `${unitType}+${unitTag}+${idpFlag}`;
  })
  getColumns() {
    const {
      unitInfo: { unitType, unitTag },
      widgetTypeObj,
    } = this.state;
    const unitTags = (unitTag || '').split(",");
    const uTag = unitTags.find(t => t.startsWith("AF-")) || "__no_config__";
    const uConfig = unit[uTag] || {};
    const specialConfig = getSpecialConfig(uTag);
    let uiFeatureTranslateMap = {};
    if (specialConfig) {
      specialConfig.list.forEach(i => {
        uiFeatureTranslateMap[i.value] = i.meaning;
      });
    }
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const isCommon = unitType === "COMMON";

    const hasFieldCategory = !['COLLAPSE', "SECTION"].includes(unitType) || unitType === "TABPANE" && unitTags.includes("DOUBLETABS");
    const hasBindField = unitTags.includes("C7N-UI") && unitType === "GRID" || uConfig.bindField;
    const hasRenderOptions = isCommon && uConfig.renderOptions || ['FORM', 'GRID', 'QUERYFORM', 'FILTER'].includes(unitType)
    const pureVirtual = ['BTNGROUP', 'TABPANE', 'COLLAPSE', 'SECTION'].includes(unitType);
    const isSeachBarType = unitType === 'SEARCHBAR';
    const isSection = unitType === 'SECTION';
    let commonColumns = [
      {
        title: getFieldNameAlias(unitType),
        dataIndex: 'fieldName',
        render: this.renderFieldName,
        width: 200,
      },
      ['TABPANE', 'COLLAPSE'].includes(unitType) && {
        title: getDefaultActiveAlias(unitType),
        dataIndex: 'defaultActive',
        width: 100,
        render: yesOrNoRender,
      },
      hasFieldCategory && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldType').d('字段类型'),
        dataIndex: 'field.fieldCategoryMeaning',
        width: 170,
        render: (_val, record) => {
          let text = `${record.field.fieldCategoryMeaning || ''}`;
          if (record.aggregationFlag) {
            text += `(${intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')})`;
          }
          return text;
        },
      },
      !pureVirtual && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.model').d('所属模型'),
        dataIndex: 'field.modelName',
        width: 200,
      },
      (hasBindField) && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.bindField').d('字段绑定'),
        dataIndex: 'bindField',
        width: 150,
      },
      !pureVirtual && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.widgetType').d('组件类型'),
        dataIndex: 'field.modelFieldWidget.fieldWidget',
        width: 100,
        render: (text, record) => {
          if (record.widget && record.widget.fieldWidget) {
            return widgetTypeObj[record.widget.fieldWidget];
          } else {
            return widgetTypeObj[text] || text;
          }
        },
      },
      specialConfig && {
        title: intl.get('hpfm.customize.common.specialProps').d('UI特性'),
        dataIndex: "uiFeature",
        width: 120,
        render: (value) => (value || ',').split(",").filter(Boolean).map(i => uiFeatureTranslateMap[i] || i).join(","),
      },
      hasRenderOptions && {
        title: intl
          .get('hpfm.individuationUnit.model.individuationUnit.renderType')
          .d('渲染方式'),
        dataIndex: 'renderOptions',
        width: 100,
        render: (text) => getIntlMapping(text) || text,
      },
      isSection && {
        title: intl.get('hpfm.customize.common.relatedUnitName').d('关联单元名称'),
        dataIndex: 'relatedUnitName',
        width: 150,
      },
      isSection && {
        title: intl.get('hpfm.customize.common.relatedUnitCode').d('关联单元编码'),
        dataIndex: 'fieldCode',
        width: 200,
        render(val, record) {
          return (record.widget || {}).fieldWidget ? val : '';
        },
      },
    ];
    if (isFormType) {
      commonColumns = commonColumns.concat(this.getFormColumns());
    } else if (unitType === 'GRID') {
      commonColumns = commonColumns.concat(this.getTableColumns());
    } else if (['FILTER', 'TABPANE', 'COLLAPSE', 'SECTION', "COMMON"].includes(unitType)) {
      commonColumns = commonColumns.concat(this.getFilterFormColumns());
    } else if (unitType === 'BTNGROUP') {
      commonColumns = commonColumns.concat(
        {
          title: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
          dataIndex: 'gridSeq',
          width: 60,
        }
        //   {
        //   title: intl.get('hpfm.individual.model.config.eventCode').d('事件编码'),
        //   width: 130,
        //   dataIndex: 'eventCode',
        // }
      );
    } else if (unitType === 'SEARCHBAR') {
      commonColumns = commonColumns.concat(this.getSearchBarColumns());
    }
    commonColumns = commonColumns.filter(Boolean);
    this.scrollX = commonColumns.reduce((countWidth, next) => countWidth + (next.width || 100), 0);
    return commonColumns;
  }

  @Bind()
  getFormColumns() {
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.row').d('行'),
        dataIndex: 'formRow',
        width: 60,
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.col').d('列'),
        dataIndex: 'formCol',
        width: 60,
      },
    ];
  }

  @Bind()
  getTableColumns() {
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
        dataIndex: 'gridSeq',
        width: 60,
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.fixed').d('冻结'),
        dataIndex: 'gridFixed',
        width: 80,
        render: (text) => getIntlMapping(text) || text,
      },
    ];
  }

  @Bind()
  getFilterFormColumns() {
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
        dataIndex: 'gridSeq',
        width: 60,
      },
    ];
  }

  @Bind()
  getSearchBarColumns() {
    const {
      unitInfo: { sortedEnabled },
    } = this.state;
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.position').d('位置'),
        dataIndex: 'gridSeq',
        width: 60,
      },
      {
        title: intl.get('hpfm.individual.model.config.visible').d('显示'),
        dataIndex: 'fieldVisible',
        width: 60,
        render: (text) => (text !== 0 ? <Icon type="check" /> : null),
      },
      sortedEnabled && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.sortedFlag').d('可排序'),
        dataIndex: 'sortedFlag',
        width: 100,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.mutilFlag').d('多选'),
        dataIndex: 'widget.multipleFlag',
        width: 100,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.mergeQuery').d('合并查询'),
        dataIndex: 'mergeFlag',
        width: 100,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
    ].filter(Boolean);
  }

  @Bind()
  addNewField() {
    this.setState({ modelVisible: true, modalData: {} });
  }

  @Bind()
  closeModal() {
    this.setState({ modelVisible: false, modalData: {} });
  }

  @Bind()
  handleSearchBarRef(ref) {
    this.searchBarRef = ref;
  }

  @Bind()
  handleChangeTab(tabActiveKey) {
    this.setState({ tabActiveKey });
    // if (tabActiveKey === 'filter' && this.searchBarRef) {
    // this.searchBarRef.querySearchBarDetail();
    // }
  }

  render() {
    const {
      state: {
        unitInfo = {},
        fields = [],
        relationModals = [],
        modelVisible,
        modalData,
        aggregationGroup = [],
        gridFixedOptions,
        renderOptions = [],
        condOptions = [],
        widgetType = [],
        dateFormat = [],
        whereOptions = [],
        unitTagOptions,
        unitList,
        fieldList,
        tabActiveKey,
        codes,
        uniqueUiFeatureMap,
      },
      props: {
        fetchLoading,
        saveLoading,
        deleteFieldLoading,
        form: { getFieldDecorator = () => { }, getFieldValue = () => { }, setFieldsValue = () => { } },
        backToIndex = () => { },
        unitId,
      },
    } = this;
    const {
      unitCode,
      unitName,
      unitType,
      unitTag,
      menuName,
      combineName,
      modelName,
      sqlIds = '',
      enableFlag,
      formMaxCol,
      labelCol,
      wrapperCol,
      unitGroupName,
      sortedEnabled,
      combineCode,
      pageAsyncFlag = -1,
      extFieldSortedFlag,
      stdFieldSortedFlag,
      orderCount,
      gridMaxPageCount,
      businessObjectRange,
      supportBusinessObject,
      cardMaxCount,
      hiddenFlag,
    } = unitInfo;
    const formMaxColEnable = ['FORM', 'QUERYFORM', 'FILTER', 'WORKFLOW'].includes(unitType);
    const enableConfigBORange = ['FORM', 'QUERYFORM', 'FILTER', "GRID", "SEARCHBAR", "COMMON"].includes(unitType) && combineCode;
    const isSeachBarType = unitType === 'SEARCHBAR';
    const { loginName } = getCurrentUser() || {};
    const isAdmin = loginName === 'admin';
    const formUnitTags = (getFieldValue("unitTag") || []);
    const isC7N = formUnitTags.includes("C7N");
    const showCardMaxCount = formUnitTags.includes("AF-EXTRA") && unitType === "COMMON";
    const allowAddField = (window.$$env || {}).CUSZ_ADD_FIELD === "true";
    return (
      <>
        <div className={styles.header}>
          <Tooltip title={intl.get('hzero.common.status.back').d('返回')} placement="bottom">
            <Icon type="arrow-left" className={styles['back-icon']} onClick={backToIndex} />
          </Tooltip>
          <span className={styles['header-title']}>
            {intl.get('hpfm.individuationUnit.view.message.title.unitDetail').d('个性化单元详情')}
          </span>
        </div>
        <div className={`${styles['unit-right-box']} ${styles.bordered}`}>
          <Spin spinning={fetchLoading || saveLoading || false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0px' }}>
              <div className={styles['detail-container-title']}>
                {intl.get('hpfm.individuationUnit.view.message.title.unitConfig').d('单元配置')}
              </div>
              <Button type="primary" icon="save" loading={saveLoading} onClick={() => this.save()}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </div>
            <Form layout="inline" className={styles['unit-detail-form']}>
              <Row gutter={48}>
                <Col span={12}>
                  <UEDDisplayFormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.unitCode')
                      .d('单元编码')}
                    value={unitCode}
                  />
                </Col>
                <Col span={12}>
                  <FormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                      .d('单元名称')}
                    {...formsLayouts}
                  >
                    {getFieldDecorator('unitName', {
                      initialValue: unitName,
                      rules: [
                        {
                          required: true,
                          message: intl
                            .get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                                .d('单元名称'),
                            })
                            .d(
                              `${intl
                                .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                                .d('单元名称')}不能为空`
                            ),
                        },
                        {
                          max: 120,
                          message: intl.get('hzero.common.validation.max', {
                            max: 120,
                          }),
                        },
                      ],
                    })(
                      <TLEditor
                        label={intl
                          .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                          .d('单元名称')}
                        field="unitName"
                        token={unitInfo._token}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={48}>
                <Col span={12}>
                  <UEDDisplayFormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.unitType')
                      .d('单元类型')}
                    value={getIntlMapping(unitType)}
                  />
                </Col>
                <Col span={12}>
                  <UEDDisplayFormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.menuName')
                      .d('所属功能')}
                    value={menuName}
                  />
                </Col>
                {enableConfigBORange && (
                  <Col span={12}>
                    <UEDDisplayFormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.combinObj')
                        .d('关联业务对象组合')}
                      value={combineName}
                    />
                  </Col>
                )}
                {enableConfigBORange && (
                  <Col span={12}>
                    <UEDDisplayFormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.busObj')
                        .d('关联业务对象')}
                      value={modelName}
                    />
                  </Col>
                )}
                <Col span={12}>
                  <UEDDisplayFormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.relateGroup')
                      .d('所属单元组')}
                    value={unitGroupName}
                  />
                </Col>
                {isAdmin && isC7N && unitType === "GRID" && (
                  <Col span={12}>
                    <FormItem
                      label={intl.get('hpfm.customize.common.gridMaxPageCount').d('表格最大分页数量')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('gridMaxPageCount', {
                        initialValue: gridMaxPageCount,
                        rules: [
                          {
                            required: true,
                            message: intl
                              .get('hzero.common.validation.notNull', {
                                name: intl.get('hpfm.customize.common.gridMaxPageCount').d('表格最大分页数量'),
                              })
                              .d(
                                `${intl.get('hpfm.customize.common.gridMaxPageCount')}不能为空`
                              ),
                          },
                          {
                            validator(_1, value, cb) {
                              if (value < 100) cb(intl.get("hpfm.customize.common.validator.min", {min: 100}).d("最小值不能小于{min}"));
                              cb();
                            },
                          },
                        ],
                      })(
                        <InputNumber precision={0} />
                      )}
                    </FormItem>
                  </Col>
                )}
                {enableConfigBORange && (
                  <Col span={12}>
                    <FormItem
                      label={intl.get('hpfm.customize.common.businessObjectRange').d('可用业务对象范围')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('businessObjectRange', {
                        initialValue: businessObjectRange,
                      })(
                        <LovMulti
                          placeholder={intl.get('hpfm.customize.common.businessObjectRange.placeholder').d('默认全选')}
                          code="HPFM.CUST.COMBINE.BUSINESS.OBJECT"
                          queryParams={{ combineCode }}
                          displayData={supportBusinessObject}
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
                {
                  showCardMaxCount && (
                    <Col span={12}>
                      <FormItem
                        label={intl.get('hpfm.customize.common.cardMaxCount').d('自定义卡片数量')}
                        {...formsLayouts}
                      >
                        {getFieldDecorator('cardMaxCount', {
                          initialValue: cardMaxCount || 4,
                        })(
                          <Select showSearch style={{ width: '120px' }}>
                            {[4, 5, 6].map((i) => (
                              <Option value={i}>{i}</Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  )
                }
              </Row>
              {formMaxColEnable && (
                <Row gutter={48}>
                  <Col span={12}>
                    <FormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.formMaxCol')
                        .d('表单列数')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('formMaxCol', {
                        initialValue: formMaxCol,
                      })(
                        <Select allowClear showSearch style={{ width: '120px' }}>
                          {colOptions.map((i) => (
                            <Option value={i}>{i}</Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.labelWrapperCol')
                        .d('标签组件比例')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('labelCol', {
                        initialValue: labelCol,
                      })(
                        <Select
                          allowClear
                          showSearch
                          style={{ width: '120px', marginRight: '8px' }}
                          placeholder={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.label')
                            .d('标签')}
                        >
                          {colOptions.map((i) => (
                            <Option value={i}>{i}</Option>
                          ))}
                        </Select>
                      )}
                      {getFieldDecorator('wrapperCol', {
                        initialValue: wrapperCol,
                      })(
                        <Select
                          allowClear
                          showSearch
                          style={{ width: '120px' }}
                          placeholder={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.wrapper')
                            .d('组件')}
                        >
                          {colOptions.map((i) => (
                            <Option value={i}>{i}</Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
              <Row gutter={48}>
                <Col span={12}>
                  <FormItem
                    label={intl
                      .get('hpfm.individuationUnit.model.individuationUnit.enableFlag')
                      .d('启用')}
                    {...formsLayouts}
                  >
                    {getFieldDecorator('enableFlag', {
                      initialValue: enableFlag === undefined ? 1 : enableFlag,
                    })(<Switch checkedValue={1} unCheckedValue={0} />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label={(
                      <>
                        <Text style={{ width: 'calc( 100% - 42px )', minWidth: '50px' }}>
                          {intl.get('hpfm.individuationUnit.model.individuationUnit.hiddenFlag').d('隐藏单元')}
                        </Text>
                        <Tooltip
                          title={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.hiddenFlag.tip')
                            .d('配置开启后，当前单元对所有租户均不可见')}
                        >
                          <Icon
                            type="info-circle"
                            style={{ verticalAlign: 'baseline', margin: '0 4px' }}
                          />
                        </Tooltip>
                      </>
                    )}
                    {...formsLayouts}
                  >
                    {getFieldDecorator('hiddenFlag', {
                      initialValue: hiddenFlag || 0,
                    })(<Switch checkedValue={1} unCheckedValue={0} />)}
                  </FormItem>
                </Col>
                {isSeachBarType && (
                  <Col span={12}>
                    <FormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.sortedEnabled')
                        .d('启用排序')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('sortedEnabled', {
                        initialValue: sortedEnabled || 0,
                      })(
                        <Switch
                          checkedValue={1}
                          unCheckedValue={0}
                          onChange={() => setFieldsValue({ stdFieldSortedFlag: 1 })}
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
              </Row>
              {unitType === 'GRID' && (
                <Row gutter={48}>
                  <Col span={12}>
                    <FormItem
                      label={intl.get('hpfm.customize.common.pageAsyncFlag').d('异步显示总数')}
                      {...formsLayouts}
                    >
                      {getFieldDecorator('pageAsyncFlag', {
                        initialValue: pageAsyncFlag,
                      })(
                        <Select>
                          <Select.Option value={0}>
                            {intl.get('hzero.common.status.no').d('否')}
                          </Select.Option>
                          <Select.Option value={1}>
                            {intl.get('hzero.common.status.yes').d('是')}
                          </Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              )}
              {isSeachBarType && (
                <>
                  <Row gutter={48}>
                    <Col span={12}>
                      <FormItem
                        label={intl
                          .get('hpfm.individuationUnit.model.individuationUnit.tenantSortedEnabled')
                          .d('启用扩展字段排序')}
                        {...formsLayouts}
                      >
                        {getFieldDecorator('extFieldSortedFlag', {
                          initialValue: extFieldSortedFlag || 0,
                        })(<Switch checkedValue={1} unCheckedValue={0} />)}
                      </FormItem>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: getFieldValue('sortedEnabled') === 1 ? 'inline-block' : 'none',
                      }}
                    >
                      <FormItem
                        label={intl
                          .get('hpfm.individuationUnit.model.individuationUnit.stdFieldSortedFlag')
                          .d('标准字段租户默认可排序')}
                        {...formsLayouts}
                      >
                        {getFieldDecorator('stdFieldSortedFlag', {
                          initialValue: stdFieldSortedFlag || 0,
                        })(<Switch checkedValue={1} unCheckedValue={0} />)}
                      </FormItem>
                    </Col>
                  </Row>
                  {isAdmin && (
                    <Row gutter={48}>
                      <Col span={12}>
                        <FormItem
                          label={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.orderCount')
                            .d('允许几个排序字段')}
                          {...formsLayouts}
                        >
                          {getFieldDecorator('orderCount', {
                            initialValue: orderCount || 1,
                          })(<InputNumber precision={0} step={1} min={1} max={5} />)}
                        </FormItem>
                      </Col>
                    </Row>
                  )}
                </>
              )}
              <Row style={{ marginRight: '64px' }}>
                <Col span={24}>
                  <FormItem
                    label={intl.get('hpfm.customize.common.unitTag').d('单元标签')}
                    {...formsLayoutsLong}
                  >
                    {getFieldDecorator('unitTag', {
                      initialValue: unitTag ? unitTag.split(',') : [],
                    })(
                      <Select mode="multiple" style={{ width: '75%' }}>
                        {unitTagOptions.map((o) => {
                          const currentValue = getFieldValue('unitTag');
                          const hasC7N = currentValue.includes('C7N');
                          const hasH0 = currentValue.includes('H0');
                          return (
                            <Option
                              value={o.value}
                              disabled={
                                (o.value === 'C7N' && hasH0) || (o.value === 'H0' && hasC7N)
                              }
                            >
                              {o.meaning}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              {!isSeachBarType && (
                <Row style={{ marginRight: '64px' }}>
                  <Col span={24} style={{ display: unitType !== 'TABPANE' ? 'block' : 'none' }}>
                    <FormItem
                      label={intl
                        .get('hpfm.individuationUnit.model.individuationUnit.sqlIds')
                        .d('SQL IDs')}
                      {...formsLayoutsLong}
                    >
                      {getFieldDecorator('sqlIds', {
                        initialValue: sqlIds && sqlIds !== '' ? sqlIds.split(',') : [],
                      })(
                        <Select
                          mode="tags"
                          dropdownClassName={styles['sqlIds-select-options']}
                          style={{ width: '75%' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {unitType === 'FORM' && (
                    <Col span={24}>
                      <FormItem
                        label={
                          <>
                            {intl.get('hpfm.individual.model.config.showFieldSet').d('预展示字段')}
                            <Tooltip
                              title={intl
                                .get('hpfm.individual.view.message.onlyUseForCollapseForm')
                                .d('仅适用于折叠表单')}
                            >
                              <Icon
                                type="info-circle"
                                style={{ verticalAlign: 'middle', margin: '0 4px' }}
                              />
                            </Tooltip>
                          </>
                        }
                        {...formsLayoutsLong}
                      >
                        <div style={{ width: '75%' }}>
                          {fields.map((l) =>
                            l.showFieldFlag ? (
                              <Tag color="blue" style={{ cursor: 'default', borderRadius: '10px' }}>
                                {l.fieldName}({l.fieldCodeAlias})
                              </Tag>
                            ) : null
                          )}
                        </div>
                      </FormItem>
                    </Col>
                  )}
                </Row>
              )}
            </Form>
          </Spin>
          <div className={styles['unit-right-box-divider']} />
          <div>
            {!isSeachBarType ? (
              <>
                <div className={styles['detail-container']}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0px' }}
                  >
                    <div className={styles['detail-container-title']}>
                      {getFieldConfigAlias(unitType)}
                    </div>
                    {
                      allowAddField && (
                        <Button type="primary" icon="plus" onClick={this.addNewField}>
                          {getAddFieldAlias(unitType)}
                        </Button>
                      )
                    }
                  </div>
                </div>
                <Table
                  bordered
                  loading={deleteFieldLoading || fetchLoading}
                  rowKey={rowKey}
                  columns={this.getColumns()}
                  dataSource={fields}
                  pagination={false}
                />
              </>
            ) : (
              <Tabs
                className={styles['unit-detail-tabs']}
                animated={false}
                activeKey={tabActiveKey}
                onChange={this.handleChangeTab}
              >
                <Tabs.TabPane tab={getFieldConfigAlias(unitType)} key="field">
                  <div style={{ textAlign: 'right', margin: '10px 0px' }}>
                    {
                      allowAddField && (
                        <Button type="primary" icon="plus" onClick={this.addNewField}>
                          {getAddFieldAlias(unitType)}
                        </Button>
                      )
                    }
                  </div>
                  <Table
                    bordered
                    loading={deleteFieldLoading || fetchLoading}
                    rowKey={rowKey}
                    scroll={{ x: this.scrollX }}
                    columns={this.getColumns()}
                    dataSource={fields}
                    pagination={false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get('hpfm.customize.common.filterConfig').d('筛选器配置')}
                  key="filter"
                >
                  {tabActiveKey === 'filter' && (
                    <SearchBarConfig
                      unitId={unitId}
                      unitInfo={unitInfo}
                      originFields={fields}
                      unitList={unitList}
                      onRef={this.handleSearchBarRef}
                      codes={codes}
                    />
                  )}
                </Tabs.TabPane>
              </Tabs>
            )}
          </div>
        </div>
        <Modal
          visible={modelVisible}
          data={modalData}
          fetchUnitDetail={this.fetchUnitDetail}
          gridFixedOptions={gridFixedOptions}
          aggregationGroup={aggregationGroup}
          renderOptions={renderOptions}
          condOptions={condOptions}
          widgetType={widgetType}
          dateFormat={dateFormat}
          whereOptions={whereOptions}
          unitInfo={unitInfo}
          unitList={unitList}
          fieldList={fieldList}
          readOnly={getFieldValue('readOnly') === 1}
          relationModals={relationModals}
          handleClose={this.closeModal}
          uniqueUiFeatureMap={uniqueUiFeatureMap}
        />
      </>
    );
  }
}
