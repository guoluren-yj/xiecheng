/**
 * @文件描述 海量报表编辑行Ds
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/01/25
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';
import { SRM_SDRP } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const detailDs: () => DataSetProps = () => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      name: 'prLineId',
      type: FieldType.number,
    },
    {
      name: 'rfxLineItemId',
      type: FieldType.number,
    },
    {
      name: 'pcSubjectId',
      type: FieldType.number,
    },
    {
      name: 'poLineLocationId',
      type: FieldType.number,
    },
    {
      name: 'agreeFlag',
      label: intl.get('spfm.sdrp.hl.reportEdit.model.agreeFlag').d('事业部是否同意最终承诺日期'),
      type: FieldType.string,
      lookupCode: 'HPFM.FLAG',
    },
    { name: 'agreeFlagMeaning', ignore: FieldIgnore.always },
    {
      name: 'incompleteReason',
      label: intl.get('spfm.sdrp.hl.reportEdit.model.incompleteReason').d('未完成原因大类'),
      type: FieldType.string,
      lookupCode: 'SCUX.HLGF_WWCDL',
    },
    { name: 'incompleteReasonMeaning', ignore: FieldIgnore.always },
    {
      name: 'remark',
      label: intl.get('spfm.sdrp.hl.reportEdit.model.remark').d('未到货备注（最新情况）'),
      type: FieldType.string,
    },
    {
      name: 'expectedDeliveryDate',
      label: intl
        .get('spfm.sdrp.hl.reportEdit.model.expectedDeliveryDate')
        .d('预计到货日期（修正）'),
      type: FieldType.date,
    },
  ],
  transport: {
    read() {
      return {
        url: `${SRM_SDRP}/v1/${organizationId}/full-link/report/full-link/save-query`,
        method: 'post',
      };
    },
    update({ data }) {
      return {
        url: `${SRM_SDRP}/v1/${organizationId}/full-link/report/full-link/save`,
        method: 'post',
        data: data[0],
      };
    },
  },
});

export { detailDs };
