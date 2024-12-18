export function MaskPhone(v) {
  v = v.replace(/\D/g, '');
  if (v.length > 11) {
    v = v.substr(0, 11);
  }
  if (v.length === 11) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else {
    v = v.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return v;
}

export function MaskCnpj(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length > 14) {
    cnpj = cnpj.substr(0, 14);
  }
  cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

  return cnpj;
}

export function MaskCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length > 11) {
    cpf = cpf.substr(0, 11);
  }
  cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return cpf;
}
