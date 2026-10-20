import type { CSSProperties, ReactNode } from "react";
import React, { Children, Component, cloneElement } from "react";
import { isNil, isArray } from "lodash";
import classnames from 'classnames';
import type DataSet from "choerodon-ui/dataset/data-set";
import { observer } from "mobx-react";
import { Icon, Tooltip, OverflowTip } from "choerodon-ui/pro";
import { Popover } from "choerodon-ui";
import intl from "hzero-front/lib/utils/intl";
import { isMoment } from 'moment';
import { Utils } from "choerodon-ui/dataset";

function renderTitle(props) {
  if (props) {
    const { trigger } = props;
    if (trigger) {
      return Children.map(trigger, (item) => cloneElement<any>(item, { ref: null, className: 'af-extra-container tooltip-wrap', style: { fontSize: "unset" } }));
    }
  }
}

const helpNodeStyle = {
  display: 'inline',
  pointerEvents: 'auto',
  position: 'relative',
  color: 'rgba(0, 0, 0, 0.45)',
  fontSize: '14px',
  verticalAlign: 'top',
  marginLeft: "-14px",
  lineHeight: '18px',
};

type RenderConfig = {
  icon?: ReactNode;
  helpNode?: ReactNode;
  label?: string;
  aggregationLabel?: ReactNode[];
  value?: any;
  aggregationValue?: ReactNode[];
  aggregationFieldsConfig?: RenderConfig[];
}

@observer
export default class AFExtra extends Component<{
  dataSet: DataSet;
  fieldsConfig?: {
    [x: string]: {
      help?: ReactNode;
      label?: string;
      hidden?: boolean;
      aggregation?: boolean;
      aggregationFields?: string[];
      aggregationTitleRender?: ({ record, name, dataSet, node }) => ReactNode;
      aggregationValueRender?: ({ record, name, dataSet, node }) => ReactNode;
      renderTitle?: ({ record, name, value, dataSet }, { label }) => ReactNode;
      renderValue?: ({ record, name, value, dataSet }) => ReactNode;
      renderIcon?: ({ record, name, value, dataSet }) => ReactNode;
      // 卡片基础宽度倍率
      widthRatio?: '1x' | '2x' | '3x' | '4x'
    }
  };
  fields?: string[];
  underLabel?: boolean;
  cardMaxCount?: number;
}> {

  commonFieldProcess = (name?: string, config = {} as any): RenderConfig | false => {
    if (!name || config.hidden) return false;
    const { dataSet } = this.props;
    let value = dataSet.current && dataSet.current.get(name);
    let fieldLabel = "";
    const {
      label, help,
      renderTitle = undefined, renderValue = undefined, aggregationFields = [],
      aggregation = false, renderIcon = undefined,
    } = config;
    const renderConfig: any = { icon: null, help };
    const field = dataSet.getField(name);
    let multiple;
    let valueField;
    let textField;
    let lovCode;
    let lookupCode;
    const record = dataSet.current;
    if (field) {
      multiple = field.get('multiple', record);
      valueField = field.get('valueField', record) || '__notconfig__';
      textField = field.get('textField', record) || '__notconfig__';
      fieldLabel = field.get("label", record);
      lovCode = field.get('lovCode', record);
      lookupCode = field.get('lookupCode', record);
    }
    renderConfig.label = label || fieldLabel;
    if (help) {
      renderConfig.helpNode = (
        <Tooltip title={help}>
          <Icon type="help" style={helpNodeStyle as CSSProperties} />
        </Tooltip>
      );
    }
    const renderProps = {
      record: dataSet.current,
      name, value,
      dataSet,
      aggregation,
      aggregationFields,
    };
    if (renderTitle) renderConfig.label = renderTitle(renderProps, { label });
    if (renderValue) renderConfig.value = renderValue(renderProps);
    else {
      if (typeof value === 'object') {
        if (value.toJS) {
          value = value.toJS();
        }
        if (isMoment(value)) {
          if (value.isValid()) {
            value = value.format(Utils.getDateFormatByField(field, (field && field.get('type', dataSet.current)) || "string", dataSet.current));
          } else value = '';
        } else if (multiple) {
          // 处理lov和下拉框多选
          if (isArray(value)) {
            const delimiter = ["boolean", "number"].includes(typeof multiple) ? "," : multiple;
            if (lookupCode) {
              // 下拉框多选
              value = value.map(subValue => {
                if (field) {
                  return field.getText(subValue, true, dataSet.current);
                }
                return String(subValue);
              }).join(delimiter);
            } else {
              // lov多选
              value = value
              .map(i => (i && typeof i === 'object' ? String(i[textField] || i[valueField] || '') : String(i)))
              .join(delimiter);
            }
          } else {
            value = JSON.stringify(value);
          }
        } else if (lovCode) {
          // 处理lov单选
          value = !isNil(value) ? value[textField] || value[valueField] : value = JSON.stringify(value);
        } else {
          value = JSON.stringify(value);
        }
      } else if (lookupCode) {
        // 下拉框处理
        if (field) {
          value = field.getText(value, true, dataSet.current);
        }
      }
      renderConfig.value = value;
    }
    if (renderIcon) renderConfig.icon = renderIcon(renderProps);
    return renderConfig;
  }

  aggregationFieldsProcess = (name: string): RenderConfig | false => {
    const fieldsConfig = this.props.fieldsConfig || {};
    const fieldConfig = fieldsConfig[name] || {};
    const { aggregationFields = [] } = fieldConfig;
    const renderConfig = this.commonFieldProcess(name, fieldConfig);
    if (!renderConfig) return false;
    renderConfig.aggregationFieldsConfig = aggregationFields.map(fieldName => this.commonFieldProcess(fieldName, { ...fieldsConfig[fieldName] })).filter(Boolean) as RenderConfig[];

    return renderConfig;
  }

  fieldRender = (name: string, config) => {
    const renderConfig = this.commonFieldProcess(name, config) || {};
    const fieldNodes = [
      <div className={classnames({ "af-extra-field-label": true, "field-has-help": renderConfig.helpNode })}>
        <OverflowTip title={renderTitle}>
          <div>
            {isNil(renderConfig.label) ? "-" : renderConfig.label}
          </div>
        </OverflowTip>
        {renderConfig.helpNode}
      </div>,
      <div className={classnames({ "af-extra-field-value": true })}>
        <OverflowTip title={renderTitle}>
          <div>
            {isNil(renderConfig.value) ? "-" : renderConfig.value}
          </div>
        </OverflowTip>
      </div>];
    return (
      <div className="af-extra-field" data-name={name} data-width-ratio={config.widthRatio || '1x'}>
        {this.props.underLabel ? fieldNodes.reverse() : fieldNodes}
        <div className="af-extra-field-icon">
          {renderConfig.icon}
        </div>
      </div>
    );
  }

  fieldsRender = (name: string, config) => {
    const { aggregationTitleRender, aggregationValueRender } = config;
    const { aggregationFieldsConfig = [], ...renderConfig } = this.aggregationFieldsProcess(name) || {};
    const firstShowFields = aggregationFieldsConfig.slice(0, 3);
    let moreFieldsIcon: ReactNode = null;
    if (aggregationFieldsConfig.length > 3) {
      moreFieldsIcon = this.renderGroupMoreFields(aggregationFieldsConfig.slice(3));
    }
    const renderProps = {
      record: this.props.dataSet.current,
      name,
      dataSet: this.props.dataSet,
    };
    let fieldsLabelNode: ReactNode[] = firstShowFields.map(config => (
      <span className="af-extra-fields-label-wrap">
        {isNil(config.label) ? "-" : config.label}
        {config.helpNode}
      </span>
    ));
    if (!fieldsLabelNode.length) fieldsLabelNode = ["-"];
    if (aggregationTitleRender) fieldsLabelNode = [aggregationTitleRender({ ...renderProps, node: <>{fieldsLabelNode}</> })];
    let fieldsValueNode: ReactNode[] = firstShowFields.map(config => (
      <span className="af-extra-fields-value-wrap">
        {isNil(config.value) ? "-" : config.value}
      </span>
    ));
    if (!fieldsValueNode.length) fieldsValueNode = ["-"];
    if (aggregationValueRender) fieldsValueNode = [aggregationValueRender({ ...renderProps, node: <>{fieldsValueNode}</> })];
    const fieldsNodes = [
      <div className={classnames({ "af-extra-fields-label": true, "field-has-help": renderConfig.helpNode })}>
        <OverflowTip title={renderTitle}>
          <div>
            {fieldsLabelNode}
          </div>
        </OverflowTip>
        {renderConfig.helpNode}
      </div>,
      <div className={classnames({ "af-extra-fields-value": true, "field-has-more": !!moreFieldsIcon })}>
        <OverflowTip title={renderTitle}>
          <div>
            {fieldsValueNode}
          </div>
        </OverflowTip>
        {moreFieldsIcon}
      </div>];
    return (
      <div className="af-extra-fields" data-name={name} data-width-ratio={config.widthRatio || '1x'}>
        {this.props.underLabel ? fieldsNodes.reverse() : fieldsNodes}
        <div className="af-extra-field-icon">
          {renderConfig.icon}
        </div>
      </div>
    );
  }

  renderGroupMoreFields(renderConfigs: RenderConfig[]) {
    return (
      <Popover
        trigger="click"
        placement="bottom"
        content={() => (
          <div className="af-extra-fields-more-content">
            {renderConfigs.map(config => (
              <span className="af-extra-more-field">
                <span className="label">{config.label || "-"}</span>
                {isNil(config.value) ? "-" : config.value}
                {config.helpNode}
              </span>
            ))}
          </div>
        )}
      >
        <span className="af-extra-more">
          <Tooltip title={intl.get("hzero.common.button.more")} placement="top">
            <Icon type="manage_search" />
          </Tooltip>
        </span>
      </Popover>
    );
  }

  renderOverNumField(fields: string[]) {
    if (!fields || !fields.length) return null;
    return (
      <Popover
        trigger="click"
        placement="bottomLeft"
        content={() => (
          <div className="af-extra-fields-more-content">
            {fields.map(field => {
              let config: RenderConfig;
              const fieldsConfig = this.props.fieldsConfig || {};
              if (fieldsConfig[field] && fieldsConfig[field].aggregation) {
                config = this.aggregationFieldsProcess(field) || {};
                return (
                  <span className="af-extra-more-field">
                    {(config.aggregationFieldsConfig || []).map(rConfig => {
                      return (
                        <div className="more-aggregation-field">
                          <div className={classnames({ "more-aggregation-field-label": true, "field-has-help": rConfig.helpNode })}>
                            <OverflowTip title={renderTitle}>
                              <div>
                                {isNil(rConfig.label) ? "-" : rConfig.label}
                              </div>
                            </OverflowTip>
                            {rConfig.helpNode}
                          </div>
                          <div className="more-aggregation-field-value">
                            <OverflowTip title={renderTitle}>
                              <div>
                                {isNil(rConfig.value) ? "-" : rConfig.value}
                              </div>
                            </OverflowTip>
                          </div>
                        </div>
                      );
                    })}
                  </span>
                );
              }
              config = this.commonFieldProcess(field, fieldsConfig[field]) || {};
              return (
                <span className="af-extra-more-field">
                  <span className="label">{config.label || "-"}</span>
                  {isNil(config.value) ? "-" : config.value}
                  {config.helpNode}
                </span>
              );
            })}
          </div>
        )}
      >
        <div className="af-extra-more-card af-extra-field">
          <Tooltip title={intl.get("hzero.common.button.more")} placement="top">
            <Icon type="more_horiz" />
          </Tooltip>
        </div>
      </Popover>
    );
  }

  render() {
    const { fields = [], fieldsConfig } = this.props;
    let realShowFields = fields.map(field => filterHiddenField(field, (fieldsConfig || {})[field || ""])).filter(Boolean);
    let lastField: ReactNode = null;
    let { cardMaxCount } = this.props;
    if (!cardMaxCount) cardMaxCount = 4;
    if (realShowFields.length > cardMaxCount) {
      lastField = this.renderOverNumField(realShowFields.slice(cardMaxCount));
      realShowFields = realShowFields.slice(0, cardMaxCount);
    }
    return (
      <div className="af-extra-container">
        {realShowFields.map(field => {
          const { fieldsConfig } = this.props;
          const customizeConfig = (fieldsConfig || {})[field || ""];
          const config = { ...customizeConfig };
          if (config.aggregation) return this.fieldsRender(field, config);
            return this.fieldRender(field, config);
        })}
        {lastField}
      </div>
    );
  }
}

function filterHiddenField(name, config) {
  if (!name || config && config.hidden) return null;
  return name;
}