import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { errorMessageProps } from "../../api/errorMessage";
import { SERVICE_REQUEST_PRIORITIES } from "../../api/types";
import { Button, ButtonLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import { FormField } from "../../components/FormField";
import form from "../../components/form.module.css";
import { PageHeader } from "../../components/PageHeader";
import {
  CREATE_REQUEST_FIELDS,
  DESCRIPTION_MAX_LENGTH,
  createRequestSchema,
  type CreateRequestFormValues,
} from "./createRequestSchema";
import { PRIORITY_LABELS } from "./labels";
import { useCreateRequest } from "./queries";
import styles from "./CreateRequestPage.module.css";

const EMPTY_FORM: CreateRequestFormValues = {
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM",
  requesterName: "",
  requesterEmail: "",
};

export function CreateRequestPage() {
  const navigate = useNavigate();
  const createRequest = useCreateRequest();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    control,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: EMPTY_FORM,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const description = useWatch({ control, name: "description" });

  const onSubmit = handleSubmit((values) => {
    createRequest.mutate(values, {
      onSuccess: (created) => {
        navigate(`/requests/${created.id}`, { state: { created: true } });
      },
      onError: (error) => {
        if (!error.isValidationError) return;
        const fields = CREATE_REQUEST_FIELDS.filter(
          (field) => error.fieldErrors[field]?.length,
        );
        for (const field of fields) {
          setError(field, {
            type: "server",
            message: error.fieldErrors[field][0],
          });
        }
        if (fields.length > 0) setFocus(fields[0]);
      },
    });
  });

  const errorCount = Object.keys(errors).length;
  const apiError = createRequest.error;
  const apiErrorOnFields =
    apiError?.isValidationError &&
    CREATE_REQUEST_FIELDS.some((field) => apiError.fieldErrors[field]?.length);
  const isSaving = isSubmitting || createRequest.isPending;

  return (
    <div className={styles.page}>
      <Link to="/requests" className={styles.backLink}>
        ← Back to requests
      </Link>
      <PageHeader
        title="New service request"
        subtitle="All fields are required."
      />

      {isSubmitted && errorCount > 0 && (
        <div className={styles.message}>
          <ErrorMessage
            title={`Please fix ${errorCount} ${errorCount === 1 ? "field" : "fields"} below.`}
          />
        </div>
      )}
      {apiError && !apiErrorOnFields && (
        <div className={styles.message}>
          <ErrorMessage {...errorMessageProps(apiError)} />
        </div>
      )}

      <Card className={styles.card}>
        <form className={styles.grid} onSubmit={onSubmit} noValidate>
          <FormField
            label="Title"
            error={errors.title?.message}
            className={styles.full}
          >
            {(field) => (
              <input {...field} {...register("title")} className={form.input} />
            )}
          </FormField>

          <FormField
            label="Description"
            error={errors.description?.message}
            className={styles.full}
            footer={
              <p
                className={`${form.counter} ${description.length > DESCRIPTION_MAX_LENGTH ? form.counterOver : ""}`}
              >
                {description.length} / {DESCRIPTION_MAX_LENGTH}
              </p>
            }
          >
            {(field) => (
              <textarea
                {...field}
                {...register("description")}
                className={form.textarea}
                rows={4}
              />
            )}
          </FormField>

          <FormField
            label="Category"
            error={errors.category?.message}
            help="e.g. Access, Billing, Network, Outage"
          >
            {(field) => (
              <input
                {...field}
                {...register("category")}
                className={form.input}
              />
            )}
          </FormField>

          <FormField label="Priority" error={errors.priority?.message}>
            {(field) => (
              <select
                {...field}
                {...register("priority")}
                className={form.select}
              >
                {SERVICE_REQUEST_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField
            label="Requester name"
            error={errors.requesterName?.message}
          >
            {(field) => (
              <input
                {...field}
                {...register("requesterName")}
                className={form.input}
                autoComplete="off"
              />
            )}
          </FormField>

          <FormField
            label="Requester email"
            error={errors.requesterEmail?.message}
          >
            {(field) => (
              <input
                {...field}
                {...register("requesterEmail")}
                className={form.input}
                type="email"
                inputMode="email"
                autoComplete="off"
              />
            )}
          </FormField>

          <div className={`${styles.actions} ${styles.full}`}>
            <ButtonLink to="/requests">Cancel</ButtonLink>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Creating…" : "Create request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
