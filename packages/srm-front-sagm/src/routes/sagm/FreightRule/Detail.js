import React, { Component, Fragment } from 'react';
import { Tooltip } from 'choerodon-ui';
import {
  DataSet,
  Spin,
  NumberField,
  Lov,
  Table,
  Select,
  Button,
  TextArea,
  CheckBox,
} from 'choerodon-ui/pro';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { observer as classObserver } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ImportButton from 'components/Import';

import { openRegionTree } from '@/utils/tree';
import { openImport } from '@/utils/c7nModal';
import SupplierHocLov from '@/components/SupplierHocLov';
import HeadLine from '@/components/HeadLine';
import { formDs, piecesDs, volumeDs, orderAmountDs, weightDs, insTallOrderAmountDs } from './ds';
import { addFreight, fetchFreight } from './api';
import FormPro from '../SagmWorkbench/Comps/FormPro';
import styles from './index.less';

const ImportBtn = ({ tooltip, hidden = false, ...btnProps }) => {
  // hidden - 个性化属性
  if (hidden) return '';
  const tip = intl
    .get('sagm.freight.view.importLineTip')
    .d('请先点击”保存“按钮，保存成功后才能操作批量导入');
  const btn = (
    <Button icon="archive" funcType="link" style={{ marginLeft: 0 }} {...btnProps}>
      {intl.get('hzero.common.button.import').d('导入')}
    </Button>
  );
  return tooltip ? <Tooltip title={tip}>{btn}</Tooltip> : btn;
};

const ImportBtnNew = ({
  tooltip,
  hidden = false,
  importCode,
  args,
  successCallBack,
  path,
  ...btnProps
}) => {
  // hidden - 个性化属性
  if (hidden) return '';
  const tip = intl
    .get('sagm.freight.view.importLineTip')
    .d('请先点击”保存“按钮，保存成功后才能操作批量导入');
  const buttonProps = {
    icon: 'archive',
    style: { marginLeft: 0 },
    funcType: 'link',
    permissionList: [
      {
        code: `${path}.button.import-new`,
        type: 'button',
        meaning: '运费规则-（新）导入',
      },
    ],
    ...btnProps,
  };
  const disabledBtn = (
    <Button {...buttonProps}>{intl.get('sagm.common.button.importNew').d('(新)导入')}</Button>
  );
  const importBtn = (
    <ImportButton
      businessObjectTemplateCode={importCode}
      refreshButton
      args={args}
      buttonText={intl.get('sagm.common.button.importNew').d('(新)导入')}
      prefixPatch="/sagm"
      successCallBack={successCallBack}
      buttonProps={buttonProps}
    />
  );
  return tooltip ? <Tooltip title={tip}>{disabledBtn}</Tooltip> : importBtn;
};
const handleDelete = (dataSet) => {
  const target = dataSet.selected || [];
  if (dataSet.selected?.some((s) => s.get('postageLineId'))) {
    dataSet.delete(target);
  } else {
    dataSet.remove(target);
  }
};
const DeleteButton = observer(({ dataSet }) => {
  return (
    <Button
      name="delete"
      funcType="flat"
      icon="delete_sweep"
      color="primary"
      disabled={dataSet.selected.length === 0}
      onClick={() => handleDelete(dataSet)}
    >
      {intl.get('sagm.common.button.batchDelete').d('批量删除')}
    </Button>
  );
});

const FreightLine = observer(
  ({
    fds,
    dsMappings,
    postageId,
    initPricingMethod,
    getColumns,
    onRefresh,
    path,
    customizeTable,
  }) => {
    const method = fds.current ? fds.current.get('pricingMethod') : 'ORDER_AMOUNT';
    let installMethod;
    if (fds.current && fds.current.get('additionalType') === 'INSTALL') {
      installMethod = 'INSTALL_ORDER_AMOUNT';
    }
    const { ds, importCode, value } =
      dsMappings.find((f) => f.value === (installMethod || method)) || {};
    if (!ds) return;
    const columns = getColumns(method, ds, fds);
    const disabled = !postageId || initPricingMethod !== method;
    // 注意value 值统一以 '_' 分隔
    // 有附加类型， 单独处理name
    const importName = `${String(installMethod ? 'ORDER_AMOUNT' : value)
      .toLowerCase()
      .replace(/_/g, '-')}OldImport`;
    const buttons = [
      <Button
        name="add"
        icon="playlist_add"
        funcType="flat"
        color="primary"
        onClick={() => ds.create({}, 0)}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <ImportBtn
        name={importName}
        disabled={disabled}
        tooltip={disabled}
        onClick={() =>
          openImport(
            {
              afterClose: () => onRefresh(postageId),
            },
            {
              key: '/sagm/freight-rule/data-import',
              // action:,
              code: importCode,
              args: { postageId, templateCode: importCode },
            }
          )
        }
      />,
      <ImportBtnNew
        name="newImport"
        disabled={disabled}
        tooltip={disabled}
        path={path}
        importCode={importCode}
        args={{ postageId, templateCode: importCode }}
        successCallBack={() => onRefresh(postageId)}
      />,
      <DeleteButton dataSet={ds} />,
    ];
    return customizeTable(
      {
        code: 'SAGM.FREIGHT_RULE.TABLE',
        buttonCode: 'SAGM.FREIGHT_RULE.BTNS',
      },
      <Table
        dataSet={ds}
        columns={columns}
        buttons={buttons}
        className={styles['table-container']}
        style={{ maxHeight: 'calc(100vh - 396px)' }}
      />
    );
  }
);

@withCustomize({ unitCode: ['SAGM.FREIGHT_RULE.BTNS', 'SAGM.FREIGHT_RULE.TABLE'] })
@classObserver
export default class Detail extends Component {
  formDs = new DataSet(formDs());

  piecesDs = new DataSet(piecesDs());

  volumeDs = new DataSet(volumeDs());

  orderAmountDs = new DataSet(orderAmountDs());

  insTallOrderAmountDs = new DataSet(insTallOrderAmountDs());

  weightDs = new DataSet(weightDs());

  lineMappings = [
    {
      value: 'ORDER_AMOUNT',
      ds: this.orderAmountDs, // 按订单金额
      importCode: 'SAGM.POSTAGE.ORDER',
    },
    {
      additionalType: 'INSTALL',
      ds: this.insTallOrderAmountDs, // 安装费
      value: 'INSTALL_ORDER_AMOUNT',
      importCode: 'SAGM.INSTALL.ORDER',
    },
    {
      value: 'PIECES',
      ds: this.piecesDs, // 按件数
      importCode: 'SMAL.POSTAGE.PIECE',
    },
    {
      value: 'ACTUAL_CALCULATION',
      ds: this.volumeDs, // 按体积
      importCode: 'SMAL.POSTAGE.VOLUME',
    },
    {
      value: 'WEIGHT',
      ds: this.weightDs, // 按重量
      importCode: 'SMAL.POSTAGE.WEIGHT',
    },
    // 另下单补运费 OTHER_PAY 无行
  ];

  lineDsMethod = {
    create: (line) => {
      this.piecesDs.create(line);
      this.volumeDs.create(line);
      this.orderAmountDs.create(line);
      this.weightDs.create(line);
      this.insTallOrderAmountDs.create(line);
    },
    loadData: (type, data) => {
      this.lineMappings.forEach((f) => {
        f.ds.loadData([]);
        data.forEach((line) => {
          f.ds.create(line);
        });
      });
    },
    getDs: () => {
      const method = this.formDs.current
        ? this.formDs.current.get('pricingMethod')
        : 'ORDER_AMOUNT';
      let installMethod;
      if (this.formDs.current && this.formDs.current.get('additionalType') === 'INSTALL') {
        installMethod = 'INSTALL_ORDER_AMOUNT';
      }
      const { ds } = this.lineMappings.find((f) => f.value === (installMethod || method)) || {};
      return ds;
    },
  };

  constructor(props) {
    super(props);

    const { modal, readOnly, postageId } = props;

    if (!postageId) {
      this.formDs.create({ enabled: 1 });
      this.lineDsMethod.create({ regionDefault: true });
    }

    modal.handleOk(() => {
      return readOnly ? true : this.handleSave();
    });

    if (!readOnly) {
      modal.update({
        footer: (okBtn, cancelBtn) => {
          return [
            okBtn,
            <Button onClick={() => this.handleSave(true)}>
              {intl.get('sagm.common.btn.saveAndClose').d('保存并关闭')}
            </Button>,
            cancelBtn,
          ];
        },
      });
    }

    this.state = {
      loading: false,
      postageId,
      initPricingMethod: '',
      //  FREIGHT || INSTALL
      additionalType: 'FREIGHT',
    };
  }

  componentDidMount() {
    const { postageId } = this.state;
    if (postageId) {
      this.fetchFreight(postageId);
    }
  }

  @Bind
  async fetchFreight(postageId) {
    this.setState({ loading: true });
    const res = getResponse(await fetchFreight({ postageId }));
    if (res) {
      const [freight] = res.content || [];
      const { postageLineList, ...head } = freight || {};
      this.formDs.loadData([]);
      this.formDs.create(head);
      // 处理参数， 数值
      const _postageLineList = (postageLineList || []).map((p) => {
        const { pricingType } = p;
        const par = {};
        if (pricingType) {
          if (pricingType === 'FIXED') {
            par.tempererNumber = p.freightPurOrder;
          } else if (pricingType === 'PERCENTAGE') {
            par.tempererNumber = p.freightPercent;
          }
          par.pricingType = `${freight.additionalType}_${pricingType}`;
        }
        return { ...p, ...par };
      });
      // 另下单补运费没有行
      this.lineDsMethod.loadData(
        head.pricingMethod,
        !_postageLineList.length ? [{ regionDefault: true }] : _postageLineList
      );
      if (this.lineDsMethod.getDs()) {
        this.lineDsMethod.getDs().validate(); // 触发页面初次加载，区域失效校验
      }
      this.setState({ initPricingMethod: head.pricingMethod, additionalType: head.additionalType });
    }
    this.setState({ loading: false });
  }

  @Bind
  async handleSave(closeFlag = false) {
    const { onFetchList = (e) => e, postageId: _edit, modal } = this.props;
    const record = this.formDs.current;
    const headFlag = await this.formDs.validate();
    const lineDs = this.lineDsMethod.getDs();
    const tableFlag = lineDs ? await lineDs.validate() : true;
    if (headFlag && tableFlag) {
      this.setState({ loading: true });
      const head = record.toJSONData();
      const postageLineList = lineDs ? lineDs.toJSONData() : [];
      const params = {
        ...head,
        postageLineList: postageLineList.map(
          ({ regionDefault, pricingType, tempererNumber, ...others }) => {
            const par = {};
            if (pricingType) {
              if (pricingType.includes('FIXED')) {
                par.freightPurOrder = tempererNumber;
              } else if (pricingType.includes('PERCENTAGE')) {
                par.freightPercent = tempererNumber;
              }
            }
            // eslint-disable-next-line prefer-destructuring
            par.pricingType = pricingType?.split('_')[1];
            return regionDefault
              ? { ...others, postageRegionList: null, ...par }
              : { ...others, ...par };
          }
        ),
      };
      const res = await addFreight(filterNullValueObject(params));
      this.setState({ loading: false });
      const result = getResponse(res);
      if (result) {
        // this.fetchFreight(postageId);
        onFetchList(_edit);
        notification.success();
        if (closeFlag) {
          modal.close();
        } else {
          this.fetchFreight(_edit);
        }
      }
    }
    return false;
  }

  getLineColumns = (method, ds, fds) => {
    const a = 'ORDER_AMOUNT'; // 按订单金额
    const b = 'PIECES'; // 按件数
    const c = 'ACTUAL_CALCULATION'; // 按实际测算
    const d = 'WEIGHT'; // 按重量
    const install = 'INSTALL';
    const columns = [
      {
        name: 'postageRegionList',
        minWidth: 220,
        editor: (record) => (
          <Lov
            onClick={() => {
              const currentRegion = record.get('postageRegionList') || [];
              let disabledRegions = [];
              ds.records.forEach((f) => {
                const { regionDefault, postageRegionList: regions } = f.toData();
                if (!regionDefault) {
                  disabledRegions = [...disabledRegions, ...(regions || [])];
                }
              });
              disabledRegions = disabledRegions.filter(
                (f) => !currentRegion.some((s) => s.regionCode === f.regionCode)
              );
              openRegionTree({
                record,
                whole: false,
                name: 'postageRegionList',
                disableData: disabledRegions,
              });
            }}
            placeholder={intl
              .get('sagm.freight.view.placeHolder.postageRegion')
              .d('请输入运送区域')}
          />
        ),
        additionalTypes: [install],
      },
      {
        name: 'minPackageNumber',
        minWidth: 160,
        filters: [b],
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.minPackageNumber')
              .d('请输入最低包邮件数')}
          />
        ),
      },
      {
        minWidth: 150,
        name: 'minPackageAmount',
        filters: [a, b],
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.minPackageAmount')
              .d('请输入最低包邮金额')}
          />
        ),
      },
      {
        minWidth: 150,
        name: 'pricingType',
        filters: [a],
        additionalTypes: [install],
        editor: (
          <Select
            optionsFilter={(f) => f.get('parentValue') === this.state.additionalType}
            placeholder={intl.get('sagm.freight.view.placeHolder.pricingType').d('请输入计价类型')}
          />
        ),
      },
      {
        minWidth: 150,
        name: 'tempererNumber',
        filters: [a],
        additionalTypes: [install],
        editor: (record) => (
          <NumberField
            placeholder={
              record.get('pricingType')?.includes('PERCENTAGE')
                ? intl.get('sagm.freight.view.placeHolder.percentage').d('请输入金额百分比')
                : intl.get('sagm.freight.view.placeHolder.fixed').d('请输入固定金额')
            }
          />
        ),
        // 大数字
        renderer: ({ record, value }) => {
          return record.get('pricingType')?.includes('PERCENTAGE') && !isNull(value)
            ? `${value}%`
            : value;
        },
      },
      // {
      //   width: 150,
      //   name: 'freightPurOrder',
      //   filters: [a],
      //   editor: true,
      // },
      // {
      //   width: 160,
      //   name: 'freightPercent',
      //   filters: [a],
      //   editor: true,
      // },
      {
        minWidth: 160,
        name: 'firstPiece',
        filters: [b],
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.firstPiece').d('请输入首件数')}
          />
        ),
      },
      {
        minWidth: 140,
        name: 'firstFreight',
        filters: [b],
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.firstFreight').d('请输入首件费')}
          />
        ),
      },
      {
        minWidth: 120,
        name: 'increasingNumber',
        filters: [b],
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.increasingNumber').d('请输入续件')}
          />
        ),
      },
      {
        minWidth: 140,
        name: 'renewal',
        filters: [b],
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.renewal').d('请输入续件费')}
          />
        ),
      },
      {
        minWidth: 140,
        name: 'lowestAmount',
        filters: [a],
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.lowestAmount').d('请输入最低金额')}
          />
        ),
      },
      {
        minWidth: 350,
        name: 'volumeUnitPrice',
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.volumeUnitPrice')
              .d('请输入体积单价')}
          />
        ),
        filters: [c],
      },
      {
        minWidth: 120,
        name: 'maxPackageWeight',
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.maxPackageWeight')
              .d('请输入最大包邮重量')}
          />
        ),
        filters: [d],
      },
      {
        minWidth: 120,
        name: 'firstWeight',
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.firstWeight').d('请输入首重')}
          />
        ),
        filters: [d],
      },
      {
        minWidth: 120,
        name: 'firstWeightPrice',
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.firstWeightPrice')
              .d('请输入首重费用')}
          />
        ),
        filters: [d],
      },
      {
        minWidth: 120,
        name: 'increasingWeight',
        editor: (
          <NumberField
            placeholder={intl.get('sagm.freight.view.placeHolder.increasingWeight').d('请输入续重')}
          />
        ),
        filters: [d],
      },
      {
        minWidth: 120,
        name: 'increasingWeightPrice',
        editor: (
          <NumberField
            placeholder={intl
              .get('sagm.freight.view.placeHolder.increasingWeightPrice')
              .d('请输入续重费用')}
          />
        ),
        filters: [d],
      },
    ];
    const currentColumns = columns.filter((f) => {
      if (['INSTALL'].includes(fds.current?.get('additionalType')) && [a].includes(method)) {
        return f.additionalTypes;
      }
      return f.install || (f.filters || [a, b, c, d]).includes(method);
    });
    return currentColumns;
  };

  render() {
    const { readOnly, path } = this.props;
    const { loading, postageId, initPricingMethod } = this.state;
    const method = this.formDs.current ? this.formDs.current.get('pricingMethod') : 'ORDER_AMOUNT';
    let installMethod;
    if (this.formDs.current && this.formDs.current.get('additionalType') === 'INSTALL') {
      installMethod = 'INSTALL_ORDER_AMOUNT';
    }
    const noLineFlag = !(this.lineMappings.find((f) => f.value === (installMethod || method)) || {})
      ?.ds;
    const lineProps = {
      path,
      postageId,
      initPricingMethod,
      fds: this.formDs,
      dsMappings: this.lineMappings,
      onRefresh: this.fetchFreight,
      getColumns: this.getLineColumns,
      customizeTable: this.props.customizeTable,
    };
    return (
      <Fragment>
        <Spin spinning={loading}>
          <FormPro
            columns={3}
            dataSet={this.formDs}
            readOnly={readOnly}
            fields={[
              {
                name: 'postageName',
              },
              {
                name: 'allSupplierFlag',
                FormField: CheckBox,
                colSpan: !this.formDs?.current?.get('allSupplierFlag') ? 1 : 2,
              },
              {
                name: 'supplier',
                FormField: SupplierHocLov,
                dataSet: this.formDs,
                oldLovFieldsProps: [
                  {
                    name: 'supplier',
                    lovCode: 'SMAL.SUPPLIER_BY_PUR',
                    valueField: 'supplierId',
                    textField: 'supplierName',
                  },
                  {
                    name: 'supplierCompanyId',
                    bind: 'supplier.supplierId',
                  },
                  {
                    name: 'supplierName',
                    bind: 'supplier.supplierName',
                  },
                ],
                show: ({ record }) => {
                  return record && !record.get('allSupplierFlag');
                },
              },
              {
                name: 'additionalType',
                FormField: Select,
                disabled: postageId,
                onChange: (value) => {
                  this.setState({
                    additionalType: value,
                  });
                },
              },
              // OTHER_PAY 另下单补运费
              {
                name: 'pricingMethod',
                FormField: Select,
                clearButton: false,
              },
              {
                name: 'item',
                FormField: Lov,
                label: intl.get('sagm.freight.model.additionalItem').d('附加费物料'),
                show: ({ record }) => {
                  if (record) {
                    return record.get('pricingMethod') !== 'OTHER_PAY';
                  }
                },
              },
              {
                name: 'tax',
                FormField: Lov,
                // restrict: '0-9.',
                searchable: false,
                label: intl.get('sagm.freight.view.additionalTax').d('附加费税率'),
                show: ({ record }) => {
                  if (record) {
                    return record.get('pricingMethod') !== 'OTHER_PAY';
                  }
                },
              },
              {
                name: 'description',
                FormField: TextArea,
                rows: 3,
                colSpan: 2,
                newLine: true,
                resize: 'auto',
                show: ({ record }) => {
                  if (record) {
                    return record.get('pricingMethod') === 'OTHER_PAY';
                  }
                },
              },
              {
                name: 'enabled',
                FormField: CheckBox,
              },
            ]}
          />
          {!noLineFlag && (
            <HeadLine
              style={{ marginTop: '32px' }}
              title={intl.get('sagm.freight.view.addDetailLine').d('附加费明细行')}
            />
          )}
          <FreightLine {...lineProps} />
        </Spin>
      </Fragment>
    );
  }
}
