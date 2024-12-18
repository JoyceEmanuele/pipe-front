export interface FormFieldsValidator<S> {
  values: S
  touched: Record<keyof S, boolean>
  errors: Record<keyof S, string|null>
  handleChange: (name: keyof S, value: any) => void
  checkField: (name: keyof S) => void
  checkAll: () => boolean
  reset: () => void
}

/**
 * @param checkers Each property of this object is a function to check the validity of the corresponding property in the "values" object.
 * @param initialValues Initial values for the "values" object.
 * @returns The structure used to check the validity of the values and inform in case of error.
 */
export default function formFieldsValidator<S>(checkers: Partial<Record<keyof S, (v: any) => string|null>>, initialValues: S): FormFieldsValidator<S> {
  const formData = {
    values: initialValues || {} as S,
    touched: {} as Record<keyof S, boolean>,
    errors: {} as Record<keyof S, string|null>,
    checkers: checkers || {} as Record<keyof S, () => string>,

    handleChange(name: keyof S, value: any) {
      formData.values[name] = value;
      formData.touched[name] = true;
      if (formData.errors[name]) {
        return formData.checkField(name);
      }
    },

    checkField(name: keyof S) {
      const checker = formData.checkers[name];
      if (checker) {
        if (checker instanceof Function) {
          formData.errors[name] = checker(formData.values[name]);
        } else {
          try {
            // yup.object().shape({ [name]: checker }).validateSync({ [name]: formData.values[name] });
            (checker as any).validateSync(formData.values[name]);
            delete formData.errors[name];
          } catch (err: any) {
            formData.errors[name] = err.message;
          }
        }
      } else {
        delete formData.errors[name];
      }
    },

    checkAll() {
      for (const name of Object.keys(formData.checkers) as (keyof S)[]) {
        formData.checkField(name);
      }
      return !Object.values(formData.errors).filter((x) => !!x).length;
    },

    reset() {
      formData.touched = {} as Record<keyof S, boolean>;
      formData.errors = {} as Record<keyof S, string>;
    },
  };
  return formData;
}

export function requiredStringField(value: string): string|null {
  return ((!value) && 'campo obrigatório') || null;
}
