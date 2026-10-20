import React, { Fragment, useState, useEffect } from 'react';
import { Icon, Spin } from 'choerodon-ui/pro';
import qs from 'qs';

import { Header, Content } from 'components/Page';
import { Button } from 'components/Permission';
import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

// import OverflowTip from '@/routes/components/OverflowTip';
import Info from '@/routes/product/SkuCreate/Info';
import SkuImage from './SkuImage';
import SkuInfo from './SkuInfo';
import ReferenceInfo from './ReferenceInfo';
import SkuDesc from './SkuDesc';
import { openTextArea } from '../SkuWorkbench/drawers';
import { approveOrReject } from '../SkuApprove/api';
import { fetchProduct, fetchProductNew, fetchSkus } from './api';
import styles from './index.less';

// const Tips = () => {
//   const [closed, setClosed] = useState(false);
//   return (
//     !closed && (
//       <div className={styles['sku-preview-tips']}>
//         <div className="tips-left">
//           <Icon type="help" />
//           <OverflowTip className="tips-text">
//             {intl
//               .get('smpc.product.view.title.skuPreview.tips')
//               .d(
//                 '预览界面仅作为该商品在商城大致展示效果，部分字段因商品未上架而无法准确获取，将会使用虚拟值代替'
//               )}
//           </OverflowTip>
//         </div>
//         <Icon type="close" onClick={() => setClosed(true)} />
//       </div>
//     )
//   );
// };

function SkuPreview(props) {
  const {
    req,
    sourceFrom,
    tabKey,
    productId,
    skuTemporaryId,
    backPath,
    btnFlag,
    approveType,
    closePath,
  } = qs.parse(props.location.search.substr(1));
  const [data, setData] = useState({});
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [shiftVersion, setShiftVersion] = useState(false); // 临时表切换正式表数据
  const isReceive = req === 'receive';

  useEffect(() => {
    setLoading(true);
    const api = req === 'new' ? fetchProductNew : fetchProduct;
    getSkus();
    api({ sourceFrom, productId, skuTemporaryId })
      .then((result) => {
        const res = getResponse(result);
        if (res) {
          if (Object.keys(res).length === 0) {
            notification.warning({
              message: intl.get('smpc.product.view.product.notExit').d('商品不存在'),
            });
            return false;
          }
          setShiftVersion(res.previewType === 'TEMP');
          setData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId, skuTemporaryId, req]);

  async function getSkus() {
    const res = getResponse(await fetchSkus({ productId }));
    if (res) {
      setSkuList(res);
    }
  }

  // 审批
  function handleBatchApprove(type) {
    const approveFn = async (params, suffix) => {
      setBtnLoading(true);
      const result = getResponse(
        await approveOrReject({ skuApproveDTOS: [{ ...data, skuTemporaryId }], ...params }, suffix)
      );
      setBtnLoading(false);
      if (result) {
        notification.success();
        if (backPath || closePath) {
          props.history.push(backPath || closePath);
        }
      }
    };

    if (type === 'pass') {
      return approveFn(
        {
          approvalFlag: 2,
        },
        'approve'
      );
    } else if (type === 'reject') {
      openTextArea({
        title: intl.get('smpc.workbench.view.approveReject').d('审批拒绝'),
        name: 'remark',
        label: intl.get('smpc.product.view.rejectReason').d('拒绝原因'),
        maxLength: 100,
        onOk: (param) => approveFn({ approvalFlag: 0, ...param }, 'reject'),
      });
    } else {
      return approveFn(
        {
          approvalFlag: 1,
        },
        'approve-and-shelf'
      );
    }
  }
  // 版本切换
  function shiftToOldVersion() {
    props.history.push({
      pathname: '/smpc/sku-preview',
      search: qs.stringify(
        filterNullValueObject({
          productId,
          sourceFrom,
          tabKey,
          btnFlag: 'n',
          req: '',
        })
      ),
    });
  }

  const { skuAttrList, skuAttrExtendList, skuSalesInfos } = data;
  const attrList = [...(skuAttrList || []), ...(skuAttrExtendList || [])];
  const priceInfo = skuSalesInfos?.[0] || {};

  return (
    <Fragment>
      <Header title={intl.get('srm.common.view.skuPreview').d('商品预览')} backPath={backPath}>
        {btnFlag === 'y' && (
          <Fragment>
            <Button
              type="c7n-pro"
              color="primary"
              icon="check_circle"
              loading={btnLoading}
              permissionList={[
                {
                  code: 'smpc.sku-workbench-pur.detail.button.approve',
                  type: 'button',
                  meaning: '商品详情-审批',
                },
              ]}
              onClick={() => handleBatchApprove('pass')}
            >
              {intl.get('smpc.product.model.approve.pass').d('审批通过')}
            </Button>
            {approveType !== 'INVALID' && (
              <Button
                type="c7n-pro"
                icon="open_in_browser"
                funcType="flat"
                loading={btnLoading}
                permissionList={[
                  {
                    code: 'smpc.sku-workbench-pur.detail.button.approve',
                    type: 'button',
                    meaning: '商品详情-审批',
                  },
                ]}
                onClick={() => handleBatchApprove('passShelf')}
              >
                {intl.get('smpc.product.model.approve.passShelf').d('审批通过并上架')}
              </Button>
            )}
            <Button
              type="c7n-pro"
              icon="cancel"
              funcType="flat"
              permissionList={[
                {
                  code: 'smpc.sku-workbench-pur.detail.button.approve',
                  type: 'button',
                  meaning: '商品详情-审批',
                },
              ]}
              onClick={() => handleBatchApprove('reject')}
            >
              {intl.get('smpc.product.model.approve.reject').d('审批拒绝')}
            </Button>
          </Fragment>
        )}
      </Header>
      {!isReceive && shiftVersion && (
        <Info
          icon="help"
          className={styles['shift-alert-info']}
          message={
            <>
              {intl
                .get('smpc.product.view.info.shiftOldVersion')
                .d('当前打开审批中或审批拒绝的版本，若要打开原版本，请点击进行切换')}
              <a className="shift-area" onClick={shiftToOldVersion}>
                <Icon type="swap_horiz" />
                <span>{intl.get('smpc.product.view.info.shift').d('切换')}</span>
              </a>
            </>
          }
        />
      )}
      <Content className={styles['sku-preview-container']}>
        <Spin spinning={loading}>
          {/* <Tips /> */}
          <div className="sku-preview-wrapper">
            <div className="sku-base-info">
              <div className="left-info">
                <SkuImage
                  skuImageList={data?.skuImageList}
                  initMediaId={data?.mediaId}
                  initMediaPath={data?.mediaPath}
                  initLargeImagePath={data?.largeImagePath}
                />
                <SkuInfo
                  data={data}
                  isReceive={isReceive}
                  priceInfo={priceInfo}
                  skuList={skuList}
                />
              </div>
              <div className="right-info">
                <ReferenceInfo
                  data={data}
                  isReceive={isReceive}
                  attrList={attrList}
                  priceInfo={priceInfo}
                  tabKey={tabKey}
                />
              </div>
            </div>
            <SkuDesc attrList={attrList} introduction={data?.introduction} />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
}

export default formatterCollections({ code: ['smpc.product', 'srm.common'] })(SkuPreview);
