/* eslint-disable eqeqeq */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import classnames from 'classnames';
import {
  Button,
  Tree,
  Row,
  Col,
  Form,
  Spin,
  Table,
  Icon,
  InputNumber,
  Popconfirm,
  Dropdown,
  Menu,
  Tooltip,
  Select,
  Badge,
  Tag,
  Tabs,
  Modal,
} from 'hzero-ui';
import {
  DataSet,
  Button as C7NProButton,
  IntlField,
  TextField,
  Form as C7NProForm,
  Modal as C7NProModal,
} from 'choerodon-ui/pro';
import { isEmpty, isNil, isArray } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';
import { Header } from 'components/Page';
import { queryTL } from 'services/api';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, getCurrentLanguage } from 'utils/utils';
// import { yesOrNoRender } from 'utils/renderer';
import { connect } from 'dva';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getFieldNameAlias,
  getFieldConfigAlias,
  getDefaultActiveAlias,
  unitTypeColorMap,
  filterFxUnitType,
} from '@/utils/constConfig.js';
import { saveMenu, resetMenu } from '@/services/customizeConfigService';
import { yesOrNoRender } from 'utils/renderer';
import { getContext } from 'srm-front-cuz/lib/customizeTool';
import ConfigModal from './ConfigModal';
import CopyFieldModal from './CopyFieldModal';
import SearchBarConfig from './SearchBarConfig';
import styles from './index.less';
import ExportButton from '../../components/ExportButton';
import ImportButton from '../../components/ImportButton';
import ImportUnitButton from '../../components/ImportUnitButton';

let editMenyModal;
const tenantId = getCurrentOrganizationId();
const CUSZ_DATR_MIGRATE_ENABLE = window.$$env.HZERO_PLATFORM_CUSZ_DATA_MIGRATE_ENABLE; // 环境变量，用于控制导入导出按钮是否显示
const FormItem = Form.Item;
const { TreeNode } = Tree;
// const { Search } = Input;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
function getStatus(status) {
  if (status === -1 || status === undefined) return <span>fx</span>;
  if (status === 1) return <Icon type="check" />;
  return null;
}
@connect(({ configCustomizeCuz, loading }) => {
  const {
    treeData,
    unitGroup,
    lineData,
    moduleList,
    codes,
    currentUnit,
    unitAlias,
  } = configCustomizeCuz;
  return {
    currentUnit,
    treeData,
    unitGroup,
    lineData,
    moduleList,
    codes,
    unitAlias,
    loadTree: loading.effects['configCustomizeCuz/queryTree'],
    loadingGroup: loading.effects['configCustomizeCuz/queryGroup'],
    loadingCurrentUnit: loading.effects['configCustomizeCuz/queryUnitDetails'],
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'hpfm.individual',
    'hpfm.customize',
    'hpfm.individuationUnit',
    'hzero.common',
    'hiam.tenantMenu',
  ],
})
export default class configCustomizeCuz extends Component {
  searchBarRef = undefined;

  scrollTop = 0;

  constructor(props) {
    super(props);
    this.state = {
      classifyCode: '',
      currentGroup: { units: [] },
      currentRecord: { field: {}, widget: {} },
      visible: false,
      copyFieldModalVisible: false,
      expandedKeys: [],
      unitList: [],
      fieldList: {},
      tabKey: 'field',
      selectedRows: [],
    };
    const { search } = window.location;
    const urlParams = {};
    if (search) {
      search
        .substr(1)
        .split('&')
        .forEach((item) => {
          if (item) {
            const [key, value] = item.split('=');
            urlParams[key] = value;
          }
        });
    }
    this.contextParams = {
      ctx: getContext(),
      url: urlParams,
      self: {}, // 自定义参数，留口备用
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchMenuTree();
    dispatch({
      type: 'configCustomizeCuz/queryCodes',
      payload: {
        linkType: 'HPFM.CUST.WIDGET.LINK_TYPE',
        whereOptions: 'HPFM.CUST.FIELD_QUERY_REALTION',
        renderOptions: 'HPFM.CUST.RENDER_OPTIONS',
        dateFormat: 'HPFM.CUST.DATE_FORMAT',
        fieldWidget: 'HPFM.CUST.FIELD_COMPONENT',
        fieldBtnWidget: 'HPFM.CUST.TABLE_BTN_TYPE',
        custType: 'HPFM.CUST.FIELD_CUST_TYPE',
        fieldType: 'HPFM.CUST.FIELD_TYPE',
        fixed: 'HPFM.CUST.GIRD.FIXED',
        unitType: 'HPFM.CUST.UNIT_TYPE',
        relationShip: 'HPFM.CUST.FIELD_COND_REALTION',
        condOptions: 'HPFM.CUST.UNIT_COND_OPTIONS',
        bucketType: 'HPFM.CUST.WIDGET.BUCKET',
      },
    });
  }

  @Bind()
  fetchMenuTree() {
    this.props
      .dispatch({
        type: 'configCustomizeCuz/queryTree',
        payload: {
          onlyHasCuszUnitGroup: false,
        },
      })
      .then(this.parseTreeData)
      .then((originTreeData) => {
        this.setState({ originTreeData });
      });
  }

  @Bind()
  parseTreeData(data) {
    let result = [];
    if (data && data.length && data.length > 0) {
      data.forEach((item) => {
        result.push(item);
        if (item.subMenus) {
          result = [...result, ...this.parseTreeData(item.subMenus)];
        }
      });
    }
    return result;
  }

  queryRelatedUnits(id) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCustomizeCuz/queryRelatedUnits',
      payload: { unitId: id, returnVirtual: true, filterUnitType: filterFxUnitType },
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

  renderTreeNodes = (data) =>
    data.map((item) => {
      const { menuCode, menuName, subMenus, tenantCuszMenu, ...rest } = item;
      const title = (
        <span className={styles['tree-node-title']}>
          {menuName}
          <Badge style={{ marginLeft: '8px' }} dot={tenantCuszMenu} />
          <Tooltip title={intl.get('hpfm.individual.view.tooltip.editMenuName').d('编辑菜单名称')}>
            <Icon
              type="edit"
              className={styles['tree-node-title-icon']}
              onClick={(event) => this.handleEditMenu(event, item)}
            />
          </Tooltip>
        </span>
      );
      if (item.subMenus) {
        return (
          <TreeNode title={title} key={menuCode} dataRef={item}>
            {this.renderTreeNodes(subMenus)}
          </TreeNode>
        );
      }
      return <TreeNode {...rest} title={title} key={menuCode} dataRef={item} />;
    });

  @Bind()
  handleEditMenu(event, menu) {
    event.stopPropagation();
    const { menuCode, menuName, quickIndex, subMenus, tenantCuszMenu, _token } = menu || {};
    const isDir = subMenus && subMenus.length > 0;
    const formDs = new DataSet({
      fields: [
        { name: 'code' },
        {
          name: 'name',
          type: 'intl',
          label: intl.get('hiam.tenantMenu.model.tenantMenu.menuName').d('菜单名称'),
        },
        {
          name: 'quickIndex',
          type: 'string',
          label: intl.get('hiam.tenantMenu.model.tenantMenu.quickIndex').d('快速索引'),
        },
      ],
      data: [{ code: menuCode, name: menuName, quickIndex, _token, tenantId }],
    });
    editMenyModal = C7NProModal.open({
      title: intl.get('hpfm.individual.view.tooltip.editMenuName').d('编辑菜单名称'),
      closable: true,
      children: (
        <C7NProForm dataSet={formDs}>
          <IntlField name="name" />
          {!isDir && <TextField name="quickIndex" />}
        </C7NProForm>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {tenantCuszMenu && (
            <C7NProButton onClick={() => this.handleResetMenu(menu)}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </C7NProButton>
          )}
          {cancelBtn}
          {okBtn}
        </div>
      ),
      onOk: () => this.handleSaveMenu(formDs),
    });
  }

  @Bind()
  async handleResetMenu(menu) {
    Modal.confirm({
      title: intl.get('hpfm.individual.view.title.confirmReset').d('确定重置吗？'),
      onOk: async () => {
        const { menuCode: code } = menu;
        const res = await resetMenu({
          code,
          tenantId,
        });
        if (getResponse(res)) {
          notification.success();
          this.fetchMenuTree();
          if (editMenyModal && editMenyModal.close) {
            editMenyModal.close();
          }
        }
      },
    });
  }

  @Bind()
  async handleSaveMenu(formDs) {
    if (formDs.current) {
      const data = formDs.current.toData();
      if (!data._tls) {
        const tlsData = await queryTL({
          _token: data._token,
          fieldName: 'name',
        });
        if (!getResponse(tlsData)) {
          return false;
        } else if (tlsData && isArray(tlsData)) {
          const tlsObj = {};
          tlsData.forEach((item) => {
            tlsObj[item.code] = item.code === getCurrentLanguage() ? data.name : item.value;
          });
          data._tls = {
            name: tlsObj,
          };
        }
      }
      const res = await saveMenu(data);
      if (getResponse(res)) {
        notification.success();
        this.fetchMenuTree();
        return true;
      } else {
        return false;
      }
    }
  }

  @Bind()
  toggleConfigModal(record, type) {
    const { visible } = this.state;
    if (!visible) {
      const container = document.getElementById('right-box-container');
      if (container) {
        this.scrollTop = container.scrollTop;
      }
    }
    this.setState({
      modalType: type,
      visible: !visible,
      currentRecord: record,
    });
  }

  @Bind()
  renderColumns() {
    const {
      currentUnit,
      codes: { fixedObj, fieldWidgetObj, custTypeObj },
    } = this.props;
    const { unitType } = currentUnit;
    const sortedEditorFlag = currentUnit.sortedEditorFlag || 0;
    const sortedEnabled = currentUnit.sortedEnabled || 0;
    const pureVirtual = ['BTNGROUP', 'TABPANE', 'COLLAPSE', 'SECTION'].includes(unitType);
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const isSeachBarType = unitType === 'SEARCHBAR';
    const isSection = unitType === 'SECTION';
    const columns = [
      {
        title: getFieldNameAlias(unitType),
        dataIndex: 'fieldName',
        render: (val, record) => (
          <div className={styles['table-extra']}>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="0" onClick={() => this.toggleConfigModal(record)}>
                    <Icon type="edit" />
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Menu.Item>
                  {!isNil(record.configFieldId) && record.custType === 'STD' && (
                    <Menu.Item key="2">
                      <Popconfirm
                        title={intl.get('hzero.common.button.reset').d('重置')}
                        onConfirm={() => this.deleteFieldIndividual(record)}
                        okText={intl.get('hzero.common.status.yes').d('是')}
                        cancelText={intl.get('hzero.common.status.no').d('否')}
                      >
                        <Icon type="reload" style={{ marginRight: '8px' }} />
                        {intl.get('hzero.common.button.reset').d('重置')}
                      </Popconfirm>
                    </Menu.Item>
                  )}
                  {!isNil(record.configFieldId) && record.custType !== 'STD' && (
                    <Menu.Item key="2">
                      <Popconfirm
                        title={intl
                          .get('hzero.common.message.confirm.delete')
                          .d('是否删除此条记录')}
                        onConfirm={() => this.deleteFieldIndividual(record)}
                        okText={intl.get('hzero.common.status.yes').d('是')}
                        cancelText={intl.get('hzero.common.status.no').d('否')}
                      >
                        <Icon type="delete" style={{ marginRight: '8px' }} />
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </Popconfirm>
                    </Menu.Item>
                  )}
                </Menu>
              }
              trigger={['click']}
            >
              <div className="operator">.&nbsp;.&nbsp;.</div>
            </Dropdown>
            <div
              style={{ color: '#666', fontWeight: '600', display: 'flex', alignItems: 'center' }}
            >
              {record.fieldNameType === 'CUSTOMIZE' ? record.cuszFieldName : val}
              <Badge style={{ marginLeft: '8px' }} dot={!isNil(record.configFieldId)} />
            </div>
            <div style={{ color: '#a5a5a5' }}>
              {unitType === 'SECTION' ? record.fieldAlias : record.fieldCodeAlias}
            </div>
          </div>
        ),
      },
      ['TABPANE', 'COLLAPSE'].includes(unitType) && {
        title: getDefaultActiveAlias(unitType),
        dataIndex: 'defaultActive',
        width: 100,
        render: yesOrNoRender,
      },
      !pureVirtual && {
        title: intl.get('hpfm.individual.model.config.custType').d('类型'),
        dataIndex: 'custType',
        width: 170,
        render: (val, record) => {
          let text = custTypeObj[val] || '';
          if (record.aggregationFlag) {
            text += `(${intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')})`;
          }
          return text;
        },
      },
      !pureVirtual && {
        title: intl.get('hpfm.individual.model.config.modelCategory').d('所属模型'),
        dataIndex: 'field.modelName',
        width: 150,
      },
      !pureVirtual &&
        !isSeachBarType && {
          title: intl.get('hpfm.individuationUnit.model.individuationUnit.bindField').d('字段绑定'),
          dataIndex: 'bindField',
        },
      !isSeachBarType && {
        title: intl.get('hpfm.individual.model.config.visible').d('显示'),
        dataIndex: 'visible',
        width: 60,
        render: getStatus,
      },
      !pureVirtual &&
        !isSeachBarType && {
          title: intl.get('hzero.common.button.editable').d('编辑'),
          dataIndex: 'fieldEditable',
          width: 60,
          render: getStatus,
        },
      !pureVirtual &&
        !isSeachBarType && {
          title: intl.get('hzero.common.title.individuation.required1').d('必输'),
          dataIndex: 'fieldRequired',
          width: 60,
          render: getStatus,
        },
      isFormType && {
        title: intl.get('hpfm.individual.model.config.row').d('行'),
        width: 60,
        dataIndex: 'formRow',
      },
      isFormType && {
        title: intl.get('hpfm.individual.model.config.col').d('列'),
        width: 60,
        dataIndex: 'formCol',
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
      !isFormType &&
        !isSeachBarType && {
          title: intl.get('hpfm.individual.model.config.position').d('位置'),
          width: 60,
          dataIndex: 'gridSeq',
        },
      unitType === 'GRID' && {
        title: intl.get('hpfm.individual.model.config.gridWidth').d('宽度'),
        width: 90,
        dataIndex: 'gridWidth',
      },
      unitType === 'GRID' && {
        title: intl.get('hpfm.individual.model.config.gridFixed').d('冻结'),
        width: 90,
        dataIndex: 'gridFixed',
        render: (val) => fixedObj[val],
      },
      // unitType === 'BTNGROUP' && {
      //   title: intl.get('hpfm.individual.model.config.eventCode').d('事件编码'),
      //   width: 130,
      //   dataIndex: 'eventCode',
      // },
      !pureVirtual && {
        title: intl.get('hpfm.individual.model.config.componentType').d('组件类型'),
        dataIndex: 'widget.fieldWidget',
        width: 100,
        render: (val) => fieldWidgetObj[val],
      },
      isSeachBarType && {
        title: intl.get('hpfm.individual.model.config.position').d('位置'),
        width: 60,
        dataIndex: 'gridSeq',
      },
      isSeachBarType && {
        title: intl.get('hpfm.individual.model.config.visible').d('显示'),
        dataIndex: 'visible',
        width: 60,
        render: (visible) => (visible === 1 ? <Icon type="check" /> : null),
      },
      isSeachBarType &&
        sortedEditorFlag === 1 &&
        sortedEnabled !== 0 && {
          title: intl.get('hpfm.individual.model.config.sortedFlag').d('可排序'),
          dataIndex: 'sortedFlag',
          width: 100,
          render: (text) => (text === 1 ? <Icon type="check" /> : null),
        },
      isSeachBarType && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.mutilFlag').d('多选'),
        dataIndex: 'widget.multipleFlag',
        width: 100,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
      isSeachBarType && {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.mergeFlag').d('合并查询'),
        dataIndex: 'mergeFlag',
        width: 100,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
    ].filter(Boolean);
    this.scrollX = columns.reduce((p, n) => p + n.width || 0, 0);
    return columns;
  }

  @Bind()
  onSelect(key, { node }) {
    if (node.isLeaf()) {
      this.setState({
        selectedRows: [], // 切换菜单后重置已勾选字段
        classifyCode: key,
      });
      const { dispatch } = this.props;
      dispatch({
        type: 'configCustomizeCuz/queryGroup',
        payload: { menuCode: node.props.eventKey },
      }).then((res) => {
        if (!isEmpty(res)) {
          const currentGroup = res[0] || { units: [] };
          this.setState({ currentGroup });
          if (!currentGroup.units) return;
          const waitQueryUnit = currentGroup.units.find((u) => !u.tplUsedFlag) || {};
          if (waitQueryUnit.id) {
            this.queryUnitDetails(waitQueryUnit.id);
            this.setState({ tplUsedFlag: false });
          } else this.setState({ tplUsedFlag: true });
        } else {
          this.setState({ currentGroup: null });
        }
      });
    } else {
      let { expandedKeys } = this.state;
      if (key.length === 0) {
        expandedKeys = expandedKeys.filter((i) => !i.startsWith(node.props.eventKey));
      } else {
        expandedKeys = expandedKeys.concat(key);
      }
      this.setState({ expandedKeys });
    }
  }

  @Bind()
  onExpand(keys) {
    this.setState({ expandedKeys: keys });
  }

  @Bind()
  clickUnit(e) {
    if (e.target && e.target.id) {
      // 切换单元时重置table seleted
      if (this.props.currentUnit && this.props.currentUnit.id !== e.target.id) {
        this.setState({
          selectedRows: [],
          tabKey: 'field',
        });
      }
      this.queryUnitDetails(e.target.id);
    }
  }

  @Bind()
  clickGroup(e) {
    const { unitGroup } = this.props;
    if (e.target && e.target.id) {
      // 切换单元组时重置table seleted
      if (this.state.currentGroup && this.state.currentGroup.unitGroupId !== e.target.id) {
        this.setState({ selectedRows: [] });
      }
      // eslint-disable-next-line eqeqeq
      const currentGroup = unitGroup.find((i) => i.unitGroupId == e.target.id) || { units: [] };
      this.setState({ currentGroup });
      if (!currentGroup.units) return;
      const waitQueryUnit = currentGroup.units.find((u) => !u.tplUsedFlag) || {};
      if (waitQueryUnit.id) {
        this.queryUnitDetails(waitQueryUnit.id);
        this.setState({ tplUsedFlag: false });
      } else this.setState({ tplUsedFlag: true });
    }
  }

  @Bind()
  queryUnitDetails(unitId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCustomizeCuz/queryUnitDetails',
      payload: { unitId },
    }).then((res) => {
      const container = document.getElementById('right-box-container');
      if (container) {
        container.scrollTop = this.scrollTop;
      }
      this.scrollTop = 0;
      if (window.$$env.REPET_FIELD_WARNING && res) {
        const fields = res.configFields || [];
        const memorizeFields = {};
        const repeatFields = [];
        fields.forEach((field) => {
          if (memorizeFields[field.fieldCodeAlias]) {
            repeatFields.push(`${field.fieldName}(${field.fieldCodeAlias})`);
          }
          memorizeFields[field.fieldCodeAlias] = 1;
        });
        if (repeatFields.length > 0) {
          notification.warning({
            message: intl
              .get('hpfm.customize.common.repeatFields', {
                fields: repeatFields.join(','),
              })
              .d('以下字段别名重复:{fields}'),
          });
        }
      }
    });
    this.queryRelatedUnits(unitId);
  }

  @Bind()
  deleteFieldIndividual(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configCustomizeCuz/deleteFieldIndividual',
      payload: { configFieldId: record.configFieldId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryUnitDetails(this.props.currentUnit.id);
      }
    });
  }

  @Bind()
  handleSelectRows(_, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  handleToggleCopyFieldModal() {
    this.setState({ copyFieldModalVisible: !this.state.copyFieldModalVisible });
  }

  @Bind()
  @Debounce(500)
  handleSaveUnitConfig() {
    const {
      dispatch,
      currentUnit = {},
      form: { getFieldsValue },
    } = this.props;
    const { id, config = {} } = currentUnit;
    const newConfig = getFieldsValue();
    dispatch({
      type: 'configCustomizeCuz/saveUnitConfigHeader',
      payload: {
        unitId: id,
        ...config,
        ...newConfig,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryUnitDetails(this.props.currentUnit.id);
      }
    });
  }

  @Bind()
  @Debounce(500)
  handleResetUnitConfig() {
    const {
      dispatch,
      currentUnit = {},
      form: { getFieldsValue },
    } = this.props;
    const { id, config = {} } = currentUnit;
    const newConfig = getFieldsValue();
    dispatch({
      type: 'configCustomizeCuz/saveUnitConfigHeader',
      payload: {
        unitId: id,
        ...config,
        ...newConfig,
        _status: 'delete',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryUnitDetails(this.props.currentUnit.id);
      }
    });
  }

  @Bind()
  handleSearchBarRef(ref) {
    this.searchBarRef = ref;
  }

  @Bind()
  handleChangeTab(tabKey) {
    this.setState({ tabKey });
    // if (tabKey === 'filter' && this.searchBarRef) {
    //   this.searchBarRef.querySearchBarDetail();
    // }
  }

  @Bind()
  renderUnitTypeTag(unit) {
    const {
      codes: { unitTypeObj },
    } = this.props;
    const { unitType, enableFlag } = unit;
    return (
      <Tag
        className={classnames({
          'unit-type-tag': true,
          'unit-type-tag-disabled': enableFlag !== 1,
        })}
        color={unitTypeColorMap[unitType]}
      >
        {unitTypeObj[unitType]}
      </Tag>
    );
  }

  renderContent() {
    const { classifyCode, tabKey, currentGroup, selectedRows, unitList, tplUsedFlag } = this.state;
    const {
      lineData,
      unitGroup = [],
      loadingGroup,
      loadingCurrentUnit,
      codes: { unitTypeObj },
      form,
      currentUnit,
    } = this.props;
    const {
      id,
      unitType,
      config = {},
      unitTag,
      unitCode,
      combineName,
      modelName,
      formMaxCol,
      labelCol,
      wrapperCol,
      pageAsyncFlag,
    } = currentUnit;
    const tags = (unitTag || '').split(',');
    const disableNewField =
      ['TABPANE', 'COLLAPSE', 'SECTION'].includes(unitType) || tags.includes('DISABLE_EXT_FIELD');
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const formMaxColEnable = ['FORM', 'QUERYFORM', 'FILTER'].includes(unitType);
    const unitTitleEnable = unitType === 'SECTION';
    const isSeachBarType = unitType === 'SEARCHBAR';
    const sortedEditorFlag = sortedEditorFlag || 0;
    const sortedEnabled = sortedEnabled || 0;
    if (!classifyCode) {
      return (
        <div className={styles['blank-area']}>
          <div className="blank-pic" />
          <div className="blank-desc">
            {intl
              .get('hpfm.individual.view.message.title.tips1')
              .d('请从左侧个性化目录中选择分类!')}
          </div>
          <div className="blank-desc-supply">
            {intl
              .get('hpfm.individual.view.message.title.tips2')
              .d('个性化目录与系统菜单相对应，可根据需要配置对应菜单下的个性化单元')}
          </div>
        </div>
      );
    } else if (!currentGroup) {
      return (
        <div className={styles['blank-area']}>
          <div className="blank-pic" />
          <div className="blank-desc">
            {intl
              .get('hpfm.individual.view.message.title.noUnitGroup')
              .d('未查找到当前菜单关联的个性化单元！')}
          </div>
          <div className="blank-desc-supply">
            {intl
              .get('hpfm.individual.view.message.title.needCreateUnitGroup')
              .d('请先创建个性化单元')}
          </div>
        </div>
      );
    }
    return (
      // <div className="right-container">
      <>
        <div className="right-box1">
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
            <div className={styles.title}>
              {intl.get('hpfm.individual.model.config.unitList').d('单元列表')}
            </div>
          </div>
          <Spin spinning={loadingGroup}>
            <div className={styles['units-list']}>
              <FormItem label={intl.get('hpfm.individual.model.config.unitGroup').d('单元分组')}>
                <div className="units-container" onClick={this.clickGroup}>
                  {unitGroup.map((i) => (
                    <div
                      id={i.unitGroupId}
                      className={`unit-card ${
                        currentGroup.unitGroupId == i.unitGroupId ? 'active' : ''
                      }`}
                    >
                      <div id={i.unitGroupId} className="icon-unit" />
                      <div id={i.unitGroupId} className="content-unit">
                        {i.groupName}
                      </div>
                    </div>
                  ))}
                </div>
              </FormItem>
              <FormItem
                label={intl.get('hpfm.individual.model.config.customizeUnit').d('个性化单元')}
              >
                <div className="units-container" onClick={this.clickUnit}>
                  {currentGroup.units.map((i) => {
                    const _id = i.tplUsedFlag ? '' : i.id;
                    const unitNode = (
                      <div
                        id={_id}
                        className={`unit-card ${id == i.id ? 'active' : ''} ${
                          i.tplUsedFlag ? 'disabled' : ''
                        }`}
                      >
                        <div id={_id} className="icon-unit" />
                        <div id={_id} className="content-unit">
                          {this.renderUnitTypeTag(i)}
                          {i.unitName}
                        </div>
                      </div>
                    );
                    if (i.tplUsedFlag) {
                      return (
                        <Tooltip
                          title={intl
                            .get('hpfm.customize.common.tip.unitUsedByTpl')
                            .d('该单元已用于“单据样式定制”功能，请至“单据样式定制”进行配置')}
                        >
                          {unitNode}
                        </Tooltip>
                      );
                    }
                    return unitNode;
                  })}
                </div>
              </FormItem>
            </div>
          </Spin>
        </div>
        <div className="right-box-divider" />
        {!loadingCurrentUnit && !loadingGroup && !tplUsedFlag ? (
          <div className="right-box1">
            <Spin spinning={loadingGroup}>
              <Tabs
                className={styles['unit-detail-tabs']}
                animated={false}
                activeKey={tabKey}
                onChange={this.handleChangeTab}
                tabBarExtraContent={
                  CUSZ_DATR_MIGRATE_ENABLE === 'true' && (
                    <ImportUnitButton
                      groupCode={currentGroup.groupCode}
                      unitCode={unitCode}
                      unitType={unitType}
                    />
                  )
                }
              >
                <Tabs.TabPane
                  tab={intl.get('hpfm.individual.view.message.title.unitConfig').d('单元配置')}
                  key="unit"
                >
                  <div style={{ padding: 16 }}>
                    {['FORM', 'FILTER', 'QUERYFORM', 'SECTION', 'GRID'].includes(unitType) && (
                      <div style={{ textAlign: 'right' }}>
                        <Tooltip
                          title={intl
                            .get('hpfm.customize.common.resetToPlatform')
                            .d('重置为平台级配置')}
                        >
                          <Button
                            type="default"
                            onClick={this.handleResetUnitConfig}
                            style={{ marginRight: '8px' }}
                          >
                            {intl.get('hzero.common.button.reset').d('重置')}
                          </Button>
                        </Tooltip>
                        <Button type="primary" onClick={this.handleSaveUnitConfig}>
                          {intl.get('hzero.common.button.save').d('保存')}
                        </Button>
                      </div>
                    )}
                    {unitTitleEnable && (
                      <Row gutter={48} className="read-row">
                        <Col span={8}>
                          <FormItem
                            label={intl.get('hpfm.customize.common.unitTitle').d('单元标题')}
                            {...formLayout}
                          >
                            {form.getFieldDecorator('unitTitle', {
                              initialValue: (config || {}).unitTitle,
                            })(
                              <TLEditor
                                label={intl.get('hpfm.customize.common.unitTitle').d('单元标题')}
                                field="unitTitle"
                                token={(config || {})._token}
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    <Row gutter={48} className="read-row">
                      <Col span={8}>
                        <FormItem
                          label={intl.get('hpfm.individual.model.config.unitType').d('单元类型')}
                          {...formLayout}
                        >
                          {unitTypeObj[unitType]}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          label={intl
                            .get('hpfm.individual.model.config.individualCode')
                            .d('个性化编码')}
                          {...formLayout}
                        >
                          {unitCode}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={48} className="read-row">
                      <Col span={8}>
                        <FormItem
                          label={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.combinObj')
                            .d('关联业务对象组合')}
                          {...formLayout}
                        >
                          {combineName}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          label={intl
                            .get('hpfm.individuationUnit.model.individuationUnit.busObj')
                            .d('关联业务对象')}
                          {...formLayout}
                        >
                          {modelName}
                        </FormItem>
                      </Col>
                    </Row>
                    {isFormType && (
                      <>
                        <Row gutter={48} className="read-row">
                          <Col span={8}>
                            <FormItem
                              label={intl
                                .get('hpfm.individual.model.config.labelCol')
                                .d('标签比例')}
                              {...formLayout}
                            >
                              {labelCol}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem
                              label={intl
                                .get('hpfm.individual.model.config.wrapperCol')
                                .d('组件比例')}
                              {...formLayout}
                            >
                              {wrapperCol}
                            </FormItem>
                          </Col>
                          {formMaxColEnable && (
                            <Col span={8}>
                              <FormItem
                                label={intl
                                  .get('hpfm.individual.model.config.formColumns')
                                  .d('表单列数')}
                                {...formLayout}
                              >
                                {form.getFieldDecorator('maxCol', {
                                  initialValue: (config || {}).maxCol || formMaxCol,
                                })(<InputNumber precision={0} min={1} style={{ width: '100%' }} />)}
                              </FormItem>
                            </Col>
                          )}
                        </Row>
                        <Row gutter={48} className="read-row" style={{ paddingRight: '96px' }}>
                          {unitType === 'FORM' && (
                            <Col span={24}>
                              <FormItem
                                label={
                                  <>
                                    {intl
                                      .get('hpfm.individual.model.config.showFieldSet')
                                      .d('预展示字段')}
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
                                labelCol={{ span: 3 }}
                                wrapperCol={{ span: 21 }}
                              >
                                {lineData.map((l) =>
                                  l.showFieldFlag ? (
                                    <Tag
                                      color="blue"
                                      style={{ cursor: 'default', borderRadius: '10px' }}
                                    >
                                      {l.fieldName}({l.fieldCodeAlias})
                                    </Tag>
                                  ) : null
                                )}
                              </FormItem>
                            </Col>
                          )}
                        </Row>
                      </>
                    )}
                    <Row gutter={48} className="read-row" style={{ paddingRight: '96px' }}>
                      <Col span={24}>
                        <FormItem
                          label={intl.get('hpfm.customize.common.unitTag').d('单元标签')}
                          labelCol={{ span: 3 }}
                          wrapperCol={{ span: 21 }}
                        >
                          {tags.map(
                            (l) =>
                              l && (
                                <Tag
                                  color="blue"
                                  style={{ cursor: 'default', borderRadius: '10px' }}
                                >
                                  {l}
                                </Tag>
                              )
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    {isSeachBarType && (
                      <Row gutter={48} className="read-row">
                        <Col span={8}>
                          <FormItem
                            label={intl
                              .get('hpfm.individual.model.config.sortedEnabled')
                              .d('启用排序')}
                            {...formLayout}
                          >
                            {sortedEditorFlag === 1
                              ? form.getFieldDecorator('sortedEnabled', {
                                  initialValue: sortedEnabled,
                                })(
                                  <Select
                                    style={{ width: '100%' }}
                                    onChange={this.handleSaveUnitConfig}
                                  >
                                    <Select.Option value={1}>
                                      {intl.get('hzero.common.yes').d('是')}
                                    </Select.Option>
                                    <Select.Option value={0}>
                                      {intl.get('hzero.common.no').d('否')}
                                    </Select.Option>
                                    <Select.Option value={-1}>
                                      {intl.get('hzero.common.status.default').d('默认')}
                                    </Select.Option>
                                  </Select>
                                )
                              : intl.get('hzero.common.no').d('否')}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {unitType === 'GRID' && (
                      <Row gutter={48}>
                        <Col span={8}>
                          <FormItem
                            label={intl
                              .get('hpfm.customize.common.pageAsyncFlag')
                              .d('异步显示总数')}
                            {...formLayout}
                          >
                            {form.getFieldDecorator('pageAsyncFlag', {
                              // eslint-disable-next-line no-nested-ternary
                              initialValue:
                                pageAsyncFlag === 0
                                  ? 0
                                  : (config || {}).pageAsyncFlag !== undefined
                                  ? (config || {}).pageAsyncFlag
                                  : pageAsyncFlag,
                            })(
                              <Select disabled={pageAsyncFlag === 0}>
                                <Select.Option value={1}>
                                  {intl.get('hzero.common.status.yes').d('是')}
                                </Select.Option>
                                <Select.Option value={0}>
                                  {intl.get('hzero.common.status.no').d('否')}
                                </Select.Option>
                                <Select.Option value={-1}>
                                  {intl.get('hzero.common.status.default').d('默认')}
                                </Select.Option>
                              </Select>
                            )}
                          </FormItem>
                        </Col>
                        {tags.includes('C7N') && (
                          <Col span={8}>
                            <FormItem
                              label={intl
                                .get('hpfm.customize.common.defaultPageSize')
                                .d('默认分页大小')}
                              {...formLayout}
                            >
                              {form.getFieldDecorator('pageSize', {
                                initialValue: (config || {}).pageSize,
                              })(<InputNumber max={100} min={1} />)}
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                    )}
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab={getFieldConfigAlias(unitType)} key="field">
                  <div style={{ textAlign: 'right', margin: '10px 0' }}>
                    {!isSeachBarType && (
                      <Button
                        onClick={this.handleToggleCopyFieldModal}
                        disabled={selectedRows.length < 1}
                        style={{
                          display: disableNewField ? 'none' : 'inline-block',
                          marginRight: '8px',
                        }}
                      >
                        {intl.get('hpfm.individual.model.config.copyField').d('拷贝字段')}
                      </Button>
                    )}
                    <Button
                      icon="plus"
                      type="primary"
                      onClick={() => this.toggleConfigModal({}, 'new')}
                      disabled={!id}
                      style={{ display: disableNewField ? 'none' : 'inline-block' }}
                    >
                      {intl.get('hpfm.individual.model.config.addExtraField').d('添加扩展字段')}
                    </Button>
                  </div>
                  <Table
                    rowKey={(n) => `${n.fieldCode || ''}${n.configFieldId || ''}`}
                    bordered
                    rowSelection={
                      !isSeachBarType && {
                        selectedRowKeys: selectedRows.map(
                          (n) => `${n.fieldCode || ''}${n.configFieldId || ''}`
                        ),
                        onChange: this.handleSelectRows,
                        getCheckboxProps: (record) => ({
                          disabled: isNil(record.configFieldId),
                        }),
                      }
                    }
                    pagination={false}
                    columns={this.renderColumns()}
                    dataSource={lineData}
                    scroll={{ x: this.scrollX }}
                    resizable
                  />
                </Tabs.TabPane>
                {isSeachBarType && (
                  <Tabs.TabPane
                    tab={intl.get('hpfm.customize.common.filterConfig').d('筛选器配置')}
                    key="filter"
                  >
                    {tabKey === 'filter' && (
                      <SearchBarConfig
                        unitInfo={currentUnit}
                        unitList={unitList}
                        unitId={id}
                        originFields={lineData}
                        onRef={this.handleSearchBarRef}
                      />
                    )}
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Spin>
          </div>
        ) : (
          <div
            className="right-box1"
            style={{
              display: 'flex',
              height: '120px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {loadingCurrentUnit || loadingGroup ? null : (
              <span style={{ fontSize: '18px' }}>
                <Icon type="lock" />
                {intl.get('hpfm.individual.model.config.lockUnit').d('单元已禁用')}
              </span>
            )}
          </div>
        )}
        {/* </div> */}
      </>
    );
  }

  render() {
    const {
      visible,
      copyFieldModalVisible,
      currentRecord,
      modalType,
      expandedKeys,
      unitList,
      fieldList,
      selectedRows,
    } = this.state;
    const { loadTree = false, treeData, currentUnit } = this.props;

    return (
      <>
        <Header title={intl.get(`hpfm.individual.view.message.title.config`).d('个性化配置')}>
          {CUSZ_DATR_MIGRATE_ENABLE === 'true' && (
            <>
              <ExportButton />
              <ImportButton />
            </>
          )}
        </Header>
        <div className={styles['main-container']}>
          <div className={styles['wrap-container']}>
            <div className={styles.left}>
              <header
                style={{
                  textAlign: 'left',
                  fontWeight: '600',
                  paddingLeft: '12px',
                  background: '#fff',
                  lineHeight: '42px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                {intl.get(`hpfm.individual.view.message.title.category`).d('个性化目录')}
              </header>
              <Spin spinning={loadTree}>
                <div className="left-container">
                  <Tree
                    onSelect={this.onSelect}
                    expandedKeys={expandedKeys}
                    onExpand={this.onExpand}
                  >
                    {this.renderTreeNodes(treeData)}
                  </Tree>
                </div>
              </Spin>
            </div>
            <div id="right-box-container" className={styles.right1}>
              {this.renderContent()}
            </div>
          </div>
        </div>
        <ConfigModal
          type={modalType}
          visible={visible}
          unitList={unitList}
          fieldList={fieldList}
          unitInfo={currentUnit}
          refreshLineData={this.queryUnitDetails}
          record={currentRecord}
          ctxParams={this.contextParams}
          onClose={() => this.toggleConfigModal({})}
        />
        {copyFieldModalVisible && (
          <CopyFieldModal
            visible={copyFieldModalVisible}
            currentUnit={currentUnit}
            copyFields={selectedRows}
            handleClose={this.handleToggleCopyFieldModal}
          />
        )}
      </>
    );
  }
}
