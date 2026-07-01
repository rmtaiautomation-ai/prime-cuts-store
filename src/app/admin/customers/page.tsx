import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAdminCustomers } from "@/app/actions/admin";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const result = await getAdminCustomers();
  const profiles = result.success ? result.customers : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-1">View your registered customers and their lifetime activity.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg overflow-hidden pb-32">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone / Email</TableHead>
              <TableHead>Shipping Address</TableHead>
              <TableHead className="text-right">Total Orders</TableHead>
              <TableHead className="text-right">Lifetime Spend</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles && profiles.length > 0 ? (
              profiles.map((profile: any) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || "Guest / Unnamed"}</TableCell>
                  <TableCell>
                    <div className="text-sm">{profile.phone || "No Phone"}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={profile.shipping_address || ""}>{profile.shipping_address || "N/A"}</TableCell>
                  <TableCell className="text-right font-bold">{profile.totalOrders}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-bold">₱{Number(profile.lifetimeSpend).toLocaleString()}</TableCell>
                  <TableCell>
                    {profile.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Customer</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
