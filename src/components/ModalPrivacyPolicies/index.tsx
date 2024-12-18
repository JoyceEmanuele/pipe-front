import { Button } from '../index';
import { StyledModalPrivacyPolicies, ModalPrivacyPoliciesActionButtons, ModalPrivacyPoliciesHeader } from './styles';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface ModalPrivacyPoliceProps {
  handleCloseModal: () => void
}

export const ModalPrivacyPolicies: React.FC<ModalPrivacyPoliceProps> = ({ handleCloseModal }) => {
  const aboutLink = 'https://dielenergia.com/politica-de-privacidade.html';

  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  return (
    <StyledModalPrivacyPolicies onClickOutside={handleCloseModal}>
      <ModalPrivacyPoliciesHeader>
        <h1>{t('politicaPrivacidade')}</h1>
        <a href={aboutLink}>{t('sobre')}</a>
      </ModalPrivacyPoliciesHeader>
      <div>
        <p>
          {t('politicaPrivacidadeTexto')}
        </p>
      </div>
      <ModalPrivacyPoliciesActionButtons>
        <a onClick={handleCloseModal}>
          {t('cancelar')}
        </a>
        <Button variant="primary" onClick={handleCloseModal}>
          {t('aceitar')}
        </Button>
      </ModalPrivacyPoliciesActionButtons>
    </StyledModalPrivacyPolicies>
  ); };
