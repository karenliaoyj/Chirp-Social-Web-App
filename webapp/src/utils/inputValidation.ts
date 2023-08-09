import * as yup from "yup";

export interface ValidationRule<Data, ErrorState> {
  inputKey: keyof Data;
  errorKey: keyof ErrorState;
  schema: yup.Schema<any>;
}

export interface ValidationResult<ErrorState> {
  isValid: boolean;
  errorList: Partial<{ [key in keyof ErrorState]: string }>;
}

export async function validateFields<Data, ErrorState>(
  keys: (keyof Data)[],
  data: Data,
  validationRules: ValidationRule<Data, ErrorState>[]
): Promise<ValidationResult<ErrorState>> {
  const result: ValidationResult<ErrorState> = {
    isValid: true,
    errorList: {},
  };
  for (const key of keys) {
    const value = data[key];

    const availableRules = validationRules.filter(
      (rule) => rule.inputKey === key
    );
    for (const rule of availableRules) {
      await rule.schema.validate(value).catch((vaildationError) => {
        result.isValid = false;
        result.errorList[rule.errorKey] = vaildationError.message as string;
      });
    }
  }
  return result;
}
