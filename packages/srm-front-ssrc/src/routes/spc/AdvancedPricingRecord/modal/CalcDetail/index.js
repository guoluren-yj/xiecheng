import React, { useMemo, useState, useEffect } from 'react';
import {
  useDataSet,
  Form,
  Output,
  Table,
  Spin,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isObject, isNil, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { FormulaRender } from '@/routes/spc/FormulaManage/utils';
import { renderFieldType } from '@/routes/spc/BomViewWorkbench/utils';
import { BusinessObject } from '@/routes/spc/BomDimConfig/enum';
import { fetchBomLibHeaderConfig } from '@/services/bomViewWorkbenchService';
import { numberSeparatorRender } from '@/utils/renderer';
import { ViewLinkRender } from '../../utils';
import styles from '../index.less';
import { FormDS, TableDS } from './store';
import { LadderFormula } from '../index';

const amount1 = require('@/assets/advancedPricingRecord/amount1.svg');
const amount2 = require('@/assets/advancedPricingRecord/amount2.svg');
const amount3 = require('@/assets/advancedPricingRecord/amount3.svg');

const CardTitle = ({ title }) => (
  <h3 className={styles['card-sub-title']}>
    <div className={styles['card-sub-title-line']} />
    {title}
  </h3>
);

const Index = (props) => {
  const { record: propsRecord, isAdjust } = props;
  const recordLineId = propsRecord?.get('recordLineId');
  const formDs = useDataSet(() => FormDS(recordLineId, isAdjust), [recordLineId, isAdjust]);
  const tableDs = useDataSet(() => TableDS(recordLineId, isAdjust), [recordLineId, isAdjust]);
  // 主物料变量字段
  const [mainItemVarFields, setMainItemVarFields] = useState([]);
  // 下级物料列
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, [recordLineId]);

  const init = async () => {
    await formDs.query();
    Promise.all([tableDs.query(), handleFetchBomLibHeaderConfig()]).then(() => {
      setLoading(false);
    });
  };


  const handleFetchBomLibHeaderConfig = async () => {
    if (!formDs?.current) return <></>;
    const { bomTemplateId, bomTemplateCode } = formDs.current.toData();
    const res = await fetchBomLibHeaderConfig({ bomTemplateId, bomTemplateCode });
    if (getResponse(res)) {
      transformColumns(res);
    }
  };

  const extraFieldProps = (field) => {
    switch (field.bomDimensionCode) {
      case 'itemName':
        return { editor: false, bind: 'itemId.itemName' };
      default:
        break;
    }
  };

  const extraColumnProps = (field) => {
    const { bomDimensionWidget, bomDimensionCode } = field;
    if (bomDimensionWidget === 'LINK') {
      switch (bomDimensionCode) {
        case 'unitPrice':
          return {
            align: 'right',
            renderer: ({ value }) => value ? numberSeparatorRender(value) : '-',
          };
        default:
          return '-';
      }
    }
    if (bomDimensionWidget === 'CHECKBOX') {
      return {
        renderer: ({ value }) => isNil(value) ? '-' : yesOrNoRender(value),
      };
    }
  };

  const transformColumns = (data) => {
    const headerFields = [];
    const tableColumns = [];
    data.filter(item => Number(item.bomDimensionVisible)).forEach((item) => {
      const {
        bomDimensionCode,
        bomDimensionName,
        bomDimensionWidth,
        bomDimensionType,
        businessObject,
      } = item;
      // 头类型放入form表单中

      const dsFiedld = {
        name: bomDimensionCode,
        label: bomDimensionName,
        ...renderFieldType(item),
        ...extraFieldProps(item),
      };

      if (businessObject === BusinessObject.HEADER) {
        if (bomDimensionType !== 'EXPANSION') return;
        formDs.addField(bomDimensionCode, dsFiedld);
        headerFields.push({
          name: bomDimensionCode,
        });
      } else {
        // 默认放入表格中
        tableDs.addField(bomDimensionCode, dsFiedld);
        tableColumns.push({
          name: bomDimensionCode,
          width: bomDimensionWidth || 120,
          editor: false,
          ...extraColumnProps(item),
        });
      }
    });
    setMainItemVarFields(headerFields);
    setColumns(tableColumns);
  };

  const headerAmountField = [
    {
      label: intl.get(`spc.advancedPricingRecord.model.formulaPrice`).d('公式价格'),
      field: 'formulaPrice',
      imgSrc: amount1,
    },
    !isAdjust && {
      label: intl.get(`spc.advancedPricingRecord.model.cumulativePrice`).d('折扣累计值'),
      field: 'cumulativePrice',
      imgSrc: amount2,
    },
    !isAdjust && {
      label: intl.get(`spc.advancedPricingRecord.model.discountPrice`).d('折后价'),
      field: 'discountPrice',
      imgSrc: amount3,
    },
  ].filter(Boolean);

  const DetailHeader = observer(({ dataSet }) => {
    if (!dataSet?.current) return <></>;
    return (
      <>
        <div className={styles['calc-detail-header']}>
          {headerAmountField.map(({ label, field, imgSrc }) => (
            <div key={field} className={styles['header-item']}>
              <div className={styles['item-amount']}>
                <div>{label}</div>
                <div className={styles.amount}>
                  {dataSet.current.get(field) || '-'}
                </div>
              </div>
              <div className={styles['item-icon']}>
                <img alt={label} src={imgSrc} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  });

  const subCardList = useMemo(() =>
    [
      {
        key: 'basicInfos',
        title: intl.get('ssrc.common.view.message.basicInfos').d('基础信息'),
        fields: ['lineNum', ...isAdjust ? ['priceTemplateCode', 'priceLibCode'] : [], 'bomViewCode', 'bomViewVersion', 'masterItemCode', 'masterItemName', 'priceFormulaCode', 'priceFormulaVersion', ...!isAdjust ? ['discountRuleCode', 'discountRuleName', 'discountRuleVersion'] : []],
      },
      {
        key: 'pricingFormula',
        title: intl.get('spc.advancedPricingRecord.view.title.pricingFormula').d('计价公式'),
        fields: [
          {
            name: isAdjust ? 'operationalFormulaName' : 'operationalFormulaName',
            colSpan: 3,
            renderer: ({ value }) => FormulaRender(value),
          },
          isAdjust && {
            name: 'ladderFormula',
            renderer: ({ record }) => {
              const modalProps = {
                title: intl.get(`spc.advancedPricingRecord.model.ladderFormula`).d('阶梯公式'),
                width: '742px',
                children: <LadderFormula record={record} />,
              };
              return ViewLinkRender(modalProps);
            },
          },
        ],
      },
      !isEmpty(mainItemVarFields) && {
        key: 'mainItemVar',
        title: intl.get('spc.advancedPricingRecord.view.title.mainItemVar').d('主物料变量'),
        fields: mainItemVarFields,
      },
    ].filter(Boolean),
    [mainItemVarFields]
  );


  const SubCard = ({ title, fields }) => (
    <>
      <CardTitle title={title} />
      <Form
        dataSet={formDs}
        columns={3}
        labelLayout='vertical'
        className="c7n-pro-vertical-form-display"
      >
        {fields.filter(Boolean).map(field => {
          if (isObject(field)) {
            return <Output key={field.name} {...field} />;
          }
          return <Output key={field} name={field} />;
        }
        )}
      </Form>
    </>
  );

  return (
    <>
      <Spin spinning={loading}>
        <DetailHeader dataSet={formDs} />
        {
          subCardList.map((cardInfo) => (
            <SubCard key={cardInfo.key} {...cardInfo} />
          ))
        }
        <CardTitle title={intl.get('spc.advancedPricingRecord.view.title.childItemVar').d('下级物料变量')} />
        <Table
          customizable
          customizedCode={`SPC.ADVANCED_PRICING_RECORD.${isAdjust ? 'ADJUST' : 'ADVANCED'}_TAB.CAlC_DETAIL_TABLE`}
          dataSet={tableDs}
          columns={columns}
          style={{ maxHeight: 430 }}
        />
      </Spin>
    </>
  );
};

export default Index;
