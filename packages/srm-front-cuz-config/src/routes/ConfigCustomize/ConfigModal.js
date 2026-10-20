/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable eqeqeq */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Drawer,
  Select,
  Form,
  InputNumber,
  Button,
  Input,
  Checkbox,
  Col,
  Row,
  Badge,
  Tooltip,
  DatePicker,
  TreeSelect,
  Radio,
} from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';
import { isNil, isEmpty, isArray, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { connect } from 'dva';
import {
  colOptions,
  getFieldCodeAlias,
  getFieldNameAlias,
  getWidgetAlias,
  getFieldConfigAlias,
  getDefaultActiveAlias,
  getSingleTenantValueCode,
  FilterComponentList,
  SEARCHBAR_MUTLIPLE_COMPONENT,
  SEARCHBAR_RANGE_COMPONENT,
} from '@/utils/constConfig.js';
import ParamsModal from '@/components/CommonModal/ParamsConfigModal';
import ComputeRuleModal from '@/components/CommonModal/ComputeRuleModal';
import { getParams } from '@/utils';
import { transfromTreeSelectKey } from '@/utils/util';
import { queryBusinessObjectRelationsTree } from '@/services/individuationUnitService';
import { FlexSelect } from 'srm-front-cuz/lib/custH0X/getComponent';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import Upload from 'srm-front-boot/lib/components/Upload';
import RelatedModal from './RelatedModal';
import ConditionModal from './ConditionModal';
import SelfConditionModal from './SelfConditionModal';
import DefaultValueModal from './DefaultValueModal';
import styles from './index.less';
import ConditionFieldName from './ConditionFieldName';
import DefaultExpConfig from '../../components/DefaultExpConfig';
import SelectFieldLov from '../../components/SelectFieldLov';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const formLayout2 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;

@connect(({ configCustomizeCuz, loading }) => {
  const { codes, unitAlias, aggregationGroup } = configCustomizeCuz;
  return {
    codes,
    unitAlias,
    aggregationGroup,
    saveLoading: loading.effects['configCustomizeCuz/saveFieldIndividual'],
  };
})
@Form.create({ fieldNameProp: null })
export default class ConfigModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldLovMaps: [],
      conditionHeaders: {
        required: {},
        visible: {},
        editable: {},
        fieldName: {},
        defaultValue: {},
        valid: {},
      },
      backUpParamList: [],
      backUpRenderRule: '',
      condOptions: [],
      moduleList: [],
    };
    this.saveCheckLoading = false;
    const { form } = props;
    ['fieldWidget', 'fieldId', 'fieldCategory', 'fieldType', 'fieldName'].forEach((i) =>
      form.registerField(i)
    );
  }

  componentDidUpdate(prevProps) {
    const {
      dispatch,
      record = {},
      unitInfo: { unitType, modelCode, id, unitCode, combineCode },
      codes: { condOptions = [] },
      visible,
      form,
    } = this.props;
    const { record: { configFieldId } = {}, visible: previsible } = prevProps;
    if (visible === true && previsible === false) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        condOptions,
        // condOptions:
        //   record.custType === 'EXT' || type === 'new'
        //     ? // eslint-disable-next-line eqeqeq
        //       condOptions.filter((i) => i.value != '-1')
        //     : condOptions,
      });
    }
    if (visible === false && previsible === true) {
      form.resetFields();
    }
    if (unitCode && unitCode !== prevProps.unitInfo.unitCode && unitType !== 'SEARCHBAR') {
      // 修复从筛选器类型单元切换到其他类型单元时 whereOptions字段值缓存问题
      form.setFieldsValue({
        whereOptions: undefined,
      });
    }
    if (record.configFieldId !== undefined && configFieldId !== record.configFieldId && visible) {
      this.saveCheckLoading = true;
      Promise.all([
        dispatch({
          type: 'configCustomizeCuz/queryConditions',
          payload: { configFieldId: record.configFieldId, unitId: id },
        }),
        dispatch({
          type: 'configCustomizeCuz/queryFieldMapping',
          payload: { configFieldId: record.configFieldId },
        }),
      ])
        .then(([res1, res2]) => {
          if (!isEmpty(res1)) {
            const conditionHeaders = {
              required: {},
              visible: {},
              editable: {},
              fieldName: {},
              defaultValue: {},
              valid: {},
            };
            res1.forEach((i) => {
              conditionHeaders[i.conType] = i;
            });
            this.setState({ conditionHeaders });
            record.conditionHeaders = res1;
          }
          if (!isEmpty(res2)) {
            this.setState({ fieldLovMaps: res2 });
            record.fieldLovMaps = res2;
          }
        })
        .finally(() => {
          this.saveCheckLoading = false;
          this.forceUpdate();
        });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        backUpParamList: (record.paramList || []).map((i) => i),
        backUpRenderRule: record.renderRule,
      });
    }
    if (prevProps.unitInfo.id !== id && modelCode) {
      const pureVirtual = ['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
      // 这四种类型无需查询组合对象树
      if (!pureVirtual) {
        this.fetchRelationModal({
          tenantId: getCurrentOrganizationId(),
          businessObjectCode: combineCode,
        });
      }
    }
  }

  componentWillUnmount() {
    if (this.props.form) {
      this.props.form.resetFields();
    }
  }

  @Bind()
  fetchRelationModal(params) {
    queryBusinessObjectRelationsTree(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        const moduleList = transfromTreeSelectKey(
          [result],
          'businessObjectRelationList',
          'relBusinessObjectName',
          'businessObjectRelationId'
        );
        this.setState({ moduleList: moduleList || [] });
      } else {
        this.setState({ moduleList: [] });
      }
    });
  }

  @Bind()
  openProDefaultModal() {
    const {
      form,
      record,
      unitInfo: { id },
      ctxParams,
    } = this.props;
    Modal.open({
      title: intl.get('hpfm.individual.model.config.proDefault').d('公式配置'),
      closable: true,
      movable: false,
      drawer: false,
      key: Modal.key(),
      style: { width: 1000 },
      footer: null,
      children: <DefaultExpConfig record={record} form={form} ctxParams={ctxParams} unitId={id} />,
    });
  }

  @Bind()
  clearDefaultValueFx() {
    this.updateConditionHeaders('defaultValue', {
      ...this.state.conditionHeaders.defaultValue,
      lines: [],
      valids: [],
    });
  }

  @Bind()
  getDefaultValueRender(config, visibleFx, pro = false) {
    const {
      conditionHeaders: { defaultValue: defaultValueFx },
    } = this.state;
    const {
      form,
      record: { proDefaultFlag, widget = {} },
    } = this.props;
    const { options, Widget, props } = config;
    const valids = (defaultValueFx && defaultValueFx.valids) || [];
    /**
     * bug: h0的rc-form同名字段组件在卸载时清除旧fieldMeta的时机发生在新字段组件注册之后
     * 故在getFieldProps中，还是能取到旧的fieldMeta并合并到新注册组件的fieldMeta上
     * 目前只发现残留日期组件的getValueProps和getValueFromEvent会导致新组件接受到不正确的value导致白屏
     */
    const fixOptions = {
      getValueProps: undefined,
      getValueFromEvent: undefined,
      ...options,
    };
    return (
      <div className="has-fx-row">
        <FormItem label={intl.get('hpfm.individual.model.config.defaultValue').d('默认值')}>
          {pro &&
            form.getFieldDecorator('proDefaultFlag', {
              initialValue: proDefaultFlag || 0,
            })(
              <Select
                onChange={() => {
                  form.setFieldsValue({
                    defaultValue: undefined,
                  });
                  this.clearDefaultValueFx();
                }}
                style={{ width: '33%', marginRight: '8px' }}
              >
                <Option value={0}>{intl.get('hpfm.customize.common.fixed').d('固定值')}</Option>
                <Option value={1}>{intl.get('hpfm.customize.common.expression').d('公式')}</Option>
              </Select>
            )}
          {pro && form.getFieldValue('proDefaultFlag')
            ? form.getFieldDecorator('defaultValue', { initialValue: widget.defaultValue })(
                <Badge dot={!!form.getFieldValue('defaultValue')}>
                  <a
                    style={{ lineHeight: '28px', marginLeft: '8px' }}
                    onClick={this.openProDefaultModal}
                  >
                    {intl.get('hpfm.individual.model.config.proDefault').d('公式配置')}
                  </a>
                </Badge>
              )
            : form.getFieldDecorator('defaultValue', fixOptions)(<Widget {...props} />)}
        </FormItem>
        <Tooltip
          placement="right"
          title={intl.get('hpfm.individual.model.config.condition').d('条件配置')}
        >
          <span className="fx-alink" style={{ display: visibleFx ? 'inline-block' : 'none' }}>
            <Badge dot={(valids || []).length > 0}>
              <a
                disabled={props.disabled}
                className={(valids || []).length > 0 ? 'active' : ''}
                onClick={() => this.toggleDefaultValueModal()}
              >
                fx
              </a>
            </Badge>
          </span>
        </Tooltip>
        <FormItem>
          {form.getFieldDecorator('defaultValueReplaceFlag', {
            initialValue: widget.defaultValueReplaceFlag || 0,
          })(
            <Checkbox checkedValue={1} unCheckedValue={0}>
              {intl.get('hpfm.individual.model.config.defaultValueReplace').d('默认值替换已有值')}
            </Checkbox>
          )}
        </FormItem>
      </div>
    );
  }

  getSelectConfig(_, visibleFx, fieldType) {
    const {
      form,
      // record,
      record: { widget = {}, paramList },
    } = this.props;
    return (
      <>
        <FormItem
          label={intl.get('hpfm.individual.model.config.multipleFlag').d('启用多选')}
          {...formLayout2}
        >
          {form.getFieldDecorator('multipleFlag', {
            initialValue: Number(widget.multipleFlag || 0),
          })(
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              onChange={() => {
                form.setFieldsValue({ defaultValue: undefined });
                this.updateLovMappings([]);
              }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.valueCode').d('值集编码')}>
          {form.getFieldDecorator('sourceCode', {
            initialValue: widget.sourceCode,
          })(
            <Lov
              code="HPFM.LOV.LOV_DETAIL_CODE.ORG"
              textValue={widget.sourceCode}
              textField="sourceCode"
              onChange={() => form.setFieldsValue({ defaultValue: undefined })}
            />
          )}
        </FormItem>
        {fieldType === 'SELECT' && (
          <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
            {form.getFieldDecorator('placeholder', {
              initialValue: widget.placeholder,
            })(<Input trim />)}
          </FormItem>
        )}
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: widget.defaultValue,
            },
            Widget: FlexSelect,
            props: {
              lovCode: form.getFieldValue('sourceCode'),
              fieldCode: 'defaultValue',
              multipleFlag: form.getFieldValue('multipleFlag'),
              params: getParams({ paramList, ctxParams: this.props.ctxParams }),
            },
          },
          visibleFx
        )}
        <Button
          icon="setting"
          type="primary"
          onClick={this.toggleParamsModal}
          style={{ marginBottom: '8px' }}
        >
          {intl.get('hpfm.individual.common.setLovParams').d('设置值集参数')}
          <Badge
            style={{ marginLeft: '8px', height: '16px', lineHeight: '16px' }}
            count={(paramList || []).length}
          />
        </Button>
        {/* <Button
          icon="share-alt"
          type="primary"
          onClick={() => this.toggleRelatedModal(record)}
          style={{ marginBottom: '8px' }}
        >
          {intl.get('hpfm.individual.model.config.fieldMapping').d('关联字段设置')}
          <Badge
            style={{ marginLeft: '8px', height: '16px', lineHeight: '16px' }}
            count={fieldLovMaps.length}
          />
        </Button> */}
      </>
    );
  }

  getLovConfig(_, visibleFx) {
    const { fieldLovMaps } = this.state;
    const {
      form,
      record,
      record: { widget = {}, paramList },
      unitInfo: { unitTag = '' },
    } = this.props;
    return (
      <>
        <FormItem
          label={intl.get('hpfm.individual.model.config.multipleFlag').d('启用多选')}
          {...formLayout2}
        >
          {form.getFieldDecorator('multipleFlag', {
            initialValue: Number(widget.multipleFlag || 0),
          })(
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              onChange={() => {
                form.setFieldsValue({ defaultValue: undefined });
                this.updateLovMappings([]);
              }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.valueCode').d('值集编码')}>
          {form.getFieldDecorator('sourceCode', {
            initialValue: widget.sourceCode,
          })(
            <Lov
              code="HPFM.LOV.VIEW.ORG"
              textValue={widget.sourceCode}
              textField="sourceCode"
              onChange={() => form.setFieldsValue({ defaultValue: undefined })}
              lovOptions={{ displayField: 'viewCode', valueField: 'viewCode' }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
          {form.getFieldDecorator('placeholder', {
            initialValue: widget.placeholder,
          })(<Input trim />)}
        </FormItem>
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: widget.defaultValue,
            },
            Widget: form.getFieldValue('multipleFlag') === 1 ? LovMulti : Lov,
            props: {
              disabled: !form.getFieldValue('sourceCode'),
              code: form.getFieldValue('sourceCode'),
              queryParams: getParams({ paramList, ctxParams: this.props.ctxParams }),
              translateData: widget.defaultValueMeaning || {},
              textValue: widget.defaultValueMeaning || widget.defaultValue,
            },
          },
          visibleFx
        )}
        <Button
          icon="setting"
          type="primary"
          onClick={this.toggleParamsModal}
          style={{ marginBottom: '8px' }}
        >
          {intl.get('hpfm.individual.common.setLovParams').d('设置值集参数')}
          <Badge
            style={{ marginLeft: '8px', height: '16px', lineHeight: '16px' }}
            count={(paramList || []).length}
          />
        </Button>
        <Button
          icon="share-alt"
          type="primary"
          onClick={() => this.toggleRelatedModal(record)}
          style={{ marginBottom: '8px' }}
          disabled={
            !form.getFieldValue('sourceCode') ||
            (form.getFieldValue('multipleFlag') === 1 && unitTag.indexOf('C7N') === -1)
          }
        >
          {intl.get('hpfm.individual.model.config.fieldMapping').d('关联字段设置')}
          <Badge
            style={{ marginLeft: '8px', height: '16px', lineHeight: '16px' }}
            count={fieldLovMaps.length}
          />
        </Button>
      </>
    );
  }

  getInputConfig(_, visibleFx) {
    const {
      form,
      record: { widget = {} },
    } = this.props;
    return (
      <>
        <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
          {form.getFieldDecorator('placeholder', {
            initialValue: widget.placeholder,
          })(<Input trim />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.maxLength').d('最大长度')}>
          {form.getFieldDecorator('textMaxLength', {
            initialValue: widget.textMaxLength,
          })(<InputNumber precision={0} min={1} max={999} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.minLength').d('最小长度')}>
          {form.getFieldDecorator('textMinLength', {
            initialValue: widget.textMinLength,
          })(<InputNumber precision={0} min={1} max={999} />)}
        </FormItem>
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: widget.defaultValue,
            },
            Widget: Input,
            props: {
              trim: true,
              style: {
                width: '64%',
              },
            },
          },
          visibleFx,
          true
        )}
      </>
    );
  }

  getInputNumberConfig(_, visibleFx) {
    const {
      state: { condOptions },
      props: {
        form,
        record: { widget = {} },
      },
    } = this;
    const {
      placeholder,
      numberMax,
      numberMin,
      numberDecimal,
      defaultValue,
      allowThousandth = -1,
    } = widget;
    return (
      <>
        <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
          {form.getFieldDecorator('placeholder', {
            initialValue: placeholder,
          })(<Input trim />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.max').d('最大值')}>
          {form.getFieldDecorator('numberMax', {
            initialValue: numberMax,
          })(<InputNumber precision={0} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.min').d('最小值')}>
          {form.getFieldDecorator('numberMin', {
            initialValue: numberMin,
          })(<InputNumber precision={0} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.decimal').d('精度')}>
          {form.getFieldDecorator('numberDecimal', {
            initialValue: numberDecimal,
          })(<InputNumber precision={0} min={0} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.allowThousandth').d('千分位')}>
          {form.getFieldDecorator('allowThousandth', {
            initialValue: allowThousandth,
          })(
            <Select style={{ width: '100%' }}>
              {condOptions.map((item) => (
                <Option value={Number(item.value)}>{item.meaning}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: defaultValue,
            },
            Widget: InputNumber,
            props: {
              style: {
                width: '64%',
              },
            },
          },
          visibleFx,
          true
        )}
      </>
    );
  }

  getTLEditorConfig() {}

  getDatePickerConfig(_, visibleFx) {
    const {
      form,
      record: { widget = {} },
      codes,
    } = this.props;
    const format = form.getFieldValue('dateFormat') || widget.dateFormat || DEFAULT_DATE_FORMAT;
    return (
      <>
        <FormItem label={intl.get('hpfm.individual.model.config.dateFormat').d('日期格式')}>
          {form.getFieldDecorator('dateFormat', {
            initialValue: widget.dateFormat,
          })(
            <Select style={{ width: '100%' }}>
              {codes.dateFormat.map((i) => (
                <Option value={i.value}>{i.meaning}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.customize.common.includeNowDayFlag').d('包含当天')}
          {...formLayout2}
        >
          {form.getFieldDecorator('includeNowDayFlag', {
            initialValue: widget.includeNowDayFlag || 0,
          })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
        </FormItem>
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: widget.defaultValue,
              getValueProps: (dateStr) => ({
                value: dateStr ? moment(dateStr, format) : dateStr,
              }),
              getValueFromEvent(e) {
                if (!e || !e.target) {
                  return e && e.format ? e.format(format) : e;
                }
                const { target } = e;
                return target.type === 'checkbox' ? target.checked : target.value;
              },
            },
            Widget: DatePicker,
            props: {
              format,
              showTime: true,
              style: { width: '64%' },
            },
          },
          visibleFx,
          true
        )}
      </>
    );
  }

  getTextAreaConfig(_, visibleFx) {
    const {
      form,
      record: { widget = {} },
    } = this.props;
    return (
      <>
        <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
          {form.getFieldDecorator('placeholder', {
            initialValue: widget.placeholder,
          })(<Input.TextArea trim />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.maxLength').d('最大长度')}>
          {form.getFieldDecorator('textMaxLength', {
            initialValue: widget.textMaxLength,
          })(<InputNumber precision={0} min={1} max={999} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.minLength').d('最小长度')}>
          {form.getFieldDecorator('textMinLength', {
            initialValue: widget.textMinLength,
          })(<InputNumber precision={0} min={1} max={999} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.textAreaMaxLine').d('文本域行数')}>
          {form.getFieldDecorator('textAreaMaxLine', {
            initialValue: widget.textAreaMaxLine,
          })(<InputNumber precision={0} min={1} max={999} style={{ width: '100%' }} />)}
        </FormItem>
        {this.getDefaultValueRender(
          {
            options: {
              initialValue: widget.defaultValue,
            },
            Widget: Input.TextArea,
            props: {
              trim: true,
            },
          },
          visibleFx
        )}
      </>
    );
  }

  getCheckboxConfig(_, visibleFx) {
    const {
      record: { widget = {} },
    } = this.props;
    return this.getDefaultValueRender(
      {
        options: {
          initialValue: widget.defaultValue !== undefined ? String(widget.defaultValue) : undefined,
        },
        Widget: FlexSelect,
        props: {
          allowClear: true,
          lovCode: 'HPFM.ENABLED_FLAG',
          fieldCode: 'defaultValue',
          params: {},
        },
      },
      visibleFx
    );
  }

  getSwitchConfig(_, visibleFx) {
    const {
      record: { widget = {} },
    } = this.props;
    return this.getDefaultValueRender(
      {
        options: {
          initialValue: widget.defaultValue !== undefined ? String(widget.defaultValue) : undefined,
        },
        Widget: FlexSelect,
        props: {
          allowClear: true,
          lovCode: 'HPFM.ENABLED_FLAG',
          fieldCode: 'defaultValue',
          params: {},
        },
      },
      visibleFx
    );
  }

  getLinkConfig() {
    const {
      form,
      codes,
      record: { widget = {} },
    } = this.props;
    const linkType = form.getFieldValue('linkType');
    return (
      <>
        <FormItem label={intl.get('hpfm.individual.model.config.linkType').d('链接类型')}>
          {form.getFieldDecorator('linkType', {
            initialValue: widget.linkType || 'none',
          })(
            <Select allowClear style={{ width: '100%' }}>
              {codes.linkType.map((i) => (
                <Option value={i.value}>{i.meaning}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.individual.model.config.linkTitle').d('链接标题')}>
          {form.getFieldDecorator('linkTitle', {
            initialValue: widget.linkTitle,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.linkTitle').d('链接标题'),
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.individual.model.config.linkTitle').d('链接标题')}
              field="linkTitle"
              token={widget._token}
            />
          )}
        </FormItem>
        {linkType !== 'btn' && (
          <FormItem label={intl.get('hpfm.individual.model.config.linkHref').d('URL')}>
            {form.getFieldDecorator('linkHref', {
              initialValue: widget.linkHref,
            })(<Input trim />)}
          </FormItem>
        )}
        {linkType === 'attachment' && (
          <FormItem label={intl.get('hpfm.individual.model.config.bucketName').d('附件权限')}>
            {form.getFieldDecorator('bucketName', {
              initialValue: widget.bucketName || codes.bucketType[0].value,
            })(
              <Select allowClear defaultActiveFirstOption style={{ width: '100%' }}>
                {codes.bucketType.map((i) => (
                  <Option value={i.value}>{i.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {/modal|drawer/.test(linkType) ? (
          <FormItem label={intl.get('hpfm.individual.model.config.modalWidth').d('宽度')}>
            {form.getFieldDecorator('modalWidth', {
              initialValue: widget.modalWidth === undefined ? 600 : widget.modalWidth,
            })(
              <InputNumber value={form.getFieldValue('modalWidth')} min={0} max={1920} step={1} />
            )}
          </FormItem>
        ) : null}
        {linkType === 'none' ? (
          <FormItem {...formLayout2}>
            {form.getFieldDecorator('linkNewWindow', {
              initialValue: isNil(widget.linkNewWindow) ? 1 : widget.linkNewWindow,
              valuePropName: 'checked',
            })(
              <Checkbox checkedValue={1} unCheckedValue={0}>
                {intl.get('hpfm.individual.model.config.linkNewWindow').d('在新窗口中打开')}
              </Checkbox>
            )}
          </FormItem>
        ) : null}
      </>
    );
  }

  getUploadConfig() {
    const {
      form,
      codes,
      record: { widget = {}, custType },
    } = this.props;
    return (
      <>
        {custType !== 'STD' && (
          <FormItem label={intl.get('hpfm.individual.model.config.bucketName').d('附件权限')}>
            {form.getFieldDecorator('bucketName', {
              initialValue: widget.bucketName || codes.bucketType[0].value,
            })(
              <Select allowClear defaultActiveFirstOption style={{ width: '100%' }}>
                {codes.bucketType.map((i) => (
                  <Option value={i.value}>{i.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem label={intl.get('hpfm.individual.model.config.uploadShowFlag').d('附件直显')}>
          {form.getFieldDecorator('uploadShowFlag', {
            initialValue: widget.uploadShowFlag || 0,
            valuePropName: 'checked',
          })(
            <Checkbox checkedValue={1} unCheckedValue={0}>
              {intl
                .get('hpfm.individual.model.config.uploadShowFlagTip')
                .d('勾选后上传组件直接显示文件列表')}
            </Checkbox>
          )}
        </FormItem>
        {/* <FormItem label={intl.get('hpfm.individual.model.config.bucketDirectory').d('目录名')}>
          {form.getFieldDecorator('bucketDirectory', {
              initialValue: widget.bucketDirectory,
            })(<Input />)}
        </FormItem> */}
        <FormItem label={intl.get('hpfm.customize.common.attachmentTemplate').d('附件模版')}>
          {form.getFieldDecorator('attachmentTemplate', {
            // 这个属性值可以不清除
            initialValue: widget.attachmentTemplate,
            valuePropName: 'attachmentUUID',
          })(<Upload bucketName="private-bucket" fileMaxNum={1} />)}
        </FormItem>
      </>
    );
  }

  configMap(visibleFx) {
    const {
      record = {},
      form,
      unitInfo: { unitType },
    } = this.props;
    if (['TABPANE', 'COLLAPSE', 'BTNGROUP'].includes(unitType)) return null;
    switch (form.getFieldValue('fieldWidget')) {
      case 'RADIOGROUP':
        return this.getSelectConfig(record, visibleFx, 'RADIOGROUP');
      case 'SELECT':
        return this.getSelectConfig(record, visibleFx, 'SELECT');
      case 'LOV':
        return this.getLovConfig(record, visibleFx);
      case 'INPUT':
        return this.getInputConfig(record, visibleFx);
      case 'CURRENCY':
      case 'INPUT_NUMBER':
        return this.getInputNumberConfig(record, visibleFx);
      case 'TL_EDITOR':
        return this.getTLEditorConfig(record, visibleFx);
      case 'DATE_PICKER':
        return this.getDatePickerConfig(record, visibleFx);
      case 'TEXT_AREA':
        return this.getTextAreaConfig(record, visibleFx);
      case 'CHECKBOX':
        return this.getCheckboxConfig(record, visibleFx);
      case 'SWITCH':
        return this.getSwitchConfig(record, visibleFx);
      case 'UPLOAD':
        return this.getUploadConfig(record, visibleFx);
      case 'LINK':
        return this.getLinkConfig(record, visibleFx);
      default:
        return null;
    }
  }

  @Bind()
  handleChangeLovCode() {
    this.props.form.setFieldsValue({
      displayField: undefined,
      valueField: undefined,
    });
  }

  @Bind()
  handleSaveUnitSort(value) {
    if (value === 1) {
      notification.warning({
        message: intl
          .get('hpfm.individuationUnit.view.message.addSortFieldTip')
          .d('自定义排序条件可能会导致性能下降，请测试后谨慎配置!'),
      });
    }
  }

  @Bind()
  configSearchBarComponent() {
    const {
      type,
      codes,
      record = {},
      unitInfo = {},
      form: { getFieldDecorator = () => {}, getFieldValue = () => {} },
      visible,
    } = this.props;
    const {
      custType,
      whereOption,
      widget,
      displayField,
      valueField,
      mergeFlag,
      gridSeq,
      sortedFlag,
      unitSortedFlag,
      visible: fieldVisible,
      unitFieldVisible,
      fieldEditable,
      modelFieldFlag,
    } = record;
    const { unitType, extFieldSortedFlag } = unitInfo;
    // const { sortedEnabled = 1, sortedEditorFlag = 1 } = config;
    const sortedEditorFlag = unitInfo.sortedEditorFlag || 0;
    const sortedEnabled = unitInfo.sortedEnabled || 0;
    const isCreate = type === 'new';
    const isSeachBarType = unitType === 'SEARCHBAR';
    const isStandardField = custType === 'STD';
    const multipleComponentFlag = SEARCHBAR_MUTLIPLE_COMPONENT.includes(
      getFieldValue('fieldWidget')
    );
    const { options, defaultOption } = this.getComponentWhereOption();
    let initSortedFlag = sortedFlag;
    // 平台级禁用可排序，或 是扩展字段且是-1时，置为0
    if (
      sortedEditorFlag !== 1 ||
      (!isStandardField && (sortedFlag === -1 || extFieldSortedFlag !== 1)) ||
      (isStandardField && unitSortedFlag === 0)
    ) {
      initSortedFlag = 0;
    }
    return (
      <>
        <Form.Item
          label={intl
            .get('hpfm.individuationUnit.model.individuationUnit.sourceCode')
            .d('数据来源值集')}
          style={{
            display: ['LOV', 'SELECT'].includes(getFieldValue('fieldWidget')) ? 'block' : 'none',
          }}
        >
          {getFieldDecorator('widget.sourceCode', {
            initialValue: (widget || {}).sourceCode,
          })(
            <Lov
              code={getSingleTenantValueCode(
                getFieldValue('fieldWidget') === 'SELECT'
                  ? 'HPFM.LOV.LOV_DETAIL_CODE'
                  : 'HPFM.LOV.VIEW'
              )}
              textField="widget.sourceCode"
              lovOptions={{
                displayField: getFieldValue('fieldWidget') === 'SELECT' ? 'lovCode' : 'viewCode',
                valueField: getFieldValue('fieldWidget') === 'SELECT' ? 'lovCode' : 'viewCode',
              }}
              onChange={this.handleChangeLovCode}
            />
          )}
        </Form.Item>
        {getFieldValue('fieldWidget') === 'LOV' && (
          <Form.Item
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.textField')
              .d('显示字段名')}
          >
            {getFieldDecorator('displayField', {
              initialValue: displayField,
            })(<Input disabled={isStandardField} />)}
          </Form.Item>
        )}
        {getFieldValue('fieldWidget') === 'LOV' && (
          <Form.Item
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.valueField')
              .d('值字段名')}
          >
            {getFieldDecorator('valueField', {
              initialValue: valueField,
            })(<Input disabled={isStandardField} />)}
          </Form.Item>
        )}
        <Form.Item
          label={intl.get('hpfm.individual.model.config.dateFormat').d('日期格式')}
          style={{ display: getFieldValue('fieldWidget') === 'DATE_PICKER' ? 'block' : 'none' }}
        >
          {getFieldDecorator('widget.dateFormat', {
            initialValue: (widget || {}).dateFormat,
          })(
            <Select
              // disabled={!isCreate && record.custType === 'STD'}
              style={{ width: '100%' }}
            >
              {codes.dateFormat.map((i) => (
                <Option value={i.value}>{i.meaning}</Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {sortedEditorFlag === 1 && sortedEnabled !== 0 && (
          <Form.Item label={intl.get('hpfm.individual.model.config.sortedFlag').d('可排序')}>
            {getFieldDecorator('sortedFlag', {
              initialValue: initSortedFlag,
            })(
              <Select
                style={{ width: '100%' }}
                onChange={this.handleSaveUnitSort}
                disabled={
                  sortedEditorFlag !== 1 ||
                  (isStandardField && unitSortedFlag !== 1) ||
                  (!isStandardField && extFieldSortedFlag !== 1)
                }
              >
                <Select.Option value={1}>{intl.get('hzero.common.yes').d('是')}</Select.Option>
                <Select.Option value={0}>{intl.get('hzero.common.no').d('否')}</Select.Option>
                {isStandardField && (
                  <Select.Option value={-1}>
                    {intl.get('hzero.common.status.default').d('默认')}
                  </Select.Option>
                )}
              </Select>
            )}
          </Form.Item>
        )}
        <Form.Item>
          {getFieldDecorator('fieldEditable', {
            initialValue: !isNil(fieldEditable) ? fieldEditable : 1,
          })(
            // 平台标准字段若隐藏，租户不可更改
            <Checkbox checkedValue={1} unCheckedValue={0}>
              {intl.get('hpfm.individual.model.config.editableFlag').d('可编辑')}
            </Checkbox>
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('visible', {
            initialValue:
              fieldVisible !== -1
                ? fieldVisible
                : !isNil(unitFieldVisible) && unitFieldVisible !== -1
                ? unitFieldVisible
                : 1,
          })(
            // 平台标准字段若隐藏，租户不可更改
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              // disabled={isStandardField && unitFieldVisible === 0}
            >
              {intl.get('hpfm.individual.model.config.show').d('显示')}
            </Checkbox>
          )}
        </Form.Item>
        {((isCreate && getFieldValue('isModelField')) || (!isCreate && modelFieldFlag)) && (
          <Form.Item
            style={{
              display:
                !getFieldValue('fieldWidget') || getFieldValue('fieldWidget') === 'INPUT'
                  ? 'block'
                  : 'none',
            }}
          >
            {getFieldDecorator('mergeFlag', {
              initialValue: mergeFlag,
            })(
              <Checkbox checkedValue={1} unCheckedValue={0} onChange={this.changeFieldMergeFlag}>
                {intl.get('hpfm.individual.model.config.mergeSearch').d('合并查询')}
              </Checkbox>
            )}
          </Form.Item>
        )}
        <Form.Item
          style={{
            display: !getFieldValue('fieldWidget') || multipleComponentFlag ? 'block' : 'none',
          }}
        >
          {getFieldDecorator('widget.multipleFlag', {
            initialValue: (widget || {}).multipleFlag,
          })(
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              // disabled={!isCreate && record.custType === 'STD'}
              onChange={this.handleChangeMultiFlag}
            >
              {getFieldValue('fieldWidget') === 'INPUT_NUMBER'
                ? intl
                    .get('hpfm.individuationUnit.model.individuationUnit.rangeNumber')
                    .d('范围数值')
                : getFieldValue('fieldWidget') === 'DATE_PICKER'
                ? intl.get('hpfm.individuationUnit.model.individuationUnit.range').d('范围时间')
                : intl.get('hpfm.individuationUnit.model.individuationUnit.mutilFlag').d('多选')}
            </Checkbox>
          )}
        </Form.Item>
        {((isCreate && getFieldValue('isModelField')) || (!isCreate && modelFieldFlag)) && (
          <Form.Item
            label={intl.get('hpfm.individual.model.config.filterType').d('筛选方式')}
            style={{
              display:
                getFieldValue('widget.multipleFlag') || getFieldValue('mergeFlag')
                  ? 'none'
                  : 'block',
            }}
          >
            {getFieldDecorator('whereOptions', {
              initialValue: whereOption
                ? whereOption.split(',')
                : !isStandardField
                ? defaultOption
                : (widget || {}).multipleFlag === 1
                ? ['IN']
                : ['='],
              rules: [
                {
                  // required: !isStandardField,
                  required: visible && isSeachBarType,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.individual.model.config.filterType').d('筛选方式'),
                  }),
                },
              ],
            })(
              <TreeSelect
                style={{ width: '100%' }}
                treeCheckable
                // disabled={isStandardField}
                treeData={options.map((item) => ({
                  title: item.meaning,
                  value: item.value,
                  key: item.value,
                }))}
              />
            )}
          </Form.Item>
        )}
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get('hpfm.individual.model.config.position').d('位置')}
              {...formLayout}
            >
              {getFieldDecorator('gridSeq', {
                initialValue: gridSeq,
              })(<InputNumber style={{ width: '93%' }} precision={0} min={1} />)}
            </FormItem>
          </Col>
        </Row>
      </>
    );
  }

  @Bind()
  handleChangeMultiFlag(event) {
    const {
      form: { setFieldsValue = () => {}, getFieldValue = () => {} },
    } = this.props;
    const { defaultOption } = this.getComponentWhereOption(null, event.target.value === 1 ? 0 : 1);
    setFieldsValue({
      mergeFlag: 0,
      whereOptions: getFieldValue('custType') === 'EXT' ? defaultOption : ['='],
    });
  }

  @Bind()
  changeFieldMergeFlag() {
    const {
      form: { setFieldsValue = () => {} },
    } = this.props;
    setFieldsValue({
      'widget.multipleFlag': 0,
      whereOption: ['='],
    });
  }

  @Bind()
  getComponentWhereOption(widget, flag) {
    const {
      codes: { whereOptions = [] },
      form: { getFieldValue = () => {} },
    } = this.props;
    const commonOptions = !whereOptions.length
      ? []
      : whereOptions.filter((item) => ['NOTNULL', 'ISNULL'].includes(item.value));
    let defaultOption;
    let options = whereOptions;
    const fieldWidget = widget || getFieldValue('fieldWidget');
    const multipleFlag = flag === 0 ? flag : getFieldValue('widget.multipleFlag');
    // INPUT', 'INPUT_NUMBER', 'SELECT', 'LOV', 'DATE_PICKER
    if (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget)) {
      if (multipleFlag === 1) {
        defaultOption = ['IN'];
        options = options.filter((item) => item.value === 'IN');
      } else {
        defaultOption = ['='];
        options = options.filter((item) => ['=', '>', '>=', '<', '<=', '<>'].includes(item.value));
      }
    } else if (['LOV', 'SELECT'].includes(fieldWidget)) {
      defaultOption = multipleFlag === 1 ? ['IN', 'NOT IN'] : ['=', '<>'];
      options = options.filter((item) => defaultOption.includes(item.value));
    } else {
      defaultOption = ['LIKE'];
      options = options.filter((item) =>
        ['=', '<>', 'L_LIKE', 'R_LIKE', 'LIKE'].includes(item.value)
      );
    }
    options = options.concat(commonOptions);
    return { options, defaultOption };
  }

  @Bind()
  changeComparisonFlag(flag) {
    const {
      form: { setFieldsValue = () => {}, getFieldValue = () => {} },
    } = this.props;
    let originWhereOption = getFieldValue('whereOptions');
    if (isArray(originWhereOption) && !isEmpty(originWhereOption)) {
      originWhereOption = originWhereOption[0];
    }
    if (flag === 'default') {
      setFieldsValue({
        whereOptions: originWhereOption,
      });
    }
  }

  @Bind()
  toggleRelatedModal() {
    const { relatedVisible } = this.state;
    this.setState({
      relatedVisible: !relatedVisible,
    });
  }

  @Bind()
  toggleParamsModal() {
    const { paramVisible } = this.state;
    this.setState({
      paramVisible: !paramVisible,
    });
  }

  @Bind()
  saveParamList(paramList) {
    const { record } = this.props;
    record.paramList = paramList;
  }

  @Bind()
  toggleConditionModal(targetProp) {
    const { conditionVisible } = this.state;
    this.setState({
      targetProp,
      conditionVisible: !conditionVisible,
    });
  }

  @Bind()
  toggleComputeRuleModal() {
    const { compRuleVisible } = this.state;
    this.setState({
      compRuleVisible: !compRuleVisible,
    });
  }

  @Bind()
  toggleSelfConditionModal() {
    const { selfConditionVisible } = this.state;
    this.setState({
      selfConditionVisible: !selfConditionVisible,
    });
  }

  @Bind()
  toggleDefaultValueModal() {
    const { defaultValueVisible } = this.state;
    this.setState({
      defaultValueVisible: !defaultValueVisible,
    });
  }

  @Bind()
  toggleFieldNameModal() {
    const { fieldNameVisible } = this.state;
    this.setState({
      fieldNameVisible: !fieldNameVisible,
    });
  }

  @Bind()
  updateLovMappings(fieldLovMaps) {
    this.setState({
      fieldLovMaps,
    });
  }

  @Bind()
  updateConditionHeaders(targetProp, newHeaderProps) {
    const { conditionHeaders } = this.state;
    this.setState({
      conditionHeaders: {
        ...conditionHeaders,
        [targetProp]: newHeaderProps,
      },
    });
  }

  @Bind()
  saveRenderRule({ renderRule }) {
    const { record } = this.props;
    record.renderRule = renderRule;
  }

  @Bind()
  onOk() {
    const {
      record,
      form,
      unitInfo: { unitType, type, id },
      refreshLineData,
      dispatch,
    } = this.props;
    const isCreate = type === 'new';
    const isSeachBarType = unitType === 'SEARCHBAR';
    const { conditionHeaders } = this.state;
    form.validateFields((err, values) => {
      if (err) return;
      const { field = {}, widget, ...others } = record;
      const allData = { ...field, ...widget, ...values };
      const {
        fieldName,
        modelId = -1,
        fieldId = -1,
        fieldCode,
        fieldCategory,
        fieldType,
        fieldWidget,
        bindField,
        whereOptions,
        mergeFlag,
        renderOptions = 'TEXT',
      } = values;
      const rest = omit(values, [
        'defaultValue',
        'sourceCode',
        'numberMax',
        'numberMin',
        'numberDecimal',
        'textMaxLength',
        'textMinLength',
        'textAreaMaxLine',
        'dateFormat',
        'bucketName',
        'bucketDirectory',
        'linkTitle',
        'linkHref',
        'multipleFlag',
        'linkNewWindow',
        'uploadShowFlag',
        'widget',
        'fieldName',
        'modelId',
        'fieldId',
        'fieldCode',
        'fieldCategory',
        'fieldType',
        'fieldWidget',
        'bindField',
        'whereOptions',
        'renderOptions',
        'attachmentTemplate',
      ]);
      let payload = {
        modelId,
        unitId: id,
        fieldId,
        ...others,
        bindField: bindField === '' ? undefined : bindField,
        fieldName,
        fieldCode,
        field: {
          ...field,
          fieldCategory,
          fieldType,
          fieldCode,
        },
        widget: {
          ...widget,
          ...getWidgetConfig(fieldWidget, allData),
        },
        conditionHeaders: Object.values(conditionHeaders).filter((i) => !isEmpty(i)),
        renderOptions,
        ...rest,
      };
      if (isSeachBarType) {
        const { custType = 'EXT', fieldRequired, fieldAlias } = record;
        const newWhereOption = isArray(whereOptions) ? whereOptions.join(',') : whereOptions;
        payload = {
          ...payload,
          custType,
          fieldCode,
          fieldRequired,
          fieldAlias,
          // whereOption: newWhereOption,
          whereOption:
            (values.widget || {}).multipleFlag === 1
              ? 'IN'
              : mergeFlag === 1
              ? 'LIKE'
              : newWhereOption,
          widget: {
            ...payload.widget,
            ...values.widget,
            fieldWidget,
            // placeholder: values.placeholder,
          },
        };
        // if (custType !== 'EXT') {
        //   payload.whereOption = undefined;
        // }
        if (!isCreate) {
          payload = {
            ...payload,
            fieldCode,
            fieldRequired,
            widget: {
              ...payload.widget,
              _token: (record.widget || {})._token,
              id: (record.widget || {}).id,
            },
          };
          // 标准字段保存时不保存displayField和valueField
          if (custType === 'STD') {
            payload = omit(payload, ['displayField', 'valueField']);
          }
        }
        payload.mergeFlag = !isNil(payload.mergeFlag) ? payload.mergeFlag : 0; // 空值传0
        payload.sortedFlag = !isNil(payload.sortedFlag) ? payload.sortedFlag : -1; // 空值传-1
      }

      if (isEmpty(payload.widget)) delete payload.widget;
      if (payload.fieldNameType === 'MODEL') {
        payload.modelFieldCode = payload.fieldCode;
      }
      // 虚拟字段 modelCode保存为-1
      if (payload.isModelField != 1) {
        payload.modelCode = -1;
      }
      if (!['DEFAULT', 'CUSTOMIZE'].includes(payload.fieldNameType) && payload.cuszFieldName) {
        // 保存时 将cuszFieldName 填充到fieldName字段上
        payload.fieldName = payload.cuszFieldName;
      }
      // 链接标题多语言移动到 widget 内
      if (payload._tls && payload._tls.linkTitle) {
        payload.widget._tls = {
          ...(payload.widget._tls || {}),
          linkTitle: payload._tls.linkTitle,
        };
        delete payload._tls.linkTitle;
      }
      dispatch({
        type: 'configCustomizeCuz/saveFieldIndividual',
        payload,
      }).then((res) => {
        if (res) {
          notification.success();
          refreshLineData(id);
          this.onClose();
        }
      });
    });
  }

  @Bind()
  setFieldInfo(_, record) {
    const {
      form,
      unitInfo: { unitType },
    } = this.props;
    const {
      fieldWidget,
      fieldCategory,
      fieldType,
      fieldName,
      fieldMultiLang,
      fieldId,
      fieldCodeCamel,
      modelFieldWidget,
      fieldCode,
    } = record;
    const isSeachBarType = unitType === 'SEARCHBAR';
    form.setFieldsValue({
      fieldWidget,
      fieldMultiLang,
      fieldCategory,
      fieldType,
      fieldName,
      fieldAlias: fieldCodeCamel,
      fieldId,
      modelFieldName: fieldName,
      fieldNameType: 'MODEL',
    });
    // 此处加延时解决改变值之前字段还未绑定到form上，造成值未正确到页面问题
    setTimeout(() => {
      form.setFieldsValue({
        fieldCode,
      });
    });
    if (isSeachBarType && modelFieldWidget) {
      form.setFieldsValue({
        fieldWidget: (modelFieldWidget || {}).fieldWidget,
      });
      // 此处加延时解决改变值之前字段还未绑定到form上，造成值未正确到页面问题
      setTimeout(() => {
        form.setFieldsValue({
          'widget.sourceCode': (modelFieldWidget || {}).sourceCode,
        });
      });
    }
  }

  @Bind()
  onComponentChange(value) {
    const {
      form,
      record = {},
      unitInfo: { unitType },
    } = this.props;
    const isSeachBarType = unitType === 'SEARCHBAR';
    form.setFieldsValue({
      bucketName: undefined,
      // templateUUID: undefined,
      // bucketDirectory: undefined,
      sourceCode: undefined,
      textMaxLength: undefined,
      textMinLength: undefined,
      textAreaMaxLine: undefined,
      numberMax: undefined,
      numberMin: undefined,
      dateFormat: undefined,
      lovMappings: undefined,
      defaultValue: undefined,
      multipleFlag: undefined,
      linkHref: undefined,
      linkTitle: undefined,
      linkType: undefined,
      modalWidth: undefined,
      uploadShowFlag: undefined,
      'widget.dateFormat': undefined,
      'widget.sourceCode': undefined,
      // 'widget.multipleFlag': undefined,
    });
    if (isSeachBarType) {
      // if (!value || value !== 'INPUT') {
      //   form.setFieldsValue({
      //     mergeFlag: 0,
      //   });
      // }
      const { defaultOption } = this.getComponentWhereOption(value);
      form.setFieldsValue({
        whereOptions: defaultOption,
        mergeFlag: 0,
      });
    }
    this.setState({ fieldLovMaps: [] });
    record.fieldLovMaps = [];
    record.paramList = [];
  }

  @Bind()
  onClose() {
    const { record, onClose = () => {}, form } = this.props;
    record.paramList = this.state.backUpParamList;
    record.renderRule = this.state.backUpRenderRule;

    form.setFieldsValue({
      fieldName: undefined,
      modelId: undefined,
      fieldId: undefined,
      fieldCode: undefined,
      fieldCategory: undefined,
      fieldType: undefined,
      fieldWidget: undefined,
      sourceCode: undefined,
      numberMax: undefined,
      numberMin: undefined,
      numberDecimal: undefined,
      textMaxLength: undefined,
      textMinLength: undefined,
      textAreaMaxLine: undefined,
      dateFormat: undefined,
      bucketName: undefined,
      bucketDirectory: undefined,
      linkTitle: undefined,
      linkHref: undefined,
      linkNewWindow: undefined,
      lovMappings: undefined,
      defaultValue: undefined,
      multipleFlag: undefined,
      whereOptions: undefined,
    });
    this.setState({
      fieldLovMaps: [],
      conditionHeaders: {
        required: {},
        visible: {},
        editable: {},
        fieldName: {},
        defaultValue: {},
        valid: {},
      },
      backUpParamList: [],
      backUpRenderRule: '',
      condOptions: [],
    });
    // eslint-disable-next-line no-unused-expressions
    typeof onClose === 'function' && onClose({ field: {}, widget: {} });
  }

  shouldComponentUpdate(prev) {
    const {
      unitInfo: { id: prevId },
    } = prev;
    const {
      unitInfo: { id },
    } = this.props;
    return prev.visible !== this.props.visible || this.props.visible === true || prevId !== id;
  }

  @Bind()
  handleChangeModel() {
    const { form } = this.props;
    form.setFieldsValue({
      fieldCode: '',
      fieldAlias: '',
      fieldType: '',
      fieldName: '',
    });
  }

  @Bind()
  handleChangeFieldNameType(e) {
    const type = e.target.value;
    const {
      form: { setFieldsValue = () => {}, getFieldValue = () => {} },
    } = this.props;
    let fieldName;
    if (type === 'EXTEND') {
      fieldName = getFieldValue('extendFieldName');
    } else if (type === 'MODEL') {
      fieldName = getFieldValue('modelFieldName');
    } else {
      fieldName = getFieldValue('defaultFieldName');
    }
    setFieldsValue({
      fieldName,
    });
  }

  @Bind()
  getDefaultFieldNameType() {
    const { form, record } = this.props;
    const isVirtual = form.getFieldValue('isModelField') == 0;
    let type = record.fieldNameType;
    if (!type) {
      type = !isVirtual ? 'MODEL' : 'CUSTOMIZE';
    }
    return type;
  }

  @Bind()
  transformArrToTree(
    arrData,
    childKeyName,
    childValueName,
    parentKeyName,
    childrenName = 'children'
  ) {
    if (isEmpty(arrData)) {
      return [];
    }
    const arr = [];
    arrData.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      delete item[childrenName];
      arr.push({
        ...item,
        title: item[childValueName],
        value: item[childKeyName],
        key: item[childKeyName],
      });
    });
    const result = [];
    const map = {};
    arr.forEach((item) => {
      map[item[childKeyName]] = item;
    });
    arr.forEach((item) => {
      const parent = map[item[parentKeyName]];
      if (parent) {
        (parent[childrenName] || (parent[childrenName] = [])).push(item);
      } else {
        result.push(item);
      }
    });
    return result;
  }

  fieldWidgetFilter = (inputValue) => {
    if (['SECTION'].includes((this.props.unitInfo || {}).unitType)) {
      return ['SECTION', 'FORM', 'GRID'].includes(inputValue);
    } else return !['SECTION', 'FORM', 'GRID'].includes(inputValue);
  };

  render() {
    const {
      relatedVisible,
      fieldLovMaps,
      conditionVisible,
      paramVisible,
      compRuleVisible,
      selfConditionVisible,
      defaultValueVisible,
      fieldNameVisible,
      targetProp,
      conditionHeaders,
      conditionHeaders: {
        required: requiredFx,
        visible: _visibleFx,
        editable: editableFx,
        fieldName: fieldNameFx,
        defaultValue: defaultValueFx,
        valid: validFx,
      },
      condOptions,
      moduleList,
    } = this.state;
    const {
      codes,
      visible,
      type,
      unitAlias,
      unitInfo: { unitType, unitTag, id, unitCode, modelCode },
      aggregationGroup = [],
      form,
      record,
      saveLoading,
      unitList,
      fieldList,
      ctxParams,
    } = this.props;
    const isCreate = type === 'new';
    const unitTags = (unitTag || '').split(',');
    const isC7N = unitTags.includes('C7N');
    const isC7NTableBtn = unitTags.includes('C7N-TABLE-BTN');
    const isGroupGrid = unitTags.includes('GROUP-GRID');
    const aggregationFlag = form.getFieldValue('aggregationFlag');
    const fieldNameValids = (fieldNameFx && fieldNameFx.valids) || [];
    const isBtnGroup = unitType === 'BTNGROUP';
    const pureVirtual = ['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
    const defaultActiveVisible = ['TABPANE', 'COLLAPSE'].includes(unitType);
    const encryptAndBindVisible =
      !['SEARCHBAR', 'TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType) &&
      !aggregationFlag;
    const enableFxNameFlag = !['SEARCHBAR', 'TABPANE', 'COLLAPSE', 'BTNGROUP'].includes(unitType);
    const disabledHelpMessage = isC7NTableBtn && form.getFieldValue('fieldWidget');
    const showHelpMessage =
      ['FORM', 'FILTER', 'QUERYFORM', 'GRID', 'BTNGROUP'].includes(unitType) &&
      !disabledHelpMessage;
    // const isVirtual = record.modelId == -1 || form.getFieldValue('isModelField') == 0;
    const isVirtual = isCreate ? form.getFieldValue('isModelField') == 0 : !record.modelFieldFlag;
    const visibleFx = !['FILTER', 'QUERYFORM', 'SECTION'].includes(unitType);
    const isFormType = unitType === 'FORM' || unitType === 'QUERYFORM';
    const isSeachBarType = unitType === 'SEARCHBAR';
    let widgetTypeOptions = isBtnGroup
      ? isC7NTableBtn
        ? codes.fieldBtnWidget
        : (codes.fieldBtnWidget || []).filter((v) => v.value === 'EXPORT')
      : codes.fieldWidget || [];
    const showAggregationFlag =
      (isC7N && unitType === 'GRID' && isVirtual) || unitType === 'BTNGROUP';
    const showHiddenNumMark = unitTags.includes('DOUBLETABS');
    const visibleAggregation =
      ((isC7N && unitType === 'GRID') || unitType === 'BTNGROUP') && !aggregationFlag;
    const hasRenderControl = !isSeachBarType && !aggregationFlag;
    const visibleCheck = hasRenderControl;
    const hasWidget =
      ['SECTION', 'FORM', 'GRID', 'SEARCHBAR', 'FILTER', 'QUERYFORM', 'BTNGROUP'].includes(
        unitType
      ) && !aggregationFlag;
    if (isSeachBarType) {
      widgetTypeOptions = widgetTypeOptions.filter((item) =>
        FilterComponentList.includes(item.value)
      );
    }
    const defaultFieldNameType = this.getDefaultFieldNameType();
    const fieldWidgetFieldValue = form.getFieldValue('fieldWidget');
    const searchBarPlaceholderFlag =
      form.getFieldValue('mergeFlag') !== 1 &&
      (!fieldWidgetFieldValue ||
        fieldWidgetFieldValue === 'INPUT' ||
        (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidgetFieldValue) &&
          form.getFieldValue('widget.multipleFlag') !== 1));
    return (
      <Drawer
        destroyOnClose
        width={430}
        visible={visible}
        onClose={this.onClose}
        wrapClassName={styles['drawer-form']}
        title={getFieldConfigAlias(unitType)}
        zIndex={999}
      >
        <FormItem
          style={{
            display: isCreate && !pureVirtual ? 'inline-block' : 'none',
            width: '48%',
            marginRight: '4%',
          }}
        >
          {form.getFieldDecorator('isModelField', {
            // initialValue: pureVirtual || (!isCreate && record.modelCode == -1) ? 0 : 1,
            initialValue: pureVirtual || (!isCreate && !record.modelFieldFlag) ? 0 : 1,
          })(
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              onChange={(v) => {
                const newFormData = {
                  modelCode: !v.target.checked ? -1 : (moduleList[0] || {}).value,
                  fieldId: !v.target.checked ? -1 : undefined,
                };
                if (v.target.checked) {
                  newFormData.aggregationFlag = 0;
                }
                form.setFieldsValue(newFormData);
              }}
            >
              {intl
                .get('hpfm.individuationUnit.model.individuationUnit.isModelField')
                .d('创建模型字段')}
            </Checkbox>
          )}
        </FormItem>
        <FormItem style={{ display: showAggregationFlag ? 'inline-block' : 'none', width: '48%' }}>
          {form.getFieldDecorator('aggregationFlag', {
            initialValue: record.aggregationFlag || 0,
          })(
            <Checkbox disabled={!isCreate} checkedValue={1} unCheckedValue={0}>
              {intl.get('hpfm.customize.common.aggregationFlag').d('聚合组')}
            </Checkbox>
          )}
        </FormItem>
        {defaultActiveVisible && (
          <FormItem label={getDefaultActiveAlias(unitType)}>
            {form.getFieldDecorator('defaultActive', {
              initialValue: isCreate ? -1 : record.defaultActive,
            })(
              <Select style={{ width: '100%' }}>
                {condOptions.map((item) => (
                  <Option value={Number(item.value)}>{item.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {showHiddenNumMark && (
          <FormItem>
            {form.getFieldDecorator('hiddenNumFlag', {
              initialValue: record.hiddenNumFlag || 0,
            })(
              <Checkbox checkedValue={1} unCheckedValue={0}>
                {intl.get('hpfm.customize.common.hiddenNumFlag').d('隐藏数字提醒')}
              </Checkbox>
            )}
          </FormItem>
        )}
        <FormItem
          label={intl.get('hpfm.individual.model.config.modelCategory').d('所属模型')}
          style={{ display: isVirtual ? 'none' : 'block' }}
        >
          {form.getFieldDecorator('modelCode', {
            initialValue: isVirtual ? -1 : type === 'new' ? modelCode : record.modelCode,
            rules: [
              {
                required: !isVirtual && !pureVirtual,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.individual.model.config.modelCategory').d('所属模型'),
                }),
              },
            ],
          })(
            // <Select
            //   style={{ width: '100%' }}
            //   disabled={type !== 'new'}
            //   onChange={this.handleChangeModel}
            // >
            //   {moduleList.map((i) => (
            //     <Option value={i.modelCode}>{i.modelName}</Option>
            //   ))}
            // </Select>
            // type !== 'new' ? (
            //   <Input disabled />
            // ) : (
            <TreeSelect
              disabled={type !== 'new'}
              allowClear
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: '240px' }}
              treeDefaultExpandAll
              treeData={moduleList}
              onChange={this.handleChangeModel}
            />
            // )
          )}
        </FormItem>
        <FormItem label={getFieldCodeAlias(unitType)}>
          {form.getFieldDecorator('fieldCode', {
            initialValue: (record || {}).fieldCode,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: getFieldCodeAlias(unitType),
                }),
              },
            ],
          })(
            !isCreate || isVirtual ? (
              <Input
                trimAll
                inputChinese={false}
                disabled={type !== 'new' || record.custType === 'STD'}
              />
            ) : (
              // <Lov
              //   code="HMDE.VIEW_FIELD_VIEW"
              //   queryParams={{ viewCode: form.getFieldValue('modelCode'), unitId: id }}
              //   lovOptions={{ displayField: 'fieldCode' }}
              //   textValue={(record.field || {}).fieldCode}
              //   onChange={this.setFieldInfo}
              //   disabled={type !== 'new'}
              // />
              <SelectFieldLov
                queryParams={{ modelCode: form.getFieldValue('modelCode'), unitId: id }}
                // textValue={(record.field || {}).fieldCode}
                onChangeField={this.setFieldInfo}
                disabled={type !== 'new'}
              />
            )
          )}
          {form.getFieldDecorator('fieldId', { initialValue: record.fieldId })}
          {form.getFieldDecorator('fieldMultiLang', {
            initialValue: (record.field || {}).fieldMultiLang,
          })}
        </FormItem>
        {!isCreate && (
          <FormItem label={intl.get('hpfm.individual.model.config.custType').d('类型')}>
            {form.getFieldDecorator('custType', {
              initialValue: record.custType,
            })(
              <Select style={{ width: '100%' }} disabled>
                {codes.custType.map((i) => (
                  <Option value={i.value}>{i.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {!isVirtual && (
          <FormItem label={intl.get('hpfm.individual.model.config.fieldAlias').d('编码别名')}>
            {form.getFieldDecorator('fieldAlias', {
              initialValue: record.fieldAlias,
              rules: [
                {
                  required: !isVirtual && visible, // TODO: 未知原因，在首次打开虚拟字段时，必输校验拿不到，暂增加visible限制
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.individual.model.config.fieldAlias').d('编码别名'),
                  }),
                },
                {
                  validator: (_, val, cb) => {
                    if (/_/.test(val || '')) {
                      cb(
                        intl.get('hpfm.customize.common.validate.noUnderLine').d('不可包含下划线')
                      );
                    }
                    cb();
                  },
                },
              ],
            })(
              <Input
                disabled={
                  form.getFieldValue('fieldCode') === undefined || record.custType === 'STD'
                }
              />
            )}
          </FormItem>
        )}
        <FormItem
          label={intl.get('hpfm.individual.model.config.fieldNameOrigin').d('字段名称来源')}
        >
          {form.getFieldDecorator('fieldNameType', {
            initialValue: defaultFieldNameType,
            // initialValue: record.fieldNameType || (
            //   (form.getFieldValue('isModelField') == 1 && !isSeachBarType) ?
            //     (isCreate ? 'MODEL' : 'EXTEND')
            //   : 'CUSTOMIZE'),
          })(
            <RadioGroup onChange={this.handleChangeFieldNameType}>
              {record.custType === 'STD' && (
                <Radio value="EXTEND">
                  {intl.get('hpfm.individual.view.option.platformPreDefine').d('平台预定义')}
                </Radio>
              )}
              {!isVirtual && (
                <Radio value="MODEL">
                  {intl.get('hpfm.individual.view.option.model').d('模型')}
                </Radio>
              )}
              <Radio value="CUSTOMIZE">
                {intl.get('hpfm.individual.view.option.customize').d('自定义')}
              </Radio>
            </RadioGroup>
          )}
        </FormItem>
        <div className="has-fx-row">
          <FormItem label={getFieldNameAlias(unitType)}>
            {form.getFieldDecorator('extendFieldName', { initialValue: record.extendFieldName })}
            {form.getFieldDecorator('defaultFieldName', { initialValue: record.fieldName })}
            {form.getFieldDecorator('modelFieldName', { initialValue: record.modelFieldName })}
            {form.getFieldDecorator('fieldName', {
              initialValue:
                form.getFieldValue('fieldNameType') === 'CUSTOMIZE'
                  ? record.cuszFieldName
                  : record.fieldName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: getFieldNameAlias(unitType),
                  }),
                },
              ],
            })(
              form.getFieldValue('fieldNameType') !== 'CUSTOMIZE' ? (
                <Input disabled />
              ) : (
                <TLEditor
                  label={getFieldNameAlias(unitType)}
                  field="fieldName"
                  token={record._token}
                  disabled={!isVirtual && form.getFieldValue('fieldCode') === undefined}
                />
              )
            )}
          </FormItem>
          {enableFxNameFlag && form.getFieldValue('fieldNameType') === 'CUSTOMIZE' && (
            <Tooltip
              placement="right"
              title={intl.get('hpfm.individual.model.config.condition').d('条件配置')}
            >
              <span className="fx-alink">
                <Badge dot={(fieldNameValids || []).length > 0}>
                  <a
                    className={(fieldNameValids || []).length > 0 ? 'active' : ''}
                    onClick={() => this.toggleFieldNameModal()}
                    style={{ display: visibleFx ? 'inline-block' : 'none' }}
                  >
                    fx
                  </a>
                </Badge>
              </span>
            </Tooltip>
          )}
        </div>
        {(showHelpMessage || isSeachBarType) && form.getFieldValue('fieldType') !== 'TEXT_AREA' && (
          <FormItem label={intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示')}>
            {form.getFieldDecorator('helpMessage', {
              initialValue: record.helpMessage,
            })(
              <TLEditor
                label={intl.get('hpfm.individual.model.config.helpMessage').d('气泡提示')}
                field="helpMessage"
                token={record._token}
              />
            )}
          </FormItem>
        )}
        {isSeachBarType && searchBarPlaceholderFlag && (
          <FormItem label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}>
            {form.getFieldDecorator('backgroundText', {
              initialValue: record.backgroundText,
            })(
              <TLEditor
                label={intl.get('hpfm.individual.model.config.placeholder').d('背景文字')}
                field="backgroundText"
                token={record._token}
              />
            )}
          </FormItem>
        )}
        {
          // unitType === "BTNGROUP" && (
          //   <FormItem label={intl.get('hpfm.individual.model.config.eventCode').d('事件编码')}>
          //     {form.getFieldDecorator('eventCode', {
          //       initialValue: record.eventCode,
          //       rules: [
          //         {
          //           required: true,
          //           message: intl.get('hzero.common.validation.notNull', {
          //             name: intl.get('hpfm.individual.model.config.eventCode').d('事件编码'),
          //           }),
          //         },
          //       ],
          //     })(
          //       <Input trim />
          //     )}
          //   </FormItem>
          // )
        }
        {unitType === 'FILTER' || isFormType ? (
          <FormItem
            label={intl.get('hpfm.individual.model.config.labelWrapperCol').d('标签组件比例')}
          >
            {form.getFieldDecorator('labelCol', {
              initialValue: record.labelCol,
            })(
              <Select
                allowClear
                showSearch
                style={{ width: '46%', marginRight: '8%', float: 'left' }}
                placeholder={intl.get('hpfm.individual.model.config.label').d('标签')}
              >
                {colOptions.map((i) => (
                  <Option value={i}>{i}</Option>
                ))}
              </Select>
            )}
            {form.getFieldDecorator('wrapperCol', {
              initialValue: record.wrapperCol,
            })(
              <Select
                allowClear
                showSearch
                style={{ width: '46%' }}
                placeholder={intl.get('hpfm.individual.model.config.wrapper').d('组件')}
              >
                {colOptions.map((i) => (
                  <Option value={i}>{i}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        ) : null}
        {!visibleFx && !isVirtual && !isSeachBarType ? (
          <FormItem
            label={intl.get('hpfm.individual.model.config.whereOption').d('查询关系类型')}
            style={{ display: pureVirtual ? 'none' : 'block' }}
          >
            {form.getFieldDecorator('whereOption', {
              initialValue: record.whereOption || '=',
            })(
              <Select style={{ width: '100%' }} disabled={record.custType === 'STD'}>
                {codes.whereOptions.map((i) => (
                  <Option value={i.value}>{i.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        ) : null}

        {encryptAndBindVisible ? (
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.bindField')
              .d('字段绑定')}
            style={{ display: !pureVirtual ? 'block' : 'none' }}
          >
            {form.getFieldDecorator('bindField', {
              initialValue: record.bindField,
              rules: [
                {
                  pattern: /[_a-zA-Z][_a-zA-Z0-9]*\.[_a-zA-Z][_a-zA-Z0-9]*/,
                  message: intl.get('hpfm.common.validation.mustADotB').d('必须是A.B形式'),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </FormItem>
        ) : null}
        {visibleAggregation && (
          <FormItem label={intl.get('hpfm.customize.common.aggregationCode').d('所在聚合组')}>
            {form.getFieldDecorator('aggregationCode', {
              initialValue: record.aggregationCode,
            })(
              <Select allowClear style={{ width: '100%' }}>
                <Option value="__no_aggregation__">
                  ---{intl.get('hpfm.customize.common.noAggregation').d('取消聚合')}---
                </Option>
                {aggregationGroup.map((item) => (
                  <Option value={item.fieldCodeAlias}>{item.fieldName}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {hasRenderControl && (
          <FormItem
            label={intl.get('hpfm.individual.model.config.renderOptions').d('渲染方式')}
            style={{ display: pureVirtual ? 'none' : 'block' }}
          >
            {form.getFieldDecorator('renderOptions', {
              initialValue: record.renderOptions || (isVirtual ? 'TEXT' : 'WIDGET'),
            })(
              <Select style={{ width: '100%' }} disabled={record.custType === 'STD'}>
                {codes.renderOptions.map((i) => (
                  <Option value={i.value}>{i.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {encryptAndBindVisible && (
          <FormItem label={intl.get('hpfm.individual.model.config.encryptFlag').d('强制加密')}>
            {form.getFieldDecorator('encryptFlag', {
              initialValue: record.encryptFlag === undefined ? -1 : record.encryptFlag,
            })(
              <Select style={{ width: '100%' }}>
                {condOptions.map((item) => (
                  <Option value={Number(item.value)}>{item.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        {isFormType && (
          <FormItem label={intl.get('hpfm.customize.common.isNotMoreField').d('预展示字段')}>
            {form.getFieldDecorator('showFieldFlag', {
              initialValue: record.showFieldFlag || 0,
            })(
              <Select style={{ width: '100%' }}>
                <Option value={1}>{intl.get('hzero.common.yes')}</Option>
                <Option value={0}>{intl.get('hzero.common.no')}</Option>
              </Select>
            )}
          </FormItem>
        )}
        {!isSeachBarType && (
          <Row className={styles['flex-center-vertical']}>
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.individual.model.config.visible').d('显示')}
              >
                <Tooltip
                  title={
                    record.unitFieldRequired === 1
                      ? intl.get('hpfm.customize.common.tip3').d('平台级必输字段禁止修改此项')
                      : ''
                  }
                >
                  {form.getFieldDecorator('visible', {
                    initialValue: isCreate ? 1 : record.visible,
                  })(
                    <Select style={{ width: '100%' }} disabled={record.unitFieldRequired === 1}>
                      {condOptions.map((item) => (
                        <Option value={Number(item.value)}>{item.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </Tooltip>
              </FormItem>
            </Col>
            <Col
              span={6}
              style={{ display: visibleFx ? 'inline-block' : 'none' }}
              className="fx-alink"
            >
              <Tooltip
                placement="right"
                title={
                  record.unitFieldRequired === 1
                    ? intl.get('hpfm.customize.common.tip3').d('平台级必输字段禁止修改此项')
                    : intl.get('hpfm.individual.model.config.condition').d('条件配置')
                }
              >
                <Badge dot={(_visibleFx.lines || []).length > 0}>
                  <a
                    className={(_visibleFx.lines || []).length > 0 ? 'active' : ''}
                    onClick={() => this.toggleConditionModal('visible')}
                    disabled={record.unitFieldRequired === 1}
                  >
                    fx
                  </a>
                </Badge>
              </Tooltip>
            </Col>
          </Row>
        )}
        {!isSeachBarType && (
          <Row
            className={styles['flex-center-vertical']}
            style={{
              display:
                (form.getFieldValue('renderOptions') || record.renderOptions) === 'TEXT' ||
                pureVirtual
                  ? 'none'
                  : 'block',
            }}
          >
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.individual.model.config.editable').d('编辑')}
              >
                {form.getFieldDecorator('fieldEditable', {
                  initialValue: isCreate ? 1 : record.fieldEditable,
                })(
                  <Select style={{ width: '100%' }}>
                    {condOptions.map((item) => (
                      <Option value={Number(item.value)}>{item.meaning}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col
              span={6}
              style={{ display: visibleFx ? 'inline-block' : 'none' }}
              className="fx-alink"
            >
              <Tooltip
                placement="right"
                title={intl.get('hpfm.individual.model.config.condition').d('条件配置')}
              >
                <Badge dot={(editableFx.lines || []).length > 0}>
                  <a
                    className={(editableFx.lines || []).length > 0 ? 'active' : ''}
                    onClick={() => this.toggleConditionModal('editable')}
                  >
                    fx
                  </a>
                </Badge>
              </Tooltip>
            </Col>
          </Row>
        )}
        {!isSeachBarType && (
          <Row
            className={styles['flex-center-vertical']}
            style={{
              display:
                (form.getFieldValue('renderOptions') || record.renderOptions) === 'TEXT' ||
                pureVirtual
                  ? 'none'
                  : 'block',
            }}
          >
            <Col span={12}>
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.individual.model.config.required').d('必输')}
              >
                <Tooltip
                  title={
                    record.unitFieldRequired === 1
                      ? intl.get('hpfm.customize.common.tip3').d('平台级必输字段禁止修改此项')
                      : ''
                  }
                >
                  {form.getFieldDecorator('fieldRequired', {
                    initialValue: isCreate ? 0 : record.fieldRequired,
                  })(
                    <Select style={{ width: '100%' }} disabled={record.unitFieldRequired === 1}>
                      {condOptions.map((item) => (
                        <Option value={Number(item.value)}>{item.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </Tooltip>
              </FormItem>
            </Col>
            <Col
              span={6}
              style={{ display: visibleFx ? 'inline-block' : 'none' }}
              className="fx-alink"
            >
              <Tooltip
                placement="right"
                title={
                  record.unitFieldRequired === 1
                    ? intl.get('hpfm.customize.common.tip3').d('平台级必输字段禁止修改此项')
                    : intl.get('hpfm.individual.model.config.condition').d('条件配置')
                }
              >
                <Badge dot={(requiredFx.lines || []).length > 0}>
                  <a
                    className={(requiredFx.lines || []).length > 0 ? 'active' : ''}
                    onClick={() => this.toggleConditionModal('required')}
                    disabled={record.unitFieldRequired === 1}
                  >
                    fx
                  </a>
                </Badge>
              </Tooltip>
            </Col>
          </Row>
        )}
        {!isFormType && !isSeachBarType ? (
          <Row>
            {isGroupGrid && (
              <Col span={12}>
                <FormItem
                  label={intl.get('hpfm.individual.model.config.col').d('列')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('formCol', {
                    initialValue: record.formCol,
                    rules: [
                      {
                        required: visible,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.individual.model.config.col').d('列'),
                        }),
                      },
                    ],
                  })(<InputNumber style={{ width: '93%' }} precision={0} min={1} max={999} />)}
                </FormItem>
              </Col>
            )}
            <Col span={12}>
              <FormItem
                label={intl.get('hpfm.individual.model.config.position').d('位置')}
                {...formLayout}
              >
                {form.getFieldDecorator('gridSeq', {
                  initialValue: record.gridSeq,
                  rules: [
                    {
                      required: visible,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.individual.model.config.position').d('位置'),
                      }),
                    },
                  ],
                })(<InputNumber style={{ width: '93%' }} precision={0} min={1} />)}
              </FormItem>
            </Col>
            <Col span={12} style={{ display: unitType === 'GRID' ? 'block' : 'none' }}>
              <FormItem
                label={intl.get('hpfm.individual.model.config.gridWidth').d('宽度')}
                {...formLayout}
              >
                {form.getFieldDecorator('gridWidth', {
                  initialValue: record.gridWidth,
                })(<InputNumber style={{ width: '93%' }} precision={0} min={0} />)}
              </FormItem>
            </Col>
            <Col span={12} style={{ display: unitType === 'GRID' ? 'block' : 'none' }}>
              <FormItem
                label={intl.get('hpfm.individual.model.config.gridFixed').d('冻结')}
                {...formLayout}
              >
                {form.getFieldDecorator('gridFixed', {
                  initialValue: record.gridFixed,
                })(
                  <Select style={{ width: '93%' }} allowClear>
                    {codes.fixed.map((i) => (
                      <Option value={i.value}>{i.meaning}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12} style={{ display: unitType === 'GRID' ? 'block' : 'none' }}>
              <FormItem
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 15 }}
                label={intl.get('hpfm.individual.model.config.sorter').d('可排序')}
              >
                {form.getFieldDecorator('sorter', {
                  initialValue: Number(record.sorter || 0),
                })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
              </FormItem>
            </Col>
          </Row>
        ) : (
          !isSeachBarType && (
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get('hpfm.individual.model.config.row').d('行')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('formRow', {
                    initialValue: record.formRow,
                    rules: [
                      {
                        required: visible,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.individual.model.config.row').d('行'),
                        }),
                      },
                    ],
                  })(<InputNumber style={{ width: '93%' }} precision={0} min={1} max={999} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get('hpfm.individual.model.config.col').d('列')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('formCol', {
                    initialValue: record.formCol,
                    rules: [
                      {
                        required: visible,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.individual.model.config.col').d('列'),
                        }),
                      },
                    ],
                  })(<InputNumber style={{ width: '93%' }} precision={0} min={1} max={999} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get('hpfm.individual.model.config.rowSpan').d('跨行')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('rowSpan', {
                    initialValue: record.rowSpan || 1,
                  })(<InputNumber style={{ width: '93%' }} precision={0} min={1} max={999} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get('hpfm.individual.model.config.colSpan').d('跨列')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('colSpan', {
                    initialValue: record.colSpan || 1,
                  })(<InputNumber style={{ width: '93%' }} precision={0} min={1} max={999} />)}
                </FormItem>
              </Col>
            </Row>
          )
        )}
        <FormItem
          label={getWidgetAlias(unitType)}
          style={{
            display: hasWidget ? 'block' : 'none',
            marginBottom: '14px',
          }}
        >
          {form.getFieldDecorator('fieldWidget', {
            initialValue: (record.widget || {}).fieldWidget,
            rules: [
              {
                required:
                  !isSeachBarType &&
                  !pureVirtual &&
                  !isBtnGroup &&
                  isVirtual &&
                  (form.getFieldValue('renderOptions') || record.renderOptions) === 'WIDGET' &&
                  record.custType !== 'STD',
                message: intl.get('hzero.common.validation.notNull', {
                  name: getWidgetAlias(unitType),
                }),
              },
              {
                use:
                  record.custType !== 'STD' &&
                  (form.getFieldValue('fieldMultiLang') ||
                    // eslint-disable-next-line eqeqeq
                    (record.field || {}).fieldMultiLang) == 1,
                validator: (_, val, cb) => {
                  if (!_.use) {
                    cb();
                    return;
                  }
                  if (val !== 'TL_EDITOR') {
                    cb(
                      intl
                        .get('hpfm.individual.view.message.validate1')
                        .d('该字段只能选择国际化组件')
                    );
                  }
                  cb();
                },
              },
            ],
          })(
            <Select
              allowClear
              style={{ width: '100%' }}
              onChange={this.onComponentChange}
              disabled={
                (isSeachBarType && form.getFieldValue('custType') === 'STD') ||
                form.getFieldValue('fieldCode') === undefined ||
                record.custType === 'STD' ||
                (isBtnGroup && isC7NTableBtn && !isCreate)
              }
            >
              {widgetTypeOptions.map(
                (i) =>
                  this.fieldWidgetFilter(i.value) && <Option value={i.value}>{i.meaning}</Option>
              )}
            </Select>
          )}
        </FormItem>
        {unitType === 'SECTION' &&
          ['SECTION', 'FORM', 'GRID'].includes(form.getFieldValue('fieldWidget')) && (
            <FormItem label={intl.get('hpfm.customize.common.cardRelatedUnit').d('卡片关联单元')}>
              {form.getFieldDecorator('relatedUnitName', {
                initialValue: (record || {}).relatedUnitName,
              })(<Input disabled />)}
            </FormItem>
          )}
        {isSeachBarType ? this.configSearchBarComponent() : this.configMap(visibleFx)}
        {hasRenderControl && (
          <Button
            icon="setting"
            type="primary"
            onClick={this.toggleComputeRuleModal}
            style={{
              marginBottom: '8px',
              display:
                !pureVirtual &&
                (form.getFieldValue('renderOptions') || record.renderOptions) === 'TEXT'
                  ? 'block'
                  : 'none',
            }}
          >
            {intl.get('hpfm.individual.common.setComputeRule').d('计算规则配置')}
            <Badge dot={record.renderRule} style={{ marginLeft: '8px', backgroundColor: 'red' }} />
          </Button>
        )}
        {visibleCheck && (
          <Button
            icon="info-circle"
            type="primary"
            onClick={this.toggleSelfConditionModal}
            style={{
              display:
                (form.getFieldValue('renderOptions') || record.renderOptions) === 'TEXT' ||
                pureVirtual
                  ? 'none'
                  : 'block',
            }}
          >
            {intl.get('hpfm.individual.model.config.selfRule').d('自定义校验')}
            <Badge
              dot={(validFx.lines || []).length > 0 || (validFx.valids || []).length > 0}
              style={{ marginLeft: '8px', backgroundColor: 'red' }}
            />
          </Button>
        )}
        <footer className={styles.footer}>
          <Button onClick={this.onClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
          <Button type="primary" loading={saveLoading || this.saveCheckLoading} onClick={this.onOk}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </footer>
        {relatedVisible && (
          <RelatedModal
            id={id}
            externalForm={form}
            updateLovMappings={this.updateLovMappings}
            record={record}
            lovViewCode={form.getFieldValue('sourceCode')}
            fieldLovMaps={fieldLovMaps}
            visible={relatedVisible}
            onClose={this.toggleRelatedModal}
          />
        )}
        {conditionVisible && (
          <ConditionModal
            id={id}
            externalForm={form}
            ctxParams={ctxParams}
            unitList={unitList}
            fieldList={fieldList}
            unitType={unitType}
            fieldConditions={conditionHeaders[targetProp]}
            updateConditionHeaders={this.updateConditionHeaders}
            record={record}
            targetProp={targetProp}
            visible={conditionVisible}
            onClose={this.toggleConditionModal}
          />
        )}
        {paramVisible && (
          <ParamsModal
            type="unit"
            id={id}
            unitList={unitList}
            fieldList={fieldList}
            paramList={record.paramList}
            onSave={this.saveParamList}
            visible={paramVisible}
            readOnly={type !== 'new' && record.custType === 'STD'}
            onClose={this.toggleParamsModal}
          />
        )}
        {compRuleVisible && (
          <ComputeRuleModal
            rule={record.renderRule}
            unitType={unitType}
            unitCode={unitCode}
            unitList={unitList}
            record={record}
            unitAlias={unitAlias}
            visible={compRuleVisible}
            onOk={this.saveRenderRule}
            onClose={this.toggleComputeRuleModal}
          />
        )}
        {selfConditionVisible && (
          <SelfConditionModal
            destroyOnClose
            externalForm={form}
            visible={selfConditionVisible}
            unitType={unitType}
            unitId={id}
            unitList={unitList}
            selfValidator={validFx}
            ctxParams={ctxParams}
            updateSelfValidator={this.updateConditionHeaders}
            fieldId={record.configFieldId}
            fieldList={fieldList}
            onClose={this.toggleSelfConditionModal}
          />
        )}
        {defaultValueVisible && (
          <DefaultValueModal
            destroyOnClose
            externalForm={form}
            ctxParams={ctxParams}
            visible={defaultValueVisible}
            unitType={unitType}
            unitId={id}
            unitList={unitList}
            selfValidator={defaultValueFx}
            updateSelfValidator={this.updateConditionHeaders}
            fieldId={record.configFieldId}
            paramList={record.paramList}
            fieldList={fieldList}
            onClose={this.toggleDefaultValueModal}
          />
        )}
        {fieldNameVisible && (
          <ConditionFieldName
            destroyOnClose
            externalForm={form}
            targetProp="visible" // 使用和visible一样的禁用逻辑，表格无法控制机身的fieldName
            ctxParams={ctxParams}
            visible={fieldNameVisible}
            fieldNameAlias={getFieldNameAlias(unitType)}
            unitType={unitType}
            unitId={id}
            unitList={unitList}
            selfValidator={fieldNameFx}
            updateSelfValidator={this.updateConditionHeaders}
            fieldId={record.configFieldId}
            paramList={record.paramList}
            fieldList={fieldList}
            onClose={this.toggleFieldNameModal}
          />
        )}
      </Drawer>
    );
  }
}

function getWidgetConfig(type, allData) {
  const {
    sourceCode,
    numberMax,
    numberMin,
    numberDecimal,
    textMaxLength,
    textMinLength,
    textAreaMaxLine,
    dateFormat,
    bucketName,
    attachmentTemplate,
    bucketDirectory,
    linkTitle,
    linkHref,
    linkType,
    modalWidth,
    linkNewWindow,
    multipleFlag,
    placeholder,
    uploadShowFlag,
    allowThousandth,
    includeNowDayFlag,
  } = allData;

  const config = {
    bucketName: undefined,
    bucketDirectory: undefined,
    sourceCode: undefined,
    textMaxLength: undefined,
    textMinLength: undefined,
    textAreaMaxLine: undefined,
    numberMax: undefined,
    numberMin: undefined,
    allowThousandth: undefined,
    dateFormat: undefined,
    lovMappings: undefined,
    multipleFlag: undefined,
    placeholder: undefined,
    uploadShowFlag: undefined,
    includeNowDayFlag: undefined,
    linkNewWindow: undefined,
    defaultValue: allData.defaultValue,
    defaultValueReplaceFlag: allData.defaultValueReplaceFlag,
    fieldWidget: allData.fieldWidget,
  };
  switch (type) {
    case 'RADIOGROUP':
    case 'SELECT':
    case 'LOV':
      config.multipleFlag = multipleFlag;
      config.sourceCode = sourceCode;
      config.placeholder = placeholder;
      break;
    case 'CHECKBOX':
    case 'SWITCH':
      break;
    case 'INPUT':
      config.textMaxLength = textMaxLength;
      config.textMinLength = textMinLength;
      config.placeholder = placeholder;
      break;
    case 'CURRENCY':
    case 'INPUT_NUMBER':
      config.numberMax = numberMax;
      config.numberMin = numberMin;
      config.numberDecimal = numberDecimal;
      config.placeholder = placeholder;
      config.allowThousandth = allowThousandth;
      break;
    case 'DATE_PICKER':
      config.dateFormat = dateFormat;
      config.placeholder = placeholder;
      config.includeNowDayFlag = includeNowDayFlag;
      break;
    case 'TEXT_AREA':
      config.textMaxLength = textMaxLength;
      config.textMinLength = textMinLength;
      config.textAreaMaxLine = textAreaMaxLine;
      config.placeholder = placeholder;
      break;
    case 'UPLOAD':
      config.bucketDirectory = bucketDirectory;
      config.bucketName = bucketName;
      config.attachmentTemplate = attachmentTemplate;
      config.uploadShowFlag = uploadShowFlag;
      config.defaultValue = undefined;
      break;
    case 'LINK':
      config.bucketDirectory = bucketDirectory;
      config.bucketName = bucketName;
      config.attachmentTemplate = attachmentTemplate;
      config.linkHref = linkHref;
      config.linkTitle = linkTitle;
      config.linkNewWindow = linkNewWindow;
      config.linkType = linkType;
      config.modalWidth = modalWidth;
      break;
    default:
      config.defaultValue = undefined;
  }
  return config;
}
