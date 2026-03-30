
import { requireOwner } from "@/server/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	await requireOwner();

	return (
		<div className="min-h-screen flex">
			{children}
		</div>
	)
}