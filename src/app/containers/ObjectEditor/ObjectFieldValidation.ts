import { XsdPrimitiveType } from '../../../sosi/xsd';
import { FeatureNode } from 'app/model/FeatureMember';
import Input from '../HomePage/Input';

export type FieldVerificationResponse = {
  valid: boolean;
  errorMsg?: string;
};

export const verifyFieldInput = (
  node: FeatureNode,
  input: string,
  withPlausibility: boolean,
): FieldVerificationResponse => {
  if (input == '' || input == undefined)
    return verifyPlausibility(node, input, withPlausibility);

  switch (node.validationType as XsdPrimitiveType) {
    case XsdPrimitiveType.string:
      return verifyPlausibility(node, input, withPlausibility);

    case XsdPrimitiveType.integer: {
      if (input.includes('.') || input.includes(',')) {
        return {
          valid: false,
          errorMsg: 'Desimal er ikke tillat',
        };
      }
      const parsed = Number.parseInt(input[input.length - 1]);
      if (Number.isInteger(parsed))
        return verifyPlausibility(node, input, withPlausibility);
      else return { valid: false };
    }

    case XsdPrimitiveType.double: {
      /// RegEx with 1 decimal allowed
      if (input != undefined && input.match(/^(\d+)?([.]?\d{0,100})?$/)) {
        return verifyPlausibility(node, input, withPlausibility);
      } else {
        return { valid: false };
      }
    }
    default:
      return verifyPlausibility(node, input, withPlausibility);
  }
};

function verifyPlausibility(
  node: FeatureNode,
  input: string,
  withPlausibility: boolean,
): FieldVerificationResponse {
  if (
    node.plausibilityValidation == undefined ||
    withPlausibility == false ||
    ((input == undefined || input.trim() == '') &&
      (node.xsdElement?.minOccurs ?? 0) < 1)
  )
    return { valid: true };

  let parsed;

  if (node.validationType == XsdPrimitiveType.integer) {
    parsed = Number.parseInt(input);
  } else {
    const postDecimalValue = input?.substring(input.indexOf('.') + 1);

    const preDecimalValue = input?.substring(0, input.indexOf('.'));

    if (Number.parseInt(postDecimalValue) > 0) {
      parsed = Number.parseInt(preDecimalValue) + 1;
    } else parsed = Number.parseInt(preDecimalValue);
  }

  if (parsed < node.plausibilityValidation.min) {
    return {
      valid: false,
      errorMsg:
        node.plausibilityValidation.min.toString() +
        ' er minste tillatte verdi',
    };
  }

  if (parsed > node.plausibilityValidation.max) {
    return {
      valid: false,
      errorMsg:
        node.plausibilityValidation.max.toString() +
        ' er største tillatte verdi',
    };
  }

  return { valid: true };
}
