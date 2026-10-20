import React, { PureComponent } from "react";
import intl from 'hzero-front/lib/utils/intl';
import { Form, DataSet, CheckBox, Select, Lov, TextField, IntlField } from "choerodon-ui/pro";
import { DataSetProps } from "choerodon-ui/pro/lib/data-set/DataSet";
import { FieldType } from "choerodon-ui/pro/lib/data-set/enum";
import { LabelLayout } from "choerodon-ui/pro/lib/form/enum";
import styles from "./modal.less";

declare module "react" {
  // eslint-disable-next-line no-unused-vars
  interface HTMLAttributes<T> {
    newLine?: boolean;
  }

}

function dsConfig(): DataSetProps {
  return {
    fields: [
      {
        name: "isModelField",
        type: FieldType.number,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: "defaultActive",
        label: intl.get('hpfm.customize.common.defaultExpand').d('默认展开'),
        lookupCode: "HPFM.CUST.UNIT_COND_OPTIONS",
      },
      {
        name: "modelId",
        label: intl
        .get('hpfm.individuationUnit.model.individuationUnit.modelName')
        .d('所属模型'),
      },
      {
        name: "fieldId",
        label: "字段编码",
      },
      {
        name: "fieldCodeAlias",
        label: "编码别名",
      },
      {
        name: "fieldName",
        label: "字段名称",
      },
      {
        name: "formRow",
        label: "行",
      },
      {
        name: "formCol",
        label: "列",
      },
      {
        name: "rowSpan",
        label: "跨行",
      },
      {
        name: "colSpan",
        label: "跨列",
      },
      {
        name: "widgetType",
        label: "组件类型",
      },
    ],
  };
}

export default class extends PureComponent<any, any> {
  formDs = new DataSet(dsConfig());

  render() {
    const {
      props: {
        isCreate,
      },
    } = this;
    return (
      <div className={styles["modal-content"]}>
        <FirstCard title="字段基本属性">
          <Form dataSet={this.formDs} columns={3} labelLayout={LabelLayout.float}>
            <div newLine>
              <CheckBox name="isModelField" hidden={isCreate}>{intl.get('hpfm.individuationUnit.model.individuationUnit.isModelField').d('创建模型字段')}</CheckBox>
              <CheckBox name="isModelField" hidden={isCreate}>{intl.get('hpfm.individuationUnit.model.individuationUnit.isModelField').d('创建模型字段')}</CheckBox>
            </div>
            <span />
            <span />
            <Select name="modelId" />
            <Lov name="fieldId" />
            <TextField name="fieldCodeAlias" />
            <IntlField name="fieldName" />
          </Form>
        </FirstCard>
        <FirstCard title="UI属性">
          <SecondCard title="UI基本配置">
            <Form dataSet={this.formDs} columns={12} labelLayout={LabelLayout.float}>
              <Select name="defaultActive" colSpan={12} />
              <TextField name="formRow" colSpan={6} />
              <TextField name="formCol" colSpan={6} />
              <TextField name="rowSpan" colSpan={6} />
              <TextField name="colSpan" colSpan={6} />
            </Form>
          </SecondCard>
          <SecondCard title="UI组件配置">
            <Form dataSet={this.formDs} columns={12} labelLayout={LabelLayout.float}>
              <Select name="widgetType" colSpan={12} />
            </Form>
          </SecondCard>
        </FirstCard>
      </div>
    );
  }
}
class FirstCard extends PureComponent<any, any> {
  render(){
    const { children, title} = this.props;
    return (
      <div className="first-card">
        <header className="first-title" newLine>{title}</header>
        {children}
      </div>
    );
  }
}
class SecondCard extends PureComponent<any, any> {
  render(){
    const { children, title} = this.props;
    return (
      <div className="second-card">
        <header className="second-title" newLine>{title}</header>
        {children}
      </div>
    );
  }
}