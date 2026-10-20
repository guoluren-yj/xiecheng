import React, { useState, useEffect, useRef, Fragment, useMemo, useCallback } from 'react';
import { Select } from 'choerodon-ui';
import {
  Modal,
  CheckBox,
  TextField,
  IntlField,
  DataSet,
  Form,
  Lov,
  Button,
  Icon,
  NumberField,
  Tooltip,
  DatePicker,
  Select as SelectPro,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import LabelColor from '../../ProductLabelConfig/LabelColor';

import { fetchLabels, createLabel } from '../api';
import { skuInfoDs } from './ds';
import styles from './style.less';

const userOrgId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();

export function getOptionDisabled(multipleSuppliers = [], record) {
  const labelSuppliers = record.get('labelSuppliers');
  if (!labelSuppliers) return false;
  const results = multipleSuppliers.map((m) => {
    if ((labelSuppliers || []).find((f) => f.supplierCompanyId === m.supplierCompanyId)) {
      return true;
    }
    return false;
  });
  return results.some((flag) => flag === false);
}

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

const labelDs = (isSup) => ({
  fields: [
    {
      name: 'labelCode',
      required: true,
      pattern: /[\d\w]+/,
      label: intl.get('smpc.workbench.model.labelCode').d('标签编码'),
    },
    {
      name: 'labelName',
      required: true,
      type: 'intl',
      label: intl.get('smpc.workbench.model.labelName').d('标签名称'),
    },
    {
      name: 'labelColorCode',
      required: true,
      label: intl.get('smpc.workbench.model.labelColor').d('标签颜色'),
      defaultValue: 'A',
    },
    {
      name: 'enabledFlag',
      required: true,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('smpc.workbench.model.labelStatus').d('标签状态'),
    },
    {
      name: 'supplierCompanyName',
      required: isSup,
      disabled: true,
      label: intl.get('smpc.product.model.supplier').d('供应商'),
    },
    {
      name: 'supplierCompanyId',
      required: isSup,
    },
  ],
});

const multipleLabelDs = (isSup) => ({
  fields: [
    {
      name: 'labelCode',
      required: true,
      pattern: /[\d\w]+/,
      label: intl.get('smpc.workbench.model.labelCode').d('标签编码'),
    },
    {
      name: 'labelName',
      required: true,
      type: 'intl',
      label: intl.get('smpc.workbench.model.labelName').d('标签名称'),
    },
    {
      name: 'labelColorCode',
      required: true,
      label: intl.get('smpc.workbench.model.labelColor').d('标签颜色'),
      defaultValue: 'A',
    },
    {
      name: 'enabledFlag',
      required: true,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('smpc.workbench.model.labelStatus').d('标签状态'),
    },
    {
      name: 'labelSuppliers',
      required: isSup,
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      type: 'object',
      multiple: true,
      lovCode: 'SMAL.SUPPLIER_BY_PUR',
      textField: 'supplierName',
      valueField: 'supplierId',
      lovPara: {
        supplierTenantId: getUserOrganizationId(),
        tenantId: getCurrentOrganizationId(),
      },
      transformRequest: (_, record) => {
        return (record.get('labelSuppliers') || []).map((m) => ({
          supplierCompanyId: m.supplierId,
          supplierCompanyName: m.supplierName,
          supplierTenantId: m.supplierTenantId,
        }));
      },
      transformResponse: (_, record) => {
        return record.labelSuppliers
          ? record.labelSuppliers.map((m) => ({
              ...m,
              supplierName: m.supplierCompanyName,
              supplierId: m.supplierCompanyId,
            }))
          : null;
      },
    },
  ],
});

const LabelColorSelect = observer(({ dataSet, name, onChange = (e) => e }) => {
  const record = dataSet.current;
  return (
    <LabelColor
      colorCode={record.get(name)}
      onChange={(value) => {
        record.set(name, value);
        onChange();
      }}
    />
  );
});

function LabelCreate(props) {
  const { ds, isSup, multipleSupplier, afterSave = (e) => e, onCancel = (e) => e } = props;

  async function handleSave() {
    const flag = await ds.validate();
    if (flag) {
      const param = ds.toJSONData()[0];
      const res = getResponse(await createLabel(param));
      if (res) {
        notification.success();
        afterSave();
      }
    }
  }

  return (
    <div className={styles['label-create-wrapper']}>
      <div className="label-create-content">
        <Form dataSet={ds} labelLayout="float">
          <TextField name="labelCode" />
          <IntlField name="labelName" />
          {isSup && !multipleSupplier && <Lov name="supplierCompanyName" />}
          {isSup && multipleSupplier && <Lov name="labelSuppliers" />}
        </Form>
        <p className="form-label" style={{ marginTop: 16 }}>
          {intl.get('smpc.workbench.view.labelColor').d('标签颜色')}
          <span className="required">*</span>
        </p>
        <LabelColorSelect dataSet={ds} name="labelColorCode" />
        <p className="form-label">
          {intl.get('smpc.workbench.view.labelStatus').d('标签状态')}
          <span className="required">*</span>
        </p>
        <CheckBox dataSet={ds} name="enabledFlag">
          {intl.get('hzero.common.enable').d('启用')}
        </CheckBox>
      </div>
      <div className="label-create-footer">
        <Button color="primary" funcType="raised" onClick={() => handleSave()}>
          {intl.get('smpc.workbench.view.confirm').d('确定')}
        </Button>
        <Button funcType="raised" onClick={onCancel}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      </div>
    </div>
  );
}

export function getLabelOptions(params = {}, data) {
  // 采购方列表页不做过滤，供应商切租户时，当supplier为空时使用登录者租户
  let supplierTenantId;
  if (userOrgId !== organizationId) {
    supplierTenantId = userOrgId;
  }
  supplierTenantId = params.supplierTenantId || supplierTenantId;

  return new DataSet({
    paging: false,
    autoQuery: true,
    data,
    transport: {
      read: {
        url: `/smpc/v1/${organizationId}/labels/label-list`,
        method: 'GET',
        data: { enabledFlag: 1, ...params, supplierTenantId },
      },
    },
  });
}

export function NewLabelSelect(props) {
  const {
    name,
    record,
    options,
    label,
    style,
    isSup,
    onChange,
    onOption,
    supplier = {},
    initLabels = [],
    multipleSupplier = false,
    multipleSuppliers = [],
  } = props;

  const [isCreate, setIsCreate] = useState(false);
  const labelCreate = useRef(
    new DataSet(multipleSupplier ? multipleLabelDs(isSup) : labelDs(isSup))
  );

  const newProps = {};
  if ('record' in props) {
    newProps.record = record;
  }

  const create = useMemo(
    () => (
      <LabelCreate
        isSup={isSup}
        ds={labelCreate.current}
        multipleSupplier={multipleSupplier}
        afterSave={() => {
          setIsCreate(false);
          options.query();
          labelCreate.current.reset();
        }}
        onCancel={() => {
          setIsCreate(false);
          labelCreate.current.reset();
        }}
      />
    ),
    []
  );

  const getPopupContent = useCallback(({ content }) => (isCreate ? create : content), [isCreate]);

  function rendererAllButton(buttons) {
    const allButtons = [...buttons];
    allButtons.push({
      key: 'create',
      children: intl.get('smpc.workbench.model.newAdd').d('新增'),
      onClick: () => {
        if (isSup) {
          if (!multipleSupplier) {
            labelCreate.current.create(supplier);
          } else {
            labelCreate.current.create({ labelSuppliers: multipleSuppliers });
          }
        } else {
          labelCreate.current.create({});
        }
        setIsCreate(true);
      },
    });
    return allButtons;
  }

  return (
    <SelectPro
      searchable
      dropdownMatchSelectWidth
      name={name}
      label={label}
      options={options}
      style={{ width: '100%', ...style }}
      selectAllButton={rendererAllButton}
      popupContent={getPopupContent}
      // onPopupHiddenChange={(hidden) => {
      //   if (hidden) {
      //     setIsCreate(false);
      //   }
      // }}
      optionsFilter={(r) => {
        const isPurCreate = initLabels.some(
          (s) => s.creatorFlag === 'PURCHASE' && s.labelId === r.get('labelId')
        );
        return !isPurCreate;
      }}
      onOption={onOption}
      onChange={onChange}
      {...newProps}
    />
  );
}

export function LabelSelect(props) {
  const {
    onOk = (e) => e,
    onChange = (e) => e,
    modal,
    label = intl.get('smpc.workbench.view.label').d('标签'),
    labels,
    isSup,
    style,
    supplier = {},
  } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectData, setSelectData] = useState([]);
  const [create, setCreate] = useState(false);
  const selectRef = useRef();
  const labelCreate = useRef(new DataSet(labelDs(isSup)));

  const initLables = labels || [];

  if (modal) {
    modal.handleOk(() => onOk(selectData));
  }

  async function fetchData() {
    setLoading(true);
    // 采购方列表页不做过滤，供应商切租户时，当supplier为空时使用登录者租户
    let supplierTenantId;
    if (userOrgId !== organizationId) {
      supplierTenantId = userOrgId;
    }
    supplierTenantId = supplier.supplierTenantId || supplierTenantId;
    const res =
      getResponse(await fetchLabels({ enabledFlag: 1, ...supplier, supplierTenantId })) || [];
    setLoading(false);
    setData(res);
  }

  function handleChange(vals) {
    const _selectData = data.filter((d) => vals.includes(String(d.labelId)));
    setSelectData(_selectData);
    onChange(_selectData);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectData(initLables);
  }, [labels]);

  return (
    <div className={styles['label-select-container']} style={style}>
      <Select
        mode="multiple"
        // autoFocus
        ref={selectRef}
        style={{ width: '100%' }}
        label={label}
        value={selectData.map((m) => String(m.labelId))}
        addonAfter={<Icon type="label" />}
        footer={
          <Fragment>
            <Button
              className={styles['primary-btn']}
              funcType="raised"
              onClick={() => {
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button
              funcType="raised"
              onClick={() => {
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button
              funcType="raised"
              onClick={() => {
                setCreate(true);
                if (isSup) {
                  labelCreate.current.create({ ...supplier });
                } else {
                  labelCreate.current.create({});
                }
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('smpc.workbench.model.newAdd').d('新增')}
            </Button>
          </Fragment>
        }
        loading={loading}
        filter
        optionFilterProp="title"
        allowClear
        onChange={handleChange}
      >
        {data.map((m) => (
          <Select.Option key={String(m.labelId)} title={m.labelName}>
            {m.labelName}
          </Select.Option>
        ))}
      </Select>
      {create && (
        <LabelCreate
          isSup={isSup}
          ds={labelCreate.current}
          afterSave={() => {
            setCreate(false);
            selectRef.current.rcSelect.setOpenState(true);
            fetchData();
            labelCreate.current.reset();
          }}
          onCancel={() => {
            setCreate(false);
            selectRef.current.rcSelect.setOpenState(true);
            labelCreate.current.reset();
          }}
        />
      )}
    </div>
  );
}

export const LabelSelectPro = observer(function LabelSelectPro(props) {
  const {
    isSup,
    style,
    name,
    record,
    supplier = {},
    label = intl.get('smpc.workbench.view.label').d('标签'),
  } = props;

  const labels = record.get(name) || [];

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(labels);
  const [create, setCreate] = useState(false);
  const selectRef = useRef();
  const labelCreate = useRef(new DataSet(labelDs(isSup)));

  async function fetchData() {
    setLoading(true);
    // 采购方列表页不做过滤，供应商切租户时，当supplier为空时使用登录者租户
    let supplierTenantId;
    if (userOrgId !== organizationId) {
      supplierTenantId = userOrgId;
    }
    supplierTenantId = supplier.supplierTenantId || supplierTenantId;
    const res =
      getResponse(await fetchLabels({ enabledFlag: 1, ...supplier, supplierTenantId })) || [];
    setLoading(false);
    setData(res);
  }

  function handleChange(vals) {
    const _selectData = data.filter((d) => vals.includes(String(d.labelId)));
    record.set(name, _selectData);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles['label-select-container']} style={style}>
      <Select
        mode="multiple"
        // autoFocus
        ref={selectRef}
        style={{ width: '100%' }}
        label={label}
        value={labels.map((m) => String(m.labelId))}
        addonAfter={<Icon type="label" />}
        footer={
          <Fragment>
            <Button
              className={styles['primary-btn']}
              funcType="raised"
              onClick={() => {
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button
              funcType="raised"
              onClick={() => {
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button
              funcType="raised"
              onClick={() => {
                setCreate(true);
                if (isSup) {
                  labelCreate.current.create({ ...supplier });
                } else {
                  labelCreate.current.create({});
                }
                selectRef.current.rcSelect.setOpenState(false);
              }}
            >
              {intl.get('smpc.workbench.model.newAdd').d('新增')}
            </Button>
          </Fragment>
        }
        loading={loading}
        filter
        optionFilterProp="title"
        allowClear
        onChange={handleChange}
      >
        {data.map((m) => (
          <Select.Option key={String(m.labelId)} title={m.labelName}>
            {m.labelName}
          </Select.Option>
        ))}
      </Select>
      {create && (
        <LabelCreate
          isSup={isSup}
          ds={labelCreate.current}
          afterSave={() => {
            setCreate(false);
            selectRef.current.rcSelect.setOpenState(true);
            fetchData();
            labelCreate.current.reset();
          }}
          onCancel={() => {
            setCreate(false);
            selectRef.current.rcSelect.setOpenState(true);
            labelCreate.current.reset();
          }}
        />
      )}
    </div>
  );
});

const EcBatchForm = withCustomize({ unitCode: ['SMPC.WORKBENCH_PUR.BATCH_EDIT_EC.FORM'] })(
  ({ isSup, supplier, multipleSuppliers = [], dataSet, customizeForm }) => {
    return customizeForm(
      { code: 'SMPC.WORKBENCH_PUR.BATCH_EDIT_EC.FORM' },
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <NewLabelSelect
          name="labels"
          isSup={isSup}
          supplier={supplier}
          options={getLabelOptions(supplier)}
          onOption={({ record }) => {
            return { disabled: getOptionDisabled(multipleSuppliers, record) };
          }}
        />
        <NumberField
          step={1}
          name="weightScore"
          placeholder={intl.get('smpc.product.modal.weightScore').d('权重分')}
          addonAfter={
            <Tooltip
              title={intl
                .get('smpc.product.view.message.weightScore')
                .d('权重分越高的商品在主站搜索排序中越靠前')}
              placement="top"
            >
              <Icon type="help" style={{ fontSize: '14px' }} />
            </Tooltip>
          }
        />
        <DatePicker name="ecValidDateTo" />
      </Form>
    );
  }
);

// 电商批量编辑
export default function openLabels({ isSup, onSave = (e) => e, supplier, multipleSuppliers }) {
  const skuDs = new DataSet(skuInfoDs());
  Modal.open({
    title: intl.get('smpc.product.model.batchMatain').d('批量维护'),
    ...modalProps,
    style: { width: 380 },
    onOk: async () => {
      // 验证
      const valid = await skuDs.validate();
      if (valid) {
        const formData = skuDs.toJSONData();
        return onSave(formData);
      } else {
        return false;
      }
    },
    children: (
      <EcBatchForm
        dataSet={skuDs}
        isSup={isSup}
        supplier={supplier}
        multipleSuppliers={multipleSuppliers}
      />
    ),
  });
}
