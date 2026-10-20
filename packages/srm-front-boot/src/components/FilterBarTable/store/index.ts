import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import { MergeFieldName } from '../util';

export const SearchInputDS = (fieldProps) =>
  ({
    fields: [
      {
        name: MergeFieldName,
        type: FieldType.string,
        ...fieldProps,
      },
    ],
  } as DataSetProps);
