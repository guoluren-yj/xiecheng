import type { ListProps } from 'choerodon-ui/lib/list';
import C7NPaginationProps from '../pagination/overwriteProps';

const C7NListProps: Partial<ListProps> = {
  prefixCls: 'ant-list',
  rowPrefixCls: 'ant-row',
  spinPrefixCls: 'ant-spin',
  paginationProps: C7NPaginationProps,
};

export default C7NListProps;
