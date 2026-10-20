/**
 * ExpressionEngine 表达式引擎规则定义文件
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

export interface ExpressionEngineProps {
  queryId: string;
  title?: string;
  isShowTitle?: boolean;
  createButtonHook?: (config: any) => boolean;
  saveRuleHook?: (config: any) => boolean;
  defaultRetDsHook?: (cofnig: any) => any;
  returnRuleDsHook?: (cofnig: any) => any;
  afterSaveRuleHook?: (cofnig: any) => any;
  encryptBody?: boolean;
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
}
