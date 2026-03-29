"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerBusinessSchema } from "@/lib/validators/business";
import { trpc } from "@/lib/trpc/client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {signIn} from "next-auth/react";

type FormValues = z.infer<typeof registerBusinessSchema>;

export default function RegisterBusinessForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      city: "",
    }
  });

  const registerMutation = trpc.auth.registerNewBusibess.useMutation({
    onSuccess: async (_, variables) => {
      const result = await signIn("credentials",{
        redirect: false,
        email: variables.email,
        password: variables.password,
        role: "owner"
      });

      if (result?.error){
        setServerError("Регистрацията е успешна, но входът се провали.");
        return;
      };
      router.push("/dashboard");
    },
    onError: (error) => {
      // if (error.data?.zodError?.fieldErrors) {
      //   const fieldErrors = error.data.zodError.fieldErrors;

      //   Object.entries(fieldErrors).forEach(([field, messages]) => {
      //     if (!messages.length) return;

      //     form.setError(field as keyof FormValues, {
      //       type: "server",
      //       message: messages[0]
      //     })
      //   });

      //   return;
      // };
      setServerError(error.message ?? "Something went wrong.");
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    registerMutation.mutate(values);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4 bg-background p-6 rounded-xl shadow"
    >
      <h1 className="text-2xl font-semibold text-center">
        Регистрация на бизнес
      </h1>

      {/* GLOBAL ERROR */}
      {serverError && (
        <div className="rounded-md bg-red-50 text-red-600 p-3 text-sm">
          {serverError}
        </div>
      )}

      <Field
        placeholder="Име на бизнеса"
        error={errors.businessName?.message}
        {...register("businessName")}
      />

      <Field
        placeholder="Име на собственик"
        error={errors.ownerName?.message}
        {...register("ownerName")}
      />

      <Field
        placeholder="Email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Field
        placeholder="Телефон"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Field
        type="password"
        placeholder="Парола"
        error={errors.password?.message}
        {...register("password")}
      />

      <Field
        placeholder="Адрес"
        error={errors.address?.message}
        {...register("address")}
      />

      <Field
        placeholder="Град"
        error={errors.city?.message}
        {...register("city")}
      />

      <button
        type="submit"
        disabled={isSubmitting || registerMutation.isPending}
        className="w-full h-10 rounded-md bg-primary text-white disabled:opacity-50"
      >
        {registerMutation.isPending
          ? "Създаване..."
          : "Създай бизнес"}
      </button>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: string };

function Field({ error, ...props }: FieldProps) {
  return (
    <div className="space-y-1">
      <input
        {...props}
        className="w-full h-10 rounded-md border px-3 text-sm"
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}