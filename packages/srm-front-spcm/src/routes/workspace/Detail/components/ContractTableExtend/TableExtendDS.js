/*
 * @Description: 自定义行表Dataset
 * @Date: 2024-03-05 16:27:40
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
// import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const TableExtendDS = (props) => {
  const { pcHeaderId, editable } = props;
  return {
    selection: editable && 'multiple',
    fields: [],
    primaryKey: 'pcTableExtendId',
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-table-extends/page/list`,
          method: 'GET',
          data: { ...queryParams, pcSourceId: pcHeaderId },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-table-extends/batch`,
          method: 'PUT',
          data,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-table-extends`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export default TableExtendDS;
