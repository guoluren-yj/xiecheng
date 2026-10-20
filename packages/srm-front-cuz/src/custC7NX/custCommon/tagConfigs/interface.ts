import type { Cache } from "../../../Customize";
import type { CtxParams, FieldConfig, UnitAlias } from "../../../interfaces";
import type { Field } from "choerodon-ui/dataset";
import type DataSet from "choerodon-ui/dataset/data-set"
import type { FieldProps } from "choerodon-ui/dataset/data-set/Field";

export type TagConfig<T = any> = {
  /** dataSet实例的属性修改钩子 */
  dataSetProcess?: (dataSet: DataSet) => void;
  /** 个性化处理字段配置前的钩子，返回值作为初始字段配置 */
  fieldPreProcess?: (field: Field | void, fieldProps: FieldProps, fieldConfig: FieldConfig) => FieldProps;
  /** 个性化处理字段配置后的钩子，返回值作为最终字段配置 */
  fieldPostProcess?: (field: Field | void, fieldProps: FieldProps, fieldConfig: FieldConfig) => FieldProps;
  propsProcess: [
    string,
    (property: Pick<T, keyof T>, updateProps: Partial<T>, options: {
      initData: InitData, props: any,
      tools: { cache: { [code: string]: Cache }, code: string, ctxParams: CtxParams }
    }) => Pick<T, keyof T>,
    string
  ][];
}
export type InitData = {
  readOnly2?: boolean;
  /** 排序后的fields数组 */
  fields: FieldConfig[];
  fieldsMap: Map<string, FieldConfig>;
  reactionFields: string[];
  unitAlias: UnitAlias[];
  cardMaxCount?: number;
}