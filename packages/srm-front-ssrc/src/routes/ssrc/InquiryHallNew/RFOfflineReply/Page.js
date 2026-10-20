import React, {
  Fragment,
  useMemo,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { Spin, DataSet } from 'choerodon-ui/pro';
import classNames from 'classnames';

import { Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import { isEmpty, debounce } from 'lodash';
import notification from 'utils/notification';
import { SRM_SSRC } from '_utils/config';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import CommonImportNew from 'hzero-front/lib/components/Import';
import {
  saveOfflineSupplierReply,
  submitOfflineSupplierReply,
  submitValidateOfflineSupplierReply,
} from '@/services/rfService';
import { createC7nPagination, isText } from '@/utils/utils';
import { validateModal } from '@/routes/components/ConfirmModal';
import { queryEnableDoubleUnit } from '@/services/commonService';

import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';
import Store from './store/index';
import BasicInfo from './CardManage/BasicInfo';
import SupplierReply from './CardManage/SupplierReply';
import { supplierQuotationDS } from './store/storeDS';
import Style from './CardManage/index.less';

const Page = () => {
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(undefined); // 双单位标志
  const parentRef = useRef(null);
  const {
    history,
    organizationId,
    commonDs: { basicFormDs, supplierInfoDs, supplierReplyDs },
    routerParams: { rfHeaderId, sourceCategory },
    customizeBtnGroup,
  } = useContext(Store);
  const rightTableDsMap = useMemo(() => new Map(), []);

  let emptyQuotationDs = useMemo(
    () =>
      new DataSet(
        supplierQuotationDS({
          rfHeaderId,
          quotationHeaderId: '0',
          doubleUnitFlag,
        })
      ),
    [doubleUnitFlag]
  );

  useEffect(() => {
    queryDoubleUnit();
  }, []);

  const queryDoubleUnit = async () => {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
      } else {
        setDoubleUnitFlag(false);
      }
    });
  };

  useEffect(() => {
    if (doubleUnitFlag !== undefined) {
      basicFormDs.query().then((res) => {
        initFetchSupplier(undefined, res?.lineItemsFlag ? undefined : 10);
      });
    }
  }, [doubleUnitFlag]);

  // 线下回复查询
  const initFetchSupplier = useCallback(
    async (page = 0, size = 2) => {
      if (!isEmpty(pagination)) {
        const { pageSize } = pagination;
        if (pageSize !== size) {
          // eslint-disable-next-line no-param-reassign
          page = 0;
        }
      }
      supplierInfoDs.pageSize = size;
      supplierInfoDs.currentPage = page + 1;
      supplierReplyDs.pageSize = size;
      supplierReplyDs.currentPage = page + 1;
      supplierInfoDs.query(supplierInfoDs.currentPage);
      await supplierReplyDs.query(supplierReplyDs.currentPage).then((res) => {
        if (getResponse(res)) {
          setPagination(createC7nPagination(res));
          if (basicFormDs?.current?.get('lineItemsFlag')) {
            if (isEmpty(res.content)) {
              emptyQuotationDs = new DataSet(
                supplierQuotationDS({
                  rfHeaderId,
                  quotationHeaderId: '0',
                  doubleUnitFlag,
                  sourceCategory,
                })
              );
            } else {
              const promises = [];
              emptyQuotationDs = new DataSet(
                supplierQuotationDS({
                  rfHeaderId,
                  quotationHeaderId: '0',
                  doubleUnitFlag,
                  sourceCategory,
                })
              );
              res.content.forEach((item) => {
                rightTableDsMap.set(
                  item.quotationHeaderId,
                  new DataSet(
                    supplierQuotationDS({
                      rfHeaderId,
                      quotationHeaderId: item.quotationHeaderId,
                      doubleUnitFlag,
                      sourceCategory,
                    })
                  )
                );
                rightTableDsMap
                  .get(item.quotationHeaderId)
                  .setState('offlineReplyStatus', item.offlineReplyStatus);
                promises.push(rightTableDsMap.get(item.quotationHeaderId));
              });
              limitRequest(promises, 10);
            }
          }
          setDataSource([...res.content]);
        }
      });
    },
    [
      supplierInfoDs,
      supplierReplyDs,
      rightTableDsMap,
      setDataSource,
      setPagination,
      doubleUnitFlag,
      sourceCategory,
      basicFormDs?.current,
      pagination,
    ]
  );

  const limitRequest = (promises, maxNum) => {
    return new Promise((resolve) => {
      if (promises.length === 0) {
        resolve([]);
        return;
      }
      const results = [];
      let index = 0;
      let cnt = 0;
      async function request() {
        if (index === promises.length) return;
        const i = index;
        const promise = promises[i];
        index++;
        try {
          const response = await promise.query();
          results[i] = response;
        } catch (err) {
          results[i] = err;
        } finally {
          cnt++;
          if (cnt === promises.length) {
            resolve(results);
          }
          request();
        }
      }

      const times = Math.min(maxNum, promises.length);
      for (let i = 0; i < times; i++) {
        request();
      }
    });
  };

  // 数据校验
  const getValidate = useCallback(() => {
    const list = [];
    list.push(supplierInfoDs.validate());
    list.push(supplierReplyDs.validate());
    if (basicFormDs?.current?.get('lineItemsFlag')) {
      dataSource.forEach((item) => {
        list.push(rightTableDsMap.get(item.quotationHeaderId).validate());
      });
    }
    return Promise.all(list).then((res) => res.every((ele) => ele));
  }, [supplierInfoDs, supplierReplyDs, dataSource, pagination, basicFormDs?.current]);

  // 获取数据
  const getParams = () => {
    const params = {
      rfHeaderId,
      rfLineSupplierList: supplierInfoDs?.toData(),
      rfQuotationHeaderList: supplierReplyDs?.toData()?.map((item, index) => {
        return {
          ...item,
          supplierCompanyName: supplierInfoDs?.toData()?.[index]?.supplierCompanyName,
          rfQuotationLineList: basicFormDs?.current?.get('lineItemsFlag')
            ? rightTableDsMap.get(item.quotationHeaderId)?.toData()
            : [],
        };
      }),
      customizeUnitCode: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory},SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory},SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`,
    };
    return params;
  };

  // 保存
  const handleSave = debounce(async () => {
    setLoading(true);
    await getValidate();
    const params = getParams();
    const res = await saveOfflineSupplierReply(params);
    if (getResponse(res)) {
      notification.success();
      await initFetchSupplier(
        pagination?.page - 1 || 0,
        parentRef.current?.size || (basicFormDs?.current?.get('lineItemsFlag') ? 2 : 10)
      );
    }
    if (parentRef.current) {
      // eslint-disable-next-line no-unused-expressions
      parentRef.current?.handleTableScrollLeft(0);
    }
    setLoading(false);
  }, 500);

  // 提交
  const handleSubmit = debounce(async () => {
    if (isEmpty(dataSource)) {
      notification.warning({
        message: intl.get('ssrc.rf.view.rf.inputSubmitRfxUpdate').d('提交前请填写完整相关信息'),
      });
      return;
    }
    setLoading(true);
    const flag = await getValidate();
    if (!flag) {
      notification.warning({
        message: intl.get('ssrc.rf.view.rf.inputSubmitRfxUpdate').d('提交前请填写完整相关信息'),
      });
      setLoading(false);
      return;
    }
    const params = getParams();
    const response = getResponse(await submitValidateOfflineSupplierReply(params));
    if (response && response !== true) {
      const { validateResults = [] } = response || {};
      const description = validateResults?.map?.((i, index) => {
        return <div>{`${index + 1}、${i.message}`}</div>;
      });
      notification.error({
        message: intl.get('ssrc.common.view.title.errorInfo').d('提交失败，以下内容验证不通过'),
        description,
      });
      setLoading(false);
      return;
    }

    if (response === true) {
      const res = await submitOfflineSupplierReply(params);
      if (getResponse(res)) {
        validateModal({
          response: res,
          successCallBack: () => {
            notification.success();
            history.push('/ssrc/new-inquiry-hall/list');
          },
        });
      }
      setLoading(false);
      return;
    }
    setLoading(false);
  }, 500);

  // 导入成功回调
  const batchImportOk = () => {
    initFetchSupplier(undefined, basicFormDs?.current?.get('lineItemsFlag') ? 2 : 10);
  };

  // 按钮
  const getButtons = useMemo(() => {
    const importCode = basicFormDs?.current?.get('lineItemsFlag')
      ? 'SSRC.RF_OFFLINE_QUOTATION_IMPORT'
      : 'SSRC.RF_OFFLINE_QUOTATION_HEADER_IMPORT';
    const exportCode = basicFormDs?.current?.get('lineItemsFlag')
      ? 'SSRC.RF_OFFLINE_QUOTATION_EXPORT'
      : 'SSRC.RF_OFFLINE_QUOTATION_HEADER_EXPORT';
    return [
      {
        name: 'submit',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'check',
          loading,
          color: 'primary',
          onClick: handleSubmit,
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          loading,
          icon: 'save',
          funcType: 'flat',
          onClick: handleSave,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'excelImport',
        btnComp: CommonImportNew,
        btnProps: {
          name: 'excelInfoNew',
          businessObjectTemplateCode: importCode,
          prefixPatch: SRM_SSRC,
          args: {
            tenantId: organizationId,
            rfHeaderId,
            templateCode: importCode,
            fromExport: true,
          },
          otherButtonProps: {
            funcType: 'flat',
          },
          buttonProps: {
            permissionList: [
              {
                code: `srm.ssrc.source.manage.inquirer.new-inquiry-hall.button.${sourceCategory}.offline.import`.toLowerCase(),
                type: 'button',
                meaning: `${
                  intl.get('ssrc.common.view.new').d('新') +
                  intl.get('ssrc.rf.view.card.title.offlineReplyTitle').d('线下回复录入') -
                  intl.get(`ssrc.rf.view.message.button.importQuotation`).d('Excel导入')
                }`,
              },
            ],
            funcType: 'flat',
          },
          buttonText: intl.get(`ssrc.rf.view.message.button.importQuotation`).d('Excel导入'),
          auto: true,
          successCallBack: batchImportOk,
          modalProps: {
            title: intl.get('ssrc.rf.view.card.title.offlineReplyTitle').d('线下回复录入'),
          },
          customeImportTemplate: {
            templateCode: exportCode,
            requestUrl: `${SRM_SSRC}/v1/${organizationId}/rf/off-line/list/export`,
            queryParams: { rfHeaderId },
            queryArea: { fillerType: 'multi-sheet', async: false },
          },
        },
      },
      {
        // 新导出
        name: 'export',
        btnComp: ExcelExportNew,
        btnProps: {
          requestUrl: `${SRM_SSRC}/v1/${organizationId}/rf/off-line/list/export`,
          queryParams: {
            rfHeaderId,
          },
          templateCode: exportCode,
          buttonText: `${intl.get('hzero.common.export.new').d('(新)导出')}`,
          otherButtonProps: {
            permissionList: [
              {
                code: `srm.ssrc.source.manage.inquirer.new-inquiry-hall.button.${sourceCategory}.offline.export`.toLowerCase(),
                type: 'button',
                meaning: `${
                  intl.get('ssrc.rf.view.card.title.offlineReplyTitle').d('线下回复录入') -
                  intl.get(`ssrc.common.button.batchExport`).d('导出')
                }${intl.get('ssrc.common.view.new').d('新')}`,
              },
            ],
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
    ];
  }, [dataSource, loading, basicFormDs?.current]);

  const getBackPath = useMemo(() => {
    return `/ssrc/new-inquiry-hall/list?sourceCategory=${sourceCategory}`;
  }, [sourceCategory]);

  const supplierProps = useMemo(() => {
    return {
      parentRef,
      getParams,
      pagination,
      dataSource,
      rightTableDsMap,
      emptyQuotationDs,
      initFetchSupplier,
      doubleUnitFlag,
      setLoading,
    };
  }, [
    dataSource,
    rightTableDsMap,
    initFetchSupplier,
    pagination,
    getParams,
    emptyQuotationDs,
    doubleUnitFlag,
    setLoading,
  ]);

  // 渲染标题
  const Title = observer(({ ds }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('rfNum') ? `-${current?.get?.('rfNum')}` : '';
    return intl.get('ssrc.rf.view.card.title.offlineReplyTitle').d('线下回复录入') + title;
  });

  return (
    <Fragment>
      <div className={Style['offline-reply-page-wrapper']}>
        <Spin spinning={loading}>
          <div className={Style['offline-reply-page']}>
            <Header title={<Title ds={basicFormDs} />} backPath={getBackPath}>
              {customizeBtnGroup(
                {
                  code: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.HEADER_BUTTONS_${sourceCategory}`,
                  pro: true,
                },
                <DynamicButtons buttons={getButtons} />
              )}
            </Header>
            <div className={classNames('rf-page-content-warp', styles['rf-common-page-content'])}>
              <div className={styles['rf-card-content-wrapper']}>
                <Card
                  id="basicInfoCard"
                  title={intl.get('ssrc.rf.view.card.title.basicInfos').d('基本信息')}
                  component={<BasicInfo />}
                />
                <Card
                  id="supplierReplyCard"
                  title={intl.get('ssrc.rf.view.card.title.supliierReply').d('供应商回复')}
                  component={<SupplierReply {...supplierProps} />}
                />
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </Fragment>
  );
};

export default observer(Page);
