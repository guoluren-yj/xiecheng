import { DataSet } from 'choerodon-ui/pro';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import intl from '../../../utils/intl';
import { MergeFieldName } from '../util';

export const FilterMenuDS = () =>
  ({
    autoCreate: true,
    fields: [
      {
        name: 'filterCode',
        textField: 'filterName',
        valueField: 'filterCode',
        options: new DataSet({
          selection: DataSetSelection.single,
        }),
      },
      {
        name: 'filterName',
        type: FieldType.intl,
        required: true,
        label: intl.get('srm.filterBar.view.title.filterName').d('筛选器名称'),
      },
    ],
  } as DataSetProps);

export const SearchInputDS = () =>
  ({
    fields: [
      {
        name: MergeFieldName,
        type: FieldType.string,
      },
    ],
  } as DataSetProps);
