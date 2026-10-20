import React, {
  useState,
  useEffect,
  useImperativeHandle,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Form, Button, Lov, Table, TextField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

import intl from 'utils/intl';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import { saveTargetPriceTemplate, queryParamsAll } from '@/services/priceModelService';

import { codeTransfer } from '../../../utils/utils';
import dynamicRender, { ComponentNames } from '../../../utils/dynamic-render';
import Store from '../store/index';
import style from '../common.less';

const CountFormula = () => {
  const {
    commonRef: { countFormulaRef },
    commonDs: { headerDs, priceLibTableDs },
    routerParams: { modelId },
  } = useContext(Store);

  const calculateFormulaRef = useRef();
  const [paramList, setParamList] = useState([]);

  useImperativeHandle(countFormulaRef, () => ({
    fetchParamsAll,
  }));

  const fetchParamsAll = useCallback(() => {
    queryParamsAll({ modelId }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setParamList(result);
      }
    });
  }, []);

  useEffect(() => {
    fetchParamsAll();
  }, []);

  // 设置计算公式显示文本
  const handleClick = useCallback(
    (item) => {
      if (!headerDs.current) return;
      let oldValue = headerDs.current.get('calculateFormula') || '';
      const start = calculateFormulaRef.current?.element?.selectionStart;
      const end = calculateFormulaRef.current?.element?.selectionEnd;
      oldValue = oldValue?.split('');
      oldValue.splice(start, end - start, `\${${item?.value}}`);
      const newValue = oldValue.join('');
      headerDs.current.set('calculateFormula', newValue);
    },
    [headerDs]
  );

  // 计算公式预览
  const calculateFormulaPreview = useCallback(() => {
    if (!headerDs.current) return;
    const calculateFormula = headerDs.current.get('calculateFormula') || '';
    return codeTransfer(calculateFormula, paramList);
  }, [paramList]);

  // 改变模板，将模板的默认值赋值到规则板块上
  const changeTargetPriceTemplate = useCallback(
    (value = {}) => {
      if (value) {
        const objectVersionNumber = headerDs.current?.get?.('objectVersionNumber');
        const params = {
          ...(value || {}),
          modelId,
          targetPriceTemplateCode: value?.templateCode,
          objectVersionNumber,
        };
        return saveTargetPriceTemplate(params).then((res) => {
          const result = getResponse(res);
          if (result) {
            // 更新头上版本号
            headerDs.current.set('objectVersionNumber', objectVersionNumber + 1);
            // 查询
            priceLibTableDs.query();
          }
        });
      }
    },
    [headerDs]
  );

  /**
   * 设置供应商lov props
   */
  const getSupplierLovProps = () => {
    const queryData = {
      srmFlag: 1,
    };

    const supplierLovProps = {
      clearButton: false,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
      },
    };

    return {
      // queryParams: {}, // 初始化查询参数 url
      queryData, // 初始化查询参数 body payload
      ...supplierLovProps,
    };
  };

  const renderEditorField = (record) => {
    const {
      writeLogic,
      fieldWidget = ComponentNames.TEXT_FIELD,
      dimensionCode,
      sourceCode,
      numberPrecision,
      dateFormat,
      currencyCode,
    } = record.get([
      'writeLogic',
      'fieldWidget',
      'dimensionCode',
      'sourceCode',
      'numberPrecision',
      'dateFormat',
      'currencyCode',
    ]);

    const options = {};
    let componentType = fieldWidget;

    if (writeLogic !== 'DEFAULT') componentType = ComponentNames.INPUT;
    if (writeLogic === 'DEFAULT') {
      if (fieldWidget === 'LINK') {
        return '-';
      }
      if (fieldWidget === ComponentNames.INPUT_NUMBER) {
        // 含税未税，每一含税未税，全球化
        if (
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            dimensionCode
          )
        ) {
          // 如果有币种，用币种的精度(前提币种存在)，不然就是维度配置的
          const expandProps = currencyCode
            ? {}
            : {
                precision: numberPrecision,
              };
          return (
            <C7nPrecisionInputNumber
              name="logicDetailObject"
              record={record}
              currency="currencyCode"
              precisionPropIsFirst={false}
              {...expandProps}
            />
          );
        }
        Object.assign(options, { precision: numberPrecision });
      }

      if (fieldWidget === ComponentNames.LOV) {
        // 供应商组件
        if (
          dimensionCode === 'supplierCompanyId' &&
          ['SSLM.SUPPLIER', 'SPRM.SUPPLIER_FOR_SPC'].includes(sourceCode)
        ) {
          // 固定值
          const { ...resetProps } = getSupplierLovProps();
          return <SupplierLov {...resetProps} name="logicDetailObject" dataSet={priceLibTableDs} />;
        }
      }

      if (fieldWidget === ComponentNames.DATE_PICKER) {
        if (dateFormat === 'yyyy/MM/dd hh:mm:ss' || dateFormat === 'yyyy-MM-dd hh:mm:ss') {
          componentType = ComponentNames.DATE_TIME_PICKER;
        } else {
          componentType = ComponentNames.DATE_PICKER;
        }
      }

      if (fieldWidget === ComponentNames.LONG_INPUT) {
        Object.assign(options, {
          resize: true,
          rows: 1,
          valueChangeAction: 'input',
        });
      }

      if (fieldWidget === ComponentNames.UPLOAD) {
        Object.assign(options, {
          viewMode: 'popup',
        });
      }
    }

    return dynamicRender(
      { componentType },
      {
        name: 'logicDetailObject',
        record,
        ...options,
      }
    );
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'dimensionName',
        width: 150,
      },
      {
        name: 'dimensionCode',
        width: 150,
      },
      {
        name: 'fieldRequired',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'fieldWidgetMeaning',
        width: 120,
      },
      {
        name: 'sourceCode',
        width: 180,
      },
      {
        name: 'writeLogic',
        width: 150,
        editor: true,
      },
      {
        name: 'logicDetailObject',
        className: style['login-detail-style'], // TODO 临时处理下宽度问题，后续跟平台继续跟进
        width: 200,
        editor: (record) => renderEditorField(record),
      },
    ];
  }, []);

  return (
    <>
      <div className={style['count-formula']}>
        <div className={style['formula-block']}>
          <div className={style['formula-preview']}>
            <span className={style['formula-preview-tag']}>
              {intl.get('spc.priceModel.model.priceModel.preview').d('预览')}
            </span>
            <span
              className={style['formula-content']}
              dangerouslySetInnerHTML={{ __html: calculateFormulaPreview() }}
            />
          </div>
          <div className={style['input-edit']}>
            <span className={style['input-edit-tag']}>
              {intl.get('spc.priceModel.model.priceModel.editor').d('编辑')}
            </span>
            <Form dataSet={headerDs} labelLayout="none">
              <TextField
                name="calculateFormula"
                ref={calculateFormulaRef}
                placeholder={intl
                  .get('spc.priceModel.model.priceModel.calculateFormula.placeholder')
                  .d('请输入公式')}
              />
            </Form>
          </div>
        </div>
        <div className={style['formula-wrapper']}>
          <div className={style['formula-wrapper-left']}>
            <div style={{ paddingLeft: '8px' }}>
              {intl.get('spc.priceModel.model.priceModel.dataReference').d('数据引用')}
            </div>
            <div className={style['btn-wrapper']}>
              {paramList.map((item) => (
                <Button
                  funcType="flat"
                  block
                  className={style['btn-wrapper-item']}
                  onClick={handleClick.bind(null, item)}
                >
                  {item.meaning}
                </Button>
              ))}
            </div>
          </div>
          <div className={style['formula-wrapper-right']}>
            <div>{intl.get('spc.priceModel.view.tips.calculateFormula.desc').d('填写说明：')}</div>
            <div>
              {intl
                .get('spc.priceModel.view.tips.calculateFormula.example')
                .d('左侧参数均来自主要参数和其他参数，选择参数值参与到运算中')}
            </div>
            <div>
              {intl
                .get('spc.priceModel.view.tips.calculateFormula.support')
                .d('运算公式目前仅支持四则运算和括号')}
            </div>
            <div>
              {intl
                .get('spc.priceModel.view.tips.calculateFormula.write')
                .d('填写规范请参考示例：')}
            </div>
            <div>
              {intl
                .get('spc.priceModel.view.tips.calculateFormula.writeExample')
                .d(`（\${主要参数1}+\${主要参数2}）*\${其他参数1}+\${其他参数2}`)}
            </div>
          </div>
        </div>
      </div>
      <div className="card-content-form">
        <Form
          dataSet={headerDs}
          labelLayout="float"
          columns={3}
          style={{ marginTop: '32px', marginBottom: '12px' }}
        >
          <Lov
            name="targetPriceTemplateCodeLov"
            onChange={changeTargetPriceTemplate}
            clearButton={false}
          />
        </Form>
      </div>
      <Table
        customizable
        customizedCode="SRC.PRICE_MODEL.UPDATE.PRICE_LIBRARY"
        dataSet={priceLibTableDs}
        buttons={['save']}
        columns={columns}
        style={{ maxHeight: '430px' }}
      />
    </>
  );
};
export default observer(CountFormula);
