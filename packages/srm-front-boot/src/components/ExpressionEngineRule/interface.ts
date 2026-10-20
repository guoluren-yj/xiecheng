/**
 * ExpressionEngine 表达式引擎规则定义文件
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */
import type { Record } from "choerodon-ui/dataset";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

export interface ExpressionEngineProps {
  queryId: string;
  title?: string;
  showTitle?: boolean;
  code: string;
  sceneCode: string;
  leftValueLovQueryPara: any;
  dataSource: any;
  leftValueCode?: string;
  dsConfigHook?: (config) => DataSetProps;
  rightValueParaHook?: (T: Record) => any;
  defaultDataChangeHook?: (any) => void;
  params?: any;
  sceneExecuteConfigHook?: (config: any) => any;
  defaultReturnHook?: (props: hookProps) => any;
  defaultRuleParamHook?: (props: hookProps) => any;
  returnRuleDsConfigHook?: (config: any) => any;
  returnRuleDataHook?: (props: hookProps) => any;
  returnRuleDsChangeHook?: (props: any) => any;
  returnRuleDataInitHook?: (props: any) => any;
  expressionFieldValueHook?: {
    [key: string]: (props: hookProps) => any;
  };
  beforeSave?: () => Promise<boolean>;
}

type hookProps = {
  param: any;
  config: any;
}

export type RenderComponentConfigType = {
  name: string;
  type: string;
  label: string;
  lovCode?: string;
  lookupCode?: string;
  displayField?: string;
  textField?: string;
  width?: number;
  valueField?; multiple?; lovParas?;
  dynamicProps?: any;
  component?: string;
}
