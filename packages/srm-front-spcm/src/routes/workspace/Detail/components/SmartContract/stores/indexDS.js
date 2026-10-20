/**
 * 摘要
 * @Author: CDJ
 * @Date: 2025-09-44
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

import { hanldeDeltaToHtml, hanldeMdToHtml, isHtmlStr } from '../utils/utils';

const organizationId = getCurrentOrganizationId();

export const getIndexDs = ({ pcHeaderId, isEdit = true } = {}) => ({
  selection: false,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'contractAbstract',
      type: 'object',
      required: isEdit,
      disabled: !isEdit,
    },
    {
      name: 'abstractDate',
      type: 'string',
      label: intl.get('spcm.common.view.title.generationTime').d('生成时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/smart-contract-task/poll/abstract`,
        method: 'GET',
        params: { pcHeaderId },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        let contractAbstract = record.get('contractAbstract');
        if (contractAbstract) {
          try {
            const validateFlag = isHtmlStr(contractAbstract);
            if (!validateFlag) {
              // 如果格式是md格式，需要转成html格式
              const formatMdResult = hanldeMdToHtml(contractAbstract);
              // 转化成功无需再次转化
              if (formatMdResult) {
                contractAbstract = formatMdResult;
              } else if (formatMdResult === false) {
                // 如果是delta格式这转成html格式，这个是兜底转化，正常不会是delta格式，保存的时候已经转化成html格式了
                const formatDeltaResult = hanldeDeltaToHtml(contractAbstract);
                contractAbstract =
                  formatDeltaResult === false ? contractAbstract : formatDeltaResult;
              }
            }
          } catch (error) {
            // console.log("delta格式错误", error);
          }
          record.set({
            contractAbstract,
          });
        }
      });
    },
  },
});
