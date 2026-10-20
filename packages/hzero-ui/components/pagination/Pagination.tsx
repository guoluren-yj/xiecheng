import type { FunctionComponent } from 'react';
import React from 'react';
import type { PaginationConfig, PaginationLocale, PaginationProps } from 'choerodon-ui/lib/pagination/Pagination';
import C7NPagination from 'choerodon-ui/lib/pagination';
import C7NPaginationProps from './overwriteProps';

export type {
  PaginationProps, PaginationLocale, PaginationConfig,
};

const Pagination: FunctionComponent<PaginationProps> = function Pagination(props) {
  return <C7NPagination {...C7NPaginationProps} {...props} />;
};

export default Pagination;
