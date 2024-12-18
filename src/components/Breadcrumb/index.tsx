import { useState, useEffect, useContext } from 'react';
import i18n from '../../i18n';
import { useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { apiCall } from '../../providers';

import {
  StyledLink,
  Separator,
  Wrapper,
} from './styles';
import { Seta } from '~/icons';
import MenuContext from '~/contexts/menuContext';
import { TimezoneWarn } from '../TimezoneWarn';

const t = i18n.t.bind(i18n);

const unusedItems = [
  'maquina',
  'dam',
  'ambiente',
  'informacoes',
  'indice-de-uso',
  'saude',
  'historico',
  'tempo-real',
];

const formattedValues: { [k: string]: string } = {
  analise: t('analise'),
  unidades: t('unidades'),
  editar: t('editar'),
  notificacoes: t('notificacoes'),
  gerenciamento: t('gerenciamento'),
  'adicionar-notificacao': t('adicionarNotificacoes'),
  'editar-notificacao': t('editarNotificacao'),
  usuarios: t('usuarios'),
  'adicionar-usuario': t('adicionarUsuario'),
  configuracoes: t('configuracoes'),
  'alterar-senha': t('alterarSenha'),
  'editar-informacoes': t('editarInformacoes'),
  integrated: t('analiseIntegrada'),
  energyEfficiency: t('eficienciaEnergetica'),
};

function splitUrl(url: string) {
  return url.split('/').filter((item) => !!item);
}

export const Breadcrumb = (): JSX.Element => {
  const { t: t2 } = useTranslation();
  const match = useRouteMatch<{ unitId: string, notifId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [path, setPath] = useState([] as string[]);
  const [timezoneInfo, setTimezoneInfo] = useState({
    timezoneArea: undefined as undefined | string,
    timezoneGmt: undefined as undefined | number,
    unitId: null as null | number,
  });
  const realPath = splitUrl(match.url);
  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open
  const isDesktop = window.matchMedia('(min-width: 768px)');
  useEffect(() => {
    initializeBreadCrump();
  }, []);

  const initializeBreadCrump = async () => {
    const newPath = splitUrl(match.url);

    if (match.params.unitId) {
      try {
        if (match.params.unitId) {
          const result = await apiCall('/clients/get-unit-info', { unitId: Number(match.params.unitId) });
          setTimezoneInfo({ timezoneArea: result.TIMEZONE_AREA, timezoneGmt: result.TIMEZONE_OFFSET, unitId: result.UNIT_ID });
          if (result.UNIT_NAME) {
            const unitIdIndex = newPath.findIndex((item) => item === match.params.unitId);
            newPath.splice(unitIdIndex, 1, result.UNIT_NAME);
          }
        }
      } catch (err) {
        console.log(err);
        toast.error(t2('erroDadosUnidades'));
      }
    } else if (match.params.notifId) {
      newPath.splice(-1, 1);
    }

    setPath(newPath);
    setIsLoading(false);
  };

  if (isLoading) return <></>;

  const items: JSX.Element[] = [];

  for (let index = 0; index < path.length; index++) {
    const item = path[index];

    if (unusedItems.includes(item)) continue;

    let linkPath = `/${realPath.slice(0, index + 1).join('/')}`;

    if (index === (path.length - 2) && match.url.endsWith('/informacoes')) linkPath += '/informacoes';
    if (index === (path.length - 2) && match.url.endsWith('/gerenciamento')) linkPath += '/gerenciamento';
    else if (item.includes('notificacoes')) linkPath += '/gerenciamento';
    if (item.includes('integrated') || item.includes('energyEfficiency')) {
      continue;
    }

    if (index !== 0 && index !== path.length - 1) items.push(<Separator key={`sep:${linkPath}`}><div className="seta">{'>'}</div></Separator>);

    items.push(<StyledLink key={linkPath} to={linkPath}>{t2(`${formattedValues[item] || item}`)}</StyledLink>);
  }
  return (
    <Wrapper isDesktop={isDesktop.matches} MenuOpen={menuToogle}>
      {items}
      {
        (timezoneInfo.timezoneArea && timezoneInfo.timezoneGmt !== undefined && timezoneInfo.unitId && timezoneInfo.timezoneGmt !== -3) && (
          <TimezoneWarn area={timezoneInfo.timezoneArea} gmt={timezoneInfo.timezoneGmt} unitId={timezoneInfo.unitId} />
        )
      }
    </Wrapper>
  );
};

export function isGraterThan20(item, isMobile) {
  if (item.length > 20 && isMobile) {
    return `${item.slice(0, 20)}...`;
  }
  return item;
}

export const Breadcrumb3 = (props: { items: { text: string, link: string|null }[], timezoneArea?: string, timezoneGmt?: number, unitId?: number }): JSX.Element => {
  const { items } = props;
  const { menuToogle } = useContext(MenuContext);// true = open, false = not Open
  const isDesktop = window.matchMedia('(min-width: 765px)');
  if ((!items) || (!items.length)) return <></>;
  const parts: JSX.Element[] = [];
  for (let index = 0; index < items.length; index++) {
    const linkPath = items[index].link;
    const itemText = items[index].text;
    const isLast = (index === (items.length - 1));
    const isMobile = !isDesktop.matches;
    if (linkPath) {
      parts.push(
        <StyledLink key={`lnk:${linkPath || itemText}`} to={linkPath}>
          {isGraterThan20(itemText, isMobile)}
          {isLast ? '' : <Seta />}
        </StyledLink>,
      );
    } else {
      parts.push(
        <Separator key={`lnk:${index}`}>
          {isGraterThan20(itemText, isMobile)}
          <Seta />
        </Separator>,
      );
    }
  }

  return (
    <Wrapper isDesktop={isDesktop.matches} MenuOpen={menuToogle}>
      {parts}
      {
        (props.timezoneArea && props.unitId && props.timezoneGmt !== undefined && props.timezoneGmt !== -3) && (
          <TimezoneWarn area={props.timezoneArea} gmt={props.timezoneGmt} unitId={props.unitId} />
        )
      }
    </Wrapper>
  );
};
