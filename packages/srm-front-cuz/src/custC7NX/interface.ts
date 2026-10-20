import { DataSet } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

export type ComponentGenProps = {
  name: string;
  label: string;
  record?: Record | null;
  dataSet?: DataSet;
  [x: string]: any;
};
