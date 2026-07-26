import { AuthLayout } from "@/components/auth/auth-layout";
import { InvitationAcceptanceView } from "@/components/auth/invitation-acceptance-view";

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthLayout>
      <InvitationAcceptanceView token={token} />
    </AuthLayout>
  );
}
