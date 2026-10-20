import React, { CSSProperties, useRef } from 'react';
import { Pagination, Icon } from 'choerodon-ui/pro';
import { SizeChangerPosition } from 'choerodon-ui/pro/lib/pagination/enum';

import styles from './index.less';

function pagerRenderer(page, type) {
  switch (type) {
    case 'first':
      return (
        <span style={{ display: 'none' }}>
          <Icon type="fast_rewind" />
        </span>
      );
    case 'last':
      return (
        <span style={{ display: 'none' }}>
          <Icon type="fast_forward" />
        </span>
      );
    case 'prev':
      return <Icon type="navigate_before" />;
    case 'next':
      return <Icon type="navigate_next" />;
    case 'jump-prev':
    case 'jump-next':
      return '•••';
    default:
      return page;
  }
}

interface ISmallPagination {
  pageObj?: { page: number; pageSize: number; total: number }; // 默认分页大小
  total?: number; // 分页总数
  showSizeChanger?: boolean; // 显示分页大小显示器
  showSizeChangerLabel?: boolean; // 显示分页大小显示器Label
  showTotal?: boolean; // 显示总分页数
  showPager?: boolean; // 显示数字分页
  showQuickJumper?: boolean; // 快速跳转分页功能
  onChange?: (page: number, pageSize: number) => void; // 分页选择器onChange事件
  sizeChangerPosition?: SizeChangerPosition; // 分页总数显示位置 左|右
  style?: CSSProperties; // 内链样式
  className?: string;
}

export default function SmallPagination({
  pageObj = { page: 1, pageSize: 10, total: 0 }, // 默认分页大小
  showSizeChanger = true, // 显示分页大小显示器
  showSizeChangerLabel = false, // 显示分页大小显示器Label
  showTotal = true, // 显示总分页数
  showPager = false, // 显示数字分页
  showQuickJumper = false, // 快速跳转分页功能
  onChange = () => {}, // 分页选择器onChange事件
  sizeChangerPosition = SizeChangerPosition.left, // 分页总数显示位置 左|右
  style = {},
  className = '',
}: ISmallPagination) {
  const catchSize: any = useRef(); // 缓存的size

  // size change后重置分页未第一页
  const handleChange = (page, size) => {
    if (catchSize.current && catchSize?.current !== size) {
      onChange(1, size);
    } else {
      onChange(page, size);
    }
    catchSize.current = size;
  };

  return (
    <div className={styles['page-wrapper']}>
      <Pagination
        showSizeChanger={showSizeChanger}
        showSizeChangerLabel={showSizeChangerLabel}
        showTotal={showTotal}
        showPager={showPager}
        showQuickJumper={showQuickJumper}
        sizeChangerPosition={sizeChangerPosition}
        // pageSizeOptions={['10', '20', '50', '100']}
        sizeChangerOptionRenderer={({ text }) => `${text}条/页`}
        itemRender={pagerRenderer}
        total={pageObj.total}
        // pageSize={pageObj.pageSize}
        pageSize={pageObj.pageSize}
        page={pageObj.page}
        onChange={handleChange}
        style={style}
        className={className}
      />
    </div>
  );
}
