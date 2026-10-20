import React from 'react';
import template from './utils/template';
import { getFieldValueObject } from './customizeTool';
import { Cache } from './Customize';

type ComputeOptions = {
  relatedList?: any[];
  cache: { [k: string]: Cache };
  code: string;
  ctxParams: any;
  rowKey?: string | number;
  namespace?: string;
};

export function getComputeComp(renderRule: string, options: ComputeOptions) {
  const unitData = getFieldValueObject(options as any);
  return <span dangerouslySetInnerHTML={{ __html: template.render(renderRule, unitData, options.rowKey) }} />;
}
