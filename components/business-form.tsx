"use client";

import { type FormEvent, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { submitBusinessApplication } from "@/lib/api/client";
import { USE_MOCKS } from "@/lib/api/config";
import type { BusinessKind, Region } from "@/lib/types";

const MIN_PHONE_DIGITS = 8;
const KINDS: BusinessKind[] = ["tour_company", "hotel", "restaurant", "other"];

const SELECT =
  "h-12 w-full cursor-pointer appearance-none rounded-xl border border-input bg-card pr-12 pl-4 text-base transition-colors duration-150 focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground";

const SELECT_ARROW =
  "pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground";

interface FieldErrors {
  company?: string;
  contact?: string;
  phone?: string;
}

interface BusinessFormProps {
  regions: Region[];
}

export function BusinessForm({ regions }: BusinessFormProps) {
  const t = useTranslations("Business");

  const [company, setCompany] = useState("");
  const [kind, setKind] = useState<BusinessKind>("tour_company");
  const [region, setRegion] = useState(regions[0]?.slug ?? "");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const companyRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const submission = useMutation({ mutationFn: submitBusinessApplication });

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!company.trim()) next.company = t("companyError");
    if (!contact.trim()) next.contact = t("contactError");
    if (phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS) {
      next.phone = t("phoneError");
    }
    setErrors(next);
    if (next.company) companyRef.current?.focus();
    else if (next.contact) contactRef.current?.focus();
    else if (next.phone) phoneRef.current?.focus();
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    submission.mutate({
      company_name: company.trim(),
      kind,
      region,
      contact_name: contact.trim(),
      contact_phone: phone.trim(),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
  };

  if (submission.isSuccess) {
    return (
      <div role="status" className="rounded-2xl border p-6">
        <CircleCheck className="size-10 text-open" aria-hidden />
        <h2 className="mt-3 text-lg font-bold">{t("successTitle")}</h2>
        <p className="mt-1 text-pretty">
          {t("successBody", { company: company.trim(), phone: phone.trim() })}
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-6")}
        >
          {t("successAction")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border p-6 lg:p-6"
    >
      <div>
        <Label htmlFor="business-company" className="mb-2">
          {t("companyLabel")}
        </Label>
        <Input
          ref={companyRef}
          id="business-company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          autoComplete="organization"
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "business-company-error" : undefined}
        />
        {errors.company && (
          <p id="business-company-error" className="mt-2 text-sm text-destructive">
            {errors.company}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="business-kind" className="mb-2">
            {t("kindLabel")}
          </Label>
          <div className="relative">
            <select
              id="business-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as BusinessKind)}
              className={SELECT}
            >
              {KINDS.map((item) => (
                <option key={item} value={item}>
                  {t(`kinds.${item}`)}
                </option>
              ))}
            </select>
            <ChevronDown className={SELECT_ARROW} aria-hidden />
          </div>
        </div>
        <div>
          <Label htmlFor="business-region" className="mb-2">
            {t("regionLabel")}
          </Label>
          <div className="relative">
            <select
              id="business-region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className={SELECT}
            >
              {regions.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className={SELECT_ARROW} aria-hidden />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="business-contact" className="mb-2">
            {t("contactLabel")}
          </Label>
          <Input
            ref={contactRef}
            id="business-contact"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={errors.contact ? "business-contact-error" : undefined}
          />
          {errors.contact && (
            <p id="business-contact-error" className="mt-2 text-sm text-destructive">
              {errors.contact}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="business-phone" className="mb-2">
            {t("phoneLabel")}
          </Label>
          <Input
            ref={phoneRef}
            id="business-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "business-phone-error" : "business-phone-hint"}
          />
          {errors.phone ? (
            <p id="business-phone-error" className="mt-2 text-sm text-destructive">
              {errors.phone}
            </p>
          ) : (
            <p id="business-phone-hint" className="mt-2 text-sm text-muted-foreground">
              {t("phoneHint")}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="business-note" className="mb-2">
          {t("noteLabel")}
        </Label>
        <Textarea
          id="business-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {submission.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t("submitError")}
        </p>
      )}

      <Button type="submit" size="lg" loading={submission.isPending} className="w-full sm:w-auto">
        {submission.isPending ? t("submitting") : t("submit")}
      </Button>

      {USE_MOCKS && (
        <p className="text-sm text-muted-foreground">{t("demoHint")}</p>
      )}
    </form>
  );
}
