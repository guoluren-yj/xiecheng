/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

export const ReportDs = ({ type, standardFlag, customizeUnitCodes }) => {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.supplierPerformance.model.evalDimensionMeaning').d('考评维度'),
        name: 'evalDimensionMeaning',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.evalDimensionCode').d('考评维度编码'),
        name: 'evalDimensionCode',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.evalDimensionName').d('考评维度值'),
        name: 'evalDimensionName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.suplierNum').d('供应商编码'),
        name: 'suplierNum',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.supplierName').d('考评供应商'),
        name: 'supplierName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.categoryCode').d('品类编码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.categoryName').d('考评品类'),
        name: 'categoryName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.itemCode').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.itemName').d('考评物料'),
        name: 'itemName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.supplierCompanyCategory').d('供应商分类'),
        name: 'supplierCompanyCategory',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.evalDateYear').d('年份'),
        name: 'evalDateYear',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.unitName').d('部门'),
        name: 'unitName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m1').d('1月'),
        name: 'm1',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m2').d('2月'),
        name: 'm2',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m3').d('3月'),
        name: 'm3',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m4').d('4月'),
        name: 'm4',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m5').d('5月'),
        name: 'm5',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m6').d('6月'),
        name: 'm6',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m7').d('7月'),
        name: 'm7',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m8').d('8月'),
        name: 'm8',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m9').d('9月'),
        name: 'm9',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m10').d('10月'),
        name: 'm10',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m11').d('11月'),
        name: 'm11',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.m12').d('12月'),
        name: 'm12',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.q1').d('1季度'),
        name: 'q3',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.q2').d('2季度'),
        name: 'q6',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.q3').d('3季度'),
        name: 'q9',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.q4').d('4季度'),
        name: 'q12',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.firstYear').d('上半年'),
        name: 'hy6',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.lastYear').d('下半年'),
        name: 'hy12',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.wholeYear').d('全年'),
        name: 'y12',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${organizationId}/supplier/report/performance`,
          method: 'GET',
          params: {
            ...params,
            selectType: type,
            standardFlag,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
};

export const ReportDetailDs = ({ data, type, monthOrQuarter }) => {
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    idField: 'id',
    parentField: 'parentId',
    fields: [
      {
        label: intl.get('sdrp.supplierPerformance.model.indicatorCode').d('指标编码'),
        name: 'indicatorCode',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.indicatorName').d('指标描述'),
        name: 'indicatorName',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.evalWeightScore').d('权重'),
        name: 'evalWeight',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.finalScore').d('指标得分'),
        name: 'finalScore',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.avgScore').d('同维度指标平均得分'),
        name: 'avgScore',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.diffScore').d('与平均值的分差'),
        name: 'diffScore',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.maxScore').d('同维度指标最高分'),
        name: 'maxScore',
      },
      {
        label: intl.get('sdrp.supplierPerformance.model.minScore').d('同维度指标最低分'),
        name: 'minScore',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${organizationId}/supplier/report/performance/detail`,
          method: 'GET',
          params: {
            ...params,
            selectType: type,
            monthOrQuarter,
            standardFlag: false,
            evalLineId: data[`evalLineId${monthOrQuarter}`],
          },
        };
      },
    },
    feedback: {
      loadSuccess: (resp) => {
        resp.content = resp.detailInfoDTOList.map((item) => ({ ...item, title: resp.title }));
      },
    },
  };
};
