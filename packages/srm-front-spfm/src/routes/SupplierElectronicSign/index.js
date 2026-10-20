/**
 * 供应商电子签章平台
 */
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import { PRIVATE_BUCKET } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import { DataSet, Spin, Button } from 'choerodon-ui/pro';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getParseUrlParam } from '@/utils/utils';
import {
  fetchCompanyList,
  fetchUserDocStatus,
  getFileList,
  // getFilePreview,
} from '@/services/supplierElecSignWorkplaceService';

import { ListDS } from './stores/supplierSignDS';
import LeftMenuPanel from './LeftMenuPanel';
import CompanyListPanel from './CompanyListPanel';

// import styles from './index.less';

let queryParamStr = '';

const SupplierElectronicSign = (props) => {
  const { listDS, history, location } = props;

  const { defaultItem = '', scrollH = 0 } =
    location && location.search ? getParseUrlParam(location.search) : {};

  const [selected, setSelectedCompany] = useState({});
  const [companyList, setCompanyList] = useState([]); // 公司列表
  const [loading, setLoading] = useState(false);
  const [isShowDoc, setIsShowDoc] = useState(false); // 是否展示用户手册
  const [attachUuid, setAttachUuid] = useState(''); // 附件uuid

  useEffect(() => {
    setLoading(true);
    fetchCompany({}, 'init');
    fetchUserDocStatus().then((res) => {
      if (getResponse(res)) {
        const { enableFlag, fileUuid } = res;
        if ([1, '1'].includes(enableFlag)) {
          setIsShowDoc(true);
          setAttachUuid(fileUuid);
        } else {
          setIsShowDoc(false);
          setAttachUuid('');
        }
      }
    });
    return () => {
      queryParamStr = '';
    };
  }, []);

  const handleRefreshList = (param) => {
    fetchCompany(param);
  };

  const fetchCompany = async (queryParam = {}, tag) => {
    queryParamStr = queryParam?.companyNum ?? '';
    const companyRes = await fetchCompanyList(queryParam ? { ...queryParam } : {});

    setLoading(false);

    if (getResponse(companyRes) && Array.isArray(companyRes)) {
      setCompanyList(companyRes);

      if (!queryParamStr && tag) {
        if (defaultItem && companyRes.length > 1) {
          const obj = companyRes.filter((item) => item.companyId === defaultItem);
          setSelectedCompany(obj.length ? { ...obj[0] } : { ...companyRes[0] });
        } else {
          setSelectedCompany({ ...companyRes[0] });
        }
      }
    }
  };

  /**
   * 从列表选择的公司
   * @param {*} company
   */
  const handleSelectCompany = (company = null) => {
    setSelectedCompany({ ...company });
  };

  /**
   * 查看用户手册
   */
  const handleShowDoc = () => {
    if (attachUuid) {
      getFileList({ uuid: attachUuid }).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length) {
          const fileObj = res[0];
          if (fileObj.fileUrl) {
            const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url`;
            window.open(
              `${url}?url=${
                fileObj.fileUrl
              }&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
            );
          }
        }
      });
    }
  };

  // 只有一家公司 且 未认证通过
  const companyOnlyAuth = companyList && companyList.length === 1 && !queryParamStr;

  const companyName = companyOnlyAuth && selected ? selected.companyName : '';

  const title =
    companyList && companyList.length === 1
      ? intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
          name: companyName || selected.companyName,
        })
      : intl
          .get('spfm.supplierElectronicSign.view.title.supplierPageSimpleTitle')
          .d('销售方电签管理工作台');

  return (
    <>
      <Spin spinning={loading}>
        <Header useDefaultTitle={false} title={title}>
          {isShowDoc ? (
            <Button onClick={handleShowDoc} icon="visibility-o" funcType="flat">
              {intl.get(`spfm.supplierElectronicSign.view.button.userManual`).d('用户手册')}
            </Button>
          ) : null}
        </Header>
        <div style={{ margin: '8px', display: 'flex' }}>
          {(companyList.length && !loading) || (!companyList.length && !!queryParamStr) ? (
            <>
              {!companyOnlyAuth ? (
                <LeftMenuPanel
                  companyList={companyList}
                  defaultSelected={selected}
                  scrollH={scrollH}
                  onRefreshList={handleRefreshList}
                  onSelectItem={handleSelectCompany}
                />
              ) : null}
              <CompanyListPanel
                listDS={listDS}
                history={history}
                companyData={selected}
                style={
                  companyOnlyAuth
                    ? null
                    : {
                        flex: 5,
                        marginLeft: '-1px',
                      }
                }
              />
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                width: '100%',
                height: 'calc(100vh - 156px)',
              }}
            >
              <div>
                <NoContent style={{ width: '136px', height: '96px' }} />
              </div>
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  color: '#101319',
                  fontSize: '14px',
                }}
              >
                {intl.get('spfm.buyerElectronicSign.view.message.noContent').d('暂无数据')}
              </div>
            </div>
          )}
        </div>
      </Spin>
    </>
  );
};

export default formatterCollections({
  code: [
    'spfm.supplierElectronicSign',
    'spfm.buyerElectronicSign',
    'spfm.sealmanage',
    'hiam.userInfo',
    'spfm.configServer',
    'spfm.certificateAuthority',
  ],
})(
  withProps(
    () => {
      const listDS = new DataSet({ ...ListDS() });

      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SupplierElectronicSign)
);
