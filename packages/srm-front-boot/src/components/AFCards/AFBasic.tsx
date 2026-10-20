import type { CSSProperties, ReactNode } from "react";
import React, { Component } from "react";
import type DataSet from "choerodon-ui/dataset/data-set";
import { observer } from "mobx-react";
import { Icon, Tooltip } from "choerodon-ui/pro";
import { Popover } from "choerodon-ui";
import { isNil, isArray } from "lodash";
import intl from "hzero-front/lib/utils/intl";
import { isMoment } from 'moment';
import { Utils } from "choerodon-ui/dataset";

@observer
export default class AFBasic extends Component<{
  dataSet: DataSet;
  fieldsConfig?: {
    [x: string]: {
      useLabel?: boolean;
      help?: ReactNode;
      label?: string;
      separator?: string;
      hidden?: boolean;
      withoutBg?: boolean;
      render?: ({ record, name, value, dataSet }) => ReactNode;
    }
  };
  titleField?: string;
  tagFields?: string[];
  normalFields?: string[];
  maxTagCount?: number;
  /**
   * 右侧保留宽度值，用于渲染额外的组件
   * 格式为'25%', '300px'
   */
  contentRemainWidth?: string;
  contentRemainRender?: () => ReactNode;
  /**
   * 底部自定义渲染区域
   */
  contentBottomRender?: () => ReactNode;
}> {

  commonFieldRender = (name?: string, defaultConfig = {} as any) => {
    const { dataSet, fieldsConfig } = this.props;
    if (!name) return null;
    let fieldLabel = "";
    const customizeConfig = (fieldsConfig || {})[name];
    const {
      label = undefined,
      useLabel = true,
      separator = ":",
      render = undefined,
    } = { ...defaultConfig, ...customizeConfig };
    if (render) {
      return render({
        record: dataSet.current,
        name, value: dataSet.current && dataSet.current.get(name),
        dataSet,
      });
    }
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
    if (label) fieldLabel = label;
    let value = dataSet.current && dataSet.current.get(name);
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
    fieldLabel = isNil(fieldLabel) ? "-" : fieldLabel;
    value = isNil(value) ? "-" : value;
    return useLabel ? `${fieldLabel}${separator} ${value}` : value;
  }

  titleFieldRender = () => {
    const { titleField = '', fieldsConfig = {} } = this.props;
    if (fieldsConfig[titleField] && fieldsConfig[titleField].hidden) return null;
    return this.commonFieldRender(this.props.titleField, { useLabel: false });
  }

  tagFieldRender = (tagField: string, index: number) => {
    const { maxTagCount = 10, fieldsConfig = {} } = this.props;
    if (index >= maxTagCount || fieldsConfig[tagField] && fieldsConfig[tagField].hidden) return null;
    const classNames = ["tag-field"];
    if (fieldsConfig[tagField] && fieldsConfig[tagField].withoutBg) {
      classNames.push("without-bg");
    }
    return (
      <div className={classNames.join(" ")}>
        {this.commonFieldRender(tagField, { useLabel: false })}
      </div>
    );
  }

  normalFieldRender = (normalField: string) => {
    const { fieldsConfig = {} } = this.props;
    if (fieldsConfig[normalField] && fieldsConfig[normalField].hidden) return null;
    return (
      <div className="normal-field">
        {this.commonFieldRender(normalField, { useLabel: true })}
      </div>
    );
  }

  renderMoreTags = () => {
    const { maxTagCount = 10, tagFields = [] } = this.props;
    if (tagFields.length < maxTagCount) return null;
    const moreTags = tagFields.slice(maxTagCount).map((fieldName) => this.tagFieldRender(fieldName, 0)).filter(Boolean);
    if (moreTags.length === 0) return null;
    return (
      <Popover
        trigger="click"
        placement="bottom"
        content={(
          <div className="af-basic-tags-more-content">
            {moreTags}
          </div>
        )}
      >
        <span className="af-basic-tags-more">
          <Tooltip title={intl.get("hzero.common.button.more")} placement="top">
            <Icon type="more_vert" />
          </Tooltip>
        </span>
      </Popover>
    );
  }

  render() {
    const { tagFields = [], normalFields = [], contentRemainWidth, contentRemainRender, contentBottomRender } = this.props;
    const contentStyle: CSSProperties = {};
    let remainArea: ReactNode = null;
    let bottomRemainArea: ReactNode = null;
    if (contentRemainWidth) {
      contentStyle.marginRight = contentRemainWidth;
      remainArea = contentRemainRender ? (
        <div className="af-basic-remain-area" style={{ width: contentRemainWidth }}>
          {contentRemainRender()}
        </div>
      ) : null;
    }
    if (contentBottomRender) {
      bottomRemainArea = contentBottomRender();
    }
    return (
      <>
        <div className="af-basic-container">
          <div className="af-basic-row" style={contentStyle}>
            <div className="title-field">{this.titleFieldRender()}</div>
            <div className="tag-fields">
              {tagFields.map(this.tagFieldRender)}
              {this.renderMoreTags()}
            </div>
          </div>
          <div className="af-basic-row" style={contentStyle}>
            <div className="normal-fields">
              {normalFields.map(this.normalFieldRender)}
            </div>
          </div>
          {remainArea}
        </div>
        {bottomRemainArea && (<div className="af-basic-bottom-remain-area">{bottomRemainArea}</div>)}
      </>
    );
  }
}