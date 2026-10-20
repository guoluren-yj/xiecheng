import React from 'react';

import {
  Form,
  Lov,
  TextField,
  Select,
  NumberField,
  Table,
  DatePicker,
  Switch,
  IntlField,
  Button,
  Tooltip,
  Modal,
  DataSet,
} from 'choerodon-ui/pro';
import { Modal as c7nModal, Tabs, Badge } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isFunction, isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import classNames from 'classnames';
import { PRIVATE_BUCKET } from '_utils/config';


import {
  fetchConditionDataOrg,
  saveConditionDataOrg,
  fetchLovReferenceTipOrg,
} from '@/services/priceLibDimensionService';
import ConstructForm from '../ConstructForm';
import { basicDrawerConditionDS, basicDrawerFilterDS } from './lineDS';
import ConditionConfig from './ConditionConfig';

import style from './../../index.less';

const { Sidebar } = c7nModal;
const { TabPane } = Tabs;

@observer
export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      fieldWidgetValue: 'INPUT',
      activityTabKey: 'mappingRelations',
      conditionData: {},
      lovTips: undefined, // lov选择参考建议
    };
  }

  editConditionDs = new DataSet(basicDrawerConditionDS(this.props.enabledEdit));

  editFilterDs = new DataSet(basicDrawerFilterDS());

  requiredConditionDs = new DataSet(basicDrawerConditionDS(this.props.enabledEdit));

  requiredFilterDs = new DataSet(basicDrawerFilterDS());

  componentDidMount() {
    this.props.basicDrawerFormDs.addEventListener('load', this.handleLoad);
    this.props.basicDrawerFormDs.addEventListener('update', this.handleChange);
    this.editConditionDs.setQueryParameter('templateId', this.props.templateId);
    this.requiredConditionDs.setQueryParameter('templateId', this.props.templateId);
  }

  /**
   * 监听
   */
  @Bind()
  handleLoad() {
    this.forceUpdate();
  }

  /**
   * 监听事件
   */
  @Bind()
  handleChange({ name, value, dataSet }) {
    const { fieldWidgetValue = 'INPUT' } = this.state;
    // 值集编码与默认值的联动
    if (name === 'sourceCodeLov') {
      if (fieldWidgetValue === 'SELECT') {
        // 组件类型下拉框
        dataSet.getField('defaultValue').reset();
        dataSet.current.set('defaultValue', null);
        if (value) {
          dataSet.getField('defaultValue').set('lookupCode', value.lovCode);
        } else {
          dataSet.getField('defaultValue').set('lookupCode', '');
        }
      } else if (fieldWidgetValue === 'LOV') {
        // 组件类型LOV
        dataSet.getField('defaultValueMeaning').reset();
        dataSet.getField('defaultValueCode').reset();
        dataSet.getField('defaultValue').reset();
        // dataSet.getField('defaultValueMeaning').reset();
        dataSet.current.set('defaultValueLov', null);
        dataSet.current.set('defaultValueCode', null);
        dataSet.current.set('defaultValueMeaning', null);
        dataSet.current.set('defaultValue', null);
        // if (value) { // LOV缓存, 需要动态设置
        //   dataSet.getField('defaultValueLov').set('lovCode', value.viewCode);
        //   // dataSet.getField('defaultValueLov').setLovPara('lovCode', value.viewCode);
        // } else {
        //   dataSet.getField('defaultValueLov').set('lovCode', '');
        //   // dataSet.getField('defaultValueLov').setLovPara('lovCode', '');
        // }
      }
    }
    // 日期格式与默认值的联动
    if (name === 'dateFormat') {
      if (value) {
        if (value === 'yyyy/MM/dd hh:mm:ss' || value === 'yyyy-MM-dd hh:mm:ss') {
          dataSet.getField('defaultValue').set('type', 'dateTime');
        } else {
          dataSet.getField('defaultValue').set('type', 'date');
        }
        dataSet.getField('defaultValue').set('format', this.renderDateFormat(value));
        dataSet
          .getField('defaultValue')
          .set(
            'transformRequest',
            (val) => val && moment(val).format(this.renderDateFormat(value))
          );
      } else {
        // 默认设置date,以及format格式，transformRequest格式
        dataSet.getField('defaultValue').set('type', 'date');
        dataSet.getField('defaultValue').set('format', getDateFormat());
        dataSet
          .getField('defaultValue')
          .set('transformRequest', (val) => val && moment(val).format(DEFAULT_DATE_FORMAT));
      }
    }
    if (name === 'defaultValueLov') {
      if (value) {
        dataSet.current.set('defaultValue', value[dataSet.current.get('valueField')]);
      } else {
        dataSet.current.set('defaultValue', '');
      }
    }
    if (name === 'queryFlag') {
      dataSet.current.set('preDisplayFlag', value);
    }
  }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD hh:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD hh:mm:ss';
        break;
      default:
        break;
    }
    return format;
  }

  /**
   * 展示-是否可编辑、必输条件设置
   */
  @Bind()
  async showCondition(conditionDs, filterDs) {
    const { basicDrawerFormDs, enabledEdit = true } = this.props;

    const params = {
      sourceFromId: basicDrawerFormDs.current && basicDrawerFormDs.current.get('dimensionId'),
      sourceFrom: conditionDs === this.editConditionDs ? 'DIMENSION_EDIT' : 'DIMENSION_REQUIRED',
    };

    const configProps = {
      modal: this._modal,
      conditionDs,
      filterDs,
      conditionParams: params,
      enabledEdit,
      fetchConditionData: this.fetchConditionData,
    };
    this._modal = Modal.open({
      key: Modal.key(),
      drawer: true,
      title: enabledEdit
        ? intl.get('ssrc.priceLibDimension.view.message.conditionalConfig').d('条件配置')
        : intl.get('ssrc.priceLibDimension.view.message.viewCondition').d('查看条件'),
      style: {
        width: 742,
        paddingTpo: 0,
      },
      children: <ConditionConfig {...configProps} />,
      onOk: async () => {
        if (enabledEdit) {
          if (await conditionDs.validate()) {
            const saveRes = getResponse(
              await saveConditionDataOrg({
                ...this.state.conditionData,
                ...params,
                priceLibRuleLineList: conditionDs.toData(),
                priceLibRuleCombList: filterDs.toData(),
              })
            );
            if (saveRes && !saveRes.failed) {
              notification.success();
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return true;
        }
      },
      okCancel: enabledEdit,
      okText: !enabledEdit
        ? intl.get('hzero.common.button.close').d('关闭')
        : intl.get('hzero.common.button.ok').d('确定'),
      onCancel: () => true,
      afterClose: () => {
        // 如果count有更新, 更新count
        const count = conditionDs.filter((item) => item.toData().ruleLineId).length;
        const fieldCountName = conditionDs === this.editConditionDs ? 'editCount' : 'requiredCount';
        if (count !== basicDrawerFormDs.current.get(fieldCountName)) {
          basicDrawerFormDs.current.set(fieldCountName, count);
          // this.forceUpdate();
        }
        conditionDs.loadData([]);
        filterDs.reset();
        this.setState({
          conditionData: {},
        });
      },
    });

    const res = getResponse(await fetchConditionDataOrg(params));
    if (res && !res.failed) {
      conditionDs.setQueryParameter('ruleHeaderId', res.ruleHeaderId);
      // 若查出来没有条件，则前端生成一条
      if (isEmpty(res.priceLibRuleLineList) && enabledEdit) {
        conditionDs.create({}, 0);
        // this._modal.update();
      } else {
        conditionDs.loadData(res.priceLibRuleLineList);
      }
      filterDs.loadData(res.priceLibRuleCombList);
      this.setState({
        conditionData: res,
      });
    }
  }

  /**
   * 编辑保存，删除, 保存指定值后，调大查询，为了存储editableConditionData,objectVersionNumber，大保存用
   * 查询编辑条件数据
   */
  @Bind()
  async fetchConditionData(conditionDs, params) {
    const res = getResponse(await fetchConditionDataOrg(params));
    if (res && !res.failed) {
      // load this.editConditionDs
      conditionDs.loadData(res.priceLibRuleLineList);
      this.setState({
        conditionData: res,
      });
    }
  }

  /**
   * 改变维度编码，请求值集描述和编码
   */
  @Bind()
  async changeDimensionCode(value) {
    const res = getResponse(await fetchLovReferenceTipOrg({ dimensionCode: value }));
    if (res && !res.failed) {
      this.setState({
        lovTips: res.lovTips,
      });
    }
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    const record = ds.create({}, 0);
    record.setState('_status', 'create');
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('_status', 'update');
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handleCancel(record) {
    record.reset();
    record.setState('_status', '');
  }

  // 按钮
  @Bind()
  renderButtons(ds) {
    return [
      <Button icon="playlist_add" onClick={() => this.handleAdd(ds)} key="add">
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      [
        'delete',
        {
          icon: 'delete_sweep',
          children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        },
      ],
    ];
  }

  /**
   * 改变组件类型
   */
  @Bind()
  changeFieldWidget(value) {
    const { basicDrawerFormDs, basicDrawerLinkDs, editor } = this.props;
    const { fieldWidgetValue = 'INPUT', activityTabKey = 'mappingRelations' } = this.state;
    // todo 为了重新渲染弹框,可以尝试改变shouldComponentUpdate函数
    this.setState({
      fieldWidgetValue: value,
    });

    if (value === 'LINK') {
      this.setState({
        activityTabKey: 'linkDetails',
      });
      basicDrawerFormDs.current.set('queryFlag', 0);
      basicDrawerFormDs.current.set('preDisplayFlag', 0);
      if (editor) {
        basicDrawerLinkDs.setQueryParameter(
          'dimensionId',
          basicDrawerFormDs.current.get('dimensionId')
        );
        basicDrawerLinkDs.query();
      }
    } else if (value === 'LOV') {
      this.setState({
        activityTabKey: 'lovMappings',
      });
    } else if (
      activityTabKey === 'linkDetails' ||
      activityTabKey === 'lovMappings' ||
      activityTabKey === 'lovParamter'
    ) {
      this.setState({
        activityTabKey: 'mappingRelations',
      });
    } else if (value === 'UPLOAD') {
      // 上传组件
      basicDrawerFormDs.current.set('queryFlag', 0);
      basicDrawerFormDs.current.set('preDisplayFlag', 0);
      basicDrawerFormDs.current.set('bucketName', PRIVATE_BUCKET);
      basicDrawerFormDs.current.set('bucketDirectory', 'price-center');
    }

    // 组件类型发生改变，清空上一次组件设置的值
    if (fieldWidgetValue !== value) {
      switch (fieldWidgetValue) {
        case 'INPUT':
          basicDrawerFormDs.getField('defaultValue').reset(); // 重置属性
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          basicDrawerFormDs.current.set('textMaxLength', null);
          basicDrawerFormDs.current.set('textMinLength', null);
          break;
        case 'INPUT_NUMBER':
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('numberMax', null);
          basicDrawerFormDs.current.set('numberMin', null);
          basicDrawerFormDs.current.set('numberPrecision', null);
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'SELECT':
        case 'LOV':
          basicDrawerFormDs.getField('sourceCodeLov').reset();
          basicDrawerFormDs.getField('defaultValueLov').reset();
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('multipleFlag', 0);
          basicDrawerFormDs.current.set('sourceCodeLov', null); // 重置框值
          basicDrawerFormDs.current.set('defaultValueLov', null);
          basicDrawerFormDs.current.set('defaultValue', null);
          basicDrawerFormDs.getField('defaultValueMeaning').reset();
          basicDrawerFormDs.current.set('defaultValueMeaning', null);
          break;
        case 'DATE_PICKER':
          basicDrawerFormDs.current.set('dateFormat', null);
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          basicDrawerFormDs.getField('defaultValue').reset(); // reset整个属性
          break;
        case 'SWITCH':
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'UPLOAD':
          basicDrawerFormDs.current.set('bucketName', null);
          basicDrawerFormDs.current.set('bucketDirectory', null); // 重置框值
          break;
        case 'LONG_INPUT':
          basicDrawerFormDs.getField('defaultValue').reset();
          basicDrawerFormDs.current.set('defaultValue', null); // 重置框值
          break;
        case 'LINK':
          // basicDrawerFormDs.current.set('linkTitle', null);
          // basicDrawerFormDs.current.set('linkHref', null); // 重置框值
          // basicDrawerFormDs.current.set('linkOpenMethod', null);
          break;
        default:
          break;
      }
    }

    if (value === 'SWITCH') {
      basicDrawerFormDs.current.set('defaultValue', 0);
    }
  }

  /**
   * 关闭弹框
   */
  @Bind()
  handleCancelDrawer() {
    this.setState({
      fieldWidgetValue: 'INPUT',
      activityTabKey: 'mappingRelations',
      lovTips: undefined,
    });
    this.props.onCancel();
  }

  /**
   * 改变tab标签
   */
  @Bind()
  changeTabs(activityKey) {
    this.setState({
      activityTabKey: activityKey,
    });
  }

  /**
   * 改变是否为主键
   */
  @Bind()
  changeSameGroupFlag(val) {
    const { basicDrawerFormDs } = this.props;
    if (val) {
      basicDrawerFormDs.current.set('enabledFlag', 1);
      basicDrawerFormDs.current.set('fieldRequired', 1);
    }
  }

  /**
   * 渲染默认值类型
   */
  @Bind()
  renderDefaultValue(enabledEdit) {
    const { basicDrawerFormDs } = this.props;
    const { fieldWidgetValue = '', lovTips = undefined } = this.state;
    let type = [];
    let fieldType = 'string';
    switch (fieldWidgetValue) {
      case 'INPUT':
        type = [
          <ConstructForm formType="TextField" isEdit={enabledEdit} name="defaultValue" />,
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="textMaxLength" />,
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="textMinLength" />,
        ];
        break;
      case 'INPUT_NUMBER':
        type = [
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="numberMax" />,
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="numberMin" />,
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="numberPrecision" />,
          <ConstructForm
            formType="NumberField"
            isEdit={enabledEdit}
            name="defaultValue"
            step={1}
          />,
        ];
        fieldType = 'number';
        break;
      case 'SELECT':
        type = [
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="multipleFlag" />,
          <ConstructForm formType="Lov" isEdit={enabledEdit} name="sourceCodeLov" />,
          <ConstructForm formType="Select" isEdit={enabledEdit} name="defaultValue" />,
        ];
        basicDrawerFormDs.getField('sourceCodeLov').set('lovCode', 'HPFM.LOV.LOV_DETAIL_CODE.ORG');
        basicDrawerFormDs.getField('sourceCodeLov').set('lovQueryAxiosConfig', {
          url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`,
          method: 'GET',
        });
        basicDrawerFormDs.getField('sourceCodeLov').set('lovPara', {
          enabledFlag: 1,
        });
        basicDrawerFormDs
          .getField('defaultValue')
          .set(
            'lookupCode',
            basicDrawerFormDs.current && basicDrawerFormDs.current.toData().sourceCode
          );
        // basicDrawerFormDs.getField('sourceCodeLov').set('required', true);
        break;
      case 'LOV':
        type = [
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="multipleFlag" />,
          <ConstructForm
            formType="Lov"
            isEdit={enabledEdit}
            name="sourceCodeLov"
            showHelp="tooltip"
            help={
              lovTips || (basicDrawerFormDs.current && basicDrawerFormDs.current.toData().lovTips)
            }
          />,
          <ConstructForm formType="Lov" isEdit={enabledEdit} name="defaultValueLov" />,
        ];
        basicDrawerFormDs.getField('sourceCodeLov').set('lovCode', 'HPFM.LOV.VIEW.ORG');
        basicDrawerFormDs.getField('sourceCodeLov').set('lovQueryAxiosConfig', {
          url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`,
          method: 'GET',
        });
        basicDrawerFormDs
          .getField('defaultValueLov')
          .set(
            'lovCode',
            basicDrawerFormDs.current && basicDrawerFormDs.current.toData().sourceCode
          );
        basicDrawerFormDs.getField('defaultValueLov').set('type', 'object');
        // basicDrawerFormDs
        //   .getField('defaultValueLov')
        //   .setLovPara('lovCode', basicDrawerFormDs.current.toData().sourceCode);
        // basicDrawerFormDs.getField('sourceCodeLov').set('required', true);
        break;
      case 'DATE_PICKER':
        type = [
          <ConstructForm formType="Select" isEdit={enabledEdit} name="dateFormat" />,
          <ConstructForm formType="DatePicker" isEdit={enabledEdit} name="defaultValue" />,
        ];
        // 默认设置date,以及format格式，transformRequest格式
        fieldType = 'date';
        basicDrawerFormDs.getField('defaultValue').set('format', getDateFormat());
        basicDrawerFormDs
          .getField('defaultValue')
          .set('transformRequest', (value) => value && moment(value).format(DEFAULT_DATE_FORMAT));
        break;
      case 'SWITCH':
        type = [<ConstructForm formType="CheckBox" isEdit={enabledEdit} name="defaultValue" />];
        fieldType = 'boolean';
        basicDrawerFormDs.getField('defaultValue').set('trueValue', 1);
        basicDrawerFormDs.getField('defaultValue').set('falseValue', 0);
        basicDrawerFormDs.getField('defaultValue').set('defaultValue', 0);
        break;
      case 'UPLOAD':
        type = [
          <ConstructForm formType="TextField" isEdit={enabledEdit} name="bucketName" />,
          <ConstructForm formType="TextField" isEdit={enabledEdit} name="bucketDirectory" />,
        ];
        break;
      case 'LINK':
        type = [];
        break;
      default:
        type = [<ConstructForm formType="TextField" isEdit={enabledEdit} name="defaultValue" />];
        break;
    }
    basicDrawerFormDs.getField('defaultValue').set('type', fieldType);
    return type;
  }

  /**
   * 渲染基础维度弹框内容
   */
  @Bind()
  renderBasicChild() {
    const {
      editor = false,
      basicDrawerFormDs,
      basicDrawerMapDs,
      basicDrawerLinkDs,
      basicDrawerLovMapDs,
      basicDrawerLovParamDs,
      enabledEdit = false,
    } = this.props;
    const { activityTabKey = 'mappingRelations' } = this.state;

    const editCount = basicDrawerFormDs.current && basicDrawerFormDs.current.get('editCount');

    const requiredCount =
      basicDrawerFormDs.current && basicDrawerFormDs.current.get('requiredCount');

    // 映射关系columns
    const mappingListColumns = [
      {
        name: 'sourceFrom',
        width: 150,
        editor: () => {
          if (enabledEdit) {
            return (
              <Select
                name="sourceFrom"
                optionsFilter={(recording) => recording.get('value') !== 'MANUL'}
              />
            );
          } else {
            return false;
          }
        },
      },
      {
        name: 'sourceFromField',
        width: 200,
        editor: enabledEdit,
      },
      {
        name: 'sourceFromFieldName',
        width: 250,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      // enabledEdit && {
      //   name: 'action',
      //   width: 100,
      //   renderer: ({ record }) => {
      //     if (!['update', 'create'].includes(record.getState('_status'))) {
      //       return (
      //         <a onClick={() => this.handelEdit(record)}>
      //           {intl.get('hzero.common.button.editor').d('编辑')}
      //         </a>
      //       );
      //     } else if (record.getState('_status') === 'update') {
      //       return (
      //         <a onClick={() => this.handleCancel(record)}>
      //           {intl.get('hzero.common.view.button.cancel').d('取消')}
      //         </a>
      //       );
      //     }
      //   },
      // },
    ];

    if (
      editor &&
      basicDrawerFormDs.current &&
      basicDrawerFormDs.current.get('fieldWidget') === 'LINK'
    ) {
      basicDrawerLinkDs
        .getField('checkDimIdLov')
        .setLovPara('dimensionId', basicDrawerFormDs.current.get('dimensionId'));
    }

    // 链接明细columns
    const linkListColumns = [
      {
        name: 'linkTitle',
        width: 150,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'linkHref',
        width: 200,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'linkOpenMethod',
        width: 150,
        editor: enabledEdit,
      },
      {
        name: 'windowWidth',
        width: 120,
        editor: enabledEdit,
      },
      {
        name: 'checkDimIdLov',
        width: 150,
        tooltip: 'overflow',
        // editor: true,
        editor: (record) => (enabledEdit ? true : record.get('checkDimName')),
      },
      {
        name: 'checkExpression',
        width: 120,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'checkValue',
        width: 120,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      // enabledEdit && {
      //   name: 'action',
      //   width: 100,
      //   renderer: ({ record }) => {
      //     if (!['update', 'create'].includes(record.getState('_status'))) {
      //       return (
      //         <a onClick={() => this.handelEdit(record)}>
      //           {intl.get('hzero.common.button.editor').d('编辑')}
      //         </a>
      //       );
      //     } else if (record.getState('_status') === 'update') {
      //       return (
      //         <a onClick={() => this.handleCancel(record)}>
      //           {intl.get('hzero.common.view.button.cancel').d('取消')}
      //         </a>
      //       );
      //     }
      //   },
      // },
    ];

    // 值集映射关系columns
    const lovMappingListColumns = [
      {
        name: 'targetDimensionCodeLOV',
        width: 150,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'fieldType',
        width: 120,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'sourceFromField',
        width: 150,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'sourceFromFieldName',
        width: 200,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'sourceFromFieldMeaning',
        width: 200,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'importCheckFlag',
        width: 130,
        tooltip: 'overflow',
        editor: enabledEdit,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      // enabledEdit && {
      //   name: 'action',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   width: 100,
      //   renderer: ({ record }) => {
      //     if (!['update', 'create'].includes(record.getState('_status'))) {
      //       return (
      //         <a onClick={() => this.handelEdit(record)}>
      //           {intl.get('hzero.common.button.editor').d('编辑')}
      //         </a>
      //       );
      //     } else if (record.getState('_status') === 'update') {
      //       return (
      //         <a onClick={() => this.handleCancel(record)}>
      //           {intl.get('hzero.common.view.button.cancel').d('取消')}
      //         </a>
      //       );
      //     }
      //   },
      // },
    ];

    // 值集参数关系columns
    const lovParamListColumns = [
      {
        name: 'paramName',
        width: 200,
        tooltip: 'overflow',
        editor: enabledEdit,
      },
      {
        name: 'paramType',
        width: 150,
        tooltip: 'overflow',
        editor: () => {
          if (enabledEdit) {
            return <Select name="paramType" clearButton={false} />;
          } else {
            return false;
          }
        },
      },
      {
        name: 'paramValue1',
        width: 250,
        tooltip: 'overflow',
        header: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
        renderer: ({ record }) => {
          if (enabledEdit) {
            if (record.get('paramType') === 'DIMENSION') {
              return (
                <Lov
                  record={record}
                  name="paramValueLOV"
                  clearButton={false}
                  style={{ width: '100%' }}
                />
              );
            } else if (record.get('paramType') === 'FIXED_VALUE') {
              return <TextField record={record} name="paramValue" style={{ width: '100%' }} />;
            }
          } else if (record.get('paramType') === 'DIMENSION') {
            return record.get('paramValueMeaning');
          } else if (record.get('paramType') === 'FIXED_VALUE') {
            return record.get('paramValue');
          }
        },
      },
      {
        name: 'applyQueryFlag',
        width: 150,
        editor: enabledEdit,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      // enabledEdit && {
      //   name: 'action',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   width: 100,
      //   renderer: ({ record }) => {
      //     if (!['update', 'create'].includes(record.getState('_status'))) {
      //       return (
      //         <a onClick={() => this.handelEdit(record)}>
      //           {intl.get('hzero.common.button.editor').d('编辑')}
      //         </a>
      //       );
      //     } else if (record.getState('_status') === 'update') {
      //       return (
      //         <a onClick={() => this.handleCancel(record)}>
      //           {intl.get('hzero.common.view.button.cancel').d('取消')}
      //         </a>
      //       );
      //     }
      //   },
      // },
    ];

    return (
      <React.Fragment>
        <Form
          dataSet={basicDrawerFormDs}
          columns={2}
          labelLayout={enabledEdit ? 'float' : 'vertical'}
          className={enabledEdit ? null : 'c7n-pro-vertical-form-display'}
        >
          <ConstructForm
            formType="TextField"
            disabled={editor}
            isEdit={enabledEdit}
            name="dimensionCode"
            onChange={this.changeDimensionCode}
          />
          <ConstructForm formType="IntlField" isEdit={enabledEdit} name="dimensionName" />
          <ConstructForm
            formType="Select"
            disabled={editor}
            isEdit={enabledEdit}
            name="dimensionCategory"
          />
          <ConstructForm
            formType="CheckBox"
            isEdit={enabledEdit}
            name="sameGroupFlag"
            showHelp="tooltip"
            onChange={this.changeSameGroupFlag}
          />
          {/* <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="enabledFlag" /> */}
          <div name="fieldEditable">
            <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="fieldEditable" />
            {basicDrawerFormDs.current && basicDrawerFormDs.current.get('dimensionId') && (
              <Tooltip
                placement="right"
                title={intl
                  .get('ssrc.priceLibDimension.view.message.conditionalConfig')
                  .d('条件配置')}
              >
                <a
                  className={editCount > 0 && style['fx-alink-active']}
                  style={{
                    // color: '#333333',
                    marginRight: '8px',
                    marginLeft: '4px',
                    fontSize: '14px',
                    verticalAlign: 'middle',
                  }}
                  onClick={() => this.showCondition(this.editConditionDs, this.editFilterDs)}
                >
                  fx
                </a>
                <Badge count={editCount} className={style['badge-style']} />
              </Tooltip>
            )}
          </div>
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="fieldBatchEditable" />
          <div name="fieldRequired">
            <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="fieldRequired" />
            {basicDrawerFormDs.current && basicDrawerFormDs.current.get('dimensionId') && (
              <Tooltip
                placement="right"
                title={intl
                  .get('ssrc.priceLibDimension.view.message.conditionalConfig')
                  .d('条件配置')}
              >
                <a
                  className={requiredCount > 0 && style['fx-alink-active']}
                  style={{
                    // color: '#333333',
                    marginRight: '8px',
                    marginLeft: '4px',
                    fontSize: '14px',
                    verticalAlign: 'middle',
                  }}
                  onClick={() =>
                    this.showCondition(this.requiredConditionDs, this.requiredFilterDs)
                  }
                >
                  fx
                </a>
                <Badge count={requiredCount} className={style['badge-style']} />
              </Tooltip>
            )}
          </div>
          {basicDrawerFormDs?.current?.get('fieldRequired') ? (
            <ConstructForm formType="Select" isEdit={enabledEdit} name="sourceFormRequired" />
          ) : (
            []
          )}
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="fieldVisible" />
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="queryFlag" />
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="preDisplayFlag" />
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="autoScopeFlag" />
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="mobileShowFlag" />
          <ConstructForm formType="CheckBox" isEdit={enabledEdit} name="priceDistributionFlag" />
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="gridSeq" />
          <ConstructForm formType="NumberField" isEdit={enabledEdit} name="gridWidth" />
          <ConstructForm
            formType="Select"
            isEdit={enabledEdit}
            name="fieldWidget"
            onChange={this.changeFieldWidget}
            clearButton={false}
          />
          {this.renderDefaultValue(enabledEdit)}
          <ConstructForm formType="TextField" isEdit={enabledEdit} name="promptBo" />
        </Form>
        <Tabs
          activeKey={activityTabKey}
          onChange={this.changeTabs}
          style={{ marginTop: '16px' }}
          animated={false}
        >
          <TabPane
            tab={intl.get('ssrc.priceLibDimension.view.tab.mappingRelations').d('映射关系')}
            key="mappingRelations"
          >
            <Table
              customizedCode="SSRC.PRICE_LIB_DIMENSION.MAPPING_RELATIONS"
              dataSet={basicDrawerMapDs}
              columns={mappingListColumns}
              buttons={enabledEdit && this.renderButtons(basicDrawerMapDs)}
            />
          </TabPane>
          {basicDrawerFormDs.current && basicDrawerFormDs.current.get('fieldWidget') === 'LINK' && (
            <TabPane
              tab={intl.get('ssrc.priceLibDimension.view.tab.linkDetails').d('链接明细')}
              key="linkDetails"
            >
              <Table
                customizedCode="SSRC.PRICE_LIB_DIMENSION.LINK_DETAILS"
                dataSet={basicDrawerLinkDs}
                columns={linkListColumns}
                buttons={enabledEdit && this.renderButtons(basicDrawerLinkDs)}
              />
            </TabPane>
          )}
          {basicDrawerFormDs.current && basicDrawerFormDs.current.get('fieldWidget') === 'LOV' && (
            <TabPane
              tab={intl.get('ssrc.priceLibDimension.view.tab.lovMappings').d('值集映射')}
              key="lovMappings"
            >
              <Table
                customizedCode="SSRC.PRICE_LIB_DIMENSION.LOV_MAPPINGS"
                dataSet={basicDrawerLovMapDs}
                columns={lovMappingListColumns}
                buttons={enabledEdit && this.renderButtons(basicDrawerLovMapDs)}
              />
            </TabPane>
          )}
          {basicDrawerFormDs.current &&
            (basicDrawerFormDs.current.get('fieldWidget') === 'LOV' ||
              basicDrawerFormDs.current.get('fieldWidget') === 'SELECT') && (
              <TabPane
                tab={intl.get('ssrc.priceLibDimension.view.tab.lovParamter').d('值集参数')}
                key="lovParamter"
              >
                <Table
                  customizedCode="SSRC.PRICE_LIB_DIMENSION.LOV_PARAMTER"
                  className={style['draw-table']}
                  dataSet={basicDrawerLovParamDs}
                  columns={lovParamListColumns}
                  buttons={enabledEdit && this.renderButtons(basicDrawerLovParamDs)}
                />
              </TabPane>
            )}
        </Tabs>
      </React.Fragment>
    );
  }

  render() {
    const { visible = false, onOk, saveLoading, enabledEdit = false } = this.props;
    return (
      <Sidebar
        destroyOnClose
        movable={false}
        width={742}
        title={
          enabledEdit
            ? intl.get('ssrc.priceLibDimension.view.title.dimensionConfiguration').d('维度配置')
            : intl.get('ssrc.priceLibDimension.view.title.dimensionView').d('维度查看')
        }
        visible={visible}
        onOk={enabledEdit ? onOk : this.handleCancelDrawer}
        okCancel={enabledEdit}
        okText={
          !enabledEdit
            ? intl.get('hzero.common.button.close').d('关闭')
            : intl.get('hzero.common.button.ok').d('确定')
        }
        onCancel={this.handleCancelDrawer}
        confirmLoading={saveLoading}
        maskStyle={{ zIndex: 997 }}
        wrapClassName={classNames(
          style['c7n-modal-price-warp'],
          !enabledEdit && style['view-only-form']
        )}
      >
        {this.renderBasicChild()}
      </Sidebar>
    );
  }
}
