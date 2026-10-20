/*
 * @Date: 2024-08-02 09:11:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM, PRIVATE_BUCKET } from '_utils/config';
import { bucketDirectory } from '@/routes/utils/utils';

const tenantId = getCurrentOrganizationId();

// 主要产品list ds
export const productIntroduceDS = () => ({
  paging: false,
  fields: [
    {
      name: 'productName',
      required: true,
      label: intl.get('sslm.common.model.field.productName').d('产品名称'),
    },
    {
      name: 'productPictureUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.memberSupplier,
      label: intl.get('sslm.common.model.field.productPicture').d('产品图片'),
    },
    {
      name: 'price',
      label: intl.get('sslm.common.model.field.priceInfo').d('价格信息'),
    },
    {
      name: 'productIntro',
      required: true,
      label: intl.get('sslm.common.model.field.productIntroduce').d('产品简介'),
    },
    {
      name: 'authAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.memberSupplier,
      label: intl.get('sslm.common.model.field.aptitudeDoc').d('资质文件'),
    },
    {
      name: 'displayPage',
      required: true,
      multiple: ',',
      lookupCode: 'SPFM_MEMBER_PRODUCT_DISPLAY_PAGE',
      label: intl.get('sslm.common.model.field.displayArea').d('展示区域'),
      help: intl
        .get('sslm.memberExpansion.model.productIntroduce.displayAreaMsg')
        .d(
          '选择后，产品将分别展示在未合作采购方的“发现供应商”页面和已合作采购方的“供应商360查询”页面中'
        ),
    },
  ],
  transport: {
    destroy: {
      url: `${SRM_PLATFORM}/v1/${tenantId}/company-member-main-products/batch-delete`,
      method: 'DELETE',
    },
  },
});

// 主要产品卡片form ds
export const productIntroduceFormDS = () => ({
  fields: [
    {
      name: 'productPictureUuid',
    },
    {
      name: 'productName',
    },
    {
      name: 'price',
    },
    {
      name: 'productIntro',
      label: intl.get('sslm.common.model.field.productIntroduce').d('产品简介'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.fieldCode').d('公司'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('sslm.common.view.companyInfo.registerDate').d('成立日期'),
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'industryNames',
      label: intl.get('sslm.common.model.field.relatedIndustry').d('所处行业'),
    },
    {
      name: 'industryCategoryNames',
      label: intl.get('sslm.common.model.field.mainCategories').d('主营品类'),
    },
  ],
});
