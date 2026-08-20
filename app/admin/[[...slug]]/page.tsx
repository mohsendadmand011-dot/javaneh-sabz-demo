import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUserFromToken, SESSION_COOKIE } from "../../lib/auth";
import { JavanehApp } from "../../ui/JavanehApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const user = await getSessionUserFromToken(
    cookieStore.get(SESSION_COOKIE)?.value ?? null,
  );
  if (!user) redirect("/login?returnTo=/admin");
  if (user.role === "CUSTOMER") redirect("/account");
  return <JavanehApp />;
}
