import CommonImport, { useModal } from 'components/Import';

        const { openModal } = useModal();
<>
              <CommonImport refreshButton businessObjectTemplateCode="TEST-0830" />{' '}
              <a
                onClick={() => {
                  this.state.openModal({
                    businessObjectTemplateCategory: 'COMMON',
                    refreshButton: true,
                  });
                }}
              >
              </a>
              <CommonImport refreshButton templateCode="TEST-SHEET" prefixPatch="/hprt" />
            </>