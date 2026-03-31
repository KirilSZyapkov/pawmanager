"use client";

import { useForm } from "react-hook-form";
import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import type {RegisterClientPublicInput} from "@/lib/validators/client";

export default function ClientRegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const mutation = trpc.client.registerClientPublic.useMutation({
    onSuccess: () => {
      router.push(`/b/${slug}/login`);
    },
  });

  const { register, handleSubmit } = useForm<RegisterClientPublicInput>();

  return (
    <form
      onSubmit={handleSubmit((data) =>
        mutation.mutate(1{
          ...data,
          businessSlug: slug,
        })
      )}
      className="max-w-md mx-auto p-6 space-y-4"
    >
      <input {...register("name")} placeholder="Име" />
      <input {...register("phone")} placeholder="Телефон" />
      <input {...register("email")} placeholder="Имейл" />
      <input
        type="password"
        {...register("password")}
        placeholder="Парола"
      />

      <button type="submit">
        Регистрация
      </button>
    </form>
  )
}