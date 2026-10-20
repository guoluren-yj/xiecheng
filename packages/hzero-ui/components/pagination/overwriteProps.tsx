import noop from 'lodash/noop';
import type { PaginationProps } from 'choerodon-ui/lib/pagination';
import C7NSelectProps from '../select/overwriteProps';


function defaultItemRender(_page, _type, element) {
  return element;
}

const C7NPaginationProps: PaginationProps = {
  prefixCls: 'ant-pagination',
  selectProps: C7NSelectProps,
  showSizeChanger: false,
  showSizeChangerLabel: false,
  sizeChangerOptionText: false,
  tiny: false,
  showTotal: false,
  itemRender: defaultItemRender,
  renderJumper: noop,
};

export default C7NPaginationProps;
