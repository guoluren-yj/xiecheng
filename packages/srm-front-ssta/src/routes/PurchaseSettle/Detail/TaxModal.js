/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useMemo, useEffect, Fragment } from 'react';
import { Modal as OrcModal, Spin as Spins, Tooltip } from 'hzero-ui';
import { observer } from 'mobx-react';
import { Spin, Icon } from 'choerodon-ui';
import {
  DatePicker,
  Table,
  DataSet,
  Button,
  Modal,
  Form,
  Lov,
  TextField,
  Select,
  Menu,
  NumberField,
  Dropdown,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { compose, isEmpty, isNil } from 'lodash';
import querystring from 'querystring';
import CommonImport from 'components/Import';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBar from '_components/SearchBarTable/SearchBar';
import { decimalPointAccuracy } from '@/routes/utils';
import {
  getCurrentOrganizationId,
  getAttachmentUrl,
  getResponse,
  isTenantRoleLevel,
  getAccessToken,
} from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { HZERO_FILE } from 'utils/config';
import { getPermissions, PermissionDropdown } from '@/routes/Components';
import {
  invoiceInformation,
  invoiceCheck,
  taxInvoiceCheck,
  taxValidate,
  getSettleHeaderDetail,
} from '@/services/settlePoolServices';
import {
  purChosePool,
  newTax,
  OCRCheckSettle,
  OFDCheckSettle,
  deleteLine,
} from '@/services/invoicePurPoolService';
import Styles from '@/routes/common.less';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import { taxInvoiceCheckFlagger } from '@/utils/amountConfig';

import { taxDS as taxDs } from '../../../stores/PurchaseSettleDS';
import TaxDetailModal from './TaxDetailModal';
import InvoicePoolDetailModal from './InvoicePoolDetailModal';
import Record from './Record';
import { choseInvoicePoolDs } from '../../PurchaseInvoicePool/mainDS';
import { newDs } from './mainDS';
import PicturesWall from '../../PurchaseInvoicePool/OcrUpload';

let picturesWallRef;
const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';
const permPrefix = `srm.settle-account.jsd.purchase.ps.deatil.taxline.button`;
const TaxModal = (props) => {
  const organizationId = getCurrentOrganizationId();
  const {
    isEditPub,
    notPub,
    updateFlag,
    approveFlag,
    readOnlyFlag,
    amountPer,
    headerDS,
    customizeTable,
    customizeForm,
    history,
    modal,
  } = props;
  const {
    invoiceMethod,
    invoiceMatchRuleCode: invoiceMatch,
    settleNum,
    settleStatus,
    documentType,
    settleHeaderId,
    companyId,
    supplierCompanyId,
    autoCheckFlag,
    checkPointCode,
    enableCheckFlag,
    enableAfterInvoiceCheckFlag,
  } = headerDS.current?.toData() || {};
  const [select, setSelect] = React.useState([select]);
  const [checkLoading, setcheckLoading] = React.useState(false);
  const [ocrFileUrl, setOcrFileUrl] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const [picVisible, setPicVisible] = React.useState(false);
  const [ocrLoading, setOcrLoadings] = React.useState(false);
  const [ocrCheckLoading, setOcrCheckLoading] = React.useState(false);
  const [permsMap, setPermsMap] = React.useState(new Map());
  const [btnType, setBtnType] = React.useState('');

  const taxDS = useMemo(() => {
    return new DataSet({
      ...taxDs(),
      events: {
        // 数据加载完成重新校验
        load: ({ dataSet }) => {
          dataSet.records.forEach((record) => {
            record.set('status', 'update');
          });
        },
        update: ({ name, record, value }) => handleUpdate(record, name, value),
        select: () => handleSelect(),
        unSelect: () => handleSelect(),
        selectAll: () => handleSelect(),
        unSelectAll: () => handleSelect(),
      },
    });
  }, []);
  const tableDs = useMemo(() => new DataSet(choseInvoicePoolDs()), []);
  const newDS = useMemo(() => new DataSet(newDs()), []);

  useEffect(() => {
    fetchPermissions();
    taxDS.setQueryParameter('settleHeaderId', settleHeaderId);
    taxDS.invoiceMatch = invoiceMatch;
    newDS.enableCheckFlag = enableCheckFlag;
    taxDS.query();
  }, []);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.add`,
        `${permPrefix}.ocrread`,
        `${permPrefix}.excel`,
        `srm.settle-account.jsd.purchase.ps.newexcel`,
        `${permPrefix}.checkpool`,
        `${permPrefix}.ofd`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  };

  const handleSelect = () => {
    setSelect(taxDS.selected.map((item) => item.toData()));
  };

  const handleUpdate = (record, name, value) => {
    if (['taxIncludedAmount', 'taxAmount', 'netAmount'].includes(name)) {
      record.set(name, math.toFixed(value, Number(amountPer)));
    }
    if (name === 'invoiceSpecies') {
      const data = taxDS.getField('invoiceSpecies').getLookupData();
      record.set('deductFlag', Number(data.tag));
    }
    if (name === 'netAmount' || name === 'taxAmount') {
      record.set(
        'taxIncludedAmount',
        math.toFixed(math.plus(record.get('netAmount'), record.get('taxAmount')), Number(amountPer))
      );
    }
  };

  const linkToDetail = (record) => {
    const { invoiceHeaderId } = record.toData();
    Modal.open({
      drawer: true,
      key: 'poolModalDetail',
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-third-modal'],
      title: intl.get('ssta.purchaseSettle.view.message.invoicepoolDeatail').d('发票详情'),
      children: <InvoicePoolDetailModal record={record} invoiceHeaderId={invoiceHeaderId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  /**
   * 关闭或打开OCR
   */
  const handleModalVisible = (value, newBtnType = 'OCR') => {
    if (picturesWallRef?.uploadChild) {
      picturesWallRef.uploadChild.setState({
        fileList: [],
      });
    }

    if (value) {
      setVisible(value);
      setOcrLoadings(false);
      setBtnType(newBtnType);
    } else {
      setVisible(value);
      if (picturesWallRef) {
        picturesWallRef.setState({
          fileList: [],
        });
      }
    }
  };
  // 关闭Modal
  const hideModal = () => {
    setPicVisible(false);
  };

  const updateDetail = (record) => {
    newDS.loadData([record.toData()]);
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      destroyOnClose: true,
      className: Styles['ssta-small-modal'],
      title: intl.get('hzero.common.button.edit').d('编辑'),
      children: customizeForm(
        { code: 'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD' },
        <Form dataSet={newDS} labelLayout="float">
          <Select name="invoiceSpecies" />
          <TextField name="invoiceCode" />
          <TextField name="invoiceNumber" />
          <DatePicker name="invoicingDate" />

          <NumberField
            name="netAmount"
            renderer={({ value, record: currentRecord }) => {
              return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                repair: true,
                check: true,
              });
            }}
          />
          <NumberField
            name="taxAmount"
            renderer={({ value, record: currentRecord }) => {
              return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
                repair: true,
                check: true,
              });
            }}
          />
          <Lov name="companyNameLov" />
          <Lov name="supplierCompanyNameLov" />
          <TextField name="checkCode" id="codecheck" />
        </Form>
      ),
      onOk: async () => {
        const validateFlag = await newDS.validate();

        if (validateFlag) {
          const data = newDS.current?.toData();
          const res = await newTax(settleHeaderId, data, { source: 'pur' });
          if (!res) return;
          if (res?.failed) {
            notification.error({
              message: res.message,
            });
            return false;
          } else {
            notification.success();
            await handleLoadHeader(res);
            taxDS.query();
          }
        } else {
          notification.error({
            message: intl.get('ssta.common.view.message.noPass').d('必输校验不通过'),
          });
          return false;
        }
      },
    });
  };

  const openModal = (record) => {
    if (record.get('ocrFileUrl')) {
      return (
        <a onClick={() => showModal(record)}>{intl.get('hzero.common.button.view').d('查看')}</a>
      );
    } else {
      return '';
    }
  };
  // 显示Madal
  const showModal = (record) => {
    const tenantId = getCurrentOrganizationId();
    const fileUrl = record.get('ocrFileUrl');
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') {
      handlePreviewFile(fileUrl);
    } else {
      setOcrFileUrl(
        getAttachmentUrl(record.toData().ocrFileUrl, bucketName, tenantId, bucketDirectory)
      );
      setPicVisible(true);
    }
  };
  const handlePreviewFile = (fileUrl) => {
    const url = isTenantRoleLevel()
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`
      : `${HZERO_FILE}/v1/file-preview/by-url`;
    window.open(
      `${url}?url=${encodeURIComponent(
        fileUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`
    );
  };

  const columns = [
    {
      width: 80,
      name: 'lineNum',
    },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      name: 'detailed',
      width: 120,
      renderer: ({ record }) => {
        return (
          <PermissionDropdown
            dataSource={[
              {
                type: 'edit',
                title: intl.get('hzero.common.button.edit').d('编辑'),
                onClick: () => updateDetail(record),
                show:
                  (record.get('validateStatus') === 'UNCHECK' ||
                    record.get('validateStatus') === 'FAILED') &&
                  !isEditPub &&
                  (invoiceMatch === 'OFFLINE_INVOICE' || invoiceMatch === 'DIRECT_INVOICING') &&
                  updateFlag &&
                  record.get('sourceCode') !== 'EC',
              },
              {
                type: 'view',
                title: intl.get('hzero.common.button.view').d('查看'),
                onClick: () => handleViewDetail(record),
                show: Number(record.get('existsLineFlag')) === 1,
              },
              {
                type: 'operation',
                title: intl.get('hzero.common.button.operation').d('操作记录'),
                onClick: () => openHistory(record),
                show: documentType === 'INVOICE',
              },
            ]}
          />
        );
      },
    },
    {
      width: 150,
      name: 'invoiceCode',
    },
    {
      width: 150,
      name: 'invoiceNumber',
    },
    {
      width: 150,
      name: 'invoicingDate',
    },
    {
      width: 150,
      name: 'netAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'taxAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'taxIncludedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'invoiceSpeciesMeaning',
    },
    {
      width: 150,
      name: 'deductFlag',
      renderer: ({ value }) => yesOrNoRender(Number(value)),
    },
    {
      width: 150,
      name: 'checkCode',
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'supUnifiedSocialCode',
      width: 180,
    },
    {
      width: 150,
      name: 'validateStatusMeaning',
    },
    {
      width: 150,
      name: 'validateMessage',
    },
    {
      width: 150,
      name: 'taxInvoiceStatusMeaning',
    },
    {
      name: 'purUnifiedSocialCode',
      width: 190,
    },
    {
      width: 180,
      name: 'invoiceUrl',
    },
    {
      name: 'seeocr',
      width: 150,
      renderer: ({ record }) => {
        return record.get('ocrFileUrl') && openModal(record);
      },
    },
  ];
  const poolColumns = [
    {
      name: 'invoiceTypeMeaning',
      width: 180,
    },
    {
      name: 'invoiceCode',
      width: 220,
    },
    {
      name: 'invoiceNum',
      width: 220,
    },
    {
      name: 'invoicingDate',
      width: 180,
    },
    {
      name: 'netAmount',
      width: 180,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'taxAmount',
      width: 180,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      width: 180,
    },

    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'operation',
      width: 150,
      renderer: ({ record }) => {
        const oprCom = {
          detail: {
            opr: (
              <a onClick={() => linkToDetail(record)} style={{ marginRight: '5px' }}>
                {intl.get('ssta.invoiceSheet.view.button.detailview').d('查看详情')}
              </a>
            ),
            more: (
              <Menu.Item key="linkToDetail">
                {intl.get('ssta.invoiceSheet.view.button.detailview').d('查看详情')}
              </Menu.Item>
            ),
          },
        };
        const oprList = [];
        oprList.push('detail');
        const outCom = oprCom[oprList[0]].opr;

        return <>{outCom}</>;
      },
    },
  ];

  // 自定义行内 新建
  const handleAdd = () => {
    newDS.loadData([{}]);
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      destroyOnClose: true,
      title: intl.get('ssta.invoiceSheet.view.button.viewCreates').d('新增'),
      className: Styles['ssta-small-modal'],
      children: customizeForm(
        { code: 'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD' },
        <Form dataSet={newDS} labelLayout="float">
          <Select name="invoiceSpecies" />
          <TextField name="invoiceCode" />
          <TextField name="invoiceNumber" />
          <DatePicker name="invoicingDate" />

          <NumberField
            name="netAmount"
            renderer={({ value, record }) => {
              return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                repair: true,
                check: true,
              });
            }}
          />
          <NumberField
            name="taxAmount"
            renderer={({ value, record }) => {
              return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                repair: true,
                check: true,
              });
            }}
          />
          <Lov name="companyNameLov" />
          <Lov name="supplierCompanyNameLov" />
          <TextField name="checkCode" />
        </Form>
      ),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      onOk: async () => {
        if (!newDS.current) {
          notification.error({
            message: intl
              .get(`ssta.invoiceSheet.view.button.noAddMsgOrValidateFail`)
              .d('未维护必输字段或字段校验不通过'),
          });
          return false;
        }
        const validateFlag = await newDS.validate();

        if (validateFlag) {
          const data = newDS.current?.toData();
          const res = await newTax(settleHeaderId, data, { source: 'pur' });
          if (!res) return;
          if (res?.failed) {
            notification.error({
              message: res.message,
            });
            return false;
          } else {
            notification.success();
            handleLoadHeader(res);
            taxDS.query();
          }
        } else {
          notification.error({
            message: intl
              .get(`ssta.invoiceSheet.view.button.noAddMsgOrValidateFail`)
              .d('未维护必输字段或字段校验不通过'),
          });
          return false;
        }
      },
    });
  };

  // 选择发票池
  const choseInvoicePool = () => {
    tableDs.setQueryParameter('settleHeaderId', settleHeaderId);
    tableDs.setQueryParameter('settleNum', settleNum);
    tableDs.setQueryParameter('belongCompanyId', companyId);
    tableDs.setQueryParameter('belongSupplierCompanyId', supplierCompanyId);
    const OkBtn = observer(({ ds }) => (
      <Button color="primary" onClick={chosePool} disabled={ds.selected.length === 0}>
        {intl.get('hzero.common.button.confirm').d('确认')}
      </Button>
    ));
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.invoiceSheet.view.button.choseThePool').d('选择发票池'),
      className: Styles['ssta-large-second-modal'],
      children: (
        <>
          <SearchBar
            expandable={false}
            closeFilterSelector
            dataSet={[tableDs]}
            searchCode="SSTA.PURCHASE_SETTLE_DETAIL.INV_TAX_POOL"
          />
          <Table columns={poolColumns} dataSet={tableDs} queryBar="none" />
        </>
      ),
      footer: (_, cancelBtn) => [<OkBtn ds={tableDs} />, cancelBtn],
    });
    tableDs.query();
  };
  // 发票查验
  const handleCheck = () => {
    setcheckLoading(true);
    taxInvoiceCheck(select).then((res) => {
      if (!getResponse(res)) return;
      if (JSON.stringify(res.errorMessageMap) === '{}') {
        taxDS.query();
        notification.success();
        handleLoadHeader(res);
        setcheckLoading(false);
        setSelect([]);
      } else {
        const { errorMessageMap } = res;
        const errorMsg = [];
        // eslint-disable-next-line
        for (const i in errorMessageMap) {
          errorMsg.push(errorMessageMap[i].desc);
        }

        taxDS.query();
        notification.error({
          message: errorMsg.join(''),
        });
        handleLoadHeader(res);
        setcheckLoading(false);
        setSelect([]);
      }
    });
  };

  const handleExcle = () => {
    modal.close();

    history.push({
      pathname: `/ssta/purchase-settle/data-import/SSTA.TAX_INVOICE_HEADER`,
      search: querystring.stringify({
        backPath: `/ssta/purchase-settle/detail${location.search}`,
        action: intl.get('ssta.invoiceSheet.view.button.excelIn').d('Excel导入'),
        historyButton: false,
        args: JSON.stringify({
          templateCode: 'SSTA.TAX_INVOICE_HEADER',
          settleHeaderId,
        }),
      }),
    });
  };

  const chosePool = () => {
    purChosePool(
      settleHeaderId,
      tableDs.selected.map((item) => item.toData())
    ).then((res) => {
      if (res) {
        if (res?.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          tableDs.query();
          taxDS.query();
          handleLoadHeader(res);
          notification.success();
        }
      }
    });
  };

  const handleLoadHeader = (res) => {
    if (!res) return;
    headerDS.current.set({
      objectVersionNumber: res.objectVersionNumber,
      invoiceNetAmount: res.invoiceNetAmount,
      invoiceTaxAmount: res.invoiceTaxAmount,
      invoiceTaxIncludedAmount: res.invoiceTaxIncludedAmount,
      invoiceDifferenceAmount: res.invoiceDifferenceAmount,
    });
  };
  /**
   * 获取电商随货发票信息
   */
  const handleGain = async () => {
    await invoiceInformation(settleHeaderId)
      .then((res) => {
        if (res) {
          if (res?.failed) {
            notification.error({
              message: res.message,
            });
          } else {
            notification.success();
            taxDS.query();
            handleLoadHeader(res);
          }
        }
      })
      .catch((err) => {
        notification.error({
          message: err.message,
        });
      });
  };
  const toDelete = async () => {
    const data = taxDS.selected.map((item) => item.toData());
    deleteLine(data).then((res) => {
      if (getResponse(res)) {
        notification.success();
        handleLoadHeader(res);
        taxDS.query();
      }
    });
  };

  const buttons = [
    (props.settleStatus === 'INVOICE_EXCEPTION' ||
      (invoiceMatch === 'OFFLINE_INVOICE' && updateFlag)) && (
      <Dropdown
        overlay={
          <Menu>
            {permsMap.get(`${permPrefix}.add`) && (
              <Menu.Item onClick={handleAdd} name="create">
                {intl.get('hzero.common.button.handleadd').d('手工新建')}
              </Menu.Item>
            )}
            {invoiceMatch === 'OFFLINE_INVOICE' && permsMap.get(`${permPrefix}.ocrread`) && (
              <Menu.Item onClick={() => handleModalVisible(true)} name="ocr">
                {intl.get('hzero.common.button.addocr').d('OCR识别')}
              </Menu.Item>
            )}
            {invoiceMatch === 'OFFLINE_INVOICE' && permsMap.get(`${permPrefix}.ofd`) && (
              <Menu.Item onClick={() => handleModalVisible(true, 'OFD')} name="ofd">
                {intl.get('ssta.common.view.button.ofdAnalysis').d('OFD解析')}
              </Menu.Item>
            )}
            {invoiceMatch === 'OFFLINE_INVOICE' &&
              (permsMap.get(`${permPrefix}.excel`) || !notPub) && (
                <Menu.Item onClick={handleExcle} name="import">
                  {intl.get('hzero.common.button.addExcel').d('Excel导入')}
                </Menu.Item>
              )}

            {invoiceMatch === 'OFFLINE_INVOICE' &&
              (permsMap.get(`srm.settle-account.jsd.purchase.ps.newexcel`) || !notPub) && (
                <Menu.Item name="newImport">
                  <CommonImport
                    businessObjectTemplateCode="SSTA.TAX_INVOICE_HEADER"
                    prefixPatch="/ssta"
                    buttonText={intl
                      .get('ssta.common.view.button.newExcelImport')
                      .d('(新)Excel导入')}
                    successCallBack={async () => {
                      taxDS.query();
                      const newHeaderData = getResponse(
                        await getSettleHeaderDetail({ documentType, settleHeaderId })
                      );
                      if (!newHeaderData) return;
                      handleLoadHeader(newHeaderData);
                    }}
                    buttonProps={{
                      funcType: 'link',
                      icon: '',
                    }}
                    args={{
                      templateCode: 'SSTA.TAX_INVOICE_HEADER',
                      settleHeaderId,
                    }}
                  />
                </Menu.Item>
              )}
            {invoiceMatch === 'OFFLINE_INVOICE' && permsMap.get(`${permPrefix}.checkpool`) && (
              <Menu.Item onClick={choseInvoicePool} name="choseInvoicePoll">
                {intl.get('hzero.common.button.chosePool').d('选择发票池')}
              </Menu.Item>
            )}
          </Menu>
        }
      >
        <Button icon="playlist_add" funcType="flat" color="primary" name="new">
          {intl.get('hzero.common.button.add').d('新增')}
          <Icon type="expand_more" />
        </Button>
      </Dropdown>
    ),
    (props.settleStatus === 'INVOICE_EXCEPTION' ||
      (invoiceMatch === 'OFFLINE_INVOICE' && updateFlag)) && (
      <Button name="delete" onClick={toDelete} icon="delete" disabled={isEmpty(taxDS.selected)}>
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ),
    invoiceMethod === '2' && invoiceMatch === 'OFFLINE_INVOICE' && (
      <Button icon="feed" onClick={handleGain} name="gainEcInfo">
        {intl.get('hzero.common.button.invoiceInforImation').d('获取电商随货发票信息')}
      </Button>
    ),
    // 功能编辑、审批、工作流审批手动查验
    taxInvoiceCheckFlagger({
      notPub,
      updateFlag,
      approveFlag,
      headerInfo: {
        documentType,
        settleStatus,
        checkPointCode,
        enableCheckFlag,
      },
    }) && (
      <Button
        onClick={handleCheck}
        disabled={!select[0]}
        loading={checkLoading}
        name="invoiceCheck"
      >
        <Icon type="receipt" />
        {intl.get('hzero.common.button.addCheck').d('发票查验')}
      </Button>
    ),
  ];
  const handleSaveLoading = async () => {
    if (
      // 功能编辑自动查验
      taxInvoiceCheckFlagger({
        notPub,
        updateFlag,
        autoFlag: true,
        headerInfo: {
          documentType,
          autoCheckFlag,
          checkPointCode,
          enableCheckFlag,
        },
      })
    ) {
      const res = getResponse(await invoiceCheck(settleHeaderId, 'AUTO'));
      if (!res) return;
      taxDS.query();
      const { errorMessageMap } = res;
      if (JSON.stringify(errorMessageMap) !== '{}') {
        const errorMsg = Object.values(errorMessageMap)
          .map((item) => item?.desc)
          .join('\n');
        notification.error({ message: errorMsg });
        return;
      }
    }
    if (enableAfterInvoiceCheckFlag === 1 && updateFlag && documentType === 'INVOICE') {
      const res = getResponse(await taxValidate(settleHeaderId));
      if (!res) return;
    }
    notification.success();
    modal.close();
  };

  const setOcrLoading = (value) => {
    setOcrLoadings(value);
  };

  /**
   * OCR上传
   */

  const handleUpload = async () => {
    setOcrLoadings(true);
    setOcrCheckLoading(true);
    if (picturesWallRef && picturesWallRef.uploadChild) {
      const { fileList } = picturesWallRef.uploadChild.state;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`ssta.invoiceSheet.verify.uploadPictureIsNull`).d('上传照片为空'),
        });
        setOcrLoadings(false);
        setOcrCheckLoading(false);
      } else {
        const list = fileList.map((n) => n.response);
        let res = {};
        if (btnType === 'OCR') {
          res = await OCRCheckSettle(settleHeaderId, list);
        } else {
          res = await OFDCheckSettle(settleHeaderId, list);
        }
        if (getResponse(res)) {
          const { errorMessageMap } = res;
          if (isNil(errorMessageMap) || JSON.stringify(errorMessageMap) === '{}') {
            notification.success();
            taxDS.query();
            handleLoadHeader(res);
            handleModalVisible(false);
          } else {
            const errorMsg = [];
            // eslint-disable-next-line
            for (let item in errorMessageMap) {
              errorMsg.push(`${item}:${errorMessageMap[item].desc}`);
            }
            notification.error({
              message: errorMsg.join(','),
              duration: 10,
            });
            taxDS.query();
            handleLoadHeader(res);
          }
          const lists = errorMessageMap ? Object.keys(errorMessageMap) : [];
          if (!isEmpty(res)) {
            const fileNameList = fileList.map((n) => n.name);
            const successFileNameList = fileNameList.filter(
              (fileName) => !lists.includes(fileName)
            );
            const newFileList = fileList.filter((_) => lists.findIndex((v) => v === _.name) > -1);
            picturesWallRef.uploadChild.setState({
              fileList: newFileList,
            });
            picturesWallRef.setState((prevState) => ({
              successFileNameList: prevState.successFileNameList.concat(successFileNameList),
              fileList: newFileList,
            }));
          } else {
            picturesWallRef.setState({
              fileList: [],
            });
            handleModalVisible(false);
          }
          setOcrLoadings(false);
          setOcrCheckLoading(false);
        } else {
          setOcrLoadings(false);
          setOcrCheckLoading(false);
        }
        // });
      }
    }
  };

  const attachmentModalProps = {
    visible,
    bodyStyle: { height: '400px', overflow: 'auto' },
    onCancel: () => handleModalVisible(false),
    width: 570,
    title: [
      <>
        <span>
          {' '}
          {btnType === 'OCR'
            ? intl
                .get('ssta.invoiceSheet.verify.newMultipleUpload')
                .d('支持jpg/jpeg/png/bmp/pdf格式，建议单个附件不超过3M,可批量上传')
            : intl.get('ssta.common.view.title.OFDUpload').d('OFD文件上传')}{' '}
        </span>
        {btnType === 'OCR' && (
          <Tooltip
            title={intl
              .get('ssta.invoiceSheet.view.message.identifiableTypes.etc')
              .d(
                '可识别的发票种类：增值税专用发票、增值税电子专用发票、货运运输业增值税专用发票、机动车销售统一发票、增值税普通发票、增值税普通发票（电子）、增值税普通发票（卷式）'
              )}
          >
            <Icon type="help_outline" style={{ color: '#50B183' }} />
          </Tooltip>
        )}
      </>,
    ],
    footer: [
      <Button key="back" onClick={() => handleModalVisible(false)}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      <Button
        key="submit"
        color="primary"
        onClick={handleUpload}
        loading={ocrLoading || ocrCheckLoading}
      >
        {btnType === 'OCR'
          ? intl.get(`ssta.invoiceSheet.button.invoiceBill.ocrDistings`).d('OCR识别')
          : intl.get(`ssta.common.view.button.ofdAnalysis`).d('OFD解析')}
      </Button>,
    ],
  };
  const handleViewDetail = (record) => {
    const taxInvoiveHeaderId = record.get('taxInvoiceHeaderId');
    Modal.open({
      drawer: true,
      key: 'taxModalDetail',
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-second-modal'],
      title: intl.get('ssta.purchaseSettle.view.message.detail').d('明细'),
      children: (
        <TaxDetailModal
          record={record}
          settleHeaderId={settleHeaderId}
          taxInvoiveHeaderId={taxInvoiveHeaderId}
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  const openHistory = (record) => {
    const recordModal = Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: <Record taxInvoiceHeaderId={record.get('taxInvoiceHeaderId')} />,
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
          {/* <div className="flowSheet">
            <Icon type="branch" />
            {intl.get('ssta.costSheet.model.costSheet.flowSheet').d('流程图')}
          </div> */}
        </div>
      ),
    });
  };
  const picturesWall = {
    onRef: (ref) => {
      picturesWallRef = ref;
    },
    setOcrLoading,
  };

  return (
    <Fragment>
      <Spin spinning={checkLoading}>
        <DynamicAlert
          type="error"
          requestUrl={`${SRM_SSTA}/v1/${organizationId}/settle-headers/invoice-check-announcement`}
        />
        {customizeTable(
          { code: 'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE' },
          <Table
            columns={columns}
            dataSet={taxDS}
            buttons={buttons}
            selectionMode={
              updateFlag ||
              approveFlag ||
              (!notPub &&
                invoiceMatch === 'OFFLINE_INVOICE' &&
                readOnlyFlag &&
                enableCheckFlag === 1 &&
                (checkPointCode === 'CONFIRM' || checkPointCode === 'BOTH'))
                ? 'rowbox'
                : 'none'
            }
          />
        )}
        {invoiceMatch === 'OFFLINE_INVOICE' && updateFlag && (
          <div className="ssta-body-footer">
            <Button
              onClick={handleSaveLoading}
              color="primary"
              // disabled={taxDS.records.length === 0}
            >
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>
            <Button onClick={modal.close}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        )}
        {visible && (
          <OrcModal {...attachmentModalProps}>
            <Spins spinning={ocrCheckLoading}>
              <PicturesWall {...picturesWall} />
            </Spins>
          </OrcModal>
        )}
      </Spin>
      {picVisible && (
        <OrcModal visible={picVisible} onCancel={hideModal} footer={null} width="770px">
          <img alt="" width="95%" src={ocrFileUrl} />
        </OrcModal>
      )}
    </Fragment>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE',
      'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD',
      'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD',
    ],
  }),
  observer
)(TaxModal);
