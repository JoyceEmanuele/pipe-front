import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ModalPrivacyPolicies, PolimorphicGradientBackground, ProgressBar } from '~/components';
import {
  BackgroundContainer,
  ComponentContainer,
  Container,
  CreditPowered,
  Footer,
  MainContentContainer,
  ProgressContainer,
  WelcomeText,
} from './styles';
import DielDarkLogo from '~/assets/img/logos/DielDarkLogo.svg';
import GooglePlayLogo from '~/assets/img/logos/GooglePlayLogo.svg';
import LogoDielPowered from '~/assets/img/logos/LogoDielPowered.svg';
import CelciusWhiteLogo from '~/assets/img/logos/CelciusWhiteLogo.svg';
import { useState } from 'react';
import { Login } from './Login';
import { ForgotPassword } from './ForgotPassword';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { CelciusLogo } from '~/icons';

const NewLogin: React.FC<RouteComponentProps> = ({ history }) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] = useState({
    progress: 0,
    isLoading: false,
  });

  const googlePlayUrl = 'https://play.google.com/store/search?q=diel%20energia&c=apps';

  const handleRedirectToGooglePlay = () => {
    window.open(googlePlayUrl, '_blank', 'noopener');
  };

  return (
    <PolimorphicGradientBackground>
      <Container>
        <BackgroundContainer>
          <WelcomeText>
            <p className="welcome">{t('bemVindoAo')}</p>
            <img src={CelciusWhiteLogo} alt="celcius white logo" />
          </WelcomeText>
          <CreditPowered>
            <span>Powered by</span>
            <img src={LogoDielPowered} alt="diel white logo" />
          </CreditPowered>
        </BackgroundContainer>
        <MainContentContainer>
          <ComponentContainer isLoading={loading.isLoading}>
            <img src={DielDarkLogo} alt="diel dark logo" />
            {isLogin ? (
              <Login
                history={history}
                setIsLogin={() => setIsLogin(false)}
                setIsLoading={() => setLoading({
                  progress: 100,
                  isLoading: true,
                })}
              />
            ) : (
              <ForgotPassword
                history={history}
                setIsLogin={() => setIsLogin(true)}
              />
            )}
            <Footer>
              <img src={GooglePlayLogo} alt="google play logo" onClick={handleRedirectToGooglePlay} />
              <span onClick={() => setModalOpen(true)}>
                {t('politicaPrivacidade')}
              </span>
              <p>
                © 2024
                {' '}
                <strong>{t('tituloPagDielEnergia')}</strong>
                {' '}
                {t('todosDireitos')}
              </p>
            </Footer>
          </ComponentContainer>
          <ProgressContainer isLoading={loading.isLoading}>
            <p>{t('preparandoInformacoes')}</p>
            <ProgressBar progress={loading.progress} />
          </ProgressContainer>
        </MainContentContainer>

        {modalOpen && (
        <ModalPrivacyPolicies handleCloseModal={() => setModalOpen(false)} />
        )}
      </Container>
    </PolimorphicGradientBackground>
  );
};

const NewLoginWrapper = withRouter(NewLogin);

export { NewLoginWrapper as NewLogin };
