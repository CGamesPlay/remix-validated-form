import { useMemo } from "react";
import {} from "../internal/getInputProps";
import {
  useInternalFormContext,
  useClearError,
  useSetTouched,
  useDefaultValuesForForm,
  useFieldErrorsForForm,
  useInternalIsSubmitting,
  useInternalHasBeenSubmitted,
  useTouchedFields,
  useInternalIsValid,
  useFieldErrors,
  useValidateField,
  useValidate,
  useSetFieldErrors,
  useResetFormElement,
  useSyncedDefaultValues,
  useFormActionProp,
  useFormSubactionProp,
} from "../internal/hooks";
import { FieldErrors, TouchedFields } from "../validation/types";

export type FormState = {
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
  touchedFields: TouchedFields;
  defaultValues: { [fieldName: string]: any };
  action?: string;
  subaction?: string;
  isValid: boolean;
};

/**
 * Returns information about the form.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useFormState = (formId?: string): FormState => {
  const formContext = useInternalFormContext(formId, "useFormState");
  const isSubmitting = useInternalIsSubmitting(formContext.formId);
  const hasBeenSubmitted = useInternalHasBeenSubmitted(formContext.formId);
  const touchedFields = useTouchedFields(formContext.formId);
  const isValid = useInternalIsValid(formContext.formId);
  const action = useFormActionProp(formContext.formId);
  const subaction = useFormSubactionProp(formContext.formId);

  const syncedDefaultValues = useSyncedDefaultValues(formContext.formId);
  const defaultValuesToUse = useDefaultValuesForForm(formContext);
  const hydratedDefaultValues =
    defaultValuesToUse.hydrateTo(syncedDefaultValues);

  const fieldErrorsFromState = useFieldErrors(formContext.formId);
  const fieldErrorsToUse = useFieldErrorsForForm(formContext);
  const hydratedFieldErrors = fieldErrorsToUse.hydrateTo(fieldErrorsFromState);

  return useMemo(
    () => ({
      action,
      subaction,
      defaultValues: hydratedDefaultValues,
      fieldErrors: hydratedFieldErrors ?? {},
      hasBeenSubmitted,
      isSubmitting,
      touchedFields,
      isValid,
    }),
    [
      action,
      hasBeenSubmitted,
      hydratedDefaultValues,
      hydratedFieldErrors,
      isSubmitting,
      isValid,
      subaction,
      touchedFields,
    ]
  );
};

export type FormHelpers = {
  /**
   * Clear the error of the specified field.
   */
  clearError: (fieldName: string) => void;
  /**
   * Validate the specified field.
   */
  validateField: (fieldName: string) => Promise<string | null>;
  /**
   * Change the touched state of the specified field.
   */
  setTouched: (fieldName: string, touched: boolean) => void;
  /**
   * Validate the whole form and populate any errors.
   */
  validate: () => Promise<void>;
  /**
   * Clears all errors on the form.
   */
  clearAllErrors: () => void;
  /**
   * Resets the form.
   *
   * _Note_: The equivalent behavior can be achieved by calling formElement.reset()
   * or clicking a button element with `type="reset"`.
   */
  reset: () => void;
};

/**
 * Returns helpers that can be used to update the form state.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useFormHelpers = (formId?: string): FormHelpers => {
  const formContext = useInternalFormContext(formId, "useFormHelpers");
  const setTouched = useSetTouched(formContext);
  const validateField = useValidateField(formContext.formId);
  const validate = useValidate(formContext.formId);
  const clearError = useClearError(formContext);
  const setFieldErrors = useSetFieldErrors(formContext.formId);
  const reset = useResetFormElement(formContext.formId);
  return useMemo(
    () => ({
      setTouched,
      validateField,
      clearError,
      validate,
      clearAllErrors: () => setFieldErrors({}),
      reset,
    }),
    [clearError, reset, setFieldErrors, setTouched, validate, validateField]
  );
};
