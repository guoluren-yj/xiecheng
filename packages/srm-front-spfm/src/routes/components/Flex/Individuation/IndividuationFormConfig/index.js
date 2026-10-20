import React, { PureComponent, Fragment } from 'react';
import { Modal, Button, Card } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, isEmpty, isArray, groupBy } from 'lodash';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  queryIndividuationFormDetailsByScope,
  stringToJSON,
  getFormItemNode,
  getFormConfigWithLayout,
} from '../utils';
import FieldPropsList from './FieldPropsList';

const viewButtonPrompt = 'hpfm.individuationForm.view.button';

export default class IndividuationFormConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queryListLoading: false, // 查询form个性化数据接口Loading
      formConfig: {}, // form个性化数据
      isRenderForm: false, // 是否渲染原始form对象
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && visible !== prevProps.visible;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.fetchList();
    }
  }

  @Bind()
  fetchList() {
    const { formIndividuationCode, formComponentObject, permissionLevelKey } = this.props;
    this.setState({
      queryListLoading: true,
      isRenderForm: false,
    });
    queryIndividuationFormDetailsByScope(permissionLevelKey, formIndividuationCode).then(
      (res = []) => {
        const flatIndividualizedFormConfig = {};
        (res || []).forEach(n => {
          flatIndividualizedFormConfig[n.fieldName] = {
            ...n,
            fieldProps: stringToJSON(n.fieldProps) || {},
          };
        });

        if (res && res.failed) {
          this.setState({
            queryListLoading: false,
            isRenderForm: true,
          });
        } else {
          // const formItemsLayout = getFormItemsLayout((formComponentObject.props.componentObject || formComponentObject), flatIndividualizedFormConfig);
          const { formConfig, maxCol, maxRow } = getFormConfigWithLayout(
            formComponentObject.props.componentObject || formComponentObject,
            flatIndividualizedFormConfig
          );
          this.setState({
            queryListLoading: false,
            isRenderForm: true,
            formConfig,
            maxCol,
            maxRow,
            // formItemsLayout: {
            //   ...formItemsLayout,
            //   layout: formItemsLayout.layout.map(o => ({ row: o.row, col: o.col, fieldName: o.fieldName, schema: o.schema })),
            // },
          });
        }
      }
    );
  }

  @Bind()
  handleCancel() {
    const { cancel = () => {} } = this.props;
    this.setState({
      formConfig: {},
    });
    cancel();
  }

  @Bind()
  handleSave() {
    const { save = () => {}, permissionLevelKey } = this.props;
    const { formConfig } = this.state;
    save(
      permissionLevelKey,
      Object.keys(formConfig).map(n => ({
        ...(formConfig[n] || {}),
        fieldProps: JSON.stringify((formConfig[n] || {}).fieldProps),
      })),
      this.fetchList
    );
  }

  @Bind()
  footerRender() {
    const { savePersonalityDetailsLoading } = this.props;
    return (
      <Fragment>
        <Button onClick={this.clearIndividualizedFormConfigData}>
          {intl.get(`${viewButtonPrompt}.default`).d('还原默认配置')}
        </Button>
        <Button onClick={this.handleCancel}>
          {intl.get(`hzero.common.button.cancel`).d('取消')}
        </Button>
        <Button type="primary" loading={savePersonalityDetailsLoading} onClick={this.handleSave}>
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      </Fragment>
    );
  }

  @Bind()
  getFieldPropsListDataSource() {
    const { formConfig = [] } = this.state;
    const { formComponentObject = {}, visible } = this.props;
    // const { layout = [] } = formItemsLayout;
    const defaultFieldTempList = [];
    const setFormInputsItemPropsConfig = (node = {}, i) => {
      const formItem = getFormItemNode(node, i);
      // const schema = isFormInputsComponent((item || {}).type || {});
      if (!isEmpty(formItem)) {
        const { schema = {} } = formItem;
        const item = formItem.node.props.children.props.children;

        const itemProps = formConfig[item.props['data-__field'].name] || {};
        // const { row, col } = layout.find(o => o.fieldName === item.props['data-__field'].name) || {};
        const disabledRequired = ((item.props['data-__meta'] || {}).rules || []).some(
          o => o.required
        );
        const defaultItemProps = {
          fieldName: item.props['data-__field'].name,
          fieldDescription: (formItem.node.props.children.props || {}).label,
          fieldEnabledFlag: isNumber(itemProps.fieldEnabledFlag) ? itemProps.fieldEnabledFlag : 1,
          fieldType: schema.fieldType,
          disabledRequired,
          ...itemProps,
          fieldProps: { ...item.props, ...itemProps.fieldProps },
        };

        defaultFieldTempList.push({ ...defaultItemProps, _row: i });
      } else {
        assignFormInputsPropsConfig(((node || {}).props || {}).children);
      }
    };
    const assignFormInputsPropsConfig = (collections = [] || {}) => {
      if (isArray(collections)) {
        collections.forEach((n, index) => {
          setFormInputsItemPropsConfig(n, index);
        });
      }
    };
    let defaultFieldList = [];
    if (visible) {
      assignFormInputsPropsConfig(
        ((formComponentObject.props.componentObject || formComponentObject).props || {}).children
      );
      const defaultFieldListGroup = groupBy(defaultFieldTempList, '_row');
      Object.keys(defaultFieldListGroup).forEach(n => {
        defaultFieldList = defaultFieldList.concat(...defaultFieldListGroup[n]);
      });
    }
    return defaultFieldList;
  }

  @Bind()
  onDefaultFieldPropsChange(fieldName, value = {}) {
    const { formConfig = {} } = this.state;
    this.setState(
      {
        isRenderForm: false,
        formConfig: {
          ...formConfig,
          [fieldName]: {
            ...(formConfig[fieldName] || {}),
            ...value,
          },
        },
      },
      () => {
        this.setState({
          isRenderForm: true,
        });
      }
    );
  }

  @Bind()
  onFieldPropsChange(fieldName, value = {}) {
    const { formConfig = {} } = this.state;
    this.setState(
      {
        isRenderForm: false,
        formConfig: {
          ...formConfig,
          [fieldName]: {
            ...(formConfig[fieldName] || {}),
            fieldProps: {
              ...((formConfig[fieldName] || {}).fieldProps || {}),
              ...value,
            },
          },
        },
      },
      () => {
        this.setState({
          isRenderForm: true,
        });
      }
    );
  }

  @Bind()
  clearIndividualizedFormConfigData() {
    const { save = () => {}, permissionLevelKey } = this.props;
    save(permissionLevelKey, [], this.handleCancel);
  }

  @Bind()
  onLayoutChange(fieldName, { row, col }) {
    const { formConfig = {} } = this.state;
    const sourceObject = formConfig[fieldName] || {};
    const sourceObjectRow = (sourceObject.fieldProps || {}).row;
    const sourceObjectCol = (sourceObject.fieldProps || {}).col;
    const formConfigArr = Object.keys(formConfig).map(o => formConfig[o]);
    const targetObject = formConfigArr.find(
      o =>
        (o.fieldProps || {}).row === (isNumber(row) ? row : sourceObjectRow) &&
        (o.fieldProps || {}).col === (isNumber(col) ? col : sourceObjectCol)
    );

    if (sourceObject && targetObject) {
      const targetRow = isNumber(row) ? row : sourceObjectRow;
      const targetCol = isNumber(col) ? col : sourceObjectCol;

      const newFormConfig = { ...formConfig };
      newFormConfig[fieldName].fieldProps.row = targetRow;
      newFormConfig[fieldName].fieldProps.col = targetCol;
      newFormConfig[targetObject.fieldName].fieldProps.row = sourceObjectRow;
      newFormConfig[targetObject.fieldName].fieldProps.col = sourceObjectCol;

      this.setState(
        {
          isRenderForm: false,
          formConfig: newFormConfig,
        },
        () => {
          this.setState({
            isRenderForm: true,
          });
        }
      );
    }
  }

  render() {
    const { queryListLoading, isRenderForm, formConfig, maxCol, maxRow } = this.state;
    const {
      formComponentObject,
      visible = false,
      getViewFormComponentObject = () => {},
    } = this.props;
    const fieldPropsListProps = {
      dataSource: this.getFieldPropsListDataSource(),
      onDefaultFieldPropsChange: this.onDefaultFieldPropsChange,
      onFieldPropsChange: this.onFieldPropsChange,
      maxCol,
      maxRow,
      onLayoutChange: this.onLayoutChange,
    };
    return (
      <Fragment>
        {formComponentObject}
        <Modal
          title={intl.get(`hpfm.individuationForm.view.title`).d('个性化表单')}
          visible={visible}
          footer={this.footerRender()}
          onCancel={this.handleCancel}
          width={900}
        >
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            loading={queryListLoading}
            title={
              <h4>{intl.get(`hpfm.individuationForm.view.title.preview`).d('自定义效果预览')}</h4>
            }
          >
            {visible &&
              isRenderForm &&
              getViewFormComponentObject(formComponentObject, formConfig, maxRow, maxCol)}
          </Card>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            loading={queryListLoading}
            title={
              <h4>{intl.get(`hpfm.individuationForm.view.title.fieldProps`).d('字段属性配置')}</h4>
            }
          >
            <div style={{ height: 350, overflowY: 'scroll' }}>
              <FieldPropsList {...fieldPropsListProps} />
            </div>
          </Card>
        </Modal>
      </Fragment>
    );
  }
}
