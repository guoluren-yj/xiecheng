/*
 * @Date: 2023-07-31 17:20:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getTemplateCopyDs = ({ evalTplId }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'evalTplCode',
      required: true,
      pattern: /^[0-9A-Za-z-_]*$/,
      label: intl
        .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode`)
        .d('评分模板编码'),
    },
    {
      name: 'evalTplName',
      required: true,
      label: intl
        .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc`)
        .d('评分模板名称'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/copy`,
        method: 'POST',
        data: {
          evalTplId,
          ...(data && data[0]),
        },
      };
    },
  },
});
