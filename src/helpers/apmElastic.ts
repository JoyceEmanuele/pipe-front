export function apmElastic(rota: string) {
  const profileStringfim = localStorage.getItem('@diel:profile');
  let clientsfim = localStorage.getItem('clients');
  if (clientsfim === null) {
    clientsfim = 'nulo';
  }
  window.transaction = window.elasticApm.startTransaction(`route-${rota}`, 'route');
  let profile;
  if (profileStringfim) {
    if (profileStringfim !== '') {
      profile = JSON.parse(profileStringfim);
    }
    else profile = '';
  }

  window.elasticApm.addFilter((payload) => {
    if (payload.transactions) {
      payload.transactions.forEach((tr) => {
        if (tr.name.substring(0, 5) === 'Click') {
          tr.name = tr.context.page.url;
        }
        tr.context.user.id = profile?.user || '';
        tr.context.user.username = clientsfim;
        tr.type = 'route-diel';
        tr.spans.forEach((span) => {
          span.type = clientsfim;
          span.subtype = profile?.user || '';
        });
      });
    }
    return payload;
  });

  window.elasticApm.setUserContext({
    id: profile?.user || '',
    username: clientsfim || '',
  });
}
